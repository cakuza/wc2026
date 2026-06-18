
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
import { MATCHES } from "../lib/matches";
import type { LiveMatchData } from "../lib/liveMatchData";

// Mexico vs South Africa (provider ID 537327) — a real canonical match.
const TEST_MATCH_ID = 537327;

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>): Promise<void> {
  return Promise.resolve(fn()).then(
    () => { console.log(`  PASS  ${name}`); passed++; },
    (err: any) => { console.error(`  FAIL  ${name}: ${err.message}`); failed++; }
  );
}

async function run(): Promise<void> {
  console.log("=== KickoffAPI Stats Integration Tests ===\n");

  // Keep kickoff disabled for all stats tests — we're testing computeTournamentStats
  // behaviour, not the enrichment layer.
  process.env.KICKOFF_SCORER_ENABLED = "false";
  delete process.env.KICKOFF_API_KEY;

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function makeLiveData(overrides: Partial<LiveMatchData> = {}): Map<number, LiveMatchData> {
    const m = new Map<number, LiveMatchData>();
    m.set(TEST_MATCH_ID, {
      provider: "football-data.org",
      providerMatchId: TEST_MATCH_ID,
      status: "FINISHED",
      homeScore: 1,
      awayScore: 0,
      winner: "HOME_TEAM",
      lastSyncedAt: new Date().toISOString(),
      eventDataAvailable: true,
      goals: [{ type: "GOAL", minute: 10, teamName: "Mexico", playerName: "Player A" }],
      ...overrides,
    } as LiveMatchData);
    return m;
  }

  async function buildSnap(liveData: Map<number, LiveMatchData>) {
    setCacheAdapter(new MemoryCacheAdapter());
    return buildTournamentLiveSnapshot({ liveData, worldcupGames: [] });
  }

  // ── matchesPlayed: only FINISHED matches count ───────────────────────────────
  console.log("--- matchesPlayed ---");

  await test("matchesPlayed=1 for one FINISHED match", async () => {
    const snap = await buildSnap(makeLiveData({ status: "FINISHED", homeScore: 1, awayScore: 0 }));
    assert.strictEqual(snap.tournamentStats.matchesPlayed, 1);
  });

  await test("matchesPlayed=0 for one IN_PLAY (live) match", async () => {
    const snap = await buildSnap(makeLiveData({
      status: "IN_PLAY",
      homeScore: 1, awayScore: 0,
      goals: [{ type: "GOAL", minute: 23, teamName: "Mexico", playerName: "Player A" } as any],
    }));
    assert.strictEqual(snap.tournamentStats.matchesPlayed, 0,
      "IN_PLAY match must not increment matchesPlayed");
  });

  await test("matchesPlayed=0 for one SCHEDULED match", async () => {
    const snap = await buildSnap(makeLiveData({ status: "SCHEDULED", homeScore: null as any, awayScore: null as any, goals: [] }));
    assert.strictEqual(snap.tournamentStats.matchesPlayed, 0,
      "SCHEDULED match must not increment matchesPlayed");
  });

  // ── totalGoals: derived from canonical FINISHED scores, not scorer event count ─
  console.log("\n--- totalGoals ---");

  await test("totalGoals matches canonical score sum (2+1=3)", async () => {
    const snap = await buildSnap(makeLiveData({
      homeScore: 2, awayScore: 1,
      goals: [
        { type: "GOAL", minute: 10, teamName: "Mexico", playerName: "A" },
        { type: "GOAL", minute: 45, teamName: "Mexico", playerName: "B" },
        { type: "GOAL", minute: 70, teamName: "South Africa", playerName: "C" },
      ] as any,
    }));
    assert.strictEqual(snap.tournamentStats.totalGoals, 3,
      "totalGoals must equal homeScore+awayScore of the canonical FINISHED match");
  });

  await test("totalGoals=0 when no FINISHED matches", async () => {
    const snap = await buildSnap(makeLiveData({ status: "IN_PLAY", homeScore: 2, awayScore: 0 }));
    assert.strictEqual(snap.tournamentStats.totalGoals, 0);
  });

  // ── scorerTotalsComplete ──────────────────────────────────────────────────────
  console.log("\n--- scorerTotalsComplete ---");

  await test("scorerTotalsComplete=true when all scorer events match canonical score", async () => {
    // 1 goal, 1 scorer event → complete
    const snap = await buildSnap(makeLiveData({
      homeScore: 1, awayScore: 0,
      goals: [{ type: "GOAL", minute: 10, teamName: "Mexico", playerName: "Player A" } as any],
    }));
    assert.ok(snap.tournamentStats.scorerTotalsComplete,
      "scorerTotalsComplete must be true when missingGoalEventCount=0 for all FINISHED matches");
  });

  await test("scorerTotalsComplete=false when scorer events are fewer than canonical score", async () => {
    // 2 goals in score, only 1 scorer event supplied → missingGoalEventCount=1
    const snap = await buildSnap(makeLiveData({
      homeScore: 2, awayScore: 0,
      goals: [{ type: "GOAL", minute: 10, teamName: "Mexico", playerName: "Player A" } as any],
    }));
    assert.ok(!snap.tournamentStats.scorerTotalsComplete,
      "scorerTotalsComplete must be false when at least one completed match has missing scorer events");
    assert.ok(snap.tournamentStats.completedMatchesWithUnresolvedScorers >= 1,
      "completedMatchesWithUnresolvedScorers must be ≥1");
    assert.ok(snap.tournamentStats.unresolvedCompletedMatchGoals >= 1,
      "unresolvedCompletedMatchGoals must be ≥1");
  });

  await test("scorerTotalsComplete=false when a scorer has low confidence", async () => {
    // eventDataAvailable=false → all goal events are confidence:"low" via completeness check
    const snap = await buildSnap(makeLiveData({
      homeScore: 1, awayScore: 0,
      eventDataAvailable: false,
      goals: [],
    }));
    assert.ok(!snap.tournamentStats.scorerTotalsComplete,
      "scorerTotalsComplete must be false when event data unavailable");
  });

  // ── Summary ───────────────────────────────────────────────────────────────────

  console.log(`\n${"─".repeat(60)}`);
  console.log(`KickoffAPI stats integration: ${passed} passed, ${failed} failed`);

  if (failed > 0) process.exit(1);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
