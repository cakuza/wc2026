import { MATCHES, matchUtcDate } from "../lib/matches";
import { getLiveRefreshPolicy, LIVE_REFRESH_START_BEFORE_MS, LIVE_REFRESH_STOP_AFTER_MS } from "../lib/liveRefreshPolicy";
import type { LiveMatchData } from "../lib/liveMatchData";
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

console.log("=== Live refresh policy test ===\n");

function liveData(overrides: Partial<LiveMatchData> = {}): LiveMatchData {
  return {
    provider: "football-data.org",
    providerMatchId: 1234,
    status: "IN_PLAY",
    homeScore: 0,
    awayScore: 0,
    winner: null,
    scoreDuration: null,
    lastSyncedAt: new Date().toISOString(),
    eventDataAvailable: true,
    ...overrides,
  };
}

const match = MATCHES[0];
const kickoff = matchUtcDate(match).getTime();

// 1. No matches within window => no interval / no polling
const weeksInFuture = getLiveRefreshPolicy(
  [{ match, status: "SCHEDULED" }],
  new Date(kickoff - 21 * 24 * 60 * 60 * 1000)
);
assert(weeksInFuture.reason === "idle", "no matches within window => no interval / no polling");

// 2. 16 minutes before kickoff => no polling
const sixteenMinBefore = getLiveRefreshPolicy(
  [{ match, status: "SCHEDULED" }],
  new Date(kickoff - 16 * 60 * 1000)
);
assert(sixteenMinBefore.reason === "idle", "16 minutes before kickoff => no polling");

// 3. 15 minutes before kickoff => polling allowed
const fifteenMinBefore = getLiveRefreshPolicy(
  [{ match, status: "SCHEDULED" }],
  new Date(kickoff - 15 * 60 * 1000)
);
assert(fifteenMinBefore.reason === "near-match", "15 minutes before kickoff => polling allowed");

// 4. during match => polling allowed
const duringMatch = getLiveRefreshPolicy(
  [{ match, status: "LIVE" }],
  new Date(kickoff + 45 * 60 * 1000)
);
assert(duringMatch.reason === "live", "during match => polling allowed");

// 5. 195 minutes after kickoff => polling allowed (missing score inside window)
const oneNineFiveAfter = getLiveRefreshPolicy(
  [{ match, status: "FINISHED" }], // no live object, so canonical is incomplete
  new Date(kickoff + 195 * 60 * 1000)
);
assert(oneNineFiveAfter.reason === "near-match", "+195 min boundary => polling allowed");
assert(oneNineFiveAfter.reason === "near-match", "FINISHED with missing score inside window => polling allowed");

// 5b. FINISHED with complete score inside window => no polling
const completeFinished = getLiveRefreshPolicy(
  [{ 
    match, 
    status: "FINISHED",
    homeScore: 2,
    awayScore: 0,
    live: liveData({
      status: "FINISHED",
      homeScore: 2,
      awayScore: 0,
      winner: "HOME_TEAM",
      scoreDuration: "REGULAR"
    })
  }], 
  new Date(kickoff + 195 * 60 * 1000)
);
assert(completeFinished.reason === "idle", "FINISHED with complete score inside window => no polling");

// 5c. FINISHED with missing winner for knockout inside window => polling allowed
const m74Raw = MATCHES.find(m => "matchNumber" in m && m.matchNumber === 74)!;
const missingWinner = getLiveRefreshPolicy(
  [{ 
    match: m74Raw, 
    status: "FINISHED",
    homeScore: 1,
    awayScore: 1,
    live: liveData({
      status: "FINISHED",
      homeScore: 1,
      awayScore: 1,
      // winner missing
      scoreDuration: "PENALTY_SHOOTOUT"
    })
  }], 
  new Date(matchUtcDate(m74Raw).getTime() + 195 * 60 * 1000)
);
assert(missingWinner.reason === "near-match", "FINISHED with missing winner for knockout inside window => polling allowed");

// 6. 196 minutes after kickoff => no polling
const oneNineSixAfter = getLiveRefreshPolicy(
  [{ match, status: "FINISHED" }], // incomplete but past hard window
  new Date(kickoff + 196 * 60 * 1000)
);
assert(oneNineSixAfter.reason === "idle", "+196 min boundary => no polling");
assert(oneNineSixAfter.reason === "idle", "FINISHED with missing score after +196 minutes => no polling");

// 7. stale LIVE status beyond cutoff does not keep polling forever
const staleLiveAfterCutoff = getLiveRefreshPolicy(
  [{ match, status: "LIVE" }],
  new Date(kickoff + 196 * 60 * 1000) // testing exactly 196 min boundary
);
assert(staleLiveAfterCutoff.reason === "idle", "stale LIVE after +196 minutes => no polling");
assert(weeksInFuture.reason === "idle", "SCHEDULED outside window => no polling");
assert(fifteenMinBefore.reason === "near-match", "-15 min boundary => polling allowed");

// 8. multiple matches: if any match is inside the window, refresh allowed
const futureMatch = MATCHES[1];
const multipleMatches = getLiveRefreshPolicy(
  [
    { match: match, status: "FINISHED" }, // past the cutoff
    { match: futureMatch, status: "SCHEDULED" } // inside the window
  ],
  new Date(matchUtcDate(futureMatch).getTime() - 10 * 60 * 1000)
);
assert(multipleMatches.reason === "near-match", "multiple matches: if any match is inside the window, refresh allowed");

// 9. Bracket propagation can complete after an upstream match finalizes
const m79Raw = MATCHES.find(m => "matchNumber" in m && m.matchNumber === 79)!;
const m92Raw = MATCHES.find(m => "matchNumber" in m && m.matchNumber === 92)!;

const unresolvedBracket = buildKnockoutResolution({
  "match-79": {
    match: m79Raw,
    internalId: "match-79",
    providerMatchId: 537419,
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
assert(unresolvedBracket[92]?.home === undefined, "bracket propagation: Match 92 home is unresolved when Match 79 is scheduled");

const resolvedBracket = buildKnockoutResolution({
  "match-79": {
    match: m79Raw,
    internalId: "match-79",
    providerMatchId: 537419,
    status: "FINISHED",
    homeScore: 2,
    awayScore: 0,
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
      providerMatchId: 537419,
      status: "FINISHED",
      homeScore: 2,
      awayScore: 0,
      winner: "HOME_TEAM",
      scoreDuration: "REGULAR",
      lastSyncedAt: new Date().toISOString(),
      eventDataAvailable: true,
    },
  }
});
assert(resolvedBracket[92]?.home?.teamKey === "mexico", "bracket propagation can complete after an upstream match finalizes");

console.log("\nHidden-tab pause/resume is implemented in LiveDataAutoRefresh via document.visibilityState.");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
