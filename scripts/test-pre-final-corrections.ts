/**
 * Automated test suite for the pre-final production integrity corrections.
 * Run using:
 *   npx tsx scripts/test-pre-final-corrections.ts
 */

import { buildScorerSentence } from "../lib/resultSummary";
import { getTeamStatusLabel, getTeamTournamentStatus } from "../lib/teamTournamentStatus";
import { computeTournamentStats, computeTeamStatLeaderboards } from "../lib/tournamentStats";
import { getTournamentLiveSnapshot } from "../lib/liveSnapshot";
import { buildKnockoutResolution } from "../lib/knockoutResolution";
import { MATCHES } from "../lib/matches";
import { isValidTimeZone } from "../lib/timezone";
import type { LiveMatchData } from "../lib/liveMatchData";

let passed = 0;
let failed = 0;

function assert(condition: any, msg: string) {
  const bool = Boolean(condition);
  if (bool) {
    console.log(`  PASS  ${msg}`);
    passed++;
  } else {
    console.error(`  FAIL  ${msg}`);
    failed++;
  }
}

async function runTests() {
  console.log("=== Running Pre-Final Corrections Tests ===\n");

  // 1. Test scorer sentence updates (hat-trick, stoppage time, winner-oriented scores)
  console.log("--- Result Summary / Scorer Phrasing Tests ---");
  
  // Double goal (brace)
  const braceSentence = buildScorerSentence(
    [
      { type: "GOAL", minute: 15, playerName: "Kane", teamName: "England" },
      { type: "GOAL", minute: 30, playerName: "Kane", teamName: "England" }
    ],
    "France",
    "England"
  );
  assert(braceSentence?.includes("Kane scored twice"), `Brace says "scored twice": "${braceSentence}"`);

  // Hat-trick
  const hatTrickSentence = buildScorerSentence(
    [
      { type: "GOAL", minute: 15, playerName: "Kane", teamName: "England" },
      { type: "GOAL", minute: 30, playerName: "Kane", teamName: "England" },
      { type: "GOAL", minute: 45, playerName: "Kane", teamName: "England" }
    ],
    "France",
    "England"
  );
  assert(hatTrickSentence?.includes("Kane scored a hat-trick"), `Hat-trick says "scored a hat-trick": "${hatTrickSentence}"`);

  // Four goals
  const fourGoalsSentence = buildScorerSentence(
    [
      { type: "GOAL", minute: 15, playerName: "Kane", teamName: "England" },
      { type: "GOAL", minute: 30, playerName: "Kane", teamName: "England" },
      { type: "GOAL", minute: 45, playerName: "Kane", teamName: "England" },
      { type: "GOAL", minute: 60, playerName: "Kane", teamName: "England" }
    ],
    "France",
    "England"
  );
  assert(fourGoalsSentence?.includes("Kane scored 4 goals"), `Four goals says "scored 4 goals": "${fourGoalsSentence}"`);

  // Stoppage time formatting
  const stoppageGoal = buildScorerSentence(
    [
      { type: "GOAL", minute: 90, stoppageTime: 6, playerName: "Bellingham", teamName: "England" }
    ],
    "France",
    "England"
  );
  assert(stoppageGoal?.includes("at 90+6'"), `Stoppage time goal formats as "at 90+6'": "${stoppageGoal}"`);

  // Ordinary minute formatting
  const ordinaryGoal = buildScorerSentence(
    [
      { type: "GOAL", minute: 45, playerName: "Saka", teamName: "England" }
    ],
    "France",
    "England"
  );
  assert(ordinaryGoal?.includes("in the 45th minute"), `Ordinary goal formats as "in the 45th minute": "${ordinaryGoal}"`);

  // Winner oriented scores (completed match score orientation: France 4-6 England)
  const winnerOrientedSentence = buildScorerSentence(
    [
      { type: "GOAL", minute: 10, playerName: "Mbappe", teamName: "France" },
      { type: "GOAL", minute: 20, playerName: "Mbappe", teamName: "France" },
      { type: "GOAL", minute: 30, playerName: "Mbappe", teamName: "France" },
      { type: "GOAL", minute: 40, playerName: "Mbappe", teamName: "France" },
      
      { type: "GOAL", minute: 15, playerName: "Bellingham", teamName: "England" },
      { type: "GOAL", minute: 25, playerName: "Bellingham", teamName: "England" },
      { type: "GOAL", minute: 35, playerName: "Bellingham", teamName: "England" },
      { type: "GOAL", minute: 45, playerName: "Bellingham", teamName: "England" },
      { type: "GOAL", minute: 55, playerName: "Bellingham", teamName: "England" },
      { type: "GOAL", minute: 90, stoppageTime: 6, playerName: "Kane", teamName: "England" }
    ],
    "France",
    "England"
  );
  assert(winnerOrientedSentence?.includes("completed the 6–4 win at 90+6'"), `Match completion oriented as winner-loser (6–4 win): "${winnerOrientedSentence}"`);

  // 2. Test Team Tournament Status labels
  console.log("\n--- Team Tournament Status Label Tests ---");
  const snapshot = await getTournamentLiveSnapshot();
  const resolvedParticipants = buildKnockoutResolution(snapshot.matches);

  const getStatus = (teamKey: string) => getTeamTournamentStatus({
    teamKey,
    matches: MATCHES,
    snapshotMatches: snapshot.matches,
    resolvedParticipants
  });

  const spainStatus = getStatus("spain");
  assert(getTeamStatusLabel("spain", spainStatus, snapshot.matches) === "Finalist", "Spain status label is Finalist");

  const argentinaStatus = getStatus("argentina");
  assert(getTeamStatusLabel("argentina", argentinaStatus, snapshot.matches) === "Finalist", "Argentina status label is Finalist");

  const englandStatus = getStatus("england");
  assert(getTeamStatusLabel("england", englandStatus, snapshot.matches) === "Third place", "England status label is Third place");

  const franceStatus = getStatus("france");
  assert(getTeamStatusLabel("france", franceStatus, snapshot.matches) === "Fourth place", "France status label is Fourth place");

  const senegalStatus = getStatus("senegal");
  console.log("Senegal classification:", senegalStatus.classification);
  assert(getTeamStatusLabel("senegal", senegalStatus, snapshot.matches) === "Eliminated in Round of 32", "Senegal status label is Eliminated in Round of 32");

  const turkeyStatus = getStatus("turkey");
  console.log("Turkey classification:", turkeyStatus.classification);
  assert(getTeamStatusLabel("turkey", turkeyStatus, snapshot.matches) === "Eliminated in group stage", "Turkey status label is Eliminated in group stage");

  // 3. Test Timezone validation helper
  console.log("\n--- Timezone Validation Tests ---");
  assert(isValidTimeZone("America/New_York"), "America/New_York is valid timezone");
  assert(isValidTimeZone("Europe/London"), "Europe/London is valid timezone");
  assert(!isValidTimeZone("Invalid/Timezone"), "Invalid/Timezone is invalid");
  assert(!isValidTimeZone(""), "Empty string is invalid");

  // 4. Test TournamentStats and TeamStatLeaderboards calculations
  console.log("\n--- Tournament Stats & Leaderboard Tests ---");
  const liveDataMap = new Map<number, LiveMatchData>(
    Object.entries(snapshot.liveDataByProviderId).map(([id, val]) => [Number(id), val])
  );
  const stats = computeTournamentStats(liveDataMap);
  console.log("Calculated matchesPlayed:", stats.matchesPlayed);
  console.log("Calculated totalGoals:", stats.totalGoals);
  assert(stats.matchesPlayed > 0, "Canonical matchesPlayed is greater than 0");
  assert(stats.totalGoals > 0, "Canonical totalGoals is greater than 0");
  
  // Check match-103 statistics keys are resolved correctly to names (not 'tbd')
  assert(stats.highestScoringMatch?.homeKey === "france", "highestScoringMatch homeKey is france");
  assert(stats.highestScoringMatch?.awayKey === "england", "highestScoringMatch awayKey is england");
  assert(stats.highestScoringMatch?.matchId === "match-103", "highestScoringMatch matchId is match-103");
  assert(stats.highestScoringMatch?.stage === "third-place playoff", "highestScoringMatch stage is third-place playoff");

  const leaderboards = computeTeamStatLeaderboards(liveDataMap, snapshot.matches);
  const goalsScored = leaderboards.goalsScored;
  const englandStats = goalsScored.find(t => t.teamKey === "england");
  console.log("England goals value:", englandStats?.value);
  assert(englandStats?.value !== undefined && englandStats.value > 0, "England total tournament goals is credited");

  const franceStats = goalsScored.find(t => t.teamKey === "france");
  console.log("France goals value:", franceStats?.value);
  assert(franceStats?.value !== undefined && franceStats.value > 0, "France total tournament goals is credited");

  const spainStats = goalsScored.find(t => t.teamKey === "spain");
  console.log("Spain goals value:", spainStats?.value);
  assert(spainStats?.value !== undefined && spainStats.value > 0, "Spain total tournament goals is credited");

  const argentinaStats = goalsScored.find(t => t.teamKey === "argentina");
  console.log("Argentina goals value:", argentinaStats?.value);
  assert(argentinaStats?.value !== undefined && argentinaStats.value > 0, "Argentina total tournament goals is credited");

  console.log(`\nTests finished: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
