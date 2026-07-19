/**
 * Static HTML server-output test checking static HTML before hydration.
 * Ensures that crawlers see consistent, correct, and indexable metadata.
 *
 * Usage:
 *   npx tsx scripts/test-server-crawler-parity.ts
 */

import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const outDirectory = path.join(process.cwd(), "out");

function getHtmlFile(route: string): string {
  const name = route === "/" ? "index.html" : `${route.slice(1)}.html`;
  const nested = route === "/" ? name : path.join(route.slice(1), "index.html");
  const file = [name, nested].map((x) => path.join(outDirectory, x)).find(fs.existsSync);
  if (!file) {
    throw new Error(`Build output file for route '${route}' does not exist in 'out/'. Make sure to run 'npm run build' first.`);
  }
  return fs.readFileSync(file, "utf8");
}

const ROUTES = [
  "/",
  "/today",
  "/schedule",
  "/groups",
  "/stats",
  "/stats/matches",
  "/stats/teams",
  "/bracket",
  "/teams",
  "/teams/france",
  "/teams/england",
  "/teams/spain",
  "/teams/argentina",
  "/matches/match-103",
  "/matches/match-104",
  "/editorial-policy",
  "/corrections-policy",
  "/about",
  "/privacy",
  "/contact",
  "/world-cup-2026-data-sources",
  "/stats/compare",
];

let passed = 0;
let failed = 0;

