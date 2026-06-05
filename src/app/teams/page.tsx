import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageIntro, PageShell } from "@/components/page-shell";
import { TeamFlag } from "@/components/team-flag";
import { getTeams } from "@/lib/football";
import { absoluteUrl } from "@/lib/site";
import { GROUPS } from "@/lib/types";

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
      <div className="grid gap-8">
        {GROUPS.map((group) => {
          const groupTeams = teams.filter((team) => team.group === group);
          if (!groupTeams.length) return null;
          return (
            <section key={group}>
              <div className="mb-3 flex items-center justify-between gap-3 border-b border-[rgba(14,12,10,.10)] pb-2">
                <h2 className="text-sm font-black uppercase tracking-[0.16em] text-[#0E0C0A]">Group {group}</h2>
                <Link
                  href={`/groups/${group.toLowerCase()}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0E0C0A]/55 transition hover:text-[#B48A00]"
                >
                  Group table <ArrowRight size={13} />
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {groupTeams.map((team) => (
                  <Link
                    key={team.id}
                    href={`/teams/${team.slug}`}
                    className="flex items-center gap-3 rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-3 shadow-[0_8px_18px_rgba(14,12,10,.05)] transition hover:border-[#E7C36B]/60 hover:shadow-[0_14px_32px_rgba(14,12,10,.09)]"
                  >
                    <TeamFlag team={team} width={38} />
                    <div className="min-w-0">
                      <p className="truncate font-black text-[#0E0C0A]">{team.name}</p>
                      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#0E0C0A]/45">{team.confederation}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </PageShell>
  );
}
