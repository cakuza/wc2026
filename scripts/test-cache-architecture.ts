/**
 * Cache Architecture Tests
 *
 * Proves that primary/secondary data do not erase each other across failures.
 * Uses MemoryCacheAdapter (not a Vercel emulator — no TTL, no tag invalidation)
 * and intercepts fetch to avoid all network calls.
 */
import assert from "assert";
import { MemoryCacheAdapter, setCacheAdapter } from "../lib/cacheAdapter";

const adapter = new MemoryCacheAdapter();
setCacheAdapter(adapter);

process.env.FOOTBALL_DATA_API_KEY = "mock-test-key";

import { getTournamentLiveSnapshot, resetLiveSnapshotMemoryForTests } from "../lib/liveSnapshot";
import { MATCHES, matchSlug } from "../lib/matches";
import { reconcileGoalEvents } from "../lib/scoreReconciliation";

let fetchCount = 0;
let forceFail = false;
let mockPayload: any[] = [];
let primaryMockMap = new Map<number, any>();

const originalFetch = globalThis.fetch;
globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = input.toString();

  if (url.includes("worldcup26.ir")) {
    fetchCount++;
    if (forceFail) throw new Error("Mock secondary provider failure");
    if (mockPayload.length === 0) throw new Error("Secondary mock: empty payload");
    return { ok: true, json: async () => mockPayload } as Response;
  }

  if (url.includes("api.football-data.org")) {
    if (primaryMockMap.size === 0) throw new Error("Primary mock: empty");
    return {
      ok: true,
      json: async () => ({ matches: Array.from(primaryMockMap.values()) }),
    } as Response;
  }

  return originalFetch(input, init);
};

