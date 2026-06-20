import { after } from "next/server";
import { unstable_cache } from "./cacheAdapter";
import { fetchAllLiveData } from "./fetchAllLiveData";
import { computeGroupStandings, type StandingRow } from "./groupStandings";
import { MATCHES, matchSlug, matchUtcDate, type Match } from "./matches";
import { computeThirdPlaceRanking, type ThirdPlaceRow } from "./thirdPlaceRanking";
import {
  computeTeamLeaderboards,
  computeTopScorers,
  computeTournamentStats,
  type PlayerGoalStat,
  type TeamLeaderboards,
  type TournamentStats,
} from "./tournamentStats";
import type { LiveMatchData, LiveMatchEvent, LiveMatchStatus } from "./liveMatchData";
import { getGoalEventCompleteness, type GoalEventCompleteness } from "./goalEventCompleteness";
import {
  fetchWorldCup26Games,
  type GoalScorerEvent,
  type WorldCup26Game,
} from "./worldcup26Provider";
import { applyVerifiedGoalCorrections } from "./verifiedMatchEventCorrections";
import { countryName } from "./i18n";

export const LIVE_SNAPSHOT_CACHE_KEY = "worldcup-tournament-live-snapshot-v7";
export const LIVE_SNAPSHOT_REVALIDATE_SECONDS = 25;
// Provider Data-Cache revalidate. Kept short so that when the snapshot rebuilds
// during a live window the football-data / worldcup26 reads it consumes are fresh;
// revalidation is lazy, so during idle periods (snapshot cadence ~90s) providers
// are still only refetched at that slower cadence.
export const PROVIDER_REVALIDATE_SECONDS = 10;

export type SnapshotMatchStatus = "SCHEDULED" | "LIVE" | "HALFTIME" | "FINISHED" | "SYNCING";

export type SerializableSnapshotMatch = {
  match: Match;
  internalId: string;
  providerMatchId: number | null;
  status: SnapshotMatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  scorers: GoalScorerEvent[];
  goalEventCompleteness: GoalEventCompleteness;
  sourceUpdatedAt: string | null;
  providerUpdatedAt: string | null;
  live: LiveMatchData | null;
  /**
   * True only in the cold-start fallback snapshot, for a match whose kickoff has
   * passed: its result is genuinely unknown (live data not yet available), so it
   * must NOT be presented as SCHEDULED. The canonical `status` enum is left
   * untouched; consumers render an honest "live data unavailable" state when this
   * is set rather than inferring a status.
   */
  liveDataUnavailable?: boolean;
};

export type TournamentLiveSnapshot = {
  snapshotId: string;
  generatedAt: string;
  updatedAt: string;
  matches: Record<string, SerializableSnapshotMatch>;
  liveDataByProviderId: Record<string, LiveMatchData>;
  standingsByGroup: Record<string, StandingRow[]>;
  thirdPlaceRanking: ThirdPlaceRow[];
  tournamentStats: TournamentStats;
  teamLeaderboards: TeamLeaderboards;
  topScorers: PlayerGoalStat[];
  /** Diagnostics — internal freshness tracking, not provider-branded for public display. */
  primaryProviderOk: boolean;
  secondaryProviderOk: boolean;
  primaryProviderFetchedAt: string | null;
  secondaryProviderFetchedAt: string | null;
  /**
   * True when this is the cold-start fallback (no validated live snapshot yet):
   * the canonical schedule is shown but standings/Top Scorers are NOT authoritative
   * and live results are unavailable. Consumers surface an honest notice and must
   * not present fallback standings/rankings as final.
   */
  isFallback?: boolean;
};

type SnapshotProviderPayload = {
  liveData: ReadonlyMap<number, LiveMatchData>;
  worldcupGames: WorldCup26Game[] | null;
  generatedAt?: string;
  primaryProviderOk?: boolean;
  secondaryProviderOk?: boolean;
  primaryProviderFetchedAt?: string | null;
  secondaryProviderFetchedAt?: string | null;
  /** Skip secondary ESPN scorer enrichment (used for the instant cold-start fallback). */
  skipEnrichment?: boolean;
};

type SnapshotCacheOptions = {
  ttlMs: number;
  now?: () => number;
  build: () => Promise<TournamentLiveSnapshot>;
};

const TEAM_NAME_ALIASES: Record<string, string> = {
  czechrepublic: "czechia",
  bosniaandherzegovina: "bosniaherzegovina",
  cotedivoire: "ivorycoast",
  capeverdeislands: "capeverde",
  democraticrepublicofthecongo: "drcongo",
  congodr: "drcongo",
  korearepublic: "southkorea",
};

