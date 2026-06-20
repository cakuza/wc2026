/**
 * Degraded-snapshot cache-poisoning tests (Phase 5).
 *
 * A provider-degraded "schedule shell" (both providers fail → every match reads
 * back as SCHEDULED) must never be accepted, persisted, or served as a validated
 * live snapshot. These tests exercise the production read path (NEXT_RUNTIME set +
 * the in-repo cache adapter standing in for the Vercel Data Cache) with all
 * network mocked, and the acceptance gate `isCacheableValidatedSnapshot` directly.
 *
 * Several of these FAIL on the pre-fix branch (which caches the degraded shell as
 * validated) and PASS after the acceptance gate is added.
 *
 *   npx tsx --tsconfig tsconfig.test.json scripts/test-degraded-snapshot-cache.ts
 */
import assert from "assert";
import { MemoryCacheAdapter, setCacheAdapter } from "../lib/cacheAdapter";
import {
  getTournamentLiveSnapshot,
  isCacheableValidatedSnapshot,
  resetLiveSnapshotMemoryForTests,
  type TournamentLiveSnapshot,
} from "../lib/liveSnapshot";
import { MATCHES, matchSlug } from "../lib/matches";

const adapter = new MemoryCacheAdapter();
setCacheAdapter(adapter);
process.env.FOOTBALL_DATA_API_KEY = "mock-test-key";
process.env.NEXT_RUNTIME = "nodejs"; // enable the shared-cache read path

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
    if (secondaryMock.length === 0) throw new Error("secondary empty");
    return { ok: true, json: async () => secondaryMock } as Response;
  }
  if (url.includes("api.football-data.org")) {
    if (failPrimary || primaryMock.size === 0) throw new Error("primary fail");
    return { ok: true, json: async () => ({ matches: [...primaryMock.values()] }) } as Response;
  }
  return originalFetch(input as any);
};

// targetMatch (MATCHES[0]) is Mexico–South Africa, which maps to the secondary
// worldcup26 game; for a FINISHED match the secondary score takes precedence over
// the primary, so a score change must be reflected in BOTH providers to land.
function setFinalScore(home: number, away: number) {
  primaryMock = new Map([[providerId, { id: providerId, status: "FINISHED", score: { fullTime: { home, away } } }]]);
  secondaryMock = [{
    id: "f995fc1d", home_team_name_en: "Mexico", away_team_name_en: "South Africa",
    home_score: home, away_score: away, home_scorers: `{"Player A 10'"}`, away_scorers: `{}`, finished: true,
  }];
}

function healthyMocks() {
  setFinalScore(2, 0);
  failPrimary = false;
}

// Clear the provider sub-caches (and in-process memory) so a rebuild has NO stale
// provider data to fall back on — i.e. a genuinely degraded both-down state.
// Leaves any validated-snapshot key intact.
function clearProviderCaches() {
  for (const k of [...adapter.store.keys()]) {
    if (!k.includes("worldcup-built-snapshot")) adapter.store.delete(k);
  }
  coldInstance();
}

function coldInstance() {
  // Truly fresh instance: no retained raw provider memory, no last-known-good.
  resetLiveSnapshotMemoryForTests();
}

function resetAll() {
  adapter.store.clear();
  coldInstance();
  healthyMocks();
}

function builtKeys(): string[] {
  return [...adapter.store.keys()].filter((k) => k.includes("worldcup-built-snapshot"));
}

let passed = 0, failed = 0;
async function test(name: string, fn: () => Promise<void>) {
  try { await fn(); console.log(`  PASS  ${name}`); passed++; }
  catch (e: any) { console.error(`  FAIL  ${name}\n        ${e.message}`); failed++; }
}

