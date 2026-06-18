
import fs from "fs";
const env = fs.readFileSync(".env", "utf8");
env.split("\n").forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
});

import assert from "node:assert";
import "./mock-server-only";
import { buildTournamentLiveSnapshot } from "../lib/liveSnapshot";
import { setCacheAdapter, MemoryCacheAdapter } from "../lib/cacheAdapter";
import { MATCHES, matchSlug, matchUtcDate } from "../lib/matches";
import { countryName } from "../lib/i18n";
import type { LiveMatchData } from "../lib/liveMatchData";

// Pin Date.now so live-window logic treats Mexico vs SA as recently finished.
Date.now = () => Date.parse("2026-06-11T20:00:00Z");

const TEST_MATCH_ID = 537327; // Mexico vs South Africa
const TEST_MATCH = MATCHES.find(m => m.providerIds?.footballData === TEST_MATCH_ID)!;
const TEST_MATCH_INTERNAL = matchSlug(TEST_MATCH);
const TEST_MATCH_IDX = MATCHES.findIndex(m => m.providerIds?.footballData === TEST_MATCH_ID);

// ── Fake network layer ─────────────────────────────────────────────────────────

let globalFetchCount = 0;
let fetchMode = "DISABLED";

function getFakeFixtures() {
  if (fetchMode === "MAPPING_FAIL") {
    // Return only 1 fixture that won't map to any canonical match → gate fails
    return [{ id: "fix_unmapped", kickoffTimestamp: "2026-06-11T19:00:00Z",
               home: { id: "hX", name: "Unknown Team A" },
               away: { id: "aX", name: "Unknown Team B" } }];
  }
  // Valid: return one fake fixture per canonical match so the 72-fixture gate passes.
  return MATCHES.map((m, i) => {
    let id = "fix_" + i;
    // Override fixture IDs for the three known-override slugs used by the mapping test.
    if (matchSlug(m) === "austria-vs-jordan-jun16")   id = "1489382";
    if (matchSlug(m) === "turkey-vs-paraguay-jun19")  id = "1539006";
    if (matchSlug(m) === "tunisia-vs-japan-jun20")    id = "1489394";
    return {
      id,
      kickoffTimestamp: matchUtcDate(m).toISOString(),
      home: { id: "h" + i, name: countryName(m.homeKey, "en") || m.homeKey },
      away: { id: "a" + i, name: countryName(m.awayKey, "en") || m.awayKey },
    };
  });
}

function getFakeEvents(): string {
  const idx = TEST_MATCH_IDX;
  switch (fetchMode) {
    case "TIMEOUT":
    case "NETWORK_ERROR":
    case "HTTP_429":
      return "";      // never reached (thrown / response-status-handled before body read)
    case "INVALID_PAYLOAD":
      return "[bad-json}";
    case "EMPTY":
      return "[]";
    case "PARTIAL":
      return JSON.stringify([
        { id: "e1", type: "Goal", detail: "Normal Goal", minute: 15,
          player: { id: "p1", name: "Kickoff Scorer 1" }, teamId: "h" + idx },
      ]);
    case "OWN_GOAL":
      return JSON.stringify([
        { id: "e1", type: "Goal", detail: "Own Goal", minute: 10,
          player: { id: "p1", name: "Own Scorer" }, teamId: "h" + idx },
      ]);
    case "SUCCESS":
    default:
      return JSON.stringify([
        { id: "e1", type: "Goal", detail: "Normal Goal", minute: 15,
          player: { id: "p1", name: "Kickoff Scorer 1" }, teamId: "h" + idx },
        { id: "e2", type: "Goal", detail: "Normal Goal", minute: 45,
          player: { id: "p2", name: "Kickoff Scorer 2" }, teamId: "h" + idx },
      ]);
  }
}