let lastKnownGoodSnapshot: TournamentLiveSnapshot | null = null;

export function normalizeTeamName(name: string): string {
  const norm = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return TEAM_NAME_ALIASES[norm] ?? norm;
}

function toSnapshotStatus(live: LiveMatchData | undefined): SnapshotMatchStatus {
  if (!live) return "SCHEDULED";
  if ((live.status === "IN_PLAY" || live.status === "PAUSED") && (live.homeScore === null || live.awayScore === null)) {
    return "SYNCING";
  }
  if (live.status === "IN_PLAY") return "LIVE";
  if (live.status === "PAUSED") return "HALFTIME";
  if (live.status === "FINISHED") return "FINISHED";
  return "SCHEDULED";
}

function toLiveMatchStatus(status: SnapshotMatchStatus, fallback: LiveMatchStatus | undefined): LiveMatchStatus {
  if (status === "FINISHED") return "FINISHED";
  if (status === "LIVE") return "IN_PLAY";
  if (status === "HALFTIME") return "PAUSED";
  if (status === "SYNCING") return fallback ?? "IN_PLAY";
  return fallback ?? "SCHEDULED";
}

export function canonicalStatus({
  footballData,
  worldcupGame,
}: {
  footballData?: LiveMatchData;
  worldcupGame?: WorldCup26Game | null;
}): SnapshotMatchStatus {
  const footballStatus = toSnapshotStatus(footballData);
  if (footballStatus === "FINISHED" || worldcupGame?.finished) return "FINISHED";
  if (footballStatus === "LIVE" || footballStatus === "HALFTIME" || footballStatus === "SYNCING") {
    return footballStatus;
  }
  return "SCHEDULED";
}

export function toLiveGoalEvent(event: GoalScorerEvent): LiveMatchEvent {
  return {
    type: event.isOwnGoal ? "OWN_GOAL" : event.isPenalty || event.type === "PENALTY_GOAL" ? "PENALTY_GOAL" : "GOAL",
    minute: event.minute,
    stoppageTime: event.stoppageTime,
    minuteLabel: event.minuteLabel,
    teamName: event.teamName,
    playerTeamName: event.playerTeamName,
    playerName: event.playerName,
    isOwnGoal: event.isOwnGoal,
  };
}

function liveGoalCompoundKey(event: LiveMatchEvent): string {
  return [
    "compound",
    normalizeTeamName(event.teamName ?? ""),
    event.minute ?? "",
    event.stoppageTime ?? "",
    event.type,
    (event.playerName ?? "pending").toLowerCase().trim(),
  ].join("|");
}

function mergeGoalEvents(primary: LiveMatchEvent[] | undefined, enrichment: GoalScorerEvent[]): LiveMatchEvent[] {
  const result: LiveMatchEvent[] = [];
  const seen = new Set<string>();
  for (const event of [...(primary ?? []), ...enrichment.map(toLiveGoalEvent)]) {
    const keys = [
      event.providerEventId ? `id:${event.providerEventId}` : null,
      liveGoalCompoundKey(event),
    ].filter((key): key is string => key !== null);
    if (keys.some((key) => seen.has(key))) continue;
    keys.forEach((key) => seen.add(key));
    result.push(event);
  }
  return result.sort((a, b) => (a.minute ?? 999) - (b.minute ?? 999) || (a.stoppageTime ?? 0) - (b.stoppageTime ?? 0));
}

function winnerFromScore(homeScore: number | null, awayScore: number | null): LiveMatchData["winner"] {
  if (homeScore === null || awayScore === null) return null;
  if (homeScore > awayScore) return "HOME_TEAM";
  if (awayScore > homeScore) return "AWAY_TEAM";
  return "DRAW";
}

function scorerKey(event: GoalScorerEvent): string {
  return [
    normalizeTeamName(event.teamName ?? ""),
    event.minute ?? "",
    event.playerName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim(),
  ].join("|");
}

export function dedupeScorers(events: GoalScorerEvent[]): GoalScorerEvent[] {
  const seen = new Set<string>();
  const result: GoalScorerEvent[] = [];
  for (const event of events) {
    const key = scorerKey(event);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(event);
  }
  return result.sort((a, b) => (a.minute ?? 999) - (b.minute ?? 999) || (a.stoppageTime ?? 0) - (b.stoppageTime ?? 0));
}

