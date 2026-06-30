import { readFileSync } from "fs";
import { join } from "path";
import { parseFootballDataScore } from "../lib/footballDataScore";
import type { LiveMatchData, LiveMatchStatus } from "../lib/liveMatchData";
import { buildTournamentLiveSnapshot, hasLiveWindow } from "../lib/liveSnapshot";
import { MATCHES, matchSlug, type KnockoutMatch } from "../lib/matches";
import { buildKnockoutResolution } from "../lib/knockoutResolution";
import { mapEspnFixturesToCanonicalMatches, parseEspnGoalEvents, parseEspnScoreboard } from "../lib/espnProvider";

let passed = 0;
let failed = 0;

function assert(condition: unknown, message: string) {
  if (!condition) {
    failed++;
    console.error(`FAIL ${message}`);
    return;
  }
  passed++;
  console.log(`PASS ${message}`);
}

function fixture(name: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(process.cwd(), "scripts", "fixtures", "incident-p0", name), "utf8")) as Record<string, unknown>;
}

function matchByNumber(matchNumber: number): KnockoutMatch {
  const match = MATCHES.find((candidate): candidate is KnockoutMatch =>
    "matchNumber" in candidate && candidate.matchNumber === matchNumber,
  );
  if (!match) throw new Error(`Missing match ${matchNumber}`);
  return match;
}

function liveFromFootballData(raw: Record<string, unknown>): LiveMatchData {
  const parsed = parseFootballDataScore(raw);
  return {
    provider: "football-data.org",
    providerMatchId: raw.id as number,
    status: raw.status as LiveMatchStatus,
    homeScore: parsed.homeScore,
    awayScore: parsed.awayScore,
    winner: parsed.winner,
    stage: parsed.stage,
    rawStage: parsed.rawStage,
    scoreDuration: parsed.duration,
    regularTimeScore: parsed.regularTimeScore,
    extraTimeScore: parsed.extraTimeScore,
    penaltyShootoutScore: parsed.penaltyShootoutScore,
    utcDate: raw.utcDate as string,
    lastSyncedAt: "2026-06-30T06:10:00.000Z",
    rawStatus: raw.status as string,
    eventDataAvailable: false,
  };
}

const fd74 = fixture("football-data-match-537415.json");
const fd75 = fixture("football-data-match-537418.json");
const parsed74 = parseFootballDataScore(fd74);
const parsed75 = parseFootballDataScore(fd75);

assert(parsed74.rawStage === "LAST_32" && parsed74.stage === "R32", "Match 74 football-data LAST_32 maps to Round of 32");
assert(parsed74.duration === "PENALTY_SHOOTOUT", "Match 74 duration is PENALTY_SHOOTOUT");
assert(parsed74.homeScore === 1 && parsed74.awayScore === 1, "Match 74 display score is 1-1, not shootout aggregate 4-5");
assert(parsed74.penaltyShootoutScore?.home === 3 && parsed74.penaltyShootoutScore.away === 4, "Match 74 shootout score is 3-4");
assert(parsed74.winner === "AWAY_TEAM", "Match 74 winner remains Paraguay from football-data winner");

assert(parsed75.rawStage === "LAST_32" && parsed75.stage === "R32", "Match 75 football-data LAST_32 maps to Round of 32");
assert(parsed75.duration === "PENALTY_SHOOTOUT", "Match 75 duration is PENALTY_SHOOTOUT");
assert(parsed75.homeScore === 1 && parsed75.awayScore === 1, "Match 75 display score is 1-1, not shootout aggregate 3-4");
assert(parsed75.penaltyShootoutScore?.home === 2 && parsed75.penaltyShootoutScore.away === 3, "Match 75 shootout score is 2-3");
assert(parsed75.winner === "AWAY_TEAM", "Match 75 winner remains Morocco from football-data winner");

const scoreboard = parseEspnScoreboard(fixture("espn-scoreboard-20260629-20260630.json"));
const espnMapping = mapEspnFixturesToCanonicalMatches({
  providerFixtures: scoreboard.fixtures,
  canonicalMatches: [matchByNumber(74), matchByNumber(75)],
});
const mappingByMatch = new Map(espnMapping.mappings.map((mapping) => [mapping.canonicalMatchId, mapping.providerFixtureId]));

assert(mappingByMatch.get("match-74") === "760489", "ESPN maps Germany-Paraguay to canonical match-74");
assert(mappingByMatch.get("match-75") === "760488", "ESPN maps Netherlands-Morocco to canonical match-75");

const espn74Goals = parseEspnGoalEvents(fixture("espn-summary-760489.json"), { providerFixtureId: "760489" });
const espn75Goals = parseEspnGoalEvents(fixture("espn-summary-760488.json"), { providerFixtureId: "760488" });
assert(espn74Goals.events.length === 2, "ESPN summary 760489 yields two non-shootout goal events");
assert(espn75Goals.events.length === 2, "ESPN summary 760488 yields two non-shootout goal events");

async function main() {
  const snapshot = await buildTournamentLiveSnapshot({
    liveData: new Map([
      [537415, liveFromFootballData(fd74)],
      [537418, liveFromFootballData(fd75)],
    ]),
    worldcupGames: null,
    generatedAt: "2026-06-30T06:10:00.000Z",
    primaryProviderOk: true,
    secondaryProviderOk: false,
    skipEnrichment: true,
  });
  const m74 = snapshot.matches[matchSlug(matchByNumber(74))];
  const m75 = snapshot.matches[matchSlug(matchByNumber(75))];

  assert(m74.status === "FINISHED" && m74.homeScore === 1 && m74.awayScore === 1, "Snapshot Match 74 keeps football-data status with normalized display score");
  assert(m75.status === "FINISHED" && m75.homeScore === 1 && m75.awayScore === 1, "Snapshot Match 75 keeps football-data status with normalized display score");
  assert(m74.live?.penaltyShootoutScore?.away === 4 && m75.live?.penaltyShootoutScore?.away === 3, "Snapshot preserves shootout metadata for UI");

  const resolved = buildKnockoutResolution(snapshot.matches);
  assert(resolved[89]?.home?.teamKey === "paraguay", "Bracket resolves Match 89 home as Paraguay, winner of Match 74");
  assert(resolved[90]?.away?.teamKey === "morocco", "Bracket resolves Match 90 away as Morocco, winner of Match 75");
  assert(hasLiveWindow(new Date("2026-06-30T00:00:00Z"), [matchByNumber(74)]), "Live cache window covers late extra-time/shootout provider reconciliation");

  console.log(`${passed} passed / ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  failed++;
  console.error(err);
  console.log(`${passed} passed / ${failed} failed`);
  process.exitCode = 1;
});
