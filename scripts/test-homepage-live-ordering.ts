/**
 * Homepage "Today's Matches" live-state ordering regression test (Part 6/9).
 *
 * Covers:
 *  - scheduled matches without live data are ranked after live matches.
 *  - live (IN_PLAY/PAUSED) matches are always ranked first.
 *  - finished matches are ranked last, newest-first.
 *  - upcoming matches are ordered by kickoff time ascending.
 *
 * Usage:
 *   npx tsx scripts/test-homepage-live-ordering.ts
 */

import { orderMatches, statusRank } from "../components/TodayMatches";
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

const [a, b, c] = withProviderId
  .sort((x, y) => matchUtcDate(x).getTime() - matchUtcDate(y).getTime())
  .slice(0, 3);

// a: finished, b: live, c: scheduled
const liveDataByProviderId: Record<string, LiveMatchData> = {
  ...Object.fromEntries([
    liveDataFor(a, { status: "FINISHED", homeScore: 2, awayScore: 1 }),
    liveDataFor(b, { status: "IN_PLAY", homeScore: 1, awayScore: 0 }),
  ]),
};
// c intentionally has no liveData entry -> treated as scheduled

assert(statusRank(liveDataByProviderId[String(b.providerIds!.footballData)]) === 0, "IN_PLAY ranks 0 (live first)");
assert(statusRank(undefined) === 1, "no live data ranks 1 (upcoming)");
assert(statusRank(liveDataByProviderId[String(a.providerIds!.footballData)]) === 2, "FINISHED ranks 2 (last)");

const ordered = orderMatches([a, b, c], liveDataByProviderId);
assert(matchSlug(ordered[0]) === matchSlug(b), "live match is ordered first");
assert(matchSlug(ordered[1]) === matchSlug(c), "scheduled (upcoming) match is ordered second");
assert(matchSlug(ordered[2]) === matchSlug(a), "finished match is ordered last");

// --- Two finished matches: newest-first ---
const [d, e] = withProviderId
  .sort((x, y) => matchUtcDate(x).getTime() - matchUtcDate(y).getTime())
  .slice(3, 5);
const bothFinished: Record<string, LiveMatchData> = Object.fromEntries([
  liveDataFor(d, { status: "FINISHED", homeScore: 1, awayScore: 1 }),
  liveDataFor(e, { status: "FINISHED", homeScore: 0, awayScore: 0 }),
]);
const orderedFinished = orderMatches([d, e], bothFinished);
assert(
  matchUtcDate(orderedFinished[0]).getTime() >= matchUtcDate(orderedFinished[1]).getTime(),
  "two finished matches are ordered newest-first",
);

// --- Two upcoming matches: ordered by kickoff ascending ---
const [f, g] = withProviderId
  .sort((x, y) => matchUtcDate(x).getTime() - matchUtcDate(y).getTime())
  .slice(5, 7);
const orderedUpcoming = orderMatches([g, f], {});
assert(
  matchUtcDate(orderedUpcoming[0]).getTime() <= matchUtcDate(orderedUpcoming[1]).getTime(),
  "two upcoming matches are ordered by kickoff ascending regardless of input order",
);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
