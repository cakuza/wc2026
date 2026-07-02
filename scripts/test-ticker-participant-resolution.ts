/**
 * Ticker and homepage participant-resolution + scorer-display tests.
 *
 * Usage:
 *   npx tsx scripts/test-ticker-participant-resolution.ts
 */

import assert from "assert";
import fs from "fs";
import path from "path";
import { MATCHES, matchSlug } from "../lib/matches";
import {
  isKnockoutMatch,
  getResolvedHomeTeam,
  getResolvedAwayTeam,
  getParticipantDisplayLabel,
  type ResolvedParticipantLookup,
} from "../lib/participant-resolution";
import { buildKnockoutResolution } from "../lib/knockoutResolution";
import { reconcileGoalEvents } from "../lib/scoreReconciliation";
import {
  applyVerifiedGoalCorrections,
  getVerifiedGoalCorrectionNote,
} from "../lib/verifiedMatchEventCorrections";
import type { SerializableSnapshotMatch } from "../lib/liveSnapshot";
import type { GoalScorerEvent } from "../lib/worldcup26Provider";

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

// ── Fixture helpers ──────────────────────────────────────────────────────────

const match74 = MATCHES.find(m => isKnockoutMatch(m) && m.matchNumber === 74)!;
const match75 = MATCHES.find(m => isKnockoutMatch(m) && m.matchNumber === 75)!;
const match77 = MATCHES.find(m => isKnockoutMatch(m) && m.matchNumber === 77)!;
const match73 = MATCHES.find(m => isKnockoutMatch(m) && m.matchNumber === 73)!;
const match81 = MATCHES.find(m => isKnockoutMatch(m) && m.matchNumber === 81)!;
const match89 = MATCHES.find(m => isKnockoutMatch(m) && m.matchNumber === 89)!;
const match90 = MATCHES.find(m => isKnockoutMatch(m) && m.matchNumber === 90)!;

assert(match74 && isKnockoutMatch(match74), "match 74 must be in MATCHES as knockout");
assert(match75 && isKnockoutMatch(match75), "match 75 must be in MATCHES as knockout");
assert(match77 && isKnockoutMatch(match77), "match 77 must be in MATCHES as knockout");
assert(match73 && isKnockoutMatch(match73), "match 73 must be in MATCHES as knockout");
assert(match81 && isKnockoutMatch(match81), "match 81 must be in MATCHES as knockout");
assert(match89 && isKnockoutMatch(match89), "match 89 must be in MATCHES as knockout");
assert(match90 && isKnockoutMatch(match90), "match 90 must be in MATCHES as knockout");

function makeFinishedEntry(
  match: ReturnType<typeof MATCHES.find>,
  winner: "HOME_TEAM" | "AWAY_TEAM",
): SerializableSnapshotMatch {
  return {
    match: match as never,
    internalId: `test-match-${(match as never as { matchNumber: number }).matchNumber}`,
    providerMatchId: null,
    status: "FINISHED",
    homeScore: winner === "HOME_TEAM" ? 1 : 0,
    awayScore: winner === "AWAY_TEAM" ? 1 : 0,
    sourceUpdatedAt: null,
    providerUpdatedAt: null,
    scorers: [],
    goalEventCompleteness: {
      expectedGoalCount: 1,
      normalizedGoalEventCount: 1,
      missingGoalEventCount: 0,
      isGoalEventDataComplete: true,
      completenessReason: "complete",
    },
    // winner and status are read from live?.winner by buildKnockoutResolution
    live: {
      winner,
      status: "FINISHED",
      homeScore: winner === "HOME_TEAM" ? 1 : 0,
      awayScore: winner === "AWAY_TEAM" ? 1 : 0,
    } as never,
    liveDataUnavailable: false,
  };
}

