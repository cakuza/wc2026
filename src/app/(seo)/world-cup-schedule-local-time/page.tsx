import { PageIntro, PageShell } from "@/components/page-shell";
import { getSeoLandingMetadata, SeoLandingRoute } from "@/lib/seo-page-data";

export const metadata = getSeoLandingMetadata("world-cup-schedule-local-time");

export default function WorldCupScheduleLocalTimePage() {
  return (
    <PageShell>
      <PageIntro
        kicker="SEO landing"
        title="World Cup time conversion ready when kick-offs are confirmed"
        copy="A search-friendly support page for timezone conversion once official kick-off data is added."
      />
      <SeoLandingRoute slug="world-cup-schedule-local-time" />
    </PageShell>
  );
}
