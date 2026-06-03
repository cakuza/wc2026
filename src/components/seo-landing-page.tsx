import Link from "next/link";
import { AdSlot } from "@/components/ad-slot";
import { RelatedLinks } from "@/components/related-links";
import { FaqBlock, InternalLinksBlock, LastUpdatedBlock, SeoIntroBlock } from "@/components/seo-blocks";
import { SectionCard } from "@/components/section-card";
import { defaultFaqs, coreInternalLinks, seoLandingPages } from "@/lib/seo-content";
import type { DataMeta, MatchWithTeams, PlayerWithStats, Standing, Team } from "@/lib/types";
import { formatKickoff } from "@/lib/timezones";
import { sortPlayersByStat, sortStandings } from "@/lib/utils";

type PageConfig = (typeof seoLandingPages)[number];

export function SeoLandingPage({
  config,
  matches,
  teams,
  standings,
  players,
  meta
}: {
  config: PageConfig;
  matches: MatchWithTeams[];
  teams: Team[];
  standings: Standing[];
  players: PlayerWithStats[];
  meta: DataMeta;
}) {
  return (
    <div className="grid gap-6">
      <SeoIntroBlock kicker={config.kicker} title={config.heading} paragraphs={config.intro} />
      <LastUpdatedBlock meta={meta} />
      <PrimarySeoContent config={config} matches={matches} teams={teams} standings={standings} players={players} />
      <AdSlot placement="sidebar" className="hidden lg:block" />
      <AdSlot placement="in-content" />
      <RelatedLinks
        links={[
          { href: "/matches", label: "Full schedule" },
          { href: "/cards", label: "Create cards" },
          { href: "/teams", label: "Team pages" }
        ]}
      />
      <InternalLinksBlock
        links={[
          ...coreInternalLinks
        ]}
      />
      <FaqBlock items={defaultFaqs} />
    </div>
  );
}

function PrimarySeoContent({
  config,
  matches,
  teams,
  standings,
  players
}: {
  config: PageConfig;
  matches: MatchWithTeams[];
  teams: Team[];
  standings: Standing[];
  players: PlayerWithStats[];
}) {
  if (config.mode === "standings") {
    const rows = sortStandings(standings.filter((row) => row.group === "A"));
    return (
      <SectionCard title="Featured group table">
        <div className="grid gap-3">
          {rows.map((row, index) => {
            const team = teams.find((item) => item.id === row.teamId);
            return (
              <div key={row.teamId} className="grid grid-cols-[auto_1fr_auto] gap-3 rounded-md bg-white/[0.04] p-3">
                <span className="font-black text-gold">{index + 1}</span>
                <span className="font-bold text-white">{team?.name || row.teamId}</span>
                <span className="font-black text-gold">{row.points} pts</span>
              </div>
            );
          })}
        </div>
      </SectionCard>
    );
  }

  if (config.mode === "top-scorers" || config.mode === "assists" || config.mode === "yellow-cards") {
    const stat = config.mode === "assists" ? "assists" : config.mode === "yellow-cards" ? "yellowCards" : "goals";
    const label = config.mode === "assists" ? "Assists" : config.mode === "yellow-cards" ? "Yellow cards" : "Goals";
    return (
      <SectionCard title={label}>
        <div className="grid gap-3">
          {sortPlayersByStat(players, stat).slice(0, 8).map((player, index) => (
            <div key={player.id} className="grid grid-cols-[auto_1fr_auto] gap-3 rounded-md bg-white/[0.04] p-3">
              <span className="font-black text-gold">{index + 1}</span>
              <span>
                <span className="block font-bold text-white">{player.name}</span>
                <span className="text-sm text-white/55">{player.team.name}</span>
              </span>
              <span className="font-black text-gold">{player[stat]}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title={config.mode === "matches-today" ? "Today's match window" : "Upcoming fixtures"}>
      <div className="grid gap-3">
        {matches.slice(0, 6).map((match) => (
          <Link key={match.id} href="/matches" className="rounded-md bg-white/[0.04] p-4 transition hover:bg-white/[0.07]">
            <p className="font-black text-white">{match.homeTeam.name} vs {match.awayTeam.name}</p>
            <p className="mt-1 text-sm text-white/60">{formatKickoff(match.kickoffUtc, "Europe/Istanbul")} / {match.venue}</p>
          </Link>
        ))}
      </div>
    </SectionCard>
  );
}
