/**
 * Deterministic tests for mobile navigation structure and /today matchday date
 * navigation.
 *
 * Covers:
 *  - mobile primary navigation links + active-link state
 *  - hamburger secondary navigation (no duplication with primary)
 *  - previous / today / next date transitions
 *  - Europe/Istanbul midnight rollover
 *  - previous-matchday continuity window (00:00–03:00)
 *  - timezone-dependent date placement
 *  - direct ?date= loading (valid, out-of-range, malformed)
 *  - tournament boundary dates
 *  - no duplicate match rendering across days
 *
 * Usage:
 *   npx tsx scripts/test-matchday-date-nav.ts
 */

import { MATCHES, matchSlug, matchUtcDate } from "../lib/matches";
import {
  DESKTOP_LINKS,
  PRIMARY_LINKS,
  SECONDARY_LINKS,
  isActive,
} from "../lib/navLinks";
import {
  addCalendarDays,
  getMatchesForDateInZone,
  getTournamentDateRangeInZone,
  isValidISODate,
  localHourInTimeZone,
  previousMatchdayWithMatches,
  resolveSelectedMatchday,
} from "../lib/todaySelection";

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

const USA_PARAGUAY = "united-states-vs-paraguay-jun12";
const SWI_BOSNIA = "switzerland-vs-bosnia-jun18";

function slugs(matches = MATCHES) {
  return matches.map(matchSlug);
}

console.log("=== Matchday date navigation & mobile nav test ===\n");

// ── 1. Mobile primary navigation links ───────────────────────────────────────
console.log("1) Mobile primary navigation");
{
  const hrefs = PRIMARY_LINKS.map((l) => l.href);
  assert(hrefs.length === 4, `exactly 4 primary destinations (got ${hrefs.length})`);
  assert(hrefs.includes("/today"), "primary includes Today");
  assert(hrefs.includes("/schedule"), "primary includes Schedule");
  assert(hrefs.includes("/groups"), "primary includes Standings (/groups)");
  assert(hrefs.includes("/teams"), "primary includes Teams");
  assert(
    PRIMARY_LINKS.find((l) => l.href === "/groups")?.key === "nav_standings",
    "Standings primary link uses nav_standings label key",
  );
}

// ── 2. Active-link state ──────────────────────────────────────────────────────
console.log("\n2) Active-link state");
{
  assert(isActive("/today", "/today"), "exact /today is active");
  assert(isActive("/groups", "/groups"), "exact /groups is active");
  assert(isActive("/teams/usa", "/teams"), "/teams active on a sub-route");
  assert(!isActive("/teams-by-confederation", "/teams"), "/teams NOT active on /teams-by-confederation");
  assert(!isActive("/schedule", "/today"), "/today not active elsewhere");
  assert(isActive("/", "/"), "home active only on exact /");
  assert(!isActive("/today", "/"), "home not active on /today");
}

// ── 3. Hamburger secondary navigation ─────────────────────────────────────────
console.log("\n3) Hamburger secondary navigation");
{
  const primaryHrefs = new Set(PRIMARY_LINKS.map((l) => l.href));
  const dupes = SECONDARY_LINKS.filter((l) => primaryHrefs.has(l.href));
  assert(dupes.length === 0, "secondary drawer does not duplicate any primary href");
  const secondaryHrefs = SECONDARY_LINKS.map((l) => l.href);
  assert(secondaryHrefs.includes("/stats"), "secondary includes Stats");
  assert(secondaryHrefs.includes("/world-cup-schedule-local-time"), "secondary includes Local Time");
  assert(secondaryHrefs.includes("/about"), "secondary includes About");
  assert(!secondaryHrefs.includes("/groups"), "secondary does NOT repeat /groups");
  // Desktop set is unchanged (no regression): still 8 links incl. Hub.
  assert(DESKTOP_LINKS.length === 8, `desktop nav still has 8 links (got ${DESKTOP_LINKS.length})`);
  assert(DESKTOP_LINKS.some((l) => l.href === "/matchday-hub" && l.label === "Hub"), "desktop keeps Hub label");
}

// ── 4. isValidISODate ─────────────────────────────────────────────────────────
console.log("\n4) ISO date validation");
{
  assert(isValidISODate("2026-06-18"), "valid date accepted");
  assert(!isValidISODate("2026-13-40"), "impossible calendar date rejected");
  assert(!isValidISODate("garbage"), "non-date rejected");
  assert(!isValidISODate("2026-6-1"), "non-zero-padded rejected");
  assert(!isValidISODate(undefined), "undefined rejected");
  assert(isValidISODate(["2026-06-18"]), "array form (first valid) accepted");
}

