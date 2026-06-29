/**
 * Gate test: match metadata — correct titles, no internal codes, no duplication.
 *
 * The root layout uses template "%s | WorldCupMatchDay", so every value returned
 * by generateMetadata.title becomes "{segment} | WorldCupMatchDay" in production.
 *
 * Tests:
 *  1.  M73 title segment = "South Africa vs Canada"
 *  2.  M89 title segment = "Germany/Paraguay Winner vs France/Sweden Winner"
 *  3.  M90 title segment = "South Africa/Canada Winner vs Netherlands/Morocco Winner"
 *  4.  M97 (QF) title segment = "Quarter-final"
 *  5.  M101 (SF) title segment = "Semi-final"
 *  6.  M103 (3P) title segment = "Third-place Match"
 *  7.  M104 (Final) title segment = "World Cup Final"
 *  8.  No title segment contains "World Cup 2026" (would duplicate via template)
 *  9.  No title segment contains "WorldCupMatchDay" (template adds it)
 * 10.  No title segment contains "FIFA"
 * 11.  No title segment or FAQ ref contains internal codes (Mn, Wn, Match n, TBD)
 * 12.  No title segment or FAQ ref contains "Winner Match"
 * 13.  OG title for stage-level rounds includes "FIFA World Cup 2026" exactly once
 * 14.  OG title for resolved matches includes "FIFA World Cup 2026" exactly once
 * 15.  FAQ ref for QF = "World Cup 2026 Quarter-final"
 * 16.  FAQ ref for Final = "World Cup 2026 Final"
 * 17.  FAQ ref for M73 = "South Africa vs Canada"
 * 18.  FAQ ref for M89 = "Germany/Paraguay Winner vs France/Sweden Winner"
 * 19.  All knockout match title segments clean across all 32 knockout matches
 * 20.  Canonical R16 slot wiring unchanged (M89, M90)
 *
 * Usage:
 *   npx tsx scripts/test-match-metadata.ts
 */

import assert from "assert";
import { countryName } from "../lib/i18n";
import { matchBySlug, MATCHES } from "../lib/matches";
import {
  getResolvedHomeTeam,
  getResolvedAwayTeam,
  isKnockoutMatch,
  knockoutSlotLabel,
} from "../lib/participant-resolution";

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

// ── Mirrors app/matches/[matchId]/page.tsx logic ─────────────────────────────
// Keep in sync with the page implementation.

const TITLE_SEGMENTS: Record<string, string> = {
  QF: "Quarter-final",
  SF: "Semi-final",
  "3P": "Third-place Match",
  F: "World Cup Final",
};

const OG_STAGE_LABELS: Record<string, string> = {
  QF: "Quarter-final – FIFA World Cup 2026",
  SF: "Semi-final – FIFA World Cup 2026",
  "3P": "Third-place Match – FIFA World Cup 2026",
  F: "FIFA World Cup 2026 Final",
};

const FAQ_STAGE_REFS: Record<string, string> = {
  QF: "World Cup 2026 Quarter-final",
  SF: "World Cup 2026 Semi-final",
  "3P": "World Cup 2026 Third-place Match",
  F: "World Cup 2026 Final",
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
  const key = side === "home" ? getResolvedHomeTeam(match) : getResolvedAwayTeam(match);
  if (key) return countryName(key, "en");
  const slot = side === "home" ? match.homeSlot : match.awaySlot;
  return knockoutSlotLabel(slot);
}

function isStageLevel(match: NonNullable<AnyMatch>): boolean {
  return (
    isKnockoutMatch(match) &&
    match.stage in TITLE_SEGMENTS &&
    STAGE_PLACEHOLDERS.has(resolvedTeamName(match, "home"))
  );
}

function matchTitleSegment(match: NonNullable<AnyMatch>): string {
  if (isStageLevel(match)) return TITLE_SEGMENTS[match.stage as string] ?? resolvedTeamName(match, "home");
  return `${resolvedTeamName(match, "home")} vs ${resolvedTeamName(match, "away")}`;
}

