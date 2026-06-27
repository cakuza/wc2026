/**
 * Acceptance gate: Turkey 3-2 United States scorer identity integrity.
 *
 * MUST FAIL for any corrupted form:
 *   "Baris Alpr Ailmaz" / "Baris Alper Yilmaz" / "Ailmaz"
 *   "Kan Aihan" / "Aihan"
 *
 * MUST PASS with exact canonical roster:
 *   3'  Auston Trusty        (USA)
 *   10' Arda Güler           (Turkey)
 *   31' Barış Alper Yılmaz   (Turkey)
 *   49' Sebastian Berhalter  (USA)
 *   90+8' Kaan Ayhan         (Turkey)
 *
 * Usage:  npx tsx scripts/test-turkey-us-scorer-integrity.ts
 */

import { applyVerifiedGoalCorrections } from "../lib/verifiedMatchEventCorrections";
import type { GoalScorerEvent } from "../lib/worldcup26Provider";

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

const MATCH_ID = "turkey-vs-united-states-jun25";

// ── Section A: Corrupted forms must not survive ────────────────────────────

console.log("\nA) Corrupted forms must be absent from corrected output\n");

const corruptedInput: GoalScorerEvent[] = [
  { type: "GOAL", minute: 3,  teamName: "United States", playerName: "Auston Trusty",     provider: "worldcup26.ir", confidence: "high" },
  { type: "GOAL", minute: 10, teamName: "Turkey",        playerName: "Arda GÃ¼ler",       provider: "worldcup26.ir", confidence: "high" },
  { type: "GOAL", minute: 31, teamName: "Turkey",        playerName: "Baris Alpr Ailmaz", provider: "worldcup26.ir", confidence: "high" },
  { type: "GOAL", minute: 49, teamName: "United States", playerName: "Sebastian Berhalter",provider: "worldcup26.ir", confidence: "high" },
  { type: "GOAL", minute: 90, stoppageTime: 8, teamName: "Turkey", playerName: "Kan Aihan", provider: "worldcup26.ir", confidence: "high" },
];

const corrected = applyVerifiedGoalCorrections(MATCH_ID, corruptedInput);

const names = corrected.map((e) => e.playerName);

// Must not appear in any form
const forbidden = [
  "Baris Alpr Ailmaz",
  "Baris Alper Yilmaz",
  "Ailmaz",
  "Kan Aihan",
  "Aihan",
  "Arda GÃ¼ler",
  "Baris Alper Ailmaz",
];
for (const f of forbidden) {
  assert(
    !names.some((n) => n.toLowerCase().includes(f.toLowerCase())),
    `Corrupted form absent: "${f}"`,
  );
}

// ── Section B: Canonical roster must be present ────────────────────────────

console.log("\nB) Canonical names must be present\n");

const EXPECTED: { minute: number; stoppageTime?: number; name: string; team: string }[] = [
  { minute: 3,              name: "Auston Trusty",       team: "United States" },
  { minute: 10,             name: "Arda Güler",          team: "Turkey"        },
  { minute: 31,             name: "Barış Alper Yılmaz",  team: "Turkey"        },
  { minute: 49,             name: "Sebastian Berhalter", team: "United States" },
  { minute: 90, stoppageTime: 8, name: "Kaan Ayhan",    team: "Turkey"        },
];

assert(corrected.length === 5, `Exactly 5 scorer events (got ${corrected.length})`);

for (const exp of EXPECTED) {
  const event = corrected.find(
    (e) =>
      e.minute === exp.minute &&
      (exp.stoppageTime == null || e.stoppageTime === exp.stoppageTime),
  );
  assert(
    event?.playerName === exp.name,
    `${exp.minute}${exp.stoppageTime ? "+" + exp.stoppageTime : ""}': ${exp.name} (got "${event?.playerName ?? "not found"}")`,
  );
  assert(
    event?.teamName === exp.team,
    `${exp.minute}': team = ${exp.team} (got "${event?.teamName ?? "not found"}")`,
  );
}

// ── Section C: Score-consistency guard ────────────────────────────────────

console.log("\nC) Score-consistency (3 Turkey, 2 USA)\n");

const turkeyGoals = corrected.filter((e) => e.teamName === "Turkey" && !e.isOwnGoal);
const usaGoals    = corrected.filter((e) => e.teamName === "United States" && !e.isOwnGoal);

assert(turkeyGoals.length === 3, `Turkey scored 3 (got ${turkeyGoals.length})`);
assert(usaGoals.length === 2,    `USA scored 2 (got ${usaGoals.length})`);

// Chronological order
const minutes = corrected.map((e) => e.minute ?? 0);
const sorted  = [...minutes].sort((a, b) => a - b);
assert(
  JSON.stringify(minutes) === JSON.stringify(sorted),
  "Events are chronologically sorted",
);

// ── Section D: Mojibake fix integration ──────────────────────────────────

console.log("\nD) Mojibake fix integration (direct unit tests)\n");

// Import the alias lookup indirectly via the provider sanitizer
// We test the corrected output already covers Arda Güler (UTF-8 repaired)
assert(
  corrected.some((e) => e.playerName === "Arda Güler"),
  'Arda Güler present (ü is correct, not Ã¼)',
);

// ── Summary ───────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
