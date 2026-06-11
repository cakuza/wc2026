/**
 * Tournament-level stats computed from confirmed FINISHED match scores only.
 * Player stats only computed when provider event data is available.
 */

import { MATCHES } from "./matches";
import type { LiveMatchData } from "./liveMatchData";
import type { StandingRow } from "./groupStandings";

export type MatchResult = {
  homeKey: string;
  awayKey: string;
  homeScore: number;
  awayScore: number;
};

export type TournamentStats = {
  matchesPlayed: number;
  totalGoals: number;
  averageGoalsPerMatch: number;
  highestScoringMatch: (MatchResult & { totalGoals: number }) | null;
  biggestWin: (MatchResult & { margin: number }) | null;
  cleanSheets: number;
  lastSyncedAt: string | null;
};

export type TeamLeaderboard = { teamKey: string; value: number };

export type TeamLeaderboards = {
  topScoringTeams: TeamLeaderboard[];
  mostPoints: TeamLeaderboard[];
  mostWins: TeamLeaderboard[];
};

export type PlayerGoalStat = {
  playerName: string;
  teamName: string | null;
  goals: number;
};

export function computeTournamentStats(
  liveData: ReadonlyMap<number, LiveMatchData>,
): TournamentStats {
  let matchesPlayed = 0;
  let totalGoals = 0;
  let cleanSheets = 0;
  let highestScoringMatch: TournamentStats["highestScoringMatch"] = null;
  let biggestWin: TournamentStats["biggestWin"] = null;
  let lastSyncedAt: string | null = null;

  for (const match of MATCHES) {
    const pid = match.providerIds?.footballData;
    if (!pid) continue;

    const live = liveData.get(pid);
    if (!live) continue;
    if (live.status !== "FINISHED") continue;
    if (live.homeScore === null || live.awayScore === null) continue;

    const hg = live.homeScore;
    const ag = live.awayScore;
    const total = hg + ag;
    const margin = Math.abs(hg - ag);

    matchesPlayed++;
    totalGoals += total;
    if (hg === 0) cleanSheets++; // away team kept a clean sheet
    if (ag === 0) cleanSheets++; // home team kept a clean sheet

    if (!highestScoringMatch || total > highestScoringMatch.totalGoals) {
      highestScoringMatch = {
        homeKey: match.homeKey, awayKey: match.awayKey,
        homeScore: hg, awayScore: ag, totalGoals: total,
      };
    }

    if (margin > 0 && (!biggestWin || margin > biggestWin.margin)) {
      biggestWin = {
        homeKey: match.homeKey, awayKey: match.awayKey,
        homeScore: hg, awayScore: ag, margin,
      };
    }

    if (live.lastSyncedAt && (!lastSyncedAt || live.lastSyncedAt > lastSyncedAt)) {
      lastSyncedAt = live.lastSyncedAt;
    }
  }

  const avg =
    matchesPlayed > 0
      ? Math.round((totalGoals / matchesPlayed) * 10) / 10
      : 0;

  return {
    matchesPlayed,
    totalGoals,
    averageGoalsPerMatch: avg,
    highestScoringMatch,
    biggestWin,
    cleanSheets,
    lastSyncedAt,
  };
}

/** Compute team leaderboards from group standings. Only includes teams that have played. */
export function computeTeamLeaderboards(
  standings: Record<string, StandingRow[]>,
): TeamLeaderboards {
  const allRows = Object.values(standings).flat().filter((r) => r.played > 0);

  const topScoringTeams = [...allRows]
    .sort((a, b) => b.goalsFor - a.goalsFor || b.points - a.points)
    .slice(0, 5)
    .map((r) => ({ teamKey: r.teamKey, value: r.goalsFor }));

  const mostPoints = [...allRows]
    .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference)
    .slice(0, 5)
    .map((r) => ({ teamKey: r.teamKey, value: r.points }));

  const mostWins = [...allRows]
    .sort((a, b) => b.wins - a.wins || b.points - a.points)
    .slice(0, 5)
    .map((r) => ({ teamKey: r.teamKey, value: r.wins }));

  return { topScoringTeams, mostPoints, mostWins };
}

/** Compile top scorers from event data. Only counts when eventDataAvailable = true. */
export function computeTopScorers(
  liveData: ReadonlyMap<number, LiveMatchData>,
): PlayerGoalStat[] {
  const scorerMap = new Map<string, PlayerGoalStat>();

  for (const data of liveData.values()) {
    if (!data.eventDataAvailable || !data.goals) continue;
    for (const goal of data.goals) {
      if (!goal.playerName || goal.type === "OWN_GOAL") continue;
      const key = goal.playerName;
      if (!scorerMap.has(key)) {
        scorerMap.set(key, { playerName: goal.playerName, teamName: goal.teamName, goals: 0 });
      }
      scorerMap.get(key)!.goals++;
    }
  }

  return [...scorerMap.values()]
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 10);
}
