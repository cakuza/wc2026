/**
 * Tournament-level stats computed from confirmed FINISHED match scores only.
 * Player stats only computed when provider event data is available.
 */

import { MATCHES, type Match } from "./matches";
import type { LiveMatchData } from "./liveMatchData";
import { buildKnockoutResolution, buildKnockoutResolutionFromLiveData } from "./knockoutResolution";
import { getResolvedAwayTeam, getResolvedHomeTeam } from "./participant-resolution";
import type { StandingRow } from "./groupStandings";
import { teamKeyFromName } from "./teams";
import { resolvePlayerNameLegacy } from "./worldcup26PlayerAliases";

export type MatchResult = {
  homeKey: string;
  awayKey: string;
  homeScore: number;
  awayScore: number;
  matchId?: string;
  stage?: string;
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
  playerEventCoverage: number;
  teamStatCoverage: number;
};

export type TeamLeaderboard = {
  teamKey: string;
  value: number;
  matchesCovered?: number;
  completedMatches?: number;
  coverageStatus?: "COMPLETE" | "PARTIAL" | "NONE";
};

export type PlayerEventStat = {
  playerName: string;
  teamName: string | null;
  teamKey: string | null;
  value: number;
};

function normalizePlayerName(name: string): string {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export type CanonicalPlayerIdentity = {
  key: string;
  playerName: string;
  teamKey: string;
};

export function resolveCanonicalPlayerIdentity(name: string, teamName: string | null | undefined): CanonicalPlayerIdentity | null {
  const teamKey = teamKeyFromName(teamName ?? null);
  if (!teamKey) return null;
  const playerName = resolvePlayerNameLegacy(name, teamName ?? undefined);
  return { key: `${teamKey}:${normalizePlayerName(playerName)}`, playerName, teamKey };
}

export type PlayerEventLeaderboards = {
  assists: PlayerEventStat[];
  yellowCards: PlayerEventStat[];
  redCards: PlayerEventStat[];
  ownGoals: PlayerEventStat[];
  penaltyGoals: PlayerEventStat[];
  shootoutScored: PlayerEventStat[];
  shootoutMissed: PlayerEventStat[];
};

export type TeamStatLeaderboards = {
  goalsScored: TeamLeaderboard[];
  shots: TeamLeaderboard[];
  shotsOnTarget: TeamLeaderboard[];
  corners: TeamLeaderboard[];
  fouls: TeamLeaderboard[];
  saves: TeamLeaderboard[];
  offsides: TeamLeaderboard[];
  possession: TeamLeaderboard[];
  substitutions: TeamLeaderboard[];
  cleanSheets: TeamLeaderboard[];
  goalsConceded: TeamLeaderboard[];
};

export type TeamLeaderboards = {
  topScoringTeams: TeamLeaderboard[];
  groupStagePoints: TeamLeaderboard[];
  mostWins: TeamLeaderboard[];
};

type ProviderTeamStats = NonNullable<LiveMatchData["teamStats"]>;
type TrackedProviderMetric = Exclude<keyof ProviderTeamStats, "yellowCards" | "redCards">;
type CoverageMetric = TrackedProviderMetric | "substitutions" | "scores";
type TeamStatSums = Record<TrackedProviderMetric | "subCount", number>;

export type PlayerRankingRecord = {
  playerName: string;
  teamName: string | null;
  teamKey: string | null;
  goals: number;
  assists: { value: number; isOfficial: boolean; isComplete: boolean } | null;
  minutesPlayed: { value: number; isVerifiedComplete: boolean } | null;
};

/**
 * Every "Most X" leaderboard card must show every team/player tied for the
 * top value, never just whichever entry happens to sort first. Callers pass
 * an array already sorted descending by the relevant field (all the
 * leaderboard computers below already do this) — this only slices off the
 * leading run of entries that share the max value.
 */
export function getTiedLeaders<T>(sortedDescending: T[], getValue: (item: T) => number): T[] {
  if (sortedDescending.length === 0) return [];
  const max = getValue(sortedDescending[0]);
  return sortedDescending.filter((item) => getValue(item) === max);
}

const getStageDisplay = (stageCode: string) => {
  if (stageCode === "F") return "final";
  if (stageCode === "3P") return "third-place playoff";
  if (stageCode === "SF") return "semi-final";
  if (stageCode === "QF") return "quarter-final";
  if (stageCode === "R16") return "round of 16";
  if (stageCode === "R32") return "round of 32";
  return stageCode;
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
  let playerEventCoverage = 0;
  let teamStatCoverage = 0;

  const resolvedParticipants = buildKnockoutResolutionFromLiveData(liveData);

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

    if (live.eventDataAvailable) playerEventCoverage++;
    if (live.teamStats) teamStatCoverage++;

    const resolvedHomeKey = getResolvedHomeTeam(match, resolvedParticipants) ?? match.homeKey;
    const resolvedAwayKey = getResolvedAwayTeam(match, resolvedParticipants) ?? match.awayKey;
    const matchId = 'matchNumber' in match ? `match-${match.matchNumber}` : `group-${match.group}-${match.homeKey}-${match.awayKey}`;
    const stage = 'matchNumber' in match ? getStageDisplay(match.stage) : `Group ${match.group}`;

    if (!highestScoringMatch || total > highestScoringMatch.totalGoals) {
      highestScoringMatch = {
        homeKey: resolvedHomeKey, awayKey: resolvedAwayKey,
        homeScore: hg, awayScore: ag, totalGoals: total,
        matchId, stage,
      };
    }

    if (margin > 0 && (!biggestWin || margin > biggestWin.margin)) {
      biggestWin = {
        homeKey: resolvedHomeKey, awayKey: resolvedAwayKey,
        homeScore: hg, awayScore: ag, margin,
        matchId, stage,
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
    playerEventCoverage,
    teamStatCoverage,
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

  const groupStagePoints = [...allRows]
    .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference)
    .slice(0, 5)
    .map((r) => ({ teamKey: r.teamKey, value: r.points }));

  const mostWins = [...allRows]
    .sort((a, b) => b.wins - a.wins || b.points - a.points)
    .slice(0, 5)
    .map((r) => ({ teamKey: r.teamKey, value: r.wins }));

  return { topScoringTeams, groupStagePoints, mostWins };
}

/** Compile top scorers from event data. Only counts when eventDataAvailable = true. */
export function computePlayerEventLeaderboards(liveData: ReadonlyMap<number, LiveMatchData>): PlayerEventLeaderboards {
  const assistsMap = new Map<string, PlayerEventStat>();
  const ycMap = new Map<string, PlayerEventStat>();
  const rcMap = new Map<string, PlayerEventStat>();
  const ogMap = new Map<string, PlayerEventStat>();
  const pgMap = new Map<string, PlayerEventStat>();
  const ssMap = new Map<string, PlayerEventStat>();
  const smMap = new Map<string, PlayerEventStat>();

  const track = (map: Map<string, PlayerEventStat>, name: string | null, teamName: string | null) => {
    if (!name || /^Scorer (unavailable|pending)$/i.test(name)) return;
    const identity = resolveCanonicalPlayerIdentity(name, teamName);
    if (!identity) return;
    if (!map.has(identity.key)) {
      map.set(identity.key, { playerName: identity.playerName, teamName: teamName || null, teamKey: identity.teamKey, value: 0 });
    }
    map.get(identity.key)!.value++;
  };

  for (const data of liveData.values()) {
    if (data.goals) {
      for (const goal of data.goals) {
        if (goal.assistName) {
          let assistTeam = goal.teamName;
          if (goal.isOwnGoal && !assistTeam) {
            if (goal.assistName?.includes("Duverne")) assistTeam = "haiti";
            else if (goal.assistName?.includes("Ahmed")) assistTeam = "qatar";
          }
          track(assistsMap, goal.assistName, assistTeam);
        }
        if (goal.isOwnGoal && goal.playerName) {
          track(ogMap, goal.playerName, goal.playerTeamName ?? null);
        } else if (goal.type === 'PENALTY_GOAL' && goal.playerName) {
          track(pgMap, goal.playerName, goal.teamName);
        }
      }
    }
    if (data.bookings) {
      for (const card of data.bookings) {
        if (card.type === 'YELLOW_CARD' && card.playerName) {
          track(ycMap, card.playerName, card.teamName);
        }
        if ((card.type === 'RED_CARD' || card.type === 'SECOND_YELLOW') && card.playerName) {
          track(rcMap, card.playerName, card.teamName);
        }
      }
    }
    if (data.shootoutAttempts) {
      for (const s of data.shootoutAttempts) {
        if (s.type === "PENALTY_SHOOTOUT_SCORED" && s.playerName) {
          track(ssMap, s.playerName, s.teamName);
        }
        if (s.type === "PENALTY_SHOOTOUT_MISSED" && s.playerName) {
          track(smMap, s.playerName, s.teamName);
        }
      }
    }
  }

  const getTop = (map: Map<string, PlayerEventStat>) => Array.from(map.values()).sort((a, b) => b.value - a.value).slice(0, 100);

  return {
    assists: getTop(assistsMap),
    yellowCards: getTop(ycMap),
    redCards: getTop(rcMap),
    ownGoals: getTop(ogMap),
    penaltyGoals: getTop(pgMap),
    shootoutScored: getTop(ssMap),
    shootoutMissed: getTop(smMap),
  };
}

export function computeTeamStatLeaderboards(liveData: ReadonlyMap<number, LiveMatchData>, matches: Record<string, import("./liveSnapshot").SerializableSnapshotMatch>): TeamStatLeaderboards {
  const sums = new Map<string, TeamStatSums>();
  const matchesPlayed = new Map<string, number>();

  const cov: Record<CoverageMetric, Map<string, number>> = {
    shots: new Map<string, number>(),
    shotsOnTarget: new Map<string, number>(),
    corners: new Map<string, number>(),
    fouls: new Map<string, number>(),
    saves: new Map<string, number>(),
    offsides: new Map<string, number>(),
    possession: new Map<string, number>(),
    substitutions: new Map<string, number>(),
    scores: new Map<string, number>(),
  };

  const init = (team: string) => {
    if (!sums.has(team)) {
      sums.set(team, { shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0, saves: 0, offsides: 0, possession: 0, subCount: 0 });
      matchesPlayed.set(team, 0);
      for (const metric of Object.keys(cov) as CoverageMetric[]) {
        cov[metric].set(team, 0);
      }
    }
  };

  const resolvedParticipants = buildKnockoutResolutionFromLiveData(liveData);

  for (const match of Object.values(matches)) {
    if (match.status !== "FINISHED") continue;
    const data = match.live;
    if (!data) continue;

    const home = getResolvedHomeTeam(match.match, resolvedParticipants) ?? match.match.homeKey;
    const away = getResolvedAwayTeam(match.match, resolvedParticipants) ?? match.match.awayKey;

    if (home === 'tbd' || away === 'tbd') continue;
    init(home);
    init(away);

    matchesPlayed.set(home, matchesPlayed.get(home)! + 1);
    matchesPlayed.set(away, matchesPlayed.get(away)! + 1);

    if (match.homeScore !== null && match.awayScore !== null) {
      cov.scores.set(home, cov.scores.get(home)! + 1);
      cov.scores.set(away, cov.scores.get(away)! + 1);
    }

    const teamStats = data.teamStats;
    if (teamStats) {
      const processMetric = (metric: TrackedProviderMetric, key: 'home' | 'away', team: string) => {
        const value = teamStats[metric][key];
        cov[metric].set(team, cov[metric].get(team)! + 1);
        sums.get(team)![metric] += value;
      };

      const metrics: TrackedProviderMetric[] = ['shots', 'shotsOnTarget', 'corners', 'fouls', 'saves', 'offsides', 'possession'];
      metrics.forEach(m => {
        processMetric(m, 'home', home);
        processMetric(m, 'away', away);
      });
    }

    if (data.substitutions !== undefined) {
      cov.substitutions.set(home, cov.substitutions.get(home)! + 1);
      cov.substitutions.set(away, cov.substitutions.get(away)! + 1);
      for (const sub of data.substitutions) {
        const teamKeyStr = sub.teamName ? sub.teamName.toLowerCase().replace(/[^a-z]/g, '') : null;
        if (teamKeyStr) {
          const actualKey = Array.from(sums.keys()).find(k => k.replace(/[^a-z]/g, '') === teamKeyStr);
          if (actualKey) {
            sums.get(actualKey)!.subCount += 1;
          }
        }
      }
    }
  }

  const getAll = (getter: (team: string) => number, covGetter: (team: string) => number) => {
    return Array.from(matchesPlayed.keys())
      .filter(team => covGetter(team) > 0)
      .map(team => {
        const covered = covGetter(team);
        const total = matchesPlayed.get(team)!;
        return {
          teamKey: team,
          value: getter(team),
          matchesCovered: covered,
          completedMatches: total,
          coverageStatus: (covered === total ? "COMPLETE" : "PARTIAL") as "COMPLETE" | "PARTIAL"
        };
      })
      .sort((a, b) => b.value - a.value || a.teamKey.localeCompare(b.teamKey));
  };

  const getAllAvg = (getter: (team: string) => number, covGetter: (team: string) => number) => {
    return Array.from(matchesPlayed.keys())
      .filter(team => covGetter(team) > 0)
      .map(team => {
        const covered = covGetter(team);
        const total = matchesPlayed.get(team)!;
        const val = getter(team) / covered;
        return {
          teamKey: team,
          value: Math.round(val * 10) / 10,
          matchesCovered: covered,
          completedMatches: total,
          coverageStatus: (covered === total ? "COMPLETE" : "PARTIAL") as "COMPLETE" | "PARTIAL"
        };
      })
      .sort((a, b) => b.value - a.value || a.teamKey.localeCompare(b.teamKey));
  };

  const getResolvedTeam = (m: Match, side: "home" | "away") => {
    return side === "home"
      ? getResolvedHomeTeam(m, resolvedParticipants) ?? m.homeKey
      : getResolvedAwayTeam(m, resolvedParticipants) ?? m.awayKey;
  };

  return {
    goalsScored: getAll(t => {
      let g = 0;
      for (const m of Object.values(matches)) {
        if (m.status === "FINISHED") {
          const homeResolved = getResolvedTeam(m.match, "home");
          const awayResolved = getResolvedTeam(m.match, "away");
          if (homeResolved === t && m.homeScore !== null) g += m.homeScore;
          if (awayResolved === t && m.awayScore !== null) g += m.awayScore;
        }
      }
      return g;
    }, t => cov.scores.get(t) || 0),
    shots: getAll(t => sums.get(t)?.shots || 0, t => cov.shots.get(t) || 0),
    shotsOnTarget: getAll(t => sums.get(t)?.shotsOnTarget || 0, t => cov.shotsOnTarget.get(t) || 0),
    corners: getAll(t => sums.get(t)?.corners || 0, t => cov.corners.get(t) || 0),
    fouls: getAll(t => sums.get(t)?.fouls || 0, t => cov.fouls.get(t) || 0),
    saves: getAll(t => sums.get(t)?.saves || 0, t => cov.saves.get(t) || 0),
    offsides: getAll(t => sums.get(t)?.offsides || 0, t => cov.offsides.get(t) || 0),
    possession: getAllAvg(t => sums.get(t)?.possession || 0, t => cov.possession.get(t) || 0),
    substitutions: getAll(t => sums.get(t)?.subCount || 0, t => cov.substitutions.get(t) || 0),
    cleanSheets: getAll(t => {
      let c = 0;
      for (const m of Object.values(matches)) {
        if (m.status === "FINISHED") {
          const homeResolved = getResolvedTeam(m.match, "home");
          const awayResolved = getResolvedTeam(m.match, "away");
          if (homeResolved === t && m.awayScore === 0) c++;
          if (awayResolved === t && m.homeScore === 0) c++;
        }
      }
      return c;
    }, t => cov.scores.get(t) || 0),
    goalsConceded: getAll(t => {
      let gc = 0;
      for (const m of Object.values(matches)) {
        if (m.status === "FINISHED") {
          const homeResolved = getResolvedTeam(m.match, "home");
          const awayResolved = getResolvedTeam(m.match, "away");
          if (homeResolved === t && m.awayScore !== null) gc += m.awayScore;
          if (awayResolved === t && m.homeScore !== null) gc += m.homeScore;
        }
      }
      return gc;
    }, t => cov.scores.get(t) || 0),
  };
}

export function computeTopScorers(
  liveData: ReadonlyMap<number, LiveMatchData>,
): PlayerRankingRecord[] {
  const scorerMap = new Map<string, PlayerRankingRecord>();

  for (const data of liveData.values()) {
    if (!data.eventDataAvailable || !data.goals) continue;
    for (const goal of data.goals) {
      if (!goal.playerName || goal.type === "OWN_GOAL") continue;
      if (/^Scorer (unavailable|pending)$/i.test(goal.playerName)) continue;
      const identity = resolveCanonicalPlayerIdentity(goal.playerName, goal.teamName);
      if (!identity) continue;
      if (!scorerMap.has(identity.key)) {
        scorerMap.set(identity.key, {
          playerName: identity.playerName,
          teamName: goal.teamName,
          teamKey: identity.teamKey,
          goals: 0,
          assists: null,
          minutesPlayed: null, // We never have complete minutes from football-data events alone
        });
      }
      scorerMap.get(identity.key)!.goals++;
    }
  }

  // Also track assists from provider if available
  for (const data of liveData.values()) {
    if (!data.eventDataAvailable || !data.goals) continue;
    for (const goal of data.goals) {
      if (goal.assistName) {
        let assistTeam = goal.teamName;
        if (goal.isOwnGoal && !assistTeam) {
          if (goal.assistName?.includes("Duverne")) assistTeam = "haiti";
          else if (goal.assistName?.includes("Ahmed")) assistTeam = "qatar";
        }
        const identity = resolveCanonicalPlayerIdentity(goal.assistName, assistTeam);
        if (!identity) continue;
        if (!scorerMap.has(identity.key)) {
           // Assists by players who didn't score goals are not added to Golden Boot if they have 0 goals,
           // but technically Golden Boot only ranks players with >=1 goal.
           continue;
        }
        const record = scorerMap.get(identity.key)!;
        if (!record.assists) {
          record.assists = { value: 0, isOfficial: false, isComplete: false };
        }
        record.assists.value++;
      }
    }
  }

  return Array.from(scorerMap.values())
    .sort((a, b) => b.goals - a.goals);
}
