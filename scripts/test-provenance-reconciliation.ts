/**
 * Gate test: knockout-provenance.json reconciliation.
 *
 * Verifies:
 * - Exactly 32 knockout inventory entries (matchNumber 73–104)
 * - Match numbers 73–104 appear exactly once each
 * - Every entry has a non-empty primarySource or fifaSource field
 * - Stage totals: 16 R32, 8 R16, 4 QF, 2 SF, 1 3P, 1 Final
 * - Dates/venues match canonical data from lib/matches.ts
 * - R16 Match 89 homeSlot = winnerOf(74), awaySlot = winnerOf(77)
 * - R16 Match 90 homeSlot = winnerOf(73), awaySlot = winnerOf(75)
 * - providerContract field exists with r32MatchesFound=16
 *
 * Usage:
 *   npx tsx scripts/test-provenance-reconciliation.ts
 */

import assert from "assert";
import * as fs from "fs";
import * as path from "path";
import { MATCHES } from "../lib/matches";

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
    assert.strictEqual(actual, expected, `${msg} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
    console.log(`  PASS  ${msg}`);
    passed++;
  } catch (e) {
    console.error(`  FAIL  ${(e as Error).message}`);
    failed++;
  }
}

console.log("=== Knockout Provenance Reconciliation Gate ===\n");

// ── Load provenance JSON ───────────────────────────────────────────────────
const provenancePath = path.join(process.cwd(), "data", "audit", "knockout-provenance.json");
let provenance: {
  providerContract?: {
    r32MatchesFound?: number;
    [key: string]: unknown;
  };
  knockoutMatches?: Array<{
    matchNumber: number;
    stage: string;
    date: string;
    venue: string;
    primarySource?: string;
    fifaSource?: string;
    homeParticipant?: { kind: string; matchNumber?: number };
    awayParticipant?: { kind: string; matchNumber?: number };
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
};

try {
  const raw = fs.readFileSync(provenancePath, "utf-8");
  provenance = JSON.parse(raw);
  console.log(`  INFO  Loaded ${provenancePath}`);
} catch (e) {
  console.error(`  FAIL  Cannot load provenance JSON: ${(e as Error).message}`);
  process.exit(1);
}

const matches = provenance.knockoutMatches ?? [];

// ── 1. Exactly 32 entries ──────────────────────────────────────────────────
console.log("\n── 1. Entry count ──");
checkEqual(matches.length, 32, "knockoutMatches has exactly 32 entries");

// ── 2. Match numbers 73–104 each exactly once ──────────────────────────────
console.log("\n── 2. Match numbers 73–104 each exactly once ──");
const expectedNumbers = new Set<number>();
for (let n = 73; n <= 104; n++) expectedNumbers.add(n);

const seenNumbers = new Set<number>();
let hasDuplicate = false;
for (const m of matches) {
  if (seenNumbers.has(m.matchNumber)) {
    console.error(`  FAIL  matchNumber ${m.matchNumber} appears more than once`);
    failed++;
    hasDuplicate = true;
  }
  seenNumbers.add(m.matchNumber);
}
if (!hasDuplicate) {
  console.log(`  PASS  no duplicate match numbers`);
  passed++;
}

const missingNumbers = [...expectedNumbers].filter((n) => !seenNumbers.has(n));
check(missingNumbers.length === 0, `all match numbers 73–104 present${missingNumbers.length > 0 ? ` (missing: ${missingNumbers.join(", ")})` : ""}`);

const extraNumbers = [...seenNumbers].filter((n) => !expectedNumbers.has(n));
check(extraNumbers.length === 0, `no extra match numbers outside 73–104${extraNumbers.length > 0 ? ` (extra: ${extraNumbers.join(", ")})` : ""}`);

// ── 3. Every entry has primarySource or fifaSource (non-empty) ─────────────
console.log("\n── 3. primarySource or fifaSource present on every entry ──");
let sourceMissing = 0;
for (const m of matches) {
  const ps = m.primarySource;
  const fs2 = m.fifaSource;
  const hasSource = (typeof ps === "string" && ps.trim().length > 0) ||
                    (typeof fs2 === "string" && fs2.trim().length > 0);
  if (!hasSource) {
    console.error(`  FAIL  M${m.matchNumber}: missing non-empty primarySource or fifaSource`);
    failed++;
    sourceMissing++;
  }
}
if (sourceMissing === 0) {
  console.log(`  PASS  all 32 entries have a non-empty primarySource or fifaSource`);
  passed++;
}

// ── 4. Stage totals ────────────────────────────────────────────────────────
console.log("\n── 4. Stage totals ──");
const stageCounts: Record<string, number> = {};
for (const m of matches) {
  stageCounts[m.stage] = (stageCounts[m.stage] ?? 0) + 1;
}
checkEqual(stageCounts["R32"] ?? 0, 16, "R32 stage count is 16");
checkEqual(stageCounts["R16"] ?? 0, 8,  "R16 stage count is 8");
checkEqual(stageCounts["QF"]  ?? 0, 4,  "QF stage count is 4");
checkEqual(stageCounts["SF"]  ?? 0, 2,  "SF stage count is 2");
checkEqual(stageCounts["3P"]  ?? 0, 1,  "3P stage count is 1");
checkEqual(stageCounts["F"]   ?? 0, 1,  "Final (F) stage count is 1");

// ── 5. Dates and venues match lib/matches.ts ───────────────────────────────
console.log("\n── 5. Dates and venues match lib/matches.ts ──");
type KnockoutMatch = {
  stage: string;
  matchNumber: number;
  date: string;
  venue?: string;
};
const canonicalMap = new Map<number, KnockoutMatch>();
for (const m of MATCHES) {
  if ("matchNumber" in m && "stage" in m) {
    canonicalMap.set((m as KnockoutMatch).matchNumber, m as KnockoutMatch);
  }
}

let dateVenueMismatches = 0;
for (const m of matches) {
  const canonical = canonicalMap.get(m.matchNumber);
  if (!canonical) {
    console.error(`  FAIL  M${m.matchNumber}: not found in lib/matches.ts`);
    failed++;
    dateVenueMismatches++;
    continue;
  }
  if (canonical.date !== m.date) {
    console.error(`  FAIL  M${m.matchNumber}: date mismatch — provenance="${m.date}", canonical="${canonical.date}"`);
    failed++;
    dateVenueMismatches++;
  }
  if (canonical.venue && m.venue && canonical.venue !== m.venue) {
    console.error(`  FAIL  M${m.matchNumber}: venue mismatch — provenance="${m.venue}", canonical="${canonical.venue}"`);
    failed++;
    dateVenueMismatches++;
  }
}
if (dateVenueMismatches === 0) {
  console.log(`  PASS  all 32 entries match lib/matches.ts dates and venues`);
  passed++;
}

// ── 6. R16 M89 = winnerOf(74) vs winnerOf(77) ─────────────────────────────
console.log("\n── 6. R16 slot dependency correctness ──");
const m89 = matches.find((m) => m.matchNumber === 89);
check(m89 !== undefined, "M89 entry exists");
if (m89) {
  checkEqual(m89.stage, "R16", "M89 stage is R16");
  checkEqual(m89.homeParticipant?.kind, "winnerOf", "M89 homeParticipant.kind is winnerOf");
  checkEqual(m89.homeParticipant?.matchNumber, 74, "M89 homeParticipant.matchNumber is 74");
  checkEqual(m89.awayParticipant?.kind, "winnerOf", "M89 awayParticipant.kind is winnerOf");
  checkEqual(m89.awayParticipant?.matchNumber, 77, "M89 awayParticipant.matchNumber is 77");
}

const m90 = matches.find((m) => m.matchNumber === 90);
check(m90 !== undefined, "M90 entry exists");
if (m90) {
  checkEqual(m90.stage, "R16", "M90 stage is R16");
  checkEqual(m90.homeParticipant?.kind, "winnerOf", "M90 homeParticipant.kind is winnerOf");
  checkEqual(m90.homeParticipant?.matchNumber, 73, "M90 homeParticipant.matchNumber is 73");
  checkEqual(m90.awayParticipant?.kind, "winnerOf", "M90 awayParticipant.kind is winnerOf");
  checkEqual(m90.awayParticipant?.matchNumber, 75, "M90 awayParticipant.matchNumber is 75");
}

// ── 7. providerContract.r32MatchesFound = 16 ──────────────────────────────
console.log("\n── 7. providerContract ──");
check(provenance.providerContract !== undefined, "providerContract field exists");
checkEqual(provenance.providerContract?.r32MatchesFound, 16, "providerContract.r32MatchesFound is 16");

// ── Report ─────────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(50)}`);
console.log(`${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
