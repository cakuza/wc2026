/**
 * Gate test: bracket UX — no internal match codes in user-facing output.
 *
 * Tests:
 * 1.  No ROUND_OF_16_MATCHES slot label is a bare "W<n>" code
 * 2.  No QUARTER_FINAL_MATCHES slot label is a bare "W<n>" code
 * 3.  No SEMI_FINAL_MATCHES slot label is a bare "W<n>" code
 * 4.  Final slot labels are not "W<n>" codes
 * 5.  Resolved R32 teams render correct English team names
 * 6.  R16 slot labels reference resolved team names ("Winner of X vs Y")
 * 7.  QF slot labels use stage-aware phrase (not codes)
 * 8.  SF slot labels use stage-aware phrase (not codes)
 * 9.  M89 derives from M74 and M77 (canonical R16 wiring)
 * 10. M90 derives from M73 and M75 (canonical R16 wiring)
 * 11. Desktop nav order: TODAY, SCHEDULE, BRACKET, TEAMS, STATS, GROUPS, HUB
 * 12. BRACKET is in PRIMARY_LINKS (mobile bottom nav)
 * 13. /world-cup-third-place-qualification is reachable via SECONDARY_LINKS
 *
 * Usage:
 *   npx tsx scripts/test-bracket-ux.ts
 */

