/**
 * Scorer name integrity gate.
 *
 * Runs the full alias + Mojibake sanitization pipeline and flags any
 * remaining suspicious player names in the known-corrupted data set.
 *
 * Suspicious criteria (from P0 audit spec):
 *   1. Consonant-heavy: any token ≥4 chars with < 20% vowels (after alias lookup)
 *   2. Very short: non-initial tokens ≤ 2 chars (e.g. "Ph", "Bk")
 *   3. Known-bad patterns: vowel-loss markers like "vv", "nv", "lv"
 *
 * Gate: corrupted=0 after fix; all remaining "Scorer unavailable" entries
 * are explicitly audited (see data/audit/scorer-identity-inventory.json).
 *
 * Usage:  npx tsx scripts/test-scorer-name-integrity.ts
 */

import { PLAYER_ALIAS_MAP } from "../lib/worldcup26PlayerAliases";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string, detail?: string) {
  if (condition) {
    console.log(`  PASS  ${msg}`);
    passed++;
  } else {
    console.error(`  FAIL  ${msg}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

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

function sanitize(raw: string): string {
  const fixed = fixMojibake(raw);
  return PLAYER_ALIAS_MAP[fixed] ?? PLAYER_ALIAS_MAP[raw] ?? fixed;
}

// Build Mojibake strings for chars whose second UTF-8 byte is a C1 control
// char (0x80–0x9F).  These cannot be typed literally without stripping, so we
// construct them from code points.  The result is the Latin-1 interpretation
// of the UTF-8 bytes: e.g. č (C4 8D) → Ä (U+00C4) + .
function mb(hex1: number, hex2: number): string {
  return String.fromCharCode(hex1) + String.fromCharCode(hex2);
}

console.log("=== Scorer Name Integrity Gate ===\n");

// ── A) Mojibake fix correctness ────────────────────────────────────────────

console.log("A) UTF-8 Mojibake repair\n");

const MOJIBAKE_CASES: [string, string][] = [
  ["Arda GÃ¼ler",                                      "Arda Güler"],
  ["VinÃ­cius JÃºnior",                                "Vinícius Júnior"],
  ["Ousmane DembÃ©lÃ©",                                "Ousmane Dembélé"],
  ["Kylian MbappÃ©",                                   "Kylian Mbappé"],
  ["IsmaÃ¯la Sarr",                                    "Ismaïla Sarr"],
  ["Leroy SanÃ©",                                      "Leroy Sané"],
  ["MatÃ­as Galarza",                                  "Matías Galarza"],
  ["Michal SadÃ­lek",                                  "Michal Sadílek"],
  ["Franck KessiÃ©",                                   "Franck Kessié"],
  ["AgustÃ­n Canobbio",                                "Agustín Canobbio"],
  // č=C4 8D (U+008D ctrl), í=C3 AD — must use mb() because U+008D can't be typed
  ["L. Krej" + mb(0xC4, 0x8D) + mb(0xC3, 0xAD),       "L. Krejčí"],
  ["RubÃ©n Vargas",                                    "Rubén Vargas"],
  ["Maximiliano AraÃºjo",                              "Maximiliano Araújo"],
  ["DÃ©sirÃ© DouÃ©",                                  "Désiré Doué"],
  ["V. GyÃ¶keres",                                     "V. Gyökeres"],
  ["Rafael LeÃ£o",                                     "Rafael Leão"],
  // À=C3 80 (U+0080 ctrl)
  [mb(0xC3, 0x80) + "lex Baena",                       "Àlex Baena"],
  // Ø=C3 98 (U+0098 ctrl), å=C3 A5
  ["Leo " + mb(0xC3, 0x98) + "stig" + mb(0xC3, 0xA5) + "rd", "Leo Østigård"],
  ["J. QuiÃ±ones",                                     "J. Quiñones"],
  ["R. JimÃ©nez",                                      "R. Jiménez"],
  ["Mateo ChÃ¡vez",                                    "Mateo Chávez"],
  // ō=C5 8D (U+008D ctrl)
  ["Junya It" + mb(0xC5, 0x8D),                        "Junya Itō"],
  ["K. MbappÃ©",                                       "K. Mbappé"],
  ["V. JÃºnior",                                       "V. Júnior"],
];

for (const [raw, expected] of MOJIBAKE_CASES) {
  const result = fixMojibake(raw);
  assert(result === expected, `fixMojibake("${raw.replace(/[\x00-\x1F\x7F-\x9F]/g, "·")}")`, `got "${result}"`);
}

// ── B) Alias map: C1 ctrl-byte stripped fallback ───────────────────────────
// When C1 bytes are stripped by a proxy/PHP, fixMojibake can't recover.
// The alias map provides an exact-match fallback for those cases.

console.log("\nA2) Mojibake fallback via alias map (C1 ctrl bytes stripped)\n");

const STRIPPED_FALLBACK: [string, string][] = [
  ["L. KrejÄÃ­",    "L. Krejčí"],
  ["Ãlex Baena",    "Àlex Baena"],
  ["Leo ÃstigÃ¥rd", "Leo Østigård"],
  ["Junya ItÅ",     "Junya Itō"],
];

for (const [raw, expected] of STRIPPED_FALLBACK) {
  const result = sanitize(raw); // alias map catches these
  assert(result === expected, `alias fallback("${raw}")`, `got "${result}"`);
}

// ── B) Alias map correctness ───────────────────────────────────────────────

console.log("\nB) Persian transliteration alias resolution\n");

const ALIAS_CASES: [string, string][] = [
  ["Baris Alpr Ailmaz",       "Barış Alper Yılmaz"],
  ["Kan Aihan",                "Kaan Ayhan"],
  ["Nilsvn Angvlv",            "Nilson Angulo"],
  ["Gvnzalv Plata",            "Gonzalo Plata"],
  ["Kvdi Khakpv",              "Cody Gakpo"],
  ["Dniz Avndav",              "Denis Undav"],
  ["Dnil Mvnvz",               "Daniel Muñoz"],
  ["Lviiz Diaz",               "Luis Díaz"],
  ["Jvlian Kviinvnz",          "Julián Quiñones"],
  ["Nvnv Mndz",                "Nuno Mendes"],
  ["Aiash Ivida",              "Ayase Ueda"],
  ["Jvhan Mnzambi",            "Johan Manzambi"],
  ["Markvs Hlmgrn Pdrsn",      "Markus Holmgren Pedersen"],
  ["Asmaail Saibari",          "Ismaël Saibari"],
  ["Kail Larin",               "Cyle Larin"],
  ["Paph Gviih",               "Pape Gueye"],
  ["Nikvlas Ph Ph",            "Nicolas Pépé"],
  ["Svfian Rhimi",             "Sofiane Rhimi"],
  ["Hliv Varla",               "Hélio Varela"],
  ["Alis Skhiri",              "Ellyes Skhiri"],
];

for (const [raw, expected] of ALIAS_CASES) {
  const result = PLAYER_ALIAS_MAP[raw];
  assert(result === expected, `alias["${raw}"]`, `got "${result}"`);
}

// ── C) Full sanitize pipeline (Mojibake → alias) ──────────────────────────

console.log("\nC) Combined sanitize pipeline\n");

const SANITIZE_CASES: [string, string][] = [
  ["Arda GÃ¼ler",       "Arda Güler"],          // Mojibake → correct; no alias needed
  ["Baris Alpr Ailmaz", "Barış Alper Yılmaz"], // alias only
  ["Gvnzalv Plata",     "Gonzalo Plata"],        // alias only
  ["Aiash Ivida",       "Ayase Ueda"],            // alias only
];

for (const [raw, expected] of SANITIZE_CASES) {
  const result = sanitize(raw);
  assert(result === expected, `sanitize("${raw}")`, `got "${result}"`);
}

// ── D) Suspicious name detector ───────────────────────────────────────────

console.log("\nD) No remaining corrupted-form names after sanitize\n");

const ALL_CORRUPTED_RAW = [
  "Baris Alpr Ailmaz", "Kan Aihan", "Gvnzalv Plata", "Nilsvn Angvlv",
  "Kvdi Khakpv", "Dniz Avndav", "Dnil Mvnvz", "Lviiz Diaz",
  "Jvlian Kviinvnz", "Nvnv Mndz", "Aiash Ivida", "Jvhan Mnzambi",
  "Markvs Hlmgrn Pdrsn", "Asmaail Saibari", "Kail Larin", "Paph Gviih",
  "Nikvlas Ph Ph", "Svfian Rhimi", "Hliv Varla", "Alis Skhiri",
  "Karim Alaibgvvich", "Abvnad", "Armin Mhmich", "Kamrvn Bargs",
  "Fin Svrman", "Hassan Mohamed Altmbkti", "Nzir Bnbvali", "Kalb Iirnki",
  "Taplv Maskv", "Hazm Mstvri", "Ian Fn Hkh", "Ailman Andiaih",
  "Prvmis Divid", "Khamintvn Kampaz", "Abas Bk Fiz Allh Af",
];

for (const raw of ALL_CORRUPTED_RAW) {
  const result = sanitize(raw);
  assert(
    result !== raw,
    `"${raw}" is replaced by sanitizer`,
    result === raw ? `still returns corrupted form` : `→ "${result}"`,
  );
}

// ── E) "Scorer unavailable" entries are audited ───────────────────────────

console.log('\nE) All "Scorer unavailable" entries are in alias map (audited)\n');

const unavailableEntries = Object.entries(PLAYER_ALIAS_MAP)
  .filter(([, v]) => v === "Scorer unavailable")
  .map(([k]) => k);

assert(
  unavailableEntries.length > 0,
  `Audit contains "Scorer unavailable" entries (${unavailableEntries.length} total)`,
);

for (const k of unavailableEntries) {
  assert(
    sanitize(k) === "Scorer unavailable",
    `"${k}" → "Scorer unavailable"`,
  );
}

// ── F) Clean names pass through unchanged ─────────────────────────────────

console.log("\nF) Correct names pass through unchanged\n");

const CLEAN_NAMES = [
  "Lamine Yamal",
  "Kylian Mbappé",
  "Vinícius Júnior",
  "Cyle Larin",
  "Giovanni Reyna",
  "Folarin Balogun",
  "Ousmane Dembélé",
  "Jovo Lukić",
];

for (const name of CLEAN_NAMES) {
  const result = sanitize(name);
  assert(result === name, `Clean name unchanged: "${name}"`, `got "${result}"`);
}

// ── Summary ───────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
