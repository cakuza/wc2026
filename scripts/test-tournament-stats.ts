/**
 * Unit test for lib/tournamentStats.ts using mocked live data.
 *
 * Verifies Mexico 2–0 South Africa (FINISHED) produces:
 *   matchesPlayed = 1
 *   totalGoals = 2
 *   averageGoalsPerMatch = 2.0
 *   biggestWin = Mexico 2–0 South Africa (margin 2)
 *   highestScoringMatch = Mexico 2–0 South Africa (totalGoals 2)
 *   cleanSheets = 1 (Mexico kept a clean sheet)
 *
 * Usage:
 *   npx tsx scripts/test-tournament-stats.ts
 */

import { computeGroupStandings } from "../lib/groupStandings";
import { computeTopScorers, computeTournamentStats } from "../lib/tournamentStats";
import type { LiveMatchData } from "../lib/liveMatchData";

const MEXICO_PROVIDER_ID = 537327;
const USA_PROVIDER_ID = 537345;

const mockData: ReadonlyMap<number, LiveMatchData> = new Map([
  [
    MEXICO_PROVIDER_ID,
    {
      provider: "football-data.org",
      providerMatchId: MEXICO_PROVIDER_ID,
      status: "FINISHED",
      homeScore: 2,
      awayScore: 0,
      winner: "HOME_TEAM",
      lastSyncedAt: new Date().toISOString(),
      eventDataAvailable: false,
    },
  ],
]);

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  PASS  ${msg}`);
    passed++;
  } else {
    console.error(`  FAIL  ${msg}`);
    failed++;
  }
}

console.log("=== Tournament stats test ===\n");

const stats = computeTournamentStats(mockData);

assert(stats.matchesPlayed === 1,               "matchesPlayed = 1");
assert(stats.totalGoals === 2,                  "totalGoals = 2");
assert(stats.averageGoalsPerMatch === 2,         "averageGoalsPerMatch = 2.0");
assert(stats.cleanSheets === 1,                 "cleanSheets = 1 (Mexico conceded 0)");

assert(stats.highestScoringMatch !== null,       "highestScoringMatch not null");
assert(stats.highestScoringMatch?.homeKey === "mexico",     "highestScoringMatch.homeKey = mexico");
assert(stats.highestScoringMatch?.awayKey === "southAfrica","highestScoringMatch.awayKey = southAfrica");
assert(stats.highestScoringMatch?.homeScore === 2,          "highestScoringMatch.homeScore = 2");
assert(stats.highestScoringMatch?.awayScore === 0,          "highestScoringMatch.awayScore = 0");
assert(stats.highestScoringMatch?.totalGoals === 2,         "highestScoringMatch.totalGoals = 2");

assert(stats.biggestWin !== null,                "biggestWin not null");
assert(stats.biggestWin?.homeKey === "mexico",   "biggestWin.homeKey = mexico");
assert(stats.biggestWin?.margin === 2,           "biggestWin.margin = 2");

assert(stats.lastSyncedAt !== null,              "lastSyncedAt populated");

// Empty map: all zeros
const empty = computeTournamentStats(new Map());
assert(empty.matchesPlayed === 0,                "empty: matchesPlayed = 0");
assert(empty.totalGoals === 0,                   "empty: totalGoals = 0");
assert(empty.averageGoalsPerMatch === 0,          "empty: averageGoalsPerMatch = 0");
assert(empty.highestScoringMatch === null,        "empty: highestScoringMatch = null");
assert(empty.biggestWin === null,                 "empty: biggestWin = null");

const usaData: ReadonlyMap<number, LiveMatchData> = new Map([
  [
    USA_PROVIDER_ID,
    {
      provider: "football-data.org",
      providerMatchId: USA_PROVIDER_ID,
      status: "FINISHED",
      homeScore: 4,
      awayScore: 1,
      winner: "HOME_TEAM",
      lastSyncedAt: new Date().toISOString(),
      eventDataAvailable: true,
      goals: [
        {
          type: "OWN_GOAL",
          minute: 7,
          minuteLabel: "7'",
          teamName: "United States",
          playerTeamName: "Paraguay",
          playerName: "Damian Bobadilla",
          isOwnGoal: true,
        },
        {
          type: "GOAL",
          minute: 31,
          minuteLabel: "31'",
          teamName: "United States",
          playerName: "Folarin Balogun",
        },
        {
          type: "GOAL",
          minute: 45,
          stoppageTime: 5,
          minuteLabel: "45+5'",
          teamName: "United States",
          playerName: "Folarin Balogun",
        },
        {
          type: "GOAL",
          minute: 73,
          minuteLabel: "73'",
          teamName: "Paraguay",
          playerName: "Maurício",
        },
        {
          type: "GOAL",
          minute: 90,
          stoppageTime: 8,
          minuteLabel: "90+8'",
          teamName: "United States",
          playerName: "Giovanni Reyna",
        },
      ],
    },
  ],
]);

const usaStats = computeTournamentStats(usaData);
const usaTopScorers = computeTopScorers(usaData);
const usaStandings = computeGroupStandings(usaData);
const groupD = usaStandings["D"];
const unitedStatesRow = groupD.find((row) => row.teamKey === "unitedStates");
const paraguayRow = groupD.find((row) => row.teamKey === "paraguay");

assert(usaStats.matchesPlayed === 1, "USA-Paraguay: matchesPlayed = 1");
assert(usaStats.totalGoals === 5, "USA-Paraguay: team/tournament total includes all five goals");
assert(usaTopScorers.find((row) => row.playerName === "Folarin Balogun")?.goals === 2, "Balogun brace counts as 2 goals");
assert(usaTopScorers.find((row) => row.playerName === "Giovanni Reyna")?.goals === 1, "Reyna counts as 1 goal");
assert(usaTopScorers.find((row) => row.playerName === "Maurício")?.goals === 1, "Maurício counts as 1 goal");
assert(!usaTopScorers.some((row) => row.playerName === "Damian Bobadilla"), "Bobadilla own goal is excluded from top scorers");
assert(unitedStatesRow?.goalsFor === 4 && unitedStatesRow.goalsAgainst === 1, "United States standings total is 4-1");
assert(paraguayRow?.goalsFor === 1 && paraguayRow.goalsAgainst === 4, "Paraguay standings total is 1-4");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
