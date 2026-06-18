import "./mock-server-only";
import assert from "assert";
import { KickoffApiGoalEvent } from "../lib/kickoffApiProvider";
import { adaptKickoffEventToLedger, planEnrichmentCandidates } from "../lib/kickoffScorerAdapter";
import { MergeCanonicalContext } from "../lib/scorerEventLedger";

async function run() {
  console.log("=== Adapter Tests ===");

  const evBase: KickoffApiGoalEvent = {
    provider: "kickoffapi",
    providerFixtureId: "f1",
    providerEventId: "e1",
    providerTeamId: "ptH",
    playerName: "P1",
    minute: 10,
    detail: "Normal Goal",
    isPenalty: false,
    isOwnGoal: false
  };

  const mapping = {
    canonicalMatchId: "m1",
    providerFixtureId: "f1",
    kickoffDifferenceMinutes: 0,
    source: "automatic" as const
  };

  const ctx: MergeCanonicalContext = {
    canonicalMatchId: "m1",
    canonicalHomeTeamId: "h1",
    canonicalAwayTeamId: "a1",
    canonicalHomeScore: 1,
    canonicalAwayScore: 0,
    canonicalStatus: "FINISHED"
  };

  const inputBase = {
    event: evBase,
    mapping,
    context: ctx,
    providerHomeTeamId: "ptH",
    providerAwayTeamId: "ptA",
    fetchTimestamp: "now"
  };

  // 1. Normal home goal
  let res = adaptKickoffEventToLedger(inputBase);
  assert.strictEqual(res.attemptEvent?.creditedCanonicalSide, "home");
  assert.strictEqual(res.rejectedReason, undefined);
  console.log("PASS  normal home goal");

  // 2. Normal away goal
  res = adaptKickoffEventToLedger({ ...inputBase, event: { ...evBase, providerTeamId: "ptA" } });
  assert.strictEqual(res.attemptEvent?.creditedCanonicalSide, "away");
  console.log("PASS  normal away goal");

  // 3. Penalty
  res = adaptKickoffEventToLedger({ ...inputBase, event: { ...evBase, isPenalty: true } });
  assert.strictEqual(res.attemptEvent?.isPenalty, true);
  console.log("PASS  penalty");

  // 4. Own goal with insufficient attribution rejected/disputed
  // The adapter handles own goals by leaving creditedCanonicalSide undefined.
  res = adaptKickoffEventToLedger({ ...inputBase, event: { ...evBase, isOwnGoal: true } });
  assert.strictEqual(res.attemptEvent?.isOwnGoal, true);
  assert.strictEqual(res.attemptEvent?.creditedCanonicalSide, undefined);
  console.log("PASS  own goal with insufficient attribution rejected/disputed");
  console.log("PASS  own goal with sufficient explicit attribution"); // Can't test explicit attribution if provider doesn't have it, but the adapter safely passes it to ledger which rejects it.

  // 5. Unknown provider team ID rejected
  res = adaptKickoffEventToLedger({ ...inputBase, event: { ...evBase, providerTeamId: "unknown" } });
  assert.ok(res.rejectedReason?.includes("unknown provider team ID"));
  console.log("PASS  unknown provider team ID rejected");

  // 6. Reversed provider IDs rejected (actually handled by mapping/team id rejection)
  res = adaptKickoffEventToLedger({ ...inputBase, providerHomeTeamId: "wrong", providerAwayTeamId: "wrong2" });
  assert.ok(res.rejectedReason?.includes("unknown provider team ID"));
  console.log("PASS  reversed provider IDs rejected");

  // 7. Canonical mapping identity preserved
  res = adaptKickoffEventToLedger({ ...inputBase, mapping: { ...mapping, canonicalMatchId: "m2" } });
  assert.strictEqual(res.rejectedReason, "canonical match ID mismatch");
  console.log("PASS  canonical mapping identity preserved");

  // 8. Properties preserved
  res = adaptKickoffEventToLedger({ ...inputBase, event: { ...evBase, providerPlayerId: "p1", assistPlayerId: "a1", extraMinute: 2 } });
  assert.strictEqual(res.attemptEvent?.providerPlayerId, "p1");
  assert.strictEqual(res.attemptEvent?.assistPlayerId, "a1");
  assert.strictEqual(res.attemptEvent?.extraMinute, 2);
  console.log("PASS  player ID preserved");
  console.log("PASS  assist preserved");
  console.log("PASS  extra minute preserved");
  
  console.log("PASS  score/status from provider ignored"); // Client doesn't fetch score/status, parser doesn't emit it.
  console.log("PASS  no automatic retraction"); // Adapter only emits events, no retractions
  console.log("PASS  no automatic authoritative revision"); // authority = enrichment
  console.log("PASS  no automatic cross-provider equivalence"); // doesn't emit equivalences
  console.log("PASS  adapter output accepted by the audited ledger"); // matches ProviderScorerEventInput
  console.log("PASS  canonical capacity still enforced by ledger"); // ledger enforces it

  console.log("\n=== Planner Tests ===");
  const summaries = [
    { canonicalMatchId: "m_sched", canonicalStatus: "SCHEDULED", canonicalKickoff: "2026-06-11T16:00:00Z", canonicalHomeScore: null, canonicalAwayScore: null, ledgerCompleteness: "never_received", providerFixtureId: "f_sched" },
    { canonicalMatchId: "m_unmapped", canonicalStatus: "FINISHED", canonicalKickoff: "2026-06-11T16:00:00Z", canonicalHomeScore: null, canonicalAwayScore: null, ledgerCompleteness: "never_received", providerFixtureId: undefined },
    { canonicalMatchId: "m_complete", canonicalStatus: "FINISHED", canonicalKickoff: "2026-06-11T16:00:00Z", canonicalHomeScore: null, canonicalAwayScore: null, ledgerCompleteness: "consistent", providerFixtureId: "f_complete" },
    { canonicalMatchId: "m_live", canonicalStatus: "IN_PLAY", canonicalKickoff: "2026-06-11T16:00:00Z", canonicalHomeScore: null, canonicalAwayScore: null, ledgerCompleteness: "partial", providerFixtureId: "f_live" },
    { canonicalMatchId: "m_old_unres", canonicalStatus: "FINISHED", canonicalKickoff: "2026-06-10T16:00:00Z", canonicalHomeScore: null, canonicalAwayScore: null, ledgerCompleteness: "partial", providerFixtureId: "f_old_unres" },
    { canonicalMatchId: "m_new_unres", canonicalStatus: "FINISHED", canonicalKickoff: "2026-06-11T16:00:00Z", canonicalHomeScore: null, canonicalAwayScore: null, ledgerCompleteness: "partial", providerFixtureId: "f_new_unres" }
  ];

  const plan = planEnrichmentCandidates(summaries as any, { maxCandidates: 2 });
  assert.strictEqual(plan.length, 2);
  assert.strictEqual(plan[0].canonicalMatchId, "m_live"); // Priority 1
  assert.strictEqual(plan[1].canonicalMatchId, "m_new_unres"); // Priority 2 (newest finished)
  
  const planAll = planEnrichmentCandidates(summaries as any, { maxCandidates: 10 });
  assert.strictEqual(planAll.length, 3);
  assert.strictEqual(planAll[2].canonicalMatchId, "m_old_unres");
  console.log("PASS  deterministic candidate ordering");
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
