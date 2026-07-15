import type { TournamentLiveSnapshot } from "./liveSnapshot";
import type { PlayerRankingRecord } from "./tournamentStats";

const BASE = "https://www.worldcupmatchday.com";

export function isNamedScorer(playerName: string): boolean {
  return !/^Scorer (unavailable|pending)$/i.test(playerName);
}

export type RankedPlayerRankingRecord = PlayerRankingRecord & { rank: number };

export function topScorerRows(topScorers: PlayerRankingRecord[]): RankedPlayerRankingRecord[] {
  const named = topScorers.filter((s) => isNamedScorer(s.playerName));

  // 1. Group by goals first.
  const goalsMap = new Map<number, PlayerRankingRecord[]>();
  for (const s of named) {
    if (!goalsMap.has(s.goals)) goalsMap.set(s.goals, []);
    goalsMap.get(s.goals)!.push(s);
  }

  const sortedGoals = Array.from(goalsMap.keys()).sort((a, b) => b - a);
  let currentRank = 1;
  const rankedRows: RankedPlayerRankingRecord[] = [];

  for (const g of sortedGoals) {
    const cohort = goalsMap.get(g)!;
    const cohortSize = cohort.length;

    // Apply assists only when complete for the entire goals cohort
    const allAssistsComplete = cohort.every(p => p.assists?.isComplete);

    if (allAssistsComplete) {
      const assistsMap = new Map<number, PlayerRankingRecord[]>();
      for (const p of cohort) {
        const aVal = p.assists!.value;
        if (!assistsMap.has(aVal)) assistsMap.set(aVal, []);
        assistsMap.get(aVal)!.push(p);
      }

      const sortedAssists = Array.from(assistsMap.keys()).sort((a, b) => b - a);
      for (const a of sortedAssists) {
        const subCohort = assistsMap.get(a)!;
        const subCohortSize = subCohort.length;

        // Apply minutes only within remaining equal goals+assists subgroups when every player has verified complete minutes
        const allMinutesComplete = subCohort.every(p => p.minutesPlayed?.isVerifiedComplete);

        if (allMinutesComplete) {
          subCohort.sort((p1, p2) => p1.minutesPlayed!.value - p2.minutesPlayed!.value);
          let subRank = currentRank;
          for (let i = 0; i < subCohort.length; i++) {
            const p = subCohort[i];
            const prev = i > 0 ? subCohort[i - 1] : null;
            if (prev && p.minutesPlayed!.value === prev.minutesPlayed!.value) {
              // Exact tie in goals, assists, and minutes
              rankedRows.push({ ...p, rank: subRank });
            } else {
              subRank = currentRank + i;
              rankedRows.push({ ...p, rank: subRank });
            }
          }
        } else {
          for (const p of subCohort) {
            rankedRows.push({ ...p, rank: currentRank });
          }
        }
        currentRank += subCohortSize;
      }
    } else {
      for (const p of cohort) {
        rankedRows.push({ ...p, rank: currentRank });
      }
      currentRank += cohortSize;
    }
  }

  return rankedRows;
}

export function hasTrustedTopScorerData(
  snapshot: Pick<TournamentLiveSnapshot, "topScorers" | "isFallback">,
): boolean {
  return topScorerRows(snapshot.topScorers).length > 0;
}

export function buildTopScorersItemListLd(topScorers: PlayerRankingRecord[]) {
  const rows = topScorerRows(topScorers);
  if (rows.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "World Cup 2026 Top Scorers",
    description: "Leading goal scorers at the 2026 FIFA World Cup.",
    url: `${BASE}/stats/top-scorers`,
    numberOfItems: rows.length,
    itemListElement: rows.slice(0, 10).map((s) => ({
      "@type": "ListItem",
      position: s.rank,
      name: s.playerName,
      description: `${s.goals} goal${s.goals !== 1 ? "s" : ""}${s.teamName ? ` - ${s.teamName}` : ""}`,
    })),
  };
}
