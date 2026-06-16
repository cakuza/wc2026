/**
 * Deployment Readiness Gate — Secondary Provider
 *
 * Thin HTTP wrapper around the pure `validateProviderPayload` validator in
 * lib/readinessValidator.ts.  Calls the real provider and exits with code 0
 * (ready) or 1 (not ready).
 *
 * Run this BEFORE merging to main.  This script makes a live network call and
 * must NOT be included in deterministic CI.  For offline unit tests see
 * scripts/test-readiness-validator.ts.
 */

import { fetchWorldCup26Games } from "../lib/worldcup26Provider";
import {
  validateProviderPayload,
  completedSlugsBefore,
} from "../lib/readinessValidator";

async function main() {
  console.log("[readiness] Fetching secondary provider…");

  let games: Awaited<ReturnType<typeof fetchWorldCup26Games>>;
  try {
    games = await fetchWorldCup26Games();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[readiness] FAIL: Provider fetch threw: ${msg}`);
    process.exit(1);
  }

  console.log(`[readiness] Received ${games.length} games`);

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const completedSlugs = completedSlugsBefore(today);
  console.log(`[readiness] ${completedSlugs.size} completed matches expected from canonical fixture list`);

  const result = validateProviderPayload(games, completedSlugs);

  for (const w of result.warnings) {
    console.warn(`[readiness] ⚠️  ${w}`);
  }
  for (const e of result.errors) {
    console.error(`[readiness] ❌ ${e}`);
  }

  if (!result.ok) {
    console.error("\n[readiness] PROVIDER NOT READY — do not deploy cold-cache architecture");
    process.exit(1);
  }

  console.log(
    `\n[readiness] ✅ Provider ready (${result.mappedCount}/${result.totalCanonical} canonical matches mapped)`,
  );
  process.exit(0);
}

main();
