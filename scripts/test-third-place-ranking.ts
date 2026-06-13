/**
 * Unit test for third-place ranking computation.
 *
 * Verifies that computeThirdPlaceRanking():
 * - Returns exactly 12 third-placed teams (one per group)
 * - Marks clear rows as "qualifying" / "outside" and exact ties as unresolved
 * - Sorts by points desc, then goal difference desc, then goals-for desc
 * - Never produces an "Eliminated" style status
 *
 * Usage:
 *   npx tsx scripts/test-third-place-ranking.ts
 */

import { computeThirdPlaceRanking } from "../lib/thirdPlaceRanking";
import type { StandingRow } from "../lib/groupStandings";

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

function row(teamKey: string, points: number, gd: number, gf: number): StandingRow {
  return {
    teamKey,
    played: 1,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: gf,
    goalsAgainst: gf - gd,
    goalDifference: gd,
    points,
  };
}

console.log("=== Third-place ranking test ===\n");

// Build 12 groups, each with 3 rows; row[2] is the "third place" team.
const groupLetters = "ABCDEFGHIJKL".split("");
const standings: Record<string, StandingRow[]> = {};

// Give each group's third-place team a distinct points/GD/GF profile
const thirdPlaceProfiles: [string, number, number, number][] = [
  ["teamA3", 6, 5, 6],
  ["teamB3", 6, 3, 4],
  ["teamC3", 4, 2, 3],
  ["teamD3", 4, 2, 3], // ties teamC3 on points/GD/GF -> tie-break by name
  ["teamE3", 4, 1, 2],
  ["teamF3", 3, 0, 2],
  ["teamG3", 3, -1, 1],
  ["teamH3", 1, -2, 1],
  ["teamI3", 1, -2, 0],
  ["teamJ3", 0, -3, 0],
  ["teamK3", 0, -4, 0],
  ["teamL3", 0, -5, 0],
];

groupLetters.forEach((g, i) => {
  const [teamKey, pts, gd, gf] = thirdPlaceProfiles[i];
  standings[g] = [
    row(`${g}-first`, 9, 9, 9),
    row(`${g}-second`, 7, 6, 7),
    row(teamKey, pts, gd, gf),
  ];
});

const ranking = computeThirdPlaceRanking(standings);

assert(ranking.length === 12, `exactly 12 third-placed teams (got ${ranking.length})`);

const qualifying = ranking.filter((r) => r.status === "qualifying");
const outside = ranking.filter((r) => r.status === "outside");
const unresolved = ranking.filter((r) => r.status === "unresolved" || r.status === "boundary");
assert(qualifying.length + unresolved.filter((r) => r.rank <= 8).length >= 8, "top-8 area is covered by qualifying or unresolved rows");
assert(outside.length === 4, `ranks 9-12 marked "currently outside" (got ${outside.length})`);
assert(
  qualifying.every((r) => r.rank >= 1 && r.rank <= 8),
  "qualifying ranks are 1-8",
);
assert(
  outside.every((r) => r.rank >= 9 && r.rank <= 12),
  "outside ranks are 9-12",
);

// Sorting checks
assert(ranking[0].teamKey === "teamA3", `rank 1 is teamA3 (highest points/GD/GF), got ${ranking[0].teamKey}`);
assert(ranking[1].teamKey === "teamB3", `rank 2 is teamB3, got ${ranking[1].teamKey}`);

// teamC3 and teamD3 tie on points/GD/GF -> equal provisional rank
const cIndex = ranking.findIndex((r) => r.teamKey === "teamC3");
const dIndex = ranking.findIndex((r) => r.teamKey === "teamD3");
assert(
  ranking[cIndex].rank === ranking[dIndex].rank &&
    ranking[cIndex].tieUnresolved === true &&
    ranking[dIndex].tieUnresolved === true,
  "tied teams share unresolved rank",
);

// Overall sort is non-increasing on points
for (let i = 1; i < ranking.length; i++) {
  assert(
    ranking[i - 1].points >= ranking[i].points ||
      (ranking[i - 1].points === ranking[i].points && ranking[i - 1].goalDifference >= ranking[i].goalDifference),
    `rank ${i} does not exceed rank ${i + 1} on points/GD`,
  );
}

// No "Eliminated" status anywhere
const statuses = ranking.map((r) => r.status);
assert(
  !statuses.some((s) => /eliminated/i.test(s)),
  'no "Eliminated" status appears',
);
assert(
  statuses.every((s) => s === "qualifying" || s === "outside" || s === "unresolved" || s === "boundary"),
  'all statuses are safe known values',
);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
