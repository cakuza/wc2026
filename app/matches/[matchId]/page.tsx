import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LiveDataAutoRefresh } from "@/components/LiveDataAutoRefresh";
import { LiveSnapshotDebug } from "@/components/LiveSnapshotDebug";
import { MatchDetail } from "@/components/MatchDetail";
import { countryName } from "@/lib/i18n";
import { getLiveRefreshPolicy } from "@/lib/liveRefreshPolicy";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { matchBySlug } from "@/lib/matches";

export const revalidate = 30;
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ matchId: string }>;
}): Promise<Metadata> {
  const { matchId } = await params;
  const match = matchBySlug(matchId);
  if (!match) return {};

  const home = countryName(match.homeKey, "en");
  const away = countryName(match.awayKey, "en");
  const BASE = "https://www.worldcupmatchday.com";

  return {
    title: `${home} vs ${away} - FIFA World Cup 2026`,
    description: `${home} vs ${away} - Group ${match.group} - ${match.date}${match.venue ? ` - ${match.venue}` : ""} - WorldCupMatchDay`,
    alternates: { canonical: `${BASE}/matches/${matchId}` },
    openGraph: {
      title: `${home} vs ${away} - FIFA World Cup 2026`,
      description: `Group ${match.group} - ${match.date} - WorldCupMatchDay`,
      url: `${BASE}/matches/${matchId}`,
      type: "website",
    },
  };
}

function longDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${iso}T00:00:00`));
}

export default async function MatchPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const match = matchBySlug(matchId);
  if (!match) notFound();

  const snapshot = await getTournamentLiveSnapshot();
  const snap = snapshot.matches[matchId];
  const refreshPolicy = getLiveRefreshPolicy(snap ? [snap] : []);
  const events = null;
  const live = snap?.live ?? null;

  const home = countryName(match.homeKey, "en");
  const away = countryName(match.awayKey, "en");
  const dateStr = longDate(match.date);
  const venueStr = match.venue ?? "venue TBC";
  const timeStr = match.time ? `, kickoff ${match.time} venue local time (${venueStr})` : "";

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `When is ${home} vs ${away}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${home} vs ${away} is on ${dateStr}${timeStr}.`,
        },
      },
      {
        "@type": "Question",
        name: `Where is ${home} vs ${away} played?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The match is played at ${venueStr}.`,
        },
      },
      {
        "@type": "Question",
        name: `What group is ${home} vs ${away} in?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Group ${match.group ?? "TBC"} - ${home} vs ${away} at the 2026 FIFA World Cup.`,
        },
      },
    ],
  };

  return (
    <>
      <LiveDataAutoRefresh intervalMs={refreshPolicy.intervalMs} />
      <LiveSnapshotDebug snapshotId={snapshot.snapshotId} generatedAt={snapshot.generatedAt} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <MatchDetail
        match={match}
        events={events}
        live={live}
        groupStandings={match.group ? snapshot.standingsByGroup[match.group] : undefined}
        thirdPlaceRows={snapshot.thirdPlaceRanking}
      />
    </>
  );
}
