/**
 * Unit test for lib/groupStandings.ts using mocked live data.
 *
 * Verifies Mexico 2–0 South Africa (FINISHED) produces:
 *   Mexico    Pld 1 · W 1 · GF 2 · GA 0 · GD +2 · Pts 3
 *   S. Africa Pld 1 · W 0 · GF 0 · GA 2 · GD -2 · Pts 0
 *   Others    Pld 0 · Pts 0
 *
 * Usage:
 *   npx tsx scripts/test-group-standings.ts
 */

import { computeGroupStandings } from "../lib/groupStandings";
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

console.log("=== Group standings test ===\n");

const standings = computeGroupStandings(mockData);
const groupA = standings["A"];
if (!groupA) {
  console.error("FATAL: Group A not found in standings output");
  process.exit(1);
}

const mexico     = groupA.find((r) => r.teamKey === "mexico");
const southAfrica = groupA.find((r) => r.teamKey === "southAfrica");
const southKorea = groupA.find((r) => r.teamKey === "southKorea");
const czechia    = groupA.find((r) => r.teamKey === "czechia");

console.log("Mexico:");
assert(mexico !== undefined,         "row exists");
assert(mexico!.played === 1,         "played = 1");
assert(mexico!.wins === 1,           "wins = 1");
assert(mexico!.draws === 0,          "draws = 0");
assert(mexico!.losses === 0,         "losses = 0");
assert(mexico!.goalsFor === 2,       "goalsFor = 2");
assert(mexico!.goalsAgainst === 0,   "goalsAgainst = 0");
assert(mexico!.goalDifference === 2, "goalDifference = +2");
assert(mexico!.points === 3,         "points = 3");

console.log("\nSouth Africa:");
assert(southAfrica !== undefined,          "row exists");
assert(southAfrica!.played === 1,          "played = 1");
assert(southAfrica!.wins === 0,            "wins = 0");
assert(southAfrica!.losses === 1,          "losses = 1");
assert(southAfrica!.goalsFor === 0,        "goalsFor = 0");
assert(southAfrica!.goalsAgainst === 2,    "goalsAgainst = 2");
assert(southAfrica!.goalDifference === -2, "goalDifference = -2");
assert(southAfrica!.points === 0,          "points = 0");

console.log("\nOther Group A teams (unplayed):");
assert(southKorea!.played === 0 && southKorea!.points === 0, "South Korea Pld 0 / Pts 0");
assert(czechia!.played === 0 && czechia!.points === 0,       "Czechia Pld 0 / Pts 0");

console.log("\nSort order:");
assert(groupA[0].teamKey === "mexico", "Mexico is 1st (3 pts)");

// Non-Group-A groups should all be zero
const groupB = standings["B"];
assert(groupB?.every((r) => r.played === 0 && r.points === 0) === true, "Group B all zeros");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
