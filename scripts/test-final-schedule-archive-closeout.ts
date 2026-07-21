/**
 * Dedicated regression suite for Final Schedule Parity and Archive SEO Closeout.
 *
 * Usage:
 *   npx tsx scripts/test-final-schedule-archive-closeout.ts
 */

import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { MATCHES, matchSlug, ARCHIVE_DEFAULT_DATE, matchUtcDate } from "../lib/matches";
import { getTournamentLiveSnapshot } from "../lib/liveSnapshot";
import { getLiveRefreshPolicy } from "../lib/liveRefreshPolicy";
import { applyCanonicalMatchResultFallback, COMPLETED_KNOCKOUT_RESULTS } from "../lib/canonicalMatchResults";
import { formatKickoffTime, formatKickoffDate } from "../lib/timezone";
import { assertScheduleArchiveConsistency } from "../lib/scheduleArchiveConsistency";

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

function extractCardHtml(fullHtml: string, matchSlugStr: string): string {
  const hrefAttr = `href="/matches/${matchSlugStr}"`;
  const idx = fullHtml.indexOf(hrefAttr);
  if (idx === -1) return "";
  const tagStart = fullHtml.lastIndexOf("<a", idx);
  const tagEnd = fullHtml.indexOf("</a>", idx);
  if (tagStart === -1 || tagEnd === -1) return "";
  return fullHtml.slice(tagStart, tagEnd + 4);
}

function extractDateHeadingForMatch(html: string, matchSlugStr: string): string {
  const cardHref = `href="/matches/${matchSlugStr}"`;
  const cardIdx = html.indexOf(cardHref);
  if (cardIdx === -1) return "";

  const precedingChunk = html.slice(0, cardIdx);
  const h3Start = precedingChunk.lastIndexOf("<h3");
  if (h3Start === -1) return "";

  const h3End = html.indexOf("</h3>", h3Start);
  if (h3End === -1 || h3End > cardIdx) return "";

  const rawH3 = html.slice(h3Start, h3End + 5);
  const textOnly = rawH3
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

  return textOnly;
}

