/**
 * Deployment Readiness Gate — Secondary Provider
 *
 * Verifies that worldcup26.ir currently returns enough valid data to safely
 * initialize the production cache on a cold start.
 *
 * Exit 0 = provider ready.  Exit 1 = provider not ready — do NOT deploy.
 *
 * Run this BEFORE merging to main.  This script calls the real provider and
 * must NOT be included in deterministic CI.
 */
import { fetchWorldCup26Games } from "../lib/worldcup26Provider";

const MINIMUM_MATCH_COVERAGE = 10; // At minimum 10 matches must be present
const KNOWN_COMPLETED_MATCHES: Array<{
  home: string;
  away: string;
  minHomeScorers: number;
  minAwayScorers: number;
  homeGoals: number;
  awayGoals: number;
}> = [
  { home: "Mexico",      away: "South Africa", homeGoals: 2, awayGoals: 0, minHomeScorers: 1, minAwayScorers: 0 },
  { home: "South Korea", away: "Czechia",      homeGoals: 3, awayGoals: 1, minHomeScorers: 1, minAwayScorers: 1 },
];

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z]/g, "");
}

async function main() {
  const errors: string[] = [];
  const warnings: string[] = [];

  console.log("[readiness] Fetching secondary provider…");
  let games: Awaited<ReturnType<typeof fetchWorldCup26Games>>;

  try {
    games = await fetchWorldCup26Games();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[readiness] FAIL: Provider fetch threw: ${msg}`);
    process.exit(1);
  }

  // 1. Non-empty
  if (games.length === 0) {
    errors.push("Provider returned 0 games");
  } else {
    console.log(`[readiness] Received ${games.length} games`);
  }

  // 2. Minimum coverage
  if (games.length < MINIMUM_MATCH_COVERAGE) {
    errors.push(`Coverage too low: ${games.length} < ${MINIMUM_MATCH_COVERAGE}`);
  }

  // 3. Completed match coverage (at least some finished matches)
  const finishedGames = games.filter((g) => g.finished);
  if (finishedGames.length === 0) {
    warnings.push("No finished games in payload (tournament may not have started yet)");
  } else {
    console.log(`[readiness] ${finishedGames.length} finished games present`);
  }

  // 4. Known match scorer validation
  for (const known of KNOWN_COMPLETED_MATCHES) {
    const game = games.find(
      (g) =>
        normalize(g.homeTeamName) === normalize(known.home) &&
        normalize(g.awayTeamName) === normalize(known.away),
    );

    if (!game) {
      errors.push(`Missing known match: ${known.home} vs ${known.away}`);
      continue;
    }

    if (!game.finished) {
      warnings.push(`${known.home} vs ${known.away} not marked finished yet`);
      continue;
    }

    if (game.homeScore !== known.homeGoals || game.awayScore !== known.awayGoals) {
      errors.push(
        `${known.home} vs ${known.away}: score mismatch — got ${game.homeScore}–${game.awayScore}, expected ${known.homeGoals}–${known.awayGoals}`,
      );
    }

    if (game.homeScorers.length < known.minHomeScorers) {
      errors.push(
        `${known.home} vs ${known.away}: home scorers insufficient — got ${game.homeScorers.length}, need ≥${known.minHomeScorers}`,
      );
    }

    if (game.awayScorers.length < known.minAwayScorers) {
      errors.push(
        `${known.home} vs ${known.away}: away scorers insufficient — got ${game.awayScorers.length}, need ≥${known.minAwayScorers}`,
      );
    }

    // 5. Scorer event structure validity
    for (const scorer of [...game.homeScorers, ...game.awayScorers]) {
      if (typeof scorer.playerName !== "string" || scorer.playerName.trim() === "") {
        errors.push(`${known.home} vs ${known.away}: scorer missing playerName`);
      }
      if (scorer.minute !== null && typeof scorer.minute !== "number") {
        errors.push(`${known.home} vs ${known.away}: scorer.minute invalid type`);
      }
    }

    console.log(
      `[readiness] ✅ ${known.home} vs ${known.away}: ${game.homeScore}–${game.awayScore}, ` +
        `${game.homeScorers.length} home / ${game.awayScorers.length} away scorers`,
    );
  }

  // 6. Payload sufficiency for cache initialization
  const validGames = games.filter((g) => {
    if (!g.finished) return true;
    const hasGoals = (g.homeScore ?? 0) > 0 || (g.awayScore ?? 0) > 0;
    return !(hasGoals && g.homeScorers.length === 0 && g.awayScorers.length === 0);
  });
  const suspiciousCount = games.length - validGames.length;
  if (suspiciousCount > 0) {
    warnings.push(`${suspiciousCount} game(s) had finished scorelines but zero scorer events`);
  }
  if (validGames.length < MINIMUM_MATCH_COVERAGE) {
    errors.push(`After filtering suspicious games, only ${validGames.length} remain — insufficient for safe init`);
  }

  // ── Summary ──
  if (warnings.length > 0) {
    for (const w of warnings) console.warn(`[readiness] ⚠️  ${w}`);
  }

  if (errors.length > 0) {
    for (const e of errors) console.error(`[readiness] ❌ ${e}`);
    console.error("\n[readiness] PROVIDER NOT READY — do not deploy cold-cache architecture");
    process.exit(1);
  }

  console.log(`\n[readiness] ✅ Provider ready (${validGames.length} valid games, ${finishedGames.length} finished)`);
  process.exit(0);
}

main();
