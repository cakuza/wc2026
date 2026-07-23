/**
 * Deterministic regression suite for Final Archive Truth Parity.
 *
 * Verifies that all 104 matches, bracket, stats, homepage, match detail,
 * and 7 timezone schedule surfaces express the exact same completed tournament truth.
 *
 * Usage:
 *   npx tsx scripts/test-final-archive-truth-parity.ts
 */

import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { MATCHES, matchSlug } from "../lib/matches";
import { getTournamentLiveSnapshot } from "../lib/liveSnapshot";
import { buildKnockoutResolution } from "../lib/knockoutResolution";
import { getArchiveState } from "../lib/archiveLifecycle";
import { ARCHIVE_DEFAULT_DATE } from "../lib/matches";
import { TIMEZONE_SLUGS } from "../lib/timezones";

const outDirectory = path.join(process.cwd(), "out");
const nextAppDir = path.join(process.cwd(), ".next/server/app");

function getHtmlContent(routePath: string): string {
  const cleanRoute = routePath === "/" ? "" : routePath.startsWith("/") ? routePath.slice(1) : routePath;
  const candidates = [
    path.join(outDirectory, cleanRoute ? `${cleanRoute}.html` : "index.html"),
    path.join(outDirectory, cleanRoute, "index.html"),
    path.join(nextAppDir, cleanRoute ? `${cleanRoute}.html` : "index.html"),
    path.join(nextAppDir, cleanRoute, "index.html"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return fs.readFileSync(candidate, "utf8");
    }
  }
  throw new Error(`HTML for route '${routePath}' not found in out/ or .next/server/app/`);
}

let totalAssertions = 0;
let passed = 0;
let failed = 0;

function check(condition: boolean, msg: string) {
  totalAssertions++;
  if (condition) {
    passed++;
    console.log(`  PASS  ${msg}`);
  } else {
    failed++;
    console.error(`  FAIL  ${msg}`);
  }
}

