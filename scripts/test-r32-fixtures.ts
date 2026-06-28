/**
 * Gate test: R32 fixture resolution.
 *
 * Verifies that:
 * - RESOLVED_PARTICIPANTS contains exactly 16 entries (R32 only, no R16+)
 * - All 16 R32 fixtures resolve to the correct teams
 * - Each resolved team key and code is correct
 * - All 16 expected pairings match the research data
 * - The bestThird slot pool for each match contains the group of the actual
 *   third-place team assigned to it
 * - The resolved team keys exist in the group-stage matches (canonical keys)
 *
 * Usage:
 *   npx tsx scripts/test-r32-fixtures.ts
 */

import assert from "assert";
import { RESOLVED_PARTICIPANTS, resolvedHome, resolvedAway } from "../lib/resolvedParticipants";
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
    assert.strictEqual(actual, expected, msg);
    console.log(`  PASS  ${msg}`);
    passed++;
  } catch {
    console.error(`  FAIL  ${msg} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
    failed++;
  }
}

console.log("=== R32 Fixture Gate ===\n");

// ── 1. Exactly 16 entries (R32 only, no R16+) ─────────────────────────────
const entryCount = Object.keys(RESOLVED_PARTICIPANTS).length;
checkEqual(entryCount, 16, "RESOLVED_PARTICIPANTS has exactly 16 entries");

const matchNumbers = Object.keys(RESOLVED_PARTICIPANTS).map(Number);
const allR32 = matchNumbers.every((n) => n >= 73 && n <= 88);
check(allR32, "all match numbers are in the R32 range 73-88");

check(
  !(89 in RESOLVED_PARTICIPANTS),
  "RESOLVED_PARTICIPANTS has no entry for matchNumber 89 (R16 not yet resolved)",
);

// ── 2. Expected pairings ───────────────────────────────────────────────────
const expected: Array<{ matchNumber: number; homeKey: string; homeCode: string; awayKey: string; awayCode: string }> = [
  { matchNumber: 73, homeKey: "southAfrica",  homeCode: "za",     awayKey: "canada",       awayCode: "ca"     },
  { matchNumber: 74, homeKey: "germany",      homeCode: "de",     awayKey: "paraguay",     awayCode: "py"     },
  { matchNumber: 75, homeKey: "netherlands",  homeCode: "nl",     awayKey: "morocco",      awayCode: "ma"     },
  { matchNumber: 76, homeKey: "brazil",       homeCode: "br",     awayKey: "japan",        awayCode: "jp"     },
  { matchNumber: 77, homeKey: "france",       homeCode: "fr",     awayKey: "sweden",       awayCode: "se"     },
  { matchNumber: 78, homeKey: "ivoryCoast",   homeCode: "ci",     awayKey: "norway",       awayCode: "no"     },
  { matchNumber: 79, homeKey: "mexico",       homeCode: "mx",     awayKey: "ecuador",      awayCode: "ec"     },
  { matchNumber: 80, homeKey: "england",      homeCode: "gb-eng", awayKey: "drCongo",      awayCode: "cd"     },
  { matchNumber: 81, homeKey: "unitedStates", homeCode: "us",     awayKey: "bosnia",       awayCode: "ba"     },
  { matchNumber: 82, homeKey: "belgium",      homeCode: "be",     awayKey: "senegal",      awayCode: "sn"     },
  { matchNumber: 83, homeKey: "portugal",     homeCode: "pt",     awayKey: "croatia",      awayCode: "hr"     },
  { matchNumber: 84, homeKey: "spain",        homeCode: "es",     awayKey: "austria",      awayCode: "at"     },
  { matchNumber: 85, homeKey: "switzerland",  homeCode: "ch",     awayKey: "algeria",      awayCode: "dz"     },
  { matchNumber: 86, homeKey: "argentina",    homeCode: "ar",     awayKey: "capeVerde",    awayCode: "cv"     },
  { matchNumber: 87, homeKey: "colombia",     homeCode: "co",     awayKey: "ghana",        awayCode: "gh"     },
  { matchNumber: 88, homeKey: "australia",    homeCode: "au",     awayKey: "egypt",        awayCode: "eg"     },
];

for (const exp of expected) {
  const entry = RESOLVED_PARTICIPANTS[exp.matchNumber];
  check(entry !== undefined, `M${exp.matchNumber}: entry exists in RESOLVED_PARTICIPANTS`);
  if (!entry) continue;
  checkEqual(entry.home.teamKey,  exp.homeKey,  `M${exp.matchNumber}: home teamKey is "${exp.homeKey}"`);
  checkEqual(entry.home.teamCode, exp.homeCode, `M${exp.matchNumber}: home teamCode is "${exp.homeCode}"`);
  checkEqual(entry.away.teamKey,  exp.awayKey,  `M${exp.matchNumber}: away teamKey is "${exp.awayKey}"`);
  checkEqual(entry.away.teamCode, exp.awayCode, `M${exp.matchNumber}: away teamCode is "${exp.awayCode}"`);
}

// ── 3. resolvedHome / resolvedAway helpers ─────────────────────────────────
checkEqual(resolvedHome(73)?.teamKey,  "southAfrica", `resolvedHome(73)?.teamKey === "southAfrica"`);
checkEqual(resolvedAway(73)?.teamKey,  "canada",      `resolvedAway(73)?.teamKey === "canada"`);
check(resolvedHome(89) === null, "resolvedHome(89) === null (R16 not yet resolved)");
check(resolvedAway(89) === null, "resolvedAway(89) === null (R16 not yet resolved)");

// ── 4. bestThird group pool contains the assigned third-place team's group ──
// The 8 best-third qualified teams and which group they came from.
// These are verified against the official FIFA group stage results (completed 2026-06-27).
const thirdTeamGroup: Record<string, string> = {
  sweden:       "F",
  ecuador:      "E",
  bosnia:       "B",
  paraguay:     "D",
  drCongo:      "K",
  ghana:        "L",
  algeria:      "J",
  senegal:      "I",
};

const r32KnockoutMatches = MATCHES.filter(
  (m) => "stage" in m && m.stage === "R32"
) as Array<{
  stage: string;
  matchNumber: number;
  homeSlot: { kind: string; group?: string; groups?: string[] };
  awaySlot: { kind: string; group?: string; groups?: string[] };
  [k: string]: unknown;
}>;

for (const [matchNumStr, entry] of Object.entries(RESOLVED_PARTICIPANTS)) {
  const matchNumber = Number(matchNumStr);
  const km = r32KnockoutMatches.find((m) => m.matchNumber === matchNumber);
  if (!km) {
    failed++;
    console.error(`  FAIL  M${matchNumber}: not found in canonical R32 matches`);
    continue;
  }

  for (const side of ["home", "away"] as const) {
    const slot = side === "home" ? km.homeSlot : km.awaySlot;
    const teamKey = entry[side].teamKey;
    const fromGroup = thirdTeamGroup[teamKey];

    if (slot.kind === "bestThird") {
      if (!fromGroup) continue; // not a third-place qualifier, skip
      const pool = slot.groups ?? [];
      check(
        pool.includes(fromGroup),
        `M${matchNumber}: bestThird ${side} pool ${JSON.stringify(pool)} includes group "${fromGroup}" for ${teamKey}`,
      );
    }
  }
}

// ── 5. Resolved team keys exist in group-stage matches ─────────────────────
const groupMatchTeamKeys = new Set<string>();
for (const m of MATCHES) {
  if (!("stage" in m) || !(m as { stage?: string }).stage) {
    groupMatchTeamKeys.add((m as { homeKey: string }).homeKey);
    groupMatchTeamKeys.add((m as { awayKey: string }).awayKey);
  }
}

for (const [matchNumStr, entry] of Object.entries(RESOLVED_PARTICIPANTS)) {
  const matchNumber = Number(matchNumStr);
  check(
    groupMatchTeamKeys.has(entry.home.teamKey),
    `M${matchNumber}: home teamKey "${entry.home.teamKey}" is a valid canonical group-stage key`,
  );
  check(
    groupMatchTeamKeys.has(entry.away.teamKey),
    `M${matchNumber}: away teamKey "${entry.away.teamKey}" is a valid canonical group-stage key`,
  );
}

// ── Report ─────────────────────────────────────────────────────────────────
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
