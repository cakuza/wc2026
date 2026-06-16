/**
 * Ranking of third-placed teams across all 12 groups.
 *
 * Derived purely from computeGroupStandings() (FINISHED matches with confirmed
 * scores only). The 8 best-ranked third-placed teams are "currently qualifying"
 * for the Round of 32; the remaining 4 are "currently outside" — this is a live
 * snapshot during the group stage, not a final result.
 */

import type { StandingRow } from "./groupStandings";

export type ThirdPlaceStatus = "qualifying" | "outside" | "boundary" | "unresolved" | "not_started";

export type ThirdPlaceRow = StandingRow & {
  group: string;
  rank: number;
  rankLabel?: string;
  status: ThirdPlaceStatus;
  tieUnresolved?: boolean;
};

/**
 * Sorting (same tie-breakers as group standings):
 *   1. points desc
 *   2. goalDifference desc
 *   3. goalsFor desc
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
    return b.goalsFor - a.goalsFor;
  });

  return thirds.map((row, i) => {
    const prev = thirds[i - 1];
    const next = thirds[i + 1];
    const tiedWithPrev = prev && prev.points === row.points && prev.goalDifference === row.goalDifference && prev.goalsFor === row.goalsFor;
    const tiedWithNext = next && next.points === row.points && next.goalDifference === row.goalDifference && next.goalsFor === row.goalsFor;
    const tieUnresolved = Boolean(tiedWithPrev || tiedWithNext);
    const tiedBlockStart = tiedWithPrev ? thirds.findIndex((r) => r.points === row.points && r.goalDifference === row.goalDifference && r.goalsFor === row.goalsFor) : i;
    const tiedBlockEnd = tieUnresolved
      ? thirds.findLastIndex((r) => r.points === row.points && r.goalDifference === row.goalDifference && r.goalsFor === row.goalsFor)
      : i;
    const rank = tiedBlockStart + 1;
    const boundaryCut = tiedBlockStart < 8 && tiedBlockEnd >= 8;
    const status: ThirdPlaceStatus = row.played === 0
      ? "not_started"
      : boundaryCut
        ? "boundary"
        : tieUnresolved
          ? "unresolved"
          : i < 8
            ? "qualifying"
            : "outside";

    return {
      ...row,
      rank,
      rankLabel: `${rank}${tieUnresolved ? "=" : ""}`,
      status,
      tieUnresolved,
    };
  });
}
