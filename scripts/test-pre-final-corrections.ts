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
import { MATCHES, isValidDateParam } from "../lib/matches";
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
  assert(getTeamStatusLabel("turkey", turkeyStatus, snapshot.matches, resolvedParticipants) === "Eliminated in group stage", "Turkey status label is Eliminated in group stage");

  // 3. Test Timezone and Date validation helpers
  console.log("\n--- Timezone & Date Validation Tests ---");
  assert(isValidTimeZone("America/New_York"), "America/New_York is valid timezone");
  assert(isValidTimeZone("Europe/London"), "Europe/London is valid timezone");
  assert(!isValidTimeZone("Invalid/Timezone"), "Invalid/Timezone is invalid");
  assert(!isValidTimeZone(""), "Empty string is invalid");

  assert(isValidDateParam("2026-06-11"), "valid opening date");
  assert(isValidDateParam("2026-07-19"), "valid final date");
  assert(isValidDateParam("2026-06-25"), "valid intermediate date");
  assert(!isValidDateParam("2026-6-11"), "invalid format");
  assert(!isValidDateParam("2026-13-11"), "invalid month");
  assert(!isValidDateParam("2026-06-31"), "June 31 is invalid");
  assert(!isValidDateParam("2026-02-30"), "February 30 is invalid");
  assert(!isValidDateParam("2026-06-10"), "before-range date");
  assert(!isValidDateParam("2026-07-20"), "after-range date");

  // 4. Test TournamentStats and TeamStatLeaderboards calculations
  console.log("\n--- Tournament Stats & Leaderboard Tests ---");
  const liveDataMap = new Map<number, LiveMatchData>(
    Object.entries(snapshot.liveDataByProviderId).map(([id, val]) => [Number(id), val])
  );
  const stats = computeTournamentStats(liveDataMap);

  assert(stats.matchesPlayed === 103, "completed matches is exactly 103");
  assert(stats.totalGoals === 307, "total completed-match goals is exactly 307");

  const leaderboards = computeTeamStatLeaderboards(liveDataMap, snapshot.matches);

  const getGoalsFor = (team: string) => leaderboards.goalsScored.find(t => t.teamKey === team)?.value;
  const getGoalsAgainst = (team: string) => leaderboards.goalsConceded.find(t => t.teamKey === team)?.value;
  const getCleanSheets = (team: string) => leaderboards.cleanSheets.find(t => t.teamKey === team)?.value;

  // France
  assert(getGoalsFor("france") === 20, "France goals for is 20");
  assert(getGoalsAgainst("france") === 10, "France goals against is 10");
  assert(getCleanSheets("france") === 4, "France clean sheets is 4");

  // England
  assert(getGoalsFor("england") === 20, "England goals for is 20");
  assert(getGoalsAgainst("england") === 12, "England goals against is 12");
  assert(getCleanSheets("england") === 2, "England clean sheets is 2");

  // Spain
  assert(getGoalsFor("spain") === 13, "Spain goals for is 13");
  assert(getGoalsAgainst("spain") === 1, "Spain goals against is 1");
  assert(getCleanSheets("spain") === 6, "Spain clean sheets is 6");

  // Argentina
  assert(getGoalsFor("argentina") === 19, "Argentina goals for is 19");
  assert(getGoalsAgainst("argentina") === 7, "Argentina goals against is 7");
  assert(getCleanSheets("argentina") === 2, "Argentina clean sheets is 2");

  // Highest scoring match
  assert(stats.highestScoringMatch?.matchId === "match-103", "highest-scoring match is Match 103");
  assert(stats.highestScoringMatch?.homeKey === "france" && stats.highestScoringMatch?.awayKey === "england", "participants are France and England");
  assert(stats.highestScoringMatch?.homeScore === 4 && stats.highestScoringMatch?.awayScore === 6, "score is 4-6");
  assert(stats.highestScoringMatch?.totalGoals === 10, "total is 10");
  assert(stats.highestScoringMatch?.stage === "third-place playoff", "stage is third-place playoff");

  // Biggest win
  assert(stats.biggestWin?.homeKey === "canada" && stats.biggestWin?.awayKey === "qatar", "biggest win is Canada 6-0 Qatar");
  assert(stats.biggestWin?.margin === 6, "margin is 6");

  // Deterministic goals ordering
  const goalsOrderCorrect = leaderboards.goalsScored.every((item, i) => {
    if (i === 0) return true;
    const prev = leaderboards.goalsScored[i - 1];
    if (prev.value !== item.value) return prev.value > item.value;
    return prev.teamKey.localeCompare(item.teamKey) < 0;
  });
  assert(goalsOrderCorrect, "goals-scored ordering is deterministic (by value descending, then teamKey alphabetically)");

  // 5. Test getTeamStatusLabel with synthetic lifecycle states (pre-final, third-place completed, final completed)
  console.log("\n--- Synthetic Lifecycle Status Tests ---");

  // A. Pre-final status (Match 104 upcoming, Match 103 upcoming)
  const mockSnapshotPre: Record<string, any> = {
    "match-103": {
      match: { matchNumber: 103, homeKey: "france", awayKey: "england", stage: "3P", date: "2026-07-18" },
      status: "UPCOMING",
      homeScore: null,
      awayScore: null,
      winner: null
    },
    "match-104": {
      match: { matchNumber: 104, homeKey: "spain", awayKey: "argentina", stage: "F", date: "2026-07-19" },
      status: "UPCOMING",
      homeScore: null,
      awayScore: null,
      winner: null
    }
  };

  const mockStatusSpainPre = getTeamTournamentStatus({ teamKey: "spain", matches: MATCHES, snapshotMatches: mockSnapshotPre, resolvedParticipants });
  const mockStatusEnglandPre = getTeamTournamentStatus({ teamKey: "england", matches: MATCHES, snapshotMatches: mockSnapshotPre, resolvedParticipants });
  const labelSpainPre = getTeamStatusLabel("spain", mockStatusSpainPre, mockSnapshotPre, resolvedParticipants);
  const labelEnglandPre = getTeamStatusLabel("england", mockStatusEnglandPre, mockSnapshotPre, resolvedParticipants);
  assert(labelSpainPre === "Finalist", `Pre-final Spain label is Finalist: "${labelSpainPre}"`);
  assert(labelEnglandPre === "Semifinalist", `Pre-final England label is Semifinalist: "${labelEnglandPre}"`);

  // B. Third-place completed, final upcoming
  const mockSnapshotThirdCompleted: Record<string, any> = {
    "match-103": {
      match: { matchNumber: 103, homeKey: "france", awayKey: "england", stage: "3P", date: "2026-07-18" },
      status: "FINISHED",
      homeScore: 4,
      awayScore: 6,
      winner: "away"
    },
    "match-104": {
      match: { matchNumber: 104, homeKey: "spain", awayKey: "argentina", stage: "F", date: "2026-07-19" },
      status: "UPCOMING",
      homeScore: null,
      awayScore: null,
      winner: null
    }
  };
  const mockStatusEnglandThird = getTeamTournamentStatus({ teamKey: "england", matches: MATCHES, snapshotMatches: mockSnapshotThirdCompleted, resolvedParticipants });
  const mockStatusFranceThird = getTeamTournamentStatus({ teamKey: "france", matches: MATCHES, snapshotMatches: mockSnapshotThirdCompleted, resolvedParticipants });
  const labelEnglandThird = getTeamStatusLabel("england", mockStatusEnglandThird, mockSnapshotThirdCompleted, resolvedParticipants);
  const labelFranceThird = getTeamStatusLabel("france", mockStatusFranceThird, mockSnapshotThirdCompleted, resolvedParticipants);
  assert(labelEnglandThird === "Third place", `Third-place completed England label is Third place: "${labelEnglandThird}"`);
  assert(labelFranceThird === "Fourth place", `Third-place completed France label is Fourth place: "${labelFranceThird}"`);

  // C. Final completed (Spain wins)
  const mockSnapshotFinalCompleted: Record<string, any> = {
    "match-103": {
      match: { matchNumber: 103, homeKey: "france", awayKey: "england", stage: "3P", date: "2026-07-18" },
      status: "FINISHED",
      homeScore: 4,
      awayScore: 6,
      winner: "away"
    },
    "match-104": {
      match: { matchNumber: 104, homeKey: "spain", awayKey: "argentina", stage: "F", date: "2026-07-19" },
      status: "FINISHED",
      homeScore: 2,
      awayScore: 1,
      winner: "home"
    }
  };
  const mockStatusSpainFinal = getTeamTournamentStatus({ teamKey: "spain", matches: MATCHES, snapshotMatches: mockSnapshotFinalCompleted, resolvedParticipants });
  const mockStatusArgentinaFinal = getTeamTournamentStatus({ teamKey: "argentina", matches: MATCHES, snapshotMatches: mockSnapshotFinalCompleted, resolvedParticipants });
  const labelSpainFinal = getTeamStatusLabel("spain", mockStatusSpainFinal, mockSnapshotFinalCompleted, resolvedParticipants);
  const labelArgentinaFinal = getTeamStatusLabel("argentina", mockStatusArgentinaFinal, mockSnapshotFinalCompleted, resolvedParticipants);
  assert(labelSpainFinal === "Champion", `Final completed Spain label is Champion: "${labelSpainFinal}"`);
  assert(labelArgentinaFinal === "Runner-up", `Final completed Argentina label is Runner-up: "${labelArgentinaFinal}"`);

  // D. Alternate resolved teams (e.g. Brazil and Italy in final, Brazil wins)
  const mockSnapshotAlt: Record<string, any> = {
    "match-103": {
      match: { matchNumber: 103, homeKey: "france", awayKey: "england", stage: "3P", date: "2026-07-18" },
      status: "FINISHED",
      homeScore: 4,
      awayScore: 6,
      winner: "away"
    },
    "match-104": {
      match: { matchNumber: 104, homeKey: "brazil", awayKey: "italy", stage: "F", date: "2026-07-19" },
      status: "FINISHED",
      homeScore: 3,
      awayScore: 4,
      winner: "away"
    }
  };
  const mockStatusBrazilAlt = getTeamTournamentStatus({ teamKey: "brazil", matches: MATCHES, snapshotMatches: mockSnapshotAlt, resolvedParticipants });
  const mockStatusItalyAlt = getTeamTournamentStatus({ teamKey: "italy", matches: MATCHES, snapshotMatches: mockSnapshotAlt, resolvedParticipants });
  const labelBrazilAlt = getTeamStatusLabel("brazil", mockStatusBrazilAlt, mockSnapshotAlt, resolvedParticipants);
  const labelItalyAlt = getTeamStatusLabel("italy", mockStatusItalyAlt, mockSnapshotAlt, resolvedParticipants);
  assert(labelBrazilAlt === "Runner-up", `Alt final Brazil is Runner-up: "${labelBrazilAlt}"`);
  assert(labelItalyAlt === "Champion", `Alt final Italy is Champion: "${labelItalyAlt}"`);

  console.log(`\nTests finished: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
