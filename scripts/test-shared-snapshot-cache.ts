/**
 * Shared snapshot architecture tests (Phase 3 — stale-while-revalidate).
 *
 * Exercises the production read path (NEXT_RUNTIME set + the in-repo cache
 * adapter standing in for the Vercel Data Cache) with all network mocked:
 *  - one shared snapshot is reused across repeated page requests;
 *  - the shared cache key carries no timezone/language;
 *  - concurrent misses collapse onto a single build (single-flight);
 *  - a cold/empty cache returns a prompt, non-fabricated schedule fallback;
 *  - a refresh error serves the last validated snapshot (stale-on-error);
 *  - the fallback never invents scores/scorers/standings;
 *  - schema-version bump produces a distinct cache key.
 *
 *   npx tsx --tsconfig tsconfig.test.json scripts/test-shared-snapshot-cache.ts
 */
import assert from "assert";
import { MemoryCacheAdapter, setCacheAdapter } from "../lib/cacheAdapter";
import {
  getTournamentLiveSnapshot,
  resetLiveSnapshotMemoryForTests,
  SNAPSHOT_SCHEMA_VERSION,
} from "../lib/liveSnapshot";
import { MATCHES, matchSlug, matchUtcDate } from "../lib/matches";

const adapter = new MemoryCacheAdapter();
setCacheAdapter(adapter);
process.env.FOOTBALL_DATA_API_KEY = "mock-test-key";
process.env.NEXT_RUNTIME = "nodejs"; // enable the shared-cache read path

const targetMatch = MATCHES[0];
const providerId = targetMatch.providerIds?.footballData as number;

let fetchDelayMs = 0;
let failPrimary = false;
let primaryMock = new Map<number, any>();
let secondaryMock: any[] = [];