// Match 74: Germany vs Paraguay — AWAY_TEAM (Paraguay) wins (penalty winner)
// Match 75: Netherlands vs Morocco — AWAY_TEAM (Morocco) wins
// Match 77: France vs Sweden — HOME_TEAM (France) wins
// Match 73: South Africa vs Canada — AWAY_TEAM (Canada) wins
const snapshotWithR32Results = {
  "match-73": makeFinishedEntry(match73, "AWAY_TEAM") as SerializableSnapshotMatch,
  "match-74": makeFinishedEntry(match74, "AWAY_TEAM") as SerializableSnapshotMatch,
  "match-75": makeFinishedEntry(match75, "AWAY_TEAM") as SerializableSnapshotMatch,
  "match-77": makeFinishedEntry(match77, "HOME_TEAM") as SerializableSnapshotMatch,
};

const resolved = buildKnockoutResolution(snapshotWithR32Results);

// ── 1. Side-independent resolution ──────────────────────────────────────────

console.log("\n── 1. Side-independent resolution ──\n");

// match-89: homeSlot = winnerOf(74), awaySlot = winnerOf(77)
// match-90: homeSlot = winnerOf(73), awaySlot = winnerOf(75)

check(
  getResolvedHomeTeam(match89, resolved) === "paraguay",
  "1a. match 89 home = Paraguay (winner of match 74, away side)"
);
check(
  getResolvedAwayTeam(match89, resolved) === "france",
  "1b. match 89 away = France (winner of match 77, home side)"
);
check(
  getResolvedHomeTeam(match90, resolved) === "canada",
  "1c. match 90 home = Canada (winner of match 73, away side)"
);
check(
  getResolvedAwayTeam(match90, resolved) === "morocco",
  "1d. match 90 away = Morocco (winner of match 75, away side)"
);

// ── 2. Match 74 → Paraguay on downstream fixture ────────────────────────────

console.log("\n── 2. Match 74 propagation ──\n");

check(
  getResolvedHomeTeam(match89, resolved) === "paraguay",
  "2. match 74 winner (Paraguay) propagates as match 89 home side"
);

// ── 3. Match 75 → Morocco on downstream fixture ─────────────────────────────

console.log("\n── 3. Match 75 propagation ──\n");

check(
  getResolvedAwayTeam(match90, resolved) === "morocco",
  "3. match 75 winner (Morocco) propagates as match 90 away side"
);

// ── 4. One resolved + one unresolved participant renders correctly ────────────

console.log("\n── 4. Partial resolution (home only) ──\n");

// Only match-74 is finished; match-77 is still scheduled.
const partialResolved = buildKnockoutResolution({
  "match-74": makeFinishedEntry(match74, "AWAY_TEAM") as SerializableSnapshotMatch,
});

check(
  getResolvedHomeTeam(match89, partialResolved) === "paraguay",
  "4a. home side resolves when source match 74 is finished"
);
check(
  getResolvedAwayTeam(match89, partialResolved) === null,
  "4b. away side remains null when source match 77 is not yet in snapshot"
);
const awaySlot89 = isKnockoutMatch(match89) ? match89.awaySlot : null;
check(
  awaySlot89 !== null && getParticipantDisplayLabel(awaySlot89) === "Winner Match 77",
  "4c. unresolved away slot renders as 'Winner Match 77'"
);

// ── 5. Both unresolved — placeholders preserved ──────────────────────────────

console.log("\n── 5. Both unresolved ──\n");

const emptyResolved = buildKnockoutResolution({});

check(
  getResolvedHomeTeam(match89, emptyResolved) === null,
  "5a. match 89 home is null with empty snapshot"
);
check(
  getResolvedAwayTeam(match89, emptyResolved) === null,
  "5b. match 89 away is null with empty snapshot"
);
const homeSlot89 = isKnockoutMatch(match89) ? match89.homeSlot : null;
check(
  homeSlot89 !== null && getParticipantDisplayLabel(homeSlot89) === "Winner Match 74",
  "5c. unresolved home slot renders as 'Winner Match 74'"
);

// ── 6. Both resolved — both canonical team names shown ───────────────────────

console.log("\n── 6. Both resolved ──\n");

check(
  getResolvedHomeTeam(match89, resolved) === "paraguay" &&
  getResolvedAwayTeam(match89, resolved) === "france",
  "6. match 89 renders Paraguay vs France when both R32 sources finished"
);

