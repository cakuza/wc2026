/**
 * Ranking of third-placed teams across all 12 groups.
 *
 * Derived purely from computeGroupStandings() (FINISHED matches with confirmed
 * scores only). The 8 best-ranked third-placed teams are "currently qualifying"
 * for the Round of 32; the remaining 4 are "currently outside" — this is a live
 * snapshot during the group stage, not a final result.
 */

import type { StandingRow } from "./groupStandings";

export type ThirdPlaceStatus = "qualifying" | "outside";

export type ThirdPlaceRow = StandingRow & {
  group: string;
  rank: number;
  status: ThirdPlaceStatus;
};

/**
 * Sorting (same tie-breakers as group standings):
 *   1. points desc
 *   2. goalDifference desc
 *   3. goalsFor desc
 *   4. teamKey asc (fallback)
 */
export function computeThirdPlaceRanking(
  standings: Record<string, StandingRow[]>,
): ThirdPlaceRow[] {
  const thirds: (StandingRow & { group: string })[] = [];

  for (const [group, rows] of Object.entries(standings)) {
    if (rows.length >= 3) {
      thirds.push({ ...rows[2], group });
    }
  }

  thirds.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamKey.localeCompare(b.teamKey);
  });

  return thirds.map((row, i) => ({
    ...row,
    rank: i + 1,
    status: i < 8 ? "qualifying" : "outside",
  }));
}
