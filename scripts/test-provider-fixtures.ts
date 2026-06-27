/**
 * Deterministic offline provider fixture tests.
 *
 * Covers normal ASCII, canonical Unicode, mojibake repair, C1-stripped
 * fallback aliases, provider-supplied malformed romanization, own goals,
 * wrong-match/wrong-team/wrong-provider rejection, missing context, and
 * provider-player-ID precedence.
 */

import {
  PLAYER_ALIASES,
  findPlayerAlias,
  resolvePlayerAlias,
} from "../lib/worldcup26PlayerAliases";
import { applyVerifiedGoalCorrections } from "../lib/verifiedMatchEventCorrections";
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

function resolve(
  rawName: string,
  scoringTeam: string,
  matchId: string,
  eventMinute?: number | null,
  stoppageMinute?: number | null,
) {
  return resolvePlayerAlias({
    provider: "worldcup26.ir",
    matchId,
    eventMinute,
    stoppageMinute: stoppageMinute ?? null,
    scoringTeam,
    rawName: fixMojibake(rawName),
  });
}

console.log("=== Provider Fixture Tests (offline) ===\n");

console.log("F1) Normal ASCII and canonical Unicode pass through\n");
assert(fixMojibake("Folarin Balogun") === "Folarin Balogun", "ASCII unchanged");
assert(fixMojibake("Arda Güler") === "Arda Güler", "canonical Unicode unchanged");
assert(fixMojibake("Arda GÃ¼ler") === "Arda Güler", "genuine mojibake repaired");

console.log("\nF2) Context-constrained malformed romanization aliases\n");
assert(resolve("Baris Alpr Ailmaz", "Turkey", "turkey-vs-united-states-jun25", 31) === "Barış Alper Yılmaz", "Turkey-USA Yilmaz alias resolves with exact event context");
assert(resolve("Kan Aihan", "Turkey", "turkey-vs-united-states-jun25", 90, 8) === "Kaan Ayhan", "Turkey-USA Ayhan alias resolves with stoppage context");
assert(resolve("Baris Alpr Ailmaz", "Turkey", "turkey-vs-paraguay-jun19", 31) === "Baris Alpr Ailmaz", "same malformed string rejected in another Turkey match");
assert(resolve("Baris Alpr Ailmaz", "United States", "turkey-vs-united-states-jun25", 31) === "Baris Alpr Ailmaz", "same malformed string rejected for wrong team");
assert(
  resolvePlayerAlias({
    provider: "espn",
    matchId: "turkey-vs-united-states-jun25",
    eventMinute: 31,
    scoringTeam: "Turkey",
    rawName: "Baris Alpr Ailmaz",
  }) === "Baris Alpr Ailmaz",
  "wrong provider rejected",
);
assert(
  resolvePlayerAlias({
    provider: "worldcup26.ir",
    scoringTeam: "Turkey",
    rawName: "Baris Alpr Ailmaz",
  }) === "Baris Alpr Ailmaz",
  "missing match context fails closed",
);
assert(
  resolvePlayerAlias({
    provider: "worldcup26.ir",
    matchId: "turkey-vs-united-states-jun25",
    eventMinute: 31,
    scoringTeam: "Turkey",
    rawName: "Baris Alpr Ailmaz",
    providerPlayerId: "worldcup26.ir:turkey:kaan-ayhan",
  }) === "Kaan Ayhan",
  "provider player ID takes precedence over textual alias",
);

console.log("\nF3) Reusable verified aliases remain match-scoped\n");
assert(resolve("Dnil Mvnvz", "Colombia", "uzbekistan-vs-colombia-jun17", 40) === "Daniel Muñoz", "Daniel Munoz resolves in Uzbekistan-Colombia");
assert(resolve("Dnil Mvnvz", "Colombia", "colombia-vs-dr-congo-jun23", 76) === "Daniel Muñoz", "Daniel Munoz resolves in Colombia-DR Congo");
assert(resolve("Dnil Mvnvz", "Colombia", "colombia-vs-portugal-jun27", 76) === "Dnil Mvnvz", "Daniel Munoz alias rejected outside verified matchIds");

console.log("\nF4) C1-stripped mojibake fallbacks require match context\n");
assert(resolve("Junya ItÅ", "Japan", "tunisia-vs-japan-jun20") === "Junya Itō", "Junya Ito C1 fallback resolves with context");
assert(resolve("Junya ItÅ", "Japan", "japan-vs-anyone-jun99") === "Junya ItÅ", "Junya Ito C1 fallback rejected for wrong match");

console.log("\nF5) Own-goal alias metadata and corrections\n");
const og = findPlayerAlias({
  provider: "worldcup26.ir",
  matchId: "tunisia-vs-netherlands-jun25",
  eventMinute: 3,
  scoringTeam: "Netherlands",
  rawName: "Alis Skhiri",
});
assert(og?.canonical === "Ellyes Skhiri", "Skhiri alias resolves in exact match");
assert(og?.isOwnGoal === true, "Skhiri alias is own goal");
assert(og?.playerTeam === "Tunisia", "Skhiri player team is Tunisia");

const tunisiaEvents = applyVerifiedGoalCorrections("tunisia-vs-netherlands-jun25", []);
assert(tunisiaEvents.length === 4, "Tunisia-Netherlands correction has 4 events");
assert(tunisiaEvents[0]?.playerName === "Ellyes Skhiri" && tunisiaEvents[0]?.isOwnGoal === true, "Tunisia-Netherlands first event is Skhiri OG");

console.log("\nF6) Inventory sanity\n");
assert(PLAYER_ALIASES.filter((e) => e.canonical === "Scorer unavailable").length === 0, "no alias maps to Scorer unavailable");
assert(PLAYER_ALIASES.every((e) => e.matchIds.length > 0), "every alias enforces at least one matchId");
assert(PLAYER_ALIASES.every((e) => e.source.length > 0), "every alias has source text");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
