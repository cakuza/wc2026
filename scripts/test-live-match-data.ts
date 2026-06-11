/**
 * Smoke test for the live match score/status fetcher (lib/liveMatchData.ts).
 *
 * Fetches Mexico vs South Africa (football-data.org id 537327) and prints the
 * normalized LiveMatchData. Also checks the internal mapping in lib/matches.ts.
 *
 * Exits 0 if the API call succeeds (even if score is null).
 * Exits non-zero only on an actual integration error.
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/test-live-match-data.ts
 */

import { fetchLiveMatchData } from "../lib/liveMatchData";
import { matchBySlug } from "../lib/matches";

const PROVIDER_MATCH_ID = 537327;
const SLUG = "mexico-vs-south-africa-jun11";

async function main() {
  console.log("=== Live match data test ===\n");

  if (!process.env.FOOTBALL_DATA_API_KEY) {
    console.log("FOOTBALL_DATA_API_KEY is NOT set.");
    process.exitCode = 1;
    return;
  }

  // Internal mapping check
  const match = matchBySlug(SLUG);
  if (!match) {
    console.error(`Internal mapping error: no match found for slug "${SLUG}"`);
    process.exitCode = 1;
    return;
  }
  if (match.providerIds?.footballData !== PROVIDER_MATCH_ID) {
    console.error(
      `Internal mapping error: ${SLUG} providerIds.footballData = ${match.providerIds?.footballData}, expected ${PROVIDER_MATCH_ID}`
    );
    process.exitCode = 1;
    return;
  }
  console.log(`Internal mapping OK: ${SLUG} → providerIds.footballData = ${PROVIDER_MATCH_ID}`);

  // Live fetch
  const live = await fetchLiveMatchData(PROVIDER_MATCH_ID);

  if (!live) {
    console.error("\nfetchLiveMatchData returned null — integration error (see warnings above).");
    process.exitCode = 1;
    return;
  }

  console.log("\nLiveMatchData:");
  console.log(`  providerMatchId:    ${live.providerMatchId}`);
  console.log(`  rawStatus:          ${live.rawStatus}`);
  console.log(`  status:             ${live.status}`);
  console.log(`  homeScore:          ${live.homeScore}`);
  console.log(`  awayScore:          ${live.awayScore}`);
  console.log(`  winner:             ${live.winner}`);
  console.log(`  utcDate:            ${live.utcDate}`);
  console.log(`  lastSyncedAt:       ${live.lastSyncedAt}`);
  console.log(`  eventDataAvailable: ${live.eventDataAvailable}`);
  console.log(`  goals count:        ${live.goals?.length ?? "n/a"}`);
  console.log(`  bookings count:     ${live.bookings?.length ?? "n/a"}`);
  console.log(`  substitutions count:${live.substitutions?.length ?? "n/a"}`);

  if (live.eventDataAvailable && live.goals && live.goals.length > 0) {
    console.log("\n  Goals:");
    for (const g of live.goals) {
      console.log(`    ${g.minute ?? "?"}' ${g.playerName ?? "unknown"} (${g.teamName ?? "?"}) [${g.type}]`);
    }
  }

  console.log("\nResult: API integration OK.");
}

main().catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});