// ── 5. addCalendarDays ────────────────────────────────────────────────────────
console.log("\n5) Calendar arithmetic");
{
  assert(addCalendarDays("2026-06-18", 1) === "2026-06-19", "+1 day");
  assert(addCalendarDays("2026-06-18", -1) === "2026-06-17", "-1 day");
  assert(addCalendarDays("2026-06-30", 1) === "2026-07-01", "month boundary +1");
  assert(addCalendarDays("2026-07-01", -1) === "2026-06-30", "month boundary -1");
}

// ── 6. Tournament date range in zone + boundaries ─────────────────────────────
console.log("\n6) Tournament boundaries");
{
  const nyRange = getTournamentDateRangeInZone({ timeZone: "America/New_York" });
  assert(nyRange.min === "2026-06-11", `NY tournament min is 2026-06-11 (got ${nyRange.min})`);
  assert(nyRange.max >= "2026-06-27", `NY tournament max covers through group stage (got ${nyRange.max})`);

  // At the first tournament date, there is no previous day.
  const atMin = resolveSelectedMatchday({
    dateParam: nyRange.min,
    timeZone: "America/New_York",
    now: new Date("2026-06-11T18:00:00.000Z"),
  });
  assert(atMin.prevDate === null, "prevDate is null at tournament min");
  assert(atMin.nextDate === addCalendarDays(nyRange.min, 1), "nextDate advances from min");

  // At the last tournament date, there is no next day.
  const atMax = resolveSelectedMatchday({
    dateParam: nyRange.max,
    timeZone: "America/New_York",
    now: new Date("2026-06-11T18:00:00.000Z"),
  });
  assert(atMax.nextDate === null, "nextDate is null at tournament max");
  assert(atMax.prevDate === addCalendarDays(nyRange.max, -1), "prevDate recedes from max");
}

// ── 7. Previous / Today / Next transitions ────────────────────────────────────
console.log("\n7) Prev / Today / Next transitions");
{
  const r = resolveSelectedMatchday({
    dateParam: "2026-06-18",
    timeZone: "America/New_York",
    now: new Date("2026-06-20T18:00:00.000Z"),
  });
  assert(r.date === "2026-06-18", "selected date is the explicit in-range date");
  assert(r.prevDate === "2026-06-17", "prevDate is the day before");
  assert(r.nextDate === "2026-06-19", "nextDate is the day after");
  assert(r.isExplicitDate === true, "explicit non-today date flagged");
  assert(r.isToday === false, "explicit past date is not 'today'");
}

// ── 8. Europe/Istanbul midnight rollover + continuity ─────────────────────────
console.log("\n8) Istanbul midnight rollover + continuity");
{
  // 2026-06-19 00:01 in Europe/Istanbul (UTC+3) == 2026-06-18T21:01Z.
  const justAfterMidnight = new Date("2026-06-18T21:01:00.000Z");
  const hour = localHourInTimeZone(justAfterMidnight, "Europe/Istanbul");
  assert(hour === 0, `Istanbul local hour is 0 at 00:01 (got ${hour})`);

  const r = resolveSelectedMatchday({
    dateParam: undefined,
    timeZone: "Europe/Istanbul",
    now: justAfterMidnight,
  });
  assert(r.todayDate === "2026-06-19", `Istanbul 'today' rolled to 2026-06-19 (got ${r.todayDate})`);
  assert(r.isToday === true, "default view is today");
  assert(r.isExplicitDate === false, "no explicit date on default view");

  const prev = previousMatchdayWithMatches({ fromDate: r.todayDate, timeZone: "Europe/Istanbul" });
  assert(prev === "2026-06-18", `previous matchday is 2026-06-18 (got ${prev})`);
  const prevMatches = getMatchesForDateInZone({ date: prev!, timeZone: "Europe/Istanbul" });
  assert(prevMatches.length > 0, "previous matchday actually has matches");
  assert(slugs(prevMatches).includes(SWI_BOSNIA), "previous matchday includes Switzerland–Bosnia (Jun 18)");

  // Continuity window: 00:00–03:00 inclusive of start, exclusive of 03:00.
  const inWindow = hour >= 0 && hour < 3;
  assert(inWindow, "00:01 is inside the continuity window");

  // 2026-06-19 05:00 Istanbul == 2026-06-19T02:00Z → hour 5, outside window.
  const morning = localHourInTimeZone(new Date("2026-06-19T02:00:00.000Z"), "Europe/Istanbul");
  assert(morning === 5, `Istanbul hour is 5 at 05:00 (got ${morning})`);
  assert(!(morning >= 0 && morning < 3), "05:00 is outside the continuity window");
}