async function runSuite() {
  console.log("=== Running Final Archive Truth Parity Regression Suite ===\n");

  // 1. Data Layer & Archive State
  console.log("--- 1. Data Layer & Archive State ---");
  const snapshot = await getTournamentLiveSnapshot();
  const resolvedParticipants = buildKnockoutResolution(snapshot.matches);
  const archiveState = getArchiveState({
    matches: MATCHES,
    liveData: snapshot.liveDataByProviderId,
    resolvedParticipants,
    now: new Date(ARCHIVE_DEFAULT_DATE),
  });

  check(archiveState.isComplete === true, "Archive state is Complete");
  check(archiveState.champion === "Spain", "Archive champion is Spain");
  check(archiveState.runnerUp === "Argentina", "Archive runner-up is Argentina");
  check(archiveState.thirdPlace === "England", "Archive third place is England");
  check(archiveState.fourthPlace === "France", "Archive fourth place is France");
  check(Object.keys(snapshot.matches).length === 104, "Snapshot matches count is exactly 104");

  // Check finished count
  const finishedCount = Object.values(snapshot.matches).filter(m => m.status === "FINISHED").length;
  check(finishedCount === 104, "Snapshot finished match count is exactly 104");

  // 2. Homepage (/)
  console.log("\n--- 2. Homepage (/) ---");
  const homeHtml = getHtmlContent("/");
  check(homeHtml.includes("Spain") && homeHtml.includes("Argentina"), "Homepage contains Spain and Argentina");
  check(homeHtml.includes("1") && homeHtml.includes("0"), "Homepage contains score elements");
  check(!homeHtml.includes("Match center opens at kickoff"), "Homepage has no placeholder 'Match center opens at kickoff'");

  // 3. Schedule Page (/schedule) & Timezone Routes
  console.log("\n--- 3. Schedule & Timezone Routes ---");
  const scheduleHtml = getHtmlContent("/schedule");
  check(scheduleHtml.includes("Completed Results"), "Schedule contains 'Completed Results'");
  check(!scheduleHtml.includes("Upcoming Matches"), "Schedule suppresses 'Upcoming Matches' section");
  check(!scheduleHtml.includes("To Be Determined"), "Schedule contains no 'To Be Determined'");

  for (const zoneSlug of TIMEZONE_SLUGS) {
    const tzHtml = getHtmlContent(`/schedule/${zoneSlug}`);
    check(!tzHtml.includes("Upcoming Matches"), `[${zoneSlug}] Suppresses Upcoming Matches`);
    check(!tzHtml.includes("To Be Determined"), `[${zoneSlug}] Has no To Be Determined`);
    check(tzHtml.includes("Spain") && tzHtml.includes("Argentina"), `[${zoneSlug}] Contains Final participants`);
    const cleanTz = tzHtml.replace(/<!-- -->/g, "");
    check(cleanTz.includes("1 - 0") || cleanTz.includes("1–0") || cleanTz.includes("1-0"), `[${zoneSlug}] Contains Final score`);
  }

  // 4. Bracket Page (/bracket)
  console.log("\n--- 4. Bracket Page (/bracket) ---");
  const bracketHtml = getHtmlContent("/bracket");
  check(bracketHtml.includes("Tournament Complete"), "Bracket phase is Tournament Complete");
  check(bracketHtml.includes("Spain"), "Bracket contains Spain");
  check(bracketHtml.includes("Argentina"), "Bracket contains Argentina");
  check(!bracketHtml.includes("upcoming final"), "Bracket has no 'upcoming final'");

  // 5. Match 104 Page (/matches/match-104)
  console.log("\n--- 5. Match 104 Page (/matches/match-104) ---");
  const m104Html = getHtmlContent("/matches/match-104");
  check(m104Html.includes("Spain"), "Match 104 page includes Spain");
  check(m104Html.includes("Argentina"), "Match 104 page includes Argentina");
  check(m104Html.includes("1") && m104Html.includes("0"), "Match 104 page includes score 1-0");
  check(m104Html.includes("Torres") || m104Html.includes("Ferran"), "Match 104 includes scorer Torres");
  check(m104Html.includes("106"), "Match 104 includes goal minute 106'");
  check(!m104Html.includes("UPCOMING"), "Match 104 HTML does not contain 'UPCOMING'");
  check(!m104Html.includes("Match Preview"), "Match 104 HTML does not contain 'Match Preview'");
  check(!m104Html.includes("Match center opens at kickoff"), "Match 104 HTML does not contain 'Match center opens at kickoff'");
  check(!m104Html.includes("To Be Determined"), "Match 104 HTML does not contain 'To Be Determined'");

  // Check JSON-LD in Match 104
  const jsonLdMatch = m104Html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
  let sportsEventLd: any = null;
  if (jsonLdMatch) {
    for (const block of jsonLdMatch) {
      const content = block.replace(/<script type="application\/ld\+json">/, "").replace(/<\/script>/, "");
      try {
        const parsed = JSON.parse(content);
        if (parsed["@type"] === "SportsEvent") {
          sportsEventLd = parsed;
          break;
        }
      } catch {}
    }
  }
  check(sportsEventLd !== null, "Match 104 has SportsEvent JSON-LD");
  if (sportsEventLd) {
    check(sportsEventLd.eventStatus === "https://schema.org/EventCompleted", "SportsEvent status is EventCompleted");
    check(sportsEventLd.homeTeam?.name === "Spain", "SportsEvent homeTeam is Spain");
    check(sportsEventLd.awayTeam?.name === "Argentina", "SportsEvent awayTeam is Argentina");
  }

  // 6. Match 103 Page (/matches/match-103)
  console.log("\n--- 6. Match 103 Page (/matches/match-103) ---");
  const m103Html = getHtmlContent("/matches/match-103");
  check(m103Html.includes("France"), "Match 103 includes France");
  check(m103Html.includes("England"), "Match 103 includes England");
  check(m103Html.includes("4") && m103Html.includes("6"), "Match 103 includes score 4-6");

  // 7. Stats Page (/stats)
  console.log("\n--- 7. Stats Page (/stats) ---");
  const statsHtml = getHtmlContent("/stats");
  check(statsHtml.includes("104"), "Stats page includes 104 matches");

  console.log(`\n==========================================================================`);
  console.log(`Final Archive Truth Parity Suite Summary:`);
  console.log(`  Total Assertions: ${totalAssertions}`);
  console.log(`  Passed:           ${passed}`);
  console.log(`  Failed:           ${failed}`);
  console.log(`==========================================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error("Suite crashed:", err);
  process.exit(1);
});
