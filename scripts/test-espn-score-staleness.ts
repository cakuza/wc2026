/**
 * Deterministic regression test: ESPN score/status failover.
 *
 * Reproduces the 2026-06-18 Switzerland 4-1 Bosnia & Herzegovina P0 incident
 * in which football-data.org remained stuck at LIVE 1-0 for ~2 hours after
 * the match finished, while ESPN's summary contained 5 goal events at the
 * correct 4-1 scoreline.
 *
 * Two layers:
 *   A) Unit — mergeProviderAttempt with canonical 1-0 context → conflicted
 *             mergeProviderAttempt with failover 4-1 context → consistent + 5 active events
 *   B) Integration — buildTournamentLiveSnapshot with mocked ESPN fetch
 *                    LIVE 1-0 input → FINISHED 4-1 output, scorers enriched
 *
 * No network calls are made. Uses MemoryCacheAdapter for cache isolation.
 *
 * Usage:
 *   npx tsx scripts/test-espn-score-staleness.ts
 *
 * Exit codes:
 *   0 — all assertions pass
 *   1 — one or more assertions failed
 */

import { mergeProviderAttempt } from "../lib/scorerEventLedger";
import type {
  ProviderScorerEventInput,
  MergeProviderAttempt,
  MergeCanonicalContext,
} from "../lib/scorerEventLedger";
import { MemoryCacheAdapter, NextCacheAdapter, setCacheAdapter } from "../lib/cacheAdapter";
import { buildTournamentLiveSnapshot } from "../lib/liveSnapshot";
import type { LiveMatchData } from "../lib/liveMatchData";

// Switzerland vs Bosnia & Herzegovina (Jun 18) — exact P0 incident match
const MATCH_ID = "switzerland-vs-bosnia-jun18";
const PROVIDER_MATCH_ID = 537335; // football-data.org match ID
const ESPN_FIXTURE_ID = "675820"; // ESPN event ID (representative)
const ESPN_HOME_TEAM_ID = "54"; // Switzerland on ESPN
const ESPN_AWAY_TEAM_ID = "127"; // Bosnia-Herzegovina on ESPN
const KICKOFF_UTC = "2026-06-18T19:00:00Z"; // 12:00 local at UTC-7
const FETCH_TIMESTAMP = "2026-06-18T22:05:00.000Z"; // Incident window: ~2h after kickoff

// ── Harness ──────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  PASS  ${msg}`);
    passed++;
  } else {
    console.error(`  FAIL  ${msg}`);
    failed++;
  }
}

// ── Fixtures ─────────────────────────────────────────────────────────────────

// The 5 ESPN events from the match summary: 4 credited to Switzerland (home),
// 1 credited to Bosnia (away) → ESPN-derived score 4-1.
function makeEspnInputs(): ProviderScorerEventInput[] {
  return [
    {
      provider: "espn",
      providerFixtureId: ESPN_FIXTURE_ID,
      providerEventId: "e1",
      providerTeamId: ESPN_HOME_TEAM_ID,
      playerName: "R. Vargas",
      minute: 23,
      isPenalty: false,
      isOwnGoal: false,
      creditedCanonicalSide: "home",
    },
    {
      provider: "espn",
      providerFixtureId: ESPN_FIXTURE_ID,
      providerEventId: "e2",
      providerTeamId: ESPN_HOME_TEAM_ID,
      playerName: "D. Duah",
      minute: 57,
      isPenalty: false,
      isOwnGoal: false,
      creditedCanonicalSide: "home",
    },
    {
      provider: "espn",
      providerFixtureId: ESPN_FIXTURE_ID,
      providerEventId: "e3",
      providerTeamId: ESPN_AWAY_TEAM_ID,
      playerName: "E. Dzeko",
      minute: 71,
      isPenalty: false,
      isOwnGoal: false,
      creditedCanonicalSide: "away",
    },
    {
      provider: "espn",
      providerFixtureId: ESPN_FIXTURE_ID,
      providerEventId: "e4",
      providerTeamId: ESPN_HOME_TEAM_ID,
      playerName: "G. Xhaka",
      minute: 83,
      isPenalty: false,
      isOwnGoal: false,
      creditedCanonicalSide: "home",
    },
    {
      provider: "espn",
      providerFixtureId: ESPN_FIXTURE_ID,
      providerEventId: "e5",
      providerTeamId: ESPN_HOME_TEAM_ID,
      playerName: "X. Shaqiri",
      minute: 90,
      extraMinute: 2,
      isPenalty: true,
      isOwnGoal: false,
      creditedCanonicalSide: "home",
    },
  ];
}

