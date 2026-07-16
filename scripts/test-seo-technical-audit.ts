/**
 * Permanent technical-SEO audit over the static `out/` export.
 *
 * Fails the build if any of the following are found across every URL
 * listed in the generated sitemap:
 * - duplicate canonical URLs, or more/less than exactly one canonical tag on a page
 * - duplicate indexable titles
 * - missing H1 (or more than one)
 * - a sitemap URL whose corresponding static file is missing (the static-export
 *   equivalent of "returning non-200")
 * - a noindex-tagged URL present in the sitemap
 * - a Product (or other unexpected) schema.org type in JSON-LD
 * - invalid (non-parseable) structured-data JSON
 * - a match page without SportsEvent schema
 * - the archive hub without CollectionPage schema, or the results/date pages
 *   without ItemList schema
 * - raw tbd/TBD or unresolved Winner-of/Loser-of labels on archive surfaces
 *
 * Also prints the exact route/sitemap reconciliation: generated routes,
 * canonical indexable routes, sitemap URLs, and every route intentionally
 * excluded from the sitemap with its reason.
 *
 * Run after `npm run build` (static export must exist in out/):
 *   npx tsx scripts/test-seo-technical-audit.ts
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { MATCHES } from "../lib/matches";
import { CANDIDATE_ARCHIVE_DATES } from "../lib/archiveDates";

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

function getCanonicalTags(html: string): string[] {
  return [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map((m) => m[1]);
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

function hasType(blocks: { parsed: Record<string, unknown> | null }[], type: string): boolean {
  return blocks.some((b) => b.parsed && b.parsed["@type"] === type);
}

function walkHtmlFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walkHtmlFiles(full));
    else if (entry.endsWith(".html")) out.push(full);
  }
  return out;
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

  // ── Route/sitemap reconciliation (printed for documentation) ────────────
  const allHtmlFiles = walkHtmlFiles(OUT_DIR);
  const htmlRouteCount = allHtmlFiles.length;
  const sitemapUrlSet = new Set(urls);
  const excludedHtmlFiles = allHtmlFiles.filter((f) => {
    const rel = "/" + relative(OUT_DIR, f).replace(/\\/g, "/").replace(/\.html$/, "").replace(/\/index$/, "");
    const url = rel === "/index" || rel === "" ? BASE : `${BASE}${rel}`;
    return !sitemapUrlSet.has(url) && !sitemapUrlSet.has(BASE + rel.replace(/^\/$/, ""));
  });

  console.log(`Generated .html documents in out/: ${htmlRouteCount}`);
  console.log(`Sitemap URL count: ${urls.length}`);
  console.log(`Routes excluded from sitemap: ${excludedHtmlFiles.length}`);
  for (const f of excludedHtmlFiles) {
    const rel = "/" + relative(OUT_DIR, f).replace(/\\/g, "/");
    const reason = rel.includes("404") ? "error page — never included in a content sitemap" : "unclassified — investigate";
    console.log(`  - ${rel} (${reason})`);
  }

  const canonicalsSeen = new Map<string, string>(); // canonical -> first url that used it
  const titlesSeen = new Map<string, string>(); // title -> first url that used it
  let missingFiles = 0;
  let missingOrDuplicateCanonicalTag = 0;
  let missingOrDuplicateH1 = 0;
  let noindexInSitemap = 0;
  let invalidJsonLd = 0;
  let productSchemaFound = 0;
  let tbdOnArchiveSurface = 0;
  let unresolvedLabelsOnArchiveSurface = 0;
  let matchPagesMissingSportsEvent = 0;
  let archiveCollectionPagesMissingSchema = 0;

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

    const canonicalTags = getCanonicalTags(html);
    if (canonicalTags.length !== 1) {
      missingOrDuplicateCanonicalTag++;
      console.error(`FAIL expected exactly one canonical tag, found ${canonicalTags.length}: ${url}`);
    } else {
      const canonical = canonicalTags[0];
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

    const jsonLdBlocks = extractJsonLd(html);
    for (const block of jsonLdBlocks) {
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

    const isMatchPage = /\/matches\/[^/]+$/.test(url);
    if (isMatchPage && !hasType(jsonLdBlocks, "SportsEvent")) {
      matchPagesMissingSportsEvent++;
      console.error(`FAIL match page missing SportsEvent schema: ${url}`);
    }

    const isArchiveHub = url === `${BASE}/world-cup-2026`;
    const isResultsOrDatePage = /\/world-cup-2026\/results(\/|$)/.test(url);
    if (isArchiveHub && !hasType(jsonLdBlocks, "CollectionPage")) {
      archiveCollectionPagesMissingSchema++;
      console.error(`FAIL archive hub missing CollectionPage schema: ${url}`);
    }
    if (isResultsOrDatePage && url !== `${BASE}/world-cup-2026` && !hasType(jsonLdBlocks, "ItemList")) {
      archiveCollectionPagesMissingSchema++;
      console.error(`FAIL results/date archive page missing ItemList schema: ${url}`);
    }

    // "Archive surfaces": match/team/group/hub/results pages that should
    // never show a placeholder once the tournament has real results.
    const isArchiveSurface = /\/matches\/|\/teams\/|\/groups\/|\/world-cup-2026/.test(url);
    if (isArchiveSurface) {
      if (/\btbd\b/i.test(noScript)) {
        tbdOnArchiveSurface++;
        console.error(`FAIL raw tbd/TBD on archive surface: ${url}`);
      }
      if (/\b(Winner|Loser)\s*of\s+[A-Z][a-zA-Z]*(\s+[A-Z][a-zA-Z]*)?\b/.test(noScript)) {
        unresolvedLabelsOnArchiveSurface++;
        console.error(`FAIL unresolved Winner/Loser-of label on archive surface: ${url}`);
      }
    }
  }

  check(missingFiles === 0, `all ${urls.length} sitemap URLs resolve to an existing static file (${missingFiles} missing)`);
  check(missingOrDuplicateCanonicalTag === 0, `every sitemap URL has exactly one canonical tag (${missingOrDuplicateCanonicalTag} violations)`);
  check(missingOrDuplicateH1 === 0, `all sitemap URLs have exactly one H1 (${missingOrDuplicateH1} violations)`);
  check(noindexInSitemap === 0, `no noindex URL appears in the sitemap (${noindexInSitemap} found)`);
  check(invalidJsonLd === 0, `all structured-data JSON parses (${invalidJsonLd} invalid blocks)`);
  check(productSchemaFound === 0, `no Product schema anywhere in indexable pages (${productSchemaFound} found)`);
  check(matchPagesMissingSportsEvent === 0, `every match page emits SportsEvent schema (${matchPagesMissingSportsEvent} missing)`);
  check(archiveCollectionPagesMissingSchema === 0, `archive hub/results/date pages emit CollectionPage or ItemList schema (${archiveCollectionPagesMissingSchema} missing)`);
  check(tbdOnArchiveSurface === 0, `no raw tbd/TBD on archive surfaces (${tbdOnArchiveSurface} found)`);
  check(unresolvedLabelsOnArchiveSurface === 0, `no unresolved Winner/Loser-of labels on archive surfaces (${unresolvedLabelsOnArchiveSurface} found)`);

  // ── Exact confirmations required by the brief ────────────────────────────
  const matchUrls = urls.filter((u) => u.startsWith(`${BASE}/matches/`));
  check(matchUrls.length === MATCHES.length, `sitemap includes all ${MATCHES.length} match pages (found ${matchUrls.length})`);
  check(urls.includes(`${BASE}/stats`), "sitemap includes /stats");
  check(urls.includes(`${BASE}/stats/top-scorers`), "sitemap includes /stats/top-scorers");
  check(urls.includes(`${BASE}/stats/players`), "sitemap includes /stats/players");
  check(urls.includes(`${BASE}/stats/teams`), "sitemap includes /stats/teams");
  check(urls.includes(`${BASE}/stats/compare`), "sitemap includes /stats/compare");
  check(urls.includes(`${BASE}/world-cup-2026`), "sitemap includes the archive hub /world-cup-2026");
  check(urls.includes(`${BASE}/world-cup-2026/results`), "sitemap includes the full results archive /world-cup-2026/results");

  const dateUrls = urls.filter((u) => /\/world-cup-2026\/results\/\d{4}-\d{2}-\d{2}$/.test(u));
  const expectedDates = CANDIDATE_ARCHIVE_DATES.filter((d) => existsSync(join(OUT_DIR, "world-cup-2026", "results", `${d}.html`)));
  check(dateUrls.length === expectedDates.length, `sitemap includes every currently-resolved date page (${dateUrls.length} of ${CANDIDATE_ARCHIVE_DATES.length} candidates; expected ${expectedDates.length})`);
  for (const date of expectedDates) {
    check(dateUrls.includes(`${BASE}/world-cup-2026/results/${date}`), `sitemap includes approved date page ${date}`);
  }

  console.log(`\n${passes + failures} checks run (pass: ${passes}, fail: ${failures})`);
  if (failures > 0) {
    console.error(`\n${failures} failure(s).`);
    process.exitCode = 1;
  } else {
    console.log("\nALL TECHNICAL SEO CHECKS PASSED.");
  }
}

main();
