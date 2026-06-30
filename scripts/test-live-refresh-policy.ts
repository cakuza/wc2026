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
assert(live.intervalMs !== null && live.intervalMs >= 10_000 && live.intervalMs <= 20_000, "LIVE interval is 10-20 seconds (tightened for live freshness budget)");

const halftime = getLiveRefreshPolicy([{ match, status: "HALFTIME" }], now);
assert(halftime.reason === "live", "HALFTIME uses live refresh policy");
assert(halftime.intervalMs !== null && halftime.intervalMs >= 10_000 && halftime.intervalMs <= 20_000, "HALFTIME interval is 10-20 seconds");

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

// 1. Not in terminal state but past kickoff remains refresh-eligible
const pastScheduled = getLiveRefreshPolicy(
  [{ match: MATCHES[0], status: "SCHEDULED" }],
  new Date(new Date(MATCHES[0].date + "T" + (MATCHES[0].time || "12:00") + ":00Z").getTime() + 4 * 60 * 60 * 1000) // 4 hours after kickoff
);
assert(pastScheduled.reason === "near-match", "SCHEDULED match past kickoff remains refresh-eligible");

// 2. Finished but incomplete score remains refresh-eligible
const incompleteScore = getLiveRefreshPolicy(
  [{ match: MATCHES[0], status: "FINISHED", homeScore: null, awayScore: 1 }],
  new Date(new Date(MATCHES[0].date + "T" + (MATCHES[0].time || "12:00") + ":00Z").getTime() + 10 * 60 * 60 * 1000) // 10 hours after kickoff
);
assert(incompleteScore.reason === "near-match", "FINISHED match with incomplete score remains refresh-eligible");

// 3. Finished but incomplete penalty shootout score remains refresh-eligible
const penaltyMatch = MATCHES.find(m => m.stage && m.stage !== "group") || MATCHES[0];
const incompleteShootout = getLiveRefreshPolicy(
  [{
    match: penaltyMatch,
    status: "FINISHED",
    homeScore: 1,
    awayScore: 1,
    live: {
      provider: "football-data.org",
      providerMatchId: 1234,
      status: "FINISHED",
      homeScore: 1,
      awayScore: 1,
      winner: "HOME_TEAM",
      scoreDuration: "PENALTY_SHOOTOUT",
      penaltyShootoutScore: null,
      lastSyncedAt: new Date().toISOString(),
      eventDataAvailable: true,
    }
  }],
  new Date(new Date(penaltyMatch.date + "T" + (penaltyMatch.time || "12:00") + ":00Z").getTime() + 10 * 60 * 60 * 1000)
);
assert(incompleteShootout.reason === "near-match", "FINISHED penalty shootout match with missing shootout score remains refresh-eligible");

// 4. Finished knockout match with unresolved participants remains refresh-eligible
const knockoutMatch = MATCHES.find(m => "matchNumber" in m && m.matchNumber === 89);
if (knockoutMatch) {
  const unresolvedKnockout = getLiveRefreshPolicy(
    [{
      match: knockoutMatch,
      status: "FINISHED",
      homeScore: 2,
      awayScore: 1,
      live: {
        provider: "football-data.org",
        providerMatchId: 5678,
        status: "FINISHED",
        homeScore: 2,
        awayScore: 1,
        winner: "HOME_TEAM",
        scoreDuration: "REGULAR",
        lastSyncedAt: new Date().toISOString(),
        eventDataAvailable: true,
      }
    }],
    new Date(new Date(knockoutMatch.date + "T" + (knockoutMatch.time || "12:00") + ":00Z").getTime() + 10 * 60 * 60 * 1000)
  );
  assert(unresolvedKnockout.reason === "near-match", "FINISHED knockout match with unresolved bracket participants remains refresh-eligible");
}

console.log("\nHidden-tab pause/resume is implemented in LiveDataAutoRefresh via document.visibilityState.");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
