import type { Metadata } from "next";
import { LiveDataAutoRefresh } from "@/components/LiveDataAutoRefresh";
import { LiveSnapshotDebug } from "@/components/LiveSnapshotDebug";
import { LiveDataUnavailableNotice } from "@/components/LiveDataUnavailableNotice";
import StatsContent from "@/components/StatsContent";
import { getLiveRefreshPolicy } from "@/lib/liveRefreshPolicy";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { buildKnockoutResolution } from "@/lib/knockoutResolution";
import { getArchiveState } from "@/lib/archiveLifecycle";
import { ARCHIVE_DEFAULT_DATE, MATCHES } from "@/lib/matches";
import { getTiedLeaders } from "@/lib/tournamentStats";

const BASE = "https://www.worldcupmatchday.com";

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
  const resolvedParticipants = buildKnockoutResolution(snapshot.matches);
  const archive = getArchiveState({ matches: MATCHES, liveData: snapshot.liveDataByProviderId, resolvedParticipants, now: new Date(ARCHIVE_DEFAULT_DATE) });
  const stats = snapshot.tournamentStats;
  const topScorers = getTiedLeaders(snapshot.topScorers, (p) => p.goals);

  const title = archive.isComplete
    ? `2026 World Cup Stats: ${stats.totalGoals} Total Goals, Top Scorers & Records`
    : "World Cup 2026 Stats — Total Goals, Top Scorers & Clean Sheets";
  const description = archive.isComplete
    ? `Final 2026 FIFA World Cup statistics: ${stats.matchesPlayed} matches, ${stats.totalGoals} total goals (${stats.averageGoalsPerMatch} per match), ${stats.cleanSheets} clean sheets.${topScorers.length > 0 ? ` Golden Boot: ${joinNames(topScorers.map((p) => p.playerName))} (${topScorers[0].goals}).` : ""}`
    : `2026 FIFA World Cup statistics so far: ${stats.matchesPlayed} matches played, ${stats.totalGoals} total goals, top scorers, assists and clean sheets.`;

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
