import { createSerializableSnapshotCache, type TournamentLiveSnapshot } from "../lib/liveSnapshot";

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

function emptySnapshot(snapshotId: string): TournamentLiveSnapshot {
  return {
    snapshotId,
    generatedAt: "2026-06-12T21:00:00.000Z",
    updatedAt: "2026-06-12T21:00:00.000Z",
    matches: {},
    liveDataByProviderId: {},
    standingsByGroup: {},
    thirdPlaceRanking: [],
    tournamentStats: {
      matchesPlayed: 0,
      totalGoals: 0,
      averageGoalsPerMatch: 0,
      highestScoringMatch: null,
      biggestWin: null,
      cleanSheets: 0,
      lastSyncedAt: null,
    },
    teamLeaderboards: {
      topScoringTeams: [],
      mostPoints: [],
      mostWins: [],
    },
    topScorers: [],
    primaryProviderOk: true,
    secondaryProviderOk: true,
    primaryProviderFetchedAt: "2026-06-12T21:00:00.000Z",
    secondaryProviderFetchedAt: "2026-06-12T21:00:00.000Z",
  };
}

async function main() {
  console.log("=== Cross-route snapshot cache test ===\n");

  let now = 1_000;
  let providerBuilds = 0;
  const getCachedSnapshot = createSerializableSnapshotCache({
    ttlMs: 30_000,
    now: () => now,
    build: async () => {
      providerBuilds++;
      return emptySnapshot(`snapshot-${providerBuilds}`);
    },
  });

  const selectors = await Promise.all([
    getCachedSnapshot(),
    getCachedSnapshot(),
    getCachedSnapshot(),
    getCachedSnapshot(),
    getCachedSnapshot(),
    getCachedSnapshot(),
  ]);

  assert(new Set(selectors.map((s) => s.snapshotId)).size === 1, "six route selectors receive the same snapshotId");
  assert(providerBuilds === 1, "provider fetch builder runs once within the TTL");

  const afterFirstWindow = await getCachedSnapshot();
  assert(afterFirstWindow.snapshotId === selectors[0].snapshotId, "cached result is reused across route selectors");

  now += 30_001;
  const afterTtl = await getCachedSnapshot();
  assert(afterTtl.snapshotId === "snapshot-2", "cache refreshes after TTL expires");
  assert(providerBuilds === 2, "provider fetch builder runs again only after TTL");

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