const originalFetch = globalThis.fetch;
globalThis.fetch = async (url: string | URL | Request, init?: RequestInit) => {
  const urlStr = url.toString();

  if (urlStr.includes("api.kickoffapi.com/api/v1/fixtures")) {
    globalFetchCount++;
    return new Response(JSON.stringify(getFakeFixtures()), { status: 200 });
  }

  if (urlStr.includes("api.kickoffapi.com/api/v1/events")) {
    globalFetchCount++;
    if (fetchMode === "TIMEOUT") {
      const err = new Error("The operation was aborted"); err.name = "AbortError"; throw err;
    }
    if (fetchMode === "NETWORK_ERROR") {
      throw new Error("network down");
    }
    if (fetchMode === "HTTP_429") {
      return new Response("", { status: 429 });
    }
    return new Response(getFakeEvents(), { status: 200 });
  }

  // Any other URL: return empty success so non-kickoff calls don't break.
  return new Response("[]", { status: 200 });
};

// ── Scenario runner ────────────────────────────────────────────────────────────

type Overrides = {
  envSwitch?: string;
  envKey?: string;
  status?: string;
  homeScore?: number;
  awayScore?: number;
  baselineGoals?: Array<{ type: string; minute: number; teamName: string; playerName: string; isOwnGoal?: boolean }>;
};

async function runScenario(
  name: string,
  mode: string,
  overrides: Overrides,
  assertions: (snap: Awaited<ReturnType<typeof buildTournamentLiveSnapshot>>) => void
): Promise<void> {
  fetchMode = mode;
  globalFetchCount = 0;

  if (overrides.envSwitch !== undefined) process.env.KICKOFF_SCORER_ENABLED = overrides.envSwitch;
  if (overrides.envKey !== undefined) process.env.KICKOFF_API_KEY = overrides.envKey;

  // Fresh cache so every scenario starts cold — no inter-scenario bleed.
  setCacheAdapter(new MemoryCacheAdapter());

  const liveData = new Map<number, LiveMatchData>();
  liveData.set(TEST_MATCH_ID, {
    provider: "football-data.org",
    providerMatchId: TEST_MATCH_ID,
    status: (overrides.status ?? "FINISHED") as any,
    homeScore: overrides.homeScore ?? 3,
    awayScore: overrides.awayScore ?? 0,
    winner: "HOME_TEAM",
    lastSyncedAt: new Date().toISOString(),
    eventDataAvailable: true,
    goals: overrides.baselineGoals !== undefined
      ? (overrides.baselineGoals as any[])
      : [
          { type: "GOAL", minute: 10, teamName: "Mexico", playerName: "Baseline Scorer 1" },
          { type: "GOAL", minute: 80, teamName: "Mexico", playerName: "Baseline Scorer 2" },
        ],
  } as LiveMatchData);

  const snap = await buildTournamentLiveSnapshot({ liveData, worldcupGames: [] });

  try {
    assertions(snap);
    console.log(`  PASS  ${name}`);
  } catch (err: any) {
    console.error(`  FAIL  ${name}: ${err.message}`);
    throw err;
  }
}

// ── Test suite ─────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

async function scenario(
  name: string,
  mode: string,
  overrides: Overrides,
  assertions: (snap: any) => void
): Promise<void> {
  try {
    await runScenario(name, mode, overrides, assertions);
    passed++;
  } catch {
    failed++;
  }
}

