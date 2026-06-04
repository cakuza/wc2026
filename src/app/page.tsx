// cache-bust: 2026-06-04
import Link from "next/link";
import { LastUpdatedBlock } from "@/components/seo-blocks";
import { HomeTimezoneQuick } from "@/components/home-timezone-quick";
import { PageShell } from "@/components/page-shell";
import { PosterPreviewCard } from "@/components/poster-engine";
import { StructuredData } from "@/components/structured-data";
import { TeamFlag } from "@/components/team-flag";
import { TeamPicker } from "@/components/team-picker";
import { getDataMeta, getMatchesWithTeams, getTeams } from "@/lib/football";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { formatDateKey } from "@/lib/timezones";
import type { MatchWithTeams, Team } from "@/lib/types";

// Render the homepage per request (SSR) so the CDN can never serve a stale prerendered
// build. Pages stays fast; only the home route opts out of static caching.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [matches, teams, meta] = await Promise.all([
    getMatchesWithTeams(),
    getTeams(),
    getDataMeta()
  ]);
  const todayKey = formatDateKey(new Date().toISOString());
  const todayMatches = matches.filter((match) => formatDateKey(match.date) === todayKey);
  const featuredMatches = todayMatches.length ? todayMatches : matches.slice(0, 4);
  // Rotate the hero road poster across a pool of big fan bases so the homepage never looks
  // like a "Turkey-only" site. Picked per request (page is force-dynamic) for fresh variety.
  const heroPool = ["brazil", "france", "japan", "mexico", "argentina", "england"];
  const heroTeam = teamBy(teams, heroPool[Math.floor(Math.random() * heroPool.length)]);
  const japan = teamBy(teams, "japan");
  const mexico = teamBy(teams, "mexico");
  const trending = ["brazil", "argentina", "france", "england", "mexico", "japan", "morocco", "turkey", "portugal", "germany", "spain", "netherlands"]
    .map((slug) => teamBy(teams, slug))
    .filter(Boolean) as Team[];
  const heroRoad = teamMatches(matches, heroTeam);

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
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FF2D6B]">World Cup 2026 fan hub</p>
          <h1 className="mt-4 max-w-3xl text-6xl font-black uppercase leading-[.9] tracking-normal text-[#0E0C0A] [font-family:Impact,Arial_Black,sans-serif] md:text-8xl">
            Pick your <span className="text-[#FF2D6B]">country.</span><br />
            Build the <span className="text-[#FF6A1A]">hype.</span><br />
            Share the <span className="text-[#1FA9F6]">road.</span>
          </h1>
          <div className="mt-6">
            <ScoreboardChipRow
              chips={[
                { label: "Nations", value: "48 NATIONS" },
                { label: "Matches", value: "104 MATCHES" },
                { label: "Hosts", value: "3 HOSTS" },
                { label: "Dream", value: "ONE DREAM" }
              ]}
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1.25fr_.75fr]">
          <Link href={`/cards?template=team-schedule&team=${heroTeam.slug}`} className="overflow-hidden rounded-[22px]">
            <PosterPreviewCard variant="road" ratio="twitter" width={520} team={heroTeam} matches={heroRoad} headline={`${heroTeam.name} fans, save this`} />
          </Link>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
            <Link href="/cards?template=opponent-watch&team=japan" className="overflow-hidden rounded-[18px]">
              <PosterPreviewCard variant="upset" ratio="story" width={170} team={japan} headline="Japan upset watch" />
            </Link>
            <Link href="/cards?template=prediction&match=m026" className="overflow-hidden rounded-[18px]">
              <PosterPreviewCard variant="prediction" ratio="story" width={170} team={mexico} opponent={teams.find((team) => team.slug === "south-africa")} match={matches.find((match) => match.id === "m026") || featuredMatches[0]} headline="Drop your score" />
            </Link>
          </div>
        </div>
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
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">{todayMatches.length ? "Today's matchday menu" : "Next matchday menu"}</p>
              <h2 className="mt-1 text-2xl font-black text-[#0E0C0A]">Save the matchups</h2>
            </div>
            <Link href="/world-cup-matches-today" className="text-sm font-bold text-[#0E0C0A]/62 hover:text-[#B48A00]">Open schedule</Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {featuredMatches.map((match) => (
              <MatchTile key={match.id} match={match} />
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 md:p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">Local time helper</p>
          <div className="mt-4 rounded-lg border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] p-4">
            <HomeTimezoneQuick match={featuredMatches[0]} />
          </div>
          <div className="mt-4">
            <LastUpdatedBlock meta={meta} />
          </div>
        </div>
      </section>

    </PageShell>
  );
}

function MatchTile({ match }: { match: MatchWithTeams }) {
  return (
    <Link href={`/cards?template=prediction&match=${match.id}`} className="rounded-md border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] p-4 transition hover:bg-white hover:shadow-[0_10px_24px_rgba(14,12,10,.08)]">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#B48A00]">Save the matchup</p>
      <h3 className="mt-2 text-2xl font-black uppercase leading-none text-[#0E0C0A] [font-family:Impact,Arial_Black,sans-serif]">
        {match.homeTeam.flagEmoji} {match.homeTeam.fifaCode} vs {match.awayTeam.fifaCode} {match.awayTeam.flagEmoji}
      </h3>
      <p className="mt-2 text-sm font-bold text-[#0E0C0A]/56">{match.venue === "TBD" || match.city === "TBD" ? "Venue unavailable" : `${match.venue}, ${match.city}`}</p>
    </Link>
  );
}

// Stadium scoreboard stat chips — ported from design-reference/wc-chips.jsx
const CHIP_GOLD = "#E7C36B";
const CHIP_MONO = '"Space Mono", monospace';
const CHIP_ANTON = "var(--font-anton, Anton, sans-serif)";

type ScoreboardChipData = { label: string; value: string; accent?: string };

function ScoreboardChip({ label, value, accent = CHIP_GOLD }: ScoreboardChipData) {
  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        background: "rgba(14,12,10,.94)",
        border: "1px solid rgba(231,195,107,.15)",
        borderTop: `2px solid ${accent}55`,
        borderRadius: 5,
        padding: "9px 16px 11px",
        minWidth: 84,
        boxShadow: "0 2px 14px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.03)"
      }}
    >
      <span
        style={{
          fontFamily: CHIP_MONO,
          fontSize: 8,
          letterSpacing: "2.5px",
          color: `${accent}99`,
          textTransform: "uppercase",
          lineHeight: 1,
          marginBottom: 5,
          whiteSpace: "nowrap"
        }}
      >
        {label}
      </span>
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
        <ScoreboardChip key={chip.label} label={chip.label} value={chip.value} accent={chip.accent} />
      ))}
    </div>
  );
}

function teamBy(teams: Team[], slug: string) {
  return teams.find((team) => team.slug === slug || team.id === slug) || teams[0];
}

function teamMatches(matches: MatchWithTeams[], team?: Team) {
  if (!team) return matches.slice(0, 3);
  return matches.filter((match) => match.homeTeamId === team.id || match.awayTeamId === team.id).slice(0, 3);
}
