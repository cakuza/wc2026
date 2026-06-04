// cache-bust: 2026-06-04
import Link from "next/link";
import { HomeTimezoneQuick } from "@/components/home-timezone-quick";
import { NextMatchPanel } from "@/components/next-match-panel";
import { PageShell } from "@/components/page-shell";
import { StructuredData } from "@/components/structured-data";
import { TeamFlag } from "@/components/team-flag";
import { TeamPicker } from "@/components/team-picker";
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
  // Tournament-first hero: feature the very next fixture and list the ones after it.
  const upcomingMatches = sortedByDate.filter((match) => dateKeyOf(match) >= todayKey);
  const heroFeatured = upcomingMatches[0];
  const heroUpcoming = upcomingMatches.slice(1, 4);
  const trending = ["brazil", "argentina", "france", "england", "mexico", "japan", "morocco", "turkey", "portugal", "germany", "spain", "netherlands"]
    .map((slug) => teamBy(teams, slug))
    .filter(Boolean) as Team[];

  return (
    <PageShell>
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

      <section className="mb-8 grid gap-8 rounded-[28px] border border-[rgba(14,12,10,.10)] bg-white p-5 shadow-[0_24px_70px_rgba(14,12,10,.10)] md:p-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FF2D6B]">June 11 – July 19 · USA · Canada · Mexico</p>
          <h1 className="mt-4 max-w-3xl text-6xl font-black uppercase leading-[.9] tracking-normal text-[#0E0C0A] [font-family:Impact,Arial_Black,sans-serif] md:text-8xl">
            Your <span className="text-[#FF2D6B]">World Cup</span> <span className="text-[#1FA9F6]">2026</span> hub.
          </h1>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/teams" className="focus-ring inline-flex items-center justify-center rounded-md bg-[#0E0C0A] px-6 py-3 font-black text-white transition hover:bg-[#23201c]">
              Teams
            </Link>
            <Link href="/matches" className="focus-ring inline-flex items-center justify-center rounded-md border border-[rgba(14,12,10,.16)] bg-white px-6 py-3 font-black text-[#0E0C0A] transition hover:border-[#0E0C0A]/40">
              Schedule
            </Link>
            <Link href="/cards" className="focus-ring inline-flex items-center justify-center rounded-md border border-[rgba(14,12,10,.16)] bg-white px-6 py-3 font-black text-[#0E0C0A] transition hover:border-[#0E0C0A]/40">
              Cards
            </Link>
          </div>
          <div className="mt-6">
            <ScoreboardChipRow
              chips={[
                { value: "48 NATIONS" },
                { value: "104 MATCHES" },
                { value: "3 HOSTS" },
                { value: "ONE DREAM" }
              ]}
            />
          </div>
        </div>
        <NextMatchPanel featured={heroFeatured} upcoming={heroUpcoming} />
      </section>

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">Trending teams · tap to open</p>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {trending.map((team) => (
            <Link key={team.id} href={`/teams/${team.slug}-world-cup-schedule`} className="grid min-w-[84px] justify-items-center gap-2 rounded-md border border-[rgba(14,12,10,.10)] bg-white p-3 shadow-[0_8px_18px_rgba(14,12,10,.06)]">
              <TeamFlag team={team} width={48} />
              <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#0E0C0A]/58">{team.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <div id="pick-team" className="mb-8">
        <TeamPicker teams={teams} />
      </div>

      <section className="mb-8 grid gap-5 lg:grid-cols-[1.35fr_.85fr]">
        <div className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 md:p-5">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">{showingToday ? "On today" : "Next matchday"}</p>
              <h2 className="mt-1 text-2xl font-black text-[#0E0C0A]">Today&apos;s Matches</h2>
            </div>
            <Link href="/world-cup-matches-today" className="text-sm font-bold text-[#0E0C0A]/62 hover:text-[#B48A00]">Open schedule</Link>
          </div>
          <TodayMatches matches={matchdayMatches} />
        </div>
        <div className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 md:p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">Local time helper</p>
          <div className="mt-4 rounded-lg border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] p-4">
            <HomeTimezoneQuick match={matchdayMatches[0]} />
          </div>
        </div>
      </section>

    </PageShell>
  );
}

// Stadium scoreboard stat chips — ported from design-reference/wc-chips.jsx
const CHIP_GOLD = "#E7C36B";
const CHIP_ANTON = "var(--font-anton, Anton, sans-serif)";

type ScoreboardChipData = { value: string; accent?: string };

function ScoreboardChip({ value, accent = CHIP_GOLD }: ScoreboardChipData) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: "rgba(14,12,10,.94)",
        border: "1px solid rgba(231,195,107,.15)",
        borderTop: `2px solid ${accent}55`,
        borderRadius: 5,
        padding: "11px 16px",
        minWidth: 84,
        boxShadow: "0 2px 14px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.03)"
      }}
    >
      <span
        style={{
          fontFamily: CHIP_ANTON,
          fontSize: 20,
          color: accent,
          lineHeight: 1,
          letterSpacing: "-.3px",
          whiteSpace: "nowrap"
        }}
      >
        {value}
      </span>
    </div>
  );
}

function ScoreboardChipRow({ chips, gap = 8 }: { chips: ScoreboardChipData[]; gap?: number }) {
  return (
    <div style={{ display: "flex", gap, flexWrap: "wrap", alignItems: "stretch" }}>
      {chips.map((chip) => (
        <ScoreboardChip key={chip.value} value={chip.value} accent={chip.accent} />
      ))}
    </div>
  );
}

function teamBy(teams: Team[], slug: string) {
  return teams.find((team) => team.slug === slug || team.id === slug) || teams[0];
}
