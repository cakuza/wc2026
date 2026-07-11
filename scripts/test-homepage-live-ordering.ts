/**
 * Homepage "Today's Matches" live-state ordering regression test.
 *
 * Covers:
 *  - live matches are returned by selectLiveMatches
 *  - finished matches are sorted newest-first in selectLatestCompletedMatches
 *  - upcoming matches are ordered by kickoff time ascending in selectUpcomingMatches
 *
 * Usage:
 *   npx tsx scripts/test-homepage-live-ordering.ts
 */

import { selectLiveMatches, selectLatestCompletedMatches, selectUpcomingMatches } from "../lib/matchCenterSelection";
import { MATCHES, matchSlug, matchUtcDate, type Match } from "../lib/matches";
import type { LiveMatchData } from "../lib/liveMatchData";

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

function liveDataFor(match: Match, overrides: Partial<LiveMatchData>): [string, LiveMatchData] {
  const providerId = String(match.providerIds!.footballData!);
  return [
    providerId,
    {
      provider: "football-data.org",
      providerMatchId: match.providerIds!.footballData!,
      status: "SCHEDULED",
      homeScore: null,
      awayScore: null,
      winner: null,
      utcDate: matchUtcDate(match).toISOString(),
      lastSyncedAt: new Date().toISOString(),
      rawStatus: "SCHEDULED",
      eventDataAvailable: false,
      goalEventCompleteness: { expectedGoalCount: 0, normalizedGoalEventCount: 0, missingGoalEventCount: 0, isGoalEventDataComplete: true, completenessReason: "complete" },
      goals: [],
      ...overrides,
    },
  ];
}

console.log("=== Homepage live-state ordering test ===\n");

const withProviderId = MATCHES.filter((m) => m.providerIds?.footballData);
assert(withProviderId.length >= 3, "at least 3 fixtures have footballData providerIds to test ordering");

// Use fake provider IDs to bypass the hardcoded canonical fallback overrides
const a = { ...withProviderId[0], providerIds: { footballData: 999001 } };
const b = { ...withProviderId[1], providerIds: { footballData: 999002 } };
const c = { ...withProviderId[2], providerIds: { footballData: 999003 } };

const testNow = new Date(matchUtcDate(b).getTime() + 1000); // b is running, a is past, c is future

// a: finished, b: live, c: scheduled
const liveDataByProviderId: Record<string, LiveMatchData> = {
  ...Object.fromEntries([
    liveDataFor(a, { status: "FINISHED", homeScore: 2, awayScore: 1 }),
    liveDataFor(b, { status: "IN_PLAY", homeScore: 1, awayScore: 0 }),
  ]),
};

const live = selectLiveMatches({ matches: [a, b, c], liveData: liveDataByProviderId, now: testNow });
assert(live.length === 1 && matchSlug(live[0]) === matchSlug(b), "live match is selected correctly");

const upcoming = selectUpcomingMatches({ matches: [a, b, c], liveData: liveDataByProviderId, now: testNow });
assert(upcoming.length === 1 && matchSlug(upcoming[0]) === matchSlug(c), "scheduled match is selected as upcoming");

// --- Two finished matches: newest-first ---
const d = { ...withProviderId[3], providerIds: { footballData: 999004 } };
const e = { ...withProviderId[4], providerIds: { footballData: 999005 } };
const bothFinished: Record<string, LiveMatchData> = Object.fromEntries([
  liveDataFor(d, { status: "FINISHED", homeScore: 1, awayScore: 1 }),
  liveDataFor(e, { status: "FINISHED", homeScore: 0, awayScore: 0 }),
]);
const orderedFinished = selectLatestCompletedMatches({ matches: [d, e], liveData: bothFinished, now: testNow });
assert(
  orderedFinished.length === 2 && matchUtcDate(orderedFinished[0]).getTime() >= matchUtcDate(orderedFinished[1]).getTime(),
  "two finished matches are ordered newest-first",
);

// --- Two upcoming matches: ordered by kickoff ascending ---
const f = { ...withProviderId[5], providerIds: { footballData: 999006 } };
const g = { ...withProviderId[6], providerIds: { footballData: 999007 } };
const orderedUpcoming = selectUpcomingMatches({ matches: [g, f], liveData: {}, now: testNow });
assert(
  orderedUpcoming.length === 2 && matchUtcDate(orderedUpcoming[0]).getTime() <= matchUtcDate(orderedUpcoming[1]).getTime(),
  "two upcoming matches are ordered by kickoff ascending regardless of input order",
);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
