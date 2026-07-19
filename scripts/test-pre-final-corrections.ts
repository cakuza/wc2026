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
import { getResolvedAwayTeam, getResolvedHomeTeam } from "../lib/participant-resolution";

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

  // 5. Deciding match completed-recap dynamic text derivation tests
  console.log("\n--- Deciding Match Completed-Recap Tests ---");

  const { getDecidingMatchRecap } = require("../lib/resultSummary");

  // Test 1: Italy third, Brazil fourth (Brazil 3-4 Italy, Italy wins in regular time)
  const alt3P_1 = getDecidingMatchRecap({
    stage: "3P",
    homeName: "Brazil",
    awayName: "Italy",
    homeScore: 3,
    awayScore: 4,
    winnerKey: "away",
    penaltyShootoutScore: null,
  });
  assert(alt3P_1.subTitle === "Italy third · Brazil fourth", `3P recap subTitle is "Italy third · Brazil fourth": "${alt3P_1.subTitle}"`);
  assert(alt3P_1.winNote === "Italy secured third place with a 4–3 victory.", `3P recap winNote is "Italy secured third place with a 4–3 victory.": "${alt3P_1.winNote}"`);

  // Test 2: Japan third, Mexico fourth (Japan 2-1 Mexico, Japan wins as home team)
  const alt3P_2 = getDecidingMatchRecap({
    stage: "3P",
    homeName: "Japan",
    awayName: "Mexico",
    homeScore: 2,
    awayScore: 1,
    winnerKey: "home",
    penaltyShootoutScore: null,
  });
  assert(alt3P_2.subTitle === "Japan third · Mexico fourth", `3P recap subTitle is "Japan third · Mexico fourth": "${alt3P_2.subTitle}"`);
  assert(alt3P_2.winNote === "Japan secured third place with a 2–1 victory.", `3P recap winNote is "Japan secured third place with a 2–1 victory.": "${alt3P_2.winNote}"`);

  // Test 3: Shootout victory (e.g. Germany 1-1 Argentina, Germany wins 5-3 on pens)
  const alt3P_3 = getDecidingMatchRecap({
    stage: "3P",
    homeName: "Germany",
    awayName: "Argentina",
    homeScore: 1,
    awayScore: 1,
    winnerKey: "home",
    penaltyShootoutScore: { home: 5, away: 3 },
  });
  assert(alt3P_3.subTitle === "Germany third · Argentina fourth", `Shootout subTitle matches: "${alt3P_3.subTitle}"`);
  assert(alt3P_3.winNote === "Germany secured third place with a 5–3 penalty shootout victory after a 1–1 draw.", `Shootout winNote matches: "${alt3P_3.winNote}"`);

  // Test 4: Final Match completed-recap (e.g. Spain 2-1 Argentina, Spain wins)
  const altFinal = getDecidingMatchRecap({
    stage: "F",
    homeName: "Spain",
    awayName: "Argentina",
    homeScore: 2,
    awayScore: 1,
    winnerKey: "home",
    penaltyShootoutScore: null,
  });
  assert(altFinal.subTitle === "Spain Champion · Argentina Runner-up", `Final recap subTitle is "Spain Champion · Argentina Runner-up": "${altFinal.subTitle}"`);
  assert(altFinal.winNote === "Spain secured the World Cup title with a 2–1 victory.", `Final recap winNote is "Spain secured the World Cup title with a 2–1 victory.": "${altFinal.winNote}"`);

  // Assert no literal "England", "France", or "6-4" / "6–4" in getDecidingMatchRecap source implementation
  const fs = require("node:fs");
  const path = require("node:path");
  const resultSummarySource = fs.readFileSync(path.join(__dirname, "../lib/resultSummary.ts"), "utf8");
  const matchRecapImpl = resultSummarySource.match(/export function getDecidingMatchRecap[\s\S]+/)?.[0] ?? "";
  assert(!/England|France|6[–-]4/.test(matchRecapImpl), "No hardcoded 'England', 'France', or '6-4' in getDecidingMatchRecap source code");

  // 6. Finalists filter regression tests (app/teams/page.tsx data logic)
  console.log("\n--- Finalists Filter Pre/Post Final Regression Tests ---");

  function getFinalistsForMatch104Snapshot(match104Snap: any) {
    const mockSnap = {
      matches: {
        "match-104": {
          match: { matchNumber: 104, homeKey: "spain", awayKey: "argentina", stage: "F", date: "2026-07-19" },
          ...match104Snap,
        }
      }
    };
    const res = buildKnockoutResolution(mockSnap.matches);
    const m104 = mockSnap.matches["match-104"];
    const extractedFinalists: string[] = [];
    if (m104) {
      const finalHome = m104.match.homeKey !== "tbd" ? m104.match.homeKey : (getResolvedHomeTeam(m104.match, res) ?? "tbd");
      const finalAway = m104.match.awayKey !== "tbd" ? m104.match.awayKey : (getResolvedAwayTeam(m104.match, res) ?? "tbd");
      if (finalHome !== "tbd") extractedFinalists.push(finalHome);
      if (finalAway !== "tbd") extractedFinalists.push(finalAway);
    }
    return extractedFinalists;
  }

  // Pre-final state (Match 104 UPCOMING)
  const preFinalists = getFinalistsForMatch104Snapshot({
    status: "UPCOMING",
    homeScore: null,
    awayScore: null,
    winner: null,
  });
  assert(preFinalists.includes("spain") && preFinalists.includes("argentina") && preFinalists.length === 2, "Before final: Finalists filter contains both participants");

  // Post-final state (Match 104 FINISHED, Spain wins 2-1)
  const postFinalists = getFinalistsForMatch104Snapshot({
    status: "FINISHED",
    homeScore: 2,
    awayScore: 1,
    winner: "home",
  });
  assert(postFinalists.includes("spain") && postFinalists.includes("argentina") && postFinalists.length === 2, "After final: Finalists filter still contains both participants");

  // Validate active filter and labels pre/post final
  const mockAllMatchesFinishedSnapshot: Record<string, any> = {};
  const { matchSlug } = require("../lib/matches");
  for (const m of MATCHES) {
    const isAwayWin = "matchNumber" in m && (m.matchNumber === 93 || m.matchNumber === 101);
    mockAllMatchesFinishedSnapshot[matchSlug(m)] = {
      match: m,
      status: "FINISHED",
      homeScore: isAwayWin ? 0 : 1,
      awayScore: isAwayWin ? 1 : 0,
    };
  }

  const resolvedParticipantsObj = buildKnockoutResolution(mockAllMatchesFinishedSnapshot);

  // Pre-final snapshot
  const preSnapshotMatches = { ...mockAllMatchesFinishedSnapshot };
  preSnapshotMatches["match-104"] = {
    match: { matchNumber: 104, homeKey: "spain", awayKey: "argentina", stage: "F", date: "2026-07-19" },
    status: "UPCOMING",
    homeScore: null,
    awayScore: null,
    winner: null,
  };

  // Pre-final label & active status check
  const preStatusSpain = getTeamTournamentStatus({
    teamKey: "spain",
    matches: MATCHES,
    snapshotMatches: preSnapshotMatches,
    resolvedParticipants: resolvedParticipantsObj
  });
  const preLabelSpain = getTeamStatusLabel("spain", preStatusSpain, preSnapshotMatches, resolvedParticipantsObj);
  assert(preLabelSpain === "Finalist", `Pre-final Spain card label is "Finalist": "${preLabelSpain}"`);
  assert(preStatusSpain.classification === "ACTIVE_KNOCKOUT", "Pre-final Spain is classified as ACTIVE_KNOCKOUT");

  // Post-final snapshot
  const postSnapshotMatches = { ...mockAllMatchesFinishedSnapshot };
  postSnapshotMatches["match-104"] = {
    match: { matchNumber: 104, homeKey: "spain", awayKey: "argentina", stage: "F", date: "2026-07-19" },
    status: "FINISHED",
    homeScore: 2,
    awayScore: 1,
    winner: "home",
  };

  // Post-final label & active status check
  const postStatusSpain = getTeamTournamentStatus({
    teamKey: "spain",
    matches: MATCHES,
    snapshotMatches: postSnapshotMatches,
    resolvedParticipants: resolvedParticipantsObj
  });
  const postStatusArgentina = getTeamTournamentStatus({
    teamKey: "argentina",
    matches: MATCHES,
    snapshotMatches: postSnapshotMatches,
    resolvedParticipants: resolvedParticipantsObj
  });
  const postLabelSpain = getTeamStatusLabel("spain", postStatusSpain, postSnapshotMatches, resolvedParticipantsObj);
  const postLabelArgentina = getTeamStatusLabel("argentina", postStatusArgentina, postSnapshotMatches, resolvedParticipantsObj);

  assert(postLabelSpain === "Champion", `Post-final Spain card label is "Champion": "${postLabelSpain}"`);
  assert(postLabelArgentina === "Runner-up", `Post-final Argentina card label is "Runner-up": "${postLabelArgentina}"`);
  assert(postStatusSpain.classification === "ELIMINATED_KNOCKOUT", "Post-final Spain is classified as ELIMINATED_KNOCKOUT (not active)");
  assert(postStatusArgentina.classification === "ELIMINATED_KNOCKOUT", "Post-final Argentina is classified as ELIMINATED_KNOCKOUT (not active)");

  // both remain in the historical Finalists collection
  const postFinalistsResult = getFinalistsForMatch104Snapshot({
    status: "FINISHED",
    homeScore: 2,
    awayScore: 1,
    winner: "home",
  });
  assert(postFinalistsResult.includes("spain") && postFinalistsResult.includes("argentina"), "Both Spain and Argentina remain in finalists collection after final");

  // neither remains in the Active filter after the final
  assert(postStatusSpain.classification !== "ACTIVE_KNOCKOUT", "Spain is not active after final");
  assert(postStatusArgentina.classification !== "ACTIVE_KNOCKOUT", "Argentina is not active after final");

  console.log(`\nTests finished: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
