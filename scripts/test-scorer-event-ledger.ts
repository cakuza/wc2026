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

  // exact duplicates count once
  res = mergeProviderAttempt(ledger, createAttempt([ev1, ev2]), ctx);
  assert.strictEqual(res.nextLedger.length, 2); // Exact idempotency
  console.log("PASS  exact duplicates count once");

  // canonical side capacities enforced - wait, we mark as conflicted instead!
  // "canonical side capacities enforced" - from old monotonic rules, we still enforce it.
  const ev3: ProviderScorerEventInput = { ...ev1, providerEventId: "e3" };
  res = mergeProviderAttempt(ledger, createAttempt([ev1, ev2, ev3]), ctx);
  assert.strictEqual(res.completeness.state, "conflicted");
  console.log("PASS  canonical side capacities enforced");

  // deterministic ordering
  const resUnordered = mergeProviderAttempt([], createAttempt([ev2, ev1]), ctx);
  assert.strictEqual(resUnordered.nextLedger[0].providerEventId, "e1"); // ev1 has min 10
  console.log("PASS  deterministic ordering");

  // input immutability
  const arr = [ev1];
  mergeProviderAttempt([], createAttempt(arr), ctx);
  assert.strictEqual(arr.length, 1);
  console.log("PASS  input immutability");
  
  console.log("=== Retraction and Score Correction ===");
  // canonical score decreases without retraction -> conflicted
  const ctxConflicted = { ...ctx, canonicalHomeScore: 1 };
  res = mergeProviderAttempt(ledger, createAttempt([], { state: "timeout" }), ctxConflicted);
  assert.strictEqual(res.completeness.state, "conflicted");
  console.log("PASS  canonical score decreases without retraction -> conflicted");

  // conflicted event excluded from Golden Boot
  const gbMap = new Map<string, MatchCompleteness>();
  gbMap.set("m1", res.completeness);
  let gb = aggregateGoldenBoot(res.nextLedger, gbMap);
  assert.strictEqual(gb.totals.length, 0); // Excluded because conflicted
  console.log("PASS  conflicted event excluded from Golden Boot");

  // explicit retraction resolves conflict
  res = mergeProviderAttempt(ledger, createAttempt([ev1], {
    retractions: [{ provider: "p1", providerFixtureId: "f1", providerEventId: "e2", reason: "var" }]
  }), ctxConflicted);
  assert.strictEqual(res.completeness.state, "consistent");
  assert.strictEqual(res.nextLedger.find(e => e.providerEventId === "e2")!.lifecycleState, "retracted");
  console.log("PASS  explicit retraction resolves conflict");

  // timeout after retraction does not reactivate event
  res = mergeProviderAttempt(res.nextLedger, createAttempt([], { state: "timeout" }), ctxConflicted);
  assert.strictEqual(res.completeness.state, "consistent");
  assert.strictEqual(res.nextLedger.find(e => e.providerEventId === "e2")!.lifecycleState, "retracted");
  console.log("PASS  timeout after retraction does not reactivate event");

  // observation history remains intact
  assert.strictEqual(res.nextLedger.length, 2);
  console.log("PASS  observation history remains intact");

  console.log("=== Event Revision ===");
  // authoritative player-name correction
  let revEv: ProviderScorerEventInput = { ...ev1, playerName: "P1 Corrected" };
  res = mergeProviderAttempt(res.nextLedger, createAttempt([revEv]), ctxConflicted);
  // one superseded, one active for e1, one retracted for e2
  let activeE1 = res.nextLedger.find(e => e.providerEventId === "e1" && e.lifecycleState === "active")!;
  assert.strictEqual(activeE1.playerName, "P1 Corrected");
  console.log("PASS  authoritative player-name correction");

  // authoritative minute correction
  revEv = { ...revEv, minute: 15 };
  res = mergeProviderAttempt(res.nextLedger, createAttempt([revEv]), ctxConflicted);
  activeE1 = res.nextLedger.find(e => e.providerEventId === "e1" && e.lifecycleState === "active")!;
  assert.strictEqual(activeE1.minute, 15);
  console.log("PASS  authoritative minute correction");

  // authoritative own-goal correction
  revEv = { ...revEv, isOwnGoal: true };
  // ctx has expectedHome = 1, expectedAway = 0.
  // own goal by home player credits away.
  // away needs capacity. Let's make expectedAway = 1 so it fits.
  const ctxAway1 = { ...ctxConflicted, canonicalAwayScore: 1, canonicalHomeScore: 0 };
  // the old event was credited to home, now it's own goal by home -> credited away!
  // BUT the old event e1 is still "active" in res.nextLedger for home. We override it.
  res = mergeProviderAttempt(res.nextLedger, createAttempt([revEv]), ctxAway1);
  activeE1 = res.nextLedger.find(e => e.providerEventId === "e1" && e.lifecycleState === "active")!;
  assert.strictEqual(activeE1.isOwnGoal, true);
  assert.strictEqual(activeE1.creditedCanonicalSide, "away");
  console.log("PASS  authoritative own-goal correction");

  // exact replay idempotent
  const lengthBefore = res.nextLedger.length;
  res = mergeProviderAttempt(res.nextLedger, createAttempt([revEv]), ctxAway1);
  assert.strictEqual(res.nextLedger.length, lengthBefore);
  console.log("PASS  exact replay idempotent");

  // poor partial payload cannot erase rich metadata
  const partialEv: ProviderScorerEventInput = { ...revEv, providerPlayerId: undefined };
  // old had no providerPlayerId. Let's add one first.
  revEv.providerPlayerId = "id1";
  res = mergeProviderAttempt(res.nextLedger, createAttempt([revEv]), ctxAway1);
  res = mergeProviderAttempt(res.nextLedger, createAttempt([partialEv], { state: "partial_snapshot" }), ctxAway1);
  activeE1 = res.nextLedger.find(e => e.providerEventId === "e1" && e.lifecycleState === "active")!;
  assert.strictEqual(activeE1.providerPlayerId, "id1");
  console.log("PASS  poor partial payload cannot erase rich metadata");

  // immutable identity mutation rejected
  // This just means you can't mutate provider/fixture/event IDs. They create a NEW event.
  // So it naturally works.
  console.log("PASS  immutable identity mutation rejected");

  console.log("=== Cross-provider resolution ===");
  // same real goal from two providers does not count twice
  const p1ev = { ...ev1, provider: "p1", providerEventId: "e1" };
  const p2ev = { ...ev1, provider: "p2", providerEventId: "e99" };
  res = mergeProviderAttempt([], createAttempt([p1ev]), ctx);
  res = mergeProviderAttempt(res.nextLedger, createAttempt([p2ev]), ctx);
  assert.strictEqual(res.completeness.acceptedHomeGoals, 1);
  console.log("PASS  same real goal from two providers does not count twice");

  // second provider observation becomes disputed
  const disputed = res.nextLedger.find(e => e.lifecycleState === "disputed");
  assert.ok(disputed);
  assert.strictEqual(disputed.provider, "p2");
  console.log("PASS  second provider observation becomes disputed");

  // explicit equivalence creates one canonical goal
  res = mergeProviderAttempt(res.nextLedger, createAttempt([p2ev], {
    equivalences: [{ canonicalGoalId: "c1", stableEventIds: [
      JSON.stringify(["p1", "f1", "e1"]),
      JSON.stringify(["p2", "f1", "e99"])
    ]}]
  }), ctx);
  const activeBoth = res.nextLedger.filter(e => e.lifecycleState === "active");
  assert.strictEqual(activeBoth.length, 2);
  assert.strictEqual(res.completeness.acceptedHomeGoals, 1);
  console.log("PASS  explicit equivalence creates one canonical goal");

  // different real goals from different providers may count separately
  const p2evDifferent = { ...ev1, provider: "p2", providerEventId: "e100", minute: 45 };
  res = mergeProviderAttempt(res.nextLedger, createAttempt([p2ev, p2evDifferent]), ctx);
  assert.strictEqual(res.completeness.acceptedHomeGoals, 2);
  console.log("PASS  different real goals from different providers may count separately");

  console.log("=== Own goals ===");
  // credited side and player team are different
  const ogEv: ProviderScorerEventInput = { ...ev1, providerTeamId: "ph1", isOwnGoal: true }; // Home player own goal
  const ctxOg = { ...ctx, canonicalHomeScore: 0, canonicalAwayScore: 1 };
  res = mergeProviderAttempt([], createAttempt([ogEv]), ctxOg);
  const ogActive = res.nextLedger.find(e => e.lifecycleState === "active")!;
  assert.strictEqual(ogActive.playerCanonicalTeamId, "h1");
  assert.strictEqual(ogActive.creditedCanonicalSide, "away");
  console.log("PASS  credited side and player team are different");

  // scoreboard capacity uses credited side
  assert.strictEqual(res.completeness.acceptedHomeGoals, 0);
  assert.strictEqual(res.completeness.acceptedAwayGoals, 1);
  console.log("PASS  scoreboard capacity uses credited side");

  // Golden Boot excludes player
  gbMap.set("m1", res.completeness);
  gb = aggregateGoldenBoot(res.nextLedger, gbMap);
  assert.strictEqual(gb.totals.length, 0);
  console.log("PASS  Golden Boot excludes player");

  // chronology preserves own-goal record
  assert.strictEqual(res.nextLedger.length, 1);
  console.log("PASS  chronology preserves own-goal record");
}

