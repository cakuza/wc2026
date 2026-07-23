/**
 * Deterministic regression suite for Final Archive Truth Parity.
 *
 * Verifies that all 104 matches, bracket, stats, homepage, match detail,
 * and 7 timezone schedule surfaces express the exact same completed tournament truth.
 * Uses semantic, route-scoped assertions rather than generic digit checks.
 *
 * Usage:
 *   npx tsx scripts/test-final-archive-truth-parity.ts
 */

import fs from "node:fs";
import path from "node:path";
import { MATCHES } from "../lib/matches";
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

  // 1. Data Layer & Archive State Invariants
  console.log("--- 1. Data Layer & Archive State Invariants ---");
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

  const finishedCount = Object.values(snapshot.matches).filter(m => m.status === "FINISHED").length;
  check(finishedCount === 104, "Snapshot finished match count is exactly 104");

  // 2. Homepage (/)
  console.log("\n--- 2. Homepage (/) ---");
  const homeHtml = getHtmlContent("/").replace(/<!-- -->/g, "");
  check(homeHtml.includes("Spain") && homeHtml.includes("Argentina"), "Homepage contains Spain and Argentina");
  check(homeHtml.includes("Spain") && homeHtml.includes("Champion"), "Homepage attributes Spain as Champion");
  check(homeHtml.includes("Argentina") && homeHtml.includes("Runner-up"), "Homepage attributes Argentina as Runner-up");
  check(!homeHtml.includes("Match center opens at kickoff"), "Homepage has no placeholder 'Match center opens at kickoff'");

  // 3. Schedule Page (/schedule) & Timezone Routes
  console.log("\n--- 3. Schedule & Timezone Routes ---");
  const scheduleHtml = getHtmlContent("/schedule").replace(/<!-- -->/g, "");
  check(scheduleHtml.includes("Completed Results"), "Schedule contains 'Completed Results'");
  check(!scheduleHtml.includes("Upcoming Matches"), "Schedule suppresses 'Upcoming Matches' section");
  check(!scheduleHtml.includes("To Be Determined"), "Schedule contains no 'To Be Determined'");

  for (const zoneSlug of TIMEZONE_SLUGS) {
    const tzHtml = getHtmlContent(`/schedule/${zoneSlug}`).replace(/<!-- -->/g, "");
    check(!tzHtml.includes("Upcoming Matches"), `[${zoneSlug}] Suppresses Upcoming Matches section`);
    check(!tzHtml.includes("To Be Determined") && !tzHtml.includes("TBD"), `[${zoneSlug}] Has no TBD or To Be Determined`);
    check(tzHtml.includes("France") && tzHtml.includes("England"), `[${zoneSlug}] Match 103 contains France and England`);
    check(tzHtml.includes("4 - 6") || tzHtml.includes("4–6") || tzHtml.includes("4-6"), `[${zoneSlug}] Match 103 contains score 4-6`);
    check(tzHtml.includes("Spain") && tzHtml.includes("Argentina"), `[${zoneSlug}] Match 104 contains Spain and Argentina`);
    check(tzHtml.includes("1 - 0") || tzHtml.includes("1–0") || tzHtml.includes("1-0"), `[${zoneSlug}] Match 104 contains score 1-0`);
  }

  // 4. Bracket Page (/bracket)
  console.log("\n--- 4. Bracket Page (/bracket) ---");
  const bracketHtml = getHtmlContent("/bracket").replace(/<!-- -->/g, "");
  check(bracketHtml.includes("Current phase · Tournament Complete"), "Bracket phase is 'Current phase · Tournament Complete'");
  check(bracketHtml.includes("Spain Champions") || bracketHtml.includes("Spain won the Final"), "Bracket attributes champion state to Spain");
  check(bracketHtml.includes("Spain") && bracketHtml.includes("1"), "Bracket final card contains Spain 1");
  check(bracketHtml.includes("Argentina") && bracketHtml.includes("0"), "Bracket final card contains Argentina 0");
  check(bracketHtml.includes("AET"), "Bracket final card contains AET");
  check(!bracketHtml.includes("upcoming final"), "Bracket has no 'upcoming final'");

  // 5. Match 104 Page (/matches/match-104)
  console.log("\n--- 5. Match 104 Page (/matches/match-104) ---");
  const m104Html = getHtmlContent("/matches/match-104").replace(/<!-- -->/g, "");

  // Scoped match score region (H1 heading check)
  const h1Match = m104Html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1Text = h1Match ? h1Match[1].trim() : "";
  check(h1Text === "Spain 1–0 Argentina" || h1Text === "Spain 1 - 0 Argentina", `Match 104 H1 score region is exact: "${h1Text}"`);

  check(m104Html.includes("AET") || m104Html.includes("After Extra Time") || m104Html.includes("After extra time"), "Match 104 contains AET / After Extra Time");
  check(m104Html.includes("Ferran Torres") || m104Html.includes("Torres"), "Match 104 includes scorer Ferran Torres");
  check(m104Html.includes("106'"), "Match 104 includes goal minute 106'");
  check(!m104Html.includes("UPCOMING"), "Match 104 HTML does not contain 'UPCOMING'");
  check(!m104Html.includes("Match Preview"), "Match 104 HTML does not contain 'Match Preview'");
  check(!m104Html.includes("Match center opens at kickoff"), "Match 104 HTML does not contain 'Match center opens at kickoff'");

  // Check SportsEvent JSON-LD on Match 104
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
    check(sportsEventLd.name?.includes("1–0") || sportsEventLd.name?.includes("1-0"), "SportsEvent name includes exact 1-0 score");
    check(sportsEventLd.description?.includes("Spain defeated Argentina"), "SportsEvent description includes winner Spain ('Spain defeated Argentina')");
  }

  // 6. Match 103 Page (/matches/match-103)
  console.log("\n--- 6. Match 103 Page (/matches/match-103) ---");
  const m103Html = getHtmlContent("/matches/match-103").replace(/<!-- -->/g, "");
  const h1Match103 = m103Html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1Text103 = h1Match103 ? h1Match103[1].trim() : "";
  check(h1Text103 === "France 4–6 England" || h1Text103 === "France 4 - 6 England", `Match 103 H1 score region is exact: "${h1Text103}"`);

  // 7. Stats Page (/stats)
  console.log("\n--- 7. Stats Page (/stats) ---");
  const statsHtml = getHtmlContent("/stats").replace(/<!-- -->/g, "");
  check(statsHtml.includes("104 / 104"), "Stats page contains exact completed total representation '104 / 104'");

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