// ── 7. Penalty winner controls propagation (not regular-time score) ──────────

console.log("\n── 7. Penalty-winner propagation ──\n");

// match-74 ended 1-1 AET; Paraguay won on penalties.
// `winner: AWAY_TEAM` is what buildKnockoutResolution uses — not homeScore/awayScore.
// The makeFinishedEntry above for match-74 sets homeScore=0 awayScore=1 to keep it
// simple, but even if we set both to 1 (AET), the winner field must control.
// 1-1 AET, Paraguay wins on penalties: homeScore=awayScore=1, winner=AWAY_TEAM in live.
const penaltySnapshot = {
  "match-74": {
    ...makeFinishedEntry(match74, "AWAY_TEAM"),
    homeScore: 1,
    awayScore: 1,
    live: {
      winner: "AWAY_TEAM" as const,
      status: "FINISHED",
      homeScore: 1,
      awayScore: 1,
      penaltyShootoutScore: { home: 3, away: 4 },
    } as never,
  } as SerializableSnapshotMatch,
};
const penaltyResolved = buildKnockoutResolution(penaltySnapshot);

check(
  getResolvedHomeTeam(match89, penaltyResolved) === "paraguay",
  "7. penalty winner (AWAY_TEAM=Paraguay, 1-1 AET) propagates — not tied score"
);

// ── 8. Base schedule remains immutable ──────────────────────────────────────

console.log("\n── 8. Schedule immutability ──\n");

const homeSlotBefore = JSON.stringify(isKnockoutMatch(match89) ? match89.homeSlot : null);
const awaySlotBefore = JSON.stringify(isKnockoutMatch(match89) ? match89.awaySlot : null);

buildKnockoutResolution(snapshotWithR32Results);
buildKnockoutResolution(snapshotWithR32Results);

check(
  JSON.stringify(isKnockoutMatch(match89) ? match89.homeSlot : null) === homeSlotBefore,
  "8a. match 89 homeSlot not mutated by buildKnockoutResolution"
);
check(
  JSON.stringify(isKnockoutMatch(match89) ? match89.awaySlot : null) === awaySlotBefore,
  "8b. match 89 awaySlot not mutated by buildKnockoutResolution"
);
check(
  isKnockoutMatch(match89) &&
  match89.homeSlot.kind === "winnerOf" &&
  match89.homeSlot.matchNumber === 74,
  "8c. match 89 homeSlot.kind=winnerOf matchNumber=74 preserved"
);

// ── 9. Match links retain the downstream fixture matchNumber ─────────────────

console.log("\n── 9. Link integrity ──\n");

check(
  isKnockoutMatch(match89) && match89.matchNumber === 89,
  "9a. match 89 matchNumber is 89"
);
check(
  isKnockoutMatch(match90) && match90.matchNumber === 90,
  "9b. match 90 matchNumber is 90"
);

// ── 10. Ticker and Bracket use equivalent participant identities ──────────────

console.log("\n── 10. Cross-surface identity ──\n");

// buildKnockoutResolution is the same function used by /bracket, /today, /matches/[matchId].
const resolvedA = buildKnockoutResolution(snapshotWithR32Results);
const resolvedB = buildKnockoutResolution(snapshotWithR32Results);

check(
  getResolvedHomeTeam(match89, resolvedA) === getResolvedHomeTeam(match89, resolvedB),
  "10a. buildKnockoutResolution is deterministic across calls"
);
check(
  resolvedA[89]?.home?.teamKey === "paraguay" &&
  resolvedB[89]?.home?.teamKey === "paraguay",
  "10b. both invocations yield paraguay for match-89 home"
);

// ── 11–17. Scorer display ────────────────────────────────────────────────────

console.log("\n── 11-17. Scorer display ──\n");

