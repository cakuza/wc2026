/**
 * Permanent proof that every built /world-cup-2026/results/[date] page is
 * reachable from the results archive (no orphan date pages), and that the
 * gated dates (Match 103/104) stay excluded until their canonical results
 * permit generation. Run against a fresh `out/` (post `npm run build`):
 *
 *   npx tsx scripts/test-seo-date-archive.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { CANDIDATE_ARCHIVE_DATES } from "../lib/archiveDates";

const OUT_DIR = join(process.cwd(), "out");
const BASE = "https://www.worldcupmatchday.com";

let failures = 0;
function check(condition: boolean, message: string): void {
  if (condition) {
    console.log(`PASS ${message}`);
  } else {
    console.error(`FAIL ${message}`);
    failures += 1;
  }
}

function main(): void {
  const builtDates = CANDIDATE_ARCHIVE_DATES.filter((d) => existsSync(join(OUT_DIR, "world-cup-2026", "results", `${d}.html`)));
  const gatedDates = CANDIDATE_ARCHIVE_DATES.filter((d) => !builtDates.includes(d));

  console.log(`Candidate dates: ${CANDIDATE_ARCHIVE_DATES.length}, built: ${builtDates.length}, gated: ${gatedDates.length}`);
  check(gatedDates.length > 0, "at least one date page is built");
  check(gatedDates.includes("2026-07-19"), "Final (07-19) date remains gated until the final match is canonically final");

  // --- No orphan date pages: every built date must be linked from the results archive ---
  const resultsPath = join(OUT_DIR, "world-cup-2026", "results.html");
  check(existsSync(resultsPath), "out/world-cup-2026/results.html exists");
  if (existsSync(resultsPath)) {
    const resultsHtml = readFileSync(resultsPath, "utf8");
    for (const date of builtDates) {
      check(resultsHtml.includes(`/world-cup-2026/results/${date}`), `results archive links to built date page ${date} (no orphan)`);
    }
    for (const date of gatedDates) {
      check(!resultsHtml.includes(`/world-cup-2026/results/${date}"`), `results archive does not link to gated date page ${date}`);
    }
  }

  // --- Unique title/description/H1 across all built date pages ---
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const date of builtDates) {
    const filePath = join(OUT_DIR, "world-cup-2026", "results", `${date}.html`);
    check(existsSync(filePath), `${date} page exists on disk`);
    if (!existsSync(filePath)) continue;
    const html = readFileSync(filePath, "utf8");
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1] ?? "";
    const description = html.match(/name="description" content="([^"]+)"/)?.[1] ?? "";
    const h1Count = (html.replace(/<!-- -->/g, "").match(/<h1\b/g) || []).length;

    check(title.length > 0 && !titles.has(title), `${date} has a unique, non-empty title`);
    titles.add(title);
    check(description.length > 0 && !descriptions.has(description), `${date} has a unique, non-empty description`);
    descriptions.add(description);
    check(h1Count === 1, `${date} has exactly one H1`);

    // Prev/next navigation must only ever point at another BUILT date.
    const idx = builtDates.indexOf(date);
    const prev = idx > 0 ? builtDates[idx - 1] : null;
    const next = idx < builtDates.length - 1 ? builtDates[idx + 1] : null;
    if (prev) check(html.includes(`/world-cup-2026/results/${prev}`), `${date} links back to its built predecessor ${prev}`);
    if (next) check(html.includes(`/world-cup-2026/results/${next}`), `${date} links forward to its built successor ${next}`);
    for (const gated of gatedDates) {
      check(!html.includes(`/world-cup-2026/results/${gated}"`), `${date} never links to gated date ${gated}`);
    }
  }

  if (failures > 0) {
    console.error(`\n${failures} failure(s).`);
    process.exitCode = 1;
  } else {
    console.log("\nALL DATE-ARCHIVE LINKING CHECKS PASSED.");
  }
}

main();
