import assert from "assert";
import { isMatchInReconciliationWindow, POST_MATCH_RECONCILIATION_WINDOW_MS } from "../lib/scoreReconciliation";

function runTests() {
  console.log("=== Running Reconciliation Window Tests ===\n");
  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void) {
    try {
      fn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (e: any) {
      console.error(`❌ ${name}`);
      console.error(e.message || e);
      failed++;
    }
  }

  const kickoffMs = 1000000000;

  test("1. Live match is always in window", () => {
    assert.strictEqual(isMatchInReconciliationWindow("IN_PLAY", kickoffMs, kickoffMs + POST_MATCH_RECONCILIATION_WINDOW_MS * 2), true);
  });

  test("2. Finished 10 minutes ago (inside window)", () => {
    // Assuming match takes 2 hours, 10 mins ago is kickoff + 2h 10m
    const nowMs = kickoffMs + 2 * 60 * 60 * 1000 + 10 * 60 * 1000;
    assert.strictEqual(isMatchInReconciliationWindow("FINISHED", kickoffMs, nowMs), true);
  });

  test("3. Finished just inside the boundary (1 ms before)", () => {
    const nowMs = kickoffMs + POST_MATCH_RECONCILIATION_WINDOW_MS - 1;
    assert.strictEqual(isMatchInReconciliationWindow("FINISHED", kickoffMs, nowMs), true);
  });

  test("4. Finished exactly on the boundary", () => {
    const nowMs = kickoffMs + POST_MATCH_RECONCILIATION_WINDOW_MS;
    assert.strictEqual(isMatchInReconciliationWindow("FINISHED", kickoffMs, nowMs), true);
  });

  test("5. Finished just outside the boundary (1 ms after)", () => {
    const nowMs = kickoffMs + POST_MATCH_RECONCILIATION_WINDOW_MS + 1;
    assert.strictEqual(isMatchInReconciliationWindow("FINISHED", kickoffMs, nowMs), false);
  });

  test("6. Old completed match (well outside window)", () => {
    const nowMs = kickoffMs + POST_MATCH_RECONCILIATION_WINDOW_MS + 24 * 60 * 60 * 1000; // + 1 day
    assert.strictEqual(isMatchInReconciliationWindow("FINISHED", kickoffMs, nowMs), false);
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}

runTests();