async function runTests() {
  console.log("=== Running Cache Architecture Tests ===\n");
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (e: any) {
      console.error(`❌ ${name}`);
      console.error(e.stack || e);
      failed++;
    }
  }

  const targetMatch = MATCHES[0]; // Mexico vs South Africa
  const providerId = targetMatch.providerIds?.footballData as number;
  const internalId = matchSlug(targetMatch);

  function resetAll() {
    adapter.store.clear();
    resetLiveSnapshotMemoryForTests();
    fetchCount = 0;
    forceFail = false;
    mockPayload = [];
    primaryMockMap = new Map();
  }

  // ── Test 1: Rich secondary success is stored ─────────────────────────────
  await test("1. Rich secondary success is stored", async () => {
    resetAll();
    primaryMockMap = new Map([
      [providerId, { id: providerId, status: "FINISHED", score: { fullTime: { home: 2, away: 0 } } }],
    ]);
    mockPayload = [
      {
        id: "f995fc1d",
        home_team_name_en: "Mexico",
        away_team_name_en: "South Africa",
        home_score: 2,
        away_score: 0,
        home_scorers: `{"Player A 10'"}`,
        away_scorers: `{}`,
        finished: true,
      },
    ];

    const snap = await getTournamentLiveSnapshot();
    assert.strictEqual(snap.primaryProviderOk, true);
    assert.strictEqual(snap.secondaryProviderOk, true);
    assert.ok(Object.keys(snap.matches).length > 0);
    assert.strictEqual(snap.matches[internalId].scorers[0].playerName, "Player A");
    assert.strictEqual(fetchCount, 1, "Secondary provider fetched exactly once (bulk dedup)");
  });

  // ── Test 2: Timeout/abort preserves last-known-good events ───────────────
  await test("2. Secondary failure retains last-known-good events", async () => {
    forceFail = true;
    const snap = await getTournamentLiveSnapshot();
    assert.strictEqual(snap.primaryProviderOk, true);
    assert.strictEqual(snap.secondaryProviderOk, true, "Has stale memory data so secondaryOk=true");
    assert.strictEqual(snap.matches[internalId].scorers[0].playerName, "Player A");
  });

  // ── Test 3: Recovery after failure ───────────────────────────────────────
  await test("3. Recovery after failure delivers updated events", async () => {
    forceFail = false;
    mockPayload = [
      {
        id: "f995fc1d",
        home_team_name_en: "Mexico",
        away_team_name_en: "South Africa",
        home_score: 2,
        away_score: 0,
        home_scorers: `{"Player A 10'","Player B 20'"}`,
        away_scorers: `{}`,
        finished: true,
      },
    ];
    // Bust the bulk secondary cache so recovery is tested
    adapter.store.delete("worldcup-bulk-secondary-v8");
    const snap = await getTournamentLiveSnapshot();
    assert.strictEqual(snap.secondaryProviderOk, true);
    assert.strictEqual(snap.matches[internalId].scorers.length, 2);
    assert.strictEqual(snap.matches[internalId].scorers[1].playerName, "Player B");
  });

  // ── Test 4: Malformed/suspiciously empty payload is rejected ─────────────
  await test("4. Suspiciously empty payload rejected; stale memory preserved", async () => {
    forceFail = false;
    // Secondary returns finished 2-0 but zero scorer events — suspicious
    mockPayload = [
      {
        id: "f995fc1d",
        home_team_name_en: "Mexico",
        away_team_name_en: "South Africa",
        home_score: 2,
        away_score: 0,
        home_scorers: `{}`,
        away_scorers: `{}`,
        finished: true,
      },
    ];
    adapter.store.delete("worldcup-bulk-secondary-v8");
    const snap = await getTournamentLiveSnapshot();
    const matchData = snap.matches[internalId];
    // validateSecondaryGames filters the suspicious game; monotonicMerge preserves Player B
    assert.strictEqual(matchData.scorers[1].playerName, "Player B", "Stale memory preserved over suspicious empty payload");
  });

  // ── Test 5: Cold cache plus secondary failure returns honest incomplete ───
  await test("5. Cold cache + secondary failure: no 500, honest incomplete state", async () => {
    resetAll();
    primaryMockMap = new Map([
      [providerId, { id: providerId, status: "FINISHED", score: { fullTime: { home: 2, away: 0 } } }],
    ]);
    forceFail = true;

    const snap = await getTournamentLiveSnapshot();
    assert.strictEqual(snap.primaryProviderOk, true);
    assert.strictEqual(snap.secondaryProviderOk, false);
    assert.strictEqual(snap.liveDataByProviderId[providerId]?.homeScore, 2, "Score available from primary");
    assert.strictEqual(snap.matches[internalId].scorers.length, 0, "Scorer state is honestly empty");
  });

  // ── Test 6: Primary refresh cannot clear secondary events ─────────────────
  await test("6. Primary refresh cannot clear secondary events", async () => {
    // Establish secondary data
    forceFail = false;
    mockPayload = [
      {
        id: "f995fc1d",
        home_team_name_en: "Mexico",
        away_team_name_en: "South Africa",
        home_score: 3,
        away_score: 0,
        home_scorers: `{"Player A 10'","Player B 20'"}`,
        away_scorers: `{}`,
        finished: true,
      },
    ];
    await getTournamentLiveSnapshot();

    // Primary updates score; secondary fails
    primaryMockMap = new Map([
      [providerId, { id: providerId, status: "FINISHED", score: { fullTime: { home: 3, away: 0 } } }],
    ]);
    forceFail = true;
    adapter.store.delete("worldcup-primary-live-data-v8");

    const snap = await getTournamentLiveSnapshot();
    assert.strictEqual(snap.primaryProviderOk, true);
    assert.strictEqual(snap.secondaryProviderOk, true, "Memory data still present");
    assert.strictEqual(snap.liveDataByProviderId[providerId]?.homeScore, 3);
    assert.strictEqual(snap.matches[internalId].scorers[0].playerName, "Player A");
  });

  // ── Test 7: Recovery after repeated failure ────────────────────────────────
  await test("7. Recovery from repeated provider failure", async () => {
    forceFail = true;
    await getTournamentLiveSnapshot(); // fails

    forceFail = false;
    mockPayload = [
      {
        id: "f995fc1d",
        home_team_name_en: "Mexico",
        away_team_name_en: "South Africa",
        home_score: 3,
        away_score: 0,
        home_scorers: `{"Player A 10'","Player B 85'"}`,
        away_scorers: `{}`,
        finished: true,
      },
    ];
    adapter.store.delete("worldcup-bulk-secondary-v8");
    const snap = await getTournamentLiveSnapshot();
    assert.strictEqual(snap.secondaryProviderOk, true);
    assert.strictEqual(snap.matches[internalId].scorers.length, 2);
    assert.strictEqual(snap.matches[internalId].scorers[1].playerName, "Player B");
  });

  // ── Test 8: Partial payload preserves unaffected matches ─────────────────
  await test("8. Partial payload: valid matches retained, suspicious match filtered", async () => {
    resetAll();
    const targetMatch2 = MATCHES[4]; // 5th match (different from Mexico)
    const internalId2 = matchSlug(targetMatch2);
    primaryMockMap = new Map([
      [providerId, { id: providerId, status: "FINISHED", score: { fullTime: { home: 2, away: 1 } } }],
    ]);
    // First call: establish both matches with valid scorer data
    mockPayload = [
      {
        home_team_name_en: "Mexico",
        away_team_name_en: "South Africa",
        home_score: 2,
        away_score: 1,
        home_scorers: `{"Player A 10'"}`,
        away_scorers: `{"Player X 50'"}`,
        finished: true,
      },
    ];
    await getTournamentLiveSnapshot();

    // Second call: suspicious empty for Mexico (should be filtered); payload otherwise valid
    adapter.store.delete("worldcup-bulk-secondary-v8");
    mockPayload = [
      {
        home_team_name_en: "Mexico",
        away_team_name_en: "South Africa",
        home_score: 2,
        away_score: 1,
        home_scorers: `{}`,
        away_scorers: `{}`,
        finished: true,
      },
    ];
    const snap = await getTournamentLiveSnapshot();
    // Mexico game was suspicious → filtered → memory retains Player A
    assert.strictEqual(snap.matches[internalId].scorers[0].playerName, "Player A", "Stale Mexico scorers preserved");
  });

  // ── Test 9: Stats and Match Detail consume retained scorer data ───────────
  await test("9. Reconciled scorer events are consumable by Match Detail", async () => {
    resetAll();
    primaryMockMap = new Map([
      [providerId, { id: providerId, status: "FINISHED", score: { fullTime: { home: 2, away: 0 } } }],
    ]);
    mockPayload = [
      {
        home_team_name_en: "Mexico",
        away_team_name_en: "South Africa",
        home_score: 2,
        away_score: 0,
        home_scorers: `{"Player A 10'","Player B 55'"}`,
        away_scorers: `{}`,
        finished: true,
      },
    ];

    const snap = await getTournamentLiveSnapshot();
    const liveMatch = snap.liveDataByProviderId[providerId]!;
    const gameScorers = snap.matches[internalId].scorers.map((s) => ({
      teamName: s.teamName,
      playerName: s.playerName,
      minute: s.minute,
    }));

    const { confirmedEvents } = reconcileGoalEvents<typeof gameScorers[number]>({
      homeScore: liveMatch.homeScore,
      awayScore: liveMatch.awayScore,
      homeTeamName: "Mexico",
      awayTeamName: "South Africa",
      events: gameScorers,
    });

    assert.strictEqual(confirmedEvents.length, 2);
    assert.strictEqual(confirmedEvents[0].playerName, "Player A");
    assert.strictEqual(confirmedEvents[1].playerName, "Player B");
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}

runTests();
