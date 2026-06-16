import { unstable_cache } from "./cacheAdapter";
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
  { revalidate: LIVE_SNAPSHOT_REVALIDATE_SECONDS, tags: ["primary-live-data"] }
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
  { revalidate: LIVE_SNAPSHOT_REVALIDATE_SECONDS, tags: ["bulk-secondary-data"] }
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
}

export async function getTournamentLiveSnapshot(): Promise<TournamentLiveSnapshot> {
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
