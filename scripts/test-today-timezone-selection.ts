/**
 * Focused test for /today timezone day selection.
 *
 * Usage:
 *   npx tsx scripts/test-today-timezone-selection.ts
 */

import { MATCHES, matchSlug, matchUtcDate } from "../lib/matches";
import {
  getTodayMatchesForTimeZone,
  localISODateInTimeZone,
  nextUpcomingMatchesForTimeZone,
  resolveSelectedTimeZone,
} from "../lib/todaySelection";

const USA_PARAGUAY = "united-states-vs-paraguay-jun12";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  PASS  ${msg}`);
    passed++;
  } else {
    console.error(`  FAIL  ${msg}`);
    failed++;
  }
}

function slugs(matches = MATCHES) {
  return matches.map(matchSlug);
}

console.log("=== Today timezone selection test ===\n");

const usaParaguay = MATCHES.find((match) => matchSlug(match) === USA_PARAGUAY);
assert(Boolean(usaParaguay), "USA-Paraguay fixture exists");

if (usaParaguay) {
  const kickoff = matchUtcDate(usaParaguay);
  assert(localISODateInTimeZone(kickoff, "Europe/Istanbul") === "2026-06-13", "USA-Paraguay is June 13 in Europe/Istanbul");
  assert(localISODateInTimeZone(kickoff, "America/New_York") === "2026-06-12", "USA-Paraguay is June 12 in America/New_York");
  assert(localISODateInTimeZone(kickoff, "America/Los_Angeles") === "2026-06-12", "USA-Paraguay is June 12 in America/Los_Angeles");
  assert(localISODateInTimeZone(kickoff, "Asia/Tokyo") === "2026-06-13", "USA-Paraguay is June 13 in Asia/Tokyo");
}

const postUsaKickoff = new Date("2026-06-13T09:00:00.000Z");
const istanbulToday = getTodayMatchesForTimeZone({
  now: postUsaKickoff,
  timeZone: "Europe/Istanbul",
});
assert(istanbulToday.date === "2026-06-13", "Istanbul selected day is June 13");
assert(slugs(istanbulToday.matches).includes(USA_PARAGUAY), "Istanbul Today includes USA-Paraguay after local midnight");

const tokyoToday = getTodayMatchesForTimeZone({
  now: postUsaKickoff,
  timeZone: "Asia/Tokyo",
});
assert(tokyoToday.date === "2026-06-13", "Tokyo selected day is June 13");
assert(slugs(tokyoToday.matches).includes(USA_PARAGUAY), "Tokyo Today includes USA-Paraguay on June 13");

const losAngelesJune13 = getTodayMatchesForTimeZone({
  now: postUsaKickoff,
  timeZone: "America/Los_Angeles",
});
assert(losAngelesJune13.date === "2026-06-13", "Los Angeles selected day is June 13 at the shared verification clock");
assert(!slugs(losAngelesJune13.matches).includes(USA_PARAGUAY), "Los Angeles June 13 does not include USA-Paraguay");

const losAngelesJune12 = getTodayMatchesForTimeZone({
  now: new Date("2026-06-13T02:00:00.000Z"),
  timeZone: "America/Los_Angeles",
});
assert(losAngelesJune12.date === "2026-06-12", "Los Angeles selected day can be June 12 at its local clock");
assert(slugs(losAngelesJune12.matches).includes(USA_PARAGUAY), "Los Angeles classifies USA-Paraguay under June 12");

const upcomingAfterUsaKickoff = nextUpcomingMatchesForTimeZone({
  now: postUsaKickoff,
  timeZone: "Europe/Istanbul",
});
assert(
  !slugs(upcomingAfterUsaKickoff.flatMap((day) => day.matches)).includes(USA_PARAGUAY),
  "fallback upcoming list does not re-add already kicked-off USA-Paraguay",
);

assert(resolveSelectedTimeZone("Europe/Istanbul") === "Europe/Istanbul", "valid tz query is accepted");
assert(resolveSelectedTimeZone("Not/A_Zone") === "America/New_York", "invalid tz query falls back safely");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
