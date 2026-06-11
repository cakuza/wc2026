/**
 * Tournament-level stats computed from confirmed FINISHED match scores only.
 * No player/event data — only what can be derived from final scorelines.
 */

import { MATCHES } from "./matches";
import type { LiveMatchData } from "./liveMatchData";

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
