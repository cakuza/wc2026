import type { Metadata } from "next";
import { PageIntro, PageShell } from "@/components/page-shell";
import { RelatedLinks } from "@/components/related-links";
import { LastUpdatedBlock } from "@/components/seo-blocks";
import { SectionCard } from "@/components/section-card";
import { StandingsTable } from "@/components/standings-table";
import { footballProvider } from "@/lib/providers";
import { absoluteUrl } from "@/lib/site";
import { GROUPS } from "@/lib/types";
import { groupBy, sortStandings } from "@/lib/utils";

export const metadata: Metadata = {
  title: "World Cup 2026 Standings",
  description: "World Cup 2026 group standings with points, goal difference, and third-place watch table.",
  alternates: {
    canonical: absoluteUrl("/standings")
  },
  openGraph: {
    title: "World Cup 2026 Standings",
    description: "Group tables and best third-place watch list.",
    url: absoluteUrl("/standings")
  }
};

export default async function StandingsPage() {
  const [standings, teams, meta] = await Promise.all([
    footballProvider.getStandings(),
    footballProvider.getTeams(),
    footballProvider.getMeta()
  ]);
  const groups = groupBy(standings, (row) => row.group);

  return (
    <PageShell>
      <PageIntro
        kicker="Tables"
        title="Group standings built for instant publishing."
        copy={meta.note}
      />
      <div className="mb-5">
        <LastUpdatedBlock meta={meta} />
      </div>
      <div className="grid gap-5">
        {GROUPS.map((group) => (
          <SectionCard key={group} title={`Group ${group}`}>
            <div className="overflow-x-auto">
              <StandingsTable rows={groups[group] || []} teams={teams} />
            </div>
          </SectionCard>
        ))}
        <SectionCard title="Best Third-Place Watch">
          <div className="grid gap-3 md:grid-cols-4">
            {Object.values(groups).map((rows) => {
              const row = sortStandings(rows)[2];
              const team = teams.find((item) => item.id === row?.teamId);
              return (
                <div key={row?.teamId} className="rounded-md bg-white/[0.04] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">Sample watch</p>
                  <p className="mt-2 font-black text-white">{team?.name || "Team to be confirmed"}</p>
                  <p className="text-sm text-white/55">{row?.points || 0} points</p>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>
      <div className="mt-6">
        <RelatedLinks
          links={[
            { href: "/world-cup-standings", label: "Standings SEO page" },
            { href: "/matches", label: "Full schedule" },
            { href: "/leaderboards", label: "Leaderboards" },
            { href: "/cards", label: "Create standings card" }
          ]}
        />
      </div>
    </PageShell>
  );
}
