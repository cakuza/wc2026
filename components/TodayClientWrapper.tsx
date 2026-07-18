"use client";

import { useEffect, useState } from "react";
import { useTimezone } from "@/components/TimezoneProvider";
import { TodayContent } from "@/components/TodayContent";
import { DEFAULT_TIMEZONE } from "@/lib/timezone";
import { ARCHIVE_DEFAULT_DATE } from "@/lib/matches";
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
  // A static export cannot know a first-time visitor's clock. Keep the
  // deterministic archive timestamp through hydration, then resolve the local
  // date in the browser before making a "today" claim.
  const [now, setNow] = useState(() => new Date(ARCHIVE_DEFAULT_DATE));
  const [isClientDateResolved, setIsClientDateResolved] = useState(false);

  useEffect(() => {
    setNow(new Date());
    setIsClientDateResolved(true);
  }, []);

  return (
    <TodayContent
      snapshot={snapshot}
      isFallbackSnapshot={isFallbackSnapshot}
      liveDataUnavailableByMatchId={liveDataUnavailableByMatchId}
      dateParam={undefined}
      selectedTimeZone={selectedTimeZone}
      now={now}
      isClientDateResolved={isClientDateResolved}
      tournamentPhase={tournamentPhase}
      archiveState={archiveState}
    />
  );
}
