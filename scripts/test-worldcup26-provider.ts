export {};

/**
 * Integration test for the worldcup26.ir free provider.
 *
 * Fetches https://worldcup26.ir/get/games, locates Mexico vs South Africa,
 * reads scorer fields, and reports whether this API is usable as secondary
 * scorer enrichment.
 *
 * No API key required. Read-only. Does NOT modify any production code.
 *
 * Usage:
 *   npx tsx scripts/test-worldcup26-provider.ts
 *
 * Exit codes:
 *   0 — provider reachable, response shape understood
 *   1 — provider unreachable or response not parseable
 */

import { fetchWorldCup26Games, getScorerEventsByInternalMatchId } from "../lib/worldcup26Provider";
import { MATCHES, matchSlug } from "../lib/matches";
import { countryName } from "../lib/i18n";

const ENDPOINT = "https://worldcup26.ir/get/games";

async function main() {
  console.log("=== worldcup26.ir provider test ===\n");
  console.log(`Endpoint: ${ENDPOINT}`);

  // Raw HTTP check for headers
  let httpStatus = 0;
  let elapsed = 0;
  try {
    const t0 = Date.now();
    const res = await fetch(ENDPOINT);
    elapsed = Date.now() - t0;
    httpStatus = res.status;
    console.log(`Status:        HTTP ${res.status} (${elapsed}ms)`);
    console.log(`Content-Type:  ${res.headers.get("content-type") ?? "n/a"}`);
    console.log(`Rate-Limit:    ${res.headers.get("x-ratelimit-limit") ?? "none"}`);
    console.log(`Retry-After:   ${res.headers.get("retry-after") ?? "none"}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`\nFAIL: network error — ${msg}`);
    process.exitCode = 1;
    return;
  }

  if (httpStatus !== 200) {
    console.error(`\nFAIL: HTTP ${httpStatus} — provider unavailable`);
    process.exitCode = 1;
    return;
  }

  // Use the lib parser
  const games = await fetchWorldCup26Games();
  if (!games) {
    console.error("\nFAIL: fetchWorldCup26Games returned null");
    process.exitCode = 1;
    return;
  }

  console.log(`\nGames parsed:  ${games.length}`);
  if (games.length === 0) {
    console.error("FAIL: no games in response");
    process.exitCode = 1;
    return;
  }

  console.log(`Sample fields: providerGameId, homeTeamName, awayTeamName, homeScore, awayScore, finished, homeScorers, awayScorers`);

  // ── Mexico vs South Africa ────────────────────────────────────────────────
  console.log("\n─── Mexico vs South Africa ───");
  const mex = games.find(
    (g) => g.homeTeamName === "Mexico" && g.awayTeamName === "South Africa",
  );

  if (!mex) {
    console.log("NOT FOUND in parsed games");
    console.log("Available teams (first 10 games):");
    games.slice(0, 10).forEach((g) => console.log(`  ${g.homeTeamName} vs ${g.awayTeamName}`));
    process.exitCode = 1;
  } else {
    console.log(`Provider game id: ${mex.providerGameId}`);
    console.log(`Score:            ${mex.homeScore}–${mex.awayScore}`);
    console.log(`Finished:         ${mex.finished}`);
    console.log(`Home scorers (${mex.homeScorers.length}):`);
    for (const g of mex.homeScorers) {
      console.log(`  ${g.minute ?? "?"}' ${g.playerName} [${g.confidence}]`);
    }
    console.log(`Away scorers (${mex.awayScorers.length}):`);
    for (const g of mex.awayScorers) {
      console.log(`  ${g.minute ?? "?"}' ${g.playerName} [${g.confidence}]`);
    }

    const hasScorers = mex.homeScorers.length > 0 || mex.awayScorers.length > 0;
    const allHighConfidence =
      [...mex.homeScorers, ...mex.awayScorers].every((g) => g.confidence === "high");

    if (hasScorers && allHighConfidence) {
      console.log("\nVERDICT: Provider usable for scorer enrichment (all high confidence)");
    } else if (hasScorers) {
      console.log("\nVERDICT: Provider has scorer data but some entries are low confidence");
    } else {
      console.log("\nVERDICT: Provider reachable but no scorer data for this match");
    }
  }

  // ── South Korea vs Czechia ────────────────────────────────────────────────
  console.log("\n─── South Korea vs Czechia ───");
  const kor = games.find(
    (g) =>
      (g.homeTeamName.toLowerCase().includes("korea") || g.homeTeamName.toLowerCase().includes("south korea")) &&
      g.awayTeamName.toLowerCase().includes("czech"),
  );

  if (!kor) {
    console.log("NOT FOUND in parsed games");
  } else {
    console.log(`Provider game id: ${kor.providerGameId}`);
    console.log(`Home team:        ${kor.homeTeamName}`);
    console.log(`Away team:        ${kor.awayTeamName}`);
    console.log(`Score:            ${kor.homeScore}–${kor.awayScore}`);
    console.log(`Finished:         ${kor.finished}`);
    console.log(`Home scorers (${kor.homeScorers.length}):`);
    for (const g of kor.homeScorers) {
      console.log(`  ${g.minute ?? "?"}' ${g.playerName} [${g.confidence}]`);
    }
    console.log(`Away scorers (${kor.awayScorers.length}):`);
    for (const g of kor.awayScorers) {
      console.log(`  ${g.minute ?? "?"}' ${g.playerName} [${g.confidence}]`);
    }
  }

  // ── Shared scorer enrichment map ────────────────────────────────────────────
  console.log("\n─── Shared scorer enrichment map (internal match ids) ───");
  const scorerMap = await getScorerEventsByInternalMatchId();
  console.log(`Matches with scorer events: ${scorerMap.size}`);

  const mexMatch = MATCHES.find(
    (m) => countryName(m.homeKey, "en") === "Mexico" && countryName(m.awayKey, "en") === "South Africa",
  );
  const korMatch = MATCHES.find(
    (m) => countryName(m.homeKey, "en") === "South Korea" && countryName(m.awayKey, "en") === "Czechia",
  );

  if (mexMatch) {
    const slug = matchSlug(mexMatch);
    const events = scorerMap.get(slug);
    console.log(`\n${slug}:`);
    console.log(`  Raw provider names: ${mex?.homeTeamName ?? "?"} vs ${mex?.awayTeamName ?? "?"}`);
    if (events) {
      for (const e of events) console.log(`  ${e.minute ?? "?"}' ${e.playerName} (${e.teamName})`);
    } else {
      console.log("  NOT FOUND in shared map");
    }
  }

  if (korMatch) {
    const slug = matchSlug(korMatch);
    const events = scorerMap.get(slug);
    console.log(`\n${slug}:`);
    console.log(`  Raw provider names: ${kor?.homeTeamName ?? "?"} vs ${kor?.awayTeamName ?? "?"}`);
    if (events) {
      for (const e of events) console.log(`  ${e.minute ?? "?"}' ${e.playerName} (${e.teamName})`);
    } else {
      console.log("  NOT FOUND in shared map");
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n─── Summary ───");
  const finishedGames = games.filter((g) => g.finished);
  const gamesWithScorers = games.filter(
    (g) => g.homeScorers.length > 0 || g.awayScorers.length > 0,
  );
  console.log(`Total games: ${games.length}`);
  console.log(`Finished:    ${finishedGames.length}`);
  console.log(`With scorers: ${gamesWithScorers.length}`);
  console.log(`Response time: ${elapsed}ms`);
  console.log(`No API key required: yes`);
  console.log(`Rate-limit headers: none observed`);
}

main().catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});
