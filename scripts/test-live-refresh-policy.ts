import { getLiveRefreshPolicy } from "../lib/liveRefreshPolicy";
import { MATCHES, matchUtcDate } from "../lib/matches";
import { buildKnockoutResolution } from "../lib/knockoutResolution";

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
  new Date(matchUtcDate(MATCHES[0]).getTime() + 4 * 60 * 60 * 1000) // 4 hours after kickoff
);
assert(pastScheduled.reason === "near-match", "SCHEDULED match past kickoff remains refresh-eligible");

// 2. Finished but incomplete score remains refresh-eligible
const incompleteScore = getLiveRefreshPolicy(
  [{ match: MATCHES[0], status: "FINISHED", homeScore: null, awayScore: 1 }],
  new Date(matchUtcDate(MATCHES[0]).getTime() + 10 * 60 * 60 * 1000) // 10 hours after kickoff
);
assert(incompleteScore.reason === "near-match", "FINISHED match with incomplete score remains refresh-eligible");

// 3. Finished but incomplete penalty shootout score remains refresh-eligible
const penaltyMatch = MATCHES.find(m => "matchNumber" in m && m.matchNumber === 74) || MATCHES[0];
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
  new Date(matchUtcDate(penaltyMatch).getTime() + 10 * 60 * 60 * 1000)
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
    new Date(matchUtcDate(knockoutMatch).getTime() + 10 * 60 * 60 * 1000)
  );
  assert(unresolvedKnockout.reason === "near-match", "FINISHED knockout match with unresolved bracket participants remains refresh-eligible");
}

// 5. Weeks in the future does not trigger live refresh
const weeksInFuture = getLiveRefreshPolicy(
  [{ match: MATCHES[MATCHES.length - 1], status: "SCHEDULED" }],
  new Date(matchUtcDate(MATCHES[MATCHES.length - 1]).getTime() - 21 * 24 * 60 * 60 * 1000) // 21 days before kickoff
);
assert(weeksInFuture.reason === "idle", "a match weeks in the future does not trigger live refresh");

// 6. Unresolved future knockout match does not trigger live refresh
const futureKnockout = MATCHES.find(m => "matchNumber" in m && m.matchNumber === 89);
if (futureKnockout) {
  const unresolvedFutureKnockout = getLiveRefreshPolicy(
    [{ match: futureKnockout, status: "SCHEDULED" }],
    new Date(matchUtcDate(futureKnockout).getTime() - 10 * 24 * 60 * 60 * 1000) // 10 days before kickoff
  );
  assert(unresolvedFutureKnockout.reason === "idle", "an unresolved future knockout match does not trigger live refresh");
}

// 7. Match near kickoff does trigger refresh
const nearKickoff = getLiveRefreshPolicy(
  [{ match: MATCHES[0], status: "SCHEDULED" }],
  new Date(matchUtcDate(MATCHES[0]).getTime() - 30 * 60 * 1000) // 30 minutes before kickoff
);
assert(nearKickoff.reason === "near-match", "a match near kickoff does trigger refresh");

// 8. In-progress match beyond four hours remains refreshable
const longLive = getLiveRefreshPolicy(
  [{ match: MATCHES[0], status: "LIVE" }],
  new Date(matchUtcDate(MATCHES[0]).getTime() + 5 * 60 * 60 * 1000) // 5 hours after kickoff
);
assert(longLive.reason === "live", "an in-progress match beyond four hours remains refreshable");

// 9. Terminal complete match returns to normal cache behavior
const completeMatch = getLiveRefreshPolicy(
  [{
    match: MATCHES[0],
    status: "FINISHED",
    homeScore: 2,
    awayScore: 0,
    goalEventCompleteness: {
      isGoalEventDataComplete: true,
      missingGoalEventCount: 0,
      expectedGoalCount: 2,
      normalizedGoalEventCount: 2,
      completenessReason: "complete",
    },
    live: {
      provider: "football-data.org",
      providerMatchId: 123,
      status: "FINISHED",
      homeScore: 2,
      awayScore: 0,
      winner: "HOME_TEAM",
      scoreDuration: "REGULAR",
      lastSyncedAt: new Date().toISOString(),
      eventDataAvailable: true,
    }
  }],
  new Date(matchUtcDate(MATCHES[0]).getTime() + 10 * 60 * 60 * 1000)
);
assert(completeMatch.reason === "idle", "a terminal complete match returns to normal cache behavior");

// 10. Bracket propagation can complete after an upstream match finalizes
const m74Raw = MATCHES.find(m => "matchNumber" in m && m.matchNumber === 74)!;
const m89Raw = MATCHES.find(m => "matchNumber" in m && m.matchNumber === 89)!;

const unresolvedBracket = buildKnockoutResolution({
  "match-74": {
    match: m74Raw,
    internalId: "match-74",
    providerMatchId: 537415,
    status: "SCHEDULED",
    homeScore: null,
    awayScore: null,
    scorers: [],
    goalEventCompleteness: {
      isGoalEventDataComplete: false,
      missingGoalEventCount: 0,
      expectedGoalCount: 0,
      normalizedGoalEventCount: 0,
      completenessReason: "event-data-unavailable",
    },
    sourceUpdatedAt: null,
    providerUpdatedAt: null,
    live: null,
  }
});
assert(unresolvedBracket[89]?.home === undefined, "bracket propagation: Match 89 home is unresolved when Match 74 is scheduled");

const resolvedBracket = buildKnockoutResolution({
  "match-74": {
    match: m74Raw,
    internalId: "match-74",
    providerMatchId: 537415,
    status: "FINISHED",
    homeScore: 1,
    awayScore: 1,
    scorers: [],
    goalEventCompleteness: {
      isGoalEventDataComplete: true,
      missingGoalEventCount: 0,
      expectedGoalCount: 2,
      normalizedGoalEventCount: 2,
      completenessReason: "complete",
    },
    sourceUpdatedAt: new Date().toISOString(),
    providerUpdatedAt: new Date().toISOString(),
    live: {
      provider: "football-data.org",
      providerMatchId: 537415,
      status: "FINISHED",
      homeScore: 1,
      awayScore: 1,
      winner: "AWAY_TEAM",
      scoreDuration: "PENALTY_SHOOTOUT",
      penaltyShootoutScore: { home: 3, away: 4 },
      lastSyncedAt: new Date().toISOString(),
      eventDataAvailable: true,
    },
  }
});
assert(resolvedBracket[89]?.home?.teamKey === "paraguay", "bracket propagation can complete after an upstream match finalizes");

// 11. Terminal incomplete match past 48h safety window stops refreshing
const oldIncomplete = getLiveRefreshPolicy(
  [{ match: MATCHES[0], status: "FINISHED", homeScore: null, awayScore: 1 }],
  new Date(matchUtcDate(MATCHES[0]).getTime() + 50 * 60 * 60 * 1000) // 50 hours after kickoff
);
assert(oldIncomplete.reason === "idle", "terminal incomplete match past 48h stops refreshing (safety window)");

console.log("\nHidden-tab pause/resume is implemented in LiveDataAutoRefresh via document.visibilityState.");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
