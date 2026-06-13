/**
 * Timezone date-selection + cookie fallback regression test (Part 9).
 *
 * Covers:
 *  - 2026-06-14T01:30 Europe/Istanbul resolves to local date 2026-06-14 and
 *    includes Australia vs Turkey (kickoff 07:00 Europe/Istanbul same day).
 *  - The same instant resolves to a different local date in a North American
 *    timezone, with different Today membership.
 *  - Changing timezone changes both the local date key and the Today list.
 *  - Heading date, "today" matches, and next-kickoff all derive from the same
 *    local date key (getLocalDateKey === getMatchCalendarDateInZone).
 *  - DST-safe date-key generation around a DST transition.
 *  - resolveSelectedTimeZone cookie fallback when no ?tz= query param is present.
 *
 * Usage:
 *   npx tsx scripts/test-timezone-cookie-and-live-day.ts
 */

import { MATCHES, matchSlug, matchUtcDate } from "../lib/matches";
import {
  getDisplayMatchdayForTimeZone,
  getLocalDateKey,
  getMatchCalendarDateInZone,
  getTodayMatchesForTimeZone,
  resolveSelectedTimeZone,
} from "../lib/todaySelection";

const AUSTRALIA_TURKEY = "australia-vs-turkey-jun13";

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

console.log("=== Timezone cookie + live-day selection test ===\n");

const australiaTurkey = MATCHES.find((match) => matchSlug(match) === AUSTRALIA_TURKEY);
assert(Boolean(australiaTurkey), "Australia-Turkey fixture exists");

if (australiaTurkey) {
  const kickoff = matchUtcDate(australiaTurkey);
  assert(kickoff.toISOString() === "2026-06-14T04:00:00.000Z", "Australia-Turkey kicks off at 2026-06-14T04:00:00Z");
  assert(
    getMatchCalendarDateInZone(kickoff, "Europe/Istanbul") === "2026-06-14",
    "Australia-Turkey is June 14 in Europe/Istanbul (07:00 local)",
  );
}

// --- Case 1: 2026-06-14T01:30 Europe/Istanbul -> local date 2026-06-14, Australia-Turkey included ---
const referenceNow = new Date("2026-06-13T22:30:00.000Z"); // 01:30 on 14 June in Europe/Istanbul (+3)
const istanbulToday = getTodayMatchesForTimeZone({ now: referenceNow, timeZone: "Europe/Istanbul" });
assert(istanbulToday.date === "2026-06-14", "Europe/Istanbul local date at 01:30 is 2026-06-14");
assert(
  slugs(istanbulToday.matches).includes(AUSTRALIA_TURKEY),
  "Europe/Istanbul Today (2026-06-14) includes Australia vs Turkey at 07:00 local",
);

const istanbulMatchday = getDisplayMatchdayForTimeZone({ now: referenceNow, timeZone: "Europe/Istanbul" });
assert(istanbulMatchday.date === istanbulToday.date, "Display matchday date matches getTodayMatchesForTimeZone date");
assert(
  slugs(istanbulMatchday.matches).includes(AUSTRALIA_TURKEY),
  "Display matchday for Europe/Istanbul includes Australia vs Turkey",
);

// --- Case 2: same instant in a North American timezone follows that timezone's date ---
const losAngelesToday = getTodayMatchesForTimeZone({ now: referenceNow, timeZone: "America/Los_Angeles" });
assert(losAngelesToday.date === "2026-06-13", "America/Los_Angeles local date at the same instant is 2026-06-13");
assert(losAngelesToday.date !== istanbulToday.date, "America/Los_Angeles and Europe/Istanbul disagree on the local date");

// --- Case 3: changing timezone changes both kickoff date AND Today list membership ---
assert(
  slugs(losAngelesToday.matches).includes(AUSTRALIA_TURKEY),
  "America/Los_Angeles Today (2026-06-13) also includes Australia vs Turkey (21:00 local on 13 June there)",
);
assert(
  slugs(istanbulToday.matches).join(",") !== slugs(losAngelesToday.matches).join(","),
  "Today match list membership differs between timezones for the same instant",
);

// --- Case 4: heading/summary/match-list date keys all derive from the same canonical helper ---
if (australiaTurkey) {
  const kickoffKey = getLocalDateKey(matchUtcDate(australiaTurkey), "Europe/Istanbul");
  assert(kickoffKey === istanbulMatchday.date, "Australia-Turkey's local date key matches the Today heading date key");
  assert(getLocalDateKey === getMatchCalendarDateInZone, "getLocalDateKey is the canonical alias of getMatchCalendarDateInZone");
}

// --- Case 5: no hydration mismatch around midnight (both sides of midnight produce stable, distinct keys) ---
const justBeforeMidnightIstanbul = new Date("2026-06-13T20:59:59.000Z"); // 23:59:59 on 13 June
const justAfterMidnightIstanbul = new Date("2026-06-13T21:00:01.000Z"); // 00:00:01 on 14 June
assert(
  getMatchCalendarDateInZone(justBeforeMidnightIstanbul, "Europe/Istanbul") === "2026-06-13",
  "23:59:59 Europe/Istanbul is still 13 June",
);
assert(
  getMatchCalendarDateInZone(justAfterMidnightIstanbul, "Europe/Istanbul") === "2026-06-14",
  "00:00:01 Europe/Istanbul rolls over to 14 June",
);

// --- Case 6: DST-safe date-key generation (America/Los_Angeles spring-forward, 2026-03-08) ---
const dstTransitionInstant = new Date("2026-03-08T09:30:00.000Z"); // 01:30 PST before spring-forward
assert(
  getMatchCalendarDateInZone(dstTransitionInstant, "America/Los_Angeles") === "2026-03-08",
  "DST-transition instant resolves to a stable local date (no off-by-one from the DST jump)",
);

// --- Cookie fallback behavior ---
assert(resolveSelectedTimeZone(undefined, "Europe/Istanbul") === "Europe/Istanbul", "no ?tz= falls back to cookie timezone when valid");
assert(resolveSelectedTimeZone(undefined, "Not/A_Zone") === "America/New_York", "invalid cookie falls back to DEFAULT_TIMEZONE");
assert(resolveSelectedTimeZone(undefined, null) === "America/New_York", "no ?tz= and no cookie falls back to DEFAULT_TIMEZONE");
assert(
  resolveSelectedTimeZone("Asia/Tokyo", "Europe/Istanbul") === "Asia/Tokyo",
  "?tz= query param takes priority over the cookie",
);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
