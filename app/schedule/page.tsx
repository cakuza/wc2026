import type { Metadata } from "next";
import { LiveDataAutoRefresh } from "@/components/LiveDataAutoRefresh";
import { LiveSnapshotDebug } from "@/components/LiveSnapshotDebug";
import { LiveDataUnavailableNotice } from "@/components/LiveDataUnavailableNotice";
import { ScheduleContent } from "./ScheduleContent";
import { getLiveRefreshPolicy } from "@/lib/liveRefreshPolicy";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { MATCHES, matchSlug } from "@/lib/matches";
import type { LiveMatchStatus } from "@/lib/liveMatchData";
import type { GoalScorerEvent } from "@/lib/worldcup26Provider";
import { buildKnockoutResolution } from "@/lib/knockoutResolution";

export const revalidate = 60;
// export const dynamic = "force-dynamic"; // removed for ISR

const BASE_URL = "https://www.worldcupmatchday.com";

export const metadata: Metadata = {
  title: "World Cup 2026 Schedule - Scores, Fixtures & Local Kickoff Times",
  description:
    "See the World Cup 2026 schedule with fixtures, scores, venues, goal scorers and kickoff times in your selected timezone.",
  alternates: { canonical: `${BASE_URL}/schedule` },
  openGraph: {
    title: "World Cup 2026 Schedule - Scores, Fixtures & Local Kickoff Times",
    description:
      "See the World Cup 2026 schedule with fixtures, scores, venues, goal scorers and kickoff times in your selected timezone.",
    url: `${BASE_URL}/schedule`,
    type: "website",
  },
};

export type ScheduleMatchScore = {
  status: LiveMatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  scoreDuration?: string | null;
  penaltyShootoutScore?: { home: number | null; away: number | null };
};

export default async function SchedulePage() {
  const snapshot = await getTournamentLiveSnapshot();
  const liveScores: Record<number, ScheduleMatchScore> = {};
  for (const [id, data] of Object.entries(snapshot.liveDataByProviderId)) {
    liveScores[Number(id)] = {
      status: data.status,
      homeScore: data.homeScore,
      awayScore: data.awayScore,
      scoreDuration: data.scoreDuration,
      penaltyShootoutScore: data.penaltyShootoutScore ?? undefined,
    };
  }

  const scorerLines: Record<string, GoalScorerEvent[]> = {};
  for (const [id, entry] of Object.entries(snapshot.matches)) {
    if (entry.scorers.length > 0) scorerLines[id] = entry.scorers;
  }

  const refreshPolicy = getLiveRefreshPolicy(
    MATCHES.map((match) => {
      const snap = snapshot.matches[matchSlug(match)];
      return {
        match,
        status: snap?.status ?? "SCHEDULED",
        providerUpdatedAt: snap?.providerUpdatedAt,
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
      <ScheduleContent liveScores={liveScores} scorerLines={scorerLines} resolvedParticipants={buildKnockoutResolution(snapshot.matches)} />
    </>
  );
}