// ── 9. Timezone-dependent date placement ──────────────────────────────────────
console.log("\n9) Timezone-dependent date placement");
{
  const nyJun12 = getMatchesForDateInZone({ date: "2026-06-12", timeZone: "America/New_York" });
  assert(slugs(nyJun12).includes(USA_PARAGUAY), "USA–Paraguay on 2026-06-12 in New York");

  const nyJun13 = getMatchesForDateInZone({ date: "2026-06-13", timeZone: "America/New_York" });
  assert(!slugs(nyJun13).includes(USA_PARAGUAY), "USA–Paraguay NOT on 2026-06-13 in New York");

  const istJun13 = getMatchesForDateInZone({ date: "2026-06-13", timeZone: "Europe/Istanbul" });
  assert(slugs(istJun13).includes(USA_PARAGUAY), "USA–Paraguay on 2026-06-13 in Istanbul");

  const istJun12 = getMatchesForDateInZone({ date: "2026-06-12", timeZone: "Europe/Istanbul" });
  assert(!slugs(istJun12).includes(USA_PARAGUAY), "USA–Paraguay NOT on 2026-06-12 in Istanbul");
}

// ── 10. Direct ?date= loading: out-of-range / malformed are ignored ───────────
console.log("\n10) Direct dated-URL loading");
{
  const now = new Date("2026-06-18T16:00:00.000Z"); // ~12:00 ET on Jun 18
  // Out of tournament range → ignored, treated as today.
  const future = resolveSelectedMatchday({ dateParam: "2026-12-25", timeZone: "America/New_York", now });
  assert(future.isExplicitDate === false, "out-of-range date is ignored");
  assert(future.date === future.todayDate, "out-of-range date falls back to today");

  // Malformed → ignored.
  const bad = resolveSelectedMatchday({ dateParam: "not-a-date", timeZone: "America/New_York", now });
  assert(bad.isExplicitDate === false, "malformed date is ignored");
  assert(bad.date === bad.todayDate, "malformed date falls back to today");

  // Valid in-range → honored.
  const ok = resolveSelectedMatchday({ dateParam: "2026-06-15", timeZone: "America/New_York", now });
  assert(ok.date === "2026-06-15", "valid in-range date honored");
  assert(ok.isExplicitDate === true, "valid non-today date is explicit");

  // ?date= equal to today is not treated as an explicit (de-indexed) date.
  const todayParam = resolveSelectedMatchday({ dateParam: bad.todayDate, timeZone: "America/New_York", now });
  assert(todayParam.isExplicitDate === false, "?date= equal to today is not flagged explicit");
}

// ── 11. No duplicate match rendering across days ──────────────────────────────
console.log("\n11) No duplicate match rendering");
{
  for (const tz of ["America/New_York", "Europe/Istanbul", "Asia/Tokyo"]) {
    const { min, max } = getTournamentDateRangeInZone({ timeZone: tz });
    const seen = new Set<string>();
    let dupes = 0;
    let total = 0;
    let date = min;
    // Walk every calendar day across the tournament range in this tz.
    while (date <= max) {
      const dayMatches = getMatchesForDateInZone({ date, timeZone: tz });
      for (const m of dayMatches) {
        const slug = matchSlug(m);
        if (seen.has(slug)) dupes++;
        seen.add(slug);
        total++;
      }
      date = addCalendarDays(date, 1);
    }
    assert(dupes === 0, `${tz}: no match appears on two days`);
    assert(total === MATCHES.length, `${tz}: every match placed exactly once (${total}/${MATCHES.length})`);
  }
}

// ── 12. Default-today view selects the local calendar date ────────────────────
console.log("\n12) Default-today selection");
{
  // ~12:00 ET on Jun 18 → today is Jun 18 in NY, and Switzerland–Bosnia is shown.
  const now = new Date("2026-06-18T16:00:00.000Z");
  const r = resolveSelectedMatchday({ dateParam: undefined, timeZone: "America/New_York", now });
  assert(r.todayDate === "2026-06-18", `NY today is 2026-06-18 (got ${r.todayDate})`);
  const todayMatches = getMatchesForDateInZone({ date: r.date, timeZone: "America/New_York" });
  assert(slugs(todayMatches).includes(SWI_BOSNIA), "default today view includes Switzerland–Bosnia on Jun 18");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
