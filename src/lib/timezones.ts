export const QUICK_TIMEZONES = [
  "Europe/London",
  "Europe/Istanbul",
  "Europe/Madrid",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "America/Mexico_City",
  "America/Sao_Paulo",
  "America/Argentina/Buenos_Aires",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Riyadh",
  "Africa/Lagos",
  "Africa/Cairo",
  "Pacific/Auckland",
  "Australia/Sydney"
];

export function getBrowserTimezone() {
  if (typeof Intl === "undefined") return "Europe/Istanbul";
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Istanbul";
}

export function formatKickoff(date: string | null | undefined, timeZone: string) {
  if (!date) return "Official time not added yet";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Official time not added yet";
  // No timeZoneName: we surface a plain "Local time" label in the UI instead of a
  // raw "GMT+3"-style offset, since the displayed time is already in the user's zone.
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone
  }).format(parsed);
}

export function formatDateKey(date: string, timeZone = "UTC") {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone
  }).format(new Date(date));
}

export function formatShortDate(date: string, timeZone = "UTC") {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    timeZone
  }).format(new Date(date));
}
