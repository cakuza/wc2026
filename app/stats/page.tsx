import type { Metadata } from "next";
import { LiveDataAutoRefresh } from "@/components/LiveDataAutoRefresh";
import { LiveSnapshotDebug } from "@/components/LiveSnapshotDebug";
import { LiveDataUnavailableNotice } from "@/components/LiveDataUnavailableNotice";
import StatsContent from "@/components/StatsContent";
import { getLiveRefreshPolicy } from "@/lib/liveRefreshPolicy";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";

export const revalidate = 30;
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "World Cup 2026 Stats - Goals, Scores, Standings & Top Scorers",
  description:
    "Track World Cup 2026 tournament stats, including matches played, total goals, team stats, clean sheets and top scorers when scorer data is available.",
  alternates: { canonical: "https://www.worldcupmatchday.com/stats" },
  openGraph: {
    title: "World Cup 2026 Stats - Goals, Scores, Standings & Top Scorers",
    description:
      "Track World Cup 2026 tournament stats, including matches played, total goals, team stats, clean sheets and top scorers when scorer data is available.",
    url: "https://www.worldcupmatchday.com/stats",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "World Cup 2026 Statistics",
  description:
    "World Cup 2026 tournament stats from completed synced matches.",
  url: "https://www.worldcupmatchday.com/stats",
};

export default async function StatsPage() {
  const snapshot = await getTournamentLiveSnapshot();
  const hasEventData = snapshot.topScorers.length > 0;
  const refreshPolicy = getLiveRefreshPolicy(Object.values(snapshot.matches));

  return (
    <>
      <LiveDataAutoRefresh intervalMs={refreshPolicy.intervalMs} />
      <LiveSnapshotDebug snapshotId={snapshot.snapshotId} generatedAt={snapshot.generatedAt} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {snapshot.isFallback ? (
        <div className="mx-auto max-w-5xl px-4 pt-6">
          <LiveDataUnavailableNotice show />
        </div>
      ) : null}
      <StatsContent
        tournamentStats={snapshot.tournamentStats}
        teamLeaderboards={snapshot.teamLeaderboards}
        standings={snapshot.standingsByGroup}
        topScorers={snapshot.topScorers}
        hasEventData={hasEventData}
      />
    </>
  );
}
