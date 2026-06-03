import type { Metadata } from "next";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { PageIntro, PageShell } from "@/components/page-shell";
import { RelatedLinks } from "@/components/related-links";
import { LastUpdatedBlock } from "@/components/seo-blocks";
import { SectionCard } from "@/components/section-card";
import { getPlayersWithStats } from "@/lib/football";
import { footballProvider } from "@/lib/providers";
import { absoluteUrl } from "@/lib/site";
import { sortPlayersByStat } from "@/lib/utils";

export const metadata: Metadata = {
  title: "World Cup 2026 Leaderboards",
  description: "Mock World Cup 2026 top scorers, assists, yellow cards, and red cards leaderboards.",
  alternates: {
    canonical: absoluteUrl("/leaderboards")
  },
  openGraph: {
    title: "World Cup 2026 Leaderboards",
    description: "Player stat boards with create-card actions.",
    url: absoluteUrl("/leaderboards")
  }
};

export default async function LeaderboardsPage() {
  const [players, meta] = await Promise.all([
    getPlayersWithStats(),
    footballProvider.getMeta()
  ]);
  return (
    <PageShell>
      <PageIntro
        kicker="Leaderboards"
        title="Player stats with share-card entry points."
        copy={`${meta.note} For a more fan-friendly view, use the new Stats Hub.`}
      />
      <div className="mb-5">
        <LastUpdatedBlock meta={meta} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Board title="Top Scorers" players={sortPlayersByStat(players, "goals").slice(0, 10)} stat="goals" label="Goals" />
        <Board title="Assists" players={sortPlayersByStat(players, "assists").slice(0, 10)} stat="assists" label="Assists" />
        <Board title="Yellow Cards" players={sortPlayersByStat(players, "yellowCards").slice(0, 10)} stat="yellowCards" label="Yellow" />
        <Board title="Red Cards" players={sortPlayersByStat(players, "redCards").slice(0, 10)} stat="redCards" label="Red" />
      </div>
      <div className="mt-6">
        <RelatedLinks
          links={[
            { href: "/world-cup-top-scorers", label: "Top scorers page" },
            { href: "/world-cup-assists-leaderboard", label: "Assists page" },
            { href: "/world-cup-yellow-cards", label: "Yellow cards page" },
            { href: "/stats", label: "Stats Hub" },
            { href: "/cards", label: "Create leaderboard card" },
            { href: "/preview", label: "Match previews" }
          ]}
        />
      </div>
    </PageShell>
  );
}

function Board({
  title,
  players,
  stat,
  label
}: {
  title: string;
  players: Awaited<ReturnType<typeof getPlayersWithStats>>;
  stat: "goals" | "assists" | "yellowCards" | "redCards";
  label: string;
}) {
  return (
    <SectionCard title={title}>
      <div className="grid gap-2">
        {players.map((player, index) => (
          <div key={player.id} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 rounded-md bg-white/[0.04] p-3">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-gold/12 text-sm font-black text-gold">{index + 1}</span>
            <div>
              <p className="font-bold text-white">{player.name}</p>
              <p className="text-sm text-white/55">{player.team.name}</p>
            </div>
            <span className="text-right font-black text-gold" aria-label={label}>{player[stat]}</span>
            <Link href="/cards" className="focus-ring grid h-9 w-9 place-items-center rounded-md border border-white/12 text-gold" title="Create card">
              <ImageIcon size={16} />
              <span className="sr-only">Create card</span>
            </Link>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
