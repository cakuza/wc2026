import { MATCHES, matchUtcDate, type Match } from "./matches";

/** Returns sorted unique YYYY-MM-DD UTC dates for all matches. */
export function allMatchdayDates(): string[] {
  const seen = new Set<string>();
  for (const m of MATCHES) {
    const utc = matchUtcDate(m);
    seen.add(utc.toISOString().slice(0, 10));
  }
  return [...seen].sort();
}

/** Returns all matches whose UTC date equals the given YYYY-MM-DD. */
export function matchesOnDate(date: string): Match[] {
  return MATCHES.filter((m) => {
    const utc = matchUtcDate(m);
    return utc.toISOString().slice(0, 10) === date;
  }).sort((a, b) => {
    const ua = matchUtcDate(a).toISOString();
    const ub = matchUtcDate(b).toISOString();
    return ua < ub ? -1 : ua > ub ? 1 : 0;
  });
}

/** True if the given string is a valid matchday date (has ≥1 match). */
export function isValidMatchdayDate(date: string): boolean {
  return matchesOnDate(date).length > 0;
}

/** Previous matchday date before `date`, or null. */
export function prevMatchdayDate(date: string): string | null {
  const all = allMatchdayDates();
  const idx = all.indexOf(date);
  return idx > 0 ? all[idx - 1] : null;
}

/** Next matchday date after `date`, or null. */
export function nextMatchdayDate(date: string): string | null {
  const all = allMatchdayDates();
  const idx = all.indexOf(date);
  return idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
}

/** Human-readable date label, e.g. "Tuesday, 17 June 2026". */
export function formatMatchdayDate(date: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00Z`));
}