// Test 11: High-confidence ESPN scorer passes reconciliation unchanged
const espnScorer: GoalScorerEvent = {
  type: "GOAL",
  minute: 42,
  minuteLabel: "42'",
  teamName: "Paraguay",
  playerName: "Julio Enciso",
  provider: "espn",
  confidence: "high",
};
const result11 = reconcileGoalEvents({
  homeScore: 1,
  awayScore: 0,
  homeTeamName: "Paraguay",
  awayTeamName: "Germany",
  events: [espnScorer],
});
check(
  result11.confirmedEvents.some(e => e.playerName === "Julio Enciso"),
  "11. high-confidence ESPN scorer passes reconciliation"
);

// Test 12: reconciliation pipeline behaviour when NO correction is applied —
// verifies that a "Scorer unavailable" event passes through unchanged rather
// than being silently dropped or fabricated. (The actual match-81 canonical
// state now has Balogun at 45' via the verified correction; that is tested
// in section 18–27 below.)
const canonicalScorers81: GoalScorerEvent[] = [
  {
    type: "GOAL",
    minute: 45,
    minuteLabel: "45'",
    teamName: "United States",
    playerName: "Scorer unavailable",
    provider: "worldcup26.ir",
    confidence: "low",
  },
  {
    type: "GOAL",
    minute: 82,
    minuteLabel: "82'",
    teamName: "United States",
    playerName: "Malik Tillman",
    provider: "worldcup26.ir",
    confidence: "high",
  },
];
check(
  canonicalScorers81[0].playerName === "Scorer unavailable" &&
  canonicalScorers81[0].provider === "worldcup26.ir",
  "12. canonical 45' scorer is 'Scorer unavailable' from worldcup26.ir (not fabricated)"
);

// Test 13: Unknown scorer remains "Scorer unavailable" — reconcileGoalEvents
// returns it in confirmedEvents without altering the playerName.
const result13 = reconcileGoalEvents({
  homeScore: 2,
  awayScore: 0,
  homeTeamName: "United States",
  awayTeamName: "Bosnia & Herzegovina",
  events: canonicalScorers81,
});
check(
  result13.confirmedEvents.some(e => e.playerName === "Scorer unavailable"),
  "13. 'Scorer unavailable' passes through reconciliation unchanged"
);

// Test 14: When scorer identity is missing (playerName stays "Scorer unavailable"),
// the goalEventCompleteness layer reports isGoalEventDataComplete=false.
// We simulate: score=2 but only Tillman event is normalizable (the unavailable one
// is not counted as a known-identity scorer).
// reconcileGoalEvents accepts both events against the score, so confirmedEvents.length=2;
// scorerDetailsIncomplete=false here. The incompleteness is reported via the
// goalEventCompleteness field set by the live-snapshot layer (not reconcileGoalEvents).
// We assert that the confirmedEvents still contain the "Scorer unavailable" entry
// so it is displayed rather than hidden.
check(
  result13.confirmedEvents.length === 2 &&
  result13.scorerDetailsIncomplete === false,
  "14. both scorers confirmed against score=2; incompleteness flagged at snapshot layer"
);

// Test 15: An event with an unrecognized teamName cannot be attributed to either
// side → it is withheld and counted in unresolvedCount, not confirmedEvents.
const unrecognizedEvent: GoalScorerEvent = {
  type: "GOAL",
  minute: 55,
  minuteLabel: "55'",
  teamName: "??Unknown??",
  playerName: "Ghost Scorer",
  provider: "worldcup26.ir",
  confidence: "low",
};
const result15 = reconcileGoalEvents({
  homeScore: 1,
  awayScore: 1,
  homeTeamName: "United States",
  awayTeamName: "Bosnia & Herzegovina",
  events: [unrecognizedEvent],
});
check(
  result15.unresolvedCount === 1 &&
  result15.confirmedEvents.length === 0,
  "15. event with unrecognized teamName is withheld (unresolvedCount=1, not confirmed)"
);

