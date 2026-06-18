import "./mock-server-only";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { setCacheAdapter, MemoryCacheAdapter } from "../lib/cacheAdapter";
import { MATCHES, matchSlug } from "../lib/matches";
import { enrichSnapshotScorers, isScorerEnrichmentEnabled } from "../lib/scorerProviderRuntime";
import type { SerializableSnapshotMatch } from "../lib/liveSnapshot";
import type { GoalScorerEvent } from "../lib/worldcup26Provider";

// This suite drives the enrichment runtime directly, so force it on (the default-on
// path only triggers inside the live Next.js server runtime).
process.env.SCORER_ENRICHMENT_ENABLED = "true";

// ── Deterministic ESPN responses ────────────────────────────────────────────────
// Real fixtures (scoreboard + summaries) are captured under scripts/fixtures/espn.
// The integration test drives the REAL production runtime (client + cache + parser
// + adapter + ledger) against a mocked global fetch, so no production seam exists.

const FIX_DIR = path.resolve(process.cwd(), "scripts/fixtures/espn");
const SCOREBOARD = JSON.parse(fs.readFileSync(path.join(FIX_DIR, "scoreboard.json"), "utf8"));
function loadSummary(eventId: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(FIX_DIR, `summary-${eventId}.json`), "utf8"));
}

// Real ESPN event ids + team ids from the captured scoreboard.
const EV = {
  mexSA: "760415",
  korCze: "760414",
  irnNz: "760427",
  gerCur: "760422",
  qatSui: "760420",
  scheduled: "760441", // Mexico v South Korea, state "pre"
};
const TEAM = { mexico: "203", southAfrica: "467" };

type Mode = "ok" | "timeout" | "network" | "invalid" | "http";
let scoreboardMode: Mode = "ok";
let scoreboardPayload: unknown = SCOREBOARD;
const summaryOverride = new Map<string, { mode: Mode; payload?: unknown }>();
let requestedSummaries: Set<string>;
let scoreboardRequested: boolean;

function makeResponse(mode: Mode, payload?: unknown): Promise<Response> {
  if (mode === "timeout") {
    const e = new Error("aborted");
    e.name = "AbortError";
    return Promise.reject(e);
  }
  if (mode === "network") return Promise.reject(new Error("ECONNRESET"));
  if (mode === "invalid") return Promise.resolve(new Response("<html>not json</html>", { status: 200 }));
  if (mode === "http") return Promise.resolve(new Response("not found", { status: 404 }));
  return Promise.resolve(new Response(JSON.stringify(payload ?? {}), { status: 200 }));
}

function installMock() {
  requestedSummaries = new Set();
  scoreboardRequested = false;
  (globalThis as any).fetch = (url: string | URL | Request) => {
    const u = String(url);
    if (u.includes("/scoreboard")) {
      scoreboardRequested = true;
      return makeResponse(scoreboardMode, scoreboardPayload);
    }
    if (u.includes("/summary")) {
      const id = new URL(u).searchParams.get("event") ?? "";
      requestedSummaries.add(id);
      const override = summaryOverride.get(id);
      if (override) return makeResponse(override.mode, override.payload);
      return makeResponse("ok", loadSummary(id));
    }
    return Promise.resolve(new Response("{}", { status: 200 }));
  };
}

function resetMock() {
  scoreboardMode = "ok";
  scoreboardPayload = SCOREBOARD;
  summaryOverride.clear();
  setCacheAdapter(new MemoryCacheAdapter()); // fresh cache per test — no bleed
  installMock();
}

