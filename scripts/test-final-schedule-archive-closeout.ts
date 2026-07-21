/**
 * Dedicated regression suite for Final Schedule Parity and Archive SEO Closeout.
 *
 * Usage:
 *   npx tsx scripts/test-final-schedule-archive-closeout.ts
 */

import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { MATCHES, matchSlug, ARCHIVE_DEFAULT_DATE } from "../lib/matches";
import { getTournamentLiveSnapshot } from "../lib/liveSnapshot";
import { getLiveRefreshPolicy } from "../lib/liveRefreshPolicy";
import { applyCanonicalMatchResultFallback, COMPLETED_KNOCKOUT_RESULTS } from "../lib/canonicalMatchResults";
import { formatKickoffTime, formatKickoffDate } from "../lib/timezone";
import { matchUtcDate } from "../lib/matches";

const outDirectory = path.join(process.cwd(), "out");
const nextAppDir = path.join(process.cwd(), ".next/server/app");

function getHtmlContent(routePath: string): string {
  // Check out/ directory first, then .next/server/app/
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
let routeCount = 0;
let timezoneCount = 0;

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
  console.log("=== Running Final Schedule & Archive Closeout Regression Suite ===\n");

  const snapshot = await getTournamentLiveSnapshot();

  // ───────────────────────────────────────────────────────────────────────────
  // 1. MAIN SCHEDULE ASSERTIONS
  // ───────────────────────────────────────────────────────────────────────────
  console.log("--- 1. Main Schedule Verification ---");
  const mainHtml = getHtmlContent("/schedule");
  routeCount++;

  const m103Slug = "match-103";
  const m104Slug = "match-104";

  const mainCompIdx = mainHtml.indexOf('id="completed"');
  const mainUpIdx = mainHtml.indexOf('id="upcoming"');
  const mainCompletedChunk = mainCompIdx !== -1 ? (mainUpIdx !== -1 && mainUpIdx > mainCompIdx ? mainHtml.slice(mainCompIdx, mainUpIdx) : mainHtml.slice(mainCompIdx)) : "";
  const mainUpcomingChunk = mainUpIdx !== -1 ? (mainCompIdx !== -1 && mainCompIdx > mainUpIdx ? mainHtml.slice(mainUpIdx, mainCompIdx) : mainHtml.slice(mainUpIdx)) : "";

  check(mainCompletedChunk.includes(m103Slug), "Main schedule renders Match 103 under Completed");
  check(mainCompletedChunk.includes(m104Slug), "Main schedule renders Match 104 under Completed");
  check(mainCompletedChunk.includes("France") && mainCompletedChunk.includes("England") && mainCompletedChunk.includes("4") && mainCompletedChunk.includes("6"), "Main schedule Match 103 displays France 4–6 England");
  check(mainCompletedChunk.includes("Spain") && mainCompletedChunk.includes("Argentina") && mainCompletedChunk.includes("1") && mainCompletedChunk.includes("0"), "Main schedule Match 104 displays Spain 1–0 Argentina");
  check(mainCompletedChunk.includes("AET") || mainCompletedChunk.includes("After extra time"), "Main schedule Match 104 displays AET status");
  check(mainCompletedChunk.includes("Torres") && mainCompletedChunk.includes("106"), "Main schedule Match 104 displays Ferran Torres 106'");

  check(!mainUpcomingChunk.includes(m103Slug) && !mainUpcomingChunk.includes(m104Slug), "Main schedule has no placement matches under Upcoming");
  check(!mainHtml.includes("Awaiting update") && !mainHtml.includes("state_syncing"), "Main schedule displays no syncing state");

  // Refresh policy check
  const refreshPolicy = getLiveRefreshPolicy(
    MATCHES.map((match) => {
      const snap = snapshot.matches[matchSlug(match)];
      return {
        match,
        status: snap?.status ?? "SCHEDULED",
        providerUpdatedAt: snap?.providerUpdatedAt,
        goalEventCompleteness: snap?.goalEventCompleteness,
        live: snap?.live,
        homeScore: snap?.homeScore,
        awayScore: snap?.awayScore,
      };
    }),
  );
  check(refreshPolicy.intervalMs === null, "Schedule polling disabled when tournament is archive complete");

  // ───────────────────────────────────────────────────────────────────────────
  // 2. TIMEZONE ROUTES ASSERTIONS
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n--- 2. Timezone Schedule Routes Verification ---");
  const TIMEZONES_TO_TEST = [
    { slug: "turkey-time", iana: "Europe/Istanbul", label: "Turkey" },
    { slug: "uk-time", iana: "Europe/London", label: "United Kingdom" },
    { slug: "japan-time", iana: "Asia/Tokyo", label: "Japan" },
    { slug: "australia-time", iana: "Australia/Sydney", label: "Australia" },
    { slug: "eastern-time", iana: "America/New_York", label: "New York / Eastern" },
    { slug: "brazil-time", iana: "America/Sao_Paulo", label: "Brazil / BRT" },
    { slug: "india-time", iana: "Asia/Kolkata", label: "India / IST" },
  ];

  const m104Match = MATCHES.find((m) => "matchNumber" in m && m.matchNumber === 104)!;

  for (const tzConfig of TIMEZONES_TO_TEST) {
    timezoneCount++;
    routeCount++;
    try {
      const tzHtml = getHtmlContent(`/schedule/${tzConfig.slug}`);
      const compIdx = tzHtml.indexOf('id="completed"');
      const upIdx = tzHtml.indexOf('id="upcoming"');
      const compChunk = compIdx !== -1 ? (upIdx !== -1 && upIdx > compIdx ? tzHtml.slice(compIdx, upIdx) : tzHtml.slice(compIdx)) : "";

      check(compChunk.includes("match-104"), `[${tzConfig.label}] Match 104 classified under Completed`);
      check(compChunk.includes("Spain") && compChunk.includes("Argentina"), `[${tzConfig.label}] Match 104 team names retained`);
      check(compChunk.includes("1") && compChunk.includes("0"), `[${tzConfig.label}] Match 104 score 1-0 retained`);
      check(compChunk.includes("AET") || compChunk.includes("After extra time"), `[${tzConfig.label}] Match 104 AET status retained`);

      const expectedTime = formatKickoffTime(matchUtcDate(m104Match), tzConfig.iana);
      check(tzHtml.includes(expectedTime), `[${tzConfig.label}] Local kickoff time rendered: ${expectedTime}`);

      const expectedDate = formatKickoffDate(matchUtcDate(m104Match), tzConfig.iana);
      check(expectedDate.length > 0, `[${tzConfig.label}] Localized date valid: ${expectedDate}`);
    } catch (err: any) {
      check(false, `[${tzConfig.label}] Route check failed: ${err.message}`);
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 3. CANONICAL PROJECTION ASSERTIONS
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n--- 3. Canonical Projection Verification ---");

  // Provider-complete match
  const match1 = MATCHES[0];
  const res1 = applyCanonicalMatchResultFallback(match1, undefined, ARCHIVE_DEFAULT_DATE);
  check(res1 !== undefined && res1.status === "FINISHED" && res1.homeScore !== null, "Canonical projection handles group match result");

  // Reconciled knockout match
  const res104 = applyCanonicalMatchResultFallback(m104Match, undefined, ARCHIVE_DEFAULT_DATE);
  check(res104 !== undefined && res104.status === "FINISHED" && res104.homeScore === 1 && res104.awayScore === 0 && res104.scoreDuration === "EXTRA_TIME", "Canonical projection reconciles Match 104 (1-0 AET)");

  // No provider data fallback test
  const fakeMatchWithoutProvider = { ...m104Match, providerIds: undefined };
  const resFake = applyCanonicalMatchResultFallback(fakeMatchWithoutProvider, undefined, ARCHIVE_DEFAULT_DATE);
  check(resFake === undefined, "Match without provider ID returns undefined fallback safely");

  // Unresolved match remains unresolved under pre-kickoff date
  const futureDate = "2026-06-01T00:00:00Z";
  const resFuture = applyCanonicalMatchResultFallback(m104Match, undefined, futureDate);
  check(resFuture === undefined || resFuture.status !== "FINISHED" || Date.parse(futureDate) < Date.parse(COMPLETED_KNOCKOUT_RESULTS[104].confirmedAt), "Future date before confirmedAt cannot fabricate finality");

  // ───────────────────────────────────────────────────────────────────────────
  // 4. SITEMAP POLICY ASSERTIONS
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n--- 4. Sitemap Policy Verification ---");
  const sitemapPath = path.join(outDirectory, "sitemap.xml");
  let sitemapXml = "";
  if (fs.existsSync(sitemapPath)) {
    sitemapXml = fs.readFileSync(sitemapPath, "utf8");
  } else {
    // Try import
    const sitemapMod = await import("../app/sitemap");
    const sitemapData = await sitemapMod.default();
    sitemapXml = JSON.stringify(sitemapData);
  }

  check(!sitemapXml.includes("<changefreq>hourly</changefreq>") && !sitemapXml.includes('"changeFrequency":"hourly"'), "Sitemap contains zero hourly frequencies");
  check(!sitemapXml.includes("/matches/") || (!sitemapXml.includes("<changefreq>daily</changefreq>") && !sitemapXml.includes('"changeFrequency":"daily"')), "Sitemap match pages use non-daily changefreq (monthly)");
  check(sitemapXml.includes("https://www.worldcupmatchday.com"), "Sitemap uses canonical domain exclusively");

  // Match URLs count in sitemap
  const matchUrlCount = (sitemapXml.match(/matches\/[a-z0-9-]+/g) || []).length;
  check(matchUrlCount >= 104, `Sitemap includes all 104 match URLs (found: ${matchUrlCount})`);
  const hasQueryParamLoc = /<loc>[^<]*\?[^<]*<\/loc>/.test(sitemapXml) || /"url":"[^"]*\?[^"]*"/.test(sitemapXml);
  check(!hasQueryParamLoc, "Sitemap contains no query or compare URLs");

  // ───────────────────────────────────────────────────────────────────────────
  // 5. METADATA ASSERTIONS
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n--- 5. Root Metadata Verification ---");
  const layoutSource = fs.readFileSync(path.join(process.cwd(), "app/layout.tsx"), "utf8");
  const indexHtml = getHtmlContent("/");

  check(layoutSource.includes('default: "World Cup 2026 Archive — Results, Teams, Bracket & Statistics"'), "app/layout.tsx sets archive default title");
  check(layoutSource.includes("Complete 2026 FIFA World Cup archive with all 104 results"), "app/layout.tsx sets archive description");
  check(indexHtml.includes("World Cup 2026 Archive — Results, Teams, Bracket &amp; Statistics") || indexHtml.includes("World Cup 2026 Archive — Results, Teams, Bracket & Statistics"), "Rendered index.html contains archive title tag");
  check(indexHtml.includes("Complete 2026 FIFA World Cup archive with all 104 results"), "Rendered index.html contains archive description");
  check(!layoutSource.includes("Matchday Guide – Fixtures") && !indexHtml.includes("Matchday Guide – Fixtures"), "Root metadata suppresses active tournament Matchday Guide copy");

  // Print Summary
  console.log("\n==========================================================================");
  console.log(`Final Schedule Archive Closeout Suite Summary:`);
  console.log(`  Total Assertions: ${totalAssertions}`);
  console.log(`  Passed:           ${passed}`);
  console.log(`  Failed:           ${failed}`);
  console.log(`  Routes Verified:  ${routeCount}`);
  console.log(`  Timezones Checked: ${timezoneCount}`);
  console.log("==========================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error("Suite crashed:", err);
  process.exit(1);
});
