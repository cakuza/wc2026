import { PageIntro, PageShell } from "@/components/page-shell";
import { getSeoLandingMetadata, SeoLandingRoute } from "@/lib/seo-page-data";

export const metadata = getSeoLandingMetadata("world-cup-yellow-cards");

export default function WorldCupYellowCardsPage() {
  return (
    <PageShell>
      <PageIntro
        kicker="SEO landing"
        title="World Cup yellow cards"
        copy="A simple discipline leaderboard surface for search, social, and matchday context."
      />
      <SeoLandingRoute slug="world-cup-yellow-cards" />
    </PageShell>
  );
}