function worldcupGamesByInternalId(games: WorldCup26Game[] | null): Map<string, WorldCup26Game> {
  const result = new Map<string, WorldCup26Game>();
  if (!games) return result;

  for (const match of MATCHES) {
    const homeDisplay = countryName(match.homeKey, "en");
    const awayDisplay = countryName(match.awayKey, "en");
    const homeKey = normalizeTeamName(homeDisplay);
    const awayKey = normalizeTeamName(awayDisplay);

    const game = games.find((g) => {
      const gHome = normalizeTeamName(g.homeTeamName);
      const gAway = normalizeTeamName(g.awayTeamName);
      return gHome === homeKey && gAway === awayKey;
    });

    if (game) result.set(matchSlug(match), game);
  }

  return result;
}

function scorersFromWorldcupGame(match: Match, game: WorldCup26Game | undefined): GoalScorerEvent[] {
  if (!game) return [];
  const internalId = matchSlug(match);
  const homeDisplay = countryName(match.homeKey, "en");
  const awayDisplay = countryName(match.awayKey, "en");
  return applyVerifiedGoalCorrections(internalId, dedupeScorers([
    ...game.homeScorers.map((event) => ({ ...event, teamName: homeDisplay })),
    ...game.awayScorers.map((event) => ({ ...event, teamName: awayDisplay })),
  ]));
}

function withCanonicalMatchState({
  match,
  live,
  worldcupGame,
  scorers,
  generatedAt,
}: {
  match: Match;
  live: LiveMatchData | undefined;
  worldcupGame: WorldCup26Game | undefined;
  scorers: GoalScorerEvent[];
  generatedAt: string;
}): LiveMatchData | null {
  const providerId = match.providerIds?.footballData;
  if (!providerId) return null;

  const status = canonicalStatus({ footballData: live, worldcupGame });
  const homeScore =
    status === "FINISHED" && worldcupGame?.homeScore !== null && worldcupGame?.homeScore !== undefined
      ? worldcupGame.homeScore
      : live?.homeScore ?? null;
  const awayScore =
    status === "FINISHED" && worldcupGame?.awayScore !== null && worldcupGame?.awayScore !== undefined
      ? worldcupGame.awayScore
      : live?.awayScore ?? null;

  if (!live && homeScore === null && awayScore === null && status === "SCHEDULED" && scorers.length === 0) {
    return null;
  }

  const goals = mergeGoalEvents(live?.goals, scorers);
  const eventDataAvailable = Boolean(live?.eventDataAvailable || scorers.length > 0);
  const goalEventCompleteness = getGoalEventCompleteness({
    homeScore,
    awayScore,
    goals,
    eventDataAvailable,
  });

  return {
    provider: "football-data.org",
    providerMatchId: providerId,
    status: toLiveMatchStatus(status, live?.status),
    homeScore,
    awayScore,
    winner: live?.winner ?? winnerFromScore(homeScore, awayScore),
    utcDate: live?.utcDate,
    lastSyncedAt: live?.lastSyncedAt ?? generatedAt,
    rawStatus: live?.rawStatus,
    eventDataAvailable,
    goalEventCompleteness,
    goals: goals.length > 0 ? goals : live?.goals,
    bookings: live?.bookings,
    substitutions: live?.substitutions,
  };
}

function topScorersFromSnapshot(
  scorerEventsByMatch: ReadonlyMap<string, GoalScorerEvent[]>,
  liveData: ReadonlyMap<number, LiveMatchData>,
  matches: Record<string, SerializableSnapshotMatch>
): PlayerGoalStat[] {
  // If provider data provides them directly from a tournament endpoint, we use that
  const providerScorers = computeTopScorers(liveData);
  if (providerScorers.length > 0) return providerScorers;

  const scorerMap = new Map<string, PlayerGoalStat>();
  
  // Aggregate from all enriched match scorers
  for (const match of Object.values(matches)) {
    for (const goal of match.scorers) {
      if (goal.isOwnGoal) continue;
      const key = goal.playerName;
      if (!scorerMap.has(key)) {
        scorerMap.set(key, {
          playerName: goal.playerName,
          teamName: goal.teamName,
          goals: 0,
        });
      }
      scorerMap.get(key)!.goals++;
    }
  }

  return [...scorerMap.values()].sort((a, b) => b.goals - a.goals).slice(0, 10);
}

