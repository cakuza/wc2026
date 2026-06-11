import type { Metadata } from "next";
import StatsContent from "@/components/StatsContent";
import { fetchAllLiveData } from "@/lib/fetchAllLiveData";
import { computeTournamentStats, computeTeamLeaderboards, computeTopScorers } from "@/lib/tournamentStats";
import { computeGroupStandings } from "@/lib/groupStandings";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "World Cup 2026 Stats - Records & Tournament Board",
  description:
    "World Cup all-time records plus a live 2026 tournament stat board for goals, clean sheets and match results — updated after each completed match.",
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
  const liveData = await fetchAllLiveData();
  const tournamentStats = computeTournamentStats(liveData);
  const standings = computeGroupStandings(liveData);
  const teamLeaderboards = computeTeamLeaderboards(standings);
  const topScorers = computeTopScorers(liveData);
  const hasEventData = Array.from(liveData.values()).some((d) => d.eventDataAvailable && d.goals && d.goals.length > 0);

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
