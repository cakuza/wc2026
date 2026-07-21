/**
 * Archive SEO Growth (GSC-informed) — permanent regression coverage.
 *
 * Locks in the Phase 3/4 fixes from the 2026-07-21 GSC-driven growth pass:
 * - WebSite schema scoped to the homepage only (was global, and duplicated
 *   on /world-cup-2026 — two real bugs found and fixed this pass).
 * - Breadcrumb JSON-LD added to the route families the independent review
 *   found missing it (schedule, matches, teams, stats subpages, bracket,
 *   evergreen editorial guides).
 * - Metadata truthfulness on priority routes (no stale live-tournament
 *   wording, no duplicate titles/descriptions, self-canonical).
 * - Sitemap completeness (all 104 match pages, all team/group pages, all
 *   resolved date archive pages, no intentionally-excluded URLs).
 * - Internal-link reachability from the homepage.
 * - No duplicate WebSite nodes, no invalid BreadcrumbList positions.
 *
 * Run after `npm run build` (static export must exist in out/):
 *   npx tsx scripts/test-archive-seo-growth-gsc.ts
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { MATCHES, matchSlug } from "../lib/matches";
import { CANDIDATE_ARCHIVE_DATES } from "../lib/archiveDates";
import { getTournamentLiveSnapshot } from "../lib/liveSnapshot";
import { getArchiveState } from "../lib/archiveLifecycle";
import { buildKnockoutResolution } from "../lib/knockoutResolution";
import { isDateFullyResolved } from "../lib/archiveLifecycle";

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

function readOut(relPath: string): string {
  const filePath = relPath === "/" || relPath === "" ? join(OUT_DIR, "index.html") : join(OUT_DIR, `${relPath.replace(/^\//, "")}.html`);
  return readFileSync(filePath, "utf8").replace(/<!-- -->/g, "");
}

function getTitle(html: string): string | null {
  return html.match(/<title>([^<]+)<\/title>/)?.[1] ?? null;
}

function getMetaDescription(html: string): string | null {
  return html.match(/name="description" content="([^"]+)"/)?.[1] ?? null;
}

function getCanonicalTags(html: string): string[] {
  return [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map((m) => m[1]);
}

function extractJsonLd(html: string): { raw: string; parsed: Record<string, any> | null }[] {
  const blocks: { raw: string; parsed: Record<string, any> | null }[] = [];
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

function getInternalLinks(html: string): string[] {
  return [...html.matchAll(/href="(\/[^"#?]*)"/g)].map((m) => m[1]).filter((h) => !h.startsWith("//"));
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

async function main(): Promise<void> {
  console.log("=== Archive SEO Growth (GSC-informed) audit ===\n");

  if (!existsSync(OUT_DIR)) {
    console.error("out/ does not exist — run `npm run build` first.");
    process.exit(1);
  }

  // ── WebSite schema: homepage-only, correct shape ──────────────────────────
  console.log("--- WebSite schema ---\n");
  {
    const home = readOut("/");
    const homeBlocks = extractJsonLd(home);
    const homeWebsiteNodes = homeBlocks.filter((b) => b.parsed?.["@type"] === "WebSite");
    check(homeWebsiteNodes.length === 1, "homepage has exactly one WebSite node");

    const website = homeWebsiteNodes[0]?.parsed;
    if (website) {
      check(typeof website.description === "string" && /archive/i.test(website.description), "WebSite description reflects the archive, not a live command center");
      check(website.inLanguage === "en", `WebSite inLanguage is "en" (got ${JSON.stringify(website.inLanguage)})`);
      check(typeof website.url === "string" && website.url.startsWith(BASE), "WebSite url is a valid canonical URL");
      check(typeof website.alternateName === "string" && website.alternateName.length > 0, "WebSite has an alternateName");
      check(website.potentialAction === undefined, "WebSite has no SearchAction");
    }

    const otherRoutes = ["/world-cup-2026", "/today", "/stats", "/bracket", "/teams", "/groups"];
    for (const route of otherRoutes) {
      if (!existsSync(urlToFilePath(`${BASE}${route}`))) continue;
      const html = readOut(route);
      const websiteNodes = extractJsonLd(html).filter((b) => b.parsed?.["@type"] === "WebSite");
      check(websiteNodes.length === 0, `${route} has no WebSite node (homepage-only)`);
    }
  }

  // ── Breadcrumbs on the route families touched this pass ───────────────────
  console.log("\n--- Breadcrumbs ---\n");
  {
    const breadcrumbRoutes = [
      "/schedule",
      "/bracket",
      "/stats",
      "/stats/matches",
      "/stats/players",
      "/stats/teams",
      "/stats/compare",
      "/world-cup-2026-format-explained",
      "/world-cup-2026-group-tiebreakers",
      "/world-cup-2026-knockout-bracket-explained",
      "/world-cup-2026-prize-money",
      "/world-cup-2026-teams-by-confederation",
      "/world-cup-2026-data-sources",
      "/world-cup-schedule-local-time",
      "/world-cup-third-place-qualification",
    ];
    for (const route of breadcrumbRoutes) {
      const filePath = urlToFilePath(`${BASE}${route}`);
      if (!existsSync(filePath)) {
        check(false, `${route} exists in out/ (cannot verify breadcrumbs — route missing)`);
        continue;
      }
      const html = readOut(route);
      const breadcrumbNodes = extractJsonLd(html).filter((b) => b.parsed?.["@type"] === "BreadcrumbList");
      check(breadcrumbNodes.length === 1, `${route} has exactly one BreadcrumbList`);
      const bc = breadcrumbNodes[0]?.parsed;
      if (bc) {
        const items = (bc.itemListElement ?? []) as any[];
        check(items.length >= 2, `${route} breadcrumb has at least two list items (got ${items.length})`);
        const positions = items.map((i) => i.position);
        const expectedPositions = items.map((_, i) => i + 1);
        check(JSON.stringify(positions) === JSON.stringify(expectedPositions), `${route} breadcrumb positions are valid/sequential`);
        check(items.every((i) => typeof i.item === "string" ? i.item.startsWith(BASE) : i.item === undefined), `${route} breadcrumb items use canonical absolute URLs`);
        // Visible/JSON-LD hierarchy agreement: every non-final JSON-LD label
        // should appear as visible text on the page (the BreadcrumbNav trail).
        const visibleLabels = items.slice(0, -1).map((i) => i.name as string);
        for (const label of visibleLabels) {
          check(html.includes(label), `${route} visible breadcrumb trail includes "${label}" (JSON-LD/visible agreement)`);
        }
      }
    }

    // Sample dynamic routes if present in this build.
    const dynamicSamples = [
      { route: "/matches/match-104", label: null },
      { route: "/schedule/eastern-time", label: null },
    ];
    for (const { route } of dynamicSamples) {
      const filePath = urlToFilePath(`${BASE}${route}`);
      if (!existsSync(filePath)) continue;
      const html = readOut(route);
      const breadcrumbNodes = extractJsonLd(html).filter((b) => b.parsed?.["@type"] === "BreadcrumbList");
      check(breadcrumbNodes.length === 1, `${route} has exactly one BreadcrumbList`);
    }
  }

  // ── Metadata truthfulness on priority routes ───────────────────────────────
  console.log("\n--- Metadata ---\n");
  {
    const priorityRoutes = [
      "/", "/world-cup-2026", "/world-cup-2026/results", "/stats", "/stats/top-scorers",
      "/bracket", "/groups", "/qualified-eliminated-teams", "/schedule",
      "/world-cup-third-place-qualification", "/world-cup-2026-teams-by-confederation",
    ];
    const titlesSeen = new Map<string, string>();
    const descriptionsSeen = new Map<string, string>();
    // "kickoff times" alone is fine (e.g. "Local Kickoff Times" on an archive
    // page) — only flag it when the title has no archive/results framing at
    // all, since that's the actual stale-live-tournament signal.
    function hasStaleWording(title: string): boolean {
      if (/\btoday's matches\b|\blive scores\b|\bupcoming fixtures\b/i.test(title)) return true;
      if (/\bkickoff times\b/i.test(title) && !/\barchive\b|\bresults\b/i.test(title)) return true;
      return false;
    }

    for (const route of priorityRoutes) {
      const filePath = urlToFilePath(`${BASE}${route}`);
      if (!existsSync(filePath)) {
        check(false, `${route} exists in out/`);
        continue;
      }
      const html = readOut(route);
      const title = getTitle(html);
      const description = getMetaDescription(html);
      const canonicals = getCanonicalTags(html);

      check(Boolean(title), `${route} has a title`);
      check(Boolean(description), `${route} has a meta description`);
      check(canonicals.length === 1 && canonicals[0] === `${BASE}${route === "/" ? "" : route}`, `${route} is self-canonical`);

      if (title) {
        check(!titlesSeen.has(title) || titlesSeen.get(title) === route, `${route} title is unique across priority routes (title: "${title}")`);
        titlesSeen.set(title, route);
        check(!hasStaleWording(title), `${route} title has no stale live-tournament wording`);
        const brandCount = (title.match(/WorldCupMatchDay/gi) || []).length;
        check(brandCount <= 1, `${route} title does not double-brand (found ${brandCount}x "WorldCupMatchDay")`);
      }
      if (description) {
        check(!descriptionsSeen.has(description) || descriptionsSeen.get(description) === route, `${route} description is unique across priority routes`);
        descriptionsSeen.set(description, route);
      }
    }
  }

  // ── Sitemap completeness ───────────────────────────────────────────────────
  console.log("\n--- Sitemap ---\n");
  {
    const sitemapPath = join(OUT_DIR, "sitemap.xml");
    check(existsSync(sitemapPath), "out/sitemap.xml exists");
    if (existsSync(sitemapPath)) {
      const xml = readFileSync(sitemapPath, "utf8");
      const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
      const urlSet = new Set(urls);

      check(new Set(urls).size === urls.length, "sitemap has no duplicate URLs");
      check(!urls.some((u) => u.startsWith("https://worldcupmatchday.com")), "sitemap has no non-canonical apex URLs (www only)");

      const now = new Date();
      const lastmods = [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => new Date(m[1]));
      check(lastmods.every((d) => d.getTime() <= now.getTime() + 24 * 3600_000), "sitemap has no future lastModified dates");

      const matchUrls = MATCHES.filter((m) => "matchNumber" in m).map((m) => `${BASE}/matches/${matchSlug(m)}`);
      const missingMatches = matchUrls.filter((u) => !urlSet.has(u));
      check(missingMatches.length === 0, `sitemap includes all ${matchUrls.length} match pages (missing: ${missingMatches.length})`);

      check(urls.some((u) => u.startsWith(`${BASE}/teams/`)), "sitemap includes team pages");
      check(urls.some((u) => u.startsWith(`${BASE}/groups/`)), "sitemap includes group pages");

      const snapshot = await getTournamentLiveSnapshot();
      const resolvedDates = CANDIDATE_ARCHIVE_DATES.filter((d) => isDateFullyResolved({ date: d, liveData: snapshot.liveDataByProviderId, now: new Date() }));
      const missingDates = resolvedDates.filter((d) => !urlSet.has(`${BASE}/world-cup-2026/results/${d}`));
      check(missingDates.length === 0, `sitemap includes all ${resolvedDates.length} resolved date archive pages (missing: ${missingDates.length})`);

      // Intentionally-excluded query/compare URLs must never appear.
      check(!urls.some((u) => u.includes("?date=") || u.includes("?tz=") || u.includes("/stats/compare?")), "sitemap contains no intentionally-excluded query-parameter URLs");
    }
  }

  // ── Internal links ─────────────────────────────────────────────────────────
  console.log("\n--- Internal links ---\n");
  {
    const home = readOut("/");
    const homeLinks = new Set(getInternalLinks(home));
    check(homeLinks.has("/world-cup-2026") || homeLinks.has("/world-cup-2026/results"), "homepage links the archive hub or full results");

    if (existsSync(urlToFilePath(`${BASE}/world-cup-2026`))) {
      const hub = readOut("/world-cup-2026");
      const hubLinks = new Set(getInternalLinks(hub));
      check(hubLinks.has("/world-cup-2026/results"), "archive hub links results");
      check(hubLinks.has("/stats"), "archive hub links stats");
      check(hubLinks.has("/bracket"), "archive hub links bracket");
      check(hubLinks.has("/teams"), "archive hub links teams");
    }

    if (existsSync(urlToFilePath(`${BASE}/matches/match-104`))) {
      const finalPage = readOut("/matches/match-104");
      check(/Spain/i.test(finalPage) && /Argentina/i.test(finalPage), "Match 104 page mentions both Spain and Argentina");
      const finalLinks = new Set(getInternalLinks(finalPage));
      check(finalLinks.has("/teams/spain"), "Match 104 links the Spain team page");
      check(finalLinks.has("/teams/argentina"), "Match 104 links the Argentina team page");
    }

    // Reachability within three internal clicks from the homepage (BFS over hrefs).
    const keyPages = ["/stats", "/bracket", "/teams", "/groups", "/schedule", "/world-cup-2026/results"];
    const visited = new Set<string>(["/"]);
    let frontier = [""];
    for (let depth = 0; depth < 3 && frontier.length > 0; depth++) {
      const next: string[] = [];
      for (const route of frontier) {
        const fp = urlToFilePath(`${BASE}${route || "/"}`);
        if (!existsSync(fp)) continue;
        const html = readOut(route || "/");
        for (const link of getInternalLinks(html)) {
          if (!visited.has(link)) {
            visited.add(link);
            next.push(link);
          }
        }
      }
      frontier = next;
    }
    for (const page of keyPages) {
      check(visited.has(page), `${page} is reachable from the homepage within three internal clicks`);
    }
  }

  // ── Structured data sanity (no duplicate WebSite, valid JSON everywhere) ──
  console.log("\n--- Structured data ---\n");
  {
    const allHtmlFiles = walkHtmlFiles(OUT_DIR);
    let totalWebsiteNodes = 0;
    let invalidJsonLdCount = 0;
    for (const file of allHtmlFiles) {
      const html = readFileSync(file, "utf8");
      const blocks = extractJsonLd(html);
      for (const b of blocks) {
        if (b.parsed === null) invalidJsonLdCount++;
        if (b.parsed?.["@type"] === "WebSite") totalWebsiteNodes++;
      }
    }
    check(invalidJsonLdCount === 0, `no invalid/unparseable JSON-LD across the export (found ${invalidJsonLdCount})`);
    check(totalWebsiteNodes === 1, `exactly one WebSite node exists across the entire export (found ${totalWebsiteNodes})`);
  }

  console.log(`\n${passes} passed, ${failures} failed.`);
  if (failures > 0) {
    console.error(`\n${failures} failure(s).`);
    process.exitCode = 1;
  } else {
    console.log("\nALL ARCHIVE SEO GROWTH CHECKS PASSED.");
  }
}

main();