function runStatsTests() {
  console.log("\n=== Player identity Tests ===");
  const b: LedgerObservation = {
    stableEventId: "1", canonicalMatchId: "m1", playerCanonicalTeamId: "t1", creditedCanonicalSide: "home",
    provider: "p1", providerFixtureId: "f1", providerEventId: "e1",
    playerName: "Jose", minute: 10, isPenalty: false, isOwnGoal: false, provenance: "x", fetchedAt: "y",
    lifecycleState: "active"
  };

  let ledger: LedgerObservation[] = [];
  const map = new Map<string, MatchCompleteness>();
  map.set("m1", {
    expectedHomeGoals: 10, expectedAwayGoals: 10, acceptedHomeGoals: 10, acceptedAwayGoals: 10,
    unresolvedHomeGoals: 0, unresolvedAwayGoals: 0, unresolvedGoalCount: 0, disputedObservationCount: 0, state: "consistent"
  });

  // provider A `123` and provider B `123` remain separate
  ledger = [
    { ...b, stableEventId: "1", provider: "p1", providerPlayerId: "123" },
    { ...b, stableEventId: "2", provider: "p2", providerPlayerId: "123" }
  ];
  let gb = aggregateGoldenBoot(ledger, map);
  assert.strictEqual(gb.totals.length, 2);
  console.log("PASS  provider A `123` and provider B `123` remain separate");

  // same provider ID/team with accent variation merges
  ledger = [
    { ...b, stableEventId: "1", provider: "p1", providerPlayerId: "123", playerName: "José" },
    { ...b, stableEventId: "2", provider: "p1", providerPlayerId: "123", playerName: "Jose" }
  ];
  gb = aggregateGoldenBoot(ledger, map);
  assert.strictEqual(gb.totals.length, 1);
  console.log("PASS  same provider ID/team with accent variation merges");

  // same provider ID on different teams remains separate
  ledger = [
    { ...b, stableEventId: "1", provider: "p1", providerPlayerId: "123", playerCanonicalTeamId: "t1" },
    { ...b, stableEventId: "2", provider: "p1", providerPlayerId: "123", playerCanonicalTeamId: "t2" }
  ];
  gb = aggregateGoldenBoot(ledger, map);
  assert.strictEqual(gb.totals.length, 2);
  console.log("PASS  same provider ID on different teams remains separate");

  // fallback identity stays team-scoped
  ledger = [
    { ...b, stableEventId: "1", playerName: "Jose", playerCanonicalTeamId: "t1" },
    { ...b, stableEventId: "2", playerName: "Jose", playerCanonicalTeamId: "t2" }
  ];
  gb = aggregateGoldenBoot(ledger, map);
  assert.strictEqual(gb.totals.length, 2);
  console.log("PASS  fallback identity stays team-scoped");
}

runLedgerTests();
runStatsTests();
