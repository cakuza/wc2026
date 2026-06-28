/**
 * Canonical match model gate — verifies the 104-match fixture list is
 * internally consistent and structurally sound before knockout matches
 * are visible to any product surface.
 *
 * Run with:
 *   npx tsx scripts/test-canonical-matches.ts
 */

import assert from "assert";
import { MATCHES, matchSlug } from "../lib/matches";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e: any) {
    console.error(`  ❌ ${name}`);
    console.error(`     ${e.message ?? e}`);
    failed++;
  }
}

console.log("\n=== Canonical Match Model Gate ===\n");

// ── Count tests ────────────────────────────────────────────────────────────

console.log("--- Counts ---");

const groupMatches = MATCHES.filter(
  (m) => !("stage" in m) || (m as any).stage === "group" || (m as any).stage === undefined,
);
const knockoutMatches = MATCHES.filter(
  (m) => "stage" in m && (m as any).stage !== "group" && (m as any).stage !== undefined,
);

test("Total matches is 104", () => {
  assert.strictEqual(MATCHES.length, 104, `Got ${MATCHES.length}`);
});

test("Group-stage matches is 72", () => {
  assert.strictEqual(groupMatches.length, 72, `Got ${groupMatches.length}`);
});

test("Knockout matches is 32", () => {
  assert.strictEqual(knockoutMatches.length, 32, `Got ${knockoutMatches.length}`);
});

// ── Knockout stage breakdown ───────────────────────────────────────────────

console.log("\n--- Knockout stage breakdown ---");

const byStage = new Map<string, number>();
for (const m of knockoutMatches) {
  const stage = (m as any).stage as string;
  byStage.set(stage, (byStage.get(stage) ?? 0) + 1);
}

test("16 Round-of-32 matches (R32)", () => {
  assert.strictEqual(byStage.get("R32") ?? 0, 16, `Got ${byStage.get("R32")}`);
});

test("8 Round-of-16 matches (R16)", () => {
  assert.strictEqual(byStage.get("R16") ?? 0, 8, `Got ${byStage.get("R16")}`);
});

test("4 Quarter-final matches (QF)", () => {
  assert.strictEqual(byStage.get("QF") ?? 0, 4, `Got ${byStage.get("QF")}`);
});

test("2 Semi-final matches (SF)", () => {
  assert.strictEqual(byStage.get("SF") ?? 0, 2, `Got ${byStage.get("SF")}`);
});

test("1 Third-place match (stage '3P')", () => {
  assert.strictEqual(byStage.get("3P") ?? 0, 1, `Got ${byStage.get("3P")}; all stages: ${JSON.stringify([...byStage])}`);
});

test("1 Final match (stage 'F')", () => {
  assert.strictEqual(byStage.get("F") ?? 0, 1, `Got ${byStage.get("F")}; all stages: ${JSON.stringify([...byStage])}`);
});

// ── matchNumber uniqueness and range ──────────────────────────────────────

console.log("\n--- matchNumber uniqueness and range ---");

const matchNumbers = knockoutMatches
  .map((m) => (m as any).matchNumber as number)
  .sort((a, b) => a - b);

test("All knockout matchNumbers are unique", () => {
  const unique = new Set(matchNumbers);
  assert.strictEqual(unique.size, matchNumbers.length, `Duplicates found: ${matchNumbers}`);
});

test("matchNumbers run from 73 to 104", () => {
  assert.strictEqual(matchNumbers[0], 73, `First: ${matchNumbers[0]}`);
  assert.strictEqual(matchNumbers[matchNumbers.length - 1], 104, `Last: ${matchNumbers[matchNumbers.length - 1]}`);
});

test("matchNumbers are consecutive (no gaps)", () => {
  for (let i = 0; i < matchNumbers.length - 1; i++) {
    assert.strictEqual(
      matchNumbers[i + 1],
      matchNumbers[i] + 1,
      `Gap between ${matchNumbers[i]} and ${matchNumbers[i + 1]}`,
    );
  }
});

// ── Slug uniqueness across all 104 matches ─────────────────────────────────

console.log("\n--- Slug uniqueness ---");

const slugs = MATCHES.map((m) => matchSlug(m));

test("All 104 match slugs are unique", () => {
  const seen = new Set<string>();
  const dupes: string[] = [];
  for (const s of slugs) {
    if (seen.has(s)) dupes.push(s);
    seen.add(s);
  }
  assert.strictEqual(dupes.length, 0, `Duplicate slugs: ${dupes.join(", ")}`);
});

