import { after } from "next/server";
import { unstable_cache } from "./cacheAdapter";
import { fetchAllLiveData } from "./fetchAllLiveData";
import { getLiveRefreshPolicy } from "./liveRefreshPolicy";
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
import { resolvePlayerAlias } from "./worldcup26PlayerAliases";
import { applyVerifiedGoalCorrections } from "./verifiedMatchEventCorrections";
import { countryName } from "./i18n";
import { getResolvedAwayTeam, getResolvedHomeTeam } from "./participant-resolution";

export const LIVE_SNAPSHOT_CACHE_KEY = "worldcup-tournament-live-snapshot-v9";
export const LIVE_SNAPSHOT_REVALIDATE_SECONDS = 25;
// Provider Data-Cache revalidate (seconds). Lazily driven by the snapshot
// rebuild, so idle periods (snapshot cadence ~90s) refetch providers only at
// that slower cadence. Tuned to keep providers comfortably within free-tier
// limits even during live windows:
//   - PRIMARY (football-data scores/status): 12s → ≤5 req/min, the freshness-
//     critical source for the live-score budget.
//   - SECONDARY (worldcup26.ir scorer enrichment): 30s → ≤2 req/min, gentler
//     because it is enrichment, not the canonical score.
export const PROVIDER_REVALIDATE_SECONDS = 12;
const SECONDARY_PROVIDER_REVALIDATE_SECONDS = 30;

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
// The last validated snapshot this instance accepted, staged for promotion into
// the durable cross-instance baseline cache (see durableBaselineCache below).
let pendingBaselineSnapshot: TournamentLiveSnapshot | null = null;

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
  worldcupGame: _worldcupGame,
}: {
  footballData?: LiveMatchData;
  worldcupGame?: WorldCup26Game | null;
}): SnapshotMatchStatus {
  const footballStatus = toSnapshotStatus(footballData);
  if (footballStatus === "FINISHED") return "FINISHED";
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
    const homeTeam = getResolvedHomeTeam(match);
    const awayTeam = getResolvedAwayTeam(match);
    if (!homeTeam || !awayTeam) continue;
    const homeDisplay = countryName(homeTeam, "en");
    const awayDisplay = countryName(awayTeam, "en");
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
  const homeTeam = getResolvedHomeTeam(match);
  const awayTeam = getResolvedAwayTeam(match);
  if (!homeTeam || !awayTeam) return [];
  const homeDisplay = countryName(homeTeam, "en");
  const awayDisplay = countryName(awayTeam, "en");
  return applyVerifiedGoalCorrections(internalId, dedupeScorers([
    ...game.homeScorers.map((event) => canonicalizeWorldcupScorer(event, internalId, homeDisplay)),
    ...game.awayScorers.map((event) => canonicalizeWorldcupScorer(event, internalId, awayDisplay)),
  ]));
}

