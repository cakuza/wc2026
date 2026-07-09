import { DEFAULT_TIMEZONE, isValidTimeZone } from "./timezone";
import { getParticipantDisplay } from "./participant-resolution";
import { MATCHES, matchUtcDate, ARCHIVE_DEFAULT_DATE, type DisplayMatchday, type Match } from "./matches";
import { COMPLETED_GROUP_RESULTS, COMPLETED_KNOCKOUT_RESULTS } from "./canonicalMatchResults";

export function getDefaultTodayDateForArchive(timeZone: string, matches: Match[] = MATCHES): string {
  let latestMs = 0;
  let latestMatch = matches[0];
  for (const m of matches) {
    const pId = m.providerIds?.footballData;
    const num = 'matchNumber' in m ? m.matchNumber : null;
    const isCompleted = (pId && COMPLETED_GROUP_RESULTS[pId]) || (num !== null && COMPLETED_KNOCKOUT_RESULTS[num]);
    if (isCompleted) {
      const ms = matchUtcDate(m).getTime();
      if (ms > latestMs) {
        latestMs = ms;
        latestMatch = m;
      }
    }
  }
  if (!latestMatch) return getMatchCalendarDateInZone(matchUtcDate(matches[0]), timeZone);
  return getMatchCalendarDateInZone(matchUtcDate(latestMatch), timeZone);
}

export function getTodayHref(timeZone: string, now: Date = new Date()): string {
  const localDate = getMatchCalendarDateInZone(now, timeZone);
  const matchdayDates = getMatchdayDates(MATCHES, timeZone); // already sorted

  let targetDate = matchdayDates[matchdayDates.length - 1]; // fallback

  if (matchdayDates.includes(localDate)) {
    targetDate = localDate;
  } else {
    // next matchday after local date
    const next = matchdayDates.find(d => d > localDate);
    if (next) {
      targetDate = next;
    } else {
      // latest matchday before local date
      const prev = [...matchdayDates].reverse().find(d => d < localDate);
      if (prev) {
        targetDate = prev;
      }
    }
  }

  return `/today?date=${targetDate}&tz=${encodeURIComponent(timeZone)}`;
}

export type SelectedTodayMatchday = {
  date: string;
  matches: Match[];
  timeZone: string;
};

/**
 * Resolve the timezone to use for server-rendered date selection.
 *
 * Priority: ?tz= query param > previously-saved cookie (set by TimezoneProvider
 * once the browser timezone is detected) > DEFAULT_TIMEZONE.
 *
 * This keeps "today" on the server in sync with the timezone the client will
 * display, even on the very first request (no ?tz= param yet).
 */
