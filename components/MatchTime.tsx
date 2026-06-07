"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/LanguageProvider";
import { matchUtcDate, type Match } from "@/lib/matches";

// US Eastern is FIFA's reference timezone for 2026 — a fixed IANA zone (not the runtime's
// local zone), so this label is identical on server and client → no hydration mismatch.
function easternKickoff(match: Match): string {
  return (
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/New_York",
    }).format(matchUtcDate(match)) + " ET"
  );
}

/**
 * Renders a fixture's kickoff time.
 *
 * SSR + first client paint: the kickoff in US Eastern, e.g. "3:00 PM ET". This is deterministic
 * (fixed timezone) and identical on server and client, so a real time is always present in the
 * raw HTML — good for SEO, AI crawlers and no-JS users — with no hydration mismatch.
 *
 * After hydration: an effect appends the viewer's own local time, e.g. "3:00 PM ET · 21:00
 * local". The ET anchor stays for everyone; the absolute kickoff instant never changes.
 */
export function MatchTime({ match, className }: { match: Match; className?: string }) {
  const { locale } = useLang();
  // Server-rendered fallback = ET; after hydration we append the viewer's local time.
  const [time, setTime] = useState<string>(() => (match.time ? easternKickoff(match) : ""));

  useEffect(() => {
    if (!match.time) return;
    const local = new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23", // 24-hour "21:00" in the viewer's own timezone
    }).format(matchUtcDate(match));
    setTime(`${easternKickoff(match)} · ${local} local`);
  }, [match, locale]);

  if (!match.time) return null;
  return <span className={className}>{time}</span>;
}
