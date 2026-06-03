import type { Metadata } from "next";
import { MonetizationSlot } from "@/components/monetization";
import { PageIntro, PageShell } from "@/components/page-shell";
import { RelatedLinks } from "@/components/related-links";
import { LastUpdatedBlock } from "@/components/seo-blocks";
import { StatsHub } from "@/components/stats-hub";
import { getPlayersWithStats, getTeams } from "@/lib/football";
import { footballProvider } from "@/lib/providers";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pre-Tournament World Cup Stats and Debate Hub",
  description: "Create Golden Boot, Player Watch, Top 5, and group debate cards before official World Cup stats activate.",
  alternates: {
    canonical: absoluteUrl("/stats")
  },
  openGraph: {
    title: "Pre-Tournament World Cup Stats and Debate Hub",
    description: "Mobile-friendly debate hub with Golden Boot, Player Watch, Top 5, and shareable fan-card actions.",
    url: absoluteUrl("/stats")
  }
};

export default async function StatsPage() {
  const [players, standings, teams, meta] = await Promise.all([
    getPlayersWithStats(),
    footballProvider.getStandings(),
    getTeams(),
    footballProvider.getMeta()
  ]);

  return (
    <PageShell>
      <PageIntro
        kicker="Pre-tournament stats and debate hub"
        title="Start the Golden Boot argument before the numbers arrive."
        copy="Create Golden Boot picks, Player Watch posters, Top 5 debates, and group cards today. Official stat leaders activate once verified player and match data is imported."
      />
      <div className="mb-5">
        <LastUpdatedBlock meta={meta} />
      </div>
      <div className="mb-5">
        <MonetizationSlot label="Debate card sponsor slot" copy="Reserved for a future fan-debate sponsor once real traffic proves this page gets repeat use." />
      </div>
      <StatsHub players={players} standings={standings} teams={teams} />
      <div className="mt-6">
        <RelatedLinks
          links={[
            { href: "/leaderboards", label: "Classic leaderboards" },
            { href: "/cards?template=golden-boot", label: "Golden Boot card" },
            { href: "/cards?template=player-watch", label: "Player Watch card" },
            { href: "/matches", label: "Match schedule" },
            { href: "/teams", label: "Pick a team" }
          ]}
        />
      </div>
    </PageShell>
  );
}
