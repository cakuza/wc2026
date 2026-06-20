/**
 * Durable cross-instance regression-baseline tests (final merge gate, Blocker 1).
 *
 * The acceptance gate must reject a regression even on a BRAND-NEW serverless
 * instance with empty module memory, by consulting the DURABLE validated baseline
 * stored in the shared Data Cache. A "fresh instance" is simulated by resetting
 * module memory AND clearing the provider sub-caches (so the rebuild does fresh
 * provider fetches), while PRESERVING the durable snapshot + baseline keys in the
 * shared store — exactly what a new instance reading the cross-instance Data Cache
 * sees.
 *
 * Fail-before/pass-after: on the pre-Blocker-1 branch the gate compared only
 * against module memory (null on a fresh instance), so instance B would persist a
 * regressed candidate. These tests reproduce that and prove the durable baseline
 * fixes it.
 *
 *   npx tsx --tsconfig tsconfig.test.json scripts/test-durable-baseline-cache.ts
 */
import assert from "assert";
import { MemoryCacheAdapter, setCacheAdapter } from "../lib/cacheAdapter";
import {
  getTournamentLiveSnapshot,
  resetLiveSnapshotMemoryForTests,
} from "../lib/liveSnapshot";
import { MATCHES, matchSlug } from "../lib/matches";

const adapter = new MemoryCacheAdapter();
setCacheAdapter(adapter);
process.env.FOOTBALL_DATA_API_KEY = "mock-test-key";
process.env.NEXT_RUNTIME = "nodejs";

const targetMatch = MATCHES[0];
const providerId = targetMatch.providerIds?.footballData as number;
const targetSlug = matchSlug(targetMatch);

let failPrimary = false;
let primaryMock = new Map<number, any>();
let secondaryMock: any[] = [];

const originalFetch = globalThis.fetch;
globalThis.fetch = async (input: RequestInfo | URL) => {
  const url = input.toString();
  if (url.includes("worldcup26.ir")) {
    if (secondaryMock.length === 0) throw new Error("secondary unavailable");
    return { ok: true, json: async () => secondaryMock } as Response;
  }
  if (url.includes("api.football-data.org")) {
    if (failPrimary || primaryMock.size === 0) throw new Error("primary fail");
    return { ok: true, json: async () => ({ matches: [...primaryMock.values()] }) } as Response;
  }
  return originalFetch(input as any);
};

// FINISHED scoreline in BOTH providers (the secondary score wins for FINISHED
// matches, so both must agree), with secondary scorer events for the baseline.
function setFinished(home: number, away: number, withScorers = true) {
  primaryMock = new Map([[providerId, { id: providerId, status: "FINISHED", score: { fullTime: { home, away } } }]]);
  const homeScorers = withScorers ? `{${Array.from({ length: home }, (_, i) => `"Player H${i} ${10 + i}'"`).join(",")}}` : "{}";
  const awayScorers = withScorers ? `{${Array.from({ length: away }, (_, i) => `"Player A${i} ${60 + i}'"`).join(",")}}` : "{}";
  secondaryMock = [{ id: "f995fc1d", home_team_name_en: "Mexico", away_team_name_en: "South Africa", home_score: home, away_score: away, home_scorers: homeScorers, away_scorers: awayScorers, finished: true }];
  failPrimary = false;
}

// A single stale/partial provider: primary reports the match still LIVE 1-0, the
// secondary is unavailable. (The QA-feared "technically healthy but stale" state.)
function setStaleLive(home: number, away: number) {
  primaryMock = new Map([[providerId, { id: providerId, status: "IN_PLAY", score: { fullTime: { home, away } } }]]);
  secondaryMock = [];
  failPrimary = false;
}

function builtKey(): string | undefined {
  return [...adapter.store.keys()].find((k) => k.includes("worldcup-built-snapshot"));
}
function baselineStored(): any {
  return adapter.store.get([...adapter.store.keys()].find((k) => k.includes("worldcup-validated-baseline")) || "");
}

// Simulate a brand-new serverless instance: empty module memory + fresh provider
// fetches (clear provider sub-caches), but the durable snapshot/baseline survive.
function freshInstance() {
  resetLiveSnapshotMemoryForTests();
  for (const k of [...adapter.store.keys()]) {
    if (k.includes("primary-live-data") || k.includes("bulk-secondary")) adapter.store.delete(k);
  }
}

// Full reset including the durable store (a clean world).
function resetWorld() {
  adapter.store.clear();
  resetLiveSnapshotMemoryForTests();
}

let passed = 0, failed = 0;
async function test(name: string, fn: () => Promise<void>) {
  try { await fn(); console.log(`  PASS  ${name}`); passed++; }
  catch (e: any) { console.error(`  FAIL  ${name}\n        ${e.message}`); failed++; }
}

async function primeInstanceA(home = 4, away = 1) {
  resetWorld();
  setFinished(home, away);
  const a = await getTournamentLiveSnapshot();
  assert.strictEqual(a.matches[targetSlug].status, "FINISHED", "instance A FINISHED");
  assert.strictEqual(a.matches[targetSlug].homeScore, home, `instance A ${home}-${away}`);
  assert.ok(a.matches[targetSlug].scorers.length > 0, "instance A has scorer events (secondary mapped)");
  assert.ok(baselineStored(), "durable baseline written by instance A");
  return a;
}

