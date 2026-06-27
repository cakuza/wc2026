/**
 * Scorer name integrity gate.
 *
 * Verifies the full fail-closed alias contract and all known corrupted
 * provider strings using deterministic context. No live network calls.
 */

import { PLAYER_ALIASES, findPlayerAlias, resolvePlayerAlias } from "../lib/worldcup26PlayerAliases";
import { fixMojibake } from "../lib/worldcup26Provider";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string, detail?: string) {
  if (condition) {
    console.log(`  PASS  ${msg}`);
    passed++;
  } else {
    console.error(`  FAIL  ${msg}${detail ? ` -- ${detail}` : ""}`);
    failed++;
  }
}

function resolve(rawName: string, scoringTeam: string, matchId: string, eventMinute?: number | null, stoppageMinute?: number | null) {
  return resolvePlayerAlias({
    provider: "worldcup26.ir",
    matchId,
    eventMinute,
    stoppageMinute: stoppageMinute ?? null,
    scoringTeam,
    rawName: fixMojibake(rawName),
  });
}

console.log("=== Scorer Name Integrity Gate ===\n");

console.log("A) Mojibake repair\n");
const mojibakeCases: [string, string][] = [
  ["Arda GÃ¼ler", "Arda Güler"],
  ["VinÃ­cius JÃºnior", "Vinícius Júnior"],
  ["Kylian MbappÃ©", "Kylian Mbappé"],
  ["Rafael LeÃ£o", "Rafael Leão"],
];
for (const [raw, expected] of mojibakeCases) {
  assert(fixMojibake(raw) === expected, `fixMojibake(${raw})`, `got ${fixMojibake(raw)}`);
}

console.log("\nB) Known malformed romanization aliases resolve only in verified context\n");
const aliasCases: [string, string, string, string, number?, number?][] = [
  ["Baris Alpr Ailmaz", "Barış Alper Yılmaz", "Turkey", "turkey-vs-united-states-jun25", 31],
  ["Kan Aihan", "Kaan Ayhan", "Turkey", "turkey-vs-united-states-jun25", 90, 8],
  ["Kvdi Khakpv", "Cody Gakpo", "Netherlands", "netherlands-vs-sweden-jun20", 47],
  ["Dniz Avndav", "Denis Undav", "Germany", "germany-vs-ivory-coast-jun20", 68],
  ["Dnil Mvnvz", "Daniel Muñoz", "Colombia", "uzbekistan-vs-colombia-jun17", 40],
  ["Kalb Iirnki", "Caleb Yirenkyi", "Ghana", "ghana-vs-panama-jun17", 90, 5],
  ["Fin Svrman", "Finn Surman", "New Zealand", "new-zealand-vs-egypt-jun21", 15],
  ["Markvs Hlmgrn Pdrsn", "Markus Holmgren Pedersen", "Norway", "norway-vs-senegal-jun22", 43],
  ["Hassan Mohamed Altmbkti", "Hassan Altambakti", "Spain", "spain-vs-saudi-arabia-jun21", 49],
  ["Abdalvhid Namtvf", "Abduvohid Nematov", "Portugal", "portugal-vs-uzbekistan-jun23", 60],
  ["Alis Skhiri", "Ellyes Skhiri", "Netherlands", "tunisia-vs-netherlands-jun25", 3],
  ["Karim Alaibgvvich", "Kerim Alajbegović", "Bosnia & Herzegovina", "bosnia-vs-qatar-jun24", 29],
  ["Abvnad", "Sultan Al-Brake", "Bosnia & Herzegovina", "bosnia-vs-qatar-jun24", 34],
  ["Armin Mhmich", "Ermin Mahmić", "Bosnia & Herzegovina", "bosnia-vs-qatar-jun24", 80],
  ["Taplv Maskv", "Thapelo Maseko", "South Africa", "south-africa-vs-south-korea-jun24"],
  ["Nzir Bnbvali", "Nadhir Benbouali", "Algeria", "jordan-vs-algeria-jun22"],
  ["Ailman Andiaih", "Iliman Ndiaye", "Senegal", "senegal-vs-iraq-jun26"],
  ["Prvmis Divid", "Promise David", "Canada", "switzerland-vs-canada-jun24"],
  ["Abas Bk Fiz Allh Af", "Abbosbek Fayzullayev", "Uzbekistan", "uzbekistan-vs-colombia-jun17"],
  ["Khamintvn Kampaz", "Jaminton Campaz", "Colombia", "uzbekistan-vs-colombia-jun17", 90, 9],
];

for (const [raw, expected, team, matchId, minute, stoppage] of aliasCases) {
  const result = resolve(raw, team, matchId, minute, stoppage);
  assert(result === expected, `${raw} -> ${expected}`, `got ${result}`);
}

console.log("\nC) Fail-closed adversarial checks\n");
assert(resolve("Baris Alpr Ailmaz", "Turkey", "turkey-vs-paraguay-jun19", 31) === "Baris Alpr Ailmaz", "same raw rejected in wrong Turkey match");
assert(resolve("Baris Alpr Ailmaz", "United States", "turkey-vs-united-states-jun25", 31) === "Baris Alpr Ailmaz", "same raw rejected for wrong team");
assert(resolvePlayerAlias({ provider: "espn", matchId: "turkey-vs-united-states-jun25", scoringTeam: "Turkey", rawName: "Baris Alpr Ailmaz", eventMinute: 31 }) === "Baris Alpr Ailmaz", "same raw rejected for wrong provider");
assert(resolvePlayerAlias({ provider: "worldcup26.ir", scoringTeam: "Turkey", rawName: "Baris Alpr Ailmaz" }) === "Baris Alpr Ailmaz", "missing match context returns raw");
assert(resolvePlayerAlias({
  provider: "worldcup26.ir",
  matchId: "turkey-vs-united-states-jun25",
  scoringTeam: "Turkey",
  eventMinute: 31,
  rawName: "Baris Alpr Ailmaz",
  providerPlayerId: "worldcup26.ir:turkey:kaan-ayhan",
}) === "Kaan Ayhan", "provider player ID wins over textual alias");

console.log("\nD) Own-goal metadata\n");
for (const rawName of ["Alis Skhiri", "Kamrvn Bargs", "Hassan Mohamed Altmbkti", "Abvnad", "Abdalvhid Namtvf"]) {
  const entry = PLAYER_ALIASES.find((e) => e.rawValue === rawName);
  assert(entry?.isOwnGoal === true, `${rawName} is marked own goal`);
  assert(Boolean(entry?.playerTeam), `${rawName} has playerTeam`);
}

console.log("\nE) Alias inventory sanity\n");
assert(PLAYER_ALIASES.filter((e) => e.canonical === "Scorer unavailable").length === 0, "no aliases produce Scorer unavailable");
assert(PLAYER_ALIASES.every((e) => e.matchIds.length > 0), "all aliases enforce matchIds");
assert(findPlayerAlias({ provider: "worldcup26.ir", rawName: "Baris Alpr Ailmaz" }) === undefined, "findPlayerAlias fails closed without match/team");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
