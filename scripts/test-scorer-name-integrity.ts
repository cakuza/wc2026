/**
 * Scorer name integrity gate.
 *
 * Verifies that the full alias + Mojibake sanitization pipeline resolves
 * every known corrupted player name to its canonical form and that all
 * previously-unresolvable entries have been promoted to confirmed canonical
 * names.
 *
 * Gate criteria:
 *   1. All corrupted raw forms resolve to a name different from the raw form.
 *   2. No remaining "Scorer unavailable" entries exist — every previously-
 *      unresolvable entry now has a confirmed canonical name.
 *   3. "Gessime Yassine" passes through unchanged (it is the player's real name).
 *   4. OG entries carry the correct playerTeam and isOwnGoal markers.
 *   5. Clean canonical names are not altered.
 *
 * All tests run offline (no network).
 *
 * Usage:  npx tsx scripts/test-scorer-name-integrity.ts
 */

import {
  PLAYER_ALIASES,
  resolvePlayerName,
  findPlayerAlias,
} from "../lib/worldcup26PlayerAliases";

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

// ── Inline helpers (same logic as lib/worldcup26Provider.ts) ─────────────────

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

// Construct strings whose second UTF-8 byte is a C1 control char (0x80–0x9F).
// These can't be typed as literals because editors/terminals strip them.
function mb(hex1: number, hex2: number): string {
  return String.fromCharCode(hex1) + String.fromCharCode(hex2);
}

console.log("=== Scorer Name Integrity Gate ===\n");

// ── A) UTF-8 Mojibake repair ──────────────────────────────────────────────────

console.log("A) UTF-8 Mojibake repair\n");

const MOJIBAKE_CASES: [string, string][] = [
  ["Arda GÃ¼ler",              "Arda Güler"],
  ["VinÃ­cius JÃºnior",        "Vinícius Júnior"],
  ["Ousmane DembÃ©lÃ©",        "Ousmane Dembélé"],
  ["Kylian MbappÃ©",            "Kylian Mbappé"],
  ["IsmaÃ¯la Sarr",             "Ismaïla Sarr"],
  ["Leroy SanÃ©",               "Leroy Sané"],
  ["MatÃ­as Galarza",           "Matías Galarza"],
  ["Michal SadÃ­lek",           "Michal Sadílek"],
  ["Franck KessiÃ©",            "Franck Kessié"],
  ["AgustÃ­n Canobbio",         "Agustín Canobbio"],
  ["RubÃ©n Vargas",             "Rubén Vargas"],
  ["Maximiliano AraÃºjo",       "Maximiliano Araújo"],
  ["DÃ©sirÃ© DouÃ©",           "Désiré Doué"],
  ["V. GyÃ¶keres",              "V. Gyökeres"],
  ["Rafael LeÃ£o",              "Rafael Leão"],
  ["J. QuiÃ±ones",              "J. Quiñones"],
  ["R. JimÃ©nez",               "R. Jiménez"],
  ["Mateo ChÃ¡vez",             "Mateo Chávez"],
  ["K. MbappÃ©",                "K. Mbappé"],
  ["V. JÃºnior",                "V. Júnior"],
  // C1-range second bytes handled by fixMojibake:
  ["L. Krej" + mb(0xC4, 0x8D) + mb(0xC3, 0xAD), "L. Krejčí"],
  [mb(0xC3, 0x80) + "lex Baena",                  "Àlex Baena"],
  ["Leo " + mb(0xC3, 0x98) + "stig" + mb(0xC3, 0xA5) + "rd", "Leo Østigård"],
  ["Junya It" + mb(0xC5, 0x8D),                   "Junya Itō"],
];

for (const [raw, expected] of MOJIBAKE_CASES) {
  const result = fixMojibake(raw);
  assert(
    result === expected,
    `fixMojibake("${raw.replace(/[\x00-\x1F\x7F-\x9F]/g, "·")}")`,
    `got "${result}"`,
  );
}

// ── A2) C1-stripped Mojibake fallback via alias map ───────────────────────────

console.log("\nA2) Mojibake alias fallback (C1 control bytes stripped by proxy)\n");

const C1_FALLBACKS: [string, string][] = [
  ["L. KrejÄÃ­",     "L. Krejčí"],
  ["Ãlex Baena",     "Àlex Baena"],
  ["Leo ÃstigÃ¥rd",  "Leo Østigård"],
  ["Junya ItÅ",      "Junya Itō"],
];

for (const [raw, expected] of C1_FALLBACKS) {
  const result = sanitize(raw);
  assert(result === expected, `alias fallback("${raw}")`, `got "${result}"`);
}