// ── Gate unit-test fixtures ──────────────────────────────────────────────────
function snap(partial: Partial<TournamentLiveSnapshot>): TournamentLiveSnapshot {
  return {
    snapshotId: "x", generatedAt: "", updatedAt: "",
    matches: {}, liveDataByProviderId: {}, standingsByGroup: {},
    thirdPlaceRanking: [], tournamentStats: {} as any, teamLeaderboards: {} as any,
    topScorers: [], primaryProviderOk: true, secondaryProviderOk: true,
    primaryProviderFetchedAt: "t", secondaryProviderFetchedAt: "t",
    ...partial,
  } as TournamentLiveSnapshot;
}
function mm(status: string, homeScore: number | null, awayScore: number | null, scorers: any[] = []) {
  return { status, homeScore, awayScore, scorers } as any;
}

async function main() {
  console.log("=== Degraded-snapshot cache-poisoning tests ===\n");

  // 1 — empty cache + both providers fail → truthful fallback, NO validated write.
  await test("1. cold cache + both providers fail → isFallback, no validated-cache write, elapsed match not SCHEDULED", async () => {
    resetAll();
    failPrimary = true; secondaryMock = [];
    coldInstance();
    const s = await getTournamentLiveSnapshot();
    assert.strictEqual(s.isFallback, true, "degraded provider state must return the truthful fallback, never a validated all-SCHEDULED shell");
    assert.strictEqual(builtKeys().length, 0, "the degraded shell must NOT be written to the validated shared cache");
    const past = s.matches[targetSlug] ?? s.matches["switzerland-vs-bosnia-jun18"];
    if (past) assert.notStrictEqual(past.status === "SCHEDULED" && past.liveDataUnavailable !== true, true,
      "an elapsed match is never presented as genuinely SCHEDULED");
  });

  // 2 — empty cache + providers recover → validated snapshot produced and cached.
  await test("2. cold cache + providers healthy → validated snapshot produced and cached", async () => {
    resetAll();
    const s = await getTournamentLiveSnapshot();
    assert.notStrictEqual(s.isFallback, true, "healthy providers produce a validated (non-fallback) snapshot");
    assert.strictEqual(s.matches[targetSlug].status, "FINISHED", "real provider status present");
    assert.strictEqual(s.matches[targetSlug].homeScore, 2, "real provider score present");
    const keys = builtKeys();
    assert.strictEqual(keys.length > 0, true, "validated snapshot committed to the shared cache");
    assert.notStrictEqual(adapter.store.get(keys[0]).isFallback, true, "the cached value is validated, never a fallback");
  });

  // 3 — validated exists + both fail → previous served, NO overwrite, honest staleness.
  await test("3. validated snapshot exists + both providers fail → previous served, no overwrite, freshness unchanged (honestly stale)", async () => {
    resetAll();
    const good = await getTournamentLiveSnapshot();
    const goodId = good.snapshotId;
    const key = builtKeys()[0];
    const goodCached = adapter.store.get(key);
    assert.notStrictEqual(good.isFallback, true, "primed a validated snapshot");

    // Fresh instance (no raw memory / no last-known-good / no stale provider
    // sub-caches) but the durable validated snapshot survives; now both fail.
    clearProviderCaches();
    failPrimary = true; secondaryMock = [];
    const served = await getTournamentLiveSnapshot();

    assert.notStrictEqual(served.isFallback, true, "served the validated snapshot, not a fallback");
    assert.strictEqual(served.snapshotId, goodId, "served the PREVIOUS validated snapshot");
    assert.strictEqual(adapter.store.get(key), goodCached, "durable validated snapshot was NOT overwritten by the degraded build");
    assert.strictEqual(served.primaryProviderFetchedAt, good.primaryProviderFetchedAt, "freshness carries the old successful fetchedAt (honestly aging, no false fresh-sync)");
  });

  // 4 — FINISHED cannot regress to SCHEDULED (gate unit test).
  await test("4. acceptance gate rejects FINISHED → SCHEDULED regression", async () => {
    const prev = snap({ matches: { a: mm("FINISHED", 2, 0) }, primaryProviderOk: true });
    const cand = snap({ matches: { a: mm("SCHEDULED", null, null) }, primaryProviderOk: true });
    assert.strictEqual(isCacheableValidatedSnapshot(cand, prev), false, "FINISHED must never regress to SCHEDULED");
    assert.strictEqual(isCacheableValidatedSnapshot(prev, prev), true, "an equal FINISHED snapshot is still cacheable");
  });

  // 5 — score cannot decrease (gate unit test).
  await test("5. acceptance gate rejects a score decrease", async () => {
    const prev = snap({ matches: { a: mm("FINISHED", 2, 1) }, primaryProviderOk: true });
    const lower = snap({ matches: { a: mm("FINISHED", 1, 1) }, primaryProviderOk: true });
    const higher = snap({ matches: { a: mm("FINISHED", 3, 1) }, primaryProviderOk: true });
    assert.strictEqual(isCacheableValidatedSnapshot(lower, prev), false, "score must never decrease");
    assert.strictEqual(isCacheableValidatedSnapshot(higher, prev), true, "a higher score is a legitimate progression");
  });

  // 6 — scorers / standings / Top Scorers cannot disappear (gate unit test).
  await test("6. acceptance gate rejects scorers / standings / Top Scorers disappearing on a refresh", async () => {
    const scorer = { playerName: "A", teamName: "X", minute: 10 } as any;
    const prev = snap({
      matches: { a: mm("FINISHED", 2, 0, [scorer, scorer]) },
      topScorers: [{ playerName: "A", teamName: "X", goals: 2 }] as any,
      standingsByGroup: { A: [{ played: 1 } as any] },
      primaryProviderOk: true,
    });
    const noScorers = snap({ matches: { a: mm("FINISHED", 2, 0, []) }, topScorers: [{ playerName: "A", teamName: "X", goals: 2 }] as any, standingsByGroup: { A: [{ played: 1 } as any] }, primaryProviderOk: true });
    const noTop = snap({ matches: { a: mm("FINISHED", 2, 0, [scorer, scorer]) }, topScorers: [], standingsByGroup: { A: [{ played: 1 } as any] }, primaryProviderOk: true });
    const noStandings = snap({ matches: { a: mm("FINISHED", 2, 0, [scorer, scorer]) }, topScorers: [{ playerName: "A", teamName: "X", goals: 2 }] as any, standingsByGroup: { A: [{ played: 0 } as any] }, primaryProviderOk: true });
    assert.strictEqual(isCacheableValidatedSnapshot(noScorers, prev), false, "known scorer events must not vanish");
    assert.strictEqual(isCacheableValidatedSnapshot(noTop, prev), false, "Top Scorers must not be wiped by a degraded refresh");
    assert.strictEqual(isCacheableValidatedSnapshot(noStandings, prev), false, "played standings must not collapse to zero");
  });

  // 6b — intrinsic gate: degraded / fallback candidates are never cacheable.
  await test("6b. acceptance gate rejects both-providers-down and fallback candidates outright", async () => {
    const bothDown = snap({ matches: { a: mm("SCHEDULED", null, null) }, primaryProviderOk: false, secondaryProviderOk: false });
    const fallback = snap({ isFallback: true, primaryProviderOk: false, secondaryProviderOk: false });
    const onlySecondary = snap({ matches: { a: mm("FINISHED", 1, 0) }, primaryProviderOk: false, secondaryProviderOk: true });
    assert.strictEqual(isCacheableValidatedSnapshot(bothDown, null), false, "both providers unhealthy ⇒ never validated");
    assert.strictEqual(isCacheableValidatedSnapshot(fallback, null), false, "a fallback is never validated");
    assert.strictEqual(isCacheableValidatedSnapshot(onlySecondary, null), true, "one healthy provider with real data is validatable");
  });

  // 7 — the validated-cache reader never yields a fallback.
  await test("7. fallback is never present under the validated shared-cache key", async () => {
    resetAll();
    failPrimary = true; secondaryMock = [];
    coldInstance();
    const s = await getTournamentLiveSnapshot();
    assert.strictEqual(s.isFallback, true, "served a fallback to the caller");
    for (const k of builtKeys()) {
      assert.notStrictEqual(adapter.store.get(k).isFallback, true, `validated cache key ${k} must never hold a fallback`);
    }
  });

  // 8 — concurrent failed refreshes stay single-flight.
  await test("8. concurrent degraded refreshes are single-flight (collapse to one fallback)", async () => {
    resetAll();
    failPrimary = true; secondaryMock = [];
    coldInstance();
    const [a, b, c] = await Promise.all([
      getTournamentLiveSnapshot(), getTournamentLiveSnapshot(), getTournamentLiveSnapshot(),
    ]);
    assert.strictEqual(a, b, "concurrent degraded calls share one object");
    assert.strictEqual(b, c, "concurrent degraded calls share one object");
    assert.strictEqual(a.isFallback, true, "the shared object is the truthful fallback");
    assert.strictEqual(builtKeys().length, 0, "no validated write under concurrency");
  });

  // 9 — a rejected background refresh creates no unhandled rejection.
  await test("9. rejected after()-backed background refresh produces no unhandled rejection", async () => {
    const rejections: unknown[] = [];
    const onRej = (e: unknown) => rejections.push(e);
    process.on("unhandledRejection", onRej);
    resetAll();
    failPrimary = true; secondaryMock = [];
    coldInstance();
    await getTournamentLiveSnapshot();
    await new Promise((r) => setTimeout(r, 80)); // let after()/microtasks settle
    process.off("unhandledRejection", onRej);
    assert.strictEqual(rejections.length, 0, "no unhandled rejection from the rejected degraded refresh");
  });

  // 10 — a later successful refresh replaces stale validated data monotonically.
  await test("10. later successful refresh replaces stale validated data monotonically; a regressed refresh is rejected", async () => {
    resetAll();
    const good = await getTournamentLiveSnapshot(); // 2-0
    assert.strictEqual(good.matches[targetSlug].homeScore, 2, "primed 2-0");

    // Providers recover with an advanced (higher) score in BOTH sources.
    setFinalScore(3, 0);
    adapter.store.clear();
    const advanced = await getTournamentLiveSnapshot();
    assert.strictEqual(advanced.matches[targetSlug].homeScore, 3, "advanced score accepted into the validated snapshot");
    assert.notStrictEqual(advanced.snapshotId, good.snapshotId, "validated snapshot was replaced");

    // A regressed refresh (lower score) is rejected; last validated is preserved.
    setFinalScore(1, 0);
    adapter.store.clear();
    const afterRegress = await getTournamentLiveSnapshot();
    assert.strictEqual(afterRegress.matches[targetSlug].homeScore, 3, "regressed score rejected — last validated (3-0) preserved");
  });

  // 11 — the public API surfaces the degraded state honestly.
  await test("11. /api/live-snapshot exposes the degraded state honestly (isFallback + liveDataUnavailable)", async () => {
    resetAll();
    failPrimary = true; secondaryMock = [];
    coldInstance();
    const { GET } = await import("../app/api/live-snapshot/route");
    const body = await (await GET()).json();
    assert.strictEqual(body.isFallback, true, "API exposes isFallback under provider degradation");
    const vals = Object.values(body.matches) as any[];
    assert.strictEqual(vals.every((m) => "liveDataUnavailable" in m), true, "API exposes per-match liveDataUnavailable");
    assert.strictEqual(vals.every((m) => m.homeScore === null && m.awayScore === null && m.scorers.length === 0), true, "API fabricates no score/scorer in the degraded state");
  });

  globalThis.fetch = originalFetch;
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();