async function run(): Promise<void> {
  console.log("=== KickoffAPI Runtime Integration Tests ===\n");

  // ── Kill switch matrix ───────────────────────────────────────────────────────
  console.log("--- Kill switch matrix ---");

  await scenario(
    "kill-switch: all-off (switch=false, no key) → zero requests, baseline preserved",
    "DISABLED",
    { envSwitch: "false", envKey: "" },
    snap => {
      assert.strictEqual(globalFetchCount, 0, "No HTTP requests when fully disabled");
      const m = snap.matches[TEST_MATCH_INTERNAL];
      assert.strictEqual(Reflect.get(m, "_activeScorerSource"), undefined,
        "_activeScorerSource must not be set when disabled");
      assert(m.scorers.some((s: any) => s.playerName === "Baseline Scorer 1"),
        "Baseline scorers must be preserved when disabled");
    }
  );

  await scenario(
    "kill-switch: switch=false + key present → zero requests",
    "DISABLED",
    { envSwitch: "false", envKey: "fake-key" },
    snap => {
      assert.strictEqual(globalFetchCount, 0, "No HTTP requests when switch is off");
      const m = snap.matches[TEST_MATCH_INTERNAL];
      assert.strictEqual(Reflect.get(m, "_activeScorerSource"), undefined);
      assert(m.scorers.some((s: any) => s.playerName === "Baseline Scorer 1"), "Baseline preserved");
    }
  );

  await scenario(
    "kill-switch: switch=true + no key → zero requests",
    "DISABLED",
    { envSwitch: "true", envKey: "" },
    snap => {
      assert.strictEqual(globalFetchCount, 0, "No HTTP requests when API key is absent");
      const m = snap.matches[TEST_MATCH_INTERNAL];
      assert.strictEqual(Reflect.get(m, "_activeScorerSource"), undefined);
      assert(m.scorers.some((s: any) => s.playerName === "Baseline Scorer 1"), "Baseline preserved");
    }
  );

  // ── Enabled: enrichment succeeds ─────────────────────────────────────────────
  console.log("\n--- Enabled + enrichment ---");

  await scenario(
    "enabled: fixture+event requests occur, _activeScorerSource assigned naturally by runtime",
    "SUCCESS",
    { envSwitch: "true", envKey: "fake-key" },
    snap => {
      assert(globalFetchCount >= 2, `Expected fixture+event requests, got ${globalFetchCount}`);
      const m = snap.matches[TEST_MATCH_INTERNAL];
      assert.strictEqual(Reflect.get(m, "_activeScorerSource"), "kickoffapi",
        "Runtime must assign _activeScorerSource='kickoffapi' after natural adoption — not manually seeded");
      assert.strictEqual(m.scorers[0].playerName, "Kickoff Scorer 1", "Kickoff scorer adopted");
    }
  );

  await scenario(
    "enrichment improves empty baseline: 0→2 scorers, _activeScorerSource assigned naturally",
    "SUCCESS",
    { envSwitch: "true", envKey: "fake-key", homeScore: 2, awayScore: 0, baselineGoals: [] },
    snap => {
      const m = snap.matches[TEST_MATCH_INTERNAL];
      assert.strictEqual(Reflect.get(m, "_activeScorerSource"), "kickoffapi",
        "Runtime naturally assigns source when kickoff improves empty baseline");
      assert.strictEqual(m.scorers.length, 2, "2 kickoff scorers adopted into empty baseline");
      assert.strictEqual(m.scorers[0].playerName, "Kickoff Scorer 1");
      assert.strictEqual(m.scorers[1].playerName, "Kickoff Scorer 2");
    }
  );

  // ── No blind concatenation ───────────────────────────────────────────────────
  console.log("\n--- No blind concatenation ---");

  await scenario(
    "no-concatenation: kickoff replaces baseline entirely — baseline names absent after adoption",
    "SUCCESS",
    { envSwitch: "true", envKey: "fake-key" },
    snap => {
      const m = snap.matches[TEST_MATCH_INTERNAL];
      const names: string[] = m.scorers.map((s: any) => s.playerName);
      assert(!names.includes("Baseline Scorer 1"),
        "Baseline Scorer 1 must NOT appear after kickoff adoption (no concatenation)");
      assert(!names.includes("Baseline Scorer 2"),
        "Baseline Scorer 2 must NOT appear after kickoff adoption (no concatenation)");
      assert(names.includes("Kickoff Scorer 1"), "Kickoff Scorer 1 must appear");
      assert(names.includes("Kickoff Scorer 2"), "Kickoff Scorer 2 must appear");
      assert.strictEqual(m.scorers.length, 2, "Exactly 2 scorers: kickoff only, no concatenation");
    }
  );

  // ── Canonical score/status immutability ──────────────────────────────────────
  console.log("\n--- Canonical immutability ---");

  await scenario(
    "score immutable: homeScore/awayScore unchanged after enrichment",
    "SUCCESS",
    { envSwitch: "true", envKey: "fake-key", homeScore: 3, awayScore: 0 },
    snap => {
      const m = snap.matches[TEST_MATCH_INTERNAL];
      assert.strictEqual(m.homeScore, 3, "football-data homeScore must not change after enrichment");
      assert.strictEqual(m.awayScore, 0, "football-data awayScore must not change after enrichment");
    }
  );

  await scenario(
    "status immutable: FINISHED status unchanged after enrichment",
    "SUCCESS",
    { envSwitch: "true", envKey: "fake-key" },
    snap => {
      const m = snap.matches[TEST_MATCH_INTERNAL];
      assert.strictEqual(m.status, "FINISHED",
        "Canonical status must not be mutated by kickoff enrichment");
    }
  );

  // ── Mapping gate ─────────────────────────────────────────────────────────────
  console.log("\n--- Mapping gate ---");

  await scenario(
    "mapping-gate-fail: <72 fixtures mapped → enrichment aborts, only 1 fixture request, baseline preserved",
    "MAPPING_FAIL",
    { envSwitch: "true", envKey: "fake-key" },
    snap => {
      assert.strictEqual(globalFetchCount, 1,
        "Only the fixture fetch should occur when mapping gate fails (no event requests)");
      const m = snap.matches[TEST_MATCH_INTERNAL];
      assert.strictEqual(Reflect.get(m, "_activeScorerSource"), undefined,
        "No adoption when mapping gate fails");
      assert(m.scorers.some((s: any) => s.playerName === "Baseline Scorer 1"),
        "Baseline preserved when mapping gate fails");
    }
  );

  // ── Adoption blocked by count ─────────────────────────────────────────────────
  console.log("\n--- Adoption count gate ---");

  await scenario(
    "adoption-blocked: 0 kickoff events < 2 baseline → no adoption, baseline preserved",
    "EMPTY",
    { envSwitch: "true", envKey: "fake-key" },
    snap => {
      const m = snap.matches[TEST_MATCH_INTERNAL];
      assert.strictEqual(Reflect.get(m, "_activeScorerSource"), undefined,
        "No adoption when kickoff yields 0 scorers vs 2 baseline");
      assert(m.scorers.some((s: any) => s.playerName === "Baseline Scorer 1"),
        "Baseline preserved when kickoff count < baseline count");
      assert.strictEqual(m.scorers.length, 2, "Baseline count unchanged");
    }
  );

  await scenario(
    "adoption-blocked: 1 kickoff event < 2 baseline → no adoption, baseline preserved",
    "PARTIAL",
    { envSwitch: "true", envKey: "fake-key" },
    snap => {
      const m = snap.matches[TEST_MATCH_INTERNAL];
      assert.strictEqual(Reflect.get(m, "_activeScorerSource"), undefined,
        "No adoption when kickoff yields fewer scorers than baseline");
      assert(m.scorers.some((s: any) => s.playerName === "Baseline Scorer 1"),
        "Baseline preserved when kickoff is partial");
      assert.strictEqual(m.scorers.length, 2, "Baseline count unchanged");
    }
  );

  // ── Failure mode preservation ─────────────────────────────────────────────────
  console.log("\n--- Failure mode preservation ---");

  await scenario(
    "failure-timeout: AbortError on events fetch → baseline preserved, no adoption",
    "TIMEOUT",
    { envSwitch: "true", envKey: "fake-key" },
    snap => {
      const m = snap.matches[TEST_MATCH_INTERNAL];
      assert.strictEqual(Reflect.get(m, "_activeScorerSource"), undefined,
        "No adoption on timeout");
      assert(m.scorers.some((s: any) => s.playerName === "Baseline Scorer 1"),
        "Baseline preserved on timeout");
    }
  );

  await scenario(
    "failure-network: network error on events fetch → baseline preserved, no adoption",
    "NETWORK_ERROR",
    { envSwitch: "true", envKey: "fake-key" },
    snap => {
      const m = snap.matches[TEST_MATCH_INTERNAL];
      assert.strictEqual(Reflect.get(m, "_activeScorerSource"), undefined,
        "No adoption on network error");
      assert(m.scorers.some((s: any) => s.playerName === "Baseline Scorer 1"),
        "Baseline preserved on network error");
    }
  );

  await scenario(
    "failure-429: rate limit on events fetch → baseline preserved, no adoption",
    "HTTP_429",
    { envSwitch: "true", envKey: "fake-key" },
    snap => {
      const m = snap.matches[TEST_MATCH_INTERNAL];
      assert.strictEqual(Reflect.get(m, "_activeScorerSource"), undefined,
        "No adoption on rate limit");
      assert(m.scorers.some((s: any) => s.playerName === "Baseline Scorer 1"),
        "Baseline preserved on 429");
    }
  );

  await scenario(
    "failure-invalid-payload: malformed JSON from events → baseline preserved, no adoption",
    "INVALID_PAYLOAD",
    { envSwitch: "true", envKey: "fake-key" },
    snap => {
      const m = snap.matches[TEST_MATCH_INTERNAL];
      assert.strictEqual(Reflect.get(m, "_activeScorerSource"), undefined,
        "No adoption on invalid payload");
      assert(m.scorers.some((s: any) => s.playerName === "Baseline Scorer 1"),
        "Baseline preserved on invalid payload");
    }
  );

  // ── Own goal non-inference ────────────────────────────────────────────────────
  console.log("\n--- Own goal non-inference ---");

  await scenario(
    "own-goal: no creditedCanonicalSide → ledger rejects → 0 accepted < 2 baseline → no adoption",
    "OWN_GOAL",
    { envSwitch: "true", envKey: "fake-key" },
    snap => {
      const m = snap.matches[TEST_MATCH_INTERNAL];
      assert.strictEqual(Reflect.get(m, "_activeScorerSource"), undefined,
        "No adoption when the only kickoff event is an own goal (rejected by ledger)");
      assert(!m.scorers.some((s: any) => s.playerName === "Own Scorer"),
        "Kickoff own-goal scorer must not appear in output");
      assert(m.scorers.some((s: any) => s.playerName === "Baseline Scorer 1"),
        "Baseline preserved when kickoff own goal rejected");
      // Critically: no own-goal scorer should have an inferred playerTeamName
      assert(!m.scorers.some((s: any) => s.isOwnGoal && s.playerTeamName),
        "No own-goal scorer may have an inferred playerTeamName");
    }
  );

  // ── Scheduled match skip ──────────────────────────────────────────────────────
  console.log("\n--- Candidate selection ---");

  await scenario(
    "scheduled-skip: SCHEDULED match not a candidate → only fixture request, no event request",
    "SUCCESS",
    { envSwitch: "true", envKey: "fake-key", status: "SCHEDULED" },
    snap => {
      assert.strictEqual(globalFetchCount, 1,
        "Only fixture fetch for SCHEDULED match; events must not be requested");
      const m = snap.matches[TEST_MATCH_INTERNAL];
      assert.strictEqual(Reflect.get(m, "_activeScorerSource"), undefined,
        "SCHEDULED match must never receive kickoff enrichment");
    }
  );

  // ── Complete FINISHED match skip ──────────────────────────────────────────────

  const completeBaselineGoals = [
    { type: "GOAL", minute: 10, teamName: "Mexico", playerName: "Complete Scorer 1" },
    { type: "GOAL", minute: 55, teamName: "Mexico", playerName: "Complete Scorer 2" },
  ];

  await scenario(
    "complete-finished-skip: FINISHED + missingGoalEventCount=0 → only fixture request, baseline preserved",
    "SUCCESS",
    {
      envSwitch: "true", envKey: "fake-key",
      homeScore: 2, awayScore: 0,
      baselineGoals: completeBaselineGoals,
    },
    snap => {
      assert.strictEqual(globalFetchCount, 1,
        "Only fixture fetch for fully resolved FINISHED match (no events request needed)");
      const m = snap.matches[TEST_MATCH_INTERNAL];
      assert.strictEqual(Reflect.get(m, "_activeScorerSource"), undefined,
        "Complete FINISHED match must not be enriched");
      assert(m.scorers.some((s: any) => s.playerName === "Complete Scorer 1"),
        "Baseline preserved for complete FINISHED match");
    }
  );

  // ── No secrets in serialized output ──────────────────────────────────────────
  console.log("\n--- Secret hygiene ---");

  const SECRET_KEY = "SECRET-API-KEY-DO-NOT-LEAK-1234567890";
  await scenario(
    "no-secrets: KICKOFF_API_KEY value must not appear in serialized snapshot",
    "SUCCESS",
    { envSwitch: "true", envKey: SECRET_KEY },
    snap => {
      const json = JSON.stringify(snap);
      assert(!json.includes(SECRET_KEY),
        "API key must not be embedded in the serialized snapshot output");
    }
  );

  // ── Summary ───────────────────────────────────────────────────────────────────

  console.log(`\n${"─".repeat(60)}`);
  console.log(`KickoffAPI runtime integration: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
