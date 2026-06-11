// Shared timezone utilities — single source of truth for converting kickoff times
// (stored as UTC instants via matchUtcDate) into a viewer-selected IANA timezone.

export const DEFAULT_TIMEZONE = "America/New_York";

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