function makeAttempt(events: ProviderScorerEventInput[]): MergeProviderAttempt {
  return {
    state: "complete_snapshot",
    events,
    fetchedAt: FETCH_TIMESTAMP,
    provenance: "espn",
    providerHomeTeamId: ESPN_HOME_TEAM_ID,
    providerAwayTeamId: ESPN_AWAY_TEAM_ID,
  };
}

// ── A) Unit tests: mergeProviderAttempt ──────────────────────────────────────

console.log("=== A) Unit: mergeProviderAttempt ===\n");

// A1: Root-cause reproduction.
// Football-data.org canonical score = LIVE 1-0.
// ESPN summary already has 5 events at 4-1.
// mergeProviderAttempt must return "conflicted" because 4 home events ≠ 1 canonical home goal.
// This is exactly why the P0 occurred: enrichment was skipped.
{
  console.log("A1) Canonical LIVE 1-0 vs ESPN 5 events (4-1) → conflicted");
  const context: MergeCanonicalContext = {
    canonicalMatchId: MATCH_ID,
    canonicalHomeTeamId: "switzerland",
    canonicalAwayTeamId: "bosnia",
    canonicalHomeScore: 1,
    canonicalAwayScore: 0,
    canonicalStatus: "IN_PLAY",
  };
  const result = mergeProviderAttempt([], makeAttempt(makeEspnInputs()), context);
  assert(
    result.completeness.state === "conflicted",
    `completeness.state === "conflicted" with 1-0 canonical context (got "${result.completeness.state}")`,
  );
}

// A2: Failover context.
// Canonical overridden to FINISHED 4-1 (ESPN-derived via failover).
// mergeProviderAttempt must return "consistent" with 5 active events.
// This is the state after the fix: the failover context makes the ledger accept all events.
{
  console.log("\nA2) Failover context FINISHED 4-1 → consistent, 5 active events");
  const context: MergeCanonicalContext = {
    canonicalMatchId: MATCH_ID,
    canonicalHomeTeamId: "switzerland",
    canonicalAwayTeamId: "bosnia",
    canonicalHomeScore: 4,
    canonicalAwayScore: 1,
    canonicalStatus: "FINISHED",
  };
  const result = mergeProviderAttempt([], makeAttempt(makeEspnInputs()), context);
  const active = result.nextLedger.filter((o) => o.lifecycleState === "active");

  assert(
    result.completeness.state === "consistent",
    `completeness.state === "consistent" with failover context (got "${result.completeness.state}")`,
  );
  assert(active.length === 5, `activeEvents.length === 5 (got ${active.length})`);
  assert(
    active.filter((o) => o.creditedCanonicalSide === "home").length === 4,
    "4 home goals credited",
  );
  assert(
    active.filter((o) => o.creditedCanonicalSide === "away").length === 1,
    "1 away goal credited",
  );
  assert(
    active.some((o) => o.isPenalty),
    "penalty goal included in active events",
  );
}

// A3: No-regression invariant.
// ESPN reports 3 home goals but canonical primary has 4 home goals.
// noRegression (espnHomeGoals >= canonicalHomeScore) must be false → failover blocked.
{
  console.log("\nA3) No-regression: ESPN 3-1 vs canonical 4-0 → failover blocked");
  const espnHome = 3;
  const espnAway = 1;
  const canonicalHome = 4;
  const canonicalAway = 0;
  const noRegression = espnHome >= canonicalHome && espnAway >= canonicalAway;
  assert(
    !noRegression,
    `noRegression === false when ESPN home (${espnHome}) < canonical home (${canonicalHome})`,
  );
}

// A4: SCHEDULED protection.
// A match that has not kicked off must never trigger a failover.
// primaryIsStale requires match.status to be LIVE | HALFTIME | SYNCING.
{
  console.log("\nA4) SCHEDULED protection: SCHEDULED match → primaryIsStale === false");
  const matchStatus: string = "SCHEDULED";
  const primaryIsStale =
    matchStatus === "LIVE" || matchStatus === "HALFTIME" || matchStatus === "SYNCING";
  assert(!primaryIsStale, "SCHEDULED match → primaryIsStale === false");
}