function makeSnapshotId(_generatedAt: string, matches: Record<string, SerializableSnapshotMatch>): string {
  let signature = LIVE_SNAPSHOT_CACHE_KEY;
  for (const id of Object.keys(matches).sort()) {
    const match = matches[id];
    const scorers = match.scorers
      .map((event) => `${event.minuteLabel ?? event.minute ?? ""}:${event.playerName}:${event.isOwnGoal ? "og" : "g"}`)
      .join(",");
    signature += `|${id}:${match.status}:${match.homeScore ?? ""}:${match.awayScore ?? ""}:${scorers}:${match.goalEventCompleteness.missingGoalEventCount}`;
  }

  let hash = 0;
  for (let i = 0; i < signature.length; i++) {
    hash = (hash * 31 + signature.charCodeAt(i)) >>> 0;
  }
  return `snapshot-v7-${hash.toString(36)}`;
}

export async function buildTournamentLiveSnapshot({
  liveData,
  worldcupGames,
  generatedAt = new Date().toISOString(),
  primaryProviderOk = liveData.size > 0,
  secondaryProviderOk = worldcupGames !== null,
  primaryProviderFetchedAt = primaryProviderOk ? generatedAt : null,
  secondaryProviderFetchedAt = secondaryProviderOk ? generatedAt : null,
  skipEnrichment = false,
}: SnapshotProviderPayload): Promise<TournamentLiveSnapshot> {
  const knownProviderIds = new Set(
    MATCHES.map((match) => match.providerIds?.footballData).filter((id): id is number => typeof id === "number"),
  );
  const filteredLiveData = new Map<number, LiveMatchData>();
  for (const [id, data] of liveData) {
    if (knownProviderIds.has(id)) filteredLiveData.set(id, data);
  }

  const worldcupByMatch = worldcupGamesByInternalId(worldcupGames);
  const matches: Record<string, SerializableSnapshotMatch> = {};
  const scorerEventsByMatch = new Map<string, GoalScorerEvent[]>();
  const canonicalLiveData = new Map<number, LiveMatchData>();

  for (const match of MATCHES) {
    const internalId = matchSlug(match);
    const providerId = match.providerIds?.footballData ?? null;
    const live = providerId ? filteredLiveData.get(providerId) : undefined;
    const worldcupGame = worldcupByMatch.get(internalId);
    const scorers = scorersFromWorldcupGame(match, worldcupGame);
    const canonicalLive = withCanonicalMatchState({
      match,
      live,
      worldcupGame,
      scorers,
      generatedAt,
    });
    if (providerId && canonicalLive) canonicalLiveData.set(providerId, canonicalLive);
    const canonicalScorers = (canonicalLive?.goals ?? []).map((event): GoalScorerEvent => ({
      type: event.type === "PENALTY_GOAL" ? "PENALTY_GOAL" : "GOAL",
      minute: event.minute,
      stoppageTime: event.stoppageTime,
      minuteLabel: event.minuteLabel,
      teamName: event.teamName ?? "",
      playerTeamName: event.playerTeamName ?? undefined,
      playerName: event.playerName ?? "Scorer pending",
      isOwnGoal: event.isOwnGoal,
      isPenalty: event.type === "PENALTY_GOAL",
      provider: event.providerEventId ? "football-data.org" : "worldcup26.ir",
      confidence: event.playerName ? "high" : "low",
    }));
    if (canonicalScorers.length > 0) scorerEventsByMatch.set(internalId, canonicalScorers);

    const status = canonicalStatus({ footballData: live, worldcupGame });
    matches[internalId] = {
      match,
      internalId,
      providerMatchId: providerId,
      status,
      homeScore: canonicalLive?.homeScore ?? null,
      awayScore: canonicalLive?.awayScore ?? null,
      scorers: canonicalScorers,
      goalEventCompleteness: canonicalLive?.goalEventCompleteness ?? getGoalEventCompleteness({
        homeScore: canonicalLive?.homeScore ?? null,
        awayScore: canonicalLive?.awayScore ?? null,
        goals: canonicalLive?.goals,
        eventDataAvailable: Boolean(canonicalLive?.eventDataAvailable),
      }),
      sourceUpdatedAt: canonicalLive?.lastSyncedAt ?? null,
      providerUpdatedAt: canonicalLive?.lastSyncedAt ?? null,
      live: canonicalLive,
    };
  }

  // Secondary scorer enrichment via the provider-neutral runtime (active provider:
  // ESPN public JSON). When ESPN's scoreboard shows "post" but football-data.org
  // is stuck LIVE, the runtime may also advance the match status and score
  // (score/status failover) and update canonicalLiveData so standings below
  // reflect the corrected result. Fail-closed: only the exact string "true" enables
  // enrichment; any other value leaves the module unimported and the baseline unchanged.
  if (!skipEnrichment && process.env.SCORER_ENRICHMENT_ENABLED === "true") {
    const { enrichSnapshotScorers } = await import("./scorerProviderRuntime");
    await enrichSnapshotScorers(matches, primaryProviderOk, generatedAt, canonicalLiveData);
  }

  // Standings computed AFTER enrichment so ESPN-advanced finishes count in group tables.
  const standingsByGroup = computeGroupStandings(canonicalLiveData);
  const thirdPlaceRanking = computeThirdPlaceRanking(standingsByGroup);
  const tournamentStats = computeTournamentStats(canonicalLiveData, matches);
  const teamLeaderboards = computeTeamLeaderboards(standingsByGroup);
  const topScorers = topScorersFromSnapshot(scorerEventsByMatch, canonicalLiveData, matches);
  const snapshotId = makeSnapshotId(generatedAt, matches);

  return {
    snapshotId,
    generatedAt,
    updatedAt: generatedAt,
    matches,
    liveDataByProviderId: Object.fromEntries(canonicalLiveData),
    standingsByGroup,
    thirdPlaceRanking,
    tournamentStats,
    teamLeaderboards,
    topScorers,
    primaryProviderOk,
    secondaryProviderOk,
    primaryProviderFetchedAt,
    secondaryProviderFetchedAt,
  };
}

