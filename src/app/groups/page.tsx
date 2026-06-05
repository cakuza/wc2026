import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageIntro, PageShell } from "@/components/page-shell";
import { RelatedLinks } from "@/components/related-links";
import { TeamFlag } from "@/components/team-flag";
import { getTeams } from "@/lib/football";
import { absoluteUrl } from "@/lib/site";
import { GROUPS } from "@/lib/types";

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
  const teams = await getTeams();

  return (
    <PageShell>
      <PageIntro
        kicker="Group stage"
        title="World Cup 2026 groups."
        copy="All 12 groups from the final draw. Open any group for its four teams, the full fixture list in your local time, the table, and the qualification picture."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GROUPS.map((group) => {
          const groupTeams = teams.filter((team) => team.group === group);
          return (
            <Link
              key={group}
              href={`/groups/${group.toLowerCase()}`}
              className="group rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 shadow-[0_10px_24px_rgba(14,12,10,.06)] transition hover:border-[#E7C36B]/60 hover:shadow-[0_16px_40px_rgba(14,12,10,.1)]"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black uppercase text-[#0E0C0A] [font-family:Impact,Arial_Black,sans-serif]">Group {group}</h2>
                <ArrowRight size={16} className="text-[#0E0C0A]/25 transition group-hover:text-[#B48A00]" />
              </div>
              <ul className="mt-3 grid gap-2">
                {groupTeams.map((team) => (
                  <li key={team.id} className="flex items-center gap-2">
                    <TeamFlag team={team} width={24} />
                    <span className="text-sm font-bold text-[#0E0C0A]">{team.name}</span>
                  </li>
                ))}
              </ul>
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
