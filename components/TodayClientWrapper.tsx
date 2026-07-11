"use client";

import { useSearchParams } from "next/navigation";
import { useTimezone } from "@/components/TimezoneProvider";
import { TodayContent } from "@/components/TodayContent";
import { DEFAULT_TIMEZONE } from "@/lib/timezone";
import type { MatchCenterLiveSnapshot } from "@/components/MatchCenterContent";

export function TodayClientWrapper({
  snapshot,
  isFallbackSnapshot,
  liveDataUnavailableByMatchId,
}: {
  snapshot: MatchCenterLiveSnapshot;
  isFallbackSnapshot: boolean;
  liveDataUnavailableByMatchId: Record<string, boolean>;
}) {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date") || undefined;
  const { timeZone } = useTimezone();
  const selectedTimeZone = timeZone || DEFAULT_TIMEZONE;

  return (
    <TodayContent
      snapshot={snapshot}
      isFallbackSnapshot={isFallbackSnapshot}
      liveDataUnavailableByMatchId={liveDataUnavailableByMatchId}
      dateParam={dateParam}
      selectedTimeZone={selectedTimeZone}
    />
  );
}
