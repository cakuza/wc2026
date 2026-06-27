/**
 * Deterministic offline provider fixture tests (Req 7).
 *
 * Frozen minimal fixtures covering every corruption category.
 * NO live network calls — all inputs are inline strings.
 *
 * Fixture categories tested:
 *   F1  Normal ASCII name
 *   F2  Turkish diacritics (ş, ı, ğ) — UTF-8 well-formed
 *   F3  Valid UTF-8 diacritics (é, ü, ã) — should survive as-is
 *   F4  Genuine Mojibake (UTF-8 re-interpreted as Latin-1)
 *   F5  C1-control stripped form (proxy strips 0x80–0x9F byte)
 *   F6  Provider-supplied malformed / untranslatable name — passes through
 *   F7  Own-goal event (OG marker in scorer string)
 *   F8  Unresolved player — no alias exists, raw form preserved
 *   F9  Athlete-ID constrained alias (team scoping resolves the correct entry)
 *   F10 Conflicting provider names (same corrupted raw → different canonical per team)
 *
 * Usage:  npx tsx scripts/test-provider-fixtures.ts
 */

import {
  PLAYER_ALIASES,
  resolvePlayerName,
  findPlayerAlias,
} from "../lib/worldcup26PlayerAliases";
import { applyVerifiedGoalCorrections } from "../lib/verifiedMatchEventCorrections";
import type { GoalScorerEvent } from "../lib/worldcup26Provider";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string, detail?: string) {
  if (condition) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.error(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

// Inline fixMojibake (same implementation as lib/worldcup26Provider.ts)
function fixMojibake(s: string): string {
  if (!/[\xC2-\xC5][\x80-\xBF]/.test(s)) return s;
  try {
    const bytes = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i) & 0xff;
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return s;
  }
}

function sanitize(raw: string, teamName?: string): string {
  const fixed = fixMojibake(raw);
  const fromFixed = resolvePlayerName(fixed, teamName);
  if (fromFixed !== fixed) return fromFixed;
  const fromRaw = resolvePlayerName(raw, teamName);
  if (fromRaw !== raw) return fromRaw;
  return fixed;
}

console.log("=== Provider Fixture Tests (offline) ===\n");

// ── F1: Normal ASCII name ─────────────────────────────────────────────────────

console.log("F1) Normal ASCII name\n");

assert(sanitize("Folarin Balogun", "United States") === "Folarin Balogun",
  'ASCII name "Folarin Balogun" passes through unchanged');
assert(sanitize("Giovanni Reyna", "United States") === "Giovanni Reyna",
  'ASCII name "Giovanni Reyna" passes through unchanged');

// ── F2: Turkish diacritics — provider sometimes sends them correctly ───────────

console.log("\nF2) Turkish diacritics (well-formed UTF-8)\n");

// When provider sends the correct Turkish form directly
assert(sanitize("Barış Alper Yılmaz", "Turkey") === "Barış Alper Yılmaz",
  '"Barış Alper Yılmaz" (canonical) unchanged');
assert(sanitize("Arda Güler", "Turkey") === "Arda Güler",
  '"Arda Güler" (canonical, after Mojibake repair) unchanged');

// ── F3: Valid UTF-8 diacritics — fixMojibake must leave them untouched ────────

console.log("\nF3) Valid UTF-8 diacritics unchanged by fixMojibake\n");

// These have no C2-C5 sequence; fixMojibake should leave them as-is
const validUtf8Names = [
  "Mikel Oyarzabal",     // No diacritics
  "Rafael Leão",         // ã — valid, not Mojibake
  "Vinícius Júnior",     // í ú — valid canonical form
  "Kylian Mbappé",       // é — valid canonical form
];

for (const name of validUtf8Names) {
  assert(fixMojibake(name) === name,
    `fixMojibake leaves "${name}" unchanged`);
}

// ── F4: Genuine Mojibake — fixMojibake must repair ────────────────────────────

console.log("\nF4) Genuine Mojibake repair\n");

const mojibakeCases: [string, string][] = [
  ["Arda GÃ¼ler",       "Arda Güler"],   // ü → C3 BC
  ["Kylian MbappÃ©",    "Kylian Mbappé"], // é → C3 A9
  ["Rafael LeÃ£o",      "Rafael Leão"],   // ã → C3 A3
];

for (const [raw, expected] of mojibakeCases) {
  assert(fixMojibake(raw) === expected,
    `fixMojibake("${raw}") → "${expected}"`);
}

// ── F5: C1-stripped Mojibake fallback via alias map ───────────────────────────

console.log("\nF5) C1-stripped Mojibake — alias map fallback\n");

// When the second UTF-8 byte is in 0x80–0x9F (C1 control range),
// a PHP proxy may strip it, leaving only the first byte as a Latin-1 char.
// The alias map catches these residual forms.
assert(sanitize("Junya ItÅ", "Japan") === "Junya Itō",
  '"Junya ItÅ" (C1-stripped ō) → "Junya Itō" via alias fallback');
assert(sanitize("L. KrejÄÃ­", "Czechia") === "L. Krejčí",
  '"L. KrejÄÃ­" (C1-stripped č) → "L. Krejčí" via alias fallback');

// ── F6: Provider-supplied malformed / untranslatable name ─────────────────────

console.log("\nF6) Unknown / untranslatable name passes through raw\n");

// A name that has no alias and survives fixMojibake should pass through unchanged
assert(sanitize("Xyzabc Unknown", "Ghostland") === "Xyzabc Unknown",
  '"Xyzabc Unknown" (no alias, no Mojibake) passes through');

// "Gessime Yassine" is a REAL name that was previously wrongly mapped
assert(sanitize("Gessime Yassine", "Morocco") === "Gessime Yassine",
  '"Gessime Yassine" is the real player name — not remapped');

// ── F7: Own-goal event — alias carries isOwnGoal metadata ────────────────────

console.log("\nF7) Own-goal fixtures — correct OG metadata in alias\n");

const ogFixtures = [
  { raw: "Alis Skhiri",            team: "Netherlands",       canonical: "Ellyes Skhiri",    playerTeam: "Tunisia" },
  { raw: "Kamrvn Bargs",           team: "United States",     canonical: "Cameron Burgess",   playerTeam: "Australia" },
  { raw: "Hassan Mohamed Altmbkti",team: "Spain",             canonical: "Hassan Altambakti", playerTeam: "Saudi Arabia" },
  { raw: "Abvnad",                 team: "Bosnia & Herzegovina", canonical: "Sultan Al-Brake",playerTeam: "Qatar" },
  { raw: "Abdalvhid Namtvf",       team: "Portugal",          canonical: "Abduvohid Nematov", playerTeam: "Uzbekistan" },
];

for (const { raw, team, canonical, playerTeam } of ogFixtures) {
  const entry = findPlayerAlias(raw, team);
  assert(entry?.canonical === canonical, `OG "${raw}" (${team}) → "${canonical}"`);
  assert(entry?.isOwnGoal === true, `  isOwnGoal=true`);
  assert(entry?.playerTeam === playerTeam, `  playerTeam="${playerTeam}"`, `got "${entry?.playerTeam}"`);
}

// Verify the full verifiedMatchEventCorrections entry for Tunisia-NL
const tunisiaEvents = applyVerifiedGoalCorrections("tunisia-vs-netherlands-jun25", []);
assert(tunisiaEvents.length === 4, `Tunisia-NL correction has 4 events (got ${tunisiaEvents.length})`);
const skhiriEvent = tunisiaEvents.find((e) => e.playerName === "Ellyes Skhiri");
assert(!!skhiriEvent, `Ellyes Skhiri event present`);
assert(skhiriEvent?.isOwnGoal === true, `Skhiri isOwnGoal=true`);
assert(skhiriEvent?.teamName === "Netherlands", `Skhiri credited to Netherlands (OG)`);
assert(skhiriEvent?.playerTeamName === "Tunisia", `Skhiri playerTeamName=Tunisia`);

// ── F8: Unresolved player — no alias, raw form preserved ─────────────────────

console.log("\nF8) Unresolved player passes through unchanged\n");

// A name that looks like a Persian transliteration but is not in the alias map
// must pass through rather than silently drop or corrupt
const unknownRc2 = "Zkrvn Tlbvt"; // invented — no alias
assert(sanitize(unknownRc2, "Testland") === unknownRc2,
  `Unknown RC2 form "${unknownRc2}" passes through unchanged`);

// ── F9: Athlete-ID constrained alias — team scoping ──────────────────────────

console.log("\nF9) Team-scoped alias resolution\n");

// "Dnil Mvnvz" (Daniel Muñoz) appears for Colombia in multiple matches.
// Team scoping must always yield the same canonical name for Colombia.
assert(resolvePlayerName("Dnil Mvnvz", "Colombia") === "Daniel Muñoz",
  '"Dnil Mvnvz" scoped to Colombia → "Daniel Muñoz"');

// A wrong team should yield no match (no alias for that team combination),
// returning the raw value unchanged.
assert(resolvePlayerName("Dnil Mvnvz", "Brazil") === "Dnil Mvnvz",
  '"Dnil Mvnvz" scoped to Brazil → returns raw (no alias)');

// "Kail Larin" is a Canada alias — must not resolve for other teams
assert(resolvePlayerName("Kail Larin", "Canada") === "Cyle Larin",
  '"Kail Larin" scoped to Canada → "Cyle Larin"');
assert(resolvePlayerName("Kail Larin", "France") === "Kail Larin",
  '"Kail Larin" scoped to France → raw (no alias)');

// ── F10: Conflicting provider names — same raw, different canonical per team ──

console.log("\nF10) Conflicting provider names — team disambiguation\n");

// "Asmaail Saibari" appears for Morocco in two different matches —
// it must always resolve to the same player (Ismaël Saibari, Morocco).
assert(resolvePlayerName("Asmaail Saibari", "Morocco") === "Ismaël Saibari",
  '"Asmaail Saibari" → "Ismaël Saibari" (Morocco)');

// If a completely different team sent "Asmaail Saibari", it would have
// no alias and should return the raw value.
assert(resolvePlayerName("Asmaail Saibari", "Germany") === "Asmaail Saibari",
  '"Asmaail Saibari" for Germany → raw (no alias — team mismatch)');

// ── Merge gate assertions ─────────────────────────────────────────────────────

console.log("\nMerge gate\n");

const corrupted = PLAYER_ALIASES.filter((e) => e.canonical === "Scorer unavailable");
assert(corrupted.length === 0, `corrupted=0 (no "Scorer unavailable" entries)`);

const wrongConfidence = PLAYER_ALIASES.filter(
  (e) => e.confidence !== "high" && e.confidence !== "medium",
);
assert(wrongConfidence.length === 0, `All entries have valid confidence levels`);

const missingSource = PLAYER_ALIASES.filter((e) => !e.source);
assert(missingSource.length === 0, `All entries have a source citation`);

// OG entries must have playerTeam
const ogWithoutPlayerTeam = PLAYER_ALIASES.filter(
  (e) => e.isOwnGoal === true && !e.playerTeam,
);
assert(ogWithoutPlayerTeam.length === 0,
  `All OG entries have playerTeam set`,
  ogWithoutPlayerTeam.length > 0
    ? `Missing: ${ogWithoutPlayerTeam.map((e) => e.rawValue).join(", ")}`
    : undefined);

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
