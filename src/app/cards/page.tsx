import type { Metadata } from "next";
import { CardGenerator } from "@/components/card-generator";
import { MonetizationSlot, PremiumTemplatesTeaser } from "@/components/monetization";
import { PageIntro, PageShell } from "@/components/page-shell";
import { RelatedLinks } from "@/components/related-links";
import { getMatchesWithTeams, getPlayersWithStats, getTeams } from "@/lib/football";
import { footballProvider } from "@/lib/providers";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Create World Cup Fan Cards People Want to Share",
  description: "Create player-watch, jersey-back, team schedule, prediction, matchday, and debate cards for Instagram, X, WhatsApp, and group chats.",
  alternates: {
    canonical: absoluteUrl("/cards")
  },
  openGraph: {
    title: "Create World Cup Fan Cards People Want to Share",
    description: "A football poster studio for player-watch cards, country roads, predictions, matchday menus, and captions.",
    url: absoluteUrl("/cards")
  }
};

export default async function CardsPage() {
  const [matches, teams, standings, players] = await Promise.all([
    getMatchesWithTeams(),
    getTeams(),
    footballProvider.getStandings(),
    getPlayersWithStats()
  ]);
  return (
    <PageShell>
      <PageIntro
        kicker="Fan card studio"
        title="Create World Cup posters for the group chat."
        copy="Start with a country road, prediction battle, player-watch, matchday menu, or Golden Boot debate. Pick any team, edit the text, choose a ratio, and export a fan-made post for Instagram, X, WhatsApp, or the group chat."
      />
      <CardGenerator matches={matches} teams={teams} standings={standings} players={players} />
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <PremiumTemplatesTeaser />
        <MonetizationSlot label="Post-launch style slot" copy="Reserved for rights-safe style concepts after export/share behavior is proven." />
      </div>
      <div className="mt-6">
        <RelatedLinks
          links={[
            { href: "/world-cup-matches-today", label: "Today's matches" },
            { href: "/world-cup-top-scorers", label: "Top scorers" },
            { href: "/world-cup-standings", label: "Standings" },
            { href: "/preview", label: "Social post templates" }
          ]}
        />
      </div>
    </PageShell>
  );
}
