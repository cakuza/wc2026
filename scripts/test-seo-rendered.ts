/**
 * Gate 13: Rendered-behavior tests.
 * Validates actual HTTP responses from the dev/preview server — title, H1,
 * canonical, robots meta, and rendered JSON-LD blocks. Not source-string assertions.
 *
 * Usage: DEV_URL=http://localhost:3099 npx tsx --tsconfig tsconfig.test.json scripts/test-seo-rendered.ts
 */

const BASE = process.env.DEV_URL ?? "http://localhost:3099";

let passed = 0;
let failed = 0;
const errors: string[] = [];

function ok(label: string, value: boolean) {
  if (value) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.error(`  FAIL  ${label}`);
    failed++;
    errors.push(label);
  }
}

async function fetchHtml(path: string): Promise<string> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.text();
}

async function fetchStatus(path: string): Promise<number> {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
  return res.status;
}

function extractJsonLd(html: string): Record<string, unknown>[] {
  const blocks: Record<string, unknown>[] = [];
  const re = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      blocks.push(JSON.parse(m[1]) as Record<string, unknown>);
    } catch {
      // ignore malformed blocks
    }
  }
  return blocks;
}

function getMeta(html: string, name: string): string {
  return html.match(new RegExp(`name="${name}" content="([^"]+)"`))?.[1] ?? "";
}

function getCanonical(html: string): string {
  return html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? "";
}

function getTitle(html: string): string {
  return html.match(/<title>([^<]+)<\/title>/)?.[1] ?? "";
}

function getH1(html: string): string {
  const raw = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "";
  return raw.replace(/<!-- -->/g, "").replace(/\s+/g, " ").trim();
}

function hasType(blocks: Record<string, unknown>[], type: string): boolean {
  return blocks.some((b) => b["@type"] === type);
}

async function main() {
  console.log(`=== SEO rendered-behavior tests (server: ${BASE}) ===\n`);

  // Gate 3 subset: HTTP status

  ok("GET /groups/group-a returns 200", await fetchStatus("/groups/group-a") === 200);
  ok("GET /groups/group-l returns 200", await fetchStatus("/groups/group-l") === 200);
  ok("GET /stats/top-scorers returns 200", await fetchStatus("/stats/top-scorers") === 200);
  ok("GET /qualified-eliminated-teams returns 200", await fetchStatus("/qualified-eliminated-teams") === 200);
  ok("GET /teams/england/qualification returns 200", await fetchStatus("/teams/england/qualification") === 200);
  ok("GET /groups/group-m returns 404 (invalid slug)", await fetchStatus("/groups/group-m") === 404);
  ok("GET /matchdays/2026-01-01 returns 404 (not a matchday)", await fetchStatus("/matchdays/2026-01-01") === 404);

  // Gate 8: Canonicals and robots

  const groupHtml = await fetchHtml("/groups/group-a");
  ok(
    "group-a canonical = /groups/group-a",
    getCanonical(groupHtml) === "https://www.worldcupmatchday.com/groups/group-a",
  );
  const groupAMetaRobots = getMeta(groupHtml, "robots");
  ok(
    "group-a is indexable (no noindex)",
    !groupAMetaRobots.includes("noindex"),
  );

  const groupLHtml = await fetchHtml("/groups/group-l");
  ok("group-l title contains 'Group L'", getTitle(groupLHtml).includes("Group L"));
  ok("group-l title contains England", getTitle(groupLHtml).includes("England"));

  const todayParamHtml = await fetchHtml("/today?date=2026-06-23");
  ok(
    "/today?date= canonical strips query param",
    getCanonical(todayParamHtml) === "https://www.worldcupmatchday.com/today",
  );
  ok("/today?date= is noindex", getMeta(todayParamHtml, "robots").includes("noindex"));

  // Gate 5: Rendered JSON-LD types

  const groupBlocks = extractJsonLd(groupHtml);
  ok("group-a renders WebPage JSON-LD", hasType(groupBlocks, "WebPage"));
  ok(
    "group-a BreadcrumbList exists (nested in WebPage or standalone)",
    hasType(groupBlocks, "BreadcrumbList") ||
      groupBlocks.some((b) => {
        const bc = b["breadcrumb"] as Record<string, unknown> | undefined;
        return bc?.["@type"] === "BreadcrumbList";
      }),
  );
  ok(
    "group-a does NOT double-emit standalone BreadcrumbList",
    groupBlocks.filter((b) => b["@type"] === "BreadcrumbList").length <= 1,
  );

  const topScorersHtml = await fetchHtml("/stats/top-scorers");
  const topScorersBlocks = extractJsonLd(topScorersHtml);
  const normalizedTopScorersHtml = topScorersHtml.replace(/<!-- -->/g, "").replace(/\s+/g, " ");
  const topScorersHasTable = /<h2[^>]*>\s*Golden Boot Standings\s*<\/h2>/i.test(normalizedTopScorersHtml);
  if (topScorersHasTable) {
    ok("top-scorers renders ItemList JSON-LD when trusted data is visible", hasType(topScorersBlocks, "ItemList"));
  } else {
    ok("top-scorers omits ItemList JSON-LD when scorer data is unavailable", !hasType(topScorersBlocks, "ItemList"));
    const lowerTopScorersHtml = normalizedTopScorersHtml.toLowerCase();
    ok(
      "top-scorers displays an honest availability notice",
      lowerTopScorersHtml.includes("no scorer data available yet") ||
        lowerTopScorersHtml.includes("live data unavailable") ||
        lowerTopScorersHtml.includes("live match data is temporarily unavailable"),
    );
  }

  // Gate 7: H1 uniqueness (spot check)

  const h1A = getH1(groupHtml);
  const h1L = getH1(groupLHtml);
  ok("group-a H1 present and non-empty", h1A.length > 0);
  ok("group-l H1 present and non-empty", h1L.length > 0);
  ok("group-a and group-l H1s are distinct", h1A !== h1L);

  // Gate 9: Sitemap

  const sitemapRes = await fetch(`${BASE}/sitemap.xml`);
  ok("sitemap.xml returns 200", sitemapRes.status === 200);
  const sitemapText = await sitemapRes.text();
  ok("sitemap includes /groups/group-a", sitemapText.includes("/groups/group-a"));
  ok("sitemap includes /stats/top-scorers", sitemapText.includes("/stats/top-scorers"));
  ok("sitemap includes /qualified-eliminated-teams", sitemapText.includes("/qualified-eliminated-teams"));
  ok("sitemap does NOT include /today?date=", !sitemapText.includes("/today?date="));

  // Final report

  console.log(`\n${passed} passed, ${failed} failed`);
  if (errors.length > 0) {
    console.error("\nFailed assertions:");
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
