import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GroupFixtures } from "@/components/group-fixtures";
import { PageShell } from "@/components/page-shell";
import { RelatedLinks } from "@/components/related-links";
import { StandingsTable } from "@/components/standings-table";
import { footballProvider } from "@/lib/providers";
import { getMatchesWithTeams, getTeams } from "@/lib/football";
import { absoluteUrl } from "@/lib/site";
import { GROUPS, type Group } from "@/lib/types";

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
  // Four-team round robin = three matchdays of two fixtures each, in date order.
  const matchdays = [fixtures.slice(0, 2), fixtures.slice(2, 4), fixtures.slice(4, 6)].filter((day) => day.length > 0);

  return (
    <PageShell>
      <Link href="/groups" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#0E0C0A]/62 hover:text-[#B48A00]">
        <ArrowLeft size={16} />
        All groups
      </Link>

      <nav aria-label="Groups" className="mb-6 flex flex-wrap gap-1.5">
        {GROUPS.map((item) => {
          const active = item === group;
          return (
            <Link
              key={item}
              href={`/groups/${item.toLowerCase()}`}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "grid h-9 w-9 place-items-center rounded-md bg-[#0E0C0A] text-sm font-black text-white"
                  : "grid h-9 w-9 place-items-center rounded-md border border-[rgba(14,12,10,.12)] bg-white text-sm font-black text-[#0E0C0A]/70 transition hover:border-[#0E0C0A]/40 hover:text-[#0E0C0A]"
              }
            >
              {item}
            </Link>
          );
        })}
      </nav>

      <header className="mb-8">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FF2D6B]">World Cup 2026 · Group stage</p>
        <h1 className="mt-2 text-3xl font-black text-[#0E0C0A] md:text-4xl">Group {group}</h1>
      </header>

      <section className="mb-10">
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 className="text-2xl font-black text-[#0E0C0A]">Standings</h2>
          <span className="hidden items-center gap-2 text-xs font-bold text-[#0E0C0A]/55 sm:flex">
            <span className="inline-block h-3 w-3 rounded-full bg-[#1FA960]" />
            Qualification places
          </span>
        </div>
        <div className="overflow-x-auto">
          <StandingsTable rows={groupStandings} teams={teams} showFlags qualifyCount={2} />
        </div>
        <p className="mt-2 text-xs text-[#0E0C0A]/50">
          Pre-tournament table — every team starts level. Positions and points update automatically once the group stage kicks off on June 11, 2026.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-5 text-2xl font-black text-[#0E0C0A]">Fixtures</h2>
        <GroupFixtures matchdays={matchdays} />
      </section>

      <section className="mb-8 rounded-[22px] border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] p-5 md:p-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">How teams advance</p>
        <h2 className="mt-1 text-2xl font-black text-[#0E0C0A]">Qualification rules</h2>
        <ul className="mt-4 grid gap-3">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 inline-grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#1FA960] text-xs font-black text-white">1-2</span>
            <span className="text-sm font-bold leading-6 text-[#0E0C0A]/80"><span className="font-black text-[#0E0C0A]">Top 2 advance automatically</span> to the Round of 32.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 inline-grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#E7C36B] text-xs font-black text-[#0E0C0A]">3</span>
            <span className="text-sm font-bold leading-6 text-[#0E0C0A]/80"><span className="font-black text-[#0E0C0A]">Best 8 third-place teams also advance</span> — the eight strongest of the twelve group third-placed sides go through.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 inline-grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#0E0C0A]/12 text-xs font-black text-[#0E0C0A]/60">4</span>
            <span className="text-sm font-bold leading-6 text-[#0E0C0A]/80"><span className="font-black text-[#0E0C0A]">4th place is eliminated.</span></span>
          </li>
        </ul>
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
