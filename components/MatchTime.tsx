"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/LanguageProvider";
import { matchUtcDate, type Match } from "@/lib/matches";

/**
 * Renders a fixture's kickoff time in the *viewer's* own timezone.
 *
 * The kickoff is stored venue-local (+ a venue UTC offset), so the absolute instant is the
 * same for everyone; only the displayed wall-clock differs. A visitor in Türkiye sees the
 * UTC+3 time, one in Japan the UTC+9 time, etc.
 *
 * Server (and the first client paint) render nothing so the markup matches and there's no
 * hydration mismatch — the real time fills in from the effect once the browser timezone and
 * Intl APIs are available.
 */
export function MatchTime({ match, className }: { match: Match; className?: string }) {
  const { locale } = useLang();
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    if (!match.time) {
      setTime("");
      return;
    }
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
