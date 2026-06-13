/**
 * First-visit timezone reconciliation regression test.
 *
 * On a first anonymous visit there is no wc2026-tz cookie yet, so the server
 * renders with DEFAULT_TIMEZONE. After the client detects the browser
 * timezone and persists the cookie, TimezoneProvider should trigger exactly
 * one router.refresh() if the detected timezone differs from what the server
 * used — and never refresh again for that same resolved timezone in the
 * session, and never refresh when they already match (including the
 * explicit ?tz= case, which is handled separately and never reaches this
 * check).
 *
 * Usage:
 *   npx tsx scripts/test-timezone-first-visit-refresh.ts
 */

import { DEFAULT_TIMEZONE, shouldRefreshForTimeZone } from "../lib/timezone";

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

console.log("=== First-visit timezone reconciliation test ===\n");

// --- First anonymous visit: no cookie -> server used DEFAULT_TIMEZONE, browser is Europe/Istanbul ---
assert(
  shouldRefreshForTimeZone(DEFAULT_TIMEZONE, "Europe/Istanbul", false) === true,
  "first anonymous visit with a different browser timezone triggers exactly one refresh",
);

// --- Same session, same resolved timezone: guard already set -> no second refresh ---
assert(
  shouldRefreshForTimeZone(DEFAULT_TIMEZONE, "Europe/Istanbul", true) === false,
  "no repeated refresh once the one-time guard is set for the resolved timezone",
);

// --- Server already matches the resolved browser timezone (e.g. returning visitor with cookie) ---
assert(
  shouldRefreshForTimeZone("Europe/Istanbul", "Europe/Istanbul", false) === false,
  "no refresh when the server-selected timezone already matches the resolved timezone",
);

// --- Browser timezone happens to be the default (America/New_York) on a first visit ---
assert(
  shouldRefreshForTimeZone(DEFAULT_TIMEZONE, DEFAULT_TIMEZONE, false) === false,
  "no refresh on first visit when the detected timezone equals DEFAULT_TIMEZONE",
);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
