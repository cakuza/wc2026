import { PageIntro, PageShell } from "@/components/page-shell";
import { getSeoLandingMetadata, SeoLandingRoute } from "@/lib/seo-page-data";

export const metadata = getSeoLandingMetadata("world-cup-assists-leaderboard");

export default function WorldCupAssistsLeaderboardPage() {
  return (
    <PageShell>
      <PageIntro
        kicker="SEO landing"
        title="World Cup assists leaderboard"
        copy="A static launch page for assists searches and creator-friendly stat angles."
      />
      <SeoLandingRoute slug="world-cup-assists-leaderboard" />
    </PageShell>
  );
}
