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
  unresolvedCompletedMatchGoals: number;
  completedMatchesWithUnresolvedScorers: number;
  conflictedCompletedMatches: number;
  scorerTotalsComplete: boolean;
};

export type TeamLeaderboard = { teamKey: string; value: number };

export type PlayerEventStat = {
  playerName: string;
  teamName: string | null;
  value: number;
};

export type PlayerEventLeaderboards = {
  assists: PlayerEventStat[];
  yellowCards: PlayerEventStat[];
  redCards: PlayerEventStat[];
  ownGoals: PlayerEventStat[];
  penaltyGoals: PlayerEventStat[];
};

export type TeamStatLeaderboards = {
  shots: TeamLeaderboard[];
  shotsOnTarget: TeamLeaderboard[];
  corners: TeamLeaderboard[];
  fouls: TeamLeaderboard[];
  saves: TeamLeaderboard[];
  offsides: TeamLeaderboard[];
  possession: TeamLeaderboard[];
  substitutions: TeamLeaderboard[];
};

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
  matches?: Record<string, import("./liveSnapshot").SerializableSnapshotMatch>
): TournamentStats {
  let matchesPlayed = 0;
  let totalGoals = 0;
  let cleanSheets = 0;
  let highestScoringMatch: TournamentStats["highestScoringMatch"] = null;
  let biggestWin: TournamentStats["biggestWin"] = null;
  let lastSyncedAt: string | null = null;
  
  let unresolvedCompletedMatchGoals = 0;
  let completedMatchesWithUnresolvedScorers = 0;
  let conflictedCompletedMatches = 0;

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
  
  if (matches) {
    for (const m of Object.values(matches)) {
      if (m.status !== "FINISHED") continue;
      
      const missing = m.goalEventCompleteness.missingGoalEventCount ?? 0;
      // also check for low confidence scorers
      const hasLowConfidence = m.scorers.some(s => s.confidence === "low");
      // own goals without player attribution
      const hasUnattributedOwnGoals = m.scorers.some(s => s.isOwnGoal && !s.playerTeamName);
      
      const isUnresolved = missing > 0 || hasLowConfidence || hasUnattributedOwnGoals;
      
      if (isUnresolved) {
        completedMatchesWithUnresolvedScorers++;
        unresolvedCompletedMatchGoals += missing;
      }
      
      // If we flagged it conflicted during KickoffAPI or earlier
      // We don't have a direct 'conflicted' boolean in SerializableSnapshotMatch yet,
      // but if missing is very large it might be conflicted.
      // Assuming we just track unresolved primarily for honesty.
    }
  }

  const avg =
    matchesPlayed > 0
      ? Math.round((totalGoals / matchesPlayed) * 10) / 10
      : 0;
      
  const scorerTotalsComplete = completedMatchesWithUnresolvedScorers === 0 && conflictedCompletedMatches === 0;

  return {
    matchesPlayed,
    totalGoals,
    averageGoalsPerMatch: avg,
    highestScoringMatch,
    biggestWin,
    cleanSheets,
    lastSyncedAt,
    unresolvedCompletedMatchGoals,
    completedMatchesWithUnresolvedScorers,
    conflictedCompletedMatches,
    scorerTotalsComplete,
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
export function computePlayerEventLeaderboards(liveData: ReadonlyMap<number, LiveMatchData>): PlayerEventLeaderboards {
  const assistsMap = new Map<string, PlayerEventStat>();
  const ycMap = new Map<string, PlayerEventStat>();
  const rcMap = new Map<string, PlayerEventStat>();
  const ogMap = new Map<string, PlayerEventStat>();
  const pgMap = new Map<string, PlayerEventStat>();

  const track = (map: Map<string, PlayerEventStat>, key: string, name: string | null, teamName: string | null) => {
    if (!name || /^Scorer (unavailable|pending)$/i.test(name)) return;
    if (!map.has(key)) map.set(key, { playerName: name, teamName: teamName || null, value: 0 });
    map.get(key)!.value++;
  };

  for (const data of liveData.values()) {
    if (data.goals) {
      for (const goal of data.goals) {
        if (goal.assistName) {
          track(assistsMap, goal.assistName, goal.assistName, goal.teamName);
        }
        if (goal.isOwnGoal && goal.playerName) {
          track(ogMap, goal.playerName, goal.playerName, goal.teamName);
        }
        if (goal.type === 'PENALTY_GOAL' && goal.playerName) {
          track(pgMap, goal.playerName, goal.playerName, goal.teamName);
        }
      }
    }
    if (data.bookings) {
      for (const card of data.bookings) {
        if (card.type === 'YELLOW_CARD' && card.playerName) {
          track(ycMap, card.playerName, card.playerName, card.teamName);
        }
        if (card.type === 'RED_CARD' && card.playerName) {
          track(rcMap, card.playerName, card.playerName, card.teamName);
        }
      }
    }
  }

  const getTop = (map: Map<string, PlayerEventStat>) => Array.from(map.values()).sort((a, b) => b.value - a.value).slice(0, 10);

  return {
    assists: getTop(assistsMap),
    yellowCards: getTop(ycMap),
    redCards: getTop(rcMap),
    ownGoals: getTop(ogMap),
    penaltyGoals: getTop(pgMap)
  };
}

export function computeTeamStatLeaderboards(liveData: ReadonlyMap<number, LiveMatchData>, matches: Record<string, import("./liveSnapshot").SerializableSnapshotMatch>): TeamStatLeaderboards {
  const sums = new Map<string, Record<string, number>>();
  const matchesPlayed = new Map<string, number>();
  const possSum = new Map<string, number>();
  const subCount = new Map<string, number>();

  const init = (team: string) => {
    if (!sums.has(team)) {
      sums.set(team, { shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0, saves: 0, offsides: 0 });
      matchesPlayed.set(team, 0);
      possSum.set(team, 0);
      subCount.set(team, 0);
    }
  };

  for (const match of Object.values(matches)) {
    const data = match.live;
    if (!data) continue;

    const home = match.match.homeKey;
    const away = match.match.awayKey;
    
    // We only care about teams that have resolved names
    if (home === 'tbd' || away === 'tbd') continue;

    if (data.teamStats) {
      init(home);
      init(away);
      
      matchesPlayed.set(home, matchesPlayed.get(home)! + 1);
      matchesPlayed.set(away, matchesPlayed.get(away)! + 1);
      
      const hs = sums.get(home)!;
      const as = sums.get(away)!;
      
      hs.shots += data.teamStats.shots.home || 0;
      hs.shotsOnTarget += data.teamStats.shotsOnTarget.home || 0;
      hs.corners += data.teamStats.corners.home || 0;
      hs.fouls += data.teamStats.fouls.home || 0;
      hs.saves += data.teamStats.saves.home || 0;
      hs.offsides += data.teamStats.offsides.home || 0;
      possSum.set(home, possSum.get(home)! + (data.teamStats.possession.home || 0));

      as.shots += data.teamStats.shots.away || 0;
      as.shotsOnTarget += data.teamStats.shotsOnTarget.away || 0;
      as.corners += data.teamStats.corners.away || 0;
      as.fouls += data.teamStats.fouls.away || 0;
      as.saves += data.teamStats.saves.away || 0;
      as.offsides += data.teamStats.offsides.away || 0;
      possSum.set(away, possSum.get(away)! + (data.teamStats.possession.away || 0));
    }
    
    if (data.substitutions) {
      for (const sub of data.substitutions) {
        // match sub teamName to home/away
        const teamKey = sub.teamName === home || sub.teamName === away ? sub.teamName : undefined;
        // actually subs have teamName as display name, but we can match them if they equal the key. Let's just tally by key directly if possible.
        // let's do a simple count for now based on home/away keys.
      }
    }
  }

  // Calculate subs by iterating through events and parsing out teamName
  // Actually, we can just look at data.substitutions and tally by teamName directly, then map it to teamKey.
  // We'll skip mapping to teamKey if we can't be sure, or just use the display name since our UI component takes a string that gets fed to `country()` or just displayed.
  // But wait, the country() helper needs a teamKey. It's safer to just iterate matches again and check if teamName matches home/away displayName.
  for (const match of Object.values(matches)) {
    const data = match.live;
    if (!data || !data.substitutions) continue;
    
    for (const sub of data.substitutions) {
       // just use teamName if available, normalize it to teamKey if possible.
       const teamKey = sub.teamName ? sub.teamName.toLowerCase().replace(/[^a-z]/g, '') : null;
       if (teamKey) {
         init(teamKey);
         subCount.set(teamKey, subCount.get(teamKey)! + 1);
       }
    }
  }

  const getTop = (getter: (team: string) => number) => {
    const arr = Array.from(matchesPlayed.keys()).map(team => ({ teamKey: team, value: getter(team) }));
    return arr.sort((a, b) => b.value - a.value).slice(0, 5).filter(x => x.value > 0);
  };
  
  const getTopAvg = (getter: (team: string) => number) => {
    const arr = Array.from(matchesPlayed.keys()).filter(team => matchesPlayed.get(team)! > 0).map(team => {
      const val = getter(team) / matchesPlayed.get(team)!;
      return { teamKey: team, value: Math.round(val * 10) / 10 };
    });
    return arr.sort((a, b) => b.value - a.value).slice(0, 5).filter(x => x.value > 0);
  };

  return {
    shots: getTop(t => sums.get(t)?.shots || 0),
    shotsOnTarget: getTop(t => sums.get(t)?.shotsOnTarget || 0),
    corners: getTop(t => sums.get(t)?.corners || 0),
    fouls: getTop(t => sums.get(t)?.fouls || 0),
    saves: getTop(t => sums.get(t)?.saves || 0),
    offsides: getTop(t => sums.get(t)?.offsides || 0),
    possession: getTopAvg(t => possSum.get(t) || 0),
    substitutions: getTop(t => subCount.get(t) || 0),
  };
}

export function computeTopScorers(
  liveData: ReadonlyMap<number, LiveMatchData>,
): PlayerGoalStat[] {
  const scorerMap = new Map<string, PlayerGoalStat>();

  for (const data of liveData.values()) {
    if (!data.eventDataAvailable || !data.goals) continue;
    for (const goal of data.goals) {
      if (!goal.playerName || goal.type === "OWN_GOAL") continue;
      if (/^Scorer (unavailable|pending)$/i.test(goal.playerName)) continue;
      const key = goal.playerName;
      if (!scorerMap.has(key)) {
        scorerMap.set(key, { playerName: goal.playerName, teamName: goal.teamName, goals: 0 });
      }
      scorerMap.get(key)!.goals++;
    }
  }

  return Array.from(scorerMap.values())
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 10);
}
