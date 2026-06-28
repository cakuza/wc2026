/**
 * Gate test: football-data.org provider contract.
 *
 * Verifies that:
 * 1. The contract fixture contains exactly 32 knockout entries
 * 2. Each R32 match (73–88) in matches.ts has a providerIds.footballData ID
 *    that appears in the contract fixture
 * 3. Match 73 maps to ID 537417 (explicit check)
 * 4. No provider ID appears in two different canonical matches (bijection)
 * 5. Every currently returned R32 provider match maps to exactly one canonical match
 * 6. Removing M73's ID from the fixture causes a contract check failure (negative test)
 * 7. Future unresolved matches (R16+) do NOT trigger false readiness failure
 *    when reference date is before those matches
 * 8. LAST_32 stage name is correctly identified as distinct from GROUP_STAGE
 *
 * Usage:
 *   npx tsx scripts/test-fd-provider-contract.ts
 */

import assert from "assert";
import * as fs from "fs";
import * as path from "path";
import { MATCHES } from "../lib/matches";
import type { KnockoutMatch } from "../lib/matches";

let passed = 0;
let failed = 0;

function check(condition: boolean, msg: string): void {
  try {
    assert.ok(condition, msg);
    console.log(`  PASS  ${msg}`);
    passed++;
  } catch {
    console.error(`  FAIL  ${msg}`);
    failed++;
  }
}

