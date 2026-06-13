import { parseFootballDataGoals } from "../lib/footballDataEventNormalizer";
import { getGoalEventCompleteness, missingScorerDetailText } from "../lib/goalEventCompleteness";
import type { LiveMatchData } from "../lib/liveMatchData";
import { buildTournamentLiveSnapshot } from "../lib/liveSnapshot";
import { buildScorerSentence } from "../lib/resultSummary";
import type { WorldCup26Game } from "../lib/worldcup26Provider";

let passed = 0;
let failed = 0;
function assert(condition: boolean, msg: string) {
  if (condition) { console.log(`  PASS  ${msg}`); passed++; }
  else { console.error(`  FAIL  ${msg}`); failed++; }
}

const QATAR_PROVIDER_ID = 537334;
const QATAR_MATCH_ID = "qatar-vs-switzerland-jun13";

function live(goals: NonNullable<LiveMatchData["goals"]>): LiveMatchData {
  const completeness = getGoalEventCompleteness({
    homeScore: 1,
    awayScore: 1,
    goals,
    eventDataAvailable: true,
  });
  return {
    provider: "football-data.org",
    providerMatchId: QATAR_PROVIDER_ID,
    status: "FINISHED",
    homeScore: 1,
    awayScore: 1,
    winner: "DRAW",
    lastSyncedAt: "2026-06-13T19:00:00.000Z",
    eventDataAvailable: true,
    goalEventCompleteness: completeness,
    goals,
  };
}

function qatarGame(awayScorers: WorldCup26Game["awayScorers"]): WorldCup26Game {
  return {
    providerGameId: "8",
    homeTeamName: "Qatar",
    awayTeamName: "Switzerland",
    homeScore: 1,
    awayScore: 1,
    finished: true,
    homeScorers: [{
      type: "GOAL",
      minute: 90,
      stoppageTime: 5,
      minuteLabel: "90+5'",
      teamName: "Qatar",
      playerName: "B. Khoukhi",
      provider: "worldcup26.ir",
      confidence: "high",
    }],
    awayScorers,
    localDate: "06/13/2026 12:00",
  };
}

console.log("=== Goal-event completeness test ===\n");

async function main() {
const completeGoals = parseFootballDataGoals({
  goals: [
    { id: "g1", type: "PENALTY_GOAL", minute: 17, team: { name: "Switzerland" }, scorer: { name: "Breel Embolo" } },
    { id: "g2", type: "NORMAL", minute: 90, stoppageTime: 5, team: { name: "Qatar" }, scorer: { name: "B. Khoukhi" } },
  ],
}, QATAR_PROVIDER_ID)!;
const complete = getGoalEventCompleteness({ homeScore: 1, awayScore: 1, goals: completeGoals, eventDataAvailable: true });
assert(complete.isGoalEventDataComplete, "1-1 final with two valid goal events is complete");
assert(completeGoals.length === 2, "both complete events are normalized");
assert(completeGoals[0]?.type === "PENALTY_GOAL", "penalty goal variant is normalized");
assert(completeGoals[1]?.minuteLabel === "90+5'", "stoppage-time label is preserved and sorted");

const partial = getGoalEventCompleteness({ homeScore: 1, awayScore: 1, goals: completeGoals.slice(1), eventDataAvailable: true });
assert(!partial.isGoalEventDataComplete, "1-1 final with one goal event is incomplete");
assert(partial.missingGoalEventCount === 1, "one missing scorer detail reported");
assert(missingScorerDetailText(partial.missingGoalEventCount) === "1 scorer detail is still syncing.", "singular missing scorer text");
const partialSummary = buildScorerSentence(completeGoals.slice(1), "Qatar", "Switzerland", partial);
assert(partialSummary === null, "incomplete events suppress rich sequence summary");

const firstSnapshot = await buildTournamentLiveSnapshot({
  liveData: new Map([[QATAR_PROVIDER_ID, live(completeGoals.slice(1))]]),
  worldcupGames: [qatarGame([])],
  generatedAt: "2026-06-13T19:00:00.000Z",
});
assert(firstSnapshot.matches[QATAR_MATCH_ID]?.goalEventCompleteness.isGoalEventDataComplete === false, "initial partial snapshot is marked incomplete");

const laterSnapshot = await buildTournamentLiveSnapshot({
  liveData: new Map([[QATAR_PROVIDER_ID, live(completeGoals.slice(1))]]),
  worldcupGames: [qatarGame([{
    type: "PENALTY_GOAL",
    minute: 17,
    minuteLabel: "17'",
    teamName: "Switzerland",
    playerName: "Breel Embolo",
    isPenalty: true,
    provider: "worldcup26.ir",
    confidence: "high",
  }])],
  generatedAt: "2026-06-13T19:01:00.000Z",
});
assert(laterSnapshot.matches[QATAR_MATCH_ID]?.goalEventCompleteness.isGoalEventDataComplete === true, "later enrichment replaces incomplete snapshot state");
assert(laterSnapshot.matches[QATAR_MATCH_ID]?.scorers.length === 2, "later enrichment exposes both scorer events");

const variants = parseFootballDataGoals({
  events: [
    { id: "own", type: "OWN_GOAL", minute: 7, team: { name: "United States" }, scorer: { name: "Damian Bobadilla" } },
    { id: "pending", type: "goal", subType: "normal", minute: 31, team: { name: "United States" }, participants: [] },
    { id: "pending", type: "goal", subType: "normal", minute: 31, team: { name: "United States" }, participants: [] },
    { id: "athlete", type: "goal", minute: 90, stoppageTime: 2, team: { name: "Qatar" }, athletesInvolved: [{ displayName: "Late Scorer" }] },
  ],
}, 999999)!;
assert(variants.length === 3, "duplicate provider events are displayed only once");
assert(variants[0]?.type === "OWN_GOAL" && variants[0]?.isOwnGoal === true, "own goal variant is normalized");
assert(variants[1]?.playerName === null, "valid goal with missing scorer metadata is preserved as pending");
assert(variants[2]?.minuteLabel === "90+2'", "90+2 stoppage-time ordering is preserved");

const shootoutCompleteness = getGoalEventCompleteness({
  homeScore: 1,
  awayScore: 1,
  goals: completeGoals,
  eventDataAvailable: true,
});
assert(shootoutCompleteness.expectedGoalCount === 2, "penalty shootout score is not counted as regulation goals");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
