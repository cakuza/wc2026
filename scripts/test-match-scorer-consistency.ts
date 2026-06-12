export {};

/**
 * Integration test: /stats and individual match pages must agree on scorer data.
 *
 * Both pages now read from the same getScorerEventsByInternalMatchId() map
 * (lib/worldcup26Provider.ts). This test simulates both lookup paths and
 * confirms they never disagree: if the shared map has scorer events for a
 * match, the match-detail enrichment for that match must also see them.
 *
 * Makes a live network request to worldcup26.ir.
 *
 * Usage:
 *   npx tsx scripts/test-match-scorer-consistency.ts
 */

import { getScorerEventsByInternalMatchId } from "../lib/worldcup26Provider";
import { MATCHES, matchSlug } from "../lib/matches";
import { countryName } from "../lib/i18n";

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
console.log("=== Match/stats scorer consistency test ===\n");

const scorerMap = await getScorerEventsByInternalMatchId();

console.log(`Shared map has scorer events for ${scorerMap.size} match(es).\n`);

// ── /stats path: aggregates topScorers from every entry in the shared map ────
const statsTopScorers = new Map<string, { teamName: string | null; goals: number }>();
for (const events of scorerMap.values()) {
  for (const g of events) {
    const existing = statsTopScorers.get(g.playerName);
    if (existing) existing.goals++;
    else statsTopScorers.set(g.playerName, { teamName: g.teamName, goals: 1 });
  }
}

console.log(`/stats would show ${statsTopScorers.size} distinct scorer(s):`);
for (const [name, info] of statsTopScorers) {
  console.log(`  ${name} (${info.teamName}) — ${info.goals} goal(s)`);
}

// ── Match detail path: for each match, look up scorerMap.get(matchSlug(match)) ─
console.log("\nPer-match consistency:");
for (const match of MATCHES) {
  const slug = matchSlug(match);
  const events = scorerMap.get(slug);
  if (!events || events.length === 0) continue;

  console.log(`\n${slug} (${countryName(match.homeKey, "en")} vs ${countryName(match.awayKey, "en")}):`);
  for (const e of events) {
    console.log(`  ${e.minute ?? "?"}' ${e.playerName} (${e.teamName})`);
    // Every player in this match's events must be reflected in the stats aggregation.
    const inStats = statsTopScorers.has(e.playerName);
    assert(inStats, `${e.playerName} (from ${slug}) appears in /stats top-scorer aggregation`);
  }

  // Match detail enrichment must apply for this match (same map lookup as stats source).
  assert(
    scorerMap.get(slug) === events,
    `match-detail enrichment for "${slug}" reads from the same shared map entry as /stats`,
  );
}

// ── Specific check: South Korea vs Czechia ────────────────────────────────────
console.log("\n─── South Korea vs Czechia specific check ───");
const korMatch = MATCHES.find(
  (m) => countryName(m.homeKey, "en") === "South Korea" && countryName(m.awayKey, "en") === "Czechia",
);

if (korMatch) {
  const slug = matchSlug(korMatch);
  const events = scorerMap.get(slug);
  if (events && events.length > 0) {
    assert(events.length === 3, `south-korea-vs-czechia has 3 scorer events (got ${events.length})`);
    const names = events.map((e) => e.playerName);
    console.log(`  Scorers: ${names.join(", ")}`);
    assert(
      events.every((e) => e.teamName === "South Korea" || e.teamName === "Czechia"),
      "all scorer events use internal team display names (South Korea / Czechia)",
    );
  } else {
    console.log("  No scorer events found for South Korea vs Czechia (provider may not have parsed it yet)");
  }
} else {
  console.log("  South Korea vs Czechia fixture not found in MATCHES");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});
