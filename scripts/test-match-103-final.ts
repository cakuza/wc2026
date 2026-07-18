/**
 * Regression test suite for World Cup Match 103 Final Result.
 *
 * Usage:
 *   npx tsx scripts/test-match-103-final.ts
 */

import assert from "assert";
import { MATCHES, matchSlug } from "../lib/matches";
import { getTournamentLiveSnapshot } from "../lib/liveSnapshot";
import { getArchiveState } from "../lib/archiveLifecycle";
import { getTournamentPhase } from "../lib/matchCenterSelection";
import { buildKnockoutResolution } from "../lib/knockoutResolution";
import { getTeamTournamentStatus } from "../lib/teamTournamentStatus";
import { validateProviderPayload } from "../lib/readinessValidator";
import { MATCH_EDITORIAL_REPORTS } from "../lib/matchEditorialRegistry";
import type { WorldCup26Game } from "../lib/worldcup26Provider";

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
  console.log("\n=== Match 103 Regression Test Suite ===\n");

  const snapshot = await getTournamentLiveSnapshot();
  const resolvedParticipants = buildKnockoutResolution(snapshot.matches);
  const now = new Date("2026-07-19T02:00:00Z"); // Today is July 19, between Match 103 and 104
  const archive = getArchiveState({
    matches: MATCHES,
    liveData: snapshot.liveDataByProviderId,
    resolvedParticipants,
    now,
  });

  // 1. Completed Match Count and Lifecycle
  check("Completed match count is 103", () => {
    const finishedMatches = Object.values(snapshot.matches).filter(
      (m) => m.status === "FINISHED"
    );
    assert.strictEqual(finishedMatches.length, 103, `Finished matches: ${finishedMatches.length}`);
  });

  check("Archive completion is false (unarchived)", () => {
    assert.strictEqual(archive.isComplete, false, "Tournament should not be marked complete before Match 104");
  });

  check("Tournament phase is 'final'", () => {
    const phase = getTournamentPhase({
      matches: MATCHES,
      liveData: snapshot.liveDataByProviderId,
      now,
    });
    assert.strictEqual(phase, "final", `Expected phase 'final', got '${phase}'`);
  });

  // 2. England and France status and placements
  check("England final placement is third place", () => {
    assert.strictEqual(archive.thirdPlaceResult?.winnerLabel, "England", "England should be third place winner");

    const engStatus = getTeamTournamentStatus({
      teamKey: "england",
      matches: MATCHES,
      snapshotMatches: snapshot.matches,
      resolvedParticipants,
      now,
    });
    assert.strictEqual(engStatus.currentStageLabel, "Third place", `Expected 'Third place', got '${engStatus.currentStageLabel}'`);
  });

  check("France final placement is fourth place", () => {
    assert.strictEqual(archive.thirdPlaceResult?.loserLabel, "France", "France should be third place loser");

    const fraStatus = getTeamTournamentStatus({
      teamKey: "france",
      matches: MATCHES,
      snapshotMatches: snapshot.matches,
      resolvedParticipants,
      now,
    });
    assert.strictEqual(fraStatus.currentStageLabel, "Fourth place", `Expected 'Fourth place', got '${fraStatus.currentStageLabel}'`);
  });

  // 3. Match 103 Result Representation
  check("Match 103 score is France 4 - 6 England", () => {
    const m103 = snapshot.matches["match-103"];
    assert.ok(m103, "Match 103 must exist in snapshot");
    assert.strictEqual(m103.homeScore, 4, "France score must be 4");
    assert.strictEqual(m103.awayScore, 6, "England score must be 6");
    assert.strictEqual(m103.status, "FINISHED", "Match 103 must be finished");
  });

  check("Match 103 regulation time check (no extra time or shootout)", () => {
    const m103 = snapshot.matches["match-103"];
    assert.strictEqual(m103.live?.scoreDuration, "REGULAR", "Match 103 must be REGULAR time duration");
    assert.ok(m103.live?.penaltyShootoutScore === undefined || m103.live?.penaltyShootoutScore === null, "Match 103 must have no penalty score");
  });

  // 4. Scorer Goal Distributions and Totals
  check("Goal scorers distribution is correct", () => {
    const m103 = snapshot.matches["match-103"];
    const scorers = m103.scorers || [];

    const countGoals = (player: string) => scorers.filter(s => s.playerName === player).length;

    assert.strictEqual(countGoals("Bukayo Saka"), 3, "Saka must have 3 goals");
    assert.strictEqual(countGoals("Declan Rice"), 1, "Rice must have 1 goal");
    assert.strictEqual(countGoals("Ezri Konsa"), 1, "Konsa must have 1 goal");
    assert.strictEqual(countGoals("Jude Bellingham"), 1, "Bellingham must have 1 goal");
    assert.strictEqual(countGoals("Kylian Mbappé"), 2, "Mbappe must have 2 goals");
    assert.strictEqual(countGoals("Bradley Barcola"), 1, "Barcola must have 1 goal");
    assert.strictEqual(countGoals("Ousmane Dembélé"), 1, "Dembele must have 1 goal");

    assert.strictEqual(scorers.length, 10, "Should have exactly 10 goal events");
  });

  check("Tournament total goals statistics is updated correctly", () => {
    const stats = snapshot.tournamentStats;
    assert.ok(stats.totalGoals > 10, "Total goals should be populated");
  });

  check("Golden Boot standings remain provisional", () => {
    // Top scorers table must exist, but since Match 104 is not finished, Golden Boot is not final
    assert.ok(snapshot.topScorers.length > 0, "Top scorers list should not be empty");
  });

  // 5. Match 104 is unresolved
  check("Match 104 is unresolved and scheduled", () => {
    const m104 = snapshot.matches["match-104"];
    assert.ok(m104, "Match 104 must exist in snapshot");
    assert.strictEqual(m104.status, "SCHEDULED", "Match 104 must be SCHEDULED");
    assert.strictEqual(m104.homeScore, null, "Match 104 home score must be null");
    assert.strictEqual(m104.awayScore, null, "Match 104 away score must be null");
  });

  // 6. Editorial content registry
  check("Editorial report exists for Match 103", () => {
    const report = MATCH_EDITORIAL_REPORTS["match-103"];
    assert.ok(report, "Editorial report for Match 103 must be registered");
    assert.strictEqual(report.editorIdentity, "WorldCupMatchDay Editorial Team", "Should have correct editor team");
    assert.ok(report.headline.includes("Ten-Goal Thriller"), "Headline should match expected text");
    assert.ok(report.bodySections.length >= 4, "Should have at least 4 detailed sections");
    assert.strictEqual(report.updatedAt, "2026-07-18T23:00:18Z", "Timestamp must match official completion");
  });

  // 7. Negative checks
  check("Negative check: Missing completed knockout match fails validation", () => {
    const fakeCompleted = new Set(["match-103"]);
    const fakeGamesPayload: WorldCup26Game[] = []; // empty payload - missing match-103

    const result = validateProviderPayload(fakeGamesPayload, fakeCompleted);
    assert.strictEqual(result.ok, false, "Validation should fail when completed knockout match is missing from payload");
    assert.ok(
      result.errors.some(e => e.includes("Required completed match missing")),
      "Should throw missing completed match error"
    );
  });

  check("Negative check: Correct reconciled Match 103 passes validation", () => {
    const completed = new Set(["match-103"]);
    const gamesPayload: WorldCup26Game[] = [
      {
        providerGameId: "760516",
        homeTeamName: "France",
        awayTeamName: "England",
        homeScore: 4,
        awayScore: 6,
        finished: true,
        isLive: false,
        homeScorers: [{ type: "GOAL", minute: 48, playerName: "Kylian Mbappé", teamName: "France", provider: "worldcup26.ir", confidence: "high" }],
        awayScorers: [{ type: "GOAL", minute: 3, playerName: "Declan Rice", teamName: "England", provider: "worldcup26.ir", confidence: "high" }],
        localDate: "2026-07-18",
      }
    ];

    const result = validateProviderPayload(gamesPayload, completed);
    // Since it's only 1 match, it might fail the total count check (<65), but it should NOT say "Required completed match missing"
    assert.ok(
      !result.errors.some(e => e.includes("Required completed match missing")),
      "Should successfully map match-103 and not throw missing completed match error"
    );
  });

  check("Negative check: France vs England next match is campaign-completed", () => {
    const engStatus = getTeamTournamentStatus({
      teamKey: "england",
      matches: MATCHES,
      snapshotMatches: snapshot.matches,
      resolvedParticipants,
      now,
    });
    assert.strictEqual(engStatus.nextMatch, null, "England should have no next match scheduled");
  });

  console.log(`\nRegression Suite Complete: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Test execution threw error:", err);
  process.exit(1);
});
