/**
 * Regression coverage for lifecycle-aware primary navigation
 * (lib/navLinks.ts getDesktopLinks/getPrimaryLinks/getSecondaryLinks).
 *
 * Pure-function tests only: no React, no DOM. Proves the pre-completion and
 * tournament-complete link sets independently, that they share one lifecycle
 * truth via the selector functions, and that neither set contains duplicate
 * or missing required destinations.
 */
import {
  DESKTOP_LINKS,
  PRIMARY_LINKS,
  SECONDARY_LINKS,
  ARCHIVE_DESKTOP_LINKS,
  ARCHIVE_PRIMARY_LINKS,
  ARCHIVE_SECONDARY_LINKS,
  getDesktopLinks,
  getPrimaryLinks,
  getSecondaryLinks,
} from "../lib/navLinks";

let failures = 0;
function check(condition: boolean, message: string): void {
  if (condition) {
    console.log(`PASS ${message}`);
  } else {
    console.error(`FAIL ${message}`);
    failures += 1;
  }
}

function hrefs(links: { href: string }[]): string[] {
  return links.map((l) => l.href);
}

function hasNoDuplicates(links: { href: string }[]): boolean {
  const list = hrefs(links);
  return new Set(list).size === list.length;
}

// --- Selector functions share one lifecycle truth ---
{
  check(getDesktopLinks(false) === DESKTOP_LINKS, "getDesktopLinks(false) returns the pre-completion set");
  check(getDesktopLinks(true) === ARCHIVE_DESKTOP_LINKS, "getDesktopLinks(true) returns the archive-mode set");
  check(getPrimaryLinks(false) === PRIMARY_LINKS, "getPrimaryLinks(false) returns the pre-completion set");
  check(getPrimaryLinks(true) === ARCHIVE_PRIMARY_LINKS, "getPrimaryLinks(true) returns the archive-mode set");
  check(getSecondaryLinks(false) === SECONDARY_LINKS, "getSecondaryLinks(false) returns the pre-completion set");
  check(getSecondaryLinks(true) === ARCHIVE_SECONDARY_LINKS, "getSecondaryLinks(true) returns the archive-mode set");
}

// --- Pre-completion nav is untouched by this change ---
{
  check(DESKTOP_LINKS.length === 7, "pre-completion DESKTOP_LINKS unchanged (7 entries)");
  check(hasNoDuplicates(DESKTOP_LINKS), "pre-completion DESKTOP_LINKS has no duplicate hrefs");
  check(!hrefs(DESKTOP_LINKS).includes("/world-cup-2026"), "pre-completion DESKTOP_LINKS does not surface the archive hub early");
}

// --- Archive-mode desktop nav: required priority order ---
{
  const required = ["/world-cup-2026", "/world-cup-2026/results", "/stats", "/bracket", "/teams", "/groups"];
  const actual = hrefs(ARCHIVE_DESKTOP_LINKS).slice(0, required.length);
  check(JSON.stringify(actual) === JSON.stringify(required), `archive desktop nav leads with the required priority order: ${required.join(" > ")}`);
  check(hasNoDuplicates(ARCHIVE_DESKTOP_LINKS), "archive desktop nav has no duplicate hrefs");
  check(hrefs(ARCHIVE_DESKTOP_LINKS).filter((h) => h === "/world-cup-2026").length === 1, "no duplicate Archive link in archive desktop nav");
  check(hrefs(ARCHIVE_DESKTOP_LINKS).filter((h) => h === "/world-cup-2026/results").length === 1, "no duplicate Results link in archive desktop nav");
  check(hrefs(ARCHIVE_DESKTOP_LINKS).includes("/today"), "/today remains reachable in archive desktop nav");
  check(hrefs(ARCHIVE_DESKTOP_LINKS).includes("/schedule"), "/schedule remains reachable in archive desktop nav");
  const todayIdx = hrefs(ARCHIVE_DESKTOP_LINKS).indexOf("/today");
  const archiveIdx = hrefs(ARCHIVE_DESKTOP_LINKS).indexOf("/world-cup-2026");
  check(todayIdx > archiveIdx, "/today no longer dominates archive desktop nav (moved after the Archive link)");
}

// --- Archive-mode mobile primary + secondary: no duplicates across the pair ---
{
  check(hasNoDuplicates(ARCHIVE_PRIMARY_LINKS), "archive mobile primary has no duplicate hrefs");
  check(hasNoDuplicates(ARCHIVE_SECONDARY_LINKS), "archive mobile secondary has no duplicate hrefs");
  const primarySet = new Set(hrefs(ARCHIVE_PRIMARY_LINKS));
  const overlap = hrefs(ARCHIVE_SECONDARY_LINKS).filter((h) => primarySet.has(h));
  check(overlap.length === 0, `archive mobile primary and secondary do not overlap (found: ${overlap.join(", ") || "none"})`);

  const combined = new Set([...hrefs(ARCHIVE_PRIMARY_LINKS), ...hrefs(ARCHIVE_SECONDARY_LINKS)]);
  for (const required of ["/world-cup-2026", "/world-cup-2026/results", "/stats", "/bracket", "/teams", "/groups", "/today", "/schedule"]) {
    check(combined.has(required), `${required} is reachable somewhere in archive mobile nav (primary or secondary)`);
  }
  check(hrefs(ARCHIVE_PRIMARY_LINKS)[0] === "/world-cup-2026", "archive mobile primary leads with the Archive link");
  check(hrefs(ARCHIVE_PRIMARY_LINKS).includes("/world-cup-2026/results"), "archive mobile primary surfaces Results");
}

// --- No accidental hardcoded champion/result text baked into nav data ---
{
  const allLinks = [...ARCHIVE_DESKTOP_LINKS, ...ARCHIVE_PRIMARY_LINKS, ...ARCHIVE_SECONDARY_LINKS];
  const suspiciousPattern = /Spain|Argentina|France|England|champion|winner/i;
  const offenders = allLinks.filter((l) => suspiciousPattern.test(l.label ?? "") || suspiciousPattern.test(l.key));
  check(offenders.length === 0, "no archive nav link hardcodes a team name, champion or winner");
}

if (failures > 0) {
  console.error(`\n${failures} failure(s).`);
  process.exitCode = 1;
} else {
  console.log("\nALL ARCHIVE NAVIGATION CHECKS PASSED.");
}