export function createSerializableSnapshotCache({ ttlMs, now = () => Date.now(), build }: SnapshotCacheOptions) {
  let cached: TournamentLiveSnapshot | null = null;
  let expiresAt = 0;
  let inFlight: Promise<TournamentLiveSnapshot> | null = null;

  return async function getCachedSnapshot() {
    const currentTime = now();
    if (cached && currentTime < expiresAt) return cached;
    if (inFlight) return inFlight;

    inFlight = build()
      .then((snapshot) => {
        cached = snapshot;
        expiresAt = now() + ttlMs;
        return snapshot;
      })
      .catch((err) => {
        if (cached) return cached;
        throw err;
      })
      .finally(() => {
        inFlight = null;
      });

    return inFlight;
  };
}

export function monotonicMergeLiveData(
  oldData: ReadonlyMap<number, LiveMatchData>,
  newData: ReadonlyMap<number, LiveMatchData>
): Map<number, LiveMatchData> {
  const merged = new Map<number, LiveMatchData>(oldData);
  for (const [id, newMatch] of newData) {
    const oldMatch = oldData.get(id);
    if (!oldMatch) {
      merged.set(id, newMatch);
      continue;
    }
    const status = (oldMatch.status === "FINISHED" && newMatch.status !== "FINISHED")
      ? oldMatch.status
      : newMatch.status;

    const homeScore = newMatch.homeScore === null && oldMatch.homeScore !== null ? oldMatch.homeScore : newMatch.homeScore;
    const awayScore = newMatch.awayScore === null && oldMatch.awayScore !== null ? oldMatch.awayScore : newMatch.awayScore;

    const goals = (newMatch.goals === undefined || newMatch.goals.length === 0) && oldMatch.goals && oldMatch.goals.length > 0
      ? oldMatch.goals
      : newMatch.goals;

    merged.set(id, {
      ...newMatch,
      status,
      homeScore,
      awayScore,
      goals,
      winner: newMatch.winner ?? oldMatch.winner,
    });
  }
  return merged;
}

export function monotonicMergeWorldcupGames(
  oldGames: WorldCup26Game[],
  newGames: WorldCup26Game[]
): WorldCup26Game[] {
  if (newGames.length === 0 && oldGames.length > 0) return oldGames;
  const merged = [...oldGames];
  for (const newGame of newGames) {
    const index = merged.findIndex((g) => g.providerGameId === newGame.providerGameId || (g.homeTeamName === newGame.homeTeamName && g.awayTeamName === newGame.awayTeamName));
    if (index === -1) {
      merged.push(newGame);
    } else {
      const oldGame = merged[index];
      const homeScorers = newGame.homeScorers.length === 0 && oldGame.homeScorers.length > 0 ? oldGame.homeScorers : newGame.homeScorers;
      const awayScorers = newGame.awayScorers.length === 0 && oldGame.awayScorers.length > 0 ? oldGame.awayScorers : newGame.awayScorers;
      const homeScore = newGame.homeScore === null && oldGame.homeScore !== null ? oldGame.homeScore : newGame.homeScore;
      const awayScore = newGame.awayScore === null && oldGame.awayScore !== null ? oldGame.awayScore : newGame.awayScore;
      merged[index] = {
        ...newGame,
        homeScore,
        awayScore,
        homeScorers,
        awayScorers,
        finished: oldGame.finished || newGame.finished,
      };
    }
  }
  return merged;
}

