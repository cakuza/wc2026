import assert from "assert";
import { MATCHES, matchSlug } from "../lib/matches";
import { getTournamentLiveSnapshot } from "../lib/liveSnapshot";
import { getArchiveState } from "../lib/archiveLifecycle";
import { getTournamentPhase } from "../lib/matchCenterSelection";
import { buildKnockoutResolution } from "../lib/knockoutResolution";
import { getTeamTournamentStatus } from "../lib/teamTournamentStatus";
import { getPublishedAwards } from "../lib/tournamentAwards";
import { computeGroupStandings } from "../lib/groupStandings";
import * as fs from "fs";
import * as path from "path";

let passed = 0;
let failed = 0;

function check(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (e: any) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     ${e.message ?? e}`);
    failed++;
  }
}

async function run() {
  console.log("\n=== Match 104 Archive Closeout Test Suite ===\n");

  const snapshot = await getTournamentLiveSnapshot();
  const resolvedParticipants = buildKnockoutResolution(snapshot.matches);
  const now = new Date("2026-07-20T12:00:00Z"); // Today is July 20, after Match 104
  const archive = getArchiveState({
    matches: MATCHES,
    liveData: snapshot.liveDataByProviderId,
    resolvedParticipants,
    now,
  });

  // 1. Completed Match Count and Lifecycle
  check("Completed match count is 104", () => {
    const finishedMatches = Object.values(snapshot.matches).filter(
      (m) => m.status === "FINISHED"
    );
    assert.strictEqual(finishedMatches.length, 104, `Finished matches: ${finishedMatches.length}`);
  });

  check("Archive completion is true", () => {
    assert.strictEqual(archive.isComplete, true, "Tournament should be marked complete once Match 104 is resolved");
  });

  check("Tournament phase is 'tournament_complete'", () => {
    const phase = getTournamentPhase({
      matches: MATCHES,
      liveData: snapshot.liveDataByProviderId,
      now,
    });
    assert.strictEqual(phase, "tournament_complete", `Expected phase 'tournament_complete', got '${phase}'`);
  });

  // 2. Spain and Argentina placements
  check("Spain is Champion, Argentina is Runner-up", () => {
    assert.strictEqual(archive.champion, "Spain", "Spain should be Champion");
    assert.strictEqual(archive.runnerUp, "Argentina", "Argentina should be Runner-up");
  });

  check("Spain and Argentina status", () => {
    const espStatus = getTeamTournamentStatus({
      teamKey: "spain",
      matches: MATCHES,
      snapshotMatches: snapshot.matches,
      resolvedParticipants,
      now,
    });
    const argStatus = getTeamTournamentStatus({
      teamKey: "argentina",
      matches: MATCHES,
      snapshotMatches: snapshot.matches,
      resolvedParticipants,
      now,
    });
    assert.strictEqual(espStatus.nextMatch, null, "Spain campaign should be completed (no next match)");
    assert.strictEqual(argStatus.nextMatch, null, "Argentina campaign should be completed (no next match)");
  });

  // 3. Match 104 Result Representation
  check("Match 104 score is Spain 1 - 0 Argentina", () => {
    const m104 = snapshot.matches["match-104"];
    assert.ok(m104, "Match 104 must exist in snapshot");
    assert.strictEqual(m104.homeScore, 1, "Spain score must be 1");
    assert.strictEqual(m104.awayScore, 0, "Argentina score must be 0");
    assert.strictEqual(m104.status, "FINISHED", "Match 104 must be finished");
    assert.strictEqual(m104.live?.scoreDuration, "EXTRA_TIME", "Match 104 must be extra time");

    const goals = m104.live?.goals ?? [];
    const torresGoal = goals.find(g => g.playerName === "Ferran Torres" && g.minute === 106);
    assert.ok(torresGoal, "Ferran Torres goal at 106' should exist");
  });

  // 4. Enzo Fernández card events
  check("Enzo Fernández booking cards", () => {
    const m104 = snapshot.matches["match-104"];
    const bookings = m104.live?.bookings ?? [];

    const firstYellow = bookings.find(b => b.playerName === "Enzo Fernández" && b.type === "YELLOW_CARD" && b.minute === 82);
    const secondYellow = bookings.find(b => b.playerName === "Enzo Fernández" && b.type === "SECOND_YELLOW" && b.minute === 90 && b.stoppageTime === 3);

    assert.ok(firstYellow, "First yellow card for Enzo Fernández should exist");
    assert.ok(secondYellow, "Second yellow (SECOND_YELLOW) card for Enzo Fernández should exist");
  });

  // 5. Official Awards
  check("Official tournament awards are registered correctly", () => {
    const awards = getPublishedAwards(snapshot.liveDataByProviderId);
    assert.strictEqual(awards.length, 4, `Expected 4 awards, got ${awards.length}`);

    const boot = awards.find(a => a.awardId === "golden_boot");
    const ball = awards.find(a => a.awardId === "golden_ball");
    const glove = awards.find(a => a.awardId === "golden_glove");
    const young = awards.find(a => a.awardId === "best_young_player");

    assert.ok(boot, "Golden Boot must exist");
    assert.strictEqual(boot.winnerName, "Kylian Mbappé");
    assert.strictEqual(boot.metric, "10 goals");

    assert.ok(ball, "Golden Ball must exist");
    assert.strictEqual(ball.winnerName, "Rodri");

    assert.ok(glove, "Golden Glove must exist");
    assert.strictEqual(glove.winnerName, "Unai Simón");

    assert.ok(young, "Best Young Player must exist");
    assert.strictEqual(young.winnerName, "Pau Cubarsí");
  });

  // 6. Statistics Goals and Team Totals Validation
  check("Final statistics recomputation matches expected values", () => {
    const stats = snapshot.tournamentStats;
    assert.strictEqual(stats.matchesPlayed, 104, `Matches played expected 104, got ${stats.matchesPlayed}`);
    assert.strictEqual(stats.totalGoals, 308, `Total goals expected 308, got ${stats.totalGoals}`);

    // Verify team stats leaderboards
    const goalsScored = snapshot.teamStatLeaderboards.goalsScored;
    const cleanSheets = snapshot.teamStatLeaderboards.cleanSheets;

    const findGoals = (key: string) => goalsScored.find(t => t.teamKey === key)?.value ?? 0;
    const findCleanSheets = (key: string) => cleanSheets.find(t => t.teamKey === key)?.value ?? 0;

    assert.strictEqual(findGoals("spain"), 14, `Spain goals expected 14, got ${findGoals("spain")}`);
    assert.strictEqual(findGoals("argentina"), 19, `Argentina goals expected 19, got ${findGoals("argentina")}`);
    assert.strictEqual(findGoals("england"), 20, `England goals expected 20, got ${findGoals("england")}`);
    assert.strictEqual(findGoals("france"), 20, `France goals expected 20, got ${findGoals("france")}`);

    assert.strictEqual(findCleanSheets("spain"), 7, `Spain clean sheets expected 7, got ${findCleanSheets("spain")}`);
  });

  // 7. Provenance Mapping
  check("Match 104 ESPN provenance mapping is complete", () => {
    const mapPath = path.resolve(__dirname, "../data/archive/provenance/espn-match-map.json");
    const mapping = JSON.parse(fs.readFileSync(mapPath, "utf-8"));
    const m104Map = mapping.find((m: any) => m.internalMatchId === "match-104");
    assert.ok(m104Map, "Match 104 mapping must exist");
    assert.strictEqual(m104Map.home, "spain", "Home team must be spain");
    assert.strictEqual(m104Map.away, "argentina", "Away team must be argentina");
    assert.strictEqual(m104Map.stage, "Final", "Stage must be Final");
    assert.strictEqual(m104Map.espnEventId, "760517", "ESPN Event ID must be 760517");
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run();
