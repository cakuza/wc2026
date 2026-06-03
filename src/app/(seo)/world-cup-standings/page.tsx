import { PageIntro, PageShell } from "@/components/page-shell";
import { getSeoLandingMetadata, SeoLandingRoute } from "@/lib/seo-page-data";

export const metadata = getSeoLandingMetadata("world-cup-standings");

export default function WorldCupStandingsSeoPage() {
  return (
    <PageShell>
      <PageIntro
        kicker="SEO landing"
        title="World Cup standings"
        copy="A dedicated group-table entry point for high-intent tournament searches."
      />
      <SeoLandingRoute slug="world-cup-standings" />
    </PageShell>
  );
}
