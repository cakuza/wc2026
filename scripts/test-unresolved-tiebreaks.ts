import { computeGroupStandings, type StandingRow } from "../lib/groupStandings";
import { computeThirdPlaceRanking } from "../lib/thirdPlaceRanking";
import type { LiveMatchData } from "../lib/liveMatchData";
import { getThirdPlaceLegendCopy } from "../lib/thirdPlaceCopy";

let passed = 0;
let failed = 0;
function assert(condition: boolean, msg: string) {
  if (condition) { console.log(`  PASS  ${msg}`); passed++; }
  else { console.error(`  FAIL  ${msg}`); failed++; }
}

console.log("=== Unresolved tiebreaks test ===\n");

const liveData: ReadonlyMap<number, LiveMatchData> = new Map([
  [537333, {
    provider: "football-data.org",
    providerMatchId: 537333,
    status: "FINISHED",
    homeScore: 1,
    awayScore: 1,
    winner: "DRAW",
    lastSyncedAt: "2026-06-12T20:00:00.000Z",
    eventDataAvailable: false,
  }],
]);

const standings = computeGroupStandings(liveData);
const groupB = standings["B"];
const canada = groupB.find((row) => row.teamKey === "canada");
const bosnia = groupB.find((row) => row.teamKey === "bosnia");
assert(canada?.rankLabel === "1=" && bosnia?.rankLabel === "1=", "Canada and Bosnia share unresolved 1= rank");
assert(canada?.tieUnresolved === true && bosnia?.tieUnresolved === true, "Canada-Bosnia tie is explicitly unresolved");

function row(teamKey: string, points: number, gd: number, gf: number): StandingRow {
  return { teamKey, played: 1, wins: 0, draws: 0, losses: 0, goalsFor: gf, goalsAgainst: gf - gd, goalDifference: gd, points };
}

const thirdStandings: Record<string, StandingRow[]> = {};
"ABCDEFGHIJKL".split("").forEach((group, index) => {
  const tiedAtCut = index >= 6 && index <= 8;
  thirdStandings[group] = [
    row(`${group}1`, 9, 9, 9),
    row(`${group}2`, 6, 6, 6),
    tiedAtCut ? row(`${group}3`, 3, 0, 1) : row(`${group}3`, 12 - index, 4 - index, 2),
  ];
});

const thirds = computeThirdPlaceRanking(thirdStandings);
const boundaryRows = thirds.filter((row) => row.status === "boundary");
assert(boundaryRows.length >= 3, "third-place cut-line tie is marked as boundary for the whole tied block");
assert(boundaryRows.every((row) => row.rankLabel?.endsWith("=")), "boundary rows use equal rank labels");

const tiedLegend = getThirdPlaceLegendCopy(thirds);
assert(tiedLegend.cutLineTied, "legend detects unresolved cut-line tie");
assert(!tiedLegend.primary.includes("Top 8 third-placed teams"), "no definitive Top 8 statement when cut line is tied");
assert(!tiedLegend.secondary.includes("Ranks 9"), "no definitive Ranks 9-12 statement when cut line is tied");
assert(tiedLegend.primary.includes("provisional"), "tied legend uses provisional wording");

const resolvedStandings: Record<string, StandingRow[]> = {};
"ABCDEFGHIJKL".split("").forEach((group, index) => {
  resolvedStandings[group] = [
    row(`${group}1`, 9, 9, 9),
    row(`${group}2`, 6, 6, 6),
    row(`${group}3`, 12 - index, 12 - index, 12 - index),
  ];
});
const resolvedLegend = getThirdPlaceLegendCopy(computeThirdPlaceRanking(resolvedStandings));
assert(!resolvedLegend.cutLineTied, "legend detects resolved cut line");
assert(resolvedLegend.primary.includes("Top 8 third-placed teams"), "definitive cut-line wording is allowed when resolved");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
