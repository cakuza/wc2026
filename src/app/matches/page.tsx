import type { Metadata } from "next";
import { MatchScheduleClient } from "@/components/match-schedule-client";
import { PageIntro, PageShell } from "@/components/page-shell";
import { RelatedLinks } from "@/components/related-links";
import { TeamPicker } from "@/components/team-picker";
import { getMatchesWithTeams, getTeams } from "@/lib/football";
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
  const [matches, teams] = await Promise.all([
    getMatchesWithTeams(),
    getTeams()
  ]);
  return (
    <PageShell>
      <PageIntro
        kicker="Match schedule"
        title="World Cup matches in your local time."
        copy="Filter the group stage by country, date, group, and timezone. Then turn any match into a prediction card or team-road poster."
      />
      <div className="mb-6">
        <TeamPicker teams={teams} />
      </div>
      <MatchScheduleClient matches={matches} />
      <p className="mt-6 text-xs text-white/40">* Pre-draw sample bracket. Times shown in your local timezone.</p>
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
