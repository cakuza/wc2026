import Link from "next/link";
import { AdSlot } from "@/components/ad-slot";
import { FaqBlock, InternalLinksBlock, LastUpdatedBlock, SeoIntroBlock } from "@/components/seo-blocks";
import { SectionCard } from "@/components/section-card";
import { coreInternalLinks, defaultFaqs } from "@/lib/seo-content";
import type { MatchWithTeams, Team } from "@/lib/types";
import { formatKickoff } from "@/lib/timezones";

export function TeamScheduleSeoPage({
  teamName,
  team,
  fixtures,
  fallbackMatches
}: {
  teamName: string;
  team?: Team;
  fixtures: MatchWithTeams[];
  fallbackMatches: MatchWithTeams[];
}) {
  const hasFixtures = fixtures.length > 0;
  const displayMatches = hasFixtures ? fixtures : fallbackMatches.slice(0, 4);

  return (
    <div className="grid gap-6">
      <SeoIntroBlock
        kicker="Team schedule"
        title={`${teamName} World Cup road and fixture slots`}
        paragraphs={[
          hasFixtures
            ? `${teamName} fixtures are available as World Cup 2026 matchup slots. Use this page for road context and quick links to shareable card tools.`
            : `${teamName} is included as a schedule page. If confirmed fixtures are not available yet, this page links fans to the full matchup board and card tools.`,
          "The site stays low-cost by using static JSON data first. That keeps pages fast, indexable, and easy to deploy on the Vercel free tier."
        ]}
      />
      <LastUpdatedBlock />
      <SectionCard title={hasFixtures ? `${teamName} fixtures` : "Current fixture slots"}>
        <div className="grid gap-3">
          {displayMatches.map((match) => {
            const opponent = team && match.homeTeamId === team.id ? match.awayTeam : match.homeTeam;
            return (
              <Link key={match.id} href="/matches" className="rounded-md bg-white/[0.04] p-4 transition hover:bg-white/[0.07]">
                <p className="font-black text-white">
                  {hasFixtures && team ? `${team.fifaCode} vs ${opponent.fifaCode}` : `${match.homeTeam.name} vs ${match.awayTeam.name}`}
                </p>
                <p className="mt-1 text-sm text-white/60">{formatKickoff(match.kickoffUtc, "Europe/Istanbul")} / {match.venue}</p>
              </Link>
            );
          })}
        </div>
      </SectionCard>
      <AdSlot placement="in-content" />
      <InternalLinksBlock
        links={[
          { href: "/world-cup-schedule-local-time", label: "Time conversion later", description: "Use timezone conversion once official kickoffs are added." },
          { href: "/cards", label: "Team schedule card", description: "Create a shareable image for team fixtures." },
          ...coreInternalLinks.slice(1, 3)
        ]}
      />
      <FaqBlock
        items={[
          {
            question: `Where can I find ${teamName} World Cup matches?`,
            answer: hasFixtures
              ? `${teamName} fixtures are listed above as current matchup slots.`
              : `${teamName} fixtures are not present in the current draw yet. The page is ready for manual JSON updates or a cached API feed later.`
          },
          ...defaultFaqs
        ]}
      />
    </div>
  );
}
