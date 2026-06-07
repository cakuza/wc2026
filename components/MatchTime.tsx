"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/LanguageProvider";
import { matchUtcDate, type Match } from "@/lib/matches";

/**
 * Renders a fixture's kickoff time.
 *
 * SSR + first client paint: the venue-local kickoff (`match.time`). This is a deterministic
 * value, identical on the server and the first client render, so the time is present in the raw
 * HTML (good for SEO, no-JS users and AI crawlers) with no hydration mismatch.
 *
 * After hydration: an effect re-renders the *same instant* in the viewer's own timezone (Türkiye
 * sees UTC+3, Japan UTC+9, etc.). The absolute kickoff is unchanged — only the wall-clock label.
 */
export function MatchTime({ match, className }: { match: Match; className?: string }) {
  const { locale } = useLang();
  // Server-rendered fallback = venue-local time; replaced with viewer-local time post-hydration.
  const [time, setTime] = useState<string>(match.time ?? "");

  useEffect(() => {
    if (!match.time) return;
    setTime(
      new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23", // 24-hour "22:00" format, viewer's local timezone
      }).format(matchUtcDate(match))
    );
  }, [match, locale]);

  if (!match.time) return null;
  return <span className={className}>{time}</span>;
}