const originalFetch = globalThis.fetch;
globalThis.fetch = async (input: RequestInfo | URL) => {
  const url = input.toString();
  if (fetchDelayMs > 0) await new Promise((r) => setTimeout(r, fetchDelayMs));
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

function resetAll() {
  adapter.store.clear();
  resetLiveSnapshotMemoryForTests();
  fetchDelayMs = 0;
  failPrimary = false;
  primaryMock = new Map([[providerId, { id: providerId, status: "FINISHED", score: { fullTime: { home: 2, away: 0 } } }]]);
  secondaryMock = [{
    id: "f995fc1d", home_team_name_en: "Mexico", away_team_name_en: "South Africa",
    home_score: 2, away_score: 0, home_scorers: `{"Player A 10'"}`, away_scorers: `{}`, finished: true,
  }];
}

let passed = 0, failed = 0;
async function test(name: string, fn: () => Promise<void>) {
  try { await fn(); console.log(`  PASS  ${name}`); passed++; }
  catch (e: any) { console.error(`  FAIL  ${name}\n        ${e.message}`); failed++; }
}

async function main() {
console.log("=== Shared snapshot cache tests ===\n");

await test("1. shared snapshot reused across repeated requests (same snapshotId)", async () => {
  resetAll();
  const a = await getTournamentLiveSnapshot();
  const b = await getTournamentLiveSnapshot();
  assert.strictEqual(a.snapshotId, b.snapshotId, "second request reuses the cached snapshot");
  assert.ok(Object.keys(a.matches).length > 0, "snapshot has matches");
});

await test("2. cache key is independent of timezone/language", async () => {
  // The cache key is a fixed, schema-versioned constant with no tz/lang segment.
  const keys = [...adapter.store.keys()];
  const builtKey = keys.find((k) => k.includes("worldcup-built-snapshot"));
  assert.ok(builtKey, "built-snapshot key present");
  assert.ok(/worldcup-built-snapshot,v\d+$/.test(builtKey!), `key is stable+versioned with no tz/lang (got "${builtKey}")`);
  assert.ok(!/Europe|America|Asia|en|tr|tz=|lang/i.test(builtKey!), "key carries no timezone/language");
});

await test("3. concurrent misses collapse onto one shared snapshot (single-flight)", async () => {
  resetAll();
  const [a, b, c] = await Promise.all([
    getTournamentLiveSnapshot(), getTournamentLiveSnapshot(), getTournamentLiveSnapshot(),
  ]);
  assert.strictEqual(a, b, "concurrent calls share one object");
  assert.strictEqual(b, c, "concurrent calls share one object");
});

await test("4. cold cache returns a prompt TRUTHFUL fallback (no false SCHEDULED, nothing fabricated)", async () => {
  resetAll();
  fetchDelayMs = 2500; // build is slower than COLD_START_FALLBACK_MS (1500ms)
  const t0 = Date.now();
  const snap = await getTournamentLiveSnapshot();
  const elapsed = Date.now() - t0;
  assert.ok(elapsed < 2200, `returned before the slow build completed (${elapsed}ms)`);
  assert.strictEqual(snap.isFallback, true, "snapshot flagged isFallback (non-authoritative)");

  const matchVals = Object.values(snap.matches);
  assert.strictEqual(matchVals.length, MATCHES.length, "fallback contains the full canonical schedule");
  assert.ok(matchVals.every((m: any) => m.homeScore === null && m.awayScore === null), "no fabricated scores");
  assert.ok(matchVals.every((m: any) => m.scorers.length === 0), "no fabricated scorers");

  // A historically-started match (Switzerland–Bosnia, 18 Jun, before the test
  // clock of 20 Jun) must NOT be presented as SCHEDULED — it is flagged unknown.
  const pastMatch = snap.matches["switzerland-vs-bosnia-jun18"];
  assert.ok(pastMatch, "past match present in fallback");
  assert.strictEqual(pastMatch.liveDataUnavailable, true, "started match flagged liveDataUnavailable (never shown as Scheduled)");

  // A genuinely future match keeps its honest SCHEDULED meaning (not flagged).
  const futureMatch = matchVals.find((m: any) => matchUtcDate(m.match).getTime() > Date.now());
  if (futureMatch) assert.notStrictEqual(futureMatch.liveDataUnavailable, true, "future match is not flagged unavailable");

  // Standings + Top Scorers are NOT presented as authoritative.
  assert.strictEqual(snap.topScorers.length, 0, "no fallback Top Scorers presented");
  assert.ok(Object.values(snap.standingsByGroup).flat().every((r) => r.played === 0), "no fabricated standings (all played=0)");
  // Freshness is honestly unavailable — never a 'Last checked' implying a sync.
  assert.strictEqual(snap.primaryProviderOk, false, "primaryProviderOk false");
  assert.strictEqual(snap.primaryProviderFetchedAt, null, "no fetchedAt → no false 'Last checked … ago'");
});

await test("4b. background refresh survives the response and populates the shared cache; next request is validated (no fabricated state)", async () => {
  resetAll();
  fetchDelayMs = 900; // build ≈1.8s (>1.5s) → first request gets the fallback
  const t0 = Date.now();
  const first = await getTournamentLiveSnapshot();
  assert.ok(Date.now() - t0 < 1700, `first request returns promptly (${Date.now() - t0}ms)`);
  assert.strictEqual(first.isFallback, true, "first request served the truthful fallback");

  // The in-flight build keeps running past the (fallback) response and writes the
  // shared cache. Wait for that population (poll the shared key).
  const builtKey = () => [...adapter.store.keys()].some((k) => k.includes("worldcup-built-snapshot"));
  for (let i = 0; i < 40 && !builtKey(); i++) await new Promise((r) => setTimeout(r, 100));
  assert.ok(builtKey(), "background refresh populated the shared cache after the response");

  const second = await getTournamentLiveSnapshot();
  assert.notStrictEqual(second.isFallback, true, "next request reads the VALIDATED snapshot, not another fallback");
  assert.strictEqual(second.matches[matchSlug(targetMatch)].homeScore, 2, "validated provider data present");
  assert.strictEqual(second.matches[matchSlug(targetMatch)].status, "FINISHED", "validated FINISHED status, not fabricated/SCHEDULED");
});

await test("5. refresh error serves the last validated snapshot (stale-on-error)", async () => {
  resetAll();
  const good = await getTournamentLiveSnapshot(); // prime last-known-good
  assert.ok(good.matches[matchSlug(targetMatch)].homeScore === 2, "primed real snapshot");
  // Now force a cold cache + a failing build.
  adapter.store.clear();
  failPrimary = true;
  secondaryMock = [];
  const after = await getTournamentLiveSnapshot();
  assert.strictEqual(after.snapshotId, good.snapshotId, "served the last validated snapshot, did not throw or blank");
});

await test("6. schema-version bump yields a distinct cache key", async () => {
  // Documented invalidation mechanism: the version is part of the key.
  assert.ok(/^v\d+$/.test(SNAPSHOT_SCHEMA_VERSION), `schema version is explicit (got "${SNAPSHOT_SCHEMA_VERSION}")`);
  const keys = [...adapter.store.keys()];
  assert.ok(keys.some((k) => k.endsWith(`,${SNAPSHOT_SCHEMA_VERSION}`)), "current key embeds the schema version");
});

await test("7. served snapshot never regresses FINISHED or decreases a real score", async () => {
  resetAll();
  const finished = await getTournamentLiveSnapshot();
  const m = finished.matches[matchSlug(targetMatch)];
  assert.strictEqual(m.status, "FINISHED");
  assert.strictEqual(m.homeScore, 2);
  // A subsequent cold-cache failure must not downgrade it to SCHEDULED/0.
  adapter.store.clear();
  failPrimary = true; secondaryMock = [];
  const after = await getTournamentLiveSnapshot();
  const m2 = after.matches[matchSlug(targetMatch)];
  assert.strictEqual(m2.status, "FINISHED", "FINISHED preserved on error");
  assert.strictEqual(m2.homeScore, 2, "score not decreased on error");
});

globalThis.fetch = originalFetch;
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
}

main();
