"use client";

import { useEffect } from "react";
import type { Match } from "@/lib/matches";
import { matchUtcDate } from "@/lib/matches";
import { Flag } from "@/components/Flag";
import { useLang } from "@/components/LanguageProvider";
import { useTimezone } from "@/components/TimezoneProvider";
import { getMatchCalendarDateInZone } from "@/lib/todaySelection";
import { getParticipantDisplay, type ResolvedParticipantLookup } from "@/lib/participant-resolution";

interface Props {
  items: Match[];
  resolvedParticipants?: ResolvedParticipantLookup;
  onMount: () => void;
}

export default function TickerDuplicate({ items, resolvedParticipants, onMount }: Props) {
  const { t, lang, formatDate } = useLang();
  const { timeZone } = useTimezone();

  useEffect(() => {
    onMount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="flex items-center"
      aria-hidden="true"
      data-nosnippet=""
    >
      {items.map((m, i) => {
        const home = getParticipantDisplay(m, "home", resolvedParticipants, lang);
        const away = getParticipantDisplay(m, "away", resolvedParticipants, lang);
        return (
          <span
            key={i}
            className="mx-4 flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-white"
          >
            {home.teamCode && <Flag code={home.teamCode} alt="" width={22} height={16} className="rounded-sm" />}
            <span>{home.label}</span>
            <span className="opacity-70">{t("vs")}</span>
            {away.teamCode && <Flag code={away.teamCode} alt="" width={22} height={16} className="rounded-sm" />}
            <span>{away.label}</span>
            <span className="opacity-70">·</span>
            <span className="opacity-80">{formatDate(getMatchCalendarDateInZone(matchUtcDate(m), timeZone))}</span>
          </span>
        );
      })}
    </div>
  );
}