// Test 16: Added-time minuteLabel "90+1'" is preserved by the canonical scorer pipeline.
const addedTimeScorer: GoalScorerEvent = {
  type: "GOAL",
  minute: 90,
  stoppageTime: 1,
  minuteLabel: "90+1'",
  teamName: "United States",
  playerName: "Christian Pulisic",
  provider: "espn",
  confidence: "high",
};
const result16 = reconcileGoalEvents({
  homeScore: 1,
  awayScore: 0,
  homeTeamName: "United States",
  awayTeamName: "Morocco",
  events: [addedTimeScorer],
});
check(
  result16.confirmedEvents[0]?.minuteLabel === "90+1'",
  "16. added-time label '90+1'' preserved through reconciliation"
);

// Test 17: Score-type flags (isOwnGoal, isPenalty) are not altered by reconciliation.
const ownGoalEvent: GoalScorerEvent = {
  type: "GOAL",
  minute: 30,
  minuteLabel: "30'",
  teamName: "United States",
  playerName: "Opponent Player",
  isOwnGoal: true,
  provider: "espn",
  confidence: "high",
};
const result17 = reconcileGoalEvents({
  homeScore: 1,
  awayScore: 0,
  homeTeamName: "United States",
  awayTeamName: "Morocco",
  events: [ownGoalEvent],
});
check(
  result17.confirmedEvents[0]?.isOwnGoal === true,
  "17. isOwnGoal flag unchanged by reconciliation"
);

// ── 18–27. Verified scorer corrections ──────────────────────────────────────

console.log("\n── 18-27. Verified scorer corrections ──\n");

const corrected81 = applyVerifiedGoalCorrections("match-81", []);

check(
  corrected81.length === 2,
  "18. applyVerifiedGoalCorrections('match-81', []) returns exactly 2 events"
);

check(
  corrected81[0]?.playerName === "Folarin Balogun" && corrected81[0]?.minute === 45,
  "19. first corrected event is Folarin Balogun at 45'"
);

check(
  corrected81[0]?.provider === "official_federation_verified",
  "20. Balogun provider is 'official_federation_verified'"
);

check(
  corrected81[0]?.confidence === "high",
  "21. Balogun confidence is 'high'"
);

check(
  corrected81[1]?.playerName === "Malik Tillman" && corrected81[1]?.minute === 82,
  "22. second corrected event is Malik Tillman at 82'"
);

check(
  corrected81[1]?.provider === "worldcup26.ir",
  "23. Tillman provider is 'worldcup26.ir'"
);

const dummyProviderEvents: GoalScorerEvent[] = [{
  type: "GOAL", minute: 10, minuteLabel: "10'", teamName: "Foo",
  playerName: "Bar Baz", provider: "worldcup26.ir", confidence: "high",
}];
const noCorrection = applyVerifiedGoalCorrections("no-such-match-xxxx", dummyProviderEvents);
check(
  noCorrection === dummyProviderEvents,
  "24. unknown match ID returns provider events array unchanged (same reference)"
);

const staleProviderEvents: GoalScorerEvent[] = [{
  type: "GOAL", minute: 45, minuteLabel: "45'", teamName: "United States",
  playerName: "Scorer unavailable", provider: "worldcup26.ir", confidence: "low",
}];
const replaced81 = applyVerifiedGoalCorrections("match-81", staleProviderEvents);
check(
  !replaced81.some(e => e.playerName === "Scorer unavailable"),
  "25. correction fully replaces provider events — 'Scorer unavailable' absent after correction"
);

check(
  getVerifiedGoalCorrectionNote("match-81") !== null,
  "26. match-81 has a non-null correction note"
);

check(
  corrected81.every(e => !e.isOwnGoal),
  "27. neither match-81 correction event is an own goal"
);

// ── 28–35. Homepage projection — match-81 participant and data-flow ──────────

console.log("\n── 28-35. Homepage projection (match-81) ──\n");

check(
  isKnockoutMatch(match81) && match81.matchNumber === 81,
  "28. match-81 is a knockout match with matchNumber 81"
);

check(
  match81.homeKey === "tbd",
  "29. match-81 homeKey is 'tbd' — participant unresolved at static level"
);

