// cache-bust: 2026-06-04
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/page-shell";
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
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FF2D6B]">48 Teams · 104 Matches · 3 Host Nations</p>
          <h1 className="mt-4 max-w-2xl text-5xl font-black uppercase leading-[.95] tracking-normal text-[#0E0C0A] [font-family:Impact,Arial_Black,sans-serif] md:text-6xl">
            Your <span className="text-[#FF2D6B]">World Cup</span> <span className="text-[#1FA9F6]">2026</span> hub.
          </h1>
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
        <div className="rounded-[22px] border border-[rgba(14,12,10,.10)] bg-white p-4 shadow-[0_18px_50px_rgba(14,12,10,.10)] md:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">{showingToday ? "Today's matches" : "Next matchday"}</p>
            <label className="grid gap-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#0E0C0A]/55">
              Timezone
              <TimezoneSelect variant="light" className="!py-2" />
            </label>
          </div>
          <TodayMatches matches={matchdayMatches} />
        </div>
      </section>

      <div id="pick-team" className="mb-8">
        <TeamPicker teams={teams} trending={trending} />
      </div>

      <section className="mb-8">
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