function matchOgTitle(match: NonNullable<AnyMatch>): string {
  if (isStageLevel(match)) {
    return OG_STAGE_LABELS[match.stage as string] ?? `${TITLE_SEGMENTS[match.stage as string]} – FIFA World Cup 2026`;
  }
  return `${resolvedTeamName(match, "home")} vs ${resolvedTeamName(match, "away")} – FIFA World Cup 2026`;
}

function matchFaqRef(match: NonNullable<AnyMatch>): string {
  if (isStageLevel(match)) return FAQ_STAGE_REFS[match.stage as string] ?? matchTitleSegment(match);
  return `${resolvedTeamName(match, "home")} vs ${resolvedTeamName(match, "away")}`;
}

// ── Patterns that must never appear in title segments ───────────────────────
const INTERNAL_CODE  = /\b[WM]\d+\b|\bMatch\s+\d+|\bTBD\b/i;
const WINNER_MATCH   = /Winner Match \d+/i;
const HAS_FIFA       = /FIFA/;
const HAS_WC26       = /World Cup 2026/;
const HAS_BRAND      = /WorldCupMatchDay/;
const DOUBLE_WC26    = /World Cup 2026.*World Cup 2026/;

function m(slug: string) {
  const match = matchBySlug(slug);
  if (!match) throw new Error(`matchBySlug("${slug}") returned undefined`);
  return match;
}

console.log("=== Match Metadata Gate ===\n");

// ── 1–7. Title segments for key matches ─────────────────────────────────────

console.log("1. M73 title segment = 'South Africa vs Canada'");
checkEqual(matchTitleSegment(m("match-73")), "South Africa vs Canada", "M73 title segment");

console.log("\n2. M89 title segment = 'Germany/Paraguay Winner vs France/Sweden Winner'");
checkEqual(
  matchTitleSegment(m("match-89")),
  "Germany/Paraguay Winner vs France/Sweden Winner",
  "M89 title segment"
);

console.log("\n3. M90 title segment = 'South Africa/Canada Winner vs Netherlands/Morocco Winner'");
checkEqual(
  matchTitleSegment(m("match-90")),
  "South Africa/Canada Winner vs Netherlands/Morocco Winner",
  "M90 title segment"
);

console.log("\n4. M97 (QF) title segment = 'Quarter-final'");
checkEqual(matchTitleSegment(m("match-97")), "Quarter-final", "M97 title segment");

console.log("\n5. M101 (SF) title segment = 'Semi-final'");
checkEqual(matchTitleSegment(m("match-101")), "Semi-final", "M101 title segment");

console.log("\n6. M103 (3P) title segment = 'Third-place Match'");
checkEqual(matchTitleSegment(m("match-103")), "Third-place Match", "M103 title segment");

console.log("\n7. M104 (Final) title segment = 'World Cup Final'");
checkEqual(matchTitleSegment(m("match-104")), "World Cup Final", "M104 title segment");

// ── 8–10. Title segments must not contain auto-appended content ──────────────

console.log("\n8–10. Title segments: no 'World Cup 2026', no 'WorldCupMatchDay', no 'FIFA'");
const ALL_KNOCKOUT = MATCHES.filter(isKnockoutMatch);
for (const match of ALL_KNOCKOUT) {
  const seg = matchTitleSegment(match);
  check(!HAS_WC26.test(seg),  `M${match.matchNumber} title segment has no 'World Cup 2026' (template avoids duplication): "${seg}"`);
  check(!HAS_BRAND.test(seg), `M${match.matchNumber} title segment has no 'WorldCupMatchDay' (template adds it): "${seg}"`);
  check(!HAS_FIFA.test(seg),  `M${match.matchNumber} title segment has no 'FIFA' (OG carries context): "${seg}"`);
}

// ── 11–12. No internal codes anywhere ───────────────────────────────────────

console.log("\n11–12. No internal codes or 'Winner Match N' in title segments or FAQ refs");
for (const match of ALL_KNOCKOUT) {
  const seg  = matchTitleSegment(match);
  const faq  = matchFaqRef(match);
  check(!INTERNAL_CODE.test(seg),  `M${match.matchNumber} title has no internal codes: "${seg}"`);
  check(!WINNER_MATCH.test(seg),   `M${match.matchNumber} title has no 'Winner Match N': "${seg}"`);
  check(!INTERNAL_CODE.test(faq),  `M${match.matchNumber} FAQ ref has no internal codes: "${faq}"`);
  check(!WINNER_MATCH.test(faq),   `M${match.matchNumber} FAQ ref has no 'Winner Match N': "${faq}"`);
}

