import {
  buildTournamentLiveSnapshot,
  canonicalStatus,
  createSerializableSnapshotCache,
} from "../lib/liveSnapshot";
import type { LiveMatchData } from "../lib/liveMatchData";
import type { GoalScorerEvent, WorldCup26Game } from "../lib/worldcup26Provider";

const CANADA_PROVIDER_ID = 537333;
const CANADA_MATCH_ID = "canada-vs-bosnia-jun12";

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

function live(status: LiveMatchData["status"], homeScore: number | null, awayScore: number | null): LiveMatchData {
  return {
    provider: "football-data.org",
    providerMatchId: CANADA_PROVIDER_ID,
    status,
    homeScore,
    awayScore,
    winner: homeScore === awayScore && homeScore !== null ? "DRAW" : null,
    lastSyncedAt: "2026-06-12T20:20:00.000Z",
    eventDataAvailable: false,
  };
}

function scorer(playerName: string, teamName: string, minute: number): GoalScorerEvent {
  return {
    type: "GOAL",
    minute,
    teamName,
    playerName,
    provider: "worldcup26.ir",
    confidence: "high",
  };
}

function worldcupGame(finished: boolean): WorldCup26Game {
  return {
    providerGameId: "canada-bosnia",
    homeTeamName: "Canada",
    awayTeamName: "Bosnia and Herzegovina",
    homeScore: 1,
    awayScore: 1,
    finished,
    homeScorers: [scorer("C. Larin", "Canada", 11), scorer("C. Larin", "Canada", 11)],
    awayScorers: [scorer("Jovo Lukic", "Bosnia and Herzegovina", 21)],
    localDate: "2026-06-12",
  };
}

async function main() {
  console.log("=== Monotonic match state test ===\n");

  assert(canonicalStatus({ footballData: live("SCHEDULED", null, null) }) === "SCHEDULED", "SCHEDULED starts as scheduled");
  assert(canonicalStatus({ footballData: live("IN_PLAY", 0, 0) }) === "LIVE", "SCHEDULED -> LIVE allowed");
  assert(canonicalStatus({ footballData: live("FINISHED", 1, 1) }) === "FINISHED", "LIVE -> FINISHED allowed");
  assert(
    canonicalStatus({ footballData: live("IN_PLAY", 1, 1), worldcupGame: worldcupGame(true) }) === "FINISHED",
    "either trusted provider reporting FINISHED makes canonical status FINISHED",
  );

  const finalSnapshot = await buildTournamentLiveSnapshot({
    liveData: new Map([[CANADA_PROVIDER_ID, live("IN_PLAY", 1, 1)]]),
    worldcupGames: [worldcupGame(true)],
    generatedAt: "2026-06-12T21:00:00.000Z",
  });
  const finalMatch = finalSnapshot.matches[CANADA_MATCH_ID];
  assert(finalMatch.status === "FINISHED", "FINISHED -> LIVE rejected by canonical worldcup status");
  assert(finalMatch.live?.status === "FINISHED", "canonical live data is FINISHED");
  assert(finalMatch.homeScore === 1 && finalMatch.awayScore === 1, "final score remains 1-1");
  assert(finalMatch.scorers.length === 2, "duplicate scorers are removed by player, minute and team");
  assert(finalMatch.scorers[0]?.playerName === "Jovo Lukić" && finalMatch.scorers[0]?.minute === 21, "verified correction keeps Bosnia opener at 21'");
  assert(finalMatch.scorers[1]?.playerName === "Cyle Larin" && finalMatch.scorers[1]?.minute === 78, "verified correction moves Canada equalizer to 78'");

  let now = 1_000;
  let fail = false;
  const getCachedSnapshot = createSerializableSnapshotCache({
    ttlMs: 30_000,
    now: () => now,
    build: async () => {
      if (fail) throw new Error("provider timeout");
      return finalSnapshot;
    },
  });

  const first = await getCachedSnapshot();
  fail = true;
  now += 30_001;
  const stale = await getCachedSnapshot();
  const staleMatch = stale.matches[CANADA_MATCH_ID];
  assert(stale.snapshotId === first.snapshotId, "failed refresh serves previous cached snapshot");
  assert(staleMatch.status === "FINISHED", "FINISHED -> SCHEDULED rejected during score timeout");
  assert(staleMatch.homeScore === 1 && staleMatch.awayScore === 1, "score timeout preserves previous final score");
  assert(staleMatch.scorers.length === 2, "scorer timeout preserves previous scorers");

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
