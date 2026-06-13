import { unstable_cache } from "next/cache";
import { fetchAllLiveData } from "./fetchAllLiveData";
import { computeGroupStandings, type StandingRow } from "./groupStandings";
import { MATCHES, matchSlug, type Match } from "./matches";
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
};

type SnapshotProviderPayload = {
  liveData: ReadonlyMap<number, LiveMatchData>;
  worldcupGames: WorldCup26Game[] | null;
  generatedAt?: string;
  primaryProviderOk?: boolean;
  secondaryProviderOk?: boolean;
  primaryProviderFetchedAt?: string | null;
  secondaryProviderFetchedAt?: string | null;
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

function normalizeTeamName(name: string): string {
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

function toLiveGoalEvent(event: GoalScorerEvent): LiveMatchEvent {
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
    normalizeTeamName(event.teamName),
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
): PlayerGoalStat[] {
  const providerScorers = computeTopScorers(liveData);
  if (providerScorers.length > 0) return providerScorers;

  const scorerMap = new Map<string, PlayerGoalStat>();
  for (const events of scorerEventsByMatch.values()) {
    for (const goal of events) {
      if (goal.isOwnGoal) continue;
      const existing = scorerMap.get(goal.playerName);
      if (existing) {
        existing.goals++;
      } else {
        scorerMap.set(goal.playerName, {
          playerName: goal.playerName,
          teamName: goal.teamName,
          goals: 1,
        });
      }
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

  const standingsByGroup = computeGroupStandings(canonicalLiveData);
  const thirdPlaceRanking = computeThirdPlaceRanking(standingsByGroup);
  const tournamentStats = computeTournamentStats(canonicalLiveData);
  const teamLeaderboards = computeTeamLeaderboards(standingsByGroup);
  const topScorers = topScorersFromSnapshot(scorerEventsByMatch, canonicalLiveData);
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

// Last successful raw payload from each provider — used to keep serving real
// scores/scorers when one provider has a transient failure (e.g. a 429 cooldown)
// without letting the *whole* snapshot (and its generatedAt freshness clock) go
// stale for the duration of that cooldown.
let lastKnownLiveData: ReadonlyMap<number, LiveMatchData> | null = null;
let lastKnownWorldcupGames: WorldCup26Game[] | null = null;
let lastPrimaryProviderFetchedAt: string | null = null;
let lastSecondaryProviderFetchedAt: string | null = null;

async function refreshTournamentLiveSnapshot(): Promise<TournamentLiveSnapshot> {
  const generatedAt = new Date().toISOString();
  const [liveDataResult, worldcupGamesResult] = await Promise.allSettled([
    fetchAllLiveData(),
    fetchWorldCup26Games(),
  ]);

  const fetchedLiveData = liveDataResult.status === "fulfilled" ? liveDataResult.value : new Map<number, LiveMatchData>();
  const fetchedWorldcupGames = worldcupGamesResult.status === "fulfilled" ? worldcupGamesResult.value : null;

  const primaryProviderOk = fetchedLiveData.size > 0;
  const secondaryProviderOk = fetchedWorldcupGames !== null;

  if (primaryProviderOk) {
    lastKnownLiveData = fetchedLiveData;
    lastPrimaryProviderFetchedAt = generatedAt;
  }
  if (secondaryProviderOk) {
    lastKnownWorldcupGames = fetchedWorldcupGames;
    lastSecondaryProviderFetchedAt = generatedAt;
  }

  // Fall back to the last successful payload per-provider so a single provider's
  // transient failure doesn't freeze the entire snapshot (and its freshness clock).
  const liveData = primaryProviderOk ? fetchedLiveData : (lastKnownLiveData ?? fetchedLiveData);
  const worldcupGames = secondaryProviderOk ? fetchedWorldcupGames : lastKnownWorldcupGames;

  const snapshot = await buildTournamentLiveSnapshot({
    liveData,
    worldcupGames,
    generatedAt,
    primaryProviderOk,
    secondaryProviderOk,
    primaryProviderFetchedAt: lastPrimaryProviderFetchedAt,
    secondaryProviderFetchedAt: lastSecondaryProviderFetchedAt,
  });
  lastKnownGoodSnapshot = snapshot;
  return snapshot;
}

const getCachedTournamentLiveSnapshot = unstable_cache(
  refreshTournamentLiveSnapshot,
  [LIVE_SNAPSHOT_CACHE_KEY],
  { revalidate: LIVE_SNAPSHOT_REVALIDATE_SECONDS },
);

export async function getTournamentLiveSnapshot(): Promise<TournamentLiveSnapshot> {
  try {
    const snapshot = await getCachedTournamentLiveSnapshot();
    lastKnownGoodSnapshot = snapshot;
    return snapshot;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[liveSnapshot] refresh failed; serving last known snapshot when available: ${msg}`);
    if (lastKnownGoodSnapshot) return lastKnownGoodSnapshot;

    return buildTournamentLiveSnapshot({
      liveData: new Map(),
      worldcupGames: null,
      generatedAt: new Date().toISOString(),
    });
  }
}
