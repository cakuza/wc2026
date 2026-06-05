import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageIntro, PageShell } from "@/components/page-shell";
import { RelatedLinks } from "@/components/related-links";
import { TeamFlag } from "@/components/team-flag";
import { footballProvider } from "@/lib/providers";
import { getTeams } from "@/lib/football";
import { absoluteUrl } from "@/lib/site";
import { GROUPS } from "@/lib/types";
import { goalDifference, sortStandings } from "@/lib/utils";

export const metadata: Metadata = {
  title: "World Cup 2026 Groups: A–L Teams, Fixtures & Tables",
  description: "All 12 World Cup 2026 groups (A–L). See the four teams in each group, fixtures in your local time, and how to qualify for the Round of 32.",
  alternates: { canonical: absoluteUrl("/groups") },
  openGraph: {
    title: "World Cup 2026 Groups",
    description: "Browse all 12 groups, their teams, fixtures and tables.",
    url: absoluteUrl("/groups")
  }
};

export default async function GroupsIndexPage() {
  const [teams, standings] = await Promise.all([getTeams(), footballProvider.getStandings()]);

  return (
    <PageShell>
      <PageIntro
        kicker="Group stage"
        title="World Cup 2026 groups."
        copy="All 12 groups from the final draw. Open any group for its four teams, the full fixture list in your local time, the table, and the qualification picture."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GROUPS.map((group) => {
          const rows = sortStandings(standings.filter((row) => row.group === group));
          return (
            <Link
              key={group}
              href={`/groups/${group.toLowerCase()}`}
              className="group rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 shadow-[0_10px_24px_rgba(14,12,10,.06)] transition hover:border-[#E7C36B]/60 hover:shadow-[0_16px_40px_rgba(14,12,10,.1)]"
            >
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xl font-black uppercase text-[#0E0C0A] [font-family:Impact,Arial_Black,sans-serif]">Group {group}</h2>
                <ArrowRight size={16} className="text-[#0E0C0A]/25 transition group-hover:text-[#B48A00]" />
              </div>
              <table className="w-full table-fixed border-collapse text-[11px]">
                <thead>
                  <tr className="text-[9px] uppercase tracking-[0.08em] text-[#0E0C0A]/45">
                    <th className="w-auto py-1.5 pr-1 text-left font-black">Team</th>
                    <th className="w-5 px-0.5 text-center font-black">P</th>
                    <th className="w-5 px-0.5 text-center font-black">W</th>
                    <th className="w-5 px-0.5 text-center font-black">D</th>
                    <th className="w-5 px-0.5 text-center font-black">L</th>
                    <th className="w-6 px-0.5 text-center font-black">GF</th>
                    <th className="w-6 px-0.5 text-center font-black">GA</th>
                    <th className="w-6 px-0.5 text-center font-black">GD</th>
                    <th className="w-6 px-0.5 text-center font-black text-[#B48A00]">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(14,12,10,.06)]">
                  {rows.map((row) => {
                    const team = teams.find((item) => item.id === row.teamId);
                    return (
                      <tr key={row.teamId} className="text-[#0E0C0A]/70">
                        <td className="py-1.5 pr-1">
                          <span className="flex items-center gap-1.5">
                            <TeamFlag team={team} width={18} shadow={false} />
                            <span className="truncate font-bold text-[#0E0C0A]">{team?.name || row.teamId}</span>
                          </span>
                        </td>
                        <td className="px-0.5 text-center">{row.played}</td>
                        <td className="px-0.5 text-center">{row.won}</td>
                        <td className="px-0.5 text-center">{row.drawn}</td>
                        <td className="px-0.5 text-center">{row.lost}</td>
                        <td className="px-0.5 text-center">{row.goalsFor}</td>
                        <td className="px-0.5 text-center">{row.goalsAgainst}</td>
                        <td className="px-0.5 text-center">{goalDifference(row)}</td>
                        <td className="px-0.5 text-center font-black text-[#B48A00]">{row.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Link>
          );
        })}
      </div>
      <div className="mt-6">
        <RelatedLinks
          links={[
            { href: "/standings", label: "Group standings" },
            { href: "/matches", label: "Full schedule" },
            { href: "/teams", label: "All 48 teams" }
          ]}
        />
      </div>
    </PageShell>
  );
}