// ── Snapshot match builder ──────────────────────────────────────────────────────
function buildMatch(
  homeKey: string,
  awayKey: string,
  homeScore: number,
  awayScore: number,
  status: SerializableSnapshotMatch["status"],
  baselineScorers: GoalScorerEvent[] = [],
): SerializableSnapshotMatch {
  const m = MATCHES.find((x) => x.homeKey === homeKey && x.awayKey === awayKey);
  if (!m) throw new Error(`canonical match not found: ${homeKey} v ${awayKey}`);
  const expected = homeScore + awayScore;
  return {
    match: m,
    internalId: matchSlug(m),
    providerMatchId: m.providerIds?.footballData ?? null,
    status,
    homeScore,
    awayScore,
    scorers: baselineScorers,
    goalEventCompleteness: {
      missingGoalEventCount: Math.max(0, expected - baselineScorers.length),
      expectedGoalEventCount: expected,
      hasAllGoalEvents: baselineScorers.length >= expected,
    } as any,
    sourceUpdatedAt: "2026-06-15T22:00:00Z",
    providerUpdatedAt: null,
    live: null,
  };
}

function snapshotOf(...matches: SerializableSnapshotMatch[]): Record<string, SerializableSnapshotMatch> {
  const out: Record<string, SerializableSnapshotMatch> = {};
  for (const m of matches) out[m.internalId] = m;
  return out;
}

function syntheticSummary(
  plays: Array<{ id: string; minute: string; teamId: string; teamName: string; scorer: string; type: string; typeType: string; scoringPlay?: boolean; shootout?: boolean }>,
): unknown {
  return {
    keyEvents: plays.map((p) => ({
      id: p.id,
      type: { id: "70", text: p.type, type: p.typeType },
      scoringPlay: p.scoringPlay !== false,
      shootout: p.shootout === true,
      clock: { displayValue: p.minute },
      team: { id: p.teamId, displayName: p.teamName },
      participants: [{ athlete: { id: `pl-${p.id}`, displayName: p.scorer } }],
    })),
  };
}

// ── Test harness ────────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
async function test(name: string, fn: () => Promise<void>): Promise<void> {
  resetMock();
  try {
    await fn();
    console.log(`  PASS  ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  FAIL  ${name}`);
    console.error(`        ${err?.stack ?? err?.message ?? err}`);
    failed++;
  }
}

const STAMP = "2026-06-15T22:00:00Z";

