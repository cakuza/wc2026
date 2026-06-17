import assert from "assert";
import { parseKickoffApiGoalEvents } from "../lib/kickoffApiProvider";

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

function event(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "event-1",
    fixture: { id: "fixture-1" },
    team: { id: "team-1", name: "Mexico" },
    player: { id: "player-1", name: "Scorer One" },
    assist: { id: "assist-1", name: "Assist One" },
    time: { elapsed: 12, extra: null },
    type: "Goal",
    detail: "Normal Goal",
    ...overrides,
  };
}

console.log("=== KickoffAPI parser test ===\n");

test("normal goal is accepted", () => {
  const result = parseKickoffApiGoalEvents([event()]);
  assert.strictEqual(result.events.length, 1);
  assert.strictEqual(result.events[0].provider, "kickoffapi");
  assert.strictEqual(result.events[0].detail, "Normal Goal");
  assert.strictEqual(result.errors.length, 0);
});

test("penalty is accepted and flagged", () => {
  const result = parseKickoffApiGoalEvents([event({ id: "event-2", detail: "Penalty" })]);
  assert.strictEqual(result.events[0].isPenalty, true);
  assert.strictEqual(result.events[0].isOwnGoal, false);
});

test("own goal is accepted and flagged", () => {
  const result = parseKickoffApiGoalEvents([event({ id: "event-3", detail: "Own Goal" })]);
  assert.strictEqual(result.events[0].isOwnGoal, true);
  assert.strictEqual(result.events[0].isPenalty, false);
});

test("assist present is preserved", () => {
  const result = parseKickoffApiGoalEvents([event()]);
  assert.strictEqual(result.events[0].assistPlayerId, "assist-1");
  assert.strictEqual(result.events[0].assistName, "Assist One");
});

test("assist absent is accepted", () => {
  const result = parseKickoffApiGoalEvents([event({ id: "event-4", assist: null })]);
  assert.strictEqual(result.events.length, 1);
  assert.strictEqual(result.events[0].assistPlayerId, undefined);
  assert.strictEqual(result.events[0].assistName, undefined);
});

test("player ID present is preserved", () => {
  const result = parseKickoffApiGoalEvents([event()]);
  assert.strictEqual(result.events[0].providerPlayerId, "player-1");
});

test("player ID absent is accepted", () => {
  const result = parseKickoffApiGoalEvents([event({ id: "event-5", player: { name: "No Id" } })]);
  assert.strictEqual(result.events[0].providerPlayerId, undefined);
  assert.strictEqual(result.events[0].playerName, "No Id");
});

test("extra minute is preserved", () => {
  const result = parseKickoffApiGoalEvents([event({ id: "event-6", time: { elapsed: 45, extra: 3 } })]);
  assert.strictEqual(result.events[0].minute, 45);
  assert.strictEqual(result.events[0].extraMinute, 3);
});

test("card is ignored", () => {
  const result = parseKickoffApiGoalEvents([event({ id: "event-card", type: "Card", detail: "Yellow Card" })]);
  assert.strictEqual(result.events.length, 0);
  assert.strictEqual(result.errors.length, 0);
});

test("substitution is ignored", () => {
  const result = parseKickoffApiGoalEvents([event({ id: "event-sub", type: "subst", detail: "Substitution 1" })]);
  assert.strictEqual(result.events.length, 0);
  assert.strictEqual(result.errors.length, 0);
});

test("missed penalty is ignored", () => {
  const result = parseKickoffApiGoalEvents([event({ id: "event-missed", detail: "Missed Penalty" })]);
  assert.strictEqual(result.events.length, 0);
  assert.strictEqual(result.errors.length, 0);
});

test("cancelled or VAR goal is ignored", () => {
  const result = parseKickoffApiGoalEvents([
    event({ id: "event-disallowed", detail: "Goal Disallowed" }),
    event({ id: "event-var", detail: "VAR" }),
  ]);
  assert.strictEqual(result.events.length, 0);
  assert.strictEqual(result.errors.length, 0);
});

test("unknown goal detail is rejected", () => {
  const result = parseKickoffApiGoalEvents([event({ id: "event-unknown", detail: "Header Goal" })]);
  assert.strictEqual(result.events.length, 0);
  assert.strictEqual(result.errors[0].code, "unknown_goal_detail");
});

test("missing event ID is rejected", () => {
  const raw = event();
  delete raw.id;
  const result = parseKickoffApiGoalEvents([raw]);
  assert.strictEqual(result.events.length, 0);
  assert.strictEqual(result.errors[0].code, "invalid_goal_event");
});

test("missing team ID is rejected", () => {
  const result = parseKickoffApiGoalEvents([event({ id: "event-no-team", team: { name: "Mexico" } })]);
  assert.strictEqual(result.events.length, 0);
  assert.match(result.errors[0].message, /team ID/);
});

test("missing scorer is rejected", () => {
  const result = parseKickoffApiGoalEvents([event({ id: "event-no-scorer", player: { id: "p1" } })]);
  assert.strictEqual(result.events.length, 0);
  assert.match(result.errors[0].message, /scorer name/);
});

test("invalid minute is rejected", () => {
  const result = parseKickoffApiGoalEvents([event({ id: "event-bad-minute", time: { elapsed: "late" } })]);
  assert.strictEqual(result.events.length, 0);
  assert.match(result.errors[0].message, /minute/);
});

test("exact duplicate is deduplicated", () => {
  const result = parseKickoffApiGoalEvents([event({ id: "dup" }), event({ id: "dup" })]);
  assert.strictEqual(result.events.length, 1);
});

test("same minute with distinct event IDs is retained", () => {
  const result = parseKickoffApiGoalEvents([
    event({ id: "same-1", time: { elapsed: 20 } }),
    event({ id: "same-2", time: { elapsed: 20 } }),
  ]);
  assert.strictEqual(result.events.length, 2);
});

test("events are ordered by minute, extra minute, event ID", () => {
  const result = parseKickoffApiGoalEvents([
    event({ id: "b", time: { elapsed: 45, extra: 2 } }),
    event({ id: "c", time: { elapsed: 44, extra: null } }),
    event({ id: "a", time: { elapsed: 45, extra: 2 } }),
    event({ id: "d", time: { elapsed: 45, extra: 1 } }),
  ]);
  assert.deepStrictEqual(result.events.map((item) => item.providerEventId), ["c", "d", "a", "b"]);
});

test("sanitized errors do not contain raw payload or secrets", () => {
  const result = parseKickoffApiGoalEvents([
    event({
      id: "event-secret",
      detail: "Impossible Goal",
      requestHeaders: { "x-api-key": "secret-key" },
      rawPayload: "very raw",
    }),
  ]);
  const serialized = JSON.stringify(result.errors);
  assert.ok(!serialized.includes("secret-key"));
  assert.ok(!serialized.includes("very raw"));
  assert.ok(!serialized.includes("requestHeaders"));
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
