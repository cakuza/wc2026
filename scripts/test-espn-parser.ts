import assert from "assert";
import {
  parseEspnScoreboard,
  parseEspnGoalEvents,
  parseEspnClock,
} from "../lib/espnProvider";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  PASS  ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  FAIL  ${name}`);
    console.error(`        ${err?.message ?? err}`);
    failed++;
  }
}

// ── Goal play builders (minimal ESPN keyEvent shape) ────────────────────────────
function goalPlay(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "1001",
    type: { id: "70", text: "Goal", type: "goal" },
    scoringPlay: true,
    shootout: false,
    clock: { displayValue: "23'" },
    team: { id: "203", displayName: "Mexico" },
    participants: [{ athlete: { id: "p1", displayName: "Scorer One" } }],
    ...overrides,
  };
}

console.log("=== ESPN Parser Tests ===");

// ── parseEspnClock ──────────────────────────────────────────────────────────────
test("clock: plain minute", () => {
  assert.deepStrictEqual(parseEspnClock("9'"), { minute: 9, extraMinute: undefined });
});
test("clock: added time", () => {
  assert.deepStrictEqual(parseEspnClock("45'+5'"), { minute: 45, extraMinute: 5 });
});
test("clock: late added time", () => {
  assert.deepStrictEqual(parseEspnClock("90'+12'"), { minute: 90, extraMinute: 12 });
});
test("clock: malformed returns null", () => {
  assert.strictEqual(parseEspnClock("HT"), null);
  assert.strictEqual(parseEspnClock(""), null);
  assert.strictEqual(parseEspnClock(null), null);
});

// ── parseEspnGoalEvents ─────────────────────────────────────────────────────────
test("goal: normal goal parsed with structured fields", () => {
  const { events, errors } = parseEspnGoalEvents({ keyEvents: [goalPlay()] }, { providerFixtureId: "f1" });
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(events.length, 1);
  assert.deepStrictEqual(
    { ...events[0] },
    {
      provider: "espn",
      providerFixtureId: "f1",
      providerEventId: "1001",
      providerPlayerId: "p1",
      providerTeamId: "203",
      playerName: "Scorer One",
      minute: 23,
      extraMinute: undefined,
      isPenalty: false,
      isOwnGoal: false,
    },
  );
});

test("goal: header and volley count as goals", () => {
  const { events } = parseEspnGoalEvents(
    {
      keyEvents: [
        goalPlay({ id: "a", type: { id: "137", text: "Goal - Header", type: "goal---header" } }),
        goalPlay({ id: "b", type: { id: "173", text: "Goal - Volley", type: "goal---volley" }, clock: { displayValue: "70'" } }),
      ],
    },
    { providerFixtureId: "f1" },
  );
  assert.strictEqual(events.length, 2);
  assert.ok(events.every((e) => !e.isPenalty && !e.isOwnGoal));
});

test("goal: penalty scored flagged isPenalty", () => {
  const { events } = parseEspnGoalEvents(
    { keyEvents: [goalPlay({ type: { id: "98", text: "Penalty - Scored", type: "penalty---scored" }, clock: { displayValue: "45'+5'" } })] },
    { providerFixtureId: "f1" },
  );
  assert.strictEqual(events.length, 1);
  assert.strictEqual(events[0].isPenalty, true);
  assert.strictEqual(events[0].isOwnGoal, false);
  assert.strictEqual(events[0].minute, 45);
  assert.strictEqual(events[0].extraMinute, 5);
});

test("goal: own goal flagged isOwnGoal (team = beneficiary)", () => {
  const { events } = parseEspnGoalEvents(
    { keyEvents: [goalPlay({ type: { id: "97", text: "Own Goal", type: "own-goal" }, team: { id: "467", displayName: "South Africa" } })] },
    { providerFixtureId: "f1" },
  );
  assert.strictEqual(events.length, 1);
  assert.strictEqual(events[0].isOwnGoal, true);
  assert.strictEqual(events[0].providerTeamId, "467"); // beneficiary, handled by adapter
});

test("exclude: non-scoring plays (cards, subs, kickoff, halftime)", () => {
  const { events, errors } = parseEspnGoalEvents(
    {
      keyEvents: [
        { id: "y", type: { id: "94", text: "Yellow Card", type: "yellow-card" }, scoringPlay: false },
        { id: "s", type: { id: "76", text: "Substitution", type: "substitution" }, scoringPlay: false },
        { id: "k", type: { id: "80", text: "Kickoff", type: "kickoff" }, scoringPlay: false },
      ],
    },
    { providerFixtureId: "f1" },
  );
  assert.strictEqual(events.length, 0);
  assert.strictEqual(errors.length, 0);
});

test("exclude: VAR red card upgrade (scoringPlay false)", () => {
  const { events } = parseEspnGoalEvents(
    { keyEvents: [{ id: "v", type: { id: "167", text: "VAR - (Red) Card Upgrade", type: "var---red-card-upgrade" }, scoringPlay: false }] },
    { providerFixtureId: "f1" },
  );
  assert.strictEqual(events.length, 0);
});

test("exclude: VAR-overturned goal (scoringPlay false even if goal type)", () => {
  // An overturned goal is not a scoring play.
  const { events } = parseEspnGoalEvents(
    { keyEvents: [goalPlay({ id: "overturned", scoringPlay: false })] },
    { providerFixtureId: "f1" },
  );
  assert.strictEqual(events.length, 0);
});

test("exclude: penalty shootout goal (shootout true)", () => {
  const { events } = parseEspnGoalEvents(
    { keyEvents: [goalPlay({ id: "so", shootout: true, type: { id: "98", text: "Penalty - Scored", type: "penalty---scored" } })] },
    { providerFixtureId: "f1" },
  );
  assert.strictEqual(events.length, 0);
});

test("fail-closed: scoring play with unknown structured type rejected + recorded", () => {
  const { events, errors } = parseEspnGoalEvents(
    { keyEvents: [goalPlay({ id: "weird", type: { id: "999", text: "Mystery", type: "mystery-type" } })] },
    { providerFixtureId: "f1" },
  );
  assert.strictEqual(events.length, 0);
  assert.strictEqual(errors.length, 1);
  assert.strictEqual(errors[0].code, "unknown_scoring_type");
});

test("dedup: repeated event id collapses to one", () => {
  const { events } = parseEspnGoalEvents(
    { keyEvents: [goalPlay({ id: "dup" }), goalPlay({ id: "dup" })] },
    { providerFixtureId: "f1" },
  );
  assert.strictEqual(events.length, 1);
});

test("invalid: missing scorer/team/minute recorded as error, not silently dropped", () => {
  const { events, errors } = parseEspnGoalEvents(
    { keyEvents: [goalPlay({ id: "x", participants: [], team: undefined, clock: { displayValue: "nope" } })] },
    { providerFixtureId: "f1" },
  );
  assert.strictEqual(events.length, 0);
  assert.strictEqual(errors.length, 1);
  assert.strictEqual(errors[0].code, "invalid_goal_event");
});

test("ordering: events sorted by minute then added time", () => {
  const { events } = parseEspnGoalEvents(
    {
      keyEvents: [
        goalPlay({ id: "late", clock: { displayValue: "90'+2'" } }),
        goalPlay({ id: "early", clock: { displayValue: "9'" } }),
        goalPlay({ id: "mid", clock: { displayValue: "45'+1'" } }),
      ],
    },
    { providerFixtureId: "f1" },
  );
  assert.deepStrictEqual(events.map((e) => e.providerEventId), ["early", "mid", "late"]);
});

test("accepts plays[] fallback when keyEvents absent", () => {
  const { events } = parseEspnGoalEvents({ plays: [goalPlay()] }, { providerFixtureId: "f1" });
  assert.strictEqual(events.length, 1);
});

// ── parseEspnScoreboard ─────────────────────────────────────────────────────────
function scoreboardEvent(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "760415",
    date: "2026-06-11T19:00Z",
    status: { type: { state: "post", name: "STATUS_FULL_TIME" } },
    competitions: [
      {
        competitors: [
          { homeAway: "home", score: "2", team: { id: "203", displayName: "Mexico" } },
          { homeAway: "away", score: "0", team: { id: "467", displayName: "South Africa" } },
        ],
      },
    ],
    ...overrides,
  };
}

test("scoreboard: parses event identity, teams, status", () => {
  const { fixtures, errors } = parseEspnScoreboard({ events: [scoreboardEvent()] });
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(fixtures.length, 1);
  assert.deepStrictEqual(fixtures[0], {
    providerFixtureId: "760415",
    homeProviderTeamId: "203",
    homeTeamName: "Mexico",
    awayProviderTeamId: "467",
    awayTeamName: "South Africa",
    kickoffTimestamp: "2026-06-11T19:00Z",
    status: "post",
  });
});

test("scoreboard: scheduled state mapped to pre", () => {
  const { fixtures } = parseEspnScoreboard({
    events: [scoreboardEvent({ status: { type: { state: "pre", name: "STATUS_SCHEDULED" } } })],
  });
  assert.strictEqual(fixtures[0].status, "pre");
});

test("scoreboard: malformed event recorded as error", () => {
  const { fixtures, errors } = parseEspnScoreboard({ events: [{ id: "bad" }] });
  assert.strictEqual(fixtures.length, 0);
  assert.strictEqual(errors.length, 1);
  assert.strictEqual(errors[0].code, "invalid_fixture");
});

test("scoreboard: empty payload yields no fixtures, no throw", () => {
  assert.deepStrictEqual(parseEspnScoreboard({}).fixtures, []);
  assert.deepStrictEqual(parseEspnScoreboard(null).fixtures, []);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
