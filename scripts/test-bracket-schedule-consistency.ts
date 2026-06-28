import { ROUND_OF_32_MATCHES, ROUND_OF_16_MATCHES } from "../lib/knockoutBracket2026";
import { MATCHES } from "../lib/matches";
import assert from "assert";

let passed = 0;
let failed = 0;

function check(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  PASS  ${msg}`);
    passed++;
  } else {
    console.error(`  FAIL  ${msg}`);
    failed++;
  }
}

console.log("=== Bracket/Schedule Consistency ===\n");

// Build index of knockout matches keyed by matchNumber
const matchByNumber = new Map(
  MATCHES.filter((m): m is Extract<typeof m, { matchNumber: number }> => "matchNumber" in m).map(
    (m) => [m.matchNumber, m]
  )
);

// ── 1. All R32 match numbers exist in MATCHES ────────────────────────────────

for (const bracketMatch of ROUND_OF_32_MATCHES) {
  const scheduleMatch = matchByNumber.get(bracketMatch.matchNumber);
  check(
    scheduleMatch !== undefined,
    `R32 matchNumber ${bracketMatch.matchNumber} exists in MATCHES`
  );
}

// ── 2. R32 home/away slots are consistent with MATCHES homeSlot/awaySlot ─────

for (const bracketMatch of ROUND_OF_32_MATCHES) {
  const scheduleMatch = matchByNumber.get(bracketMatch.matchNumber);
  if (!scheduleMatch || !("homeSlot" in scheduleMatch)) continue;

  const homeSlot = scheduleMatch.homeSlot;
  const awaySlot = scheduleMatch.awaySlot;

  // Check home slot
  if (bracketMatch.home.kind === "group") {
    const expectedPlace = bracketMatch.home.place;
    const expectedGroup = bracketMatch.home.group;
    const homeMatches =
      homeSlot.kind === "groupSlot" &&
      homeSlot.place === expectedPlace &&
      homeSlot.group === expectedGroup;
    check(
      homeMatches,
      `R32 match ${bracketMatch.matchNumber} home: bracket(${expectedPlace}${expectedGroup}) matches schedule(${homeSlot.kind === "groupSlot" ? homeSlot.place + homeSlot.group : homeSlot.kind})`
    );
  } else if (bracketMatch.home.kind === "third") {
    const homeMatches = homeSlot.kind === "bestThird";
    check(
      homeMatches,
      `R32 match ${bracketMatch.matchNumber} home: bracket(third) matches schedule(${homeSlot.kind})`
    );
  }

  // Check away slot
  if (bracketMatch.away.kind === "group") {
    const expectedPlace = bracketMatch.away.place;
    const expectedGroup = bracketMatch.away.group;
    const awayMatches =
      awaySlot.kind === "groupSlot" &&
      awaySlot.place === expectedPlace &&
      awaySlot.group === expectedGroup;
    check(
      awayMatches,
      `R32 match ${bracketMatch.matchNumber} away: bracket(${expectedPlace}${expectedGroup}) matches schedule(${awaySlot.kind === "groupSlot" ? awaySlot.place + awaySlot.group : awaySlot.kind})`
    );
  } else if (bracketMatch.away.kind === "third") {
    const awayMatches = awaySlot.kind === "bestThird";
    check(
      awayMatches,
      `R32 match ${bracketMatch.matchNumber} away: bracket(third) matches schedule(${awaySlot.kind})`
    );
  }
}

// ── 3. All R16 match numbers exist in MATCHES ────────────────────────────────

for (const bracketMatch of ROUND_OF_16_MATCHES) {
  const scheduleMatch = matchByNumber.get(bracketMatch.matchNumber);
  check(
    scheduleMatch !== undefined,
    `R16 matchNumber ${bracketMatch.matchNumber} exists in MATCHES`
  );
}

// ── 4. R16 homeWinnerOf/awayWinnerOf consistent with MATCHES slots ───────────

for (const bracketMatch of ROUND_OF_16_MATCHES) {
  const scheduleMatch = matchByNumber.get(bracketMatch.matchNumber);
  if (!scheduleMatch || !("homeSlot" in scheduleMatch)) continue;

  const homeSlot = scheduleMatch.homeSlot;
  const awaySlot = scheduleMatch.awaySlot;

  const homeMatches =
    homeSlot.kind === "winnerOf" && homeSlot.matchNumber === bracketMatch.homeWinnerOf;
  check(
    homeMatches,
    `R16 match ${bracketMatch.matchNumber} homeWinnerOf: bracket(${bracketMatch.homeWinnerOf}) matches schedule(${homeSlot.kind === "winnerOf" ? homeSlot.matchNumber : homeSlot.kind})`
  );

  const awayMatches =
    awaySlot.kind === "winnerOf" && awaySlot.matchNumber === bracketMatch.awayWinnerOf;
  check(
    awayMatches,
    `R16 match ${bracketMatch.matchNumber} awayWinnerOf: bracket(${bracketMatch.awayWinnerOf}) matches schedule(${awaySlot.kind === "winnerOf" ? awaySlot.matchNumber : awaySlot.kind})`
  );
}

// ── 5. No phantom match numbers in bracket that are absent from MATCHES ───────

const allBracketMatchNumbers = [
  ...ROUND_OF_32_MATCHES.map((m) => m.matchNumber),
  ...ROUND_OF_16_MATCHES.map((m) => m.matchNumber),
];

for (const mn of allBracketMatchNumbers) {
  check(
    matchByNumber.has(mn),
    `No phantom: match ${mn} referenced in bracket exists in MATCHES`
  );
}

// Also check R16 winnerOf references are all real R32 match numbers
const r32MatchNumbers = new Set(ROUND_OF_32_MATCHES.map((m) => m.matchNumber));

for (const bracketMatch of ROUND_OF_16_MATCHES) {
  check(
    r32MatchNumbers.has(bracketMatch.homeWinnerOf),
    `R16 match ${bracketMatch.matchNumber} homeWinnerOf(${bracketMatch.homeWinnerOf}) refers to a real R32 match`
  );
  check(
    r32MatchNumbers.has(bracketMatch.awayWinnerOf),
    `R16 match ${bracketMatch.matchNumber} awayWinnerOf(${bracketMatch.awayWinnerOf}) refers to a real R32 match`
  );
}

// ── 6. Exact check: match 89 = W74 vs W77, match 90 = W73 vs W75 ─────────────

const match89 = ROUND_OF_16_MATCHES.find((m) => m.matchNumber === 89);
check(
  match89 !== undefined && match89.homeWinnerOf === 74 && match89.awayWinnerOf === 77,
  `match 89 = W74 vs W77 (got homeWinnerOf=${match89?.homeWinnerOf}, awayWinnerOf=${match89?.awayWinnerOf})`
);

const match90 = ROUND_OF_16_MATCHES.find((m) => m.matchNumber === 90);
check(
  match90 !== undefined && match90.homeWinnerOf === 73 && match90.awayWinnerOf === 75,
  `match 90 = W73 vs W75 (got homeWinnerOf=${match90?.homeWinnerOf}, awayWinnerOf=${match90?.awayWinnerOf})`
);

// ── 7. Match numbers 73–88 appear exactly once in ROUND_OF_32_MATCHES ─────────

const r32Numbers = ROUND_OF_32_MATCHES.map((m) => m.matchNumber);
for (let mn = 73; mn <= 88; mn++) {
  const occurrences = r32Numbers.filter((n) => n === mn).length;
  check(occurrences === 1, `Match ${mn} appears exactly once in ROUND_OF_32_MATCHES (found ${occurrences})`);
}

check(
  r32Numbers.length === 16,
  `ROUND_OF_32_MATCHES has exactly 16 entries (found ${r32Numbers.length})`
);

// ── 8. Match numbers 89–96 appear exactly once in ROUND_OF_16_MATCHES ─────────

const r16Numbers = ROUND_OF_16_MATCHES.map((m) => m.matchNumber);
for (let mn = 89; mn <= 96; mn++) {
  const occurrences = r16Numbers.filter((n) => n === mn).length;
  check(occurrences === 1, `Match ${mn} appears exactly once in ROUND_OF_16_MATCHES (found ${occurrences})`);
}

check(
  r16Numbers.length === 8,
  `ROUND_OF_16_MATCHES has exactly 8 entries (found ${r16Numbers.length})`
);

// ── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
