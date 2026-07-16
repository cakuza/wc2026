"use client";

import { useTimezone } from "@/components/TimezoneProvider";
import { TodayContent } from "@/components/TodayContent";
import { DEFAULT_TIMEZONE } from "@/lib/timezone";
import type { MatchCenterLiveSnapshot } from "@/components/MatchCenterContent";
import type { TournamentPhase } from "@/lib/matchCenterSelection";
import type { ArchiveState } from "@/lib/archiveLifecycle";

export function TodayClientWrapper({
  snapshot,
  isFallbackSnapshot,
  liveDataUnavailableByMatchId,
  tournamentPhase,
  archiveState,
}: {
  snapshot: MatchCenterLiveSnapshot;
  isFallbackSnapshot: boolean;
  liveDataUnavailableByMatchId: Record<string, boolean>;
  tournamentPhase: TournamentPhase;
  archiveState: ArchiveState;
}) {
  const { timeZone } = useTimezone();
  const selectedTimeZone = timeZone || DEFAULT_TIMEZONE;

  return (
    <TodayContent
      snapshot={snapshot}
      isFallbackSnapshot={isFallbackSnapshot}
      liveDataUnavailableByMatchId={liveDataUnavailableByMatchId}
      dateParam={undefined}
      selectedTimeZone={selectedTimeZone}
      tournamentPhase={tournamentPhase}
      archiveState={archiveState}
    />
  );
}