async function run() {
  console.log("=== ESPN Runtime Integration Tests ===\n");

  // 1. Mexico–South Africa: 2-0, two confirmed scorers, unresolved 0.
  await test("Mexico–South Africa: 2-0 → 2 scorers, unresolved 0", async () => {
    const m = buildMatch("mexico", "southAfrica", 2, 0, "FINISHED");
    await enrichSnapshotScorers(snapshotOf(m), true, STAMP);
    assert.strictEqual(m.scorers.length, 2);
    assert.strictEqual(m.goalEventCompleteness.missingGoalEventCount, 0);
    assert.deepStrictEqual(m.scorers.map((s) => s.playerName), ["Julián Quiñones", "Raúl Jiménez"]);
    assert.ok(m.scorers.every((s) => s.teamName === "Mexico"));
  });

  // 2. South Korea–Czechia: 2-1, three confirmed scorers, unresolved 0.
  await test("South Korea–Czechia: 2-1 → 3 scorers, unresolved 0", async () => {
    const m = buildMatch("southKorea", "czechia", 2, 1, "FINISHED");
    await enrichSnapshotScorers(snapshotOf(m), true, STAMP);
    assert.strictEqual(m.scorers.length, 3);
    assert.strictEqual(m.goalEventCompleteness.missingGoalEventCount, 0);
    const czGoals = m.scorers.filter((s) => s.teamName === "Czechia").length;
    const krGoals = m.scorers.filter((s) => s.teamName === "South Korea").length;
    assert.strictEqual(czGoals, 1);
    assert.strictEqual(krGoals, 2);
  });

  // 3. Iran–New Zealand: 2-2, four confirmed scorers, unresolved 0.
  await test("Iran–New Zealand: 2-2 → 4 scorers, unresolved 0 (no fabrication)", async () => {
    const m = buildMatch("iran", "newZealand", 2, 2, "FINISHED");
    await enrichSnapshotScorers(snapshotOf(m), true, STAMP);
    assert.strictEqual(m.scorers.length, 4);
    assert.strictEqual(m.goalEventCompleteness.missingGoalEventCount, 0);
    assert.strictEqual(m.scorers.filter((s) => s.teamName === "Iran").length, 2);
    assert.strictEqual(m.scorers.filter((s) => s.teamName === "New Zealand").length, 2);
  });

  // 4. Germany–Curaçao: penalty counted, all eight goals represented exactly once.
  await test("Germany–Curaçao: 7-1 → 8 goals, penalty counted exactly once", async () => {
    const m = buildMatch("germany", "curacao", 7, 1, "FINISHED");
    await enrichSnapshotScorers(snapshotOf(m), true, STAMP);
    assert.strictEqual(m.scorers.length, 8);
    assert.strictEqual(m.goalEventCompleteness.missingGoalEventCount, 0);
    const penalties = m.scorers.filter((s) => s.isPenalty);
    assert.strictEqual(penalties.length, 1);
    assert.strictEqual(penalties[0].playerName, "Kai Havertz");
    assert.strictEqual(penalties[0].minuteLabel, "45+5'");
    // Havertz also scored a non-penalty — both his goals present, penalty once.
    assert.strictEqual(m.scorers.filter((s) => s.playerName === "Kai Havertz").length, 2);
  });

  // 5. Scheduled match: zero summary/event request, zero scorer fabrication.
  await test("Scheduled match: no summary request, no fabrication", async () => {
    const sched = buildMatch("mexico", "southKorea", 0, 0, "SCHEDULED");
    sched.goalEventCompleteness = { missingGoalEventCount: 0, expectedGoalEventCount: 0, hasAllGoalEvents: true } as any;
    await enrichSnapshotScorers(snapshotOf(sched), true, STAMP);
    assert.strictEqual(sched.scorers.length, 0);
    assert.ok(!requestedSummaries.has(EV.scheduled), "scheduled summary must never be requested");
  });

  // 6. Own goal: explicit own-goal fixture; no team/credited-side inference; no GB credit.
  await test("Own goal: credited to beneficiary, no scorer-team inference", async () => {
    const m = buildMatch("qatar", "switzerland", 1, 1, "FINISHED");
    await enrichSnapshotScorers(snapshotOf(m), true, STAMP);
    assert.strictEqual(m.scorers.length, 2);
    assert.strictEqual(m.goalEventCompleteness.missingGoalEventCount, 0);
    const og = m.scorers.find((s) => s.isOwnGoal);
    assert.ok(og, "own goal present");
    assert.strictEqual(og!.playerName, "Miro Muheim");
    assert.strictEqual(og!.teamName, "Qatar"); // beneficiary (credited) side
    assert.strictEqual(og!.playerTeamName, undefined); // scorer's club never inferred
    const pen = m.scorers.find((s) => s.isPenalty);
    assert.ok(pen && pen.playerName === "Breel Embolo" && pen.teamName === "Switzerland");
  });

  // 7. Cancelled/VAR: overturned goal excluded.
  await test("VAR-overturned goal excluded (scoringPlay false)", async () => {
    summaryOverride.set(EV.mexSA, {
      mode: "ok",
      payload: syntheticSummary([
        { id: "g1", minute: "9'", teamId: TEAM.mexico, teamName: "Mexico", scorer: "Julián Quiñones", type: "Goal", typeType: "goal" },
        { id: "g2", minute: "67'", teamId: TEAM.mexico, teamName: "Mexico", scorer: "Raúl Jiménez", type: "Goal", typeType: "goal" },
        { id: "overturned", minute: "80'", teamId: TEAM.mexico, teamName: "Mexico", scorer: "Phantom", type: "Goal", typeType: "goal", scoringPlay: false },
      ]),
    });
    const m = buildMatch("mexico", "southAfrica", 2, 0, "FINISHED");
    await enrichSnapshotScorers(snapshotOf(m), true, STAMP);
    assert.strictEqual(m.scorers.length, 2);
    assert.ok(!m.scorers.some((s) => s.playerName === "Phantom"));
  });

  // 8. Duplicate event: repeated ESPN representation counts once.
  await test("Duplicate ESPN event id counts once", async () => {
    summaryOverride.set(EV.mexSA, {
      mode: "ok",
      payload: syntheticSummary([
        { id: "g1", minute: "9'", teamId: TEAM.mexico, teamName: "Mexico", scorer: "Julián Quiñones", type: "Goal", typeType: "goal" },
        { id: "g1", minute: "9'", teamId: TEAM.mexico, teamName: "Mexico", scorer: "Julián Quiñones", type: "Goal", typeType: "goal" },
        { id: "g2", minute: "67'", teamId: TEAM.mexico, teamName: "Mexico", scorer: "Raúl Jiménez", type: "Goal", typeType: "goal" },
      ]),
    });
    const m = buildMatch("mexico", "southAfrica", 2, 0, "FINISHED");
    await enrichSnapshotScorers(snapshotOf(m), true, STAMP);
    assert.strictEqual(m.scorers.length, 2);
  });

  // 9. Provider failures: timeout / network / invalid JSON / schema drift / HTTP → baseline preserved.
  const failureModes: Array<[string, () => void]> = [
    ["timeout", () => summaryOverride.set(EV.irnNz, { mode: "timeout" })],
    ["network error", () => summaryOverride.set(EV.irnNz, { mode: "network" })],
    ["invalid JSON", () => summaryOverride.set(EV.irnNz, { mode: "invalid" })],
    ["HTTP error", () => summaryOverride.set(EV.irnNz, { mode: "http" })],
    ["schema drift", () => summaryOverride.set(EV.irnNz, { mode: "ok", payload: { unexpected: "shape", keyEvents: "not-an-array" } })],
  ];
  for (const [label, setup] of failureModes) {
    await test(`Provider failure (${label}): baseline preserved`, async () => {
      setup();
      const baseline: GoalScorerEvent[] = [
        { type: "GOAL", minute: 1, minuteLabel: "1'", teamName: "Iran", playerName: "Baseline Scorer", isOwnGoal: false, isPenalty: false, provider: "football-data.org", confidence: "high" },
      ];
      const m = buildMatch("iran", "newZealand", 2, 2, "FINISHED", baseline);
      const beforeMissing = m.goalEventCompleteness.missingGoalEventCount;
      await enrichSnapshotScorers(snapshotOf(m), true, STAMP);
      assert.strictEqual(m.scorers.length, 1, "baseline scorers preserved");
      assert.strictEqual(m.scorers[0].playerName, "Baseline Scorer");
      assert.strictEqual(m.goalEventCompleteness.missingGoalEventCount, beforeMissing);
    });
  }

  await test("Scoreboard fetch failure: all baselines preserved", async () => {
    scoreboardMode = "network";
    const m = buildMatch("iran", "newZealand", 2, 2, "FINISHED");
    await enrichSnapshotScorers(snapshotOf(m), true, STAMP);
    assert.strictEqual(m.scorers.length, 0); // unchanged baseline (was empty)
    assert.ok(!requestedSummaries.has(EV.irnNz), "no summary fetched when scoreboard fails");
  });

  // 10. Canonical protection: ESPN score/status differences cannot alter canonical values.
  await test("Canonical protection: score/status never mutated by enrichment", async () => {
    const m = buildMatch("mexico", "southAfrica", 2, 0, "FINISHED");
    await enrichSnapshotScorers(snapshotOf(m), true, STAMP);
    assert.strictEqual(m.homeScore, 2);
    assert.strictEqual(m.awayScore, 0);
    assert.strictEqual(m.status, "FINISHED");
  });

  await test("Canonical protection: ESPN over-reporting (conflict) preserves baseline", async () => {
    // Canonical says Mexico 1-0, but ESPN reports 2 Mexico goals → conflicted → no adoption.
    summaryOverride.set(EV.mexSA, {
      mode: "ok",
      payload: syntheticSummary([
        { id: "g1", minute: "9'", teamId: TEAM.mexico, teamName: "Mexico", scorer: "Julián Quiñones", type: "Goal", typeType: "goal" },
        { id: "g2", minute: "67'", teamId: TEAM.mexico, teamName: "Mexico", scorer: "Raúl Jiménez", type: "Goal", typeType: "goal" },
      ]),
    });
    const baseline: GoalScorerEvent[] = [
      { type: "GOAL", minute: 9, minuteLabel: "9'", teamName: "Mexico", playerName: "Canonical Scorer", isOwnGoal: false, isPenalty: false, provider: "football-data.org", confidence: "low" },
    ];
    const m = buildMatch("mexico", "southAfrica", 1, 0, "FINISHED", baseline);
    await enrichSnapshotScorers(snapshotOf(m), true, STAMP);
    assert.strictEqual(m.homeScore, 1, "canonical score untouched");
    assert.strictEqual(m.scorers.length, 1, "conflicting provider data not adopted");
    assert.strictEqual(m.scorers[0].playerName, "Canonical Scorer");
  });

  // Richer baseline must never be degraded.
  await test("No degrade: richer baseline kept when provider offers fewer events", async () => {
    summaryOverride.set(EV.mexSA, {
      mode: "ok",
      payload: syntheticSummary([
        { id: "only1", minute: "9'", teamId: TEAM.mexico, teamName: "Mexico", scorer: "Solo Goal", type: "Goal", typeType: "goal" },
      ]),
    });
    // Baseline has 2 scorers but one low-confidence → still a candidate for enrichment.
    const baseline: GoalScorerEvent[] = [
      { type: "GOAL", minute: 9, minuteLabel: "9'", teamName: "Mexico", playerName: "Rich One", isOwnGoal: false, isPenalty: false, provider: "football-data.org", confidence: "high" },
      { type: "GOAL", minute: 67, minuteLabel: "67'", teamName: "Mexico", playerName: "Rich Two", isOwnGoal: false, isPenalty: false, provider: "football-data.org", confidence: "low" },
    ];
    const m = buildMatch("mexico", "southAfrica", 2, 0, "FINISHED", baseline);
    await enrichSnapshotScorers(snapshotOf(m), true, STAMP);
    assert.strictEqual(m.scorers.length, 2, "provider with fewer events must not replace richer baseline");
    assert.deepStrictEqual(m.scorers.map((s) => s.playerName), ["Rich One", "Rich Two"]);
  });

  // Already-complete finished match is skipped (no wasted request).
  await test("Complete finished match skipped (no summary request)", async () => {
    const baseline: GoalScorerEvent[] = [
      { type: "GOAL", minute: 9, minuteLabel: "9'", teamName: "Mexico", playerName: "A", isOwnGoal: false, isPenalty: false, provider: "football-data.org", confidence: "high" },
      { type: "GOAL", minute: 67, minuteLabel: "67'", teamName: "Mexico", playerName: "B", isOwnGoal: false, isPenalty: false, provider: "football-data.org", confidence: "high" },
    ];
    const m = buildMatch("mexico", "southAfrica", 2, 0, "FINISHED", baseline);
    await enrichSnapshotScorers(snapshotOf(m), true, STAMP);
    assert.ok(!requestedSummaries.has(EV.mexSA), "complete finished match should not be re-fetched");
  });

  // Public-output hygiene: enriched scorers carry accurate ESPN provenance; no raw payload fields.
  await test("Public hygiene: accurate ESPN provenance, no raw ESPN payload fields", async () => {
    const m = buildMatch("mexico", "southAfrica", 2, 0, "FINISHED");
    await enrichSnapshotScorers(snapshotOf(m), true, STAMP);
    const json = JSON.stringify(m.scorers);
    assert.ok(!/keyEvents|scoringPlay|displayValue|participants|athlete/i.test(json), "no raw ESPN fields leaked");
    for (const s of m.scorers) {
      assert.deepStrictEqual(
        Object.keys(s).sort(),
        ["confidence", "isOwnGoal", "isPenalty", "minute", "minuteLabel", "playerName", "playerTeamName", "provider", "stoppageTime", "teamName", "type"].sort(),
      );
      assert.strictEqual(s.provider, "espn", `scorer "${s.playerName}" must carry espn provenance`);
      assert.notStrictEqual(s.provider, "football-data.org", "ESPN-enriched scorers must never be labeled football-data.org");
    }
  });

  // ── Feature-switch matrix ────────────────────────────────────────────────────
  // For each disabled state: isScorerEnrichmentEnabled() returns false, no network
  // request is made, and the snapshot is unchanged. Only exact "true" enables.

  await test("Switch matrix: absent → disabled (no requests, baseline preserved)", async () => {
    const saved = process.env.SCORER_ENRICHMENT_ENABLED;
    delete process.env.SCORER_ENRICHMENT_ENABLED;
    try {
      assert.strictEqual(isScorerEnrichmentEnabled(), false, "absent → disabled");
      const m = buildMatch("mexico", "southAfrica", 2, 0, "FINISHED");
      await enrichSnapshotScorers(snapshotOf(m), true, STAMP);
      assert.strictEqual(scoreboardRequested, false, "no scoreboard request when disabled");
      assert.strictEqual(requestedSummaries.size, 0, "no summary requests when disabled");
      assert.strictEqual(m.scorers.length, 0, "baseline unchanged");
    } finally {
      if (saved !== undefined) process.env.SCORER_ENRICHMENT_ENABLED = saved;
    }
  });

  await test("Switch matrix: 'false' → disabled (no requests, baseline preserved)", async () => {
    const saved = process.env.SCORER_ENRICHMENT_ENABLED;
    process.env.SCORER_ENRICHMENT_ENABLED = "false";
    try {
      assert.strictEqual(isScorerEnrichmentEnabled(), false, "'false' → disabled");
      const m = buildMatch("mexico", "southAfrica", 2, 0, "FINISHED");
      await enrichSnapshotScorers(snapshotOf(m), true, STAMP);
      assert.strictEqual(scoreboardRequested, false, "no scoreboard request");
      assert.strictEqual(requestedSummaries.size, 0, "no summary requests");
      assert.strictEqual(m.scorers.length, 0, "baseline unchanged");
    } finally {
      process.env.SCORER_ENRICHMENT_ENABLED = saved;
    }
  });

  await test("Switch matrix: invalid value → disabled (no requests)", async () => {
    const saved = process.env.SCORER_ENRICHMENT_ENABLED;
    process.env.SCORER_ENRICHMENT_ENABLED = "yes";
    try {
      assert.strictEqual(isScorerEnrichmentEnabled(), false, "invalid value → disabled");
      const m = buildMatch("mexico", "southAfrica", 2, 0, "FINISHED");
      await enrichSnapshotScorers(snapshotOf(m), true, STAMP);
      assert.strictEqual(scoreboardRequested, false, "no scoreboard request for invalid value");
    } finally {
      process.env.SCORER_ENRICHMENT_ENABLED = saved;
    }
  });

  await test("Switch matrix: '1' → disabled (exact match required, not truthy)", async () => {
    const saved = process.env.SCORER_ENRICHMENT_ENABLED;
    process.env.SCORER_ENRICHMENT_ENABLED = "1";
    try {
      assert.strictEqual(isScorerEnrichmentEnabled(), false, "'1' → disabled");
      const m = buildMatch("mexico", "southAfrica", 2, 0, "FINISHED");
      await enrichSnapshotScorers(snapshotOf(m), true, STAMP);
      assert.strictEqual(scoreboardRequested, false, "no scoreboard request for '1'");
    } finally {
      process.env.SCORER_ENRICHMENT_ENABLED = saved;
    }
  });

  await test("Switch matrix: 'true' → enabled (enrichment runs, requests made)", async () => {
    const saved = process.env.SCORER_ENRICHMENT_ENABLED;
    process.env.SCORER_ENRICHMENT_ENABLED = "true";
    try {
      assert.strictEqual(isScorerEnrichmentEnabled(), true, "'true' → enabled");
      const m = buildMatch("mexico", "southAfrica", 2, 0, "FINISHED");
      await enrichSnapshotScorers(snapshotOf(m), true, STAMP);
      assert.ok(scoreboardRequested, "scoreboard fetched when enabled");
      assert.ok(requestedSummaries.size > 0, "at least one summary fetched");
      assert.strictEqual(m.scorers.length, 2, "scorers enriched");
    } finally {
      process.env.SCORER_ENRICHMENT_ENABLED = saved;
    }
  });

  // ── Provenance correctness ───────────────────────────────────────────────────

  // ESPN-enriched scorers must carry "espn" provenance; never "football-data.org".
  await test("Provenance: ESPN events labeled 'espn', never 'football-data.org'", async () => {
    const m = buildMatch("mexico", "southAfrica", 2, 0, "FINISHED");
    await enrichSnapshotScorers(snapshotOf(m), true, STAMP);
    assert.ok(m.scorers.length > 0, "scorers were enriched");
    for (const s of m.scorers) {
      assert.strictEqual(s.provider, "espn", `"${s.playerName}" must have provider=espn`);
      assert.notStrictEqual(s.provider, "football-data.org", "must not be falsely attributed to fd.org");
    }
    // Canonical score/status unchanged — football-data.org authority preserved.
    assert.strictEqual(m.homeScore, 2);
    assert.strictEqual(m.awayScore, 0);
    assert.strictEqual(m.status, "FINISHED");
  });

  // Pre-existing football-data.org baseline scorers must retain their own provenance
  // when the match is already complete and enrichment skips it.
  await test("Provenance: fd.org baseline scorers retain fd.org provenance (complete match skipped)", async () => {
    const baseline: GoalScorerEvent[] = [
      { type: "GOAL", minute: 9, minuteLabel: "9'", teamName: "Mexico", playerName: "FD One", isOwnGoal: false, isPenalty: false, provider: "football-data.org", confidence: "high" },
      { type: "GOAL", minute: 67, minuteLabel: "67'", teamName: "Mexico", playerName: "FD Two", isOwnGoal: false, isPenalty: false, provider: "football-data.org", confidence: "high" },
    ];
    const m = buildMatch("mexico", "southAfrica", 2, 0, "FINISHED", baseline);
    // Match is already complete — enrichment skips it, baseline retained unchanged.
    await enrichSnapshotScorers(snapshotOf(m), true, STAMP);
    assert.strictEqual(m.scorers.length, 2);
    for (const s of m.scorers) {
      assert.strictEqual(s.provider, "football-data.org", "fd.org-originated scorers keep fd.org provenance");
    }
    assert.ok(!requestedSummaries.has(EV.mexSA), "no summary requested for complete match");
  });

  // ── Stats invariant ──────────────────────────────────────────────────────────
  // ESPN enrichment must not alter canonical homeScore, awayScore, or status.
  // computeTournamentStats counts only from canonicalLiveData (football-data.org),
  // which enrichment never touches — 23/73 vs 24/75 is a live-data snapshot timing
  // issue with the upstream canonical providers, not an ESPN regression.
  await test("Stats invariant: enrichment never alters canonical scores or status", async () => {
    const m1 = buildMatch("mexico", "southAfrica", 2, 0, "FINISHED");
    const m2 = buildMatch("southKorea", "czechia", 2, 1, "FINISHED");
    await enrichSnapshotScorers(snapshotOf(m1, m2), true, STAMP);
    assert.strictEqual(m1.homeScore, 2);
    assert.strictEqual(m1.awayScore, 0);
    assert.strictEqual(m1.status, "FINISHED");
    assert.strictEqual(m2.homeScore, 2);
    assert.strictEqual(m2.awayScore, 1);
    assert.strictEqual(m2.status, "FINISHED");
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run();