// ── B) Persian transliteration alias resolution ───────────────────────────────

console.log("\nB) Persian transliteration aliases — all 17 previously-unavailable now resolved\n");

const ALIAS_CASES: [string, string, string][] = [
  // [raw, canonical, scoringTeam]
  // Turkey
  ["Baris Alpr Ailmaz",     "Barış Alper Yılmaz",      "Turkey"],
  ["Kan Aihan",              "Kaan Ayhan",               "Turkey"],
  // Ecuador
  ["Nilsvn Angvlv",          "Nilson Angulo",            "Ecuador"],
  ["Gvnzalv Plata",          "Gonzalo Plata",            "Ecuador"],
  // Netherlands
  ["Kvdi Khakpv",            "Cody Gakpo",               "Netherlands"],
  ["Ian Fn Hkh",             "Jan van Hecke",            "Netherlands"],
  // Germany
  ["Dniz Avndav",            "Denis Undav",              "Germany"],
  // Colombia
  ["Dnil Mvnvz",             "Daniel Muñoz",             "Colombia"],
  ["Lviiz Diaz",             "Luis Díaz",                "Colombia"],
  ["Khamintvn Kampaz",       "Jaminton Campaz",          "Colombia"],
  // Uzbekistan
  ["Abas Bk Fiz Allh Af",   "Abbosbek Fayzullayev",    "Uzbekistan"],
  // Mexico
  ["Jvlian Kviinvnz",        "Julián Quiñones",          "Mexico"],
  // Portugal
  ["Nvnv Mndz",              "Nuno Mendes",              "Portugal"],
  ["Abdalvhid Namtvf",       "Abduvohid Nematov",        "Portugal"],
  // Japan
  ["Aiash Ivida",            "Ayase Ueda",               "Japan"],
  // Switzerland/Canada
  ["Jvhan Mnzambi",          "Johan Manzambi",           "Switzerland"],
  ["Prvmis Divid",           "Promise David",            "Canada"],
  // Norway
  ["Markvs Hlmgrn Pdrsn",    "Markus Holmgren Pedersen","Norway"],
  // Algeria
  ["Nzir Bnbvali",           "Nadhir Benbouali",        "Algeria"],
  // Morocco
  ["Asmaail Saibari",        "Ismaël Saibari",           "Morocco"],
  ["Svfian Rhimi",           "Soufiane Rahimi",          "Morocco"],
  // Canada
  ["Kail Larin",             "Cyle Larin",               "Canada"],
  // Senegal
  ["Paph Gviih",             "Pape Gueye",               "Senegal"],
  ["Ailman Andiaih",         "Iliman Ndiaye",            "Senegal"],
  // Ivory Coast
  ["Nikvlas Ph Ph",          "Nicolas Pépé",             "Ivory Coast"],
  // Cape Verde
  ["Hliv Varla",             "Hélio Varela",             "Cape Verde"],
  // Tunisia
  ["Alis Skhiri",            "Ellyes Skhiri",            "Netherlands"], // OG → credited to Netherlands
  ["Hazm Mstvri",            "Hazem Mastouri",           "Tunisia"],
  // Bosnia
  ["Karim Alaibgvvich",      "Kerim Alajbegović",        "Bosnia & Herzegovina"],
  ["Abvnad",                 "Sultan Al-Brake",          "Bosnia & Herzegovina"],
  ["Armin Mhmich",           "Ermin Mahmić",             "Bosnia & Herzegovina"],
  // USA / Australia
  ["Kamrvn Bargs",           "Cameron Burgess",          "United States"],
  // New Zealand
  ["Fin Svrman",             "Finn Surman",              "New Zealand"],
  // Saudi Arabia OG
  ["Hassan Mohamed Altmbkti","Hassan Altambakti",        "Spain"],
  // Ghana
  ["Kalb Iirnki",            "Caleb Yirenkyi",           "Ghana"],
  // South Africa
  ["Taplv Maskv",            "Thapelo Maseko",           "South Africa"],
];

for (const [raw, expected, team] of ALIAS_CASES) {
  const result = resolvePlayerName(raw, team);
  assert(
    result === expected,
    `resolvePlayerName("${raw}", "${team}")`,
    `got "${result}"`,
  );
}

// ── C) Zero "Scorer unavailable" entries remain ───────────────────────────────

console.log('\nC) No "Scorer unavailable" entries in alias table\n');

const unavailable = PLAYER_ALIASES.filter((e) => e.canonical === "Scorer unavailable");
assert(
  unavailable.length === 0,
  `All aliases have confirmed canonical names (0 unavailable)`,
  unavailable.length > 0
    ? `Still unavailable: ${unavailable.map((e) => e.rawValue).join(", ")}`
    : undefined,
);

