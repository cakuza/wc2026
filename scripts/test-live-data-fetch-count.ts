/**
 * Unit test: confirms aggregate computation uses exactly one bulk provider fetch.
 *
 * Mocks the provider HTTP call, runs /groups-style, /stats-style, and
 * /schedule-style data preparation, and asserts fetch was called only once
 * regardless of how many matches are mapped.
 *
 * Usage:
 *   npx tsx scripts/test-live-data-fetch-count.ts
 */

import { computeGroupStandings } from "../lib/groupStandings";
import { computeTournamentStats, computeTeamLeaderboards, computeTopScorers } from "../lib/tournamentStats";
import type { LiveMatchData } from "../lib/liveMatchData";

let fetchCallCount = 0;

const MOCK_RESPONSE = JSON.stringify({
  matches: [
    {
      id: 537327,
      status: "FINISHED",
      utcDate: "2026-06-11T19:00:00Z",
      score: { fullTime: { home: 2, away: 0 }, winner: "HOME_TEAM" },
      goals: null,
      bookings: null,
      substitutions: null,
    },
  ],
});

let passed = 0;
let failed = 0;

function assert(cond: boolean, msg: string) {
  if (cond) {
    console.log(`  PASS  ${msg}`);
    passed++;
  } else {
    console.error(`  FAIL  ${msg}`);
    failed++;
  }
}

// Verify that a function using a preloaded liveData map
// does not call fetch again for each item.
function assertNoFetchForMapLookup(
  liveData: Map<number, LiveMatchData>,
  beforeCount: number,
): void {
  [537327, 537328, 537329, 537330, 537331].forEach((id) => liveData.get(id));
  assert(fetchCallCount === beforeCount, `map lookups don't trigger extra fetches (got ${fetchCallCount})`);
}

async function main() {
  console.log("=== Live data fetch-count test ===\n");

  // Patch global fetch before importing fetchAllLiveData
  const realFetch = global.fetch;
  (global as Record<string, unknown>).fetch = (
    input: Parameters<typeof fetch>[0],
    init?: Parameters<typeof fetch>[1],
  ) => {
    const url = typeof input === "string" ? input : input.toString();
    if (url.includes("football-data.org")) {
      fetchCallCount++;
      return Promise.resolve(
        new Response(MOCK_RESPONSE, {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    }
    return realFetch(input, init);
  };

  process.env.FOOTBALL_DATA_API_KEY = "test-key";

  // Dynamic import ensures mock is active before module initializes
  const { fetchAllLiveData } = await import("../lib/fetchAllLiveData");

  // ── A) /groups-style ──────────────────────────────────────────────────────
  console.log("A) Groups-style aggregation:");
  fetchCallCount = 0;
  const liveA = await fetchAllLiveData();
  computeGroupStandings(liveA);
  assert(fetchCallCount === 1, `groups-style uses 1 bulk fetch (got ${fetchCallCount})`);
  assert(liveA.size === 1, `bulk map has 1 entry (got ${liveA.size})`);

  // ── B) /stats-style ───────────────────────────────────────────────────────
  console.log("\nB) Stats-style aggregation:");
  fetchCallCount = 0;
  const liveB = await fetchAllLiveData();
  computeTournamentStats(liveB);
  const standingsB = computeGroupStandings(liveB);
  computeTeamLeaderboards(standingsB);
  computeTopScorers(liveB);
  assert(fetchCallCount === 1, `stats-style uses 1 bulk fetch (got ${fetchCallCount})`);

  // ── C) /schedule-style ────────────────────────────────────────────────────
  console.log("\nC) Schedule-style data preparation:");
  fetchCallCount = 0;
  const liveC = await fetchAllLiveData();
  const liveScores: Record<number, { status: string; homeScore: number | null; awayScore: number | null }> = {};
  for (const [id, data] of liveC) {
    liveScores[id] = { status: data.status, homeScore: data.homeScore, awayScore: data.awayScore };
  }
  assert(fetchCallCount === 1, `schedule-style uses 1 bulk fetch (got ${fetchCallCount})`);
  assert(Object.keys(liveScores).length === 1, "schedule score map has 1 entry");
  assert(liveScores[537327]?.homeScore === 2, "Mexico score = 2 in schedule map");

  // ── D) Map lookups don't trigger extra fetches ─────────────────────────────
  console.log("\nD) Match detail lookups do not trigger extra fetches:");
  fetchCallCount = 0;
  const liveD = await fetchAllLiveData();
  assertNoFetchForMapLookup(liveD, fetchCallCount);

  // Restore
  (global as Record<string, unknown>).fetch = realFetch;

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});

export {};
