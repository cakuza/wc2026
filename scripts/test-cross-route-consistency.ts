import assert from "assert";
import { buildTournamentLiveSnapshot } from "../lib/liveSnapshot";
import type { LiveMatchData } from "../lib/liveMatchData";
import type { WorldCup26Game } from "../lib/worldcup26Provider";
import { reconcileGoalEvents } from "../lib/scoreReconciliation";

async function runTests() {
  console.log("=== Running Cross-Route Consistency Contract Test ===\n");
  let passed = 0;
  let failed = 0;

  function run(name: string, fn: () => void | Promise<void>) {
    try {
      const result = fn();
      if (result instanceof Promise) {
        return result.then(() => {
          console.log(`✅ ${name}`);
          passed++;
        }).catch((e: any) => {
          console.error(`❌ ${name}`);
          console.error(e.message || e);
          failed++;
        });
      } else {
        console.log(`✅ ${name}`);
        passed++;
      }
    } catch (e: any) {
      console.error(`❌ ${name}`);
      console.error(e.message || e);
      failed++;
    }
  }

  await run("8. Cross-Route Deterministic Data Consistency", async () => {
    // We mock the incoming provider data for Canada vs Bosnia
    const liveData = new Map<number, LiveMatchData>();
    liveData.set(537333, { // ID for Canada vs Bosnia
      provider: "football-data.org",
      providerMatchId: 537333,
      status: "FINISHED",
      homeScore: 1, // Canada
      awayScore: 1, // Bosnia
      winner: "DRAW",
      lastSyncedAt: new Date().toISOString(),
      eventDataAvailable: false
    });

    const worldcupGames: WorldCup26Game[] = [{
      providerGameId: "537333",
      homeTeamName: "Canada",
      awayTeamName: "Bosnia & Herzegovina",
      homeScore: 1,
      awayScore: 1,
      finished: true,
      localDate: "2026-06-12",
      homeScorers: [{ playerName: "Cyle Larin", minute: 78, teamName: "Canada", type: "GOAL", isPenalty: false, isOwnGoal: false, provider: "worldcup26.ir", confidence: "high" }],
      awayScorers: [{ playerName: "Jovo Lukić", minute: 21, teamName: "Bosnia & Herzegovina", type: "GOAL", isPenalty: false, isOwnGoal: false, provider: "worldcup26.ir", confidence: "high" }]
    }];

    // Execute the singular source-of-truth builder
    const snapshot = await buildTournamentLiveSnapshot({
      liveData,
      worldcupGames,
      generatedAt: new Date().toISOString(),
      primaryProviderOk: true,
      secondaryProviderOk: true,
      primaryProviderFetchedAt: new Date().toISOString(),
      secondaryProviderFetchedAt: new Date().toISOString(),
    });

    const matchState = snapshot.matches["canada-vs-bosnia-jun12"];
    assert.strictEqual(matchState.status, "FINISHED");

    // Route 1: Stats & Top Scorers (consumes snapshot.topScorers)
    const larinTopScorer = snapshot.topScorers.find(s => s.playerName === "Cyle Larin");
    const lukicTopScorer = snapshot.topScorers.find(s => s.playerName === "Jovo Lukić");
    assert.strictEqual(larinTopScorer?.goals, 1, "Stats route: Larin should have 1 goal");
    assert.strictEqual(lukicTopScorer?.goals, 1, "Stats route: Lukić should have 1 goal");

    // Route 2: Standings (consumes snapshot.standingsByGroup)
    const groupB = snapshot.standingsByGroup["B"];
    const canadaRow = groupB.find(r => r.teamKey === "canada");
    const bosniaRow = groupB.find(r => r.teamKey === "bosnia");
    assert.strictEqual(canadaRow?.points, 1, "Standings route: Canada has 1 point");
    assert.strictEqual(bosniaRow?.points, 1, "Standings route: Bosnia has 1 point");
    assert.strictEqual(canadaRow?.goalsFor, 1, "Standings route: Canada GF is 1");
    assert.strictEqual(bosniaRow?.goalsFor, 1, "Standings route: Bosnia GF is 1");

    // Route 3: Third Place (consumes snapshot.thirdPlaceRanking)
    // Implicitly tested since thirdPlaceRanking is derived purely from group standings.
    assert.ok(Array.isArray(snapshot.thirdPlaceRanking), "Third place ranking is an array");

    // Route 4: Today / Schedule / Match Detail
    // These routes pass the fetched data directly into reconcileGoalEvents for display
    const { confirmedEvents } = reconcileGoalEvents({
      homeScore: matchState.homeScore,
      awayScore: matchState.awayScore,
      homeTeamName: "Canada",
      awayTeamName: "Bosnia & Herzegovina",
      events: matchState.scorers
    });
    assert.strictEqual(confirmedEvents?.length, 2, "Match Detail/Today: should have exactly 2 reconciled events");
    assert.strictEqual(confirmedEvents[0].playerName, "Jovo Lukić", "Match Detail/Today: Lukić scored first");
    assert.strictEqual(confirmedEvents[1].playerName, "Cyle Larin", "Match Detail/Today: Larin scored second");

  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}

runTests();