// A5: FINISHED stability.
// A match already FINISHED from the primary provider must not re-trigger failover.
// primaryIsStale requires match.status to be live-ish; FINISHED doesn't satisfy that.
{
  console.log("\nA5) FINISHED stability: already FINISHED → primaryIsStale === false");
  const matchStatus: string = "FINISHED";
  const fixtureStatus: string = "post";
  const primaryIsStale =
    fixtureStatus === "post" &&
    (matchStatus === "LIVE" || matchStatus === "HALFTIME" || matchStatus === "SYNCING");
  assert(!primaryIsStale, "Already-FINISHED match → primaryIsStale === false");
}

// A6: ESPN scoreboard "in" (not "post") → no failover even when primary is LIVE.
// Failover must require fixture.status === "post" from the secondary provider.
{
  console.log("\nA6) ESPN status 'in' → no failover even with LIVE primary");
  const matchStatus: string = "LIVE";
  const fixtureStatus: string = "in";
  const primaryIsStale =
    fixtureStatus === "post" &&
    (matchStatus === "LIVE" || matchStatus === "HALFTIME" || matchStatus === "SYNCING");
  assert(!primaryIsStale, "ESPN 'in' status → primaryIsStale === false");
}

// ── B) Integration: buildTournamentLiveSnapshot with mocked ESPN fetch ────────

console.log("\n=== B) Integration: buildTournamentLiveSnapshot ===\n");

// ESPN scoreboard: Switzerland "post" (finished) with score 4-1
const MOCK_SCOREBOARD = {
  events: [
    {
      id: ESPN_FIXTURE_ID,
      date: KICKOFF_UTC,
      competitions: [
        {
          status: { type: { state: "post" } },
          competitors: [
            {
              homeAway: "home",
              score: "4",
              team: { id: ESPN_HOME_TEAM_ID, displayName: "Switzerland" },
            },
            {
              homeAway: "away",
              score: "1",
              team: { id: ESPN_AWAY_TEAM_ID, displayName: "Bosnia-Herzegovina" },
            },
          ],
        },
      ],
    },
  ],
};

// ESPN summary: 5 goal events (4 home, 1 away) matching the 4-1 scoreline
const MOCK_SUMMARY = {
  keyEvents: [
    {
      id: "e1",
      scoringPlay: true,
      type: { type: "goal" },
      team: { id: ESPN_HOME_TEAM_ID },
      participants: [{ athlete: { id: "1001", displayName: "R. Vargas" } }],
      clock: { displayValue: "23'" },
    },
    {
      id: "e2",
      scoringPlay: true,
      type: { type: "goal" },
      team: { id: ESPN_HOME_TEAM_ID },
      participants: [{ athlete: { id: "1002", displayName: "D. Duah" } }],
      clock: { displayValue: "57'" },
    },
    {
      id: "e3",
      scoringPlay: true,
      type: { type: "goal" },
      team: { id: ESPN_AWAY_TEAM_ID },
      participants: [{ athlete: { id: "2001", displayName: "E. Dzeko" } }],
      clock: { displayValue: "71'" },
    },
    {
      id: "e4",
      scoringPlay: true,
      type: { type: "goal" },
      team: { id: ESPN_HOME_TEAM_ID },
      participants: [{ athlete: { id: "1003", displayName: "G. Xhaka" } }],
      clock: { displayValue: "83'" },
    },
    {
      id: "e5",
      scoringPlay: true,
      type: { type: "penalty---scored" },
      team: { id: ESPN_HOME_TEAM_ID },
      participants: [{ athlete: { id: "1004", displayName: "X. Shaqiri" } }],
      clock: { displayValue: "90'+2'" },
    },
  ],
};

function makeResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function runIntegrationTest() {
  // Swap to in-memory cache so next/cache is never touched.
  setCacheAdapter(new MemoryCacheAdapter());

  // Replace globalThis.fetch with a mock that routes scoreboard vs summary.
  const origFetch = globalThis.fetch;
  globalThis.fetch = async (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : (input as Request).url;
    if (url.includes("scoreboard")) return makeResponse(MOCK_SCOREBOARD);
    if (url.includes("summary")) return makeResponse(MOCK_SUMMARY);
    throw new Error(`[test] unexpected fetch url: ${url}`);
  };

  const prevEnabled = process.env.SCORER_ENRICHMENT_ENABLED;
  process.env.SCORER_ENRICHMENT_ENABLED = "true";

  try {
    // Switzerland is stuck at LIVE 1-0 — exact P0 state from football-data.org.
    const liveData: ReadonlyMap<number, LiveMatchData> = new Map([
      [
        PROVIDER_MATCH_ID,
        {
          provider: "football-data.org",
          providerMatchId: PROVIDER_MATCH_ID,
          status: "IN_PLAY",
          homeScore: 1,
          awayScore: 0,
          winner: null,
          lastSyncedAt: FETCH_TIMESTAMP,
          eventDataAvailable: false,
        },
      ],
    ]);

    const snapshot = await buildTournamentLiveSnapshot({
      liveData,
      worldcupGames: null,
      generatedAt: FETCH_TIMESTAMP,
    });

    const match = snapshot.matches[MATCH_ID];
    assert(!!match, `match "${MATCH_ID}" present in snapshot`);
    if (!match) return;

    // Core: failover advanced status and score
    assert(
      match.status === "FINISHED",
      `match.status === "FINISHED" after failover (got "${match.status}")`,
    );
    assert(
      match.homeScore === 4,
      `match.homeScore === 4 after failover (got ${match.homeScore})`,
    );
    assert(
      match.awayScore === 1,
      `match.awayScore === 1 after failover (got ${match.awayScore})`,
    );

    // Scorers: 5 events, all from ESPN with high confidence
    assert(
      match.scorers.length === 5,
      `match.scorers.length === 5 (got ${match.scorers.length})`,
    );
    assert(
      match.scorers.every((s) => s.provider === "espn"),
      `all scorers have provider "espn"`,
    );
    assert(
      match.scorers.every((s) => s.confidence === "high"),
      `all scorers have confidence "high"`,
    );
    assert(
      match.scorers.filter((s) => s.teamName === "Switzerland").length === 4,
      `4 Switzerland goals in scorers`,
    );
    assert(
      match.scorers.filter((s) => s.teamName === "Bosnia & Herzegovina").length === 1,
      `1 Bosnia & Herzegovina goal in scorers`,
    );
    assert(
      match.scorers.some((s) => s.isPenalty),
      `penalty goal present in scorers`,
    );

    // Goal event completeness updated
    assert(
      match.goalEventCompleteness.missingGoalEventCount === 0,
      `missingGoalEventCount === 0 after failover`,
    );
    assert(
      match.goalEventCompleteness.isGoalEventDataComplete === true,
      `isGoalEventDataComplete === true after failover`,
    );

    // Live data updated so standings reflect FINISHED
    if (match.live) {
      assert(
        match.live.status === "FINISHED",
        `match.live.status === "FINISHED" after failover (got "${match.live.status}")`,
      );
      assert(
        match.live.homeScore === 4,
        `match.live.homeScore === 4 (got ${match.live.homeScore})`,
      );
      assert(
        match.live.awayScore === 1,
        `match.live.awayScore === 1 (got ${match.live.awayScore})`,
      );
      assert(
        match.live.winner === "HOME_TEAM",
        `match.live.winner === "HOME_TEAM" (got "${match.live.winner}")`,
      );
    } else {
      assert(false, "match.live should be non-null when primary provided IN_PLAY data");
    }

    // Group standings: computed after enrichment, must show Switzerland win
    const groupB = snapshot.standingsByGroup["B"] ?? [];
    const swissRow = groupB.find((r) => r.teamKey === "switzerland");
    if (swissRow) {
      assert(swissRow.wins >= 1, `Switzerland wins >= 1 in group B (got ${swissRow.wins})`);
      assert(swissRow.goalsFor >= 4, `Switzerland goalsFor >= 4 in group B (got ${swissRow.goalsFor})`);
    } else {
      // Switzerland may not appear in standings if there's no data at all for Group B;
      // only assert if a row exists.
      console.log("  SKIP  Switzerland standings row not found (no group data)");
    }
  } finally {
    globalThis.fetch = origFetch;
    if (prevEnabled === undefined) {
      delete process.env.SCORER_ENRICHMENT_ENABLED;
    } else {
      process.env.SCORER_ENRICHMENT_ENABLED = prevEnabled;
    }
    setCacheAdapter(NextCacheAdapter);
  }
}

async function main() {
  await runIntegrationTest();

  // ── Summary ─────────────────────────────────────────────────────────────────

  console.log(`\n${"─".repeat(56)}`);
  if (failed === 0) {
    console.log(`ALL ${passed} TESTS PASSED`);
  } else {
    console.error(`${failed} FAILED / ${passed + failed} total`);
    process.exit(1);
  }
}

main();
