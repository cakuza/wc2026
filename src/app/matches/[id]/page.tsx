import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MatchIntelligencePanel } from "@/components/match-intelligence";
import { PageIntro, PageShell } from "@/components/page-shell";
import { RelatedLinks } from "@/components/related-links";
import { getMatchesWithTeams } from "@/lib/football";
import { getMatchIntelligenceBundle } from "@/lib/match-intelligence";
import { absoluteUrl } from "@/lib/site";
import { formatKickoff } from "@/lib/timezones";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  const matches = await getMatchesWithTeams();
  return matches.map((match) => ({ id: match.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const matches = await getMatchesWithTeams();
  const match = matches.find((item) => item.id === id);
  if (!match) return { title: "Match Not Found" };
  return {
    title: `${match.homeTeam.name} vs ${match.awayTeam.name} Opponent Watch`,
    description: `Opponent watch, prediction card links, and local kickoff time for ${match.homeTeam.name} vs ${match.awayTeam.name}.`,
    alternates: {
      canonical: absoluteUrl(`/matches/${id}`)
    }
  };
}

export default async function MatchDetailPage({ params }: Props) {
  const { id } = await params;
  const matches = await getMatchesWithTeams();
  const match = matches.find((item) => item.id === id);
  if (!match) notFound();
  const bundle = getMatchIntelligenceBundle(match.id, match);

  return (
    <PageShell>
      <Link href="/matches" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-white/62 hover:text-gold">
        <ArrowLeft size={16} />
        Back to matches
      </Link>
      <PageIntro
        kicker={`Group stage${match.group ? ` / Group ${match.group}` : ""}`}
        title={`${match.homeTeam.flagEmoji} ${match.homeTeam.name} vs ${match.awayTeam.name} ${match.awayTeam.flagEmoji}`}
        copy={`${formatKickoff(match.kickoffUtc, "Europe/Istanbul")} / ${match.venue}, ${match.city}. Save the matchup, drop your prediction, and share the card.`}
      />
      <MatchIntelligencePanel match={match} bundle={bundle} />
      <div className="mt-6">
        <RelatedLinks
          links={[
            { href: `/cards?template=prediction&match=${match.id}`, label: "Create prediction card" },
            { href: "/matches", label: "Full schedule" },
            { href: "/stats", label: "Stats Hub" },
            { href: "/preview", label: "Preview generator" }
          ]}
        />
      </div>
    </PageShell>
  );
}
