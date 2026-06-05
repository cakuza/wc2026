// cache-bust: 2026-06-04
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StructuredData } from "@/components/structured-data";
import { TeamPicker } from "@/components/team-picker";
import { TimezoneSelect } from "@/components/timezone-select";
import { TodayMatches } from "@/components/today-matches";
import { getMatchesWithTeams, getTeams } from "@/lib/football";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { formatDateKey } from "@/lib/timezones";
import type { MatchWithTeams, Team } from "@/lib/types";

// Render the homepage per request (SSR) so the CDN can never serve a stale prerendered
// build. Pages stays fast; only the home route opts out of static caching.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [matches, teams] = await Promise.all([
    getMatchesWithTeams(),
    getTeams()
  ]);
  // Group matchdays by the host (US Eastern) calendar date rather than UTC. Late kickoffs
  // roll past midnight UTC (e.g. the June 11 opener night runs into June 12 UTC), so a UTC
  // grouping would wrongly split a single matchday. Eastern keeps each matchday intact and
  // matches the official FIFA schedule. Recomputed per request (force-dynamic), so the board
  // advances to the current matchday automatically as the tournament progresses.
  const TOURNAMENT_TZ = "America/New_York";
  const dateKeyOf = (match: MatchWithTeams) => formatDateKey(match.date, TOURNAMENT_TZ);
  const todayKey = formatDateKey(new Date().toISOString(), TOURNAMENT_TZ);
  const sortedByDate = [...matches].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  const todayMatches = sortedByDate.filter((match) => dateKeyOf(match) === todayKey);
  // No matches today → fall back to the next matchday: every fixture sharing the earliest
  // upcoming match date, so the board always shows a real, complete matchday.
  const nextMatch = sortedByDate.find((match) => dateKeyOf(match) >= todayKey);
  const nextMatchdayMatches = nextMatch ? sortedByDate.filter((match) => dateKeyOf(match) === dateKeyOf(nextMatch)) : [];
  const showingToday = todayMatches.length > 0;
  const matchdayMatches = showingToday ? todayMatches : nextMatchdayMatches;
  const trending = ["brazil", "argentina", "france", "england", "mexico", "japan", "morocco", "turkey", "portugal", "germany", "spain", "netherlands"]
    .map((slug) => teamBy(teams, slug))
    .filter(Boolean) as Team[];
  // Group-stage fixtures only carry real team objects (knockout slots are placeholders),
  // so the picker's "first match" line pulls from these.
  const groupMatches = matches.filter((match) => match.stage === "group");
  // Countdown to the upcoming matchday's first kickoff (only meaningful when it's in the future).
  const firstKickoff = matchdayMatches[0]?.date;
  const daysUntilMatchday =
    !showingToday && firstKickoff
      ? Math.max(0, Math.ceil((Date.parse(firstKickoff) - Date.now()) / 86_400_000))
      : null;
  // Days to the next kickoff for the big hero pill (independent of today/next-matchday split).
  const daysToKickoff = nextMatch
    ? Math.max(0, Math.ceil((Date.parse(nextMatch.date) - Date.now()) / 86_400_000))
    : null;

  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          url: absoluteUrl("/"),
          potentialAction: {
            "@type": "SearchAction",
            target: `${absoluteUrl("/matches")}?team={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        }}
      />

      {/* CINEMATIC HERO — full-bleed, near-black with stadium-floodlight glow */}
      <section className="relative overflow-hidden bg-[#0a0a0a] text-white">
        {/* Floodlight glow: gold core + deep-red wash, ~15% opacity */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(60% 55% at 50% 38%, rgba(201,168,76,0.16), transparent 70%), radial-gradient(50% 60% at 78% 80%, rgba(139,0,0,0.18), transparent 70%)"
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,transparent_55%,rgba(0,0,0,0.75)_100%)]" />

        <div className="relative mx-auto grid min-h-[50vh] w-full max-w-7xl items-center gap-10 px-4 py-14 lg:min-h-[calc(100vh-64px)] lg:grid-cols-[1.05fr_.95fr] lg:py-0">
          {/* LEFT — magazine-cover headline */}
          <div className="py-6 lg:py-20">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#C9A84C]">
              World Cup 2026 · June 11 – July 19
            </p>
            <h1 className="mt-5 text-6xl font-black uppercase leading-[.86] tracking-[-0.01em] text-white [font-family:Impact,Arial_Black,sans-serif] sm:text-7xl md:text-8xl">
              The World&apos;s
              <br />
              Biggest
              <br />
              Tournament.
            </h1>

            {daysToKickoff !== null ? (
              <div className="mt-7">
                <span
                  className="inline-flex items-center rounded-full border border-[#C9A84C]/40 bg-[#C9A84C]/10 px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-[#E7C36B] shadow-[0_0_28px_rgba(201,168,76,0.35)]"
                >
                  {heroCountdownLabel(daysToKickoff)}
                </span>
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/matches"
                className="focus-ring inline-flex items-center gap-2 rounded-md bg-[#C9A84C] px-6 py-3.5 text-sm font-black uppercase tracking-[0.1em] text-[#0a0a0a] transition hover:bg-[#dabb5e]"
              >
                View Schedule
                <ArrowRight size={16} />
              </Link>
              <Link
                href="#pick-team"
                className="focus-ring inline-flex items-center gap-2 rounded-md border border-white/35 px-6 py-3.5 text-sm font-black uppercase tracking-[0.1em] text-white transition hover:border-white hover:bg-white/10"
              >
                Pick your team
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* RIGHT — dark glass "Next matchday" card (desktop only) */}
          <div className="hidden lg:block">
            <div className="rounded-[22px] border border-white/12 bg-white/[0.05] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#C9A84C]">{showingToday ? "Today's matches" : "Next matchday"}</p>
                  {daysUntilMatchday !== null ? (
                    <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#E7C36B]">
                      {countdownLabel(daysUntilMatchday)}
                    </span>
                  ) : null}
                </div>
                <label className="grid gap-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/55">
                  Timezone
                  <TimezoneSelect variant="dark" className="!py-2" />
                </label>
              </div>
              <TodayMatches matches={matchdayMatches} variant="dark" />
            </div>
          </div>
        </div>
      </section>

      {/* LIGHT-GRAY BAND — team discovery, separated from the dark hero */}
      <section className="bg-[#F4F4F4]">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 md:py-12">
          {/* Mobile-only matchday card (desktop shows it in the hero) */}
          <div className="mb-8 lg:hidden">
            <div className="rounded-[22px] border border-[rgba(14,12,10,.10)] bg-white p-4 shadow-[0_18px_50px_rgba(14,12,10,.10)]">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">{showingToday ? "Today's matches" : "Next matchday"}</p>
                  {daysUntilMatchday !== null ? (
                    <span className="inline-flex items-center rounded-full bg-[#0E0C0A] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#E7C36B]">
                      {countdownLabel(daysUntilMatchday)}
                    </span>
                  ) : null}
                </div>
                <label className="grid gap-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#0E0C0A]/55">
                  Timezone
                  <TimezoneSelect variant="light" className="!py-2" />
                </label>
              </div>
              <TodayMatches matches={matchdayMatches} />
            </div>
          </div>

          <div id="pick-team" className="scroll-mt-20">
            <TeamPicker teams={teams} trending={trending} matches={groupMatches} />
          </div>

          <div className="mt-8">
            <Link
              href="/groups"
              className="group flex flex-col items-start justify-between gap-4 rounded-[22px] border border-[rgba(14,12,10,.10)] bg-[#0E0C0A] p-6 text-white shadow-[0_18px_50px_rgba(14,12,10,.18)] transition hover:bg-[#23201c] sm:flex-row sm:items-center md:p-8">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#E7C36B]">Kick-off is June 11</p>
                <p className="mt-2 text-2xl font-black leading-tight md:text-3xl">Pick your team and follow every match.</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-md bg-[#E7C36B] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#0E0C0A] transition group-hover:gap-3">
                Browse all groups
                <ArrowRight size={16} />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function heroCountdownLabel(days: number) {
  if (days <= 0) return "Kicks off today";
  if (days === 1) return "Kicks off tomorrow";
  return `Kicks off in ${days} days`;
}

function countdownLabel(days: number) {
  if (days <= 0) return "Starts today";
  if (days === 1) return "Starts tomorrow";
  return `Starts in ${days} days`;
}

function teamBy(teams: Team[], slug: string) {
  return teams.find((team) => team.slug === slug || team.id === slug) || teams[0];
}