async function main() {
  console.log("=== Durable cross-instance baseline tests ===\n");

  // CORE cross-process scenario from the spec.
  await test("1. A=FINISHED 4-1; fresh B sees stale LIVE 1-0 + secondary down → B rejects; durable stays 4-1; third reader sees 4-1", async () => {
    const a = await primeInstanceA(4, 1);

    // Instance B: empty module memory, one stale provider (LIVE 1-0), other down.
    freshInstance();
    setStaleLive(1, 0);
    const b = await getTournamentLiveSnapshot();
    assert.strictEqual(b.matches[targetSlug].status, "FINISHED", "B served FINISHED, not the stale LIVE candidate");
    assert.strictEqual(b.matches[targetSlug].homeScore, 4, "B served 4, regression to 1 rejected");
    assert.strictEqual(b.snapshotId, a.snapshotId, "B served the previous durable validated snapshot");
    assert.strictEqual(adapter.store.get(builtKey()!).matches[targetSlug].homeScore, 4, "durable validated cache remains 4-1 (no poisoning)");
    assert.strictEqual(baselineStored().matches[targetSlug].homeScore, 4, "durable baseline remains 4-1");

    // Third independent reader (fresh instance, providers unavailable).
    freshInstance();
    failPrimary = true; secondaryMock = [];
    const c = await getTournamentLiveSnapshot();
    assert.strictEqual(c.matches[targetSlug].homeScore, 4, "third reader receives FINISHED 4-1");
    assert.strictEqual(c.matches[targetSlug].status, "FINISHED", "third reader status FINISHED");
  });

  // 2. score decrease across fresh instances.
  await test("2. fresh instance rejects a score decrease (4-1 → 2-1)", async () => {
    await primeInstanceA(4, 1);
    freshInstance();
    setFinished(2, 1);
    const b = await getTournamentLiveSnapshot();
    assert.strictEqual(b.matches[targetSlug].homeScore, 4, "score decrease rejected; durable 4-1 served");
    assert.strictEqual(baselineStored().matches[targetSlug].homeScore, 4, "durable baseline not regressed");
  });

  // 3. FINISHED regression across fresh instances (FINISHED → SCHEDULED).
  await test("3. fresh instance rejects FINISHED → SCHEDULED regression", async () => {
    await primeInstanceA(4, 1);
    freshInstance();
    // Primary returns the match as SCHEDULED again, secondary down.
    primaryMock = new Map([[providerId, { id: providerId, status: "SCHEDULED", score: { fullTime: { home: null, away: null } } }]]);
    secondaryMock = [{ id: "z", home_team_name_en: "Brazil", away_team_name_en: "Serbia", home_score: 1, away_score: 0, home_scorers: `{"X 5'"}`, away_scorers: "{}", finished: false }];
    const b = await getTournamentLiveSnapshot();
    assert.strictEqual(b.matches[targetSlug].status, "FINISHED", "FINISHED preserved; SCHEDULED regression rejected");
    assert.strictEqual(b.matches[targetSlug].homeScore, 4, "score preserved");
  });

  // 4. scorer (and derived Top Scorers) disappearance across fresh instances.
  await test("4. fresh instance rejects scorer/Top-Scorer disappearance", async () => {
    const a = await primeInstanceA(4, 1);
    assert.ok(a.topScorers.length > 0 || Object.values(a.matches).some((m) => m.scorers.length > 0), "baseline has scorer evidence");
    freshInstance();
    // Same 4-1 FINISHED but with NO scorer events (secondary finished+score+no
    // scorers is discarded; primary carries no goals) → scorers vanish.
    primaryMock = new Map([[providerId, { id: providerId, status: "FINISHED", score: { fullTime: { home: 4, away: 1 } } }]]);
    secondaryMock = [{ id: "f995fc1d", home_team_name_en: "Mexico", away_team_name_en: "South Africa", home_score: 4, away_score: 1, home_scorers: "{}", away_scorers: "{}", finished: true }];
    const b = await getTournamentLiveSnapshot();
    assert.ok(b.matches[targetSlug].scorers.length > 0, "scorer disappearance rejected; durable scorers preserved");
  });

  // 5. legitimate forward advancement accepted across fresh instances (4-1 → 5-1).
  await test("5. fresh instance ACCEPTS a legitimate forward advancement (4-1 → 5-1)", async () => {
    await primeInstanceA(4, 1);
    freshInstance();
    setFinished(5, 1);
    const b = await getTournamentLiveSnapshot();
    assert.strictEqual(b.matches[targetSlug].homeScore, 5, "advanced 5-1 accepted");
    assert.strictEqual(adapter.store.get(builtKey()!).matches[targetSlug].homeScore, 5, "durable validated cache advanced to 5-1");
    assert.strictEqual(baselineStored().matches[targetSlug].homeScore, 5, "durable baseline advanced to 5-1");
  });

  // 6. concurrent fresh refreshes: single-flight, no duplicate validated write, no deadlock.
  await test("6. concurrent refreshes on a fresh instance are single-flight and never deadlock", async () => {
    await primeInstanceA(4, 1);
    freshInstance();
    setStaleLive(1, 0);
    const results = await Promise.all([
      getTournamentLiveSnapshot(), getTournamentLiveSnapshot(), getTournamentLiveSnapshot(),
    ]);
    assert.ok(results.every((r) => r.matches[targetSlug].homeScore === 4), "all concurrent readers get the durable 4-1");
    assert.strictEqual(results[0], results[1], "concurrent calls collapse to one object (single-flight)");
    assert.strictEqual(adapter.store.get(builtKey()!).matches[targetSlug].homeScore, 4, "no duplicate/regressed validated write");
  });

  globalThis.fetch = originalFetch;
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();