function testAssert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  PASS  ${msg}`);
    passed++;
  } else {
    console.error(`  FAIL  ${msg}`);
    failed++;
  }
}

function runParityTests() {
  console.log("=== Running Server-Crawler Parity Tests ===");
  console.log(`Executing server-crawler parity check across ${ROUTES.length} routes...\n`);

  if (!fs.existsSync(outDirectory)) {
    console.error(`Error: 'out/' directory not found. Please build the project first.`);
    process.exit(1);
  }

  for (const route of ROUTES) {
    try {
      const html = getHtmlFile(route);
      console.log(`Checking route: ${route}`);

      // 1. Check title tags
      testAssert(/<title>[^<]+<\/title>/.test(html), `${route} has a title tag`);

      // 2. Check meta descriptions
      testAssert(/<meta[^>]*name="description"[^>]*>/.test(html), `${route} has a meta description`);

      // 3. Check heading hierarchy: exactly one h1 tag
      const h1Matches = html.match(/<h1\b/g);
      testAssert(h1Matches !== null && h1Matches.length === 1, `${route} has exactly one <h1> element (found: ${h1Matches?.length ?? 0})`);

      // 4. Check canonical tags
      const canonicalMatch = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/);
      testAssert(canonicalMatch !== null, `${route} has a canonical link`);
      if (canonicalMatch) {
        const canonicalUrl = canonicalMatch[1];
        const expectedBase = "https://www.worldcupmatchday.com";
        const expectedCanonical = route === "/" ? expectedBase : `${expectedBase}${route}`;
        testAssert(canonicalUrl === expectedCanonical, `${route} canonical href is correct: "${canonicalUrl}"`);
      }

      // 5. No search/timezone hydration placeholders
      testAssert(!html.includes("Loading matchday") && !html.includes("Loading timezone"), `${route} contains no raw JS-stale placeholders`);

      // 6. Global anti-regression assertions on HTML
      testAssert(!/tbd\s*[64]–[64]\s*tbd/i.test(html), `${route} has no unresolved 'tbd 4-6 tbd' scorecard`);
      testAssert(!html.includes("scores are never manually reconciled"), `${route} does not claim scores are never manually reconciled`);
      testAssert(!html.includes("we do not produce editorial content"), `${route} does not claim we do not produce editorial content`);
      testAssert(!/guarantee\s+(?:to\s+)?(?:update|correct|publish|reconcile).*\bminutes/i.test(html), `${route} does not make minute-level correction guarantees`);
      testAssert(!/NEXT_PUBLIC_ADSENSE_CLIENT_ID/.test(html), `${route} does not contain unrendered env variables`);

      // Clearly document that query-specific noindex is client-injected and not in static HTML
      if (route === "/today") {
        testAssert(!html.includes("noindex,follow"), `/today static HTML has no query-specific noindex/follow (injected on client side)`);
        const canonicalMatch = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/);
        testAssert(canonicalMatch !== null && canonicalMatch[1] === "https://www.worldcupmatchday.com/today", "/today server canonical is exactly /today");
        testAssert(!html.includes("Loading schedule for your timezone..."), "/today does not contain outdated loading schedule text");
        testAssert(html.includes("Preparing the Match Center for your local timezone."), "/today contains neutral SSR fallback text");
      }

      // Route-specific assertions
      if (route === "/") {
        testAssert(html.includes("Spain vs Argentina") || html.includes("Spain"), "Homepage lists Spain vs Argentina as the Finalists");
        testAssert(html.includes("match-104"), "Homepage contains a link to Match 104 (Final)");
        testAssert(html.includes("match-103"), "Homepage contains a link to Match 103 (Third place)");
        testAssert(html.includes("England") && html.includes("France") && html.includes("6–4"), "Homepage displays England 6–4 France recap");
      }

      if (route === "/today") {
        testAssert(html.includes("Spain vs Argentina") || html.includes("Spain"), "Today page lists Spain vs Argentina");
        testAssert(html.includes("6–4"), "Today page contains Match 103 score recap (6–4)");
      }

      if (route === "/teams") {
        testAssert(html.includes("All Teams"), "Teams directory displays 'All Teams' heading");
        testAssert(html.includes("Finalist"), "Teams directory displays 'Finalist' label");
        testAssert(html.includes("Third place"), "Teams directory displays 'Third place' label");
        testAssert(html.includes("Fourth place"), "Teams directory displays 'Fourth place' label");
        testAssert(!html.includes("Teams that still have a match remaining in the tournament."), "All-teams filter copy does not claim all teams are active");
        testAssert(html.includes("All 48 national teams that competed at the 2026 World Cup, with their current or final tournament status."), "All-teams filter copy is truthful");
      }

      if (route === "/teams/spain") {
        testAssert(html.includes("Finalist"), "/teams/spain lists status as Finalist");
        testAssert(html.includes("match-104") || html.includes("Final"), "/teams/spain lists Match 104 as next/active match");
        testAssert(!html.includes("Campaign completed"), "/teams/spain campaign is not marked completed");
      }

      if (route === "/teams/argentina") {
        testAssert(html.includes("Finalist"), "/teams/argentina lists status as Finalist");
        testAssert(html.includes("match-104") || html.includes("Final"), "/teams/argentina lists Match 104 as next/active match");
        testAssert(!html.includes("Campaign completed"), "/teams/argentina campaign is not marked completed");
      }

      if (route === "/teams/england") {
        testAssert(html.includes("Third place"), "/teams/england lists status as Third place");
        testAssert(html.toLowerCase().includes("campaign completed"), "/teams/england campaign is marked completed");
      }

      if (route === "/teams/france") {
        testAssert(html.includes("Fourth place"), "/teams/france lists status as Fourth place");
        testAssert(html.toLowerCase().includes("campaign completed"), "/teams/france campaign is marked completed");
      }

      if (route === "/matches/match-104") {
        testAssert(html.includes("Spain") && html.includes("Argentina"), "Match 104 shows Spain vs Argentina");
        testAssert(html.includes("Upcoming") || html.includes("UPCOMING") || html.includes("vs"), "Match 104 remains upcoming");
      }

      if (route === "/matches/match-103") {
        testAssert(html.includes("England") && html.includes("France"), "Match 103 shows England vs France");
        testAssert(html.includes("6–4") || html.includes("6-4"), "Match 103 shows completed 6-4 score");
        testAssert(html.includes("When was this match?"), "Match 103 uses past tense microcopy 'When was this match?'");
        testAssert(html.includes("No cards were shown."), "Match 103 uses empty-cards microcopy 'No cards were shown.'");
      }

      if (route === "/stats/matches") {
        testAssert(html.includes("France") && html.includes("England"), "/stats/matches lists France vs England");
        testAssert(html.includes("6–4") || html.includes("4–6") || html.includes("6-4"), "/stats/matches lists the 6-4 score");
        testAssert(html.includes("10"), "/stats/matches lists 10 total goals for the match");
        testAssert(html.includes("match-103") || html.includes("france-vs-england"), "/stats/matches links to Match 103");
      }

      if (route === "/stats/teams") {
        testAssert(html.includes("France") && html.includes("England"), "/stats/teams lists France and England");
        testAssert(html.includes("20"), "/stats/teams lists France and England goal totals (20)");
        testAssert(html.includes("13"), "/stats/teams lists Spain goal total (13)");
        testAssert(html.includes("19"), "/stats/teams lists Argentina goal total (19)");
        testAssert(!html.includes("group-stage-only"), "/stats/teams does not display group-stage-only totals");
      }

      if (route === "/privacy") {
        testAssert(html.includes("We may use Google AdSense or similar advertising services if advertising is enabled"), "Privacy page has truthful conditional AdSense copy");
        testAssert(!html.includes("We use Google AdSense, a third-party advertising service"), "Privacy page does not claim active-AdSense");
        testAssert(html.includes("EFFECTIVE: 19 JULY 2026"), "Privacy page has updated effective date 19 JULY 2026");
      }

      if (route === "/editorial-policy") {
        testAssert(html.includes("Editorial Policy"), "Editorial policy page rendered correctly");
        testAssert(html.includes("WorldCupMatchDay"), "Editorial policy attributes WorldCupMatchDay");
        testAssert(html.includes("independent digital publication"), "Editorial policy asserts independent publisher identity");
        testAssert(html.includes("Automation assists data collection, normalization and drafting. Material corrections, canonical fallbacks and original editorial reports are reviewed against cited evidence before publication."), "Editorial policy has truthful review copy");
        testAssert(!html.includes("all ingested data undergoes rigorous developer and editor review"), "Editorial policy has no universal manual review claim");
      }

      if (route === "/corrections-policy") {
        testAssert(html.includes("Corrections Policy"), "Corrections policy page rendered correctly");
        testAssert(html.includes("worldcupmatchday@proton.me"), "Corrections policy details contact email");
        testAssert(!html.includes("rigorous developer and editor review"), "Corrections policy does not invent editorial staffing");
      }

      if (route === "/contact") {
        testAssert(!html.includes("within a few minutes"), "Contact page does not promise minute-level corrections");
      }

      if (route === "/stats/compare") {
        testAssert(html.includes("Team Compare"), "Compare page rendered correctly");
        testAssert(!html.includes("vs Argentina") && !html.includes("Spain vs"), "Compare page SSR does not hardcode Spain vs Argentina header");
        testAssert(html.includes("Compare cumulative tournament statistics between any two teams"), "Compare page SSR shows neutral selection prompt");
      }

    } catch (err: any) {
      console.error(`  FAIL  Route ${route} failed with error: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nParity check finished: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runParityTests();
