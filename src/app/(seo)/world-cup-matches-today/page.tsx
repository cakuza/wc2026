import { PageIntro, PageShell } from "@/components/page-shell";
import { getSeoLandingMetadata, SeoLandingRoute } from "@/lib/seo-page-data";

export const metadata = getSeoLandingMetadata("world-cup-matches-today");

export default function WorldCupMatchesTodayPage() {
  return (
    <PageShell>
      <PageIntro
        kicker="SEO landing"
        title="World Cup matches today"
        copy="Fast matchup content for fans, preview posts, and card creation before confirmed kickoff data is active."
      />
      <SeoLandingRoute slug="world-cup-matches-today" />
    </PageShell>
  );
}