// ── D) "Gessime Yassine" is the real player name — passes through unchanged ───

console.log('\nD) "Gessime Yassine" is the real name — not re-mapped\n');

const gessimeResult = sanitize("Gessime Yassine", "Morocco");
assert(
  gessimeResult === "Gessime Yassine",
  `"Gessime Yassine" unchanged (confirmed real name: Sky Sports / ABC News / Fox Sports)`,
  `got "${gessimeResult}"`,
);

// ── E) OG alias entries carry correct metadata ─────────────────────────────────

console.log("\nE) Own-goal alias entries carry correct OG metadata\n");

const OG_CHECKS: {
  raw: string;
  team: string;
  canonical: string;
  playerTeam: string;
}[] = [
  { raw: "Alis Skhiri",            team: "Netherlands",       canonical: "Ellyes Skhiri",    playerTeam: "Tunisia" },
  { raw: "Kamrvn Bargs",           team: "United States",     canonical: "Cameron Burgess",   playerTeam: "Australia" },
  { raw: "Hassan Mohamed Altmbkti",team: "Spain",             canonical: "Hassan Altambakti", playerTeam: "Saudi Arabia" },
  { raw: "Abvnad",                 team: "Bosnia & Herzegovina",canonical: "Sultan Al-Brake",  playerTeam: "Qatar" },
  { raw: "Abdalvhid Namtvf",       team: "Portugal",          canonical: "Abduvohid Nematov", playerTeam: "Uzbekistan" },
];

for (const { raw, team, canonical, playerTeam } of OG_CHECKS) {
  const entry = findPlayerAlias(raw, team);
  assert(!!entry, `findPlayerAlias("${raw}", "${team}") exists`);
  assert(
    entry?.canonical === canonical,
    `  canonical = "${canonical}"`,
    `got "${entry?.canonical}"`,
  );
  assert(
    entry?.isOwnGoal === true,
    `  isOwnGoal = true`,
    `got ${String(entry?.isOwnGoal)}`,
  );
  assert(
    entry?.playerTeam === playerTeam,
    `  playerTeam = "${playerTeam}"`,
    `got "${entry?.playerTeam}"`,
  );
}

// ── F) Combined sanitize pipeline ─────────────────────────────────────────────

console.log("\nF) Combined sanitize pipeline (Mojibake → alias)\n");

const PIPELINE_CASES: [string, string, string?][] = [
  ["Arda GÃ¼ler",        "Arda Güler",          "Turkey"],    // Mojibake only
  ["Baris Alpr Ailmaz",  "Barış Alper Yılmaz",  "Turkey"],    // alias only
  ["Gvnzalv Plata",      "Gonzalo Plata",        "Ecuador"],   // alias only
  ["Aiash Ivida",        "Ayase Ueda",           "Japan"],     // alias only
  ["Gessime Yassine",    "Gessime Yassine",      "Morocco"],   // real name, unchanged
];

for (const [raw, expected, team] of PIPELINE_CASES) {
  const result = sanitize(raw, team);
  assert(result === expected, `sanitize("${raw}", ${team ?? "-"})`, `got "${result}"`);
}

// ── G) Clean canonical names pass through unchanged ───────────────────────────

console.log("\nG) Correct names unchanged\n");

const CLEAN_NAMES = [
  "Lamine Yamal",
  "Kylian Mbappé",
  "Vinícius Júnior",
  "Cyle Larin",
  "Giovanni Reyna",
  "Folarin Balogun",
  "Ousmane Dembélé",
  "Cristiano Ronaldo",
  "Ellyes Skhiri",
  "Cameron Burgess",
  "Hassan Altambakti",
  "Sultan Al-Brake",
  "Abduvohid Nematov",
];

for (const name of CLEAN_NAMES) {
  const result = sanitize(name);
  assert(result === name, `Clean name unchanged: "${name}"`, `got "${result}"`);
}

// ── H) All corrupted raw forms produce a different (resolved) output ───────────

console.log("\nH) Every corrupted raw form resolves to a different string\n");

const ALL_CORRUPTED = PLAYER_ALIASES
  .filter((e) => !e.rawValue.startsWith("L. KrejÄ"))  // skip C1-stripped variants (fixMojibake handles those before alias)
  .map((e) => ({ raw: e.rawValue, team: e.scoringTeam }));

for (const { raw, team } of ALL_CORRUPTED) {
  const result = sanitize(raw, team);
  assert(
    result !== raw,
    `"${raw}" resolves to canonical form`,
    `still returns corrupted form`,
  );
}

// ── Summary ────────────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
