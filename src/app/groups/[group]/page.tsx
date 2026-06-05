import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { RelatedLinks } from "@/components/related-links";
import { StandingsTable } from "@/components/standings-table";
import { TeamFlag } from "@/components/team-flag";
import { TodayMatches } from "@/components/today-matches";
import { footballProvider } from "@/lib/providers";
import { getMatchesWithTeams, getTeams } from "@/lib/football";
import { absoluteUrl } from "@/lib/site";
import { GROUPS, type Group, type Team } from "@/lib/types";

type Props = {
  params: Promise<{ group: string }>;
};

export function generateStaticParams() {
  return GROUPS.map((group) => ({ group: group.toLowerCase() }));
}

function normalizeGroup(param: string): Group | null {
  const upper = (param || "").toUpperCase();
  return (GROUPS as string[]).includes(upper) ? (upper as Group) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { group: raw } = await params;
  const group = normalizeGroup(raw);
  if (!group) return { title: "Group Not Found" };

  const teams = (await getTeams()).filter((team) => team.group === group);
  const names = teams.map((team) => team.name).join(", ");
  return {
    title: `World Cup 2026 Group ${group}: Teams, Fixtures & Table`,
    description: `Group ${group} at the 2026 World Cup: ${names}. Local kickoff times, the group table, and how to qualify for the Round of 32.`,
    alternates: { canonical: absoluteUrl(`/groups/${group.toLowerCase()}`) },
    openGraph: {
      title: `World Cup 2026 Group ${group}`,
      description: `Fixtures, standings and qualification for Group ${group}: ${names}.`,
      url: absoluteUrl(`/groups/${group.toLowerCase()}`)
    }
  };
}

// 2-3 sentences of original copy built from real data, so every group page reads
// differently and avoids thin/placeholder content.
function buildGroupSummary(group: Group, teams: Team[]): string[] {
  const names = teams.map((team) => team.name);
  const confederations = [...new Set(teams.map((team) => team.confederation))];
  const list =
    names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names[0] || "four teams";

  return [
    `Group ${group} at the 2026 World Cup brings together ${list}, spanning ${confederations.length} confederation${confederations.length > 1 ? "s" : ""} (${confederations.join(", ")}).`,
    `Each side plays the other three once in the group stage across the United States, Canada and Mexico, with kickoff times below shown in your local timezone.`,
    `The top two teams advance directly to the Round of 32, and Group ${group}'s third-placed side can still progress as one of the eight best third-placed teams in the expanded 48-nation field.`
  ];
}

export default async function GroupPage({ params }: Props) {
  const { group: raw } = await params;
  const group = normalizeGroup(raw);
  if (!group) notFound();

  const [allTeams, allMatches, standings] = await Promise.all([
    getTeams(),
    getMatchesWithTeams(),
    footballProvider.getStandings()
  ]);

  const teams = allTeams.filter((team) => team.group === group);
  const groupStandings = standings.filter((row) => row.group === group);
  const fixtures = allMatches
    .filter((match) => match.group === group)
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  const summary = buildGroupSummary(group, teams);

  return (
    <PageShell>
      <Link href="/groups" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#0E0C0A]/62 hover:text-[#B48A00]">
        <ArrowLeft size={16} />
        All groups
      </Link>

      <section className="mb-8 rounded-[28px] border border-[rgba(14,12,10,.10)] bg-white p-5 shadow-[0_24px_70px_rgba(14,12,10,.10)] md:p-8">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FF2D6B]">World Cup 2026 · Group stage</p>
        <h1 className="mt-3 text-5xl font-black uppercase leading-[.9] tracking-normal text-[#0E0C0A] [font-family:Impact,Arial_Black,sans-serif] md:text-7xl">
          Group {group}
        </h1>
        <div className="mt-5 grid gap-3 text-sm leading-7 text-[#0E0C0A]/70 md:text-base">
          {summary.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/teams/${team.slug}-world-cup-schedule`}
              className="grid justify-items-center gap-2 rounded-lg border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] p-4 text-center transition hover:border-[#E7C36B]/60 hover:bg-white"
            >
              <TeamFlag team={team} width={52} />
              <span className="text-sm font-black uppercase leading-tight text-[#0E0C0A]">{team.name}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#0E0C0A]/45">{team.confederation}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">Group {group} table</p>
        <h2 className="mt-1 text-2xl font-black text-[#0E0C0A]">Standings</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#0E0C0A]/58">
          Pre-tournament table — every team starts level. Standings update automatically once the group stage kicks off on June 11, 2026.
        </p>
        <div className="mt-4 overflow-x-auto">
          <StandingsTable rows={groupStandings} teams={teams} />
        </div>
      </section>

      <section className="mb-8">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">All six fixtures</p>
        <h2 className="mt-1 text-2xl font-black text-[#0E0C0A]">Group {group} schedule</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#0E0C0A]/58">
          Kickoff times shown in your local timezone. Tap any match to build a shareable prediction card.
        </p>
        <div className="mt-4">
          <TodayMatches matches={fixtures} />
        </div>
      </section>

      <RelatedLinks
        links={[
          { href: "/groups", label: "All groups" },
          { href: "/matches", label: "Full schedule" },
          { href: "/standings", label: "Every group table" }
        ]}
      />
    </PageShell>
  );
}
