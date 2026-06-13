import { MATCHES, matchSlug, matchUtcDate } from "../lib/matches";
import {
  getDisplayMatchdayForTimeZone,
  getMatchCalendarDateInZone,
  getTodayMatchesForTimeZone,
  groupMatchesByCalendarDate,
} from "../lib/todaySelection";

let passed = 0;
let failed = 0;
function assert(condition: boolean, msg: string) {
  if (condition) { console.log(`  PASS  ${msg}`); passed++; }
  else { console.error(`  FAIL  ${msg}`); failed++; }
}

const bySlug = (slug: string) => MATCHES.find((match) => matchSlug(match) === slug)!;
const australiaTurkey = bySlug("australia-vs-turkey-jun13");

console.log("=== Homepage today timezone test ===\n");

const newYorkDate = getMatchCalendarDateInZone(matchUtcDate(australiaTurkey), "America/New_York");
assert(newYorkDate === "2026-06-14", "Australia-Turkey is grouped on 14 June in New York");

const newYorkJune13Home = getDisplayMatchdayForTimeZone({
  now: new Date("2026-06-13T12:00:00.000Z"),
  timeZone: "America/New_York",
});
assert(
  !newYorkJune13Home.matches.some((match) => matchSlug(match) === matchSlug(australiaTurkey)),
  "homepage Today preview for New York June 13 does not include Australia-Turkey",
);

for (const timeZone of ["America/New_York", "Europe/Istanbul"]) {
  const scheduleDates = new Map(
    groupMatchesByCalendarDate(MATCHES, timeZone).flatMap((day) =>
      day.matches.map((match) => [matchSlug(match), day.date]),
    ),
  );

  for (const match of MATCHES) {
    const direct = getMatchCalendarDateInZone(matchUtcDate(match), timeZone);
    assert(scheduleDates.get(matchSlug(match)) === direct, `${timeZone}: schedule grouping matches direct date for ${matchSlug(match)}`);
  }

  const now = timeZone === "America/New_York"
    ? new Date("2026-06-14T04:30:00.000Z")
    : new Date("2026-06-13T09:00:00.000Z");
  const homepage = getDisplayMatchdayForTimeZone({ now, timeZone });
  const today = getTodayMatchesForTimeZone({ now, timeZone });
  assert(homepage.date === today.date, `${timeZone}: homepage and Today selectors use the same local date`);
  for (const match of today.matches) {
    assert(homepage.matches.some((homeMatch) => matchSlug(homeMatch) === matchSlug(match)), `${timeZone}: homepage includes Today's ${matchSlug(match)}`);
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