// ── 13–14. OG titles: exactly one "FIFA World Cup 2026", no duplication ──────

console.log("\n13–14. OG titles: 'FIFA World Cup 2026' appears exactly once, never doubled");
for (const match of ALL_KNOCKOUT) {
  const og = matchOgTitle(match);
  check(!DOUBLE_WC26.test(og), `M${match.matchNumber} OG title has no doubled 'World Cup 2026': "${og}"`);
  check(og.includes("FIFA World Cup 2026"), `M${match.matchNumber} OG title includes 'FIFA World Cup 2026': "${og}"`);
}

// ── 15–18. FAQ refs ──────────────────────────────────────────────────────────

console.log("\n15–18. FAQ refs: stage-aware for deep rounds, team names for R32/R16");
checkEqual(matchFaqRef(m("match-97")),  "World Cup 2026 Quarter-final", "M97 FAQ ref");
checkEqual(matchFaqRef(m("match-101")), "World Cup 2026 Semi-final",    "M101 FAQ ref");
checkEqual(matchFaqRef(m("match-103")), "World Cup 2026 Third-place Match", "M103 FAQ ref");
checkEqual(matchFaqRef(m("match-104")), "World Cup 2026 Final",         "M104 FAQ ref");
checkEqual(matchFaqRef(m("match-73")),  "South Africa vs Canada",       "M73 FAQ ref");
checkEqual(
  matchFaqRef(m("match-89")),
  "Germany/Paraguay Winner vs France/Sweden Winner",
  "M89 FAQ ref"
);

// ── 19. All 32 knockout match segments clean ─────────────────────────────────

console.log("\n19. All 32 knockout match title segments: clean");
for (const match of ALL_KNOCKOUT) {
  const seg = matchTitleSegment(match);
  check(seg.length > 0, `M${match.matchNumber} title segment non-empty`);
  check(!INTERNAL_CODE.test(seg),  `M${match.matchNumber} "${seg}" — no internal codes`);
  check(!WINNER_MATCH.test(seg),   `M${match.matchNumber} "${seg}" — no 'Winner Match N'`);
}

// ── 20. Canonical R16 wiring unchanged ──────────────────────────────────────

console.log("\n20. Canonical R16 slot wiring (M89, M90)");
{
  const m89 = m("match-89");
  const m90 = m("match-90");
  check(isKnockoutMatch(m89), "M89 is knockout");
  check(isKnockoutMatch(m90), "M90 is knockout");
  if (isKnockoutMatch(m89)) {
    check(m89.homeSlot.kind === "winnerOf", "M89 homeSlot.kind = winnerOf");
    check(m89.awaySlot.kind === "winnerOf", "M89 awaySlot.kind = winnerOf");
    if (m89.homeSlot.kind === "winnerOf") checkEqual(m89.homeSlot.matchNumber, 74, "M89 homeSlot.matchNumber = 74");
    if (m89.awaySlot.kind === "winnerOf") checkEqual(m89.awaySlot.matchNumber, 77, "M89 awaySlot.matchNumber = 77");
  }
  if (isKnockoutMatch(m90)) {
    check(m90.homeSlot.kind === "winnerOf", "M90 homeSlot.kind = winnerOf");
    check(m90.awaySlot.kind === "winnerOf", "M90 awaySlot.kind = winnerOf");
    if (m90.homeSlot.kind === "winnerOf") checkEqual(m90.homeSlot.matchNumber, 73, "M90 homeSlot.matchNumber = 73");
    if (m90.awaySlot.kind === "winnerOf") checkEqual(m90.awaySlot.matchNumber, 75, "M90 awaySlot.matchNumber = 75");
  }
}

// ── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(50)}`);
console.log(`  ${passed} passed · ${failed} failed`);
if (failed > 0) process.exit(1);
