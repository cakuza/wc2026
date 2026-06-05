import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { AddToCalendarButton } from "@/components/add-to-calendar-button";
import { MatchLocalTime } from "@/components/match-local-time";
import { PageShell } from "@/components/page-shell";
import { RelatedLinks } from "@/components/related-links";
import { StandingsTable } from "@/components/standings-table";
import { StructuredData } from "@/components/structured-data";
import { TeamFlag } from "@/components/team-flag";
import { footballProvider } from "@/lib/providers";
import { getMatchesWithTeams, getTeams } from "@/lib/football";
import { matchSlug, matchdayNumber } from "@/lib/matches";
import { absoluteUrl } from "@/lib/site";
import { formatKickoff } from "@/lib/timezones";
import type { MatchWithTeams } from "@/lib/types";

type Props = {
  params: Promise<{ slug: string }>;
};

// Deterministic, host-timezone (US Eastern) display string for SEO copy and schema, so
// crawlers get a concrete time regardless of the visitor's zone.
function easternKickoff(kickoffUtc?: string | null): string {
  if (!kickoffUtc) return "a time to be confirmed";
  return `${formatKickoff(kickoffUtc, "America/New_York")} ET`;
}

async function resolveMatch(slug: string): Promise<MatchWithTeams | undefined> {
  const matches = await getMatchesWithTeams();
  // Resolve by SEO slug, falling back to the raw match id for backward-compatible links.
  return matches.find((match) => matchSlug(match) === slug) || matches.find((match) => match.id === slug);
}

