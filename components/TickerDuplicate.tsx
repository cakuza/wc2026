"use client";
import { getResolvedHomeTeam, getResolvedAwayTeam, getResolvedHomeCode, getResolvedAwayCode, getParticipantDisplayLabel, isKnockoutMatch } from "@/lib/participant-resolution";

/**
 * TickerDuplicate — the aria-hidden loop copy of the ticker.
 *
 * Loaded via Next.js dynamic() with { ssr: false } so it NEVER appears
 * in SSR HTML.  Google never sees this copy.
 *
 * aria-hidden: hidden from screen readers.
 * data-nosnippet: Googlebot will not use this in snippets even if it
 *   somehow encounters it via client-side rendering.
 */

import { useEffect } from "react";
import type { Match } from "@/lib/matches";
import { matchUtcDate } from "@/lib/matches";
import { Flag } from "@/components/Flag";
import { useLang } from "@/components/LanguageProvider";
import { useTimezone } from "@/components/TimezoneProvider";
import { getMatchCalendarDateInZone } from "@/lib/todaySelection";

interface Props {
  items: Match[];
  /** Called once on first mount so Ticker can restart the animation with
   *  the correct scrollWidth (= 2× single-copy width). */
  onMount: () => void;
}

export default function TickerDuplicate({ items, onMount }: Props) {
  const { t, country, formatDate } = useLang();
  const { timeZone } = useTimezone();

  // Signal the parent that this copy is now in the DOM.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { onMount(); }, []);

  return (
    <div
      className="flex items-center"
      aria-hidden="true"
      data-nosnippet=""
    >
      {items.map((m, i) => (
        <span
          key={i}
          className="mx-4 flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-white"
        >
          {getResolvedHomeTeam(m) && <Flag code={getResolvedHomeCode(m) ?? ""} alt="" width={22} height={16} className="rounded-sm" />}
          <span>{getResolvedHomeTeam(m) ? country(getResolvedHomeTeam(m)!) : (isKnockoutMatch(m) ? getParticipantDisplayLabel(m.homeSlot) : m.homeKey)}</span>
          <span className="opacity-70">{t("vs")}</span>
          {getResolvedAwayTeam(m) && <Flag code={getResolvedAwayCode(m) ?? ""} alt="" width={22} height={16} className="rounded-sm" />}
          <span>{getResolvedAwayTeam(m) ? country(getResolvedAwayTeam(m)!) : (isKnockoutMatch(m) ? getParticipantDisplayLabel(m.awaySlot) : m.awayKey)}</span>
          <span className="opacity-70">·</span>
          <span className="opacity-80">{formatDate(getMatchCalendarDateInZone(matchUtcDate(m), timeZone))}</span>
        </span>
      ))}
    </div>
  );
}
