"use client";

import { useEffect, useState } from "react";
import { useTimezone } from "@/components/TimezoneProvider";
import { TodayContent } from "@/components/TodayContent";
import { DEFAULT_TIMEZONE, isValidTimeZone } from "@/lib/timezone";
import { ARCHIVE_DEFAULT_DATE } from "@/lib/matches";
import type { MatchCenterLiveSnapshot } from "@/components/MatchCenterContent";
import type { TournamentPhase } from "@/lib/matchCenterSelection";
import type { ArchiveState } from "@/lib/archiveLifecycle";

function isValidDateParam(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const time = Date.parse(dateStr);
  if (isNaN(time)) return false;
  if (dateStr < "2026-06-11" || dateStr > "2026-07-19") return false;
  return true;
}

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
  const [selectedTimeZone, setSelectedTimeZone] = useState(DEFAULT_TIMEZONE);
  const [now, setNow] = useState(() => new Date(ARCHIVE_DEFAULT_DATE));
  const [isClientDateResolved, setIsClientDateResolved] = useState(false);
  const [dateParamVal, setDateParamVal] = useState<string | undefined>(undefined);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rawDate = params.get("date");
    const rawTz = params.get("tz");

    const dateParam = rawDate && isValidDateParam(rawDate) ? rawDate : undefined;
    const tzParam = rawTz && isValidTimeZone(rawTz) ? rawTz : undefined;

    if (dateParam) {
      let meta = document.querySelector('meta[name="robots"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "robots");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", "noindex,follow");
      setDateParamVal(dateParam);
    }

    const clientTz = tzParam || timeZone || DEFAULT_TIMEZONE;
    setSelectedTimeZone(clientTz);

    if (dateParam) {
      setNow(new Date(`${dateParam}T12:00:00`));
    } else {
      setNow(new Date());
    }

    setIsClientDateResolved(true);
  }, [timeZone]);

  return (
    <TodayContent
      snapshot={snapshot}
      isFallbackSnapshot={isFallbackSnapshot}
      liveDataUnavailableByMatchId={liveDataUnavailableByMatchId}
      dateParam={dateParamVal}
      selectedTimeZone={selectedTimeZone}
      now={now}
      isClientDateResolved={isClientDateResolved}
      tournamentPhase={tournamentPhase}
      archiveState={archiveState}
    />
  );
}
