/**
 * Gate test: match metadata — no internal codes in public-facing output.
 *
 * Tests:
 * 1.  M73 display title = "South Africa vs Canada" (resolved R32)
 * 2.  M89 display title = "Germany/Paraguay Winner vs France/Sweden Winner"
 * 3.  M90 display title = "South Africa/Canada Winner vs Netherlands/Morocco Winner"
 * 4.  M97 (QF) display title = "World Cup 2026 Quarter-final"
 * 5.  M101 (SF) display title = "World Cup 2026 Semi-final"
 * 6.  M103 (3P) display title = "World Cup 2026 Third-place Match"
 * 7.  M104 (F) display title = "World Cup 2026 Final"
 * 8.  No internal codes (Mn, Wn, "Match n", "TBD") in any knockout display title
 * 9.  Canonical R16 slot wiring unchanged (M89, M90)
 *
 * Usage:
 *   npx tsx scripts/test-match-metadata.ts
 */

import assert from "assert";
import { countryName } from "../lib/i18n";
import { matchBySlug, MATCHES } from "../lib/matches";
import { getResolvedHomeTeam, getResolvedAwayTeam, isKnockoutMatch, knockoutSlotLabel } from "../lib/participant-resolution";

let passed = 0;
let failed = 0;

function check(condition: boolean, msg: string): void {
  try {
    assert.ok(condition, msg);
    console.log(`  PASS  ${msg}`);
    passed++;
  } catch {
    console.error(`  FAIL  ${msg}`);
    failed++;
  }
}

function checkEqual<T>(actual: T, expected: T, msg: string): void {
  try {
    assert.strictEqual(
      actual,
      expected,
      `${msg} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`
    );
    console.log(`  PASS  ${msg}`);
    passed++;
  } catch (e) {
    console.error(`  FAIL  ${(e as Error).message}`);
    failed++;
  }
}

// ── Mirrors the logic in app/matches/[matchId]/page.tsx ─────────────────────

const STAGE_LABELS: Record<string, string> = {
  QF: "Quarter-final",
  SF: "Semi-final",
  "3P": "Third-place Match",
  F: "Final",
};

const STAGE_PLACEHOLDERS = new Set([
  "Round of 16 winner",
  "Quarter-final winner",
  "Semi-final winner",
  "Semi-final runner-up",
]);

type AnyMatch = ReturnType<typeof matchBySlug>;

function resolvedTeamName(match: AnyMatch, side: "home" | "away"): string {
  if (!match) return "TBD";
  if (!isKnockoutMatch(match)) {
    return countryName(side === "home" ? match.homeKey : match.awayKey, "en");
  }
  const resolvedKey = side === "home" ? getResolvedHomeTeam(match) : getResolvedAwayTeam(match);
  if (resolvedKey) return countryName(resolvedKey, "en");
  const slot = side === "home" ? match.homeSlot : match.awaySlot;
  return knockoutSlotLabel(slot);
}

function matchDisplayTitle(match: NonNullable<AnyMatch>): string {
  const home = resolvedTeamName(match, "home");
  const stageLabel = isKnockoutMatch(match) ? STAGE_LABELS[match.stage] : undefined;
  if (stageLabel && STAGE_PLACEHOLDERS.has(home)) {
    return `World Cup 2026 ${stageLabel}`;
  }
  return `${home} vs ${resolvedTeamName(match, "away")}`;
}

// ── Patterns that must never appear in public-facing output ─────────────────
const INTERNAL_CODE = /\b[WM]\d+\b|\bMatch\s+\d+|\bTBD\b/i;
const WINNER_MATCH = /Winner Match \d+/i;

console.log("=== Match Metadata Gate ===\n");

// ── 1. M73 — resolved R32: plain country names ───────────────────────────────

console.log("1. M73 display title = 'South Africa vs Canada'");
{
  const m = matchBySlug("match-73");
  check(m !== undefined, "M73 found via matchBySlug('match-73')");
  if (m) {
    const title = matchDisplayTitle(m);
    checkEqual(title, "South Africa vs Canada", "M73 display title");
    check(!INTERNAL_CODE.test(title), "M73 title contains no internal codes");
  }
}

// ── 2. M89 — R16: resolved R32 sources ──────────────────────────────────────

console.log("\n2. M89 display title = 'Germany/Paraguay Winner vs France/Sweden Winner'");
{
  const m = matchBySlug("match-89");
  check(m !== undefined, "M89 found via matchBySlug('match-89')");
  if (m) {
    const title = matchDisplayTitle(m);
    checkEqual(
      title,
      "Germany/Paraguay Winner vs France/Sweden Winner",
      "M89 display title"
    );
    check(!INTERNAL_CODE.test(title), "M89 title contains no internal codes");
    check(!WINNER_MATCH.test(title), "M89 title contains no 'Winner Match N' pattern");
  }
}

// ── 3. M90 — R16: resolved R32 sources ──────────────────────────────────────

