import { DEFAULT_TIMEZONE, isValidTimeZone } from "./timezone";
import { MATCHES, matchUtcDate, type Match } from "./matches";

export type SelectedTodayMatchday = {
  date: string;
  matches: Match[];
  timeZone: string;
};

export function resolveSelectedTimeZone(value: string | string[] | undefined): string {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && isValidTimeZone(candidate) ? candidate : DEFAULT_TIMEZONE;
}

export function localISODateInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

export function getMatchCalendarDateInZone(date: Date, timeZone: string): string {
  return localISODateInTimeZone(date, timeZone);
}

export function groupMatchesByCalendarDate(
  matches: Match[],
  timeZone: string,
): { date: string; matches: Match[] }[] {
  const byDate = new Map<string, Match[]>();
  for (const match of [...matches].sort((a, b) => matchUtcDate(a).getTime() - matchUtcDate(b).getTime())) {
    const date = getMatchCalendarDateInZone(matchUtcDate(match), timeZone);
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date)!.push(match);
  }
  return [...byDate.entries()].map(([date, dayMatches]) => ({ date, matches: dayMatches }));
}

export function getTodayMatchesForTimeZone({
  now = new Date(),
  timeZone,
  matches = MATCHES,
}: {
  now?: Date;
  timeZone: string;
  matches?: Match[];
}): SelectedTodayMatchday {
  const date = getMatchCalendarDateInZone(now, timeZone);
  const selected = matches
    .filter((match) => getMatchCalendarDateInZone(matchUtcDate(match), timeZone) === date)
    .sort((a, b) => matchUtcDate(a).getTime() - matchUtcDate(b).getTime());

  return { date, matches: selected, timeZone };
}

export function nextUpcomingMatchesForTimeZone({
  now = new Date(),
  timeZone,
  matches = MATCHES,
  daysToShow = 1,
}: {
  now?: Date;
  timeZone: string;
  matches?: Match[];
  daysToShow?: number;
}): { date: string; matches: Match[] }[] {
  const nowMs = now.getTime();
  const future = matches
    .filter((match) => matchUtcDate(match).getTime() >= nowMs)
    .sort((a, b) => matchUtcDate(a).getTime() - matchUtcDate(b).getTime());

  const byDate = new Map<string, Match[]>();
  for (const match of future) {
    const date = getMatchCalendarDateInZone(matchUtcDate(match), timeZone);
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date)!.push(match);
  }

  return [...byDate.entries()].slice(0, daysToShow).map(([date, dayMatches]) => ({ date, matches: dayMatches }));
}
