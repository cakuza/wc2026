import type { Metadata } from "next";
import { LiveDataAutoRefresh } from "@/components/LiveDataAutoRefresh";
import { LiveSnapshotDebug } from "@/components/LiveSnapshotDebug";
import { LiveDataUnavailableNotice } from "@/components/LiveDataUnavailableNotice";
import { ScheduleContent } from "./ScheduleContent";
import { getLiveRefreshPolicy } from "@/lib/liveRefreshPolicy";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { MATCHES, matchSlug, ARCHIVE_DEFAULT_DATE } from "@/lib/matches";
import { buildKnockoutResolution } from "@/lib/knockoutResolution";
import { getArchiveState } from "@/lib/archiveLifecycle";

export const revalidate = 60;

const BASE_URL = "https://www.worldcupmatchday.com";

export const metadata: Metadata = {
  title: "World Cup 2026 Results Archive — Scores & Local Kickoff Times",
  description:
    "Browse all 104 completed 2026 World Cup matches with final scores, venues, goal scorers and kickoff times in your selected timezone.",
  alternates: { canonical: `${BASE_URL}/schedule` },
  openGraph: {
    title: "World Cup 2026 Results Archive — Scores & Local Kickoff Times",
    description:
      "Browse all 104 completed 2026 World Cup matches with final scores, venues, goal scorers and kickoff times in your selected timezone.",
    url: `${BASE_URL}/schedule`,
    type: "website",
  },
};

export default async function SchedulePage() {
  const snapshot = await getTournamentLiveSnapshot();
  const evalNow = new Date(ARCHIVE_DEFAULT_DATE);
  const resolvedParticipants = buildKnockoutResolution(snapshot.matches);

  const archiveState = getArchiveState({
    matches: MATCHES,
    liveData: snapshot.liveDataByProviderId,
    resolvedParticipants,
    now: evalNow,
  });

  const refreshPolicy = getLiveRefreshPolicy(
    MATCHES.map((match) => {
      const snap = snapshot.matches[matchSlug(match)];
      return {
        match,
        status: snap?.status ?? "SCHEDULED",
        providerUpdatedAt: snap?.providerUpdatedAt,
        goalEventCompleteness: snap?.goalEventCompleteness,
        live: snap?.live,
        homeScore: snap?.homeScore,
        awayScore: snap?.awayScore,
      };
    }),
  );

  return (
    <>
      <LiveDataAutoRefresh intervalMs={refreshPolicy.intervalMs} />
      <LiveSnapshotDebug snapshotId={snapshot.snapshotId} generatedAt={snapshot.generatedAt} />
      {snapshot.isFallback ? (
        <div className="mx-auto max-w-4xl px-4 pt-6">
          <LiveDataUnavailableNotice show />
        </div>
      ) : null}
      <div className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:px-8 pb-2">
        <h1 className="font-heading text-4xl font-extrabold uppercase tracking-wide text-white">World Cup 2026 Match Schedule</h1>
      </div>
      <ScheduleContent
        matchesProjection={snapshot.matches}
        resolvedParticipants={resolvedParticipants}
        isTournamentComplete={archiveState.isComplete}
      />
    </>
  );
}
