/**
 * Permanent technical-SEO audit over the static `out/` export.
 *
 * Fails the build if any of the following are found across every URL
 * listed in the generated sitemap:
 * - duplicate canonical URLs
 * - duplicate indexable titles
 * - missing H1 (or more than one)
 * - missing canonical
 * - a sitemap URL whose corresponding static file is missing (the static-export
 *   equivalent of "returning non-200")
 * - a noindex-tagged URL present in the sitemap
 * - a Product (or other unexpected) schema.org type in JSON-LD
 * - invalid (non-parseable) structured-data JSON
 * - raw tbd/TBD or unresolved Winner-of/Loser-of labels on completed archive pages
 *
 * Run after `npm run build` (static export must exist in out/):
 *   npx tsx scripts/test-seo-technical-audit.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = join(process.cwd(), "out");
const BASE = "https://www.worldcupmatchday.com";

let failures = 0;
let passes = 0;
function check(condition: boolean, message: string): void {
  if (condition) {
    passes++;
  } else {
    console.error(`FAIL ${message}`);
    failures++;
  }
}

function urlToFilePath(url: string): string {
  const path = url.replace(BASE, "");
  if (path === "" || path === "/") return join(OUT_DIR, "index.html");
  return join(OUT_DIR, `${path}.html`);
}

function stripScripts(html: string): string {
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
}

function getCanonical(html: string): string | null {
  return html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? null;
}

function getTitle(html: string): string | null {
  return html.match(/<title>([^<]+)<\/title>/)?.[1] ?? null;
}

function getH1Count(html: string): number {
  return (html.match(/<h1\b/g) || []).length;
}

function isNoindex(html: string): boolean {
  const robots = html.match(/name="robots" content="([^"]+)"/)?.[1] ?? "";
  return robots.includes("noindex");
}

function extractJsonLd(html: string): { raw: string; parsed: Record<string, unknown> | null }[] {
  const blocks: { raw: string; parsed: Record<string, unknown> | null }[] = [];
  const re = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      blocks.push({ raw: m[1], parsed: JSON.parse(m[1]) });
    } catch {
      blocks.push({ raw: m[1], parsed: null });
    }
  }
  return blocks;
}

function main(): void {
  console.log("=== Technical SEO audit (static export) ===\n");

  const sitemapPath = join(OUT_DIR, "sitemap.xml");
  check(existsSync(sitemapPath), "out/sitemap.xml exists");
  if (!existsSync(sitemapPath)) {
    console.error(`\n${failures} failure(s). Cannot continue without a sitemap.`);
    process.exit(1);
  }

  const sitemapXml = readFileSync(sitemapPath, "utf8");
  const urls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  check(urls.length > 0, "sitemap contains at least one URL");
  console.log(`Sitemap URL count: ${urls.length}`);

  const canonicalsSeen = new Map<string, string>(); // canonical -> first url that used it
  const titlesSeen = new Map<string, string>(); // title -> first url that used it
  let missingFiles = 0;
  let missingCanonical = 0;
  let missingOrDuplicateH1 = 0;
  let noindexInSitemap = 0;
  let invalidJsonLd = 0;
  let productSchemaFound = 0;
  let tbdOnCompleted = 0;
  let unresolvedLabelsOnCompleted = 0;

  for (const url of urls) {
    const filePath = urlToFilePath(url);
    if (!existsSync(filePath)) {
      missingFiles++;
      console.error(`FAIL sitemap URL has no corresponding static file: ${url}`);
      continue;
    }

    const html = readFileSync(filePath, "utf8").replace(/<!-- -->/g, "");
    const noScript = stripScripts(html);

    if (isNoindex(html)) {
      noindexInSitemap++;
      console.error(`FAIL noindex URL present in sitemap: ${url}`);
    }

    const canonical = getCanonical(html);
    if (!canonical) {
      missingCanonical++;
      console.error(`FAIL missing canonical: ${url}`);
    } else {
      const priorUrl = canonicalsSeen.get(canonical);
      if (priorUrl && priorUrl !== url) {
        console.error(`FAIL duplicate canonical "${canonical}" used by both ${priorUrl} and ${url}`);
        failures++;
      } else {
        canonicalsSeen.set(canonical, url);
      }
    }

    const title = getTitle(html);
    if (title) {
      const priorUrl = titlesSeen.get(title);
      if (priorUrl && priorUrl !== url) {
        console.error(`FAIL duplicate title "${title}" used by both ${priorUrl} and ${url}`);
        failures++;
      } else {
        titlesSeen.set(title, url);
      }
    }

    const h1Count = getH1Count(noScript);
    if (h1Count !== 1) {
      missingOrDuplicateH1++;
      console.error(`FAIL expected exactly one H1, found ${h1Count}: ${url}`);
    }

    for (const block of extractJsonLd(html)) {
      if (!block.parsed) {
        invalidJsonLd++;
        console.error(`FAIL invalid JSON-LD on ${url}: ${block.raw.slice(0, 80)}...`);
        continue;
      }
      if (block.parsed["@type"] === "Product") {
        productSchemaFound++;
        console.error(`FAIL unexpected Product schema on ${url}`);
      }
    }

    // "Completed" archive surfaces: match/team/group/hub/results pages that
    // should never show a placeholder once the tournament has real results.
    const isArchiveSurface = /\/matches\/|\/teams\/|\/groups\/|\/world-cup-2026/.test(url);
    if (isArchiveSurface) {
      if (/\btbd\b/i.test(noScript)) {
        tbdOnCompleted++;
        console.error(`FAIL raw tbd/TBD on archive surface: ${url}`);
      }
      if (/Winner\s*of\s+(?:England|Argentina)|Loser\s*of\s+(?:England|Argentina)/i.test(noScript)) {
        unresolvedLabelsOnCompleted++;
        console.error(`FAIL unresolved Winner/Loser-of label on archive surface: ${url}`);
      }
    }
  }

  check(missingFiles === 0, `all ${urls.length} sitemap URLs resolve to an existing static file (${missingFiles} missing)`);
  check(missingCanonical === 0, `all sitemap URLs have a canonical tag (${missingCanonical} missing)`);
  check(missingOrDuplicateH1 === 0, `all sitemap URLs have exactly one H1 (${missingOrDuplicateH1} violations)`);
  check(noindexInSitemap === 0, `no noindex URL appears in the sitemap (${noindexInSitemap} found)`);
  check(invalidJsonLd === 0, `all structured-data JSON parses (${invalidJsonLd} invalid blocks)`);
  check(productSchemaFound === 0, `no Product schema anywhere in indexable pages (${productSchemaFound} found)`);
  check(tbdOnCompleted === 0, `no raw tbd/TBD on archive surfaces (${tbdOnCompleted} found)`);
  check(unresolvedLabelsOnCompleted === 0, `no unresolved Winner/Loser-of labels on archive surfaces (${unresolvedLabelsOnCompleted} found)`);

  // Spot-check the new archive routes exist and are wired into the sitemap.
  check(urls.includes(`${BASE}/world-cup-2026`), "sitemap includes /world-cup-2026");
  check(urls.includes(`${BASE}/world-cup-2026/results`), "sitemap includes /world-cup-2026/results");
  check(urls.some((u) => u.startsWith(`${BASE}/matches/`)), "sitemap includes at least one /matches/* URL");
  check(urls.filter((u) => u.startsWith(`${BASE}/matches/`)).length >= 100, "sitemap includes the full /matches/* set (>=100 URLs)");
  check(urls.includes(`${BASE}/stats/players`), "sitemap includes /stats/players");
  check(urls.includes(`${BASE}/stats/teams`), "sitemap includes /stats/teams");
  check(urls.includes(`${BASE}/stats/compare`), "sitemap includes /stats/compare");
  check(urls.includes(`${BASE}/stats/matches`), "sitemap includes /stats/matches");

  console.log(`\n${passes + failures} checks run (pass: ${passes}, fail: ${failures})`);
  if (failures > 0) {
    console.error(`\n${failures} failure(s).`);
    process.exitCode = 1;
  } else {
    console.log("\nALL TECHNICAL SEO CHECKS PASSED.");
  }
}

main();