async function runSuite() {
  console.log("=== Running Final Schedule & Archive Closeout Regression Suite ===\n");

  const snapshot = await getTournamentLiveSnapshot();

  // ───────────────────────────────────────────────────────────────────────────
  // 1. COMPONENT CONTRACT & LIFECYCLE INVARIANT ASSERTIONS
  // ───────────────────────────────────────────────────────────────────────────
  console.log("--- 1. Component Contract & Lifecycle Invariant Verification ---");
  const scheduleContentSource = fs.readFileSync(path.join(process.cwd(), "app/schedule/ScheduleContent.tsx"), "utf8");

  check(scheduleContentSource.includes("matchesProjection: Record<string, SerializableSnapshotMatch>;"), "ScheduleContent source requires matchesProjection prop");
  check(scheduleContentSource.includes("isTournamentComplete: boolean;"), "ScheduleContent source requires isTournamentComplete prop");
  check(!scheduleContentSource.includes("isTournamentComplete?:"), "ScheduleContent source has no optional isTournamentComplete prop");
  check(!scheduleContentSource.includes("upcoming.length === 0"), "ScheduleContent source has no upcoming.length === 0 fallback derivation");
  check(!scheduleContentSource.includes("explicitIsTournamentComplete"), "ScheduleContent source removes explicitIsTournamentComplete alias");

  // Production invariant helper tests
  assert.doesNotThrow(
    () =>
      assertScheduleArchiveConsistency(true, {
        live: 0,
        syncing: 0,
        upcoming: 0,
        completed: MATCHES.length,
        total: MATCHES.length,
      }),
    "assertScheduleArchiveConsistency does not throw on valid completed counts"
  );
  check(true, "assertScheduleArchiveConsistency does not throw on valid completed counts");

  assert.throws(
    () =>
      assertScheduleArchiveConsistency(true, {
        live: 0,
        syncing: 0,
        upcoming: 1,
        completed: MATCHES.length - 1,
        total: MATCHES.length,
      }),
    /schedule archive consistency/i
  );
  check(true, "assertScheduleArchiveConsistency throws descriptive error on count disagreement");

  // ───────────────────────────────────────────────────────────────────────────
  // 2. MAIN SCHEDULE ASSERTIONS & CARD-SCOPED EXTRACTION
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n--- 2. Main Schedule Verification ---");
  const mainHtml = getHtmlContent("/schedule");
  routeCount++;

  const m103Card = extractCardHtml(mainHtml, "match-103");
  const m104Card = extractCardHtml(mainHtml, "match-104");

  check(m103Card.length > 0, "Main schedule renders card for Match 103");
  check(m104Card.length > 0, "Main schedule renders card for Match 104");

  // Card-scoped checks for Match 104
  check(m104Card.includes("Spain") && m104Card.includes("Argentina"), "Match 104 card contains Spain vs Argentina");
  check(/\b1\s*(?:<!--\s*-->)?\s*-\s*(?:<!--\s*-->)?\s*0\b/.test(m104Card), "Match 104 card contains exact score 1 - 0");
  check(m104Card.includes("AET") || m104Card.includes("After extra time"), "Match 104 card contains AET status");
  check(m104Card.includes("Torres") && m104Card.includes("106"), "Match 104 card contains Torres 106' goal");

  // Card-scoped checks for Match 103
  check(m103Card.includes("France") && m103Card.includes("England"), "Match 103 card contains France vs England");
  check(/\b4\s*(?:<!--\s*-->)?\s*-\s*(?:<!--\s*-->)?\s*6\b/.test(m103Card), "Match 103 card contains exact score 4 - 6");
  check(m103Card.includes("FT"), "Match 103 card contains FT status");

  const mainUpIdx = mainHtml.indexOf('id="upcoming"');
  check(mainUpIdx === -1, "Main schedule suppresses Upcoming section completely in completed archive mode");
  check(!mainHtml.includes("Awaiting update") && !mainHtml.includes("state_syncing"), "Main schedule displays no syncing state");

  check(mainHtml.includes("World Cup 2026 Results Archive — Scores &amp; Local Kickoff Times") || mainHtml.includes("World Cup 2026 Results Archive — Scores & Local Kickoff Times"), "Schedule page has archive title");
  check(mainHtml.includes("Browse all 104 completed 2026 World Cup matches with final scores"), "Schedule page has archive description");
  check(mainHtml.includes("Completed Results") && mainHtml.includes("Browse all 104 completed matches with kickoff times converted"), "Schedule page displays Completed Results notice header");

  // ───────────────────────────────────────────────────────────────────────────
  // 3. TIMEZONE ROUTES & EXACT DATE-HEADING ASSERTIONS
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n--- 3. Timezone Schedule Routes & Exact Date-Heading Verification ---");

  const TIMEZONES_TO_TEST = [
    { slug: "turkey-time", iana: "Europe/Istanbul", label: "Turkey", expectedHeadingText: "Sunday 19 July" },
    { slug: "uk-time", iana: "Europe/London", label: "United Kingdom", expectedHeadingText: "Sunday 19 July" },
    { slug: "japan-time", iana: "Asia/Tokyo", label: "Japan", expectedHeadingText: "Monday 20 July" },
    { slug: "australia-time", iana: "Australia/Sydney", label: "Australia", expectedHeadingText: "Monday 20 July" },
    { slug: "eastern-time", iana: "America/New_York", label: "New York / Eastern", expectedHeadingText: "Sunday 19 July" },
    { slug: "brazil-time", iana: "America/Sao_Paulo", label: "Brazil / BRT", expectedHeadingText: "Sunday 19 July" },
    { slug: "india-time", iana: "Asia/Kolkata", label: "India / IST", expectedHeadingText: "Monday 20 July" },
  ];

  const m104Match = MATCHES.find((m) => "matchNumber" in m && m.matchNumber === 104)!;

  for (const tzConfig of TIMEZONES_TO_TEST) {
    timezoneCount++;
    routeCount++;
    try {
      const tzHtml = getHtmlContent(`/schedule/${tzConfig.slug}`);
      const m104TzCard = extractCardHtml(tzHtml, "match-104");

      check(m104TzCard.length > 0, `[${tzConfig.label}] Match 104 card rendered`);
      check(m104TzCard.includes("Spain") && m104TzCard.includes("Argentina"), `[${tzConfig.label}] Match 104 card has Spain vs Argentina`);
      check(/\b1\s*(?:<!--\s*-->)?\s*-\s*(?:<!--\s*-->)?\s*0\b/.test(m104TzCard), `[${tzConfig.label}] Match 104 card has score 1 - 0`);
      check(m104TzCard.includes("AET") || m104TzCard.includes("After extra time"), `[${tzConfig.label}] Match 104 card has AET status`);

      const expectedTime = formatKickoffTime(matchUtcDate(m104Match), tzConfig.iana);
      check(m104TzCard.includes(expectedTime), `[${tzConfig.label}] Local kickoff time inside card: ${expectedTime}`);

      const tzUpIdx = tzHtml.indexOf('id="upcoming"');
      check(tzUpIdx === -1, `[${tzConfig.label}] Route suppresses Upcoming section completely`);

      // Exact Date Heading Check
      const actualHeading = extractDateHeadingForMatch(tzHtml, "match-104");
      const expectedHeading = new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: tzConfig.iana,
      }).format(matchUtcDate(m104Match));

      check(actualHeading === expectedHeading, `[${tzConfig.label}] Exact date heading matches calculated Intl date: '${actualHeading}' === '${expectedHeading}'`);
      check(actualHeading === tzConfig.expectedHeadingText, `[${tzConfig.label}] Heading matches required exact text '${tzConfig.expectedHeadingText}'`);
    } catch (err: any) {
      check(false, `[${tzConfig.label}] Route check failed: ${err.message}`);
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 4. CANONICAL PROJECTION & ACTIVE WINDOW POLLING TESTS
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n--- 4. Canonical Projection & Polling Window Verification ---");

  // Pre-confirmation fallback test
  const preConfirmRes = applyCanonicalMatchResultFallback(
    m104Match,
    undefined,
    "2026-07-19T20:00:00Z"
  );
  check(preConfirmRes === undefined, "Pre-confirmation timestamp (2026-07-19T20:00:00Z) returns undefined fallback");

  // At or after confirmation test
  const postConfirmRes = applyCanonicalMatchResultFallback(
    m104Match,
    undefined,
    "2026-07-20T00:00:00Z"
  );
  check(postConfirmRes !== undefined && postConfirmRes.status === "FINISHED", "Post-confirmation status is FINISHED");
  check(postConfirmRes?.homeScore === 1 && postConfirmRes?.awayScore === 0, "Post-confirmation score is 1-0");
  check(postConfirmRes?.scoreDuration === "EXTRA_TIME", "Post-confirmation scoreDuration is EXTRA_TIME");

  // Fixed active window polling tests inside Match 104's 3-hour window
  const testWindowTime = new Date("2026-07-19T21:00:00Z");

  const mockMatchesComplete = MATCHES.map((m) => {
    const isM104 = "matchNumber" in m && m.matchNumber === 104;
    return {
      match: m,
      status: "FINISHED" as const,
      providerUpdatedAt: "2026-07-19T21:00:00Z",
      goalEventCompleteness: {
        expectedGoalCount: isM104 ? 1 : 3,
        normalizedGoalEventCount: isM104 ? 1 : 3,
        missingGoalEventCount: 0,
        isGoalEventDataComplete: true,
        completenessReason: "complete" as const,
      },
      live: {
        provider: "football-data.org" as const,
        providerMatchId: 104,
        status: "FINISHED" as const,
        homeScore: isM104 ? 1 : 2,
        awayScore: isM104 ? 0 : 1,
        winner: "HOME_TEAM" as const,
        scoreDuration: isM104 ? "EXTRA_TIME" as const : "REGULAR" as const,
        eventDataAvailable: true,
        lastSyncedAt: "2026-07-19T21:00:00Z",
      },
      homeScore: isM104 ? 1 : 2,
      awayScore: isM104 ? 0 : 1,
    };
  });

  const completePolicy = getLiveRefreshPolicy(mockMatchesComplete, testWindowTime);
  check(completePolicy.intervalMs === null, "Canonical-complete case inside match window has intervalMs === null");
  check(completePolicy.reason === "idle", "Canonical-complete case inside match window reason is 'idle'");

  const mockMatchesIncomplete = MATCHES.map((m) => {
    const isM104 = "matchNumber" in m && m.matchNumber === 104;
    return {
      match: m,
      status: "FINISHED" as const,
      providerUpdatedAt: "2026-07-19T21:00:00Z",
      goalEventCompleteness: {
        expectedGoalCount: isM104 ? 1 : 3,
        normalizedGoalEventCount: isM104 ? 0 : 3,
        missingGoalEventCount: isM104 ? 1 : 0,
        isGoalEventDataComplete: isM104 ? false : true,
        completenessReason: isM104 ? ("missing-goal-events" as const) : ("complete" as const),
      },
      live: {
        provider: "football-data.org" as const,
        providerMatchId: isM104 ? 104 : 101,
        status: "FINISHED" as const,
        homeScore: isM104 ? 1 : 2,
        awayScore: isM104 ? 0 : 1,
        winner: isM104 ? null : ("HOME_TEAM" as const),
        scoreDuration: isM104 ? null : ("REGULAR" as const),
        eventDataAvailable: true,
        lastSyncedAt: "2026-07-19T21:00:00Z",
      },
      homeScore: isM104 ? 1 : 2,
      awayScore: isM104 ? 0 : 1,
    };
  });

  const incompletePolicy = getLiveRefreshPolicy(mockMatchesIncomplete, testWindowTime);
  check(incompletePolicy.intervalMs !== null, "Canonical-incomplete case inside match window has active intervalMs !== null");
  check(incompletePolicy.reason === "near-match", "Canonical-incomplete case inside match window reason is 'near-match'");

  // ───────────────────────────────────────────────────────────────────────────
  // 5. TRUTHFUL SITEMAP POLICY & DATE AUDIT ASSERTIONS
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n--- 5. Sitemap Policy & Date Audit Verification ---");
  const sitemapMod = await import("../app/sitemap");
  const sitemapData = await sitemapMod.default();
  const sitemapXml = JSON.stringify(sitemapData);

  check(!sitemapXml.includes('"changeFrequency":"hourly"'), "Sitemap contains zero hourly frequencies");
  check(!sitemapXml.includes('"changeFrequency":"daily"'), "Sitemap match pages contain zero daily frequencies");
  check(sitemapXml.includes("https://www.worldcupmatchday.com"), "Sitemap uses canonical domain exclusively");

  const matchUrlCount = (sitemapXml.match(/matches\/[a-z0-9-]+/g) || []).length;
  check(matchUrlCount >= 104, `Sitemap includes all 104 match URLs (found: ${matchUrlCount})`);
  check(!/"url":"[^"]*\?[^"]*"/.test(sitemapXml), "Sitemap contains no query or compare URLs");

  // Route-specific lastModified date assertions
  const getEntry = (urlPath: string) => sitemapData.find((e) => e.url === `https://www.worldcupmatchday.com${urlPath}`);

  const spainEntry = getEntry("/teams/spain");
  const argEntry = getEntry("/teams/argentina");
  const franceEntry = getEntry("/teams/france");

  check(spainEntry?.lastModified ? new Date(spainEntry.lastModified).toISOString().startsWith("2026-07-21") : false, "Spain team page uses July 21 date");
  check(argEntry?.lastModified ? new Date(argEntry.lastModified).toISOString().startsWith("2026-07-21") : false, "Argentina team page uses July 21 date");
  check(franceEntry?.lastModified ? new Date(franceEntry.lastModified).toISOString().startsWith("2026-07-20") : false, "France (ordinary team) page uses July 20 date");

  const aboutEntry = getEntry("/about");
  const correctionsEntry = getEntry("/corrections-policy");
  const qualEntry = getEntry("/teams/england/qualification");

  check(aboutEntry !== undefined && aboutEntry.lastModified === undefined, "/about omits lastModified date");
  check(correctionsEntry !== undefined && correctionsEntry.lastModified === undefined, "/corrections-policy omits lastModified date");
  check(qualEntry !== undefined && qualEntry.lastModified === undefined, "Qualification pages omit lastModified date");

  const privacyEntry = getEntry("/privacy");
  const termsEntry = getEntry("/terms");
  check(privacyEntry?.lastModified ? new Date(privacyEntry.lastModified).toISOString().startsWith("2026-07-19") : false, "/privacy retains explicit effective date 2026-07-19");
  check(termsEntry?.lastModified ? new Date(termsEntry.lastModified).toISOString().startsWith("2026-06-01") : false, "/terms retains explicit effective date 2026-06-01");

  // ───────────────────────────────────────────────────────────────────────────
  // 6. METADATA ASSERTIONS
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n--- 6. Root Metadata Verification ---");
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