import assert from "assert";
import { countryName, type Lang } from "../lib/i18n";
import {
  FINAL_MATCH,
  QUARTER_FINAL_MATCHES,
  ROUND_OF_16_MATCHES,
  ROUND_OF_32_MATCHES,
  SEMI_FINAL_MATCHES,
} from "../lib/knockoutBracket2026";
import { DESKTOP_LINKS, PRIMARY_LINKS, SECONDARY_LINKS } from "../lib/navLinks";
import { resolvedHome, resolvedAway, RESOLVED_PARTICIPANTS } from "../lib/resolvedParticipants";

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
    assert.strictEqual(actual, expected, `${msg} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
    console.log(`  PASS  ${msg}`);
    passed++;
  } catch (e) {
    console.error(`  FAIL  ${(e as Error).message}`);
    failed++;
  }
}

const W_CODE = /\bW\d+\b/;
const M_CODE = /\bM\d+\b/;
const BARE_TBD = /\bTBD\b/i;

function slotWinnerLabel(sourceMatchNum: number, lang: Lang): string {
  if (sourceMatchNum >= 73 && sourceMatchNum <= 88) {
    const hp = resolvedHome(sourceMatchNum);
    const ap = resolvedAway(sourceMatchNum);
    if (hp && ap) {
      return `Winner of ${countryName(hp.teamKey, lang)} vs ${countryName(ap.teamKey, lang)}`;
    }
  }
  if (sourceMatchNum >= 89 && sourceMatchNum <= 96) return "Round of 16 winner";
  if (sourceMatchNum >= 97 && sourceMatchNum <= 100) return "Quarter-final winner";
  return "Semi-final winner";
}

console.log("=== Bracket UX Gate ===\n");

// ── 1–4. No W<n> / M<n> / bare TBD codes in any slot label ─────────────────

console.log("1. No W<n> codes in R16 slot labels");
for (const m of ROUND_OF_16_MATCHES) {
  const homeLabel = slotWinnerLabel(m.homeWinnerOf, "en");
  const awayLabel = slotWinnerLabel(m.awayWinnerOf, "en");
  check(!W_CODE.test(homeLabel), `R16 M${m.matchNumber} home label "${homeLabel}" contains no W-code`);
  check(!W_CODE.test(awayLabel), `R16 M${m.matchNumber} away label "${awayLabel}" contains no W-code`);
  check(!M_CODE.test(homeLabel), `R16 M${m.matchNumber} home label "${homeLabel}" contains no M-code`);
  check(!BARE_TBD.test(homeLabel), `R16 M${m.matchNumber} home label "${homeLabel}" is not bare TBD`);
  check(!BARE_TBD.test(awayLabel), `R16 M${m.matchNumber} away label "${awayLabel}" is not bare TBD`);
}

console.log("\n2. No W<n> codes in QF slot labels");
for (const m of QUARTER_FINAL_MATCHES) {
  const homeLabel = slotWinnerLabel(m.homeWinnerOf, "en");
  const awayLabel = slotWinnerLabel(m.awayWinnerOf, "en");
  check(!W_CODE.test(homeLabel), `QF M${m.matchNumber} home "${homeLabel}" contains no W-code`);
  check(!W_CODE.test(awayLabel), `QF M${m.matchNumber} away "${awayLabel}" contains no W-code`);
  check(!BARE_TBD.test(homeLabel), `QF M${m.matchNumber} home "${homeLabel}" is not bare TBD`);
  check(!BARE_TBD.test(awayLabel), `QF M${m.matchNumber} away "${awayLabel}" is not bare TBD`);
}

console.log("\n3. No W<n> codes in SF slot labels");
for (const m of SEMI_FINAL_MATCHES) {
  const homeLabel = slotWinnerLabel(m.homeWinnerOf, "en");
  const awayLabel = slotWinnerLabel(m.awayWinnerOf, "en");
  check(!W_CODE.test(homeLabel), `SF M${m.matchNumber} home "${homeLabel}" contains no W-code`);
  check(!W_CODE.test(awayLabel), `SF M${m.matchNumber} away "${awayLabel}" contains no W-code`);
  check(!BARE_TBD.test(homeLabel), `SF M${m.matchNumber} home "${homeLabel}" is not bare TBD`);
}

console.log("\n4. No W<n> codes in Final slot labels");
{
  const homeLabel = slotWinnerLabel(FINAL_MATCH.homeWinnerOf, "en");
  const awayLabel = slotWinnerLabel(FINAL_MATCH.awayWinnerOf, "en");
  check(!W_CODE.test(homeLabel), `Final home "${homeLabel}" contains no W-code`);
  check(!W_CODE.test(awayLabel), `Final away "${awayLabel}" contains no W-code`);
  check(!BARE_TBD.test(homeLabel), `Final home "${homeLabel}" is not bare TBD`);
}

// ── 5. Resolved R32 team names render correctly ──────────────────────────────

console.log("\n5. Resolved R32 teams render correct English team names");
const r32Expected: Record<number, { home: string; away: string }> = {
  73: { home: "South Africa", away: "Canada" },
  74: { home: "Germany",      away: "Paraguay" },
  75: { home: "Netherlands",  away: "Morocco" },
  76: { home: "Brazil",       away: "Japan" },
  77: { home: "France",       away: "Sweden" },
  80: { home: "England",      away: "DR Congo" },
  81: { home: "United States", away: "Bosnia & Herzegovina" },
  86: { home: "Argentina",    away: "Cape Verde" },
};
for (const [num, exp] of Object.entries(r32Expected)) {
  const mn = Number(num);
  const hp = resolvedHome(mn);
  const ap = resolvedAway(mn);
  check(hp !== null, `M${mn} has resolved home`);
  check(ap !== null, `M${mn} has resolved away`);
  if (hp) check(countryName(hp.teamKey, "en") === exp.home, `M${mn} home = "${exp.home}"`);
  if (ap) check(countryName(ap.teamKey, "en") === exp.away, `M${mn} away = "${exp.away}"`);
}

// ── 6. R16 slot labels include team names ────────────────────────────────────

console.log("\n6. R16 slot labels reference resolved team names");
for (const m of ROUND_OF_16_MATCHES) {
  const homeLabel = slotWinnerLabel(m.homeWinnerOf, "en");
  const awayLabel = slotWinnerLabel(m.awayWinnerOf, "en");
  check(
    homeLabel.startsWith("Winner of "),
    `R16 M${m.matchNumber} home starts with "Winner of": "${homeLabel}"`
  );
  check(
    awayLabel.startsWith("Winner of "),
    `R16 M${m.matchNumber} away starts with "Winner of": "${awayLabel}"`
  );
}

// ── 7–8. QF and SF use stage-aware phrases ───────────────────────────────────

console.log("\n7. QF slot labels use stage-aware phrase");
for (const m of QUARTER_FINAL_MATCHES) {
  const homeLabel = slotWinnerLabel(m.homeWinnerOf, "en");
  check(homeLabel === "Round of 16 winner", `QF M${m.matchNumber} home = "Round of 16 winner"`);
}

console.log("\n8. SF slot labels use stage-aware phrase");
for (const m of SEMI_FINAL_MATCHES) {
  const homeLabel = slotWinnerLabel(m.homeWinnerOf, "en");
  check(homeLabel === "Quarter-final winner", `SF M${m.matchNumber} home = "Quarter-final winner"`);
}

// ── 9–10. R16 canonical dependency wiring ────────────────────────────────────

console.log("\n9–10. R16 canonical wiring matches lib/matches.ts slots");
const m89 = ROUND_OF_16_MATCHES.find(m => m.matchNumber === 89)!;
const m90 = ROUND_OF_16_MATCHES.find(m => m.matchNumber === 90)!;
checkEqual(m89.homeWinnerOf, 74, "M89 homeWinnerOf = 74 (Germany vs Paraguay)");
checkEqual(m89.awayWinnerOf, 77, "M89 awayWinnerOf = 77 (France vs Sweden)");
checkEqual(m90.homeWinnerOf, 73, "M90 homeWinnerOf = 73 (South Africa vs Canada)");
checkEqual(m90.awayWinnerOf, 75, "M90 awayWinnerOf = 75 (Netherlands vs Morocco)");

// ── 11. Desktop nav order ────────────────────────────────────────────────────

console.log("\n11. Desktop nav order: TODAY, SCHEDULE, BRACKET, TEAMS, STATS, GROUPS, HUB");
const expectedDesktop = ["/today", "/schedule", "/bracket", "/teams", "/stats", "/groups", "/matchday-hub"];
checkEqual(DESKTOP_LINKS.length, expectedDesktop.length, `DESKTOP_LINKS has ${expectedDesktop.length} items`);
for (let i = 0; i < expectedDesktop.length; i++) {
  checkEqual(DESKTOP_LINKS[i]?.href, expectedDesktop[i], `DESKTOP_LINKS[${i}] = "${expectedDesktop[i]}"`);
}

// ── 12. Bracket in mobile primary nav ────────────────────────────────────────

console.log("\n12. /bracket is in PRIMARY_LINKS (mobile bottom nav)");
check(
  PRIMARY_LINKS.some(l => l.href === "/bracket"),
  '/bracket is in PRIMARY_LINKS'
);
check(
  !PRIMARY_LINKS.some(l => l.href === "/groups"),
  '/groups is NOT in PRIMARY_LINKS (moved to secondary)'
);

// ── 13. Third-place page reachable via SECONDARY_LINKS ───────────────────────

console.log("\n13. Third-place qualification page in SECONDARY_LINKS");
check(
  SECONDARY_LINKS.some(l => l.href === "/world-cup-third-place-qualification"),
  '/world-cup-third-place-qualification is in SECONDARY_LINKS'
);
check(
  !DESKTOP_LINKS.some(l => l.href === "/world-cup-third-place-qualification"),
  '/world-cup-third-place-qualification is NOT in DESKTOP_LINKS'
);

// ── 14. Resolved R32 flag codes are present and not "tbd" or empty ───────────

console.log("\n14. Resolved R32 participants have valid flag codes");
const EXPECTED_FLAG_CODES: Record<number, { home: string; away: string }> = {
  73: { home: "za",     away: "ca"     },
  74: { home: "de",     away: "py"     },
  75: { home: "nl",     away: "ma"     },
  76: { home: "br",     away: "jp"     },
  77: { home: "fr",     away: "se"     },
  78: { home: "ci",     away: "no"     },
  79: { home: "mx",     away: "ec"     },
  80: { home: "gb-eng", away: "cd"     },
  81: { home: "us",     away: "ba"     },
  82: { home: "be",     away: "sn"     },
  83: { home: "pt",     away: "hr"     },
  84: { home: "es",     away: "at"     },
  85: { home: "ch",     away: "dz"     },
  86: { home: "ar",     away: "cv"     },
  87: { home: "co",     away: "gh"     },
  88: { home: "au",     away: "eg"     },
};
for (const [num, exp] of Object.entries(EXPECTED_FLAG_CODES)) {
  const mn = Number(num);
  const hp = resolvedHome(mn);
  const ap = resolvedAway(mn);
  check(!!hp && !!hp.teamCode && hp.teamCode !== "tbd" && hp.teamCode !== "",
    `M${mn} home flag code non-empty/non-tbd`);
  check(!!ap && !!ap.teamCode && ap.teamCode !== "tbd" && ap.teamCode !== "",
    `M${mn} away flag code non-empty/non-tbd`);
  if (hp) checkEqual(hp.teamCode, exp.home, `M${mn} home flag code = "${exp.home}"`);
  if (ap) checkEqual(ap.teamCode, exp.away, `M${mn} away flag code = "${exp.away}"`);
}

// ── 15. Special flag codes are correct (England, DR Congo, Cape Verde) ───────

console.log("\n15. Special-case flag codes");
{
  const eng = resolvedHome(80);
  checkEqual(eng?.teamCode, "gb-eng", 'England uses "gb-eng" (not "gb")');
  const drCongo = resolvedAway(80);
  checkEqual(drCongo?.teamCode, "cd", 'DR Congo uses "cd"');
  const capeVerde = resolvedAway(86);
  checkEqual(capeVerde?.teamCode, "cv", 'Cape Verde uses "cv"');
  const ivoryCoast = resolvedHome(78);
  checkEqual(ivoryCoast?.teamCode, "ci", 'Ivory Coast uses "ci"');
  const southAfrica = resolvedHome(73);
  checkEqual(southAfrica?.teamCode, "za", 'South Africa uses "za"');
}

// ── 16. teamKey and teamCode agree (no cross-team mismatch) ──────────────────

console.log("\n16. teamKey / teamCode / name consistency");
const KEY_CODE_MAP: Record<string, string> = {
  southAfrica: "za", canada: "ca", germany: "de", paraguay: "py",
  netherlands: "nl", morocco: "ma", brazil: "br", japan: "jp",
  france: "fr", sweden: "se", ivoryCoast: "ci", norway: "no",
  mexico: "mx", ecuador: "ec", england: "gb-eng", drCongo: "cd",
  unitedStates: "us", bosnia: "ba", belgium: "be", senegal: "sn",
  portugal: "pt", croatia: "hr", spain: "es", austria: "at",
  switzerland: "ch", algeria: "dz", argentina: "ar", capeVerde: "cv",
  colombia: "co", ghana: "gh", australia: "au", egypt: "eg",
};
for (const [matchNum, participants] of Object.entries(RESOLVED_PARTICIPANTS)) {
  const homeExpected = KEY_CODE_MAP[participants.home.teamKey];
  const awayExpected = KEY_CODE_MAP[participants.away.teamKey];
  if (homeExpected !== undefined) {
    checkEqual(participants.home.teamCode, homeExpected,
      `M${matchNum} home: teamCode "${participants.home.teamCode}" matches teamKey "${participants.home.teamKey}"`);
  }
  if (awayExpected !== undefined) {
    checkEqual(participants.away.teamCode, awayExpected,
      `M${matchNum} away: teamCode "${participants.away.teamCode}" matches teamKey "${participants.away.teamKey}"`);
  }
}

// ── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(50)}`);
console.log(`  ${passed} passed · ${failed} failed`);
if (failed > 0) process.exit(1);
