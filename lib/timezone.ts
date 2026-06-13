// Shared timezone utilities — single source of truth for converting kickoff times
// (stored as UTC instants via matchUtcDate) into a viewer-selected IANA timezone.

export const DEFAULT_TIMEZONE = "America/New_York";

// Cookie used to persist the viewer's selected/detected timezone so the server
// can render /today and the homepage Today card for the same local date the
// client will display, without waiting for a ?tz= query param.
export const TZ_COOKIE = "wc2026-tz";

// Small curated list for the timezone selector — common viewer locations.
export const COMMON_TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Mexico_City",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Istanbul",
  "Africa/Johannesburg",
  "Asia/Dubai",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
];

/**
 * Decides whether the client should trigger a one-time router.refresh() after
 * resolving the viewer's timezone. True only when the resolved timezone differs
 * from the one the server used for this render AND we haven't already refreshed
 * for this resolved timezone in this session — prevents infinite refresh loops.
 */
export function shouldRefreshForTimeZone(
  serverTimeZone: string,
  resolvedTimeZone: string,
  alreadyRefreshed: boolean,
): boolean {
  return serverTimeZone !== resolvedTimeZone && !alreadyRefreshed;
}

/** Reads the wc2026-tz cookie (the timezone the server used for the current render), if any. */
export function readTimeZoneCookie(): string | null {
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${TZ_COOKIE}=([^;]*)`));
    if (!match) return null;
    const tz = decodeURIComponent(match[1]);
    return isValidTimeZone(tz) ? tz : null;
  } catch {
    return null;
  }
}

export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Browser-detected IANA timezone, falling back to America/New_York if unavailable/invalid. */
export function detectBrowserTimeZone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz && isValidTimeZone(tz) ? tz : DEFAULT_TIMEZONE;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

/** "America/New_York" -> "America/New York" */
export function formatTimeZoneLabel(tz: string): string {
  return tz.replace(/_/g, " ");
}

/** Kickoff time in the given timezone, 24h, e.g. "22:00" */
export function formatKickoffTime(date: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: tz,
  }).format(date);
}

/** Kickoff date in the given timezone, e.g. "11 Jun" */
export function formatKickoffDate(date: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: tz,
  }).format(date);
}