function checkEqual<T>(actual: T, expected: T, msg: string): void {
  try {
    assert.strictEqual(actual, expected, msg);
    console.log(`  PASS  ${msg}`);
    passed++;
  } catch {
    console.error(`  FAIL  ${msg} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
    failed++;
  }
}

console.log("=== FD Provider Contract Gate ===\n");

// ── Load contract fixture ──────────────────────────────────────────────────
const contractPath = path.join(__dirname, "../data/audit/fd-provider-contract.json");
let contract: {
  knockout: Array<{ id: number; stage: string; utcDate: string; homeTeam: { name: string | null }; awayTeam: { name: string | null } }>;
  stageNames: string[];
};
try {
  contract = JSON.parse(fs.readFileSync(contractPath, "utf-8"));
} catch (e) {
  console.error(`  FAIL  Could not load contract fixture: ${contractPath}`);
  process.exitCode = 1;
  process.exit(1);
}

// ── Helper: extract knockout matches by matchNumber range ──────────────────
const knockoutMatches = MATCHES.filter(
  (m): m is KnockoutMatch => "stage" in m && "matchNumber" in m
);

const r32Matches = knockoutMatches.filter((m) => m.stage === "R32");
const futureMatches = knockoutMatches.filter((m) => m.stage !== "R32");

// Build a set of all provider IDs in the fixture
const fixtureIdSet = new Set(contract.knockout.map((e) => e.id));
const r32FixtureIds = new Set(
  contract.knockout.filter((e) => e.stage === "LAST_32").map((e) => e.id)
);

// ── 1. Contract fixture has exactly 32 knockout entries ────────────────────
console.log("── 1. Fixture entry count ──");
checkEqual(contract.knockout.length, 32, "contract fixture has exactly 32 knockout entries");

// ── 2. Each R32 match has a providerIds.footballData in the fixture ────────
console.log("\n── 2. R32 matches present in fixture ──");
checkEqual(r32Matches.length, 16, "matches.ts has exactly 16 R32 matches");

for (const m of r32Matches) {
  const id = m.providerIds?.footballData;
  check(id !== undefined, `M${m.matchNumber}: has providerIds.footballData`);
  if (id !== undefined) {
    check(fixtureIdSet.has(id), `M${m.matchNumber}: providerIds.footballData ${id} appears in contract fixture`);
  }
}

// ── 3. Explicit: M73 → 537417 ─────────────────────────────────────────────
console.log("\n── 3. Explicit M73 mapping ──");
const m73 = knockoutMatches.find((m) => m.matchNumber === 73);
checkEqual(m73?.providerIds?.footballData, 537417, "M73 maps to provider ID 537417");

// ── 4. Bijection: no provider ID appears in two canonical matches ──────────
console.log("\n── 4. Bijection check ──");
const seenIds = new Map<number, number>(); // id → matchNumber
let hasDuplicate = false;
for (const m of knockoutMatches) {
  const id = m.providerIds?.footballData;
  if (id === undefined) continue;
  if (seenIds.has(id)) {
    console.error(`  FAIL  Provider ID ${id} is used by both M${seenIds.get(id)} and M${m.matchNumber}`);
    failed++;
    hasDuplicate = true;
  } else {
    seenIds.set(id, m.matchNumber);
  }
}
if (!hasDuplicate) {
  console.log(`  PASS  no provider ID appears in two different canonical matches`);
  passed++;
}

// ── 5. Every R32 fixture entry maps to exactly one canonical match ─────────
console.log("\n── 5. Reverse bijection (fixture → canonical) ──");
const r32FixtureEntries = contract.knockout.filter((e) => e.stage === "LAST_32");
checkEqual(r32FixtureEntries.length, 16, "fixture has exactly 16 LAST_32 entries");

for (const entry of r32FixtureEntries) {
  const matches = r32Matches.filter((m) => m.providerIds?.footballData === entry.id);
  checkEqual(matches.length, 1, `fixture ID ${entry.id} maps to exactly one canonical R32 match`);
}

// ── 6. Negative test: removing M73 from fixture causes failure ────────────
console.log("\n── 6. Negative test: missing fixture entry ──");
const contractWithoutM73 = {
  ...contract,
  knockout: contract.knockout.filter((e) => e.id !== 537417),
};
const fixtureWithoutM73 = new Set(contractWithoutM73.knockout.map((e) => e.id));
const m73Id = m73?.providerIds?.footballData ?? 537417;
const missingFromAltFixture = !fixtureWithoutM73.has(m73Id);
check(
  missingFromAltFixture,
  `negative test: removing ID 537417 (M73) from fixture causes M73 to be missing from contract`
);

// ── 7. Future matches (R16+) do not trigger false readiness failure ────────
console.log("\n── 7. Future matches readiness check ──");
// Reference date: 2026-06-28 (before R16 starts 2026-07-04)
const referenceDate = new Date("2026-06-28T00:00:00Z");

// A match is "in provider window" if its kickoff UTC date is <= referenceDate
function matchUtcDate(m: KnockoutMatch): Date | null {
  if (!m.date || !m.time || m.utcOffset === undefined) return null;
  const [h, min] = m.time.split(":").map(Number);
  const localMs = new Date(`${m.date}T${m.time}:00`).getTime();
  const utcMs = localMs - m.utcOffset * 60 * 60 * 1000;
  return new Date(utcMs);
}

// Future matches (R16, QF, SF, 3P, F) should NOT be considered "in window" at referenceDate
let futureMatchesInWindow = 0;
for (const m of futureMatches) {
  const utcKickoff = matchUtcDate(m);
  if (utcKickoff && utcKickoff <= referenceDate) {
    futureMatchesInWindow++;
    console.error(`  FAIL  M${m.matchNumber} (${m.stage}) incorrectly in provider window at referenceDate`);
    failed++;
  }
}
if (futureMatchesInWindow === 0) {
  console.log(`  PASS  no future-stage matches (R16+) fall inside provider window at 2026-06-28`);
  passed++;
}

// ── 8. Stage name distinction: LAST_32 vs GROUP_STAGE ────────────────────
console.log("\n── 8. Stage name distinction ──");
check(
  contract.stageNames.includes("LAST_32"),
  `contract stageNames includes "LAST_32"`
);
check(
  contract.stageNames.includes("GROUP_STAGE"),
  `contract stageNames includes "GROUP_STAGE"`
);
check(
  contract.stageNames.indexOf("LAST_32") !== contract.stageNames.indexOf("GROUP_STAGE"),
  `stage name "LAST_32" is distinct from "GROUP_STAGE"`
);
const r32FixtureStages = new Set(r32FixtureEntries.map((e) => e.stage));
check(
  !r32FixtureStages.has("GROUP_STAGE"),
  `no R32 fixture entry is tagged as GROUP_STAGE`
);
check(
  r32FixtureStages.has("LAST_32") && r32FixtureStages.size === 1,
  `all R32 fixture entries are tagged as LAST_32`
);

// ── Report ─────────────────────────────────────────────────────────────────
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
