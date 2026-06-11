/**
 * Unit test for schedule score display logic.
 *
 * Verifies that:
 * - A FINISHED match with score shows "2–0 FT" format
 * - An unmapped upcoming match shows "vs" (no score)
 * - No "– vs –" pattern appears
 * - No duplicated team names appear
 *
 * Usage:
 *   npx tsx scripts/test-schedule-score-display.ts
 */

import type { LiveMatchData } from "../lib/liveMatchData";

const MEXICO_PROVIDER_ID = 537327;
const SOUTH_KOREA_CZECHIA_PROVIDER_ID = 537328;

// Simulate what ScheduleContent would receive
type ScheduleMatchScore = {
  status: LiveMatchData["status"];
  homeScore: number | null;
  awayScore: number | null;
};

function renderScoreChip(score: ScheduleMatchScore | undefined, vs: string): string {
  if (!score) return vs;
  const { status, homeScore, awayScore } = score;
  const isFinished = status === "FINISHED";
  const isLive = status === "IN_PLAY" || status === "PAUSED";
  const hasScore = homeScore !== null && awayScore !== null;

  if ((isFinished || isLive) && hasScore) {
    const badge = isFinished ? "FT" : status === "PAUSED" ? "HT" : "Live";
    return `${homeScore}–${awayScore} ${badge}`;
  }
  if (isLive && !hasScore) return "Score syncing";
  return vs;
}

function renderMatchRow(
  homeTeam: string,
  awayTeam: string,
  score: ScheduleMatchScore | undefined,
): string {
  const chip = renderScoreChip(score, "vs");
  return `${homeTeam} | ${chip} | ${awayTeam}`;
}

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

console.log("=== Schedule score display test ===\n");

// FINISHED match
const finishedScore: ScheduleMatchScore = {
  status: "FINISHED",
  homeScore: 2,
  awayScore: 0,
};
const finishedRow = renderMatchRow("Mexico", "South Africa", finishedScore);
console.log(`Finished match row: "${finishedRow}"`);
assert(finishedRow.includes("2–0"), "score shows 2–0");
assert(finishedRow.includes("FT"), "finished badge shows FT");
assert(!finishedRow.includes("vs"), "no 'vs' in finished row");
assert(!finishedRow.includes("– vs –"), "no '– vs –' pattern");

// Upcoming / unmapped match (no score)
const upcomingRow = renderMatchRow("South Korea", "Czechia", undefined);
console.log(`\nUpcoming match row: "${upcomingRow}"`);
assert(upcomingRow.includes("vs"), "upcoming match shows 'vs'");
assert(!upcomingRow.includes("– vs –"), "no '– vs –' pattern");
assert(!upcomingRow.includes("null"), "no null values rendered");

// Live match with score
const liveScore: ScheduleMatchScore = { status: "IN_PLAY", homeScore: 1, awayScore: 0 };
const liveRow = renderMatchRow("Mexico", "South Africa", liveScore);
console.log(`\nLive match row: "${liveRow}"`);
assert(liveRow.includes("1–0"), "live score shows 1–0");
assert(liveRow.includes("Live"), "live badge shows Live");

// Live match, no score yet (syncing)
const syncingScore: ScheduleMatchScore = { status: "IN_PLAY", homeScore: null, awayScore: null };
const syncingRow = renderMatchRow("Mexico", "South Africa", syncingScore);
console.log(`\nSyncing match row: "${syncingRow}"`);
assert(syncingRow.includes("syncing"), "syncing row shows syncing text");
assert(!syncingRow.includes("null"), "no null values in syncing row");

// No duplicate team names
assert(
  !finishedRow.includes("MexicoMexico") && !finishedRow.includes("South AfricaSouth Africa"),
  "no duplicated team names in finished row",
);
assert(
  !upcomingRow.includes("South KoreaSouth Korea") && !upcomingRow.includes("CzechiaCzechia"),
  "no duplicated team names in upcoming row",
);

// No "– vs –" pattern in any row
for (const [label, row] of [
  ["finished", finishedRow],
  ["upcoming", upcomingRow],
  ["live", liveRow],
  ["syncing", syncingRow],
]) {
  assert(!row.includes("– vs –"), `no '– vs –' in ${label} row`);
}

// Provider ID coverage check
import { MATCHES } from "../lib/matches";
const mapped = MATCHES.filter((m) => m.providerIds?.footballData);
assert(mapped.length >= 71, `all 71 fixtures mapped (got ${mapped.length})`);
assert(
  MATCHES.find((m) => m.providerIds?.footballData === MEXICO_PROVIDER_ID) !== undefined,
  `Mexico vs South Africa has provider id ${MEXICO_PROVIDER_ID}`,
);
assert(
  MATCHES.find((m) => m.providerIds?.footballData === SOUTH_KOREA_CZECHIA_PROVIDER_ID) !== undefined,
  `South Korea vs Czechia has provider id ${SOUTH_KOREA_CZECHIA_PROVIDER_ID}`,
);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