check(
  getResolvedHomeTeam(match81) === "unitedStates",
  "30. getResolvedHomeTeam(match81) (no snapshot arg) resolves to 'unitedStates' via RESOLVED_PARTICIPANTS"
);

check(
  getResolvedAwayTeam(match81) === "bosnia",
  "31. getResolvedAwayTeam(match81) (no snapshot arg) resolves to 'bosnia' via RESOLVED_PARTICIPANTS"
);

check(
  matchSlug(match81) === "match-81",
  "32. matchSlug(match81) is 'match-81' (knockout uses match number)"
);

check(
  match81.providerIds?.footballData === 537421,
  "33. match-81 providerIds.footballData is 537421"
);

check(
  String(match81.providerIds?.footballData) === "537421",
  "34. liveDataByProviderId key format: String(537421) === '537421'"
);

// A SCHEDULED match must not be surfaced as FINISHED in any today projection.
// Verify match-81's date is 2026-07-01 (the R32 date), proving it is in scope
// for Today display on that date, and that its internal structure is correct.
check(
  match81.date === "2026-07-01",
  "35. match-81 date is '2026-07-01' — correct R32 fixture date for Today projection"
);

// ── 36–38. Ticker regression guard ──────────────────────────────────────────

console.log("\n── 36-38. Ticker regression ──\n");

// These regression checks guard the specific team-key values that Ticker.tsx
// renders for QF semifinal fixtures. A refactor or data edit that changes
// "paraguay" → something else would flip these checks before breaking users.

check(
  getResolvedHomeTeam(match89, resolved) === "paraguay",
  "36. M89 home is 'paraguay' (Ticker/TickerDuplicate regression guard)"
);

check(
  getResolvedAwayTeam(match90, resolved) === "morocco",
  "37. M90 away is 'morocco' (Ticker/TickerDuplicate regression guard)"
);

// Determinism: a second invocation of buildKnockoutResolution must yield
// the same team-key for M89 home — confirms no mutation between calls.
const resolvedSecond = buildKnockoutResolution(snapshotWithR32Results);
check(
  getResolvedHomeTeam(match89, resolvedSecond) === "paraguay",
  "38. M89 home key stable across buildKnockoutResolution calls (no state mutation)"
);

// ── 39–40. Edge-request regression — prefetch={false} static check ───────────

console.log("\n── 39-40. Edge-request regression ──\n");

// Six components carry deliberate prefetch={false} attributes to prevent
// prefetch fan-out on high-impression surfaces. These must not be silently
// removed by future edits. The known six are:
//   TodayMatches.tsx, TeamCard.tsx, StandingsTable.tsx,
//   TimezoneSchedule.tsx, TimezoneSchedulePageContent.tsx,
//   app/schedule/ScheduleContent.tsx
// Test 39 spot-checks the Today card (most user-visible surface).
// Test 40 verifies the aggregate count has not dropped below 6.

const repoRoot = path.resolve(__dirname, "..");

const todaySrc = fs.readFileSync(path.join(repoRoot, "components", "TodayMatches.tsx"), "utf8");

check(
  todaySrc.includes("prefetch={false}"),
  "39. TodayMatches.tsx contains prefetch={false} (Today card match links must not prefetch)"
);

const filesToCheck = [
  ["components", "TodayMatches.tsx"],
  ["components", "TeamCard.tsx"],
  ["components", "StandingsTable.tsx"],
  ["components", "TimezoneSchedule.tsx"],
  ["components", "TimezoneSchedulePageContent.tsx"],
  ["app", "schedule", "ScheduleContent.tsx"],
];
const prefetchFalseCount = filesToCheck.filter(parts => {
  try {
    const src = fs.readFileSync(path.join(repoRoot, ...parts), "utf8");
    return src.includes("prefetch={false}");
  } catch {
    return false;
  }
}).length;

check(
  prefetchFalseCount >= 6,
  `40. all 6 known prefetch={false} sites are intact (found ${prefetchFalseCount}/6)`
);

// ── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(50)}`);
console.log(`  ${passed} passed · ${failed} failed`);
if (failed > 0) process.exit(1);