export async function generateStaticParams() {
  const matches = await getMatchesWithTeams();
  return matches.map((match) => ({ slug: matchSlug(match) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const match = await resolveMatch(slug);
  if (!match) return { title: "Match Not Found" };

  const title = `${match.homeTeam.name} vs ${match.awayTeam.name}`;
  const groupLabel = match.group ? `Group ${match.group}` : match.stage;
  const canonical = absoluteUrl(`/matches/${matchSlug(match)}`);
  const description = `${title} at the 2026 World Cup (${groupLabel}): kickoff ${easternKickoff(match.kickoffUtc)} at ${match.venue}, ${match.city}. Local time, group table and how to follow both teams.`;

  return {
    title: `${title} — World Cup 2026 ${groupLabel}`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} — World Cup 2026`,
      description,
      url: canonical,
      type: "website"
    }
  };
}

// "What this match means" — plain-English, pre-tournament implications built from real data.
function buildMeaning(match: MatchWithTeams, matchday: number | null, groupTeamNames: string[]): string[] {
  const { homeTeam, awayTeam, group } = match;
  const others = groupTeamNames.filter((name) => name !== homeTeam.name && name !== awayTeam.name);
  const sentences: string[] = [];

  if (group) {
    sentences.push(
      `${homeTeam.name} vs ${awayTeam.name} is a Group ${group} fixture${matchday ? ` on Matchday ${matchday}` : ""} at the 2026 World Cup.`
    );
    sentences.push(
      `A ${homeTeam.name} win would move them to three points and an early lead at the top of Group ${group}, while ${awayTeam.name} would drop to the bottom; a draw leaves both on one point.`
    );
    sentences.push(
      others.length === 2
        ? `Both teams also face ${others[0]} and ${others[1]} in the group — the top two qualify automatically for the Round of 32, and the best eight third-placed teams advance too.`
        : `The top two teams in Group ${group} qualify automatically for the Round of 32, with the best eight third-placed teams also advancing.`
    );
  } else {
    sentences.push(`${homeTeam.name} vs ${awayTeam.name} is a ${match.stage} tie at the 2026 World Cup — win and advance, lose and go home.`);
  }
  return sentences;
}

export default async function MatchDetailPage({ params }: Props) {
  const { slug } = await params;
  const [match, allMatches, allTeams, standings] = await Promise.all([
    resolveMatch(slug),
    getMatchesWithTeams(),
    getTeams(),
    footballProvider.getStandings()
  ]);
  if (!match) notFound();

  const matchday = matchdayNumber(match, allMatches);
  const groupTeams = match.group ? allTeams.filter((team) => team.group === match.group) : [];
  const groupStandings = match.group ? standings.filter((row) => row.group === match.group) : [];
  const meaning = buildMeaning(match, matchday, groupTeams.map((team) => team.name));
  const title = `${match.homeTeam.name} vs ${match.awayTeam.name}`;
  const hasVenue = match.venue !== "TBD" && match.city !== "TBD";
  const venue = hasVenue ? `${match.venue}, ${match.city}` : "Venue to be confirmed";
  const groupLabel = match.group ? `Group ${match.group}` : match.stage;

  const faq = [
    {
      q: `What time is ${title}?`,
      a: `${title} kicks off ${easternKickoff(match.kickoffUtc)}${hasVenue ? ` at ${match.venue}` : ""}. The match page shows the kickoff in your own local timezone.`
    },
    {
      q: `Where is ${title} played?`,
      a: hasVenue ? `${title} is played at ${match.venue} in ${match.city}.` : `The venue for ${title} is still to be confirmed.`
    },
    {
      q: `Which group is ${title} in?`,
      a: match.group
        ? `${title} is a Group ${match.group} match at the 2026 World Cup.`
        : `${title} is a ${match.stage} match at the 2026 World Cup.`
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a }
    }))
  };

  return (
    <PageShell>
      <StructuredData data={faqSchema} />

      <Link href="/matches" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#0E0C0A]/62 hover:text-[#B48A00]">
        <ArrowLeft size={16} />
        Back to schedule
      </Link>

      <header className="mb-8 rounded-[22px] border border-[rgba(14,12,10,.10)] bg-white p-5 shadow-[0_18px_50px_rgba(14,12,10,.08)] md:p-7">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FF2D6B]">
          World Cup 2026 · {groupLabel}{matchday ? ` · Matchday ${matchday}` : ""}
        </p>
        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-6">
          <Link href={`/teams/${match.homeTeam.slug}`} className="grid justify-items-center gap-2 text-center">
            <TeamFlag team={match.homeTeam} width={72} />
            <span className="text-lg font-black leading-tight text-[#0E0C0A] md:text-xl">{match.homeTeam.name}</span>
          </Link>
          <span className="text-2xl font-black uppercase text-[#0E0C0A]/35 [font-family:Impact,Arial_Black,sans-serif]">vs</span>
          <Link href={`/teams/${match.awayTeam.slug}`} className="grid justify-items-center gap-2 text-center">
            <TeamFlag team={match.awayTeam} width={72} />
            <span className="text-lg font-black leading-tight text-[#0E0C0A] md:text-xl">{match.awayTeam.name}</span>
          </Link>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-bold text-[#0E0C0A]/70">
          <MatchLocalTime kickoffUtc={match.kickoffUtc} />
          <span className="inline-flex items-center gap-2">
            <MapPin size={16} className="text-[#B48A00]" />
            {venue}
          </span>
        </div>
        <div className="mt-5 flex justify-center">
          <AddToCalendarButton match={match} />
        </div>
      </header>

      <section className="mb-8">
        <h2 className="mb-3 text-2xl font-black text-[#0E0C0A]">What this match means</h2>
        <div className="grid max-w-3xl gap-3 text-sm leading-7 text-[#0E0C0A]/72 md:text-base">
          {meaning.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      {match.group ? (
        <section className="mb-8">
          <div className="mb-3 flex items-end justify-between gap-3">
            <h2 className="text-2xl font-black text-[#0E0C0A]">Group {match.group} table</h2>
            <Link href={`/groups/${match.group.toLowerCase()}`} className="inline-flex items-center gap-1 text-xs font-bold text-[#0E0C0A]/55 hover:text-[#B48A00]">
              Full group <ArrowRight size={13} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <StandingsTable rows={groupStandings} teams={groupTeams} showFlags qualifyCount={2} />
          </div>
          <p className="mt-2 text-xs text-[#0E0C0A]/50">Pre-tournament table — every team starts level. Standings update once the group stage kicks off on June 11, 2026.</p>
        </section>
      ) : null}

      <section className="mb-8 grid gap-3 sm:grid-cols-2">
        <Link
          href={`/teams/${match.homeTeam.slug}`}
          className="flex items-center gap-3 rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 shadow-[0_8px_18px_rgba(14,12,10,.05)] transition hover:border-[#E7C36B]/60"
        >
          <TeamFlag team={match.homeTeam} width={40} />
          <span className="min-w-0">
            <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#0E0C0A]/45">Team page</span>
            <span className="block truncate font-black text-[#0E0C0A]">{match.homeTeam.name}</span>
          </span>
        </Link>
        <Link
          href={`/teams/${match.awayTeam.slug}`}
          className="flex items-center gap-3 rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 shadow-[0_8px_18px_rgba(14,12,10,.05)] transition hover:border-[#E7C36B]/60"
        >
          <TeamFlag team={match.awayTeam} width={40} />
          <span className="min-w-0">
            <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#0E0C0A]/45">Team page</span>
            <span className="block truncate font-black text-[#0E0C0A]">{match.awayTeam.name}</span>
          </span>
        </Link>
      </section>

      <RelatedLinks
        links={[
          { href: "/matches", label: "Full schedule" },
          ...(match.group ? [{ href: `/groups/${match.group.toLowerCase()}`, label: `Group ${match.group}` }] : []),
          { href: "/standings", label: "All group tables" }
        ]}
      />
    </PageShell>
  );
}
