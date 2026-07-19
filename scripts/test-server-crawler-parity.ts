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
  "/bracket",
  "/teams",
  "/teams/france",
  "/teams/england",
  "/teams/spain",
  "/teams/argentina",
  "/matches/match-103",
  "/editorial-policy",
  "/corrections-policy",
  "/about",
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
  console.log("=== Running Server-Crawler Parity Tests ===\n");

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
      }

      if (route === "/editorial-policy") {
        testAssert(html.includes("Editorial Policy"), "Editorial policy page rendered correctly");
        testAssert(html.includes("WorldCupMatchDay"), "Editorial policy attributes WorldCupMatchDay");
      }

      if (route === "/corrections-policy") {
        testAssert(html.includes("Corrections Policy"), "Corrections policy page rendered correctly");
        testAssert(html.includes("worldcupmatchday@proton.me"), "Corrections policy details contact email");
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