function canonicalizeWorldcupScorer(
  event: GoalScorerEvent,
  internalId: string,
  scoringTeam: string,
): GoalScorerEvent {
  return {
    ...event,
    teamName: scoringTeam,
    playerName: resolvePlayerAlias({
      provider: "worldcup26.ir",
      matchId: internalId,
      eventMinute: event.minute,
      stoppageMinute: event.stoppageTime ?? null,
      scoringTeam,
      playerTeam: event.playerTeamName,
      rawName: event.playerName,
    }),
  };
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
  const homeScore = live?.homeScore ?? null;
  const awayScore = live?.awayScore ?? null;

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
    stage: live?.stage,
    rawStage: live?.rawStage,
    scoreDuration: live?.scoreDuration,
    regularTimeScore: live?.regularTimeScore,
    extraTimeScore: live?.extraTimeScore,
    penaltyShootoutScore: live?.penaltyShootoutScore,
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
      if (/^Scorer (unavailable|pending)$/i.test(goal.playerName)) continue;
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
  // ESPN public JSON). Enrichment may replace scorer details only; football-data.org
  // remains authoritative for score/status. Fail-closed: only the exact string
  // "true" enables enrichment; any other value leaves the module unimported and
  // the baseline unchanged.
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
  { revalidate: SECONDARY_PROVIDER_REVALIDATE_SECONDS, tags: ["bulk-secondary-data"] }
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
  pendingBaselineSnapshot = null;
  truthfulFallbackSnapshot = null;
  truthfulFallbackInFlight = null;
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
export const SNAPSHOT_SCHEMA_VERSION = "v3";

// Stage-aware revalidation. A live match needs a fresh score quickly; while every
// match is scheduled or finished the snapshot can be cached far longer. The stage
// is decided from the static schedule + clock alone — no provider call — so it
// never reintroduces provider work onto the page-render path.
export const LIVE_SNAPSHOT_CACHE_REVALIDATE_SECONDS = 10;
export const IDLE_SNAPSHOT_CACHE_REVALIDATE_SECONDS = 90;
// A fixture is "live-ish" from kickoff until this long after (covers HT, stoppage
// and extra time), used only to pick the revalidation cadence.
const LIVE_WINDOW_MS = 4 * 60 * 60 * 1000;

// Declared, enforced maximum application-added staleness for a LIVE score beyond
// provider availability:
//   provider revalidate (≤10s, lazily driven at the snapshot cadence)
//   + snapshot revalidate (10s live)
//   + client live poll (15s, see liveRefreshPolicy)
//   = 35s.
export const MAX_LIVE_APP_STALENESS_SECONDS = 35;

/** Whether any fixture is currently within its live window (schedule + clock only). */
export function hasLiveWindow(now: Date = new Date(), matches: readonly Match[] = MATCHES): boolean {
  if (lastKnownGoodSnapshot) {
    const candidates = Object.values(lastKnownGoodSnapshot.matches);
    const policy = getLiveRefreshPolicy(candidates, now);
    return policy.reason === "live" || policy.reason === "near-match";
  }

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

// ───────────────────────────────────────────────────────────────────────────
// Snapshot acceptance gate — the SINGLE decision for whether a freshly built
// candidate may be committed to the durable shared (validated) Data Cache.
//
// A provider-degraded "schedule shell" (both providers failed → every match
// collapses to SCHEDULED) must NEVER be accepted, persisted, or served as a
// validated live snapshot, and a candidate must never regress a result the last
// validated snapshot already knew. When this returns false the caller throws, so
// unstable_cache does not persist the candidate and instead keeps the prior
// validated value (stale-while-revalidate). This is what makes the shared cache
// poison-proof: only accepted, validated snapshots are ever written.
// ───────────────────────────────────────────────────────────────────────────
export function isCacheableValidatedSnapshot(
  candidate: TournamentLiveSnapshot,
  previous: TournamentLiveSnapshot | null,
): boolean {
  // 1. A fallback / schedule shell is never a validated snapshot.
  if (candidate.isFallback) return false;

  // 2. No live-data evidence at all (both providers unhealthy) ⇒ not validated.
  //    This is the exact degraded state from the QA report: providers failed and
  //    every match read back as SCHEDULED. Reject it before it can be cached, so
  //    the shared validated key is never poisoned with a static schedule shell.
  if (!candidate.primaryProviderOk && !candidate.secondaryProviderOk) return false;

  // 3. Monotonic, no-regression vs the last validated snapshot.
  if (previous && !previous.isFallback) {
    for (const [id, prev] of Object.entries(previous.matches)) {
      const next = candidate.matches[id];
      if (!next) continue;
      // FINISHED must never regress.
      if (prev.status === "FINISHED" && next.status !== "FINISHED") return false;
      // A match already elapsed/known must never fall back to SCHEDULED.
      if (prev.status !== "SCHEDULED" && next.status === "SCHEDULED") return false;
      // A real score must never decrease or vanish.
      if (prev.homeScore !== null && (next.homeScore === null || next.homeScore < prev.homeScore)) return false;
      if (prev.awayScore !== null && (next.awayScore === null || next.awayScore < prev.awayScore)) return false;
      // Known scorer events must never disappear.
      if (prev.scorers.length > 0 && next.scorers.length < prev.scorers.length) return false;
    }
    // Authoritative aggregates must not be wiped out by a degraded refresh.
    if (previous.topScorers.length > 0 && candidate.topScorers.length === 0) return false;
    const prevPlayed = Object.values(previous.standingsByGroup).flat().some((r) => r.played > 0);
    const nextPlayed = Object.values(candidate.standingsByGroup).flat().some((r) => r.played > 0);
    if (prevPlayed && !nextPlayed) return false;
  }
  return true;
}

// Thrown when a built candidate fails the acceptance gate. Throwing (rather than
// returning) is the mechanism that prevents cache poisoning: unstable_cache never
// persists a thrown result, so the prior validated snapshot is preserved and
// served stale-while-revalidate.
class DegradedSnapshotError extends Error {
  constructor() {
    super("Provider-degraded snapshot rejected — not committable as a validated snapshot");
    this.name = "DegradedSnapshotError";
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Durable cross-instance validated baseline.
//
// Module memory (lastKnownGoodSnapshot) is null on a brand-new serverless
// instance, so it cannot, by itself, stop a fresh instance with a stale/partial
// provider from persisting a regressed candidate over the durable validated
// snapshot. The regression gate therefore also consults a DURABLE baseline that
// survives across instances, read from the Vercel Data Cache before acceptance.
//
// Implementation within unstable_cache's constraints (read-through only; the
// cache key embeds the callback source — see next/dist/.../unstable-cache.js —
// so a single callback is used for BOTH read and write, and revalidate:0 is
// illegal):
//   • The fetcher returns this instance's last accepted snapshot
//     (pendingBaselineSnapshot) when one is staged, else THROWS. Throwing never
//     overwrites the stored entry, so a fresh instance (nothing staged) reading
//     the baseline receives the durable stored value (cache hit on Vercel; the
//     adapter's stale-on-error in tests) and never clobbers it with null.
//   • Reading it is deadlock-free: the baseline key is distinct from the snapshot
//     stage keys, and it is never read from inside its own fetcher.
// This is best-effort eventual consistency (no paid KV / no atomic CAS): a
// terminal result such as FINISHED 4–1 can never regress, while the in-memory
// reference closes any sub-revalidate window within a warm instance.
const BASELINE_REVALIDATE_SECONDS = 15;
function baselineCacheKey(): string[] {
  const ns = process.env.SNAPSHOT_CACHE_NAMESPACE;
  const key = ["worldcup-validated-baseline", SNAPSHOT_SCHEMA_VERSION];
  return ns ? [...key, ns] : key;
}
const durableBaselineCache = unstable_cache(
  async () => {
    if (!pendingBaselineSnapshot) {
      // Nothing to promote on this instance — never write/overwrite the durable
      // baseline; the stored value (if any) is preserved and returned instead.
      throw new Error("no-staged-baseline");
    }
    return pendingBaselineSnapshot;
  },
  baselineCacheKey(),
  { revalidate: BASELINE_REVALIDATE_SECONDS, tags: ["validated-baseline"] },
);

// Read the durable previously-validated snapshot (cross-instance), or null if no
// durable baseline exists yet. Never throws to the caller.
async function getDurablePreviousValidated(): Promise<TournamentLiveSnapshot | null> {
  try {
    const snapshot = await durableBaselineCache();
    return snapshot && !snapshot.isFallback ? snapshot : null;
  } catch {
    return null;
  }
}

// Record an accepted validated snapshot as both the in-memory last-known-good and
// the staged durable baseline, then promote it to the durable cache. Promotion
// only writes through unstable_cache on a stale/missing entry (bounded lag on
// Vercel; immediate in the test adapter), which is sufficient because acceptance
// already gated the candidate against the durable previous + in-memory reference.
async function recordValidatedSnapshot(candidate: TournamentLiveSnapshot): Promise<void> {
  lastKnownGoodSnapshot = candidate;
  pendingBaselineSnapshot = candidate;
  try {
    await durableBaselineCache();
  } catch {
    // Promotion is best-effort; a failed write never blocks serving.
  }
}

// Build a fresh candidate and commit it to the durable cache ONLY if it passes
// the acceptance gate against BOTH the durable cross-instance baseline and this
// instance's in-memory last-known-good. This is the function the unstable_cache
// snapshot wrappers invoke, so a rejected candidate is never written.
async function buildValidatedSnapshotForCache(): Promise<TournamentLiveSnapshot> {
  // 1. Obtain the durable previous validated snapshot BEFORE building, so a fresh
  //    instance has a real regression reference even with empty module memory.
  const durablePrevious = await getDurablePreviousValidated();

  // 2. Build the candidate.
  const candidate = await buildLiveSnapshotNow();

  // 3. Validate intrinsic health + no-regression vs the durable baseline …
  if (!isCacheableValidatedSnapshot(candidate, durablePrevious)) {
    throw new DegradedSnapshotError();
  }
  // … and vs the in-memory last-known-good (closes any sub-revalidate window
  //    where the durable baseline lags a within-instance advance).
  if (lastKnownGoodSnapshot && !isCacheableValidatedSnapshot(candidate, lastKnownGoodSnapshot)) {
    throw new DegradedSnapshotError();
  }

  // 4. Accept: promote to the durable baseline + in-memory reference, then commit.
  await recordValidatedSnapshot(candidate);
  return candidate;
}

// Two stage-scoped SWR wrappers over the SAME validated build, with distinct
// revalidate cadences. The active one is chosen per request from the schedule.
// They wrap buildValidatedSnapshotForCache (NOT the raw build), so only accepted
// validated snapshots ever reach the durable shared cache.
const liveSnapshotCache = unstable_cache(
  () => buildValidatedSnapshotForCache(),
  snapshotCacheKey("live"),
  { revalidate: LIVE_SNAPSHOT_CACHE_REVALIDATE_SECONDS, tags: ["built-snapshot"] },
);
const idleSnapshotCache = unstable_cache(
  () => buildValidatedSnapshotForCache(),
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
let truthfulFallbackInFlight: Promise<TournamentLiveSnapshot> | null = null;
async function getTruthfulFallbackSnapshot(): Promise<TournamentLiveSnapshot> {
  if (truthfulFallbackSnapshot) return truthfulFallbackSnapshot;
  // Single-flight: concurrent cold callers share one fallback build (it is cheap
  // — no network, enrichment skipped — but they must return the same object).
  if (truthfulFallbackInFlight) return truthfulFallbackInFlight;
  truthfulFallbackInFlight = (async () => {
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
  })().finally(() => {
    truthfulFallbackInFlight = null;
  });
  return truthfulFallbackInFlight;
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
      // getSharedBuiltSnapshot resolves to a validated snapshot (a freshly built
      // candidate is already recorded; a stale read returns the durable validated
      // value). Seed last-known-good monotonically: never let a fallback/shell or
      // a stale read REGRESS the in-memory reference.
      if (
        snapshot &&
        !snapshot.isFallback &&
        (!lastKnownGoodSnapshot || isCacheableValidatedSnapshot(snapshot, lastKnownGoodSnapshot))
      ) {
        lastKnownGoodSnapshot = snapshot;
      }
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
