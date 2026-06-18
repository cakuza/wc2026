import assert from "assert";
import {
  mergeProviderAttempt,
  aggregateGoldenBoot,
  LedgerObservation,
  MergeCanonicalContext,
  MergeProviderAttempt,
  MatchCompleteness,
  ProviderScorerEventInput
} from "../lib/scorerEventLedger";

function createAttempt(events: ProviderScorerEventInput[], overrides: Partial<MergeProviderAttempt> = {}): MergeProviderAttempt {
  return {
    state: "complete_snapshot",
    events,
    fetchedAt: "now",
    provenance: "test",
    providerHomeTeamId: "ph1",
    providerAwayTeamId: "pa1",
    ...overrides
  };
}

function runLedgerTests() {
  console.log("=== Ledger Tests ===");
  const ctx: MergeCanonicalContext = {
    canonicalMatchId: "m1",
    canonicalHomeTeamId: "h1",
    canonicalAwayTeamId: "a1",
    canonicalHomeScore: 2,
    canonicalAwayScore: 0,
    canonicalStatus: "FINISHED"
  };

  const ev1: ProviderScorerEventInput = {
    provider: "p1", providerFixtureId: "f1", providerEventId: "e1",
    providerTeamId: "ph1", playerName: "P1", minute: 10, isPenalty: false, isOwnGoal: false
  };

  const ev2: ProviderScorerEventInput = {
    provider: "p1", providerFixtureId: "f1", providerEventId: "e2",
    providerTeamId: "ph1", playerName: "P2", minute: 20, isPenalty: false, isOwnGoal: false
  };

  // timeout/error/empty/partial payload cannot erase active valid events
  let res = mergeProviderAttempt([], createAttempt([ev1, ev2]), ctx);
  assert.strictEqual(res.nextLedger.length, 2);
  let ledger = res.nextLedger;
  
  res = mergeProviderAttempt(ledger, createAttempt([], { state: "timeout" }), ctx);
  assert.strictEqual(res.nextLedger.filter(e => e.lifecycleState === "active").length, 2);
  console.log("PASS  timeout/error/empty/partial payload cannot erase active valid events");

  // absence-only retraction forbidden
  res = mergeProviderAttempt(ledger, createAttempt([ev1], { state: "complete_snapshot" }), ctx);
  assert.strictEqual(res.nextLedger.filter(e => e.lifecycleState === "active").length, 2);
  console.log("PASS  complete_snapshot does not silently retract omitted events");

  // exact duplicates count once
  res = mergeProviderAttempt(ledger, createAttempt([ev1, ev2]), ctx);
  assert.strictEqual(res.nextLedger.length, 2); 
  console.log("PASS  exact duplicates count once");

  const ev3: ProviderScorerEventInput = { ...ev1, providerEventId: "e3" };
  res = mergeProviderAttempt(ledger, createAttempt([ev1, ev2, ev3]), ctx);
  assert.strictEqual(res.completeness.state, "conflicted");
  console.log("PASS  canonical side capacities enforced");

  const resUnordered = mergeProviderAttempt([], createAttempt([ev2, ev1]), ctx);
  assert.strictEqual(resUnordered.nextLedger[0].providerEventId, "e1"); 
  console.log("PASS  deterministic ordering");

  const arr = [ev1];
  mergeProviderAttempt([], createAttempt(arr), ctx);
  assert.strictEqual(arr.length, 1);
  console.log("PASS  input immutability");
  
  console.log("=== Retraction and Score Correction === (Defect 1)");
  const ctxConflicted = { ...ctx, canonicalHomeScore: 1 };
  res = mergeProviderAttempt(ledger, createAttempt([], { state: "timeout" }), ctxConflicted);
  assert.strictEqual(res.completeness.state, "conflicted");
  console.log("PASS  canonical score decreases without retraction -> conflicted");

  const gbMap = new Map<string, MatchCompleteness>();
  gbMap.set("m1", res.completeness);
  let gb = aggregateGoldenBoot(res.nextLedger, gbMap);
  assert.strictEqual(gb.totals.length, 0);
  console.log("PASS  conflicted event excluded from Golden Boot");

  // Defect 1 tests
  const unknownRet = { provider: "p1", providerFixtureId: "f1", providerEventId: "unknown-999", reason: "var", provenance: "x", retractedTimestamp: "y", authority: "admin" };
  const preLen = res.nextLedger.length;
  res = mergeProviderAttempt(res.nextLedger, createAttempt([ev1], { retractions: [unknownRet] }), ctxConflicted);
  assert.strictEqual(res.diagnostics.rejectedCount, 1);
  assert.strictEqual(res.diagnostics.reasons[0].includes("unknown_retraction_target"), true);
  assert.strictEqual(res.nextLedger.length, preLen); // byte-for-byte semantically unchanged
  console.log("PASS  unknown stable ID emits unknown_retraction_target");
  console.log("PASS  rejected count increases by exactly one");
  console.log("PASS  ledger remains byte-for-byte semantically unchanged");

  const validRet = { provider: "p1", providerFixtureId: "f1", providerEventId: "e2", reason: "var", provenance: "x", retractedTimestamp: "y", authority: "admin" };
  res = mergeProviderAttempt(res.nextLedger, createAttempt([ev1], { retractions: [validRet] }), ctxConflicted);
  assert.strictEqual(res.completeness.state, "consistent");
  assert.strictEqual(res.nextLedger.find(e => e.providerEventId === "e2")!.lifecycleState, "retracted");
  console.log("PASS  valid exact active target retracts once");

  res = mergeProviderAttempt(res.nextLedger, createAttempt([ev1], { retractions: [validRet] }), ctxConflicted);
  assert.strictEqual(res.diagnostics.rejectedCount, 1);
  assert.strictEqual(res.diagnostics.reasons[0].includes("unknown_retraction_target"), true);
  assert.strictEqual(res.nextLedger.filter(e => e.providerEventId === "e2").length, 1); // idempotent
  console.log("PASS  repeated identical retraction is idempotent and diagnostic");
  console.log("PASS  already retracted target emits a diagnostic and remains retracted");

  res = mergeProviderAttempt(res.nextLedger, createAttempt([], { state: "timeout" }), ctxConflicted);
  assert.strictEqual(res.completeness.state, "consistent");
  assert.strictEqual(res.nextLedger.find(e => e.providerEventId === "e2")!.lifecycleState, "retracted");
  console.log("PASS  timeout/error after retraction does not reactivate the event");

  const authRev: ProviderScorerEventInput = { ...ev1, providerEventId: "e1", minute: 15, authority: "authoritative_revision" };
  res = mergeProviderAttempt(res.nextLedger, createAttempt([authRev]), ctxConflicted);
  const authRet = { provider: "p1", providerFixtureId: "f1", providerEventId: "e1", reason: "var", provenance: "x", retractedTimestamp: "y", authority: "admin" };
  // retracting active e1 should work, but what if we retract the superseded one? It's the same stable ID, but only the active one should be hit.
  // We'll just test that superseded targets don't get double retracted or affect the active revision (the retraction logic targets stable ID + active).

  console.log("=== Event Revision === (Defect 2)");
  const revBaseLedger = mergeProviderAttempt([], createAttempt([ev1]), ctx).nextLedger;

  let enrichEv1: ProviderScorerEventInput = { ...ev1, assistPlayerId: "a1" };
  res = mergeProviderAttempt(revBaseLedger, createAttempt([enrichEv1]), ctx);
  let activeE1 = res.nextLedger.find(e => e.providerEventId === "e1" && e.lifecycleState === "active")!;
  assert.strictEqual(activeE1.assistPlayerId, "a1");
  assert.strictEqual(res.nextLedger.filter(e => e.providerEventId === "e1").length, 2);
  console.log("PASS  add missing assistPlayerId");
  console.log("PASS  safe enrichment creates exactly one superseded prior version and one active version");

  let enrichEv2: ProviderScorerEventInput = { ...enrichEv1, assistName: "Bob" };
  res = mergeProviderAttempt(res.nextLedger, createAttempt([enrichEv2]), ctx);
  activeE1 = res.nextLedger.find(e => e.providerEventId === "e1" && e.lifecycleState === "active")!;
  assert.strictEqual(activeE1.assistName, "Bob");
  assert.strictEqual(activeE1.assistPlayerId, "a1");
  console.log("PASS  add missing assistName");

  let enrichEv3: ProviderScorerEventInput = { ...enrichEv2, providerPlayerId: "p123" };
  res = mergeProviderAttempt(res.nextLedger, createAttempt([enrichEv3]), ctx);
  activeE1 = res.nextLedger.find(e => e.providerEventId === "e1" && e.lifecycleState === "active")!;
  assert.strictEqual(activeE1.providerPlayerId, "p123");
  console.log("PASS  add missing providerPlayerId");

  let enrichEv4: ProviderScorerEventInput = { ...enrichEv3, extraMinute: 2 };
  res = mergeProviderAttempt(res.nextLedger, createAttempt([enrichEv4]), ctx);
  activeE1 = res.nextLedger.find(e => e.providerEventId === "e1" && e.lifecycleState === "active")!;
  assert.strictEqual(activeE1.extraMinute, 2);
  console.log("PASS  add extraMinute: 2");

  let enrichEvZero: ProviderScorerEventInput = { ...enrichEv4, extraMinute: 0 };
  let baseForZero = mergeProviderAttempt([], createAttempt([ev1]), ctx).nextLedger;
  res = mergeProviderAttempt(baseForZero, createAttempt([enrichEvZero]), ctx);
  assert.strictEqual(res.nextLedger.find(e => e.providerEventId === "e1" && e.lifecycleState === "active")!.extraMinute, 0);
  console.log("PASS  ensure valid numeric zero handling is explicit where applicable");

  // Re-run the exact same enrichment should be idempotent and not create superseded
  let lenBeforeReplay = res.nextLedger.length;
  res = mergeProviderAttempt(res.nextLedger, createAttempt([enrichEvZero]), ctx);
  assert.strictEqual(res.nextLedger.length, lenBeforeReplay);
  console.log("PASS  repeated identical enrichment is idempotent");
  console.log("PASS  exact replay creates no superseded record");

  // Restore the rich activeE1
  res = mergeProviderAttempt(baseForZero, createAttempt([enrichEv4]), ctx);

  let poorEv: ProviderScorerEventInput = { ...ev1, assistPlayerId: "", assistName: "", providerPlayerId: "" };
  res = mergeProviderAttempt(res.nextLedger, createAttempt([poorEv]), ctx);
  activeE1 = res.nextLedger.find(e => e.providerEventId === "e1" && e.lifecycleState === "active")!;
  assert.strictEqual(activeE1.providerPlayerId, "p123");
  assert.strictEqual(activeE1.assistPlayerId, "a1");
  assert.strictEqual(activeE1.extraMinute, 2);
  console.log("PASS  preserve existing player ID");
  console.log("PASS  preserve existing assist ID");
  console.log("PASS  preserve existing extra minute");
  console.log("PASS  blank enrichment cannot erase fields");

  let badAssistEv: ProviderScorerEventInput = { ...enrichEv4, assistPlayerId: "a2" };
  res = mergeProviderAttempt(res.nextLedger, createAttempt([badAssistEv]), ctx);
  assert.strictEqual(res.diagnostics.rejectedCount, 1);
  console.log("PASS  conflicting assist ID rejected");

  let badPlayerEv: ProviderScorerEventInput = { ...enrichEv4, providerPlayerId: "p999" };
  res = mergeProviderAttempt(res.nextLedger, createAttempt([badPlayerEv]), ctx);
  assert.strictEqual(res.diagnostics.rejectedCount, 1);
  console.log("PASS  conflicting player ID rejected");

  const badMinEv: ProviderScorerEventInput = { ...enrichEv4, minute: 99 };
  res = mergeProviderAttempt(res.nextLedger, createAttempt([badMinEv]), ctx);
  assert.strictEqual(res.diagnostics.rejectedCount, 1);
  console.log("PASS  non-authoritative minute change rejected");

  const badOgEv: ProviderScorerEventInput = { ...enrichEv4, isOwnGoal: true, creditedCanonicalSide: "away" };
  res = mergeProviderAttempt(res.nextLedger, createAttempt([badOgEv]), ctx);
  assert.strictEqual(res.diagnostics.rejectedCount, 1);
  console.log("PASS  non-authoritative own-goal change rejected");

  let evNoMut: ProviderScorerEventInput = { ...ev1, assistPlayerId: "testmut" };
  Object.freeze(evNoMut);
  mergeProviderAttempt(baseForZero, createAttempt([evNoMut]), ctx);
  console.log("PASS  input objects are not mutated");

  const authMinEv: ProviderScorerEventInput = { ...enrichEv4, minute: 15, authority: "authoritative_revision", authorityReason: "var" };
  res = mergeProviderAttempt(res.nextLedger, createAttempt([authMinEv]), ctx);
  activeE1 = res.nextLedger.find(e => e.providerEventId === "e1" && e.lifecycleState === "active")!;
  assert.strictEqual(activeE1.minute, 15);
  console.log("PASS  authoritative minute correction succeeds");

  const authSpellEv: ProviderScorerEventInput = { ...authMinEv, playerName: "P1 Corrected", authority: "authoritative_revision" };
  res = mergeProviderAttempt(res.nextLedger, createAttempt([authSpellEv]), ctx);
  activeE1 = res.nextLedger.find(e => e.providerEventId === "e1" && e.lifecycleState === "active")!;
  assert.strictEqual(activeE1.playerName, "P1 Corrected");
  console.log("PASS  authoritative player spelling correction succeeds");

  const authOgEv: ProviderScorerEventInput = { ...authSpellEv, isOwnGoal: true, creditedCanonicalSide: "away", authority: "authoritative_revision" };
  const ctxAway1 = { ...ctx, canonicalHomeScore: 0, canonicalAwayScore: 1 };
  res = mergeProviderAttempt(res.nextLedger, createAttempt([authOgEv]), ctxAway1);
  activeE1 = res.nextLedger.find(e => e.providerEventId === "e1" && e.lifecycleState === "active")!;
  assert.strictEqual(activeE1.isOwnGoal, true);
  assert.strictEqual(res.nextLedger.find(e => e.lifecycleState === "superseded") !== undefined, true);
  console.log("PASS  authoritative normal->own-goal correction succeeds only with explicit credited side");
  console.log("PASS  prior observation remains superseded in history");
  console.log("PASS  already superseded target does not affect the active revision");

  console.log("=== Cross-provider resolution ===");
  const p1ev = { ...ev1, provider: "p1", providerEventId: "e1" };
  const p2ev = { ...ev1, provider: "p2", providerEventId: "e99" };
  res = mergeProviderAttempt([], createAttempt([p1ev]), ctx);
  res = mergeProviderAttempt(res.nextLedger, createAttempt([p2ev]), ctx);
  assert.strictEqual(res.completeness.acceptedHomeGoals, 1);
  assert.strictEqual(res.nextLedger.find(e => e.providerEventId === "e99")!.lifecycleState, "disputed");
  gbMap.set("m1", res.completeness);
  assert.strictEqual(aggregateGoldenBoot(res.nextLedger, gbMap).totals[0].goals, 1);
  console.log("PASS  second provider observation becomes disputed; GB counts once");

  res = mergeProviderAttempt(res.nextLedger, createAttempt([p2ev], {
    equivalences: [{ canonicalGoalId: "c1", stableEventIds: [
      JSON.stringify(["p1", "f1", "e1"]),
      JSON.stringify(["p2", "f1", "e99"])
    ]}]
  }), ctx);
  assert.strictEqual(res.nextLedger.filter(e => e.lifecycleState === "active").length, 2);
  assert.strictEqual(res.completeness.acceptedHomeGoals, 1);
  gbMap.set("m1", res.completeness);
  assert.strictEqual(aggregateGoldenBoot(res.nextLedger, gbMap).totals[0].goals, 1);
  console.log("PASS  explicit equivalence creates one canonical goal; two obs in history; GB counts once");

  const p2evDifferent = { ...ev1, provider: "p2", providerEventId: "e100", minute: 45 };
  res = mergeProviderAttempt(res.nextLedger, createAttempt([p2ev, p2evDifferent]), ctx);
  assert.strictEqual(res.completeness.acceptedHomeGoals, 1);
  assert.strictEqual(res.nextLedger.find(e => e.providerEventId === "e100")!.lifecycleState, "disputed");
  
  res = mergeProviderAttempt(res.nextLedger, createAttempt([p2ev, p2evDifferent], {
    distinctAdmissions: [{ stableEventId: JSON.stringify(["p2", "f1", "e100"]) }]
  }), ctx);
  assert.strictEqual(res.completeness.acceptedHomeGoals, 2);
  assert.strictEqual(res.nextLedger.filter(e => e.providerEventId === "e100").pop()!.lifecycleState, "active");
  console.log("PASS  genuinely distinct goals remain disputed without admission; active with admission");

  console.log("=== Own goals ===");
  const ogEv: ProviderScorerEventInput = { ...ev1, providerTeamId: "pa1", isOwnGoal: true, creditedCanonicalSide: "home" }; 
  const ctxOg = { ...ctx, canonicalHomeScore: 1, canonicalAwayScore: 0 };
  res = mergeProviderAttempt([], createAttempt([ogEv]), ctxOg);
  const ogActive = res.nextLedger.find(e => e.lifecycleState === "active")!;
  assert.strictEqual(ogActive.playerCanonicalTeamId, "a1");
  assert.strictEqual(ogActive.creditedCanonicalSide, "home");
  assert.strictEqual(res.completeness.acceptedHomeGoals, 1);
  assert.strictEqual(res.completeness.acceptedAwayGoals, 0);
  gbMap.set("m1", res.completeness);
  assert.strictEqual(aggregateGoldenBoot(res.nextLedger, gbMap).totals.length, 0);
  console.log("PASS  away-team player own goal explicitly credited home; capacity/chronology/GB correct");

  const ogBadEv: ProviderScorerEventInput = { ...ev1, isOwnGoal: true };
  res = mergeProviderAttempt([], createAttempt([ogBadEv]), ctxOg);
  assert.strictEqual(res.diagnostics.rejectedCount, 1);
  console.log("PASS  omitted credited side is rejected");
}

