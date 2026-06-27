import type { TournamentLiveSnapshot } from "./liveSnapshot";
import type { PlayerGoalStat } from "./tournamentStats";

const BASE = "https://www.worldcupmatchday.com";

export function isNamedScorer(playerName: string): boolean {
  return !/^Scorer (unavailable|pending)$/i.test(playerName);
}

export function topScorerRows(topScorers: PlayerGoalStat[]): PlayerGoalStat[] {
  return topScorers.filter((s) => isNamedScorer(s.playerName));
}

export function hasTrustedTopScorerData(
  snapshot: Pick<TournamentLiveSnapshot, "topScorers" | "isFallback">,
): boolean {
  return !snapshot.isFallback && topScorerRows(snapshot.topScorers).length > 0;
}

export function buildTopScorersItemListLd(topScorers: PlayerGoalStat[]) {
  const rows = topScorerRows(topScorers);
  if (rows.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "World Cup 2026 Top Scorers",
    description: "Leading goal scorers at the 2026 FIFA World Cup.",
    url: `${BASE}/stats/top-scorers`,
    numberOfItems: rows.length,
    itemListElement: rows.slice(0, 10).map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.playerName,
      description: `${s.goals} goal${s.goals !== 1 ? "s" : ""}${s.teamName ? ` - ${s.teamName}` : ""}`,
    })),
  };
}
