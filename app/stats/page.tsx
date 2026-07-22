import type { Metadata } from "next";
import { LiveDataAutoRefresh } from "@/components/LiveDataAutoRefresh";
import { LiveSnapshotDebug } from "@/components/LiveSnapshotDebug";
import { LiveDataUnavailableNotice } from "@/components/LiveDataUnavailableNotice";
import { BreadcrumbNav, breadcrumbLd } from "@/components/BreadcrumbNav";
import StatsContent from "@/components/StatsContent";
import { getLiveRefreshPolicy } from "@/lib/liveRefreshPolicy";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { buildKnockoutResolution } from "@/lib/knockoutResolution";
import { getArchiveState } from "@/lib/archiveLifecycle";
import { ARCHIVE_DEFAULT_DATE, MATCHES } from "@/lib/matches";
import { getTiedLeaders } from "@/lib/tournamentStats";

const BASE = "https://www.worldcupmatchday.com";

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Statistics" },
];

export const revalidate = 60;
// export const dynamic = "force-dynamic"; // removed for ISR

/** "A" / "A & B" / "A, B & C" — for naming every player tied for a leaderboard's top value. */
function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const snapshot = await getTournamentLiveSnapshot();
  const stats = snapshot.tournamentStats;

  const title = "World Cup 2026 Statistics — Goals, Records & Leaders";
  const description = `Complete 2026 FIFA World Cup statistics archive — all ${stats.totalGoals} goals across ${stats.matchesPlayed} matches, top scorers, clean sheet leaders and team metrics.`;

  return {
    title,
    description,
    alternates: { canonical: `${BASE}/stats` },
    openGraph: { title, description, url: `${BASE}/stats`, type: "website" },
  };
}

export default async function StatsPage() {
  const snapshot = await getTournamentLiveSnapshot();
  const resolvedParticipants = buildKnockoutResolution(snapshot.matches);
  const archive = getArchiveState({ matches: MATCHES, liveData: snapshot.liveDataByProviderId, resolvedParticipants, now: new Date(ARCHIVE_DEFAULT_DATE) });
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: archive.isComplete ? "2026 World Cup Final Statistics" : "2026 World Cup Statistics",
    description: `2026 World Cup tournament stats, including matches played (${snapshot.tournamentStats.matchesPlayed}), total goals (${snapshot.tournamentStats.totalGoals}), team stats, clean sheets and top scorers.`,
    url: `${BASE}/stats`,
  };
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd(breadcrumbs, BASE)) }}
      />
      <div className="mx-auto max-w-5xl px-4 pt-6">
        <BreadcrumbNav items={breadcrumbs} />
      </div>
      {snapshot.isFallback ? (
        <div className="mx-auto max-w-5xl px-4 pt-6">
          <LiveDataUnavailableNotice show />
        </div>
      ) : null}
      <StatsContent
        tournamentStats={snapshot.tournamentStats}
        teamLeaderboards={snapshot.teamLeaderboards}
        topScorers={snapshot.topScorers}
        playerEventLeaderboards={snapshot.playerEventLeaderboards}
        teamStatLeaderboards={snapshot.teamStatLeaderboards}
        hasEventData={hasEventData}
        awards={archive.awards}
      />
    </>
  );
}
