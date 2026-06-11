/**
 * Unit test for event-based stat computation (lib/tournamentStats.ts).
 *
 * Tests:
 * A) computeTopScorers from real event-shaped data
 * B) If eventDataAvailable=false, top scorers returns empty array
 * C) OWN_GOAL events don't count toward scorer's tally
 * D) computeTeamLeaderboards from standings
 *
 * Usage:
 *   npx tsx scripts/test-event-stats.ts
 */

import { computeTopScorers, computeTeamLeaderboards } from "../lib/tournamentStats";
import type { LiveMatchData, LiveMatchEvent } from "../lib/liveMatchData";
import type { StandingRow } from "../lib/groupStandings";

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

console.log("=== Event stats test ===\n");

// ── A) Top scorers from event data ──────────────────────────────────────────

const mockGoals: LiveMatchEvent[] = [
  { type: "GOAL",        minute: 23, teamName: "Mexico",       playerName: "Player A", },
  { type: "GOAL",        minute: 67, teamName: "Mexico",       playerName: "Player A", },
  { type: "PENALTY_GOAL",minute: 71, teamName: "Mexico",       playerName: "Player B", },
  { type: "OWN_GOAL",    minute: 80, teamName: "South Africa", playerName: "Player C", }, // should NOT count for Player C
];

const mockWithEvents: ReadonlyMap<number, LiveMatchData> = new Map([
  [537327, {
    provider: "football-data.org",
    providerMatchId: 537327,
    status: "FINISHED",
    homeScore: 3,
    awayScore: 1,
    winner: "HOME_TEAM",
    lastSyncedAt: new Date().toISOString(),
    eventDataAvailable: true,
    goals: mockGoals,
  }],
]);

console.log("Top scorers from event data:");
const scorers = computeTopScorers(mockWithEvents);
assert(scorers.length === 2, "2 scorers (OG excluded)");
assert(scorers[0].playerName === "Player A", "Player A is top scorer");
assert(scorers[0].goals === 2, "Player A has 2 goals");
assert(scorers[1].playerName === "Player B", "Player B is second");
assert(scorers[1].goals === 1, "Player B has 1 goal");
assert(!scorers.some((s) => s.playerName === "Player C"), "Player C (OG) not in scorers");

// ── B) eventDataAvailable=false → empty scorers ──────────────────────────────

const mockWithoutEvents: ReadonlyMap<number, LiveMatchData> = new Map([
  [537327, {
    provider: "football-data.org",
    providerMatchId: 537327,
    status: "FINISHED",
    homeScore: 2,
    awayScore: 0,
    winner: "HOME_TEAM",
    lastSyncedAt: new Date().toISOString(),
    eventDataAvailable: false,
  }],
]);

console.log("\nNo event data:");
const emptyScorers = computeTopScorers(mockWithoutEvents);
assert(emptyScorers.length === 0, "empty scorers when eventDataAvailable=false");

// ── C) Empty liveData → no scorers ──────────────────────────────────────────

console.log("\nEmpty map:");
const emptyMap = computeTopScorers(new Map());
assert(emptyMap.length === 0, "empty map returns empty scorers");

// ── D) Team leaderboards from standings ─────────────────────────────────────

console.log("\nTeam leaderboards:");

const mockStandings: Record<string, StandingRow[]> = {
  A: [
    { teamKey: "mexico",       played: 1, wins: 1, draws: 0, losses: 0, goalsFor: 2, goalsAgainst: 0, goalDifference: 2,  points: 3 },
    { teamKey: "southAfrica",  played: 1, wins: 0, draws: 0, losses: 1, goalsFor: 0, goalsAgainst: 2, goalDifference: -2, points: 0 },
    { teamKey: "southKorea",   played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0,  points: 0 },
    { teamKey: "czechia",      played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0,  points: 0 },
  ],
  B: [
    { teamKey: "canada",       played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
    { teamKey: "qatar",        played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
    { teamKey: "switzerland",  played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
    { teamKey: "bosnia",       played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
  ],
};

const boards = computeTeamLeaderboards(mockStandings);
assert(boards.mostPoints.length === 2, "mostPoints: 2 teams have played (Mexico + South Africa)");
assert(boards.mostPoints[0].teamKey === "mexico", "mostPoints[0] is Mexico");
assert(boards.mostPoints[0].value === 3, "Mexico has 3 points");
assert(boards.topScoringTeams[0].teamKey === "mexico", "topScoring[0] is Mexico");
assert(boards.topScoringTeams[0].value === 2, "Mexico scored 2");
assert(boards.mostWins[0].teamKey === "mexico", "mostWins[0] is Mexico");
assert(boards.mostWins[0].value === 1, "Mexico has 1 win");
assert(!boards.mostPoints.some((r) => r.teamKey === "canada"), "teams with 0 played not included");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