/**
 * Primary Provider Cache
 * Key rotated to v8 to reflect the split architecture.
 */
const getCachedPrimaryData = unstable_cache(
  async () => {
    const liveData = await fetchAllLiveData();
    if (liveData.size === 0) {
      throw new Error("Primary provider failed (no data)");
    }
    return {
      data: [...liveData.entries()],
      fetchedAt: new Date().toISOString()
    };
  },
  ["worldcup-primary-live-data-v8"],
  { revalidate: PROVIDER_REVALIDATE_SECONDS, tags: ["primary-live-data"] }
);

/**
 * Secondary bulk fetcher (short TTL, one fetch per refresh cycle).
 * Cached by Next.js — all per-match lookups in this request share the same payload.
 * Throws on empty/failed response so Next.js keeps the stale payload instead.
 */
const getBulkSecondaryData = unstable_cache(
  async () => {
    const games = await fetchWorldCup26Games();
    if (games.length === 0) {
      throw new Error("Secondary provider returned empty payload");
    }
    return games;
  },
  ["worldcup-bulk-secondary-v8"],
  { revalidate: PROVIDER_REVALIDATE_SECONDS, tags: ["bulk-secondary-data"] }
);

/**
 * Validate a bulk secondary payload: discard individual games that are finished
 * with a non-zero scoreline but supply zero scorer events — a reliable sign of
 * a malformed or partial response for that game.  The rest of the payload is kept.
 */
function validateSecondaryGames(games: WorldCup26Game[]): WorldCup26Game[] {
  return games.filter((game) => {
    if (!game.finished) return true;
    const hasGoals = (game.homeScore ?? 0) > 0 || (game.awayScore ?? 0) > 0;
    return !(hasGoals && game.homeScorers.length === 0 && game.awayScorers.length === 0);
  });
}

let memoryPrimaryData: Map<number, LiveMatchData> | null = null;
let memorySecondaryData: WorldCup26Game[] | null = null;
let memoryPrimaryFetchedAt: string | null = null;
let memorySecondaryFetchedAt: string | null = null;

export function resetLiveSnapshotMemoryForTests() {
  memoryPrimaryData = null;
  memorySecondaryData = null;
  memoryPrimaryFetchedAt = null;
  memorySecondaryFetchedAt = null;
  lastKnownGoodSnapshot = null;
  truthfulFallbackSnapshot = null;
  sharedRefreshInFlight = null;
}

// ───────────────────────────────────────────────────────────────────────────
// Shared snapshot architecture (stale-while-revalidate).
//
// The fully-built tournament snapshot is tournament-wide and identical for every
// viewer — timezone and language are applied later, at render time — so it is
// cached ONCE in the Next.js/Vercel Data Cache (cross-instance, persistent) via
// unstable_cache. Public page requests read that serialized snapshot instead of
// rebuilding it; football-data.org / ESPN orchestration + standings computation
// run only on a cache miss or background revalidation, never on the page's
// critical render path. This is what removes the multi-second cold TTFB while
// preserving every existing correctness gate (the build itself is unchanged).
//
// The cache key is stable and schema-versioned (bump SNAPSHOT_SCHEMA_VERSION for
// an incompatible snapshot shape) and deliberately carries NO timezone/language,
// so one canonical snapshot is shared across all viewers and is not invalidated
// merely by a deploy.
// ───────────────────────────────────────────────────────────────────────────
export const SNAPSHOT_SCHEMA_VERSION = "v2";

// Stage-aware revalidation. A live match needs a fresh score quickly; while every
// match is scheduled or finished the snapshot can be cached far longer. The stage
// is decided from the static schedule + clock alone — no provider call — so it
// never reintroduces provider work onto the page-render path.
export const LIVE_SNAPSHOT_CACHE_REVALIDATE_SECONDS = 10;
export const IDLE_SNAPSHOT_CACHE_REVALIDATE_SECONDS = 90;
// A fixture is "live-ish" from kickoff until this long after (covers HT, stoppage
// and extra time), used only to pick the revalidation cadence.
const LIVE_WINDOW_MS = 2.75 * 60 * 60 * 1000;

// Declared, enforced maximum application-added staleness for a LIVE score beyond
// provider availability:
//   provider revalidate (≤10s, lazily driven at the snapshot cadence)
//   + snapshot revalidate (10s live)
//   + client live poll (15s, see liveRefreshPolicy)
//   = 35s.
export const MAX_LIVE_APP_STALENESS_SECONDS = 35;

