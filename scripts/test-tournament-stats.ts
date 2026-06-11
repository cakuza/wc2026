/**
 * Unit test for lib/tournamentStats.ts using mocked live data.
 *
 * Verifies Mexico 2–0 South Africa (FINISHED) produces:
 *   matchesPlayed = 1
 *   totalGoals = 2
 *   averageGoalsPerMatch = 2.0
 *   biggestWin = Mexico 2–0 South Africa (margin 2)
 *   highestScoringMatch = Mexico 2–0 South Africa (totalGoals 2)
 *   cleanSheets = 1 (Mexico kept a clean sheet)
 *
 * Usage:
 *   npx tsx scripts/test-tournament-stats.ts
 */

import { computeTournamentStats } from "../lib/tournamentStats";
import type { LiveMatchData } from "../lib/liveMatchData";

const MEXICO_PROVIDER_ID = 537327;

const mockData: ReadonlyMap<number, LiveMatchData> = new Map([
  [
    MEXICO_PROVIDER_ID,
    {
      provider: "football-data.org",
      providerMatchId: MEXICO_PROVIDER_ID,
      status: "FINISHED",
      homeScore: 2,
      awayScore: 0,
      winner: "HOME_TEAM",
      lastSyncedAt: new Date().toISOString(),
    },
  ],
]);

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

console.log("=== Tournament stats test ===\n");

const stats = computeTournamentStats(mockData);

assert(stats.matchesPlayed === 1,               "matchesPlayed = 1");
assert(stats.totalGoals === 2,                  "totalGoals = 2");
assert(stats.averageGoalsPerMatch === 2,         "averageGoalsPerMatch = 2.0");
assert(stats.cleanSheets === 1,                 "cleanSheets = 1 (Mexico conceded 0)");

assert(stats.highestScoringMatch !== null,       "highestScoringMatch not null");
assert(stats.highestScoringMatch?.homeKey === "mexico",     "highestScoringMatch.homeKey = mexico");
assert(stats.highestScoringMatch?.awayKey === "southAfrica","highestScoringMatch.awayKey = southAfrica");
assert(stats.highestScoringMatch?.homeScore === 2,          "highestScoringMatch.homeScore = 2");
assert(stats.highestScoringMatch?.awayScore === 0,          "highestScoringMatch.awayScore = 0");
assert(stats.highestScoringMatch?.totalGoals === 2,         "highestScoringMatch.totalGoals = 2");

assert(stats.biggestWin !== null,                "biggestWin not null");
assert(stats.biggestWin?.homeKey === "mexico",   "biggestWin.homeKey = mexico");
assert(stats.biggestWin?.margin === 2,           "biggestWin.margin = 2");

assert(stats.lastSyncedAt !== null,              "lastSyncedAt populated");

// Empty map: all zeros
const empty = computeTournamentStats(new Map());
assert(empty.matchesPlayed === 0,                "empty: matchesPlayed = 0");
assert(empty.totalGoals === 0,                   "empty: totalGoals = 0");
assert(empty.averageGoalsPerMatch === 0,          "empty: averageGoalsPerMatch = 0");
assert(empty.highestScoringMatch === null,        "empty: highestScoringMatch = null");
assert(empty.biggestWin === null,                 "empty: biggestWin = null");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