test("Knockout slugs follow match-N pattern", () => {
  for (const m of knockoutMatches) {
    const slug = matchSlug(m);
    assert.match(slug, /^match-\d+$/, `Bad slug: ${slug}`);
  }
});

// ── Dates and Final ────────────────────────────────────────────────────────

console.log("\n--- Dates ---");

test("Group stage starts on or after 2026-06-11", () => {
  const earliest = groupMatches.map((m) => m.date).sort()[0];
  assert.ok(earliest >= "2026-06-11", `Earliest group date: ${earliest}`);
});

test("Final (stage 'F', match 104) is on 2026-07-19", () => {
  const final = knockoutMatches.find((m) => (m as any).stage === "F");
  assert.ok(final, "No Final match found (expected stage 'F')");
  assert.strictEqual(final!.date, "2026-07-19", `Final date: ${final!.date}`);
});

test("No knockout match is scheduled before 2026-06-28", () => {
  const early = knockoutMatches.filter((m) => m.date < "2026-06-28");
  assert.strictEqual(early.length, 0, `Early knockout matches: ${early.map((m) => `${(m as any).matchNumber}@${m.date}`).join(", ")}`);
});

// ── Participant slot structure ─────────────────────────────────────────────

console.log("\n--- Participant slot structure ---");

test("All knockout matches have valid homeSlot", () => {
  for (const m of knockoutMatches) {
    const slot = (m as any).homeSlot;
    assert.ok(slot, `Match ${(m as any).matchNumber} missing homeSlot`);
    assert.ok(
      ["resolved", "groupSlot", "bestThird", "winnerOf", "loserOf"].includes(slot.kind),
      `Match ${(m as any).matchNumber} homeSlot has unknown kind: ${slot.kind}`,
    );
  }
});

test("All knockout matches have valid awaySlot", () => {
  for (const m of knockoutMatches) {
    const slot = (m as any).awaySlot;
    assert.ok(slot, `Match ${(m as any).matchNumber} missing awaySlot`);
    assert.ok(
      ["resolved", "groupSlot", "bestThird", "winnerOf", "loserOf"].includes(slot.kind),
      `Match ${(m as any).matchNumber} awaySlot has unknown kind: ${slot.kind}`,
    );
  }
});

test("groupSlot entries have group (letter) and place (1-3)", () => {
  for (const m of knockoutMatches) {
    for (const slotKey of ["homeSlot", "awaySlot"] as const) {
      const slot = (m as any)[slotKey];
      if (slot.kind === "groupSlot") {
        assert.ok(
          /^[A-L]$/.test(slot.group),
          `Match ${(m as any).matchNumber} ${slotKey} groupSlot has invalid group: ${slot.group}`,
        );
        assert.ok(
          slot.place >= 1 && slot.place <= 3,
          `Match ${(m as any).matchNumber} ${slotKey} groupSlot has invalid place: ${slot.place}`,
        );
      }
    }
  }
});

test("bestThird entries have non-empty groups array", () => {
  for (const m of knockoutMatches) {
    for (const slotKey of ["homeSlot", "awaySlot"] as const) {
      const slot = (m as any)[slotKey];
      if (slot.kind === "bestThird") {
        assert.ok(
          Array.isArray(slot.groups) && slot.groups.length > 0,
          `Match ${(m as any).matchNumber} ${slotKey} bestThird has invalid groups: ${slot.groups}`,
        );
      }
    }
  }
});

// ── homeKey/awayKey are "tbd" for all knockout matches ────────────────────

console.log("\n--- Participant keys ---");

test("All knockout matches have homeKey 'tbd'", () => {
  for (const m of knockoutMatches) {
    assert.strictEqual(
      m.homeKey,
      "tbd",
      `Match ${(m as any).matchNumber} homeKey: ${m.homeKey}`,
    );
  }
});

test("All knockout matches have awayKey 'tbd'", () => {
  for (const m of knockoutMatches) {
    assert.strictEqual(
      m.awayKey,
      "tbd",
      `Match ${(m as any).matchNumber} awayKey: ${m.awayKey}`,
    );
  }
});

test("All group-stage matches have non-tbd homeKey and awayKey", () => {
  for (const m of groupMatches) {
    assert.notStrictEqual(m.homeKey, "tbd", `Group match ${m.date} homeKey is tbd`);
    assert.notStrictEqual(m.awayKey, "tbd", `Group match ${m.date} awayKey is tbd`);
  }
});

// ── Summary ────────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(50)}`);
console.log(`Canonical matches gate: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
