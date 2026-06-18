import "./mock-server-only";
import assert from "assert";
import { adaptEspnEventToLedger } from "../lib/espnScorerAdapter";
import type { EspnGoalEvent, EspnFixtureMapping } from "../lib/espnProvider";
import { mergeProviderAttempt, aggregateGoldenBoot, type MergeCanonicalContext } from "../lib/scorerEventLedger";

let passed = 0;
let failed = 0;
function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  PASS  ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  FAIL  ${name}`);
    console.error(`        ${err?.message ?? err}`);
    failed++;
  }
}

console.log("=== ESPN Adapter Tests ===");

const mapping: EspnFixtureMapping = {
  canonicalMatchId: "m1",
  providerFixtureId: "f1",
  kickoffDifferenceMinutes: 0,
  source: "automatic",
};
const context: MergeCanonicalContext = {
  canonicalMatchId: "m1",
  canonicalHomeTeamId: "homeTeam",
  canonicalAwayTeamId: "awayTeam",
  canonicalHomeScore: 1,
  canonicalAwayScore: 1,
  canonicalStatus: "FINISHED",
};

function evt(overrides: Partial<EspnGoalEvent> = {}): EspnGoalEvent {
  return {
    provider: "espn",
    providerFixtureId: "f1",
    providerEventId: "e1",
    providerTeamId: "PH",
    playerName: "Player",
    minute: 10,
    isPenalty: false,
    isOwnGoal: false,
    ...overrides,
  };
}

test("normal home goal → credited home, scorer team home", () => {
  const r = adaptEspnEventToLedger({ event: evt({ providerTeamId: "PH" }), mapping, context, providerHomeTeamId: "PH", providerAwayTeamId: "PA" });
  assert.ok(r.attemptEvent);
  assert.strictEqual(r.attemptEvent!.creditedCanonicalSide, "home");
  assert.strictEqual(r.attemptEvent!.isOwnGoal, false);
});

test("normal away goal → credited away", () => {
  const r = adaptEspnEventToLedger({ event: evt({ providerTeamId: "PA" }), mapping, context, providerHomeTeamId: "PH", providerAwayTeamId: "PA" });
  assert.strictEqual(r.attemptEvent!.creditedCanonicalSide, "away");
});

test("own goal: ESPN team is beneficiary → credited side = beneficiary, no scorer-team inference", () => {
  // Away player scores into own net; ESPN credits the home (beneficiary) team.
  const r = adaptEspnEventToLedger({
    event: evt({ providerTeamId: "PH", isOwnGoal: true, playerName: "Own Scorer" }),
    mapping,
    context,
    providerHomeTeamId: "PH",
    providerAwayTeamId: "PA",
  });
  assert.ok(r.attemptEvent);
  assert.strictEqual(r.attemptEvent!.isOwnGoal, true);
  assert.strictEqual(r.attemptEvent!.creditedCanonicalSide, "home");
});

test("unknown provider team id rejected (no guess)", () => {
  const r = adaptEspnEventToLedger({ event: evt({ providerTeamId: "ZZZ" }), mapping, context, providerHomeTeamId: "PH", providerAwayTeamId: "PA" });
  assert.strictEqual(r.attemptEvent, undefined);
  assert.ok(r.rejectedReason);
});

test("canonical match id mismatch rejected", () => {
  const r = adaptEspnEventToLedger({
    event: evt(),
    mapping: { ...mapping, canonicalMatchId: "other" },
    context,
    providerHomeTeamId: "PH",
    providerAwayTeamId: "PA",
  });
  assert.strictEqual(r.attemptEvent, undefined);
});

test("own goal excluded from Golden Boot; credited side still completes score", () => {
  // Match 1-1: home penalty + away own-goal credited to home... use 2-0 home to test OG credit.
  const ctx: MergeCanonicalContext = { ...context, canonicalHomeScore: 1, canonicalAwayScore: 0 };
  const og = adaptEspnEventToLedger({
    event: evt({ providerEventId: "og1", providerTeamId: "PH", isOwnGoal: true, playerName: "Away Defender" }),
    mapping,
    context: ctx,
    providerHomeTeamId: "PH",
    providerAwayTeamId: "PA",
  }).attemptEvent!;

  const merged = mergeProviderAttempt([], {
    state: "complete_snapshot",
    events: [og],
    fetchedAt: "2026-06-13T00:00:00Z",
    provenance: "espn",
    providerHomeTeamId: "PH",
    providerAwayTeamId: "PA",
  }, ctx);

  assert.strictEqual(merged.completeness.acceptedHomeGoals, 1);
  assert.strictEqual(merged.completeness.unresolvedGoalCount, 0);

  const gb = aggregateGoldenBoot(merged.nextLedger, new Map([["m1", merged.completeness]]));
  // Own-goal scorer must NOT appear in Golden Boot totals.
  assert.ok(!gb.totals.some((t) => t.identity.displayName === "Away Defender"));
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
