import type { Metadata } from "next";
import StatsContent from "@/components/StatsContent";
import { fetchAllLiveData } from "@/lib/fetchAllLiveData";
import { computeTournamentStats, computeTeamLeaderboards, computeTopScorers } from "@/lib/tournamentStats";
import { computeGroupStandings } from "@/lib/groupStandings";
import { fetchWorldCup26Games } from "@/lib/worldcup26Provider";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "World Cup 2026 Stats - Records & Tournament Board",
  description:
    "World Cup all-time records plus a 2026 tournament stat board for goals, clean sheets and match results — updated after each completed match.",
  alternates: { canonical: "https://www.worldcupmatchday.com/stats" },
  openGraph: {
    title: "World Cup 2026 Stats - Records & Tournament Board",
    description: "All-time World Cup records and a matchday-ready 2026 tournament stat board.",
    url: "https://www.worldcupmatchday.com/stats",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "FIFA World Cup 2026 Statistics",
  description:
    "All-time World Cup records and a tournament stat board for FIFA World Cup 2026.",
  url: "https://www.worldcupmatchday.com/stats",
};

export default async function StatsPage() {
  // football-data.org bulk fetch (primary — score/status/standings/tournament totals)
  const liveData = await fetchAllLiveData();
  const tournamentStats = computeTournamentStats(liveData);
  const standings = computeGroupStandings(liveData);
  const teamLeaderboards = computeTeamLeaderboards(standings);

  // Top scorers: try football-data.org first (eventDataAvailable=true, paid tier).
  // Fall back to worldcup26.ir secondary source if football-data doesn't expose event data.
  let topScorers = computeTopScorers(liveData);

  if (topScorers.length === 0) {
    const w26Games = await fetchWorldCup26Games();
    if (w26Games && w26Games.length > 0) {
      const scorerMap = new Map<string, { playerName: string; teamName: string | null; goals: number }>();
      for (const game of w26Games) {
        for (const g of [...game.homeScorers, ...game.awayScorers]) {
          const key = g.playerName;
          const existing = scorerMap.get(key);
          if (existing) {
            existing.goals++;
          } else {
            scorerMap.set(key, { playerName: g.playerName, teamName: g.teamName, goals: 1 });
          }
        }
      }
      topScorers = [...scorerMap.values()]
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 10);
    }
  }

  const hasEventData = topScorers.length > 0;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StatsContent
        tournamentStats={tournamentStats}
        teamLeaderboards={teamLeaderboards}
        topScorers={topScorers}
        hasEventData={hasEventData}
      />
    </>
  );
}