/** Whether any fixture is currently within its live window (schedule + clock only). */
export function hasLiveWindow(now: Date = new Date(), matches: readonly Match[] = MATCHES): boolean {
  const t = now.getTime();
  return matches.some((m) => {
    const k = matchUtcDate(m).getTime();
    return t >= k && t <= k + LIVE_WINDOW_MS;
  });
}

/** Snapshot revalidate cadence for the current stage (seconds). */
export function snapshotRevalidateSeconds(now: Date = new Date()): number {
  return hasLiveWindow(now) ? LIVE_SNAPSHOT_CACHE_REVALIDATE_SECONDS : IDLE_SNAPSHOT_CACHE_REVALIDATE_SECONDS;
}

// If the shared cache is cold/empty and the build would block longer than this,
// serve a fallback immediately and let the build finish + populate in the
// background — a brand-new deployment must never show a 10–20s blank page.
const COLD_START_FALLBACK_MS = 1500;

// Stable, schema-versioned, tz/lang-free cache key. An optional, env-supplied
// namespace (SNAPSHOT_CACHE_NAMESPACE) is appended ONLY when set — used to force a
// fresh cold-miss namespace in Preview QA. It is never hard-coded, so Production
// (no such env) keeps the stable key and is not invalidated by a deploy.
function snapshotCacheKey(stage: "live" | "idle"): string[] {
  const ns = process.env.SNAPSHOT_CACHE_NAMESPACE;
  const key = ["worldcup-built-snapshot", SNAPSHOT_SCHEMA_VERSION, stage];
  return ns ? [...key, ns] : key;
}

// Two stage-scoped SWR wrappers over the SAME canonical build, with distinct
// revalidate cadences. The active one is chosen per request from the schedule.
const liveSnapshotCache = unstable_cache(
  () => buildLiveSnapshotNow(),
  snapshotCacheKey("live"),
  { revalidate: LIVE_SNAPSHOT_CACHE_REVALIDATE_SECONDS, tags: ["built-snapshot"] },
);
const idleSnapshotCache = unstable_cache(
  () => buildLiveSnapshotNow(),
  snapshotCacheKey("idle"),
  { revalidate: IDLE_SNAPSHOT_CACHE_REVALIDATE_SECONDS, tags: ["built-snapshot"] },
);

function getSharedBuiltSnapshot(): Promise<TournamentLiveSnapshot> {
  return (hasLiveWindow() ? liveSnapshotCache() : idleSnapshotCache()) as Promise<TournamentLiveSnapshot>;
}

let truthfulFallbackSnapshot: TournamentLiveSnapshot | null = null;

// Truthful, non-fabricated fallback for a cold/empty shared cache.
//
// It shows the canonical schedule (real teams + kickoffs) but invents nothing:
// no scores, no scorers, no authoritative standings. Crucially, a match whose
// kickoff has already passed is NOT presented as SCHEDULED — its result is
// genuinely unknown, so it is flagged `liveDataUnavailable` and consumers render
// an honest "live data unavailable" state. The snapshot is flagged `isFallback`
// so standings / Top Scorers are shown as not-yet-authoritative, and freshness
// is honestly "unavailable" (primaryProviderOk=false, no fetchedAt → never a
// "Last checked … ago" that implies a successful sync). Enrichment is skipped so
// it is instant (no provider network calls).
async function getTruthfulFallbackSnapshot(): Promise<TournamentLiveSnapshot> {
  if (truthfulFallbackSnapshot) return truthfulFallbackSnapshot;
  const base = await buildTournamentLiveSnapshot({
    liveData: new Map(),
    worldcupGames: null,
    generatedAt: new Date().toISOString(),
    primaryProviderOk: false,
    secondaryProviderOk: false,
    primaryProviderFetchedAt: null,
    secondaryProviderFetchedAt: null,
    skipEnrichment: true,
  });

  const nowMs = Date.now();
  const matches: Record<string, SerializableSnapshotMatch> = {};
  for (const [id, m] of Object.entries(base.matches)) {
    const kickoffPassed = matchUtcDate(m.match).getTime() <= nowMs;
    matches[id] = kickoffPassed ? { ...m, liveDataUnavailable: true } : m;
  }

  truthfulFallbackSnapshot = { ...base, matches, isFallback: true };
  return truthfulFallbackSnapshot;
}

// Active only inside the Next.js server runtime. Test scripts (no NEXT_RUNTIME)
// build directly, preserving the rebuild-on-every-call contract their suites assert.
function sharedSnapshotEnabled(): boolean {
  return Boolean(process.env.NEXT_RUNTIME);
}

const COLD_SENTINEL = Symbol("cold-snapshot");

