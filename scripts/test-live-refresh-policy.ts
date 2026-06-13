import { getLiveRefreshPolicy } from "../lib/liveRefreshPolicy";
import { MATCHES } from "../lib/matches";

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

const match = MATCHES[0];
const now = new Date("2026-06-11T18:30:00.000Z");

console.log("=== Live refresh policy test ===\n");

const live = getLiveRefreshPolicy([{ match, status: "LIVE" }], now);
assert(live.reason === "live", "LIVE uses live refresh policy");
assert(live.intervalMs !== null && live.intervalMs >= 20_000 && live.intervalMs <= 30_000, "LIVE interval is 20-30 seconds");

const halftime = getLiveRefreshPolicy([{ match, status: "HALFTIME" }], now);
assert(halftime.reason === "live", "HALFTIME uses live refresh policy");
assert(halftime.intervalMs !== null && halftime.intervalMs >= 20_000 && halftime.intervalMs <= 30_000, "HALFTIME interval is 20-30 seconds");

const syncing = getLiveRefreshPolicy([{ match, status: "SYNCING" }], now);
assert(syncing.reason === "live", "SYNCING uses live refresh policy");

const recentFinished = getLiveRefreshPolicy(
  [{ match, status: "FINISHED", providerUpdatedAt: "2026-06-11T18:05:00.000Z" }],
  now,
);
assert(recentFinished.reason === "near-match", "recent FINISHED uses near-match refresh policy");
assert(recentFinished.intervalMs === 60_000, "recent FINISHED interval is 60 seconds");

const farFuture = getLiveRefreshPolicy([{ match: MATCHES[MATCHES.length - 1], status: "SCHEDULED" }], now);
assert(farFuture.reason === "idle", "far-future scheduled match does not poll");
assert(farFuture.intervalMs === null, "far-future interval is null");

console.log("\nHidden-tab pause/resume is implemented in LiveDataAutoRefresh via document.visibilityState.");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
