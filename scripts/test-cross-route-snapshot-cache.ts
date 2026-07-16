import { buildTournamentLiveSnapshot } from "../lib/liveSnapshot";

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

async function main() {
  console.log("=== Snapshot construction isolation test ===\n");

  const first = await buildTournamentLiveSnapshot({
    liveData: new Map(),
    worldcupGames: null,
    generatedAt: "2026-07-15T10:00:00.000Z",
    skipEnrichment: true,
  });
  const second = await buildTournamentLiveSnapshot({
    liveData: new Map(),
    worldcupGames: null,
    generatedAt: "2026-07-15T10:00:01.000Z",
    skipEnrichment: true,
  });

  assert(first !== second, "each caller receives a newly constructed snapshot object");
  assert(first.generatedAt === "2026-07-15T10:00:00.000Z", "first snapshot retains its construction timestamp");
  assert(second.generatedAt === "2026-07-15T10:00:01.000Z", "second snapshot uses a fresh construction timestamp");
  assert(first.updatedAt !== second.updatedAt, "derived snapshot freshness is not retained across calls");

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
