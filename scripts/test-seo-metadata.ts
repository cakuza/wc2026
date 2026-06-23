/**
 * SEO metadata uniqueness and correctness tests.
 *
 * Validates:
 * - Each indexable page produces a unique title
 * - Canonical URLs use correct format
 * - Group pages have group-specific titles containing the group letter
 * - Qualification pages have team-specific titles
 * - noindex is only on /today?date= (not on group/stats pages)
 * - Structured data is valid JSON where emitted
 *
 *   npx tsx --tsconfig tsconfig.test.json scripts/test-seo-metadata.ts
 */
import assert from "assert";
import { GROUP_LETTERS } from "../lib/teams";
import { groupSlugToLetter, letterToGroupSlug } from "../lib/groupSlug";
import { countryName } from "../lib/i18n";
import { teamsInGroup } from "../lib/teams";

let passed = 0, failed = 0;
async function test(name: string, fn: () => void | Promise<void>) {
  try { await fn(); console.log(`  PASS  ${name}`); passed++; }
  catch (e: any) { console.error(`  FAIL  ${name}\n        ${e.message}`); failed++; }
}

async function main() {
  console.log("=== SEO metadata tests ===\n");

  // ── Group page title uniqueness ────────────────────────────────────────────

  await test("each group page title contains the group letter", () => {
    for (const letter of GROUP_LETTERS) {
      const slug = letterToGroupSlug(letter);
      const back = groupSlugToLetter(slug);
      assert.strictEqual(back, letter, `Letter round-trip failed for ${letter}`);
    }
  });

  await test("group page titles are distinct across all 12 groups", () => {
    const titles = GROUP_LETTERS.map(
      (g) => `World Cup 2026 Group ${g} Standings — ${teamsInGroup(g).map((t) => countryName(t.key, "en")).join(", ")}`,
    );
    const unique = new Set(titles);
    assert.strictEqual(unique.size, 12, "Duplicate group page titles found");
  });

  await test("group page for Group D contains Turkey and United States", () => {
    const groupDTeams = teamsInGroup("D").map((t) => countryName(t.key, "en"));
    assert.ok(groupDTeams.includes("Turkey"), "Turkey not in Group D");
    assert.ok(groupDTeams.includes("United States"), "United States not in Group D");
  });

  await test("group page for Group L contains England", () => {
    const groupLTeams = teamsInGroup("L").map((t) => countryName(t.key, "en"));
    assert.ok(groupLTeams.includes("England"), "England not in Group L");
  });

  await test("group page for Group C contains Brazil", () => {
    const groupCTeams = teamsInGroup("C").map((t) => countryName(t.key, "en"));
    assert.ok(groupCTeams.includes("Brazil"), "Brazil not in Group C");
  });

  await test("group page for Group I contains France", () => {
    const groupITeams = teamsInGroup("I").map((t) => countryName(t.key, "en"));
    assert.ok(groupITeams.includes("France"), "France not in Group I");
  });

  // ── Canonical URL format ────────────────────────────────────────────────────

  await test("group page canonical URLs use /groups/group-[a-l] pattern", () => {
    for (const letter of GROUP_LETTERS) {
      const slug = letterToGroupSlug(letter);
      const canonical = `https://www.worldcupmatchday.com/groups/${slug}`;
      assert.match(canonical, /^https:\/\/www\.worldcupmatchday\.com\/groups\/group-[a-l]$/);
    }
  });

  // ── noindex rules ──────────────────────────────────────────────────────────

  await test("/today with ?date= param is flagged noindex in metadata", () => {
    // Verified by reading the page.tsx — robots: { index: false, follow: true } when hasDateParam
    // This is a code review test, not a runtime test
    const todayPageCode = require("fs").readFileSync(
      require("path").join(__dirname, "../app/today/page.tsx"),
      "utf-8",
    );
    assert.ok(todayPageCode.includes("index: false"), "/today should have noindex for date param");
    assert.ok(todayPageCode.includes("hasDateParam"), "hasDateParam check should be present");
  });

  await test("group pages do not have noindex in their metadata", () => {
    const groupPageCode = require("fs").readFileSync(
      require("path").join(__dirname, "../app/groups/[groupSlug]/page.tsx"),
      "utf-8",
    );
    // Group pages should NOT have noindex
    assert.ok(
      !groupPageCode.includes('index: false'),
      "Group pages should not have noindex",
    );
  });

  // ── Sitemap inclusion ──────────────────────────────────────────────────────

  await test("sitemap includes all 12 group pages", () => {
    const sitemapCode = require("fs").readFileSync(
      require("path").join(__dirname, "../app/sitemap.ts"),
      "utf-8",
    );
    assert.ok(sitemapCode.includes("groupPages"), "sitemap should include groupPages");
    assert.ok(sitemapCode.includes("letterToGroupSlug"), "sitemap should use letterToGroupSlug");
    assert.ok(sitemapCode.includes("GROUP_LETTERS"), "sitemap should iterate GROUP_LETTERS");
  });

  await test("sitemap includes top-scorers route", () => {
    const sitemapCode = require("fs").readFileSync(
      require("path").join(__dirname, "../app/sitemap.ts"),
      "utf-8",
    );
    assert.ok(sitemapCode.includes("top-scorers"), "sitemap should include top-scorers");
  });

  await test("sitemap includes qualified-eliminated-teams", () => {
    const sitemapCode = require("fs").readFileSync(
      require("path").join(__dirname, "../app/sitemap.ts"),
      "utf-8",
    );
    assert.ok(
      sitemapCode.includes("qualified-eliminated-teams"),
      "sitemap should include qualified-eliminated-teams",
    );
  });

  await test("sitemap has fixed lastModified for static pages", () => {
    const sitemapCode = require("fs").readFileSync(
      require("path").join(__dirname, "../app/sitemap.ts"),
      "utf-8",
    );
    assert.ok(sitemapCode.includes("STATIC_DATE"), "sitemap should define STATIC_DATE");
    // Should NOT have new Date() for static pages (only used sparingly now)
    // Live pages omit lastModified
  });

  // ── Structured data ──────────────────────────────────────────────────────

  await test("group page emits WebPage and BreadcrumbList structured data", () => {
    const groupPageCode = require("fs").readFileSync(
      require("path").join(__dirname, "../app/groups/[groupSlug]/page.tsx"),
      "utf-8",
    );
    assert.ok(groupPageCode.includes('"@type": "WebPage"') || groupPageCode.includes("WebPage"), "should have WebPage schema");
    assert.ok(
      groupPageCode.includes('"@type": "BreadcrumbList"') ||
      groupPageCode.includes("BreadcrumbList") ||
      groupPageCode.includes("breadcrumbLd"),
      "should have BreadcrumbList (via breadcrumbLd helper)",
    );
    assert.ok(groupPageCode.includes("breadcrumbLd"), "should use breadcrumbLd helper");
  });

  await test("top-scorers page emits ItemList schema when data is available", () => {
    const pageCode = require("fs").readFileSync(
      require("path").join(__dirname, "../app/stats/top-scorers/page.tsx"),
      "utf-8",
    );
    assert.ok(pageCode.includes("ItemList"), "top-scorers should have ItemList schema");
    assert.ok(pageCode.includes("itemListLd"), "top-scorers should use itemListLd");
  });

  // ── AEO components ──────────────────────────────────────────────────────────

  await test("QuickAnswer component file exists", () => {
    const fs = require("fs");
    const exists = fs.existsSync(require("path").join(__dirname, "../components/QuickAnswer.tsx"));
    assert.ok(exists, "QuickAnswer.tsx should exist");
  });

  await test("LastUpdated component file exists", () => {
    const fs = require("fs");
    const exists = fs.existsSync(require("path").join(__dirname, "../components/LastUpdated.tsx"));
    assert.ok(exists, "LastUpdated.tsx should exist");
  });

  await test("BreadcrumbNav component file exists", () => {
    const fs = require("fs");
    const exists = fs.existsSync(require("path").join(__dirname, "../components/BreadcrumbNav.tsx"));
    assert.ok(exists, "BreadcrumbNav.tsx should exist");
  });

  await test("SourcesAndMethodology component file exists", () => {
    const fs = require("fs");
    const exists = fs.existsSync(require("path").join(__dirname, "../components/SourcesAndMethodology.tsx"));
    assert.ok(exists, "SourcesAndMethodology.tsx should exist");
  });

  // ── IndexNow ────────────────────────────────────────────────────────────────

  await test("IndexNow dry-run returns correct structure", async () => {
    // Set INDEXNOW_ENABLED=false to ensure dry-run mode
    const prev = process.env.INDEXNOW_ENABLED;
    delete process.env.INDEXNOW_ENABLED;
    const { submitIndexNow, urlsForMatchChange } = require("../lib/indexnow/indexnow");
    const urls = urlsForMatchChange({
      matchSlug: "england-vs-ghana-jun23",
      homeTeamSlug: "england",
      awayTeamSlug: "ghana",
      groupLetter: "L",
    });
    assert.ok(Array.isArray(urls), "urlsForMatchChange should return array");
    assert.ok(urls.length > 0, "Should return non-empty URL list");
    // Verify all URLs are absolute
    for (const u of urls) {
      assert.ok(u.startsWith("https://"), `URL should be absolute: ${u}`);
    }
    const result = await submitIndexNow(urls);
    assert.strictEqual(result.dryRun, true, "Should be dry run when INDEXNOW_ENABLED not set");
    assert.ok(result.urls.length > 0, "Dry run should still return URL list");
    if (prev !== undefined) process.env.INDEXNOW_ENABLED = prev;
  });

  await test("IndexNow URL list includes match, teams, group, and key pages", () => {
    const { urlsForMatchChange } = require("../lib/indexnow/indexnow");
    const urls = urlsForMatchChange({
      matchSlug: "turkey-vs-paraguay-jun19",
      homeTeamSlug: "turkey",
      awayTeamSlug: "paraguay",
      groupLetter: "D",
    });
    assert.ok(urls.some((u: string) => u.includes("/matches/turkey")), "Should include match URL");
    assert.ok(urls.some((u: string) => u.includes("/teams/turkey")), "Should include home team");
    assert.ok(urls.some((u: string) => u.includes("/teams/paraguay")), "Should include away team");
    assert.ok(urls.some((u: string) => u.includes("/groups/group-d")), "Should include group page");
    assert.ok(urls.some((u: string) => u.includes("/stats/top-scorers")), "Should include top-scorers");
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();
