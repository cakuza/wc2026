import { DEFAULT_TIMEZONE, isValidTimeZone } from "./timezone";
import { MATCHES, matchUtcDate, type DisplayMatchday, type Match } from "./matches";

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

function addCalendarDays(dateISO: string, days: number): string {
  const [year, month, day] = dateISO.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

export function getDisplayMatchdayForTimeZone({
  now = new Date(),
  timeZone,
  matches = MATCHES,
}: {
  now?: Date;
  timeZone: string;
  matches?: Match[];
}): DisplayMatchday {
  const todayISO = getMatchCalendarDateInZone(now, timeZone);
  const tomorrowISO = addCalendarDays(todayISO, 1);
  const byDate = groupMatchesByCalendarDate(matches, timeZone);

  const today = byDate.find((day) => day.date === todayISO);
  if (today) return { labelKey: "sec_todayMatches", date: today.date, matches: today.matches };

  const nextIdx = byDate.findIndex((day) => day.date >= todayISO);
  if (nextIdx === -1) {
    const last = byDate[byDate.length - 1];
    return { labelKey: "sec_nextMatches", date: last.date, matches: last.matches };
  }

  const next = byDate[nextIdx];
  if (next.date === tomorrowISO) {
    return { labelKey: "sec_tomorrowMatches", date: next.date, matches: next.matches };
  }

  const upcomingDays = byDate.slice(nextIdx, nextIdx + 3);
  const allMatches = upcomingDays.flatMap((day) => day.matches);
  return {
    labelKey: "sec_nextMatches",
    date: upcomingDays[0].date,
    matches: allMatches,
    days: upcomingDays.length > 1 ? upcomingDays : undefined,
  };
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
