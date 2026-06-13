/**
 * Pure group standings computation from confirmed FINISHED match scores.
 * Only matches with status === "FINISHED" and non-null scores are counted.
 */

import { MATCHES } from "./matches";
import { GROUPS } from "./teams";
import type { LiveMatchData } from "./liveMatchData";

export type StandingRow = {
  teamKey: string;
  rank?: number;
  rankLabel?: string;
  tieUnresolved?: boolean;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

/**
 * Compute standings for all groups.
 *
 * Sorting (MVP):
 *   1. points desc
 *   2. goalDifference desc
 *   3. goalsFor desc
 *   4. teamKey asc (safe tie-break — not FIFA official head-to-head)
 */
export function computeGroupStandings(
  liveData: ReadonlyMap<number, LiveMatchData>,
): Record<string, StandingRow[]> {
  // Initialise every team to zero.
  const rows: Record<string, StandingRow> = {};
  for (const teams of Object.values(GROUPS)) {
    for (const teamKey of teams) {
      rows[teamKey] = {
        teamKey,
        played: 0, wins: 0, draws: 0, losses: 0,
        goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
      };
    }
  }

  // Apply only FINISHED matches that have confirmed scores AND a provider mapping.
  for (const match of MATCHES) {
    const pid = match.providerIds?.footballData;
    if (!pid) continue;

    const live = liveData.get(pid);
    if (!live) continue;
    if (live.status !== "FINISHED") continue;
    if (live.homeScore === null || live.awayScore === null) continue;

    const home = rows[match.homeKey];
    const away = rows[match.awayKey];
    if (!home || !away) continue;

    const hg = live.homeScore;
    const ag = live.awayScore;

    home.played++; away.played++;
    home.goalsFor += hg; home.goalsAgainst += ag;
    away.goalsFor += ag; away.goalsAgainst += hg;
    home.goalDifference = home.goalsFor - home.goalsAgainst;
    away.goalDifference = away.goalsFor - away.goalsAgainst;

    if (hg > ag) {
      home.wins++; home.points += 3;
      away.losses++;
    } else if (hg < ag) {
      away.wins++; away.points += 3;
      home.losses++;
    } else {
      home.draws++; home.points++;
      away.draws++; away.points++;
    }
  }

  // Build sorted rows per group.
  const result: Record<string, StandingRow[]> = {};
  for (const [group, teams] of Object.entries(GROUPS)) {
    const groupRows = teams.map((key) => rows[key]).filter(Boolean);
    groupRows.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return 0;
    });
    let lastRank = 0;
    for (let i = 0; i < groupRows.length; i++) {
      const row = groupRows[i];
      const prev = groupRows[i - 1];
      const tiedWithPrev =
        prev &&
        prev.points === row.points &&
        prev.goalDifference === row.goalDifference &&
        prev.goalsFor === row.goalsFor &&
        prev.goalsAgainst === row.goalsAgainst &&
        prev.played === row.played &&
        prev.wins === row.wins &&
        prev.draws === row.draws &&
        prev.losses === row.losses;
      if (!tiedWithPrev) lastRank = i + 1;
      const tiedWithNext = groupRows[i + 1] &&
        groupRows[i + 1].points === row.points &&
        groupRows[i + 1].goalDifference === row.goalDifference &&
        groupRows[i + 1].goalsFor === row.goalsFor &&
        groupRows[i + 1].goalsAgainst === row.goalsAgainst &&
        groupRows[i + 1].played === row.played &&
        groupRows[i + 1].wins === row.wins &&
        groupRows[i + 1].draws === row.draws &&
        groupRows[i + 1].losses === row.losses;
      row.rank = lastRank;
      row.tieUnresolved = Boolean(tiedWithPrev || tiedWithNext);
      row.rankLabel = `${lastRank}${row.tieUnresolved ? "=" : ""}`;
    }
    result[group] = groupRows;
  }

  return result;
}
