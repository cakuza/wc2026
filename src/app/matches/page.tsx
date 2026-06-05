import type { Metadata } from "next";
import { MatchScheduleClient } from "@/components/match-schedule-client";
import { PageIntro, PageShell } from "@/components/page-shell";
import { RelatedLinks } from "@/components/related-links";
import { getMatchesWithTeams } from "@/lib/football";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "World Cup 2026 Match Schedule",
  description: "Filter World Cup 2026 matches by local time, date, team, and group, then create matchup and prediction cards.",
  alternates: {
    canonical: absoluteUrl("/matches")
  },
  openGraph: {
    title: "World Cup 2026 Match Schedule",
    description: "Local-time World Cup schedule board with team and group filters.",
    url: absoluteUrl("/matches")
  }
};

export default async function MatchesPage() {
  const matches = await getMatchesWithTeams();
  return (
    <PageShell>
      <PageIntro
        kicker="Match schedule"
        title="World Cup 2026 Match Schedule."
        copy="All 104 matches with local kickoff times. Filter by team, date or group."
      />
      <MatchScheduleClient matches={matches} />
      <p className="mt-6 text-xs text-[#0E0C0A]/45">* Official WC2026 group stage fixtures. Times shown in your local timezone.</p>
      <div className="mt-6">
        <RelatedLinks
          links={[
            { href: "/world-cup-matches-today", label: "Today's matches" },
            { href: "/world-cup-schedule-local-time", label: "Local-time schedule" },
            { href: "/cards", label: "Create schedule card" }
          ]}
        />
      </div>
    </PageShell>
  );
}
