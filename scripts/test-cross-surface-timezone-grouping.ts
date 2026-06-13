import { MATCHES, matchSlug, matchUtcDate } from "../lib/matches";
import { getMatchCalendarDateInZone, groupMatchesByCalendarDate, getTodayMatchesForTimeZone } from "../lib/todaySelection";

let passed = 0;
let failed = 0;
function assert(condition: boolean, msg: string) {
  if (condition) { console.log(`  PASS  ${msg}`); passed++; }
  else { console.error(`  FAIL  ${msg}`); failed++; }
}

const bySlug = (slug: string) => MATCHES.find((match) => matchSlug(match) === slug)!;
const australiaTurkey = bySlug("australia-vs-turkey-jun13");
const usaParaguay = bySlug("united-states-vs-paraguay-jun12");

console.log("=== Cross-surface timezone grouping test ===\n");

assert(getMatchCalendarDateInZone(matchUtcDate(australiaTurkey), "America/New_York") === "2026-06-14", "Australia-Turkey is Sunday 14 June in New York");
assert(getMatchCalendarDateInZone(matchUtcDate(usaParaguay), "Europe/Istanbul") === "2026-06-13", "USA-Paraguay is Saturday 13 June in Istanbul");
assert(getMatchCalendarDateInZone(matchUtcDate(australiaTurkey), "Europe/Istanbul") === "2026-06-14", "Australia-Turkey is Sunday 14 June in Istanbul");

for (const tz of ["America/New_York", "Europe/Istanbul"]) {
  const grouped = groupMatchesByCalendarDate(MATCHES, tz);
  const groupedDates = new Map(grouped.flatMap((day) => day.matches.map((match) => [matchSlug(match), day.date])));
  for (const match of [australiaTurkey, usaParaguay]) {
    const direct = getMatchCalendarDateInZone(matchUtcDate(match), tz);
    assert(groupedDates.get(matchSlug(match)) === direct, `${tz}: schedule grouping equals direct helper for ${matchSlug(match)}`);
  }
}

const istanbulToday = getTodayMatchesForTimeZone({ now: new Date("2026-06-13T09:00:00.000Z"), timeZone: "Europe/Istanbul" });
assert(istanbulToday.matches.some((match) => matchSlug(match) === "united-states-vs-paraguay-jun12"), "Today selector uses same grouping for Istanbul");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