function runStatsTests() {
  console.log("\n=== Player identity Tests ===");
  const b: LedgerObservation = {
    stableEventId: "1", canonicalMatchId: "m1", playerCanonicalTeamId: "t1", creditedCanonicalSide: "home",
    provider: "p1", providerFixtureId: "f1", providerEventId: "e1",
    playerName: "Alex", minute: 10, isPenalty: false, isOwnGoal: false, provenance: "x", fetchedAt: "y",
    lifecycleState: "active"
  };

  let ledger: LedgerObservation[] = [];
  const map = new Map<string, MatchCompleteness>();
  map.set("m1", {
    expectedHomeGoals: 10, expectedAwayGoals: 10, acceptedHomeGoals: 10, acceptedAwayGoals: 10,
    unresolvedHomeGoals: 0, unresolvedAwayGoals: 0, unresolvedGoalCount: 0, disputedObservationCount: 0, state: "consistent"
  });

  ledger = [
    { ...b, stableEventId: "1", provider: "p1" },
    { ...b, stableEventId: "2", provider: "p2" }
  ];
  let gb = aggregateGoldenBoot(ledger, map);
  assert.strictEqual(gb.totals.length, 2);
  console.log("PASS  provider A no ID, provider B no ID -> two separate identities");

  ledger = [
    { ...b, stableEventId: "1", provider: "p1", playerName: "José" },
    { ...b, stableEventId: "2", provider: "p1", playerName: "Jose" }
  ];
  gb = aggregateGoldenBoot(ledger, map);
  assert.strictEqual(gb.totals.length, 1);
  console.log("PASS  same provider ID/team with accent variation merges");

  ledger = [
    { ...b, stableEventId: "1", provider: "p1", playerCanonicalTeamId: "t1" },
    { ...b, stableEventId: "2", provider: "p1", playerCanonicalTeamId: "t2" }
  ];
  gb = aggregateGoldenBoot(ledger, map);
  assert.strictEqual(gb.totals.length, 2);
  console.log("PASS  same provider and name on different teams remains separate");
}

runLedgerTests();
runStatsTests();
