"use client";

import { useTimezone } from "@/components/TimezoneProvider";
import { matchUtcDate, type Match } from "@/lib/matches";
import { formatKickoffDate, formatKickoffTime, formatTimeZoneLabel } from "@/lib/timezone";

/**
 * Renders a fixture's kickoff time in the viewer-selected timezone (see TimezoneProvider).
 *
 * SSR + first paint: time in the default timezone (America/New_York) — deterministic and
 * identical on server and client, so a real time is always present in the raw HTML.
 *
 * After hydration: re-renders in the viewer's selected/detected timezone. The absolute
 * kickoff instant never changes — only its display.
 */
export function MatchTime({
  match,
  className,
  withZone = false,
}: {
  match: Match;
  className?: string;
  withZone?: boolean;
}) {
  const { timeZone } = useTimezone();

  if (!match.time) return null;

  const time = formatKickoffTime(matchUtcDate(match), timeZone);

  return (
    <span className={className} suppressHydrationWarning>
      {time}
      {withZone ? ` · ${formatTimeZoneLabel(timeZone)}` : ""}
    </span>
  );
}

/** "11 Jun · 22:00 · Europe/Istanbul" — used on match pages and quick-answer blocks. */
export function KickoffDateTime({ match, className }: { match: Match; className?: string }) {
  const { timeZone } = useTimezone();

  if (!match.time) return null;

  const d = matchUtcDate(match);
  const date = formatKickoffDate(d, timeZone);
  const time = formatKickoffTime(d, timeZone);

  return (
    <span className={className} suppressHydrationWarning>
      {date} · {time} · {formatTimeZoneLabel(timeZone)}
    </span>
  );
}