console.log("\n3. M90 display title = 'South Africa/Canada Winner vs Netherlands/Morocco Winner'");
{
  const m = matchBySlug("match-90");
  check(m !== undefined, "M90 found via matchBySlug('match-90')");
  if (m) {
    const title = matchDisplayTitle(m);
    checkEqual(
      title,
      "South Africa/Canada Winner vs Netherlands/Morocco Winner",
      "M90 display title"
    );
    check(!INTERNAL_CODE.test(title), "M90 title contains no internal codes");
    check(!WINNER_MATCH.test(title), "M90 title contains no 'Winner Match N' pattern");
  }
}

// ── 4. M97 — QF: stage-aware title ──────────────────────────────────────────

console.log("\n4. M97 (QF) display title = 'World Cup 2026 Quarter-final'");
{
  const m = matchBySlug("match-97");
  check(m !== undefined, "M97 found via matchBySlug('match-97')");
  if (m) {
    const title = matchDisplayTitle(m);
    checkEqual(title, "World Cup 2026 Quarter-final", "M97 display title");
    check(!INTERNAL_CODE.test(title), "M97 title contains no internal codes");
  }
}

// ── 5. M101 — SF: stage-aware title ─────────────────────────────────────────

console.log("\n5. M101 (SF) display title = 'World Cup 2026 Semi-final'");
{
  const m = matchBySlug("match-101");
  check(m !== undefined, "M101 found via matchBySlug('match-101')");
  if (m) {
    const title = matchDisplayTitle(m);
    checkEqual(title, "World Cup 2026 Semi-final", "M101 display title");
    check(!INTERNAL_CODE.test(title), "M101 title contains no internal codes");
  }
}

// ── 6. M103 — 3P: stage-aware title ─────────────────────────────────────────

console.log("\n6. M103 (3P) display title = 'World Cup 2026 Third-place Match'");
{
  const m = matchBySlug("match-103");
  check(m !== undefined, "M103 found via matchBySlug('match-103')");
  if (m) {
    const title = matchDisplayTitle(m);
    checkEqual(title, "World Cup 2026 Third-place Match", "M103 display title");
    check(!INTERNAL_CODE.test(title), "M103 title contains no internal codes");
  }
}

// ── 7. M104 — Final: stage-aware title ──────────────────────────────────────

console.log("\n7. M104 (Final) display title = 'World Cup 2026 Final'");
{
  const m = matchBySlug("match-104");
  check(m !== undefined, "M104 found via matchBySlug('match-104')");
  if (m) {
    const title = matchDisplayTitle(m);
    checkEqual(title, "World Cup 2026 Final", "M104 display title");
    check(!INTERNAL_CODE.test(title), "M104 title contains no internal codes");
  }
}

// ── 8. All knockout matches: no internal codes in display title ──────────────

console.log("\n8. All knockout matches: no internal codes in display title");
const knockoutMatches = MATCHES.filter(isKnockoutMatch);
for (const m of knockoutMatches) {
  const title = matchDisplayTitle(m);
  check(!INTERNAL_CODE.test(title), `M${m.matchNumber} (${m.stage}) title "${title}" has no internal codes`);
  check(!WINNER_MATCH.test(title), `M${m.matchNumber} (${m.stage}) title has no "Winner Match N" pattern`);
}

// ── 9. Canonical R16 wiring unchanged ───────────────────────────────────────

console.log("\n9. Canonical R16 slot wiring (M89, M90)");
{
  const m89 = matchBySlug("match-89");
  const m90 = matchBySlug("match-90");
  check(m89 !== undefined && isKnockoutMatch(m89!), "M89 is a knockout match");
  check(m90 !== undefined && isKnockoutMatch(m90!), "M90 is a knockout match");
  if (m89 && isKnockoutMatch(m89)) {
    check(m89.homeSlot.kind === "winnerOf", "M89 homeSlot.kind = winnerOf");
    check(m89.awaySlot.kind === "winnerOf", "M89 awaySlot.kind = winnerOf");
    if (m89.homeSlot.kind === "winnerOf")
      checkEqual(m89.homeSlot.matchNumber, 74, "M89 homeSlot.matchNumber = 74");
    if (m89.awaySlot.kind === "winnerOf")
      checkEqual(m89.awaySlot.matchNumber, 77, "M89 awaySlot.matchNumber = 77");
  }
  if (m90 && isKnockoutMatch(m90)) {
    check(m90.homeSlot.kind === "winnerOf", "M90 homeSlot.kind = winnerOf");
    check(m90.awaySlot.kind === "winnerOf", "M90 awaySlot.kind = winnerOf");
    if (m90.homeSlot.kind === "winnerOf")
      checkEqual(m90.homeSlot.matchNumber, 73, "M90 homeSlot.matchNumber = 73");
    if (m90.awaySlot.kind === "winnerOf")
      checkEqual(m90.awaySlot.matchNumber, 75, "M90 awaySlot.matchNumber = 75");
  }
}

// ── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(50)}`);
console.log(`  ${passed} passed · ${failed} failed`);
if (failed > 0) process.exit(1);
