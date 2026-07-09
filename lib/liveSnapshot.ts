
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
  type GoalScorerEvent,
  type WorldCup26Game,
} from "./worldcup26Provider";
import { findPlayerAlias } from "./worldcup26PlayerAliases";
import { applyVerifiedGoalCorrections } from "./verifiedMatchEventCorrections";
import { countryName } from "./i18n";
import { getResolvedAwayTeam, getResolvedHomeTeam, type ResolvedParticipantLookup } from "./participant-resolution";
import { buildKnockoutResolution } from "./knockoutResolution";
import { squadFor } from "./squads";
import { applyCanonicalMatchResultFallback } from "./canonicalMatchResults";

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

function toSnapshotStatus(live: LiveMatchData | undefined, worldcupGame?: WorldCup26Game | null, homeScore?: number | null, awayScore?: number | null): SnapshotMatchStatus {
  let status: LiveMatchData["status"] = live?.status ?? "SCHEDULED";
  if (!live && worldcupGame) {
    if (worldcupGame.finished) status = "FINISHED";
    else if (worldcupGame.isLive || homeScore !== null || awayScore !== null) status = "IN_PLAY";
  }
  if (status === "IN_PLAY" && (live?.homeScore === null || live?.awayScore === null)) {
    return "SYNCING";
  }
  if (status === "IN_PLAY") return "LIVE";
  if (status === "PAUSED") return "HALFTIME";
  if (status === "FINISHED") return "FINISHED";
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
  if (footballStatus === "FINISHED") return "FINISHED";
  if (worldcupGame?.finished) return "FINISHED";
  if (footballStatus === "LIVE" || footballStatus === "HALFTIME" || footballStatus === "SYNCING" || worldcupGame?.isLive) {
    return footballStatus === "HALFTIME" ? "HALFTIME" : "LIVE";
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

function syncLiveGoalLedgers(
  matches: Record<string, SerializableSnapshotMatch>,
  canonicalLiveData: Map<number, LiveMatchData>,
  scorerEventsByMatch: Map<string, GoalScorerEvent[]>,
): void {
  scorerEventsByMatch.clear();
  for (const [internalId, matchData] of Object.entries(matches)) {
    if (matchData.scorers.length > 0) scorerEventsByMatch.set(internalId, matchData.scorers);
    if (!matchData.live || matchData.scorers.length === 0) continue;

    const goals = matchData.scorers.map(toLiveGoalEvent);
    const goalEventCompleteness = getGoalEventCompleteness({
      homeScore: matchData.homeScore,
      awayScore: matchData.awayScore,
      goals,
      eventDataAvailable: true,
    });
    matchData.live = {
      ...matchData.live,
      goals,
      goalEventCompleteness,
      eventDataAvailable: true,
    };
    matchData.goalEventCompleteness = goalEventCompleteness;
    if (matchData.providerMatchId !== null) {
      canonicalLiveData.set(matchData.providerMatchId, matchData.live);
    }
  }
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

function worldcupGamesByInternalId(
  games: WorldCup26Game[] | null,
  resolvedParticipants?: ResolvedParticipantLookup
): Map<string, WorldCup26Game> {
  const result = new Map<string, WorldCup26Game>();
  if (!games) return result;

  for (const match of MATCHES) {
    const game = games.find((g) => {
      const matchNum = "matchNumber" in match ? match.matchNumber : null;
      if (matchNum !== null && g.providerGameId === String(matchNum)) {
        return true;
      }

      const homeTeam = getResolvedHomeTeam(match, resolvedParticipants);
      const awayTeam = getResolvedAwayTeam(match, resolvedParticipants);
      if (!homeTeam || !awayTeam) return false;
      const homeDisplay = countryName(homeTeam, "en");
      const awayDisplay = countryName(awayTeam, "en");
      const homeKey = normalizeTeamName(homeDisplay);
      const awayKey = normalizeTeamName(awayDisplay);

      const gHome = normalizeTeamName(g.homeTeamName);
      const gAway = normalizeTeamName(g.awayTeamName);
      return gHome === homeKey && gAway === awayKey;
    });

    if (game) result.set(matchSlug(match), game);
  }

  return result;
}

function scorersFromWorldcupGame(
  match: Match, 
  game: WorldCup26Game | undefined,
  resolvedParticipants?: ResolvedParticipantLookup
): GoalScorerEvent[] {
  const internalId = matchSlug(match);
  if (!game) {
    return applyVerifiedGoalCorrections(internalId, []);
  }
  const homeTeam = getResolvedHomeTeam(match, resolvedParticipants);
  const awayTeam = getResolvedAwayTeam(match, resolvedParticipants);
  if (!homeTeam || !awayTeam) return applyVerifiedGoalCorrections(internalId, []);
  const homeDisplay = countryName(homeTeam, "en");
  const awayDisplay = countryName(awayTeam, "en");
  return applyVerifiedGoalCorrections(internalId, dedupeScorers([
    ...game.homeScorers.map((event) => canonicalizeWorldcupScorer(event, internalId, homeDisplay, homeTeam)),
    ...game.awayScorers.map((event) => canonicalizeWorldcupScorer(event, internalId, awayDisplay, awayTeam)),
  ]));
}

function normalizePlayerLookupName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function teamRosterAcceptsRawName(teamKey: string, rawName: string): boolean {
  const squad = squadFor(teamKey);
  if (!squad) return false;

  const raw = normalizePlayerLookupName(rawName);
  if (!raw) return false;
  if (squad.some((player) => normalizePlayerLookupName(player.name) === raw)) return true;

  const matches = squad.filter((player) => {
    const parts = player.name.trim().split(/\s+/);
    if (parts.length < 2) return false;
    const initialAlias = `${parts[0][0]} ${parts[parts.length - 1]}`;
    return normalizePlayerLookupName(initialAlias) === raw;
  });
  return matches.length === 1;
}

function canonicalizeWorldcupScorer(
  event: GoalScorerEvent,
  internalId: string,
  scoringTeam: string,
  scoringTeamKey: string,
): GoalScorerEvent {
  const alias = findPlayerAlias({
    provider: "worldcup26.ir",
    matchId: internalId,
    eventMinute: event.minute,
    stoppageMinute: event.stoppageTime ?? null,
    scoringTeam,
    playerTeam: event.playerTeamName,
    rawName: event.playerName,
  });
  const rawNameIsRosterExact = teamRosterAcceptsRawName(scoringTeamKey, event.playerName);
  const playerName = alias?.canonical ?? (rawNameIsRosterExact ? event.playerName : "Scorer unavailable");

  return {
    ...event,
    teamName: scoringTeam,
    playerName,
    confidence: playerName === "Scorer unavailable" ? "low" : event.confidence,
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
  const homeScore = live?.homeScore ?? worldcupGame?.homeScore ?? null;
  const awayScore = live?.awayScore ?? worldcupGame?.awayScore ?? null;

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
    winner: live?.winner ?? (status === "FINISHED" ? winnerFromScore(homeScore, awayScore) : null),
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

  // PASS 1: Build preliminary snapshot using only primary data to resolve knockout participants
  const pass1WorldcupByMatch = worldcupGamesByInternalId(worldcupGames);
  const pass1Matches: Record<string, SerializableSnapshotMatch> = {};
  for (const match of MATCHES) {
    const internalId = matchSlug(match);
    const providerId = match.providerIds?.footballData ?? null;
    const live = providerId ? filteredLiveData.get(providerId) : undefined;
    const worldcupGame = pass1WorldcupByMatch.get(internalId);
    const canonicalLive = applyCanonicalMatchResultFallback(match, withCanonicalMatchState({
      match,
      live,
      worldcupGame,
      scorers: [],
      generatedAt,
    }) ?? undefined, generatedAt) ?? null;
    
    pass1Matches[internalId] = {
      match,
      internalId,
      providerMatchId: providerId,
      status: toSnapshotStatus(canonicalLive ?? undefined),
      homeScore: canonicalLive?.homeScore ?? null,
      awayScore: canonicalLive?.awayScore ?? null,
      scorers: [],
      goalEventCompleteness: { expectedGoalCount: 0, normalizedGoalEventCount: 0, missingGoalEventCount: 0, isGoalEventDataComplete: true, completenessReason: "event-data-unavailable" },
      sourceUpdatedAt: null,
      providerUpdatedAt: null,
      live: canonicalLive,
    };
  }
  const resolvedParticipants = buildKnockoutResolution(pass1Matches);

  // PASS 2: Match secondary provider games using resolved participants and build final snapshot
  const worldcupByMatch = worldcupGamesByInternalId(worldcupGames, resolvedParticipants);
  const matches: Record<string, SerializableSnapshotMatch> = {};
  const scorerEventsByMatch = new Map<string, GoalScorerEvent[]>();
  const canonicalLiveData = new Map<number, LiveMatchData>();

  for (const match of MATCHES) {
    const internalId = matchSlug(match);
    const providerId = match.providerIds?.footballData ?? null;
    const live = providerId ? filteredLiveData.get(providerId) : undefined;
    const worldcupGame = worldcupByMatch.get(internalId);
    const scorers = scorersFromWorldcupGame(match, worldcupGame, resolvedParticipants);
    const canonicalLive = applyCanonicalMatchResultFallback(match, withCanonicalMatchState({
      match,
      live,
      worldcupGame,
      scorers,
      generatedAt,
    }) ?? undefined, generatedAt) ?? null;
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
      confidence: event.playerName && !/^Scorer (unavailable|pending)$/i.test(event.playerName) ? "high" : "low",
    }));
    if (canonicalScorers.length > 0) scorerEventsByMatch.set(internalId, canonicalScorers);

    const status = toSnapshotStatus(canonicalLive ?? undefined);
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
  syncLiveGoalLedgers(matches, canonicalLiveData, scorerEventsByMatch);

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

export function getTournamentLiveSnapshot(): Promise<TournamentLiveSnapshot> {
  return buildTournamentLiveSnapshot({
    liveData: new Map(),
    worldcupGames: null,
    generatedAt: new Date().toISOString(),
    primaryProviderOk: false,
    secondaryProviderOk: false,
    primaryProviderFetchedAt: null,
    secondaryProviderFetchedAt: null,
    skipEnrichment: true,
  }).then(base => {
    const nowMs = Date.now();
    const matches: Record<string, SerializableSnapshotMatch> = {};
    for (const [id, m] of Object.entries(base.matches)) {
      const kickoffPassed = matchUtcDate(m.match).getTime() <= nowMs;
      const hasResolvedScore = m.status === "FINISHED" && m.homeScore !== null && m.awayScore !== null;
      matches[id] = kickoffPassed && !hasResolvedScore ? { ...m, liveDataUnavailable: true } : m;
    }
    return { ...base, matches, isFallback: true };
  });
}