export function resolveSelectedTimeZone(
  value: string | string[] | undefined,
  cookieValue?: string | null,
): string {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (candidate && isValidTimeZone(candidate)) return candidate;
  if (cookieValue && isValidTimeZone(cookieValue)) return cookieValue;
  return DEFAULT_TIMEZONE;
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

/**
 * Canonical local-date-key helper: getLocalDateKey(kickoffUtc, selectedTimezone).
 * Alias of getMatchCalendarDateInZone — every "is this match today" comparison
 * in the app should derive from this single function.
 */
export const getLocalDateKey = getMatchCalendarDateInZone;

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

export function addCalendarDays(dateISO: string, days: number): string {
  const [year, month, day] = dateISO.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

/** Strict YYYY-MM-DD validation that also rejects impossible calendar dates (e.g. 2026-13-40). */
export function isValidISODate(value: string | string[] | undefined): value is string {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (typeof candidate !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(candidate)) return false;
  const [year, month, day] = candidate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** Local wall-clock hour (0–23) for an instant in the given timezone. */
export function localHourInTimeZone(date: Date, timeZone: string): number {
  const part = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date).find((p) => p.type === "hour")?.value;
  const hour = Number(part);
  return Number.isFinite(hour) ? hour : 0;
}

/** All matches whose local calendar date in `timeZone` equals `date`, kickoff-sorted. */
export function getMatchesForDateInZone({
  date,
  timeZone,
  matches = MATCHES,
}: {
  date: string;
  timeZone: string;
  matches?: Match[];
}): Match[] {
  return matches
    .filter((match) => getMatchCalendarDateInZone(matchUtcDate(match), timeZone) === date)
    .sort((a, b) => matchUtcDate(a).getTime() - matchUtcDate(b).getTime());
}

/**
 * First and last local calendar dates the tournament occupies in `timeZone`.
 * Used to bound the date navigator so users cannot page into empty infinity.
 */
export function getTournamentDateRangeInZone({
  timeZone,
  matches = MATCHES,
}: {
  timeZone: string;
  matches?: Match[];
}): { min: string; max: string } {
  let min: string | null = null;
  let max: string | null = null;
  for (const match of matches) {
    const date = getMatchCalendarDateInZone(matchUtcDate(match), timeZone);
    if (min === null || date < min) min = date;
    if (max === null || date > max) max = date;
  }
  // MATCHES is never empty in production; fall back to a stable single-day range.
  return { min: min ?? "2026-06-11", max: max ?? "2026-06-11" };
}

/**
 * The most recent local matchday strictly before `fromDate` that actually has
 * matches, or null if none. Drives the post-midnight "previous matchday"
 * continuity affordance.
 */
export function previousMatchdayWithMatches({
  fromDate,
  timeZone,
  matches = MATCHES,
}: {
  fromDate: string;
  timeZone: string;
  matches?: Match[];
}): string | null {
  let best: string | null = null;
  for (const match of matches) {
    const date = getMatchCalendarDateInZone(matchUtcDate(match), timeZone);
    if (date < fromDate && (best === null || date > best)) best = date;
  }
  return best;
}

export type ResolvedMatchday = {
  /** The local calendar date being displayed (YYYY-MM-DD). */
  date: string;
  /** The viewer's actual local "today" in this timezone. */
  todayDate: string;
  /** Whether `date` equals the viewer's local today (i.e. no explicit ?date=). */
  isToday: boolean;
  /** Whether an explicit, in-range ?date= drove the selection. */
  isExplicitDate: boolean;
  /** Tournament local-date bounds in this timezone. */
  min: string;
  max: string;
  /** Adjacent navigable dates, null when at/over a tournament bound. */
  prevDate: string | null;
  nextDate: string | null;
};

/**
 * Resolve which local calendar date `/today` should display.
 *
 * Priority: a valid, in-tournament-range ?date= param wins; otherwise the
 * viewer's current local date in the selected timezone. "Today" always means
 * the real local calendar date — an out-of-range or malformed ?date= is ignored
 * and treated as today, never invented.
 */
export function resolveSelectedMatchday({
  dateParam,
  timeZone,
  now = new Date(ARCHIVE_DEFAULT_DATE),
  matches = MATCHES,
}: {
  dateParam: string | string[] | undefined;
  timeZone: string;
  now?: Date;
  matches?: Match[];
}): ResolvedMatchday {
  let todayDate = getMatchCalendarDateInZone(now, timeZone);
  const { min, max } = getTournamentDateRangeInZone({ timeZone, matches });
  if (todayDate > max) {
    todayDate = max;
  }


  const candidate = isValidISODate(dateParam)
    ? Array.isArray(dateParam)
      ? dateParam[0]
      : dateParam
    : null;
  const inRange = candidate !== null && candidate >= min && candidate <= max;
  const isExplicitDate = inRange && candidate !== todayDate;
  let date = inRange ? (candidate as string) : todayDate;

  if (!inRange && date > max) {
    date = max;
  }

  return {
    date,
    todayDate,
    isToday: date === todayDate,
    isExplicitDate,
    min,
    max,
    prevDate: date > min ? getPreviousMatchdayDate(date, getMatchdayDates(matches, timeZone)) : null,
    nextDate: date < max ? getNextMatchdayDate(date, getMatchdayDates(matches, timeZone)) : null,
  };
}

export function getDisplayMatchdayForTimeZone({
  now = new Date(ARCHIVE_DEFAULT_DATE),
  timeZone,
  matches = MATCHES,
  resolvedParticipants,
  liveDataByProviderId,
}: {
  now?: Date;
  timeZone: string;
  matches?: Match[];
  resolvedParticipants?: import("./participant-resolution").ResolvedParticipantLookup;
  liveDataByProviderId?: Record<string, any>;
}): DisplayMatchday {
  const todayISO = getMatchCalendarDateInZone(now, timeZone);
  const tomorrowISO = addCalendarDays(todayISO, 1);
  const byDate = groupMatchesByCalendarDate(matches, timeZone);

  const today = byDate.find((day) => day.date === todayISO);
  if (today) return { labelKey: "sec_todayMatches", date: today.date, matches: today.matches };

  const nextResolved = getNextResolvedUpcomingMatchday(todayISO, matches, resolvedParticipants, timeZone);
  if (nextResolved) {
    if (nextResolved.date === tomorrowISO) {
      return { labelKey: "sec_tomorrowMatches", date: nextResolved.date, matches: nextResolved.matches };
    }
    const idx = byDate.findIndex(d => d.date === nextResolved.date);
    if (idx !== -1) {
      const upcomingDays = byDate.slice(idx, idx + 3).filter(day => day.matches.every(m => areMatchParticipantsResolved(m, resolvedParticipants)));
      const allMatches = upcomingDays.flatMap((day) => day.matches);
      return {
        labelKey: "sec_nextMatches",
        date: upcomingDays[0].date,
        matches: allMatches,
        days: upcomingDays.length > 1 ? upcomingDays : undefined,
      };
    }
  }

  if (liveDataByProviderId) {
    const latestCompleted = getLatestCompletedMatches(matches, liveDataByProviderId);
    if (latestCompleted.length > 0) {
      const latestDate = getMatchCalendarDateInZone(matchUtcDate(latestCompleted[0]), timeZone);
      const completedMatchesOnDate = latestCompleted.filter(m => getMatchCalendarDateInZone(matchUtcDate(m), timeZone) === latestDate);
      return { labelKey: "sec_latestResults", date: latestDate, matches: completedMatchesOnDate };
    }
  }

  const allDates = getMatchdayDates(matches, timeZone);
  const firstDate = allDates[0];
  return { labelKey: "sec_nextMatches", date: firstDate, matches: getMatchesForDateInZone({ date: firstDate, timeZone, matches }) };
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

export function getMatchdayDates(matches: Match[], timeZone: string): string[] {
  const dates = new Set<string>();
  for (const m of matches) {
    dates.add(getMatchCalendarDateInZone(matchUtcDate(m), timeZone));
  }
  return Array.from(dates).sort();
}

export function getPreviousMatchdayDate(selectedDate: string, matchdayDates: string[]): string | null {
  const idx = matchdayDates.indexOf(selectedDate);
  if (idx > 0) return matchdayDates[idx - 1];
  if (idx === -1) {
    const prevs = [...matchdayDates].reverse().find(d => d < selectedDate);
    return prevs || null;
  }
  return null;
}

export function getNextMatchdayDate(selectedDate: string, matchdayDates: string[]): string | null {
  const idx = matchdayDates.indexOf(selectedDate);
  if (idx !== -1 && idx < matchdayDates.length - 1) return matchdayDates[idx + 1];
  if (idx === -1) {
    const nexts = matchdayDates.find(d => d > selectedDate);
    return nexts || null;
  }
  return null;
}

export function isParticipantResolved(label: string): boolean {
  if (!label) return false;
  const lower = label.toLowerCase();
  return !(
    lower.includes("winner match") ||
    lower.includes("loser match") ||
    lower.includes("winner of") ||
    lower.includes("loser of") ||
    lower === "tbd" ||
    lower === "to be decided"
  );
}

export function areMatchParticipantsResolved(match: Match, resolvedParticipants?: import("./participant-resolution").ResolvedParticipantLookup): boolean {
  const home = getParticipantDisplay(match, "home", resolvedParticipants);
  const away = getParticipantDisplay(match, "away", resolvedParticipants);
  return isParticipantResolved(home.label) && isParticipantResolved(away.label);
}

export function getNextResolvedUpcomingMatchday(
  referenceDate: string,
  matches: Match[],
  resolvedParticipants: import("./participant-resolution").ResolvedParticipantLookup | undefined,
  timeZone: string
): { date: string, matches: Match[] } | null {
  const dates = getMatchdayDates(matches, timeZone);
  const futureDates = dates.filter(d => d > referenceDate);

  for (const d of futureDates) {
    const dayMatches = getMatchesForDateInZone({ date: d, timeZone, matches });
    const allResolved = dayMatches.every(m => areMatchParticipantsResolved(m, resolvedParticipants));
    if (allResolved && dayMatches.length > 0) {
      return { date: d, matches: dayMatches };
    }
  }
  return null;
}

export function getLatestCompletedMatches(matches: Match[], liveDataByProviderId: Record<string, any>, limit: number = 100): Match[] {
  const completedMatchIds = new Set(
    Object.entries(liveDataByProviderId)
      .filter(([_, live]) => live?.status === "FINISHED")
      .map(([id]) => id)
  );

  const completedMatches = matches.filter(m => {
    if (m.providerIds?.footballData && completedMatchIds.has(String(m.providerIds.footballData))) return true;
    return false;
  }).sort((a, b) => matchUtcDate(b).getTime() - matchUtcDate(a).getTime());

  return completedMatches.slice(0, limit);
}