// Single-flight shared refresh: at most one expensive build per instance is in
// flight at a time; concurrent callers reuse it. It updates last-known-good and
// captures errors safely — the underlying unstable_cache write is what populates
// the cross-instance Data Cache.
let sharedRefreshInFlight: Promise<TournamentLiveSnapshot | null> | null = null;
function beginSharedRefresh(): Promise<TournamentLiveSnapshot | null> {
  if (sharedRefreshInFlight) return sharedRefreshInFlight;
  sharedRefreshInFlight = getSharedBuiltSnapshot()
    .then((snapshot) => {
      lastKnownGoodSnapshot = snapshot;
      return snapshot as TournamentLiveSnapshot | null;
    })
    .catch(() => {
      // Stale-on-error: never throw to the page, never leak provider detail.
      console.warn("[liveSnapshot] shared snapshot refresh failed; serving last validated/fallback.");
      return lastKnownGoodSnapshot;
    })
    .finally(() => {
      sharedRefreshInFlight = null;
    });
  return sharedRefreshInFlight;
}

// Keep an in-flight refresh alive past the response so it populates the shared
// cache. after() (Next 15.5) extends the serverless function lifetime until the
// callback settles — an un-awaited Promise would otherwise be abandoned when the
// response is sent. Rejections are swallowed (no unhandled rejection, no leak).
function keepRefreshAlive(refresh: Promise<unknown>): void {
  const safe = Promise.resolve(refresh).then(() => undefined, () => undefined);
  try {
    after(() => safe);
  } catch {
    // Not in a request scope (build/SSG/tests) — the promise still settles within
    // the current task; nothing further to register.
    void safe;
  }
}

export async function getTournamentLiveSnapshot(): Promise<TournamentLiveSnapshot> {
  if (!sharedSnapshotEnabled()) {
    return buildLiveSnapshotNow();
  }

  // Read (or, on a miss, build) the shared snapshot. Warm/stale reads from the
  // Data Cache resolve immediately (stale-while-revalidate); only a truly cold
  // cache blocks on the build.
  const refresh = beginSharedRefresh();

  const raced = await Promise.race([
    refresh,
    new Promise<typeof COLD_SENTINEL>((resolve) => setTimeout(() => resolve(COLD_SENTINEL), COLD_START_FALLBACK_MS)),
  ]);

  if (raced && raced !== COLD_SENTINEL) {
    return raced as TournamentLiveSnapshot;
  }

  // Cold/empty cache (or an error with no last-known-good on this instance): do
  // not block the page. Register the in-flight build with after() so Vercel keeps
  // the function alive until it finishes populating the shared cache, then serve
  // a truthful fallback now.
  keepRefreshAlive(refresh);
  return lastKnownGoodSnapshot ?? (await getTruthfulFallbackSnapshot());
}

async function buildLiveSnapshotNow(): Promise<TournamentLiveSnapshot> {
  const generatedAt = new Date().toISOString();

  let primaryOk = false;
  let secondaryOk = false;

  // 1. Primary: football-data.org (separate cache key from secondary)
  try {
    const p = await getCachedPrimaryData();
    const newPrimary = new Map(p.data);
    memoryPrimaryData = memoryPrimaryData
      ? monotonicMergeLiveData(memoryPrimaryData, newPrimary)
      : newPrimary;
    memoryPrimaryFetchedAt = p.fetchedAt;
    primaryOk = true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[liveSnapshot] primary provider read failed: ${msg}`);
  }

  // 2. Secondary: worldcup26.ir (one bulk fetch per refresh cycle, cached separately)
  try {
    const games = await getBulkSecondaryData();
    const validated = validateSecondaryGames(games);
    if (validated.length > 0) {
      memorySecondaryData = memorySecondaryData
        ? monotonicMergeWorldcupGames(memorySecondaryData, validated)
        : validated;
      memorySecondaryFetchedAt = new Date().toISOString();
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[liveSnapshot] secondary provider read failed: ${msg}`);
  }

  // secondaryOk = true when we have data from any prior successful fetch
  secondaryOk = memorySecondaryData !== null && memorySecondaryData.length > 0;

  const liveData = memoryPrimaryData ?? new Map<number, LiveMatchData>();
  const worldcupGames = memorySecondaryData ?? null;

  return buildTournamentLiveSnapshot({
    liveData,
    worldcupGames,
    generatedAt,
    primaryProviderOk: primaryOk,
    secondaryProviderOk: secondaryOk,
    primaryProviderFetchedAt: memoryPrimaryFetchedAt,
    secondaryProviderFetchedAt: memorySecondaryFetchedAt,
  });
}
