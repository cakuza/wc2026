import { PageIntro, PageShell } from "@/components/page-shell";
import { getSeoLandingMetadata, SeoLandingRoute } from "@/lib/seo-page-data";

export const metadata = getSeoLandingMetadata("world-cup-top-scorers");

export default function WorldCupTopScorersPage() {
  return (
    <PageShell>
      <PageIntro
        kicker="SEO landing"
        title="World Cup top scorers"
        copy="A lightweight, indexable leaderboard page for goals and shareable content."
      />
      <SeoLandingRoute slug="world-cup-top-scorers" />
    </PageShell>
  );
}
