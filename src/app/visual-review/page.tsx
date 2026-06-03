import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { PageShell } from "@/components/page-shell";
import { PosterPreviewCard, type PosterVariant } from "@/components/poster-engine";
import { getMatchesWithTeams, getPlayersWithStats, getTeams } from "@/lib/football";
import { footballProvider } from "@/lib/providers";
import { absoluteUrl } from "@/lib/site";
import type { MatchWithTeams, PlayerWithStats, Standing, Team } from "@/lib/types";

export const metadata: Metadata = {
  title: "World Cup Fan Hub Visual Review",
  description: "Visual review page for the implemented Festival spine, poster cards, ratios, Pro UI, and stress cases.",
  alternates: {
    canonical: absoluteUrl("/visual-review")
  }
};

const matrix: Array<{ title: string; variant: PosterVariant; team: string }> = [
  { title: "Prediction Battle", variant: "prediction", team: "mexico" },
  { title: "Country Road", variant: "road", team: "turkey" },
  { title: "Player Watch", variant: "player", team: "france" },
  { title: "Group Chaos", variant: "chaos", team: "brazil" }
];

export default async function VisualReviewPage() {
  const [teams, matches, standings, players] = await Promise.all([
    getTeams(),
    getMatchesWithTeams(),
    footballProvider.getStandings(),
    getPlayersWithStats()
  ]);
  const sampleMatch = matches.find((match) => match.id === "m026") || matches[0];
  const longTeams = ["south-africa", "dr-congo", "cote-divoire", "bosnia-and-herzegovina"]
    .map((slug) => teamBy(teams, slug))
    .filter(Boolean) as Team[];

  return (
    <PageShell>
      <section className="mb-8 rounded-[28px] border border-[rgba(14,12,10,.10)] bg-white p-5 shadow-[0_24px_70px_rgba(14,12,10,.10)] md:p-8">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FF2D6B]">Final direction implemented</p>
        <h1 className="mt-4 max-w-4xl text-6xl font-black uppercase leading-[.9] text-[#0E0C0A] [font-family:Impact,Arial_Black,sans-serif] md:text-8xl">
          Poster energy on a <span className="text-[#FF2D6B]">Festival</span> spine.
        </h1>
        <p className="mt-5 max-w-3xl text-base font-bold leading-7 text-[#0E0C0A]/62">
          This page checks the implemented homepage, cards money page, ratio reflow, Night/Gold clean preview, watermark behavior, and long-name stress cases.
        </p>
      </section>

      <section className="mb-10 grid gap-5 lg:grid-cols-2">
        <ReviewPanel title="Homepage Preview" href="/">
          <div className="grid gap-3 sm:grid-cols-[1.2fr_.8fr]">
            <PosterPreviewCard variant="road" ratio="twitter" width={360} team={teamBy(teams, "turkey")} matches={teamMatches(matches, teamBy(teams, "turkey"))} headline="Turkey fans, save this" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
              <PosterPreviewCard variant="upset" ratio="story" width={132} team={teamBy(teams, "japan")} headline="Japan upset watch" />
              <PosterPreviewCard variant="prediction" ratio="story" width={132} team={teamBy(teams, "mexico")} opponent={teamBy(teams, "south-africa")} match={sampleMatch} headline="Drop your score" />
            </div>
          </div>
        </ReviewPanel>
        <ReviewPanel title="Cards Page Preview" href="/cards">
          <div className="grid grid-cols-2 gap-4">
            {(["prediction", "player", "chaos", "road"] as PosterVariant[]).map((variant) => (
              <PosterPreviewCard key={variant} variant={variant} ratio="story" width={150} team={teamBy(teams, variant === "player" ? "france" : variant === "chaos" ? "brazil" : "turkey")} match={sampleMatch} matches={matches.slice(0, 4)} teams={teams} standings={standings} players={players} group="A" />
            ))}
          </div>
        </ReviewPanel>
      </section>

      <section className="mb-10">
        <SectionHead kicker="Claude parity check" title="Reference card system" copy="Implemented cards are checked across all three ratios, both themes, watermark states, and long-name stress cases." />
        <div className="grid gap-5 lg:grid-cols-3">
          <ReviewPanel title="9:16 Festival">
            <PosterPreviewCard variant="prediction" ratio="story" width={190} team={teamBy(teams, "mexico")} opponent={teamBy(teams, "south-africa")} match={sampleMatch} headline="Drop your score" />
          </ReviewPanel>
          <ReviewPanel title="1:1 Festival">
            <PosterPreviewCard variant="player" ratio="square" width={260} team={teamBy(teams, "japan")} playerName="JAPAN" headline="JAPAN WATCH" />
          </ReviewPanel>
          <ReviewPanel title="16:9 Night / Gold">
            <PosterPreviewCard variant="chaos" ratio="twitter" width={420} team={teamBy(teams, "brazil")} teams={teams} standings={standings} group="D" headline="Group D is loaded" theme="night-gold" pro />
          </ReviewPanel>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {longTeams.map((team) => (
            <ReviewPanel key={team.id} title={team.name}>
              <PosterPreviewCard variant="road" ratio="twitter" width={500} team={team} matches={teamMatches(matches, team)} headline={`${team.name} road starts here`} />
            </ReviewPanel>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <SectionHead kicker="4 x 3 matrix" title="Ratio reflow check" copy="Each template renders separately for Story, Square, and 16:9. 16:9 uses landscape composition rather than a crop." />
        <div className="grid gap-5">
          {matrix.map((item) => (
            <RatioRow key={item.title} title={item.title} variant={item.variant} team={teamBy(teams, item.team)} match={sampleMatch} matches={matches} teams={teams} standings={standings} players={players} />
          ))}
        </div>
      </section>

      <section className="mb-10 grid gap-5 lg:grid-cols-2">
        <ReviewPanel title="Night / Gold Premium Pack">
          <div className="flex gap-4 overflow-x-auto pb-2">
            <PosterPreviewCard variant="player" ratio="story" width={170} team={teamBy(teams, "france")} playerName="MBAPPE" headline="MBAPPE WATCH" theme="night-gold" pro />
            <PosterPreviewCard variant="road" ratio="story" width={170} team={teamBy(teams, "argentina")} matches={teamMatches(matches, teamBy(teams, "argentina"))} theme="night-gold" pro />
            <PosterPreviewCard variant="boot" ratio="story" width={170} team={teamBy(teams, "france")} players={players} theme="night-gold" pro />
          </div>
        </ReviewPanel>
        <ReviewPanel title="Watermark - Free vs Pro">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div>
              <PosterPreviewCard variant="player" ratio="story" width={170} team={teamBy(teams, "france")} playerName="MBAPPE" headline="MBAPPE WATCH" />
              <p className="mt-2 text-center text-[10px] font-black uppercase tracking-[0.12em] text-[#0E0C0A]/50">Free - watermark</p>
            </div>
            <p className="text-3xl font-black text-[#0E0C0A]">to</p>
            <div>
              <PosterPreviewCard variant="player" ratio="story" width={170} team={teamBy(teams, "france")} playerName="MBAPPE" headline="MBAPPE WATCH" theme="night-gold" pro />
              <p className="mt-2 text-center text-[10px] font-black uppercase tracking-[0.12em] text-[#8A6400]">Pro - clean</p>
            </div>
          </div>
        </ReviewPanel>
      </section>

      <section className="mb-10">
        <SectionHead kicker="Stress tests" title="Crowding and long names" copy="Known edge cases from the design direction: Group Chaos 16:9 and long country names should stay readable." />
        <div className="grid gap-5 lg:grid-cols-2">
          <ReviewPanel title="Group Chaos 16:9">
            <PosterPreviewCard variant="chaos" ratio="twitter" width={560} team={teamBy(teams, "brazil")} teams={teams} standings={standings} group="D" headline="Group D is loaded" />
          </ReviewPanel>
          <ReviewPanel title="Long Country Names">
            <div className="grid gap-4">
              {longTeams.map((team) => (
                <PosterPreviewCard key={team.id} variant="road" ratio="twitter" width={520} team={team} matches={teamMatches(matches, team)} headline={`${team.name} road starts here`} />
              ))}
            </div>
          </ReviewPanel>
        </div>
      </section>

      <section className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 md:p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">Manual routes to inspect</p>
        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["/", "Homepage"],
            ["/cards", "Cards money page"],
            ["/visual-review", "Visual review"],
            ["/teams/turkey-world-cup-schedule", "Turkey team page"],
            ["/teams/japan-world-cup-schedule", "Japan team page"],
            ["/teams/morocco-world-cup-schedule", "Morocco team page"],
            ["/teams/mexico-world-cup-schedule", "Mexico team page"],
            ["/cards?template=prediction&match=m026", "Prediction card"],
            ["/cards?template=golden-boot", "Golden Boot card"],
            ["/cards?template=player-watch&player=custom&name=Mbappe", "Custom player watch"]
          ].map(([href, label]) => (
            <Link key={href} href={href} className="rounded-md border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] px-3 py-2 text-sm font-bold text-[#0E0C0A]/75 hover:text-[#B48A00]">
              {label}
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

function RatioRow({
  title,
  variant,
  team,
  match,
  matches,
  teams,
  standings,
  players
}: {
  title: string;
  variant: PosterVariant;
  team: Team;
  match: MatchWithTeams;
  matches: MatchWithTeams[];
  teams: Team[];
  standings: Standing[];
  players: PlayerWithStats[];
}) {
  return (
    <div className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4">
      <p className="mb-4 text-xl font-black uppercase text-[#0E0C0A] [font-family:Impact,Arial_Black,sans-serif]">{title}</p>
      <div className="grid items-center gap-4 lg:grid-cols-[auto_auto_1fr]">
        <PosterPreviewCard variant={variant} ratio="story" width={178} team={team} match={match} matches={teamMatches(matches, team)} teams={teams} standings={standings} players={players} group={team.group} />
        <PosterPreviewCard variant={variant} ratio="square" width={250} team={team} match={match} matches={teamMatches(matches, team)} teams={teams} standings={standings} players={players} group={team.group} />
        <PosterPreviewCard variant={variant} ratio="twitter" width={420} team={team} match={match} matches={teamMatches(matches, team)} teams={teams} standings={standings} players={players} group={team.group} />
      </div>
    </div>
  );
}

function ReviewPanel({ title, href, children }: { title: string; href?: string; children: ReactNode }) {
  return (
    <article className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 shadow-[0_14px_34px_rgba(14,12,10,.07)] md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-black uppercase leading-none text-[#0E0C0A] [font-family:Impact,Arial_Black,sans-serif]">{title}</h2>
        {href ? <Link href={href} className="text-sm font-bold text-[#0E0C0A]/58 hover:text-[#B48A00]">Open</Link> : null}
      </div>
      {children}
    </article>
  );
}

function SectionHead({ kicker, title, copy }: { kicker: string; title: string; copy: string }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">{kicker}</p>
      <h2 className="mt-1 text-4xl font-black uppercase leading-none text-[#0E0C0A] [font-family:Impact,Arial_Black,sans-serif]">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-[#0E0C0A]/58">{copy}</p>
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
