import type { Metadata } from "next";
import { PageIntro, PageShell } from "@/components/page-shell";
import { TeamsListClient } from "@/components/teams-list-client";
import { getTeams } from "@/lib/football";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "World Cup 2026 Teams",
  description: "All 48 World Cup 2026 teams by group (A–L). Open any team for its squad, fixtures, group table and local match times.",
  alternates: {
    canonical: absoluteUrl("/teams")
  },
  openGraph: {
    title: "World Cup 2026 Teams",
    description: "All 48 teams organised by group, each with squad, fixtures and local match times.",
    url: absoluteUrl("/teams")
  }
};

export default async function TeamsPage() {
  const teams = await getTeams();

  return (
    <PageShell>
      <PageIntro
        kicker="Teams"
        title="All 48 World Cup 2026 teams."
        copy="Squad, fixtures, group table and local match times — for every team."
      />
      <TeamsListClient teams={teams} />
    </PageShell>
  );
}
