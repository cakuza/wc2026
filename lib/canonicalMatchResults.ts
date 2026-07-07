import { matchUtcDate, type Match } from "./matches";
import { getGoalEventCompleteness } from "./goalEventCompleteness";
import type { PeriodScore } from "./footballDataScore";
import type { LiveMatchData } from "./liveMatchData";

type CompletedResult = {
  homeScore: number;
  awayScore: number;
  winner: NonNullable<LiveMatchData["winner"]>;
  scoreDuration: "REGULAR" | "PENALTY_SHOOTOUT";
  confirmedAt: string;
  penaltyShootoutScore?: PeriodScore;
};

const COMPLETED_KNOCKOUT_RESULTS: Readonly<Record<number, CompletedResult>> = {
  74: {
    homeScore: 1,
    awayScore: 1,
    winner: "AWAY_TEAM",
    scoreDuration: "PENALTY_SHOOTOUT",
    confirmedAt: "2026-06-29T22:00:00.000Z",
    penaltyShootoutScore: { home: 3, away: 4 },
  },
  75: {
    homeScore: 1,
    awayScore: 1,
    winner: "AWAY_TEAM",
    scoreDuration: "PENALTY_SHOOTOUT",
    confirmedAt: "2026-06-29T23:30:00.000Z",
    penaltyShootoutScore: { home: 2, away: 3 },
  },
  85: { homeScore: 2, awayScore: 0, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-07-03T05:30:00.000Z" },
  87: { homeScore: 1, awayScore: 0, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-07-04T03:30:00.000Z" },
  88: {
    homeScore: 1,
    awayScore: 1,
    winner: "AWAY_TEAM",
    scoreDuration: "PENALTY_SHOOTOUT",
    confirmedAt: "2026-07-03T20:30:00.000Z",
    penaltyShootoutScore: { home: 2, away: 4 },
  },
  89: { homeScore: 0, awayScore: 1, winner: "AWAY_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-07-04T23:00:00.000Z" },
  90: { homeScore: 0, awayScore: 3, winner: "AWAY_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-07-04T19:00:00.000Z" },
  91: { homeScore: 1, awayScore: 2, winner: "AWAY_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-07-05T20:00:00.000Z" },
  94: { homeScore: 4, awayScore: 1, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-07-06T23:00:00.000Z" },
};

function matchNumber(match: Match): number | null {
  return "matchNumber" in match ? match.matchNumber : null;
}

export function hasCanonicalCompletedResult(match: Match): boolean {
  const num = matchNumber(match);
  return num !== null && COMPLETED_KNOCKOUT_RESULTS[num] !== undefined;
}

function shouldUseCompletedFallback(live: LiveMatchData | undefined, result: CompletedResult): boolean {
  if (!live) return true;
  if (live.status !== "FINISHED") return true;
  if (live.homeScore !== result.homeScore || live.awayScore !== result.awayScore) return true;
  if (live.winner !== result.winner) return true;
  if (result.scoreDuration === "PENALTY_SHOOTOUT" && !live.penaltyShootoutScore) return true;
  return false;
}

function resultIsConfirmed(result: CompletedResult, generatedAt: string): boolean {
  const generatedAtMs = Date.parse(generatedAt);
  const confirmedAtMs = Date.parse(result.confirmedAt);
  return Number.isFinite(generatedAtMs) && Number.isFinite(confirmedAtMs) && generatedAtMs >= confirmedAtMs;
}

function isNonScoreBearingStatus(status: LiveMatchData["status"]): boolean {
  return (
    status === "SCHEDULED" ||
    status === "TIMED" ||
    status === "UNKNOWN" ||
    status === "POSTPONED" ||
    status === "CANCELLED"
  );
}

function stripUnconfirmedScore(live: LiveMatchData, generatedAt: string): LiveMatchData {
  return {
    ...live,
    homeScore: null,
    awayScore: null,
    winner: null,
    scoreDuration: undefined,
    regularTimeScore: undefined,
    extraTimeScore: undefined,
    penaltyShootoutScore: undefined,
    lastSyncedAt: live.lastSyncedAt ?? generatedAt,
    goalEventCompleteness: getGoalEventCompleteness({
      homeScore: null,
      awayScore: null,
      goals: live.goals ?? [],
      eventDataAvailable: Boolean(live.eventDataAvailable),
    }),
  };
}

export function applyCanonicalMatchResultFallback(
  match: Match,
  live: LiveMatchData | undefined,
  generatedAt: string,
): LiveMatchData | undefined {
  const providerId = match.providerIds?.footballData;
  if (!providerId) return live;

  const num = matchNumber(match);
  const completed = num !== null ? COMPLETED_KNOCKOUT_RESULTS[num] : undefined;
  if (completed && resultIsConfirmed(completed, generatedAt) && shouldUseCompletedFallback(live, completed)) {
    const goals = live?.goals ?? [];
    return {
      ...(live ?? {
        provider: "football-data.org",
        providerMatchId: providerId,
        eventDataAvailable: false,
      }),
      provider: "football-data.org",
      providerMatchId: providerId,
      status: "FINISHED",
      homeScore: completed.homeScore,
      awayScore: completed.awayScore,
      winner: completed.winner,
      scoreDuration: completed.scoreDuration,
      penaltyShootoutScore: completed.penaltyShootoutScore ?? live?.penaltyShootoutScore,
      lastSyncedAt: live?.lastSyncedAt ?? generatedAt,
      goalEventCompleteness: getGoalEventCompleteness({
        homeScore: completed.homeScore,
        awayScore: completed.awayScore,
        goals,
        eventDataAvailable: Boolean(live?.eventDataAvailable),
      }),
      goals,
    };
  }

  const generatedAtMs = Date.parse(generatedAt);
  const kickoffMs = matchUtcDate(match).getTime();
  const isPreKickoff = Number.isFinite(generatedAtMs) && generatedAtMs < kickoffMs;
  if (live && isNonScoreBearingStatus(live.status) && (live.homeScore !== null || live.awayScore !== null || live.winner !== null)) {
    return stripUnconfirmedScore(live, generatedAt);
  }
  if (
    live &&
    isPreKickoff &&
    (live.status === "IN_PLAY" || live.status === "PAUSED") &&
    live.homeScore === null &&
    live.awayScore === null
  ) {
    return {
      ...live,
      status: "SCHEDULED",
      lastSyncedAt: live.lastSyncedAt ?? generatedAt,
    };
  }

  return live;
}
