import type { SnapshotMatchStatus } from "./liveSnapshot";

const TEAM_NAME_ALIASES: Record<string, string> = {
  czechrepublic: "czechia",
  bosniaandherzegovina: "bosniaherzegovina",
  cotedivoire: "ivorycoast",
  capeverdeislands: "capeverde",
  democraticrepublicofthecongo: "drcongo",
  congodr: "drcongo",
  korearepublic: "southkorea",
};

export function normalizeTeamName(name: string): string {
  const norm = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return TEAM_NAME_ALIASES[norm] ?? norm;
}

export interface MinuteOrdered {
  minute?: number | null;
  stoppageTime?: number | null;
}

export interface ReconcilableGoalEvent extends MinuteOrdered {
  /** The scoreboard side credited with the goal, after own-goal normalization. */
  teamName?: string | null;
}

export type ReconciledGoals<T> = {
  /** Goal-scoring events safe to render as confirmed, in chronological order. */
  confirmedEvents: T[];
  /** True if either side has fewer confirmed events than its authoritative score. */
  scorerDetailsIncomplete: boolean;
  /** True if home-team confirmed events are fewer than homeScore. */
  homeScorerDetailsIncomplete: boolean;
  /** True if away-team confirmed events are fewer than awayScore. */
  awayScorerDetailsIncomplete: boolean;
  /** Events withheld because their side had already reached its authoritative score total. */
  withheldCount: number;
  /** Events whose scoring side could not be safely determined (withheld). */
  unresolvedCount: number;
};

/**
 * Single source of truth for reconciling goal-scoring events against the
 * authoritative (primary-provider) score. The primary score is never
 * overridden or inferred from secondary events: each side's confirmed event
 * count is capped at that side's authoritative score
 * (home <= homeScore, away <= awayScore), preserving chronological order.
 *
 * This prevents impossible renders such as an away goal appearing under a
 * 1-0 (home-leading) score just because it sorts earlier than a later home
 * goal — each side's cap is enforced independently, not a combined total.
 *
 * Events whose side can't be matched to either team name are withheld as
 * "unresolved" rather than guessed.
 */
export function reconcileGoalEvents<T extends ReconcilableGoalEvent>({
  homeScore,
  awayScore,
  homeTeamName,
  awayTeamName,
  events,
}: {
  homeScore: number | null;
  awayScore: number | null;
  homeTeamName: string;
  awayTeamName: string;
  events: T[];
}): ReconciledGoals<T> {
  if (homeScore === null || awayScore === null) {
    return {
      confirmedEvents: [],
      scorerDetailsIncomplete: false,
      homeScorerDetailsIncomplete: false,
      awayScorerDetailsIncomplete: false,
      withheldCount: 0,
      unresolvedCount: 0,
    };
  }

  const homeKey = normalizeTeamName(homeTeamName);
  const awayKey = normalizeTeamName(awayTeamName);

  // Stable sort by minute/stoppage time, preserving original order for ties.
  const sorted = events
    .map((event, index) => ({ event, index }))
    .sort((a, b) => {
      const minuteDiff = (a.event.minute ?? 999) - (b.event.minute ?? 999);
      if (minuteDiff !== 0) return minuteDiff;
      const stoppageDiff = (a.event.stoppageTime ?? 0) - (b.event.stoppageTime ?? 0);
      if (stoppageDiff !== 0) return stoppageDiff;
      return a.index - b.index;
    })
    .map(({ event }) => event);

  let acceptedHome = 0;
  let acceptedAway = 0;
  let withheldCount = 0;
  let unresolvedCount = 0;
  const confirmedEvents: T[] = [];

  for (const event of sorted) {
    const side = normalizeTeamName(event.teamName ?? "");
    if (side === homeKey) {
      if (acceptedHome < homeScore) {
        confirmedEvents.push(event);
        acceptedHome++;
      } else {
        withheldCount++;
      }
    } else if (side === awayKey) {
      if (acceptedAway < awayScore) {
        confirmedEvents.push(event);
        acceptedAway++;
      } else {
        withheldCount++;
      }
    } else {
      unresolvedCount++;
    }
  }

  const homeScorerDetailsIncomplete = acceptedHome < homeScore;
  const awayScorerDetailsIncomplete = acceptedAway < awayScore;

  return {
    confirmedEvents,
    scorerDetailsIncomplete: homeScorerDetailsIncomplete || awayScorerDetailsIncomplete,
    homeScorerDetailsIncomplete,
    awayScorerDetailsIncomplete,
    withheldCount,
    unresolvedCount,
  };
}

/**
 * True while a match should be polled for live updates: during LIVE/HALFTIME/
 * SYNCING statuses, or within 15 minutes of kickoff (before or after). Must be
 * evaluated against the current snapshot status and clock, not a one-time
 * initial value, so polling starts/stops as the match transitions.
 */
export function isMatchPollingActive(status: SnapshotMatchStatus, kickoffMs: number, now: number): boolean {
  if (status === "LIVE" || status === "HALFTIME" || status === "SYNCING") return true;
  return Math.abs(kickoffMs - now) <= 15 * 60 * 1000;
}

export const POST_MATCH_RECONCILIATION_WINDOW_MS = 4 * 60 * 60 * 1000;

export function isMatchInReconciliationWindow(
  status: string,
  kickoffMs: number,
  nowMs: number
): boolean {
  if (status !== "FINISHED") return true;
  return nowMs <= kickoffMs + POST_MATCH_RECONCILIATION_WINDOW_MS;
}
