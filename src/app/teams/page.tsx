import type { Metadata } from "next";
import { PageIntro, PageShell } from "@/components/page-shell";
import { TeamPicker } from "@/components/team-picker";
import { TeamSearch } from "@/components/team-search";
import { getTeams } from "@/lib/football";
import { absoluteUrl } from "@/lib/site";
import { getSquadStatusMap } from "@/lib/squads";

export const metadata: Metadata = {
  title: "World Cup 2026 Teams",
  description: "Pick any World Cup 2026 country and open its fan hub, road poster, matchup list, and prediction-card flow.",
  alternates: {
    canonical: absoluteUrl("/teams")
  },
  openGraph: {
    title: "World Cup 2026 Teams",
    description: "Country fan hubs with road posters, group matchups, and card-ready team pages.",
    url: absoluteUrl("/teams")
  }
};

export default async function TeamsPage() {
  const teams = await getTeams();
  const squadStatusByTeam = getSquadStatusMap();
  return (
    <PageShell>
      <PageIntro
        kicker="Teams"
        title="All 48 World Cup 2026 teams."
        copy="Squad, fixtures, group table and local match times — for every team."
      />
      <div className="mb-6">
        <TeamPicker teams={teams} squadStatusByTeam={squadStatusByTeam} hideHeader />
      </div>
      <TeamSearch teams={teams} squadStatusByTeam={squadStatusByTeam} />
    </PageShell>
  );
}
