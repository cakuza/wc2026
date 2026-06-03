import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Bell, Clock, ImageIcon, Sparkles } from "lucide-react";
import { FaqBlock, LastUpdatedBlock } from "@/components/seo-blocks";
import { HomeTimezoneQuick } from "@/components/home-timezone-quick";
import { PageShell } from "@/components/page-shell";
import { PosterPreviewCard } from "@/components/poster-engine";
import { RelatedLinks } from "@/components/related-links";
import { StructuredData } from "@/components/structured-data";
import { TeamPicker } from "@/components/team-picker";
import { getDataMeta, getMatchesWithTeams, getPlayersWithStats, getTeams } from "@/lib/football";
import { defaultFaqs } from "@/lib/seo-content";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { formatDateKey } from "@/lib/timezones";
import type { MatchWithTeams, Team } from "@/lib/types";

export default async function HomePage() {
  const [matches, teams, players, meta] = await Promise.all([
    getMatchesWithTeams(),
    getTeams(),
    getPlayersWithStats(),
    getDataMeta()
  ]);
  const todayKey = formatDateKey(new Date().toISOString());
  const todayMatches = matches.filter((match) => formatDateKey(match.date) === todayKey);
  const featuredMatches = todayMatches.length ? todayMatches : matches.slice(0, 4);
  const turkey = teamBy(teams, "turkey");
  const japan = teamBy(teams, "japan");
  const mexico = teamBy(teams, "mexico");
  const france = teamBy(teams, "france");
  const trending = ["brazil", "argentina", "france", "england", "mexico", "japan", "morocco", "turkey", "portugal", "germany", "spain", "netherlands"]
    .map((slug) => teamBy(teams, slug))
    .filter(Boolean) as Team[];
  const turkeyRoad = teamMatches(matches, turkey);

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
          <p className="mt-5 max-w-2xl text-base font-bold leading-7 text-[#0E0C0A]/62">
            Fan-made World Cup 2026 posters for all 48 teams. Country roads, prediction battles, player-watch cards. No signup. Just pick and share.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/cards" className="focus-ring inline-flex items-center gap-2 rounded-md bg-[#0E0C0A] px-5 py-3 font-black text-white">
              <ImageIcon size={18} />
              Create a fan card
              <ArrowRight size={18} />
            </Link>
            <Link href="/teams" className="focus-ring inline-flex items-center gap-2 rounded-md border border-[rgba(14,12,10,.14)] px-5 py-3 font-black text-[#0E0C0A]">
              Pick your country
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {["48 teams", "12 groups", "3 share ratios", "Fan-made", "No official marks"].map((item) => (
              <span key={item} className="rounded-full border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#0E0C0A]/72">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1.25fr_.75fr]">
          <Link href="/cards?template=team-schedule&team=turkey" className="overflow-hidden rounded-[22px]">
            <PosterPreviewCard variant="road" ratio="twitter" width={520} team={turkey} matches={turkeyRoad} headline="Turkey fans, save this" />
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
          <Link href="/teams" className="text-sm font-bold text-[#0E0C0A]/62 hover:text-[#B48A00]">All teams</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {trending.map((team) => (
            <Link key={team.id} href={`/teams/${team.slug}-world-cup-schedule`} className="grid min-w-[76px] justify-items-center gap-2 rounded-md border border-[rgba(14,12,10,.10)] bg-white p-3 shadow-[0_8px_18px_rgba(14,12,10,.06)]">
              <span className="text-4xl">{team.flagEmoji}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#0E0C0A]/58">{team.fifaCode}</span>
            </Link>
          ))}
        </div>
      </section>

      <div id="pick-team" className="mb-8">
        <TeamPicker teams={teams} />
      </div>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <StatCard icon={<Clock size={18} />} label="Sample fixture times" value={`${matches.filter((match) => match.kickoffUtc).length}`} />
        <StatCard icon={<Sparkles size={18} />} label="Poster templates" value="8" />
        <StatCard icon={<Bell size={18} />} label="Schedule honesty" value="Ready" />
      </section>

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

      <section className="mb-8 grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 md:p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">Style preview later</p>
          <h2 className="mt-2 text-3xl font-black uppercase leading-none text-[#0E0C0A] [font-family:Impact,Arial_Black,sans-serif]">Night / Gold pack</h2>
          <p className="mt-3 text-sm font-bold leading-6 text-[#0E0C0A]/62">Free Festival cards are the MVP. Night / Gold stays a non-blocking visual preview for later style exploration.</p>
          <div className="mt-4 flex gap-3 overflow-hidden">
            <PosterPreviewCard variant="player" ratio="story" width={150} team={france} players={players} playerName="MBAPPE" headline="MBAPPE WATCH" theme="night-gold" pro />
            <PosterPreviewCard variant="boot" ratio="story" width={150} team={france} players={players} theme="night-gold" pro />
          </div>
        </div>
        <div className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 md:p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">MVP scope</p>
          <h2 className="mt-2 text-3xl font-black uppercase leading-none text-[#0E0C0A] [font-family:Impact,Arial_Black,sans-serif]">Make the card. Share the card.</h2>
          <p className="mt-3 text-sm font-bold leading-6 text-[#0E0C0A]/62">The launch flow stays simple: pick a country, choose a poster, edit the text, copy or download it.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/cards" className="focus-ring rounded-md bg-[#0E0C0A] px-4 py-3 text-sm font-black text-white">Open cards</Link>
            <Link href="#pick-country" className="focus-ring rounded-md border border-[rgba(14,12,10,.12)] px-4 py-3 text-sm font-bold text-[#0E0C0A]">Pick country</Link>
          </div>
        </div>
      </section>

      <RelatedLinks
        links={[
          { href: "/world-cup-schedule-local-time", label: "Local-time schedule" },
          { href: "/world-cup-standings", label: "Standings SEO page" },
          { href: "/world-cup-top-scorers", label: "Top scorers" },
          { href: "/stats", label: "Stats hub" },
          { href: "/matches/m026", label: "Opponent Watch sample" },
          { href: "/cards", label: "Card generator" }
        ]}
      />

      <div className="mt-8">
        <FaqBlock items={defaultFaqs} />
      </div>
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

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 shadow-[0_10px_24px_rgba(14,12,10,.06)]">
      <div className="mb-3 text-[#B48A00]">{icon}</div>
      <p className="text-3xl font-black text-[#0E0C0A]">{value}</p>
      <p className="text-sm text-[#0E0C0A]/55">{label}</p>
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
