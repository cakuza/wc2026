/**
 * High-cardinality Link prefetch regression test.
 *
 * Proves that every known fan-out-prone <Link> (one whose href varies per
 * team/match and is rendered in a loop or repeated across many pages) still
 * carries prefetch={false}. Next.js prefetches Link targets by default when
 * they enter the viewport; without this guard, high-cardinality lists turn
 * every page view into a burst of extra requests onto /teams/* or
 * /matches/*.
 *
 * Usage:
 *   npx tsx scripts/test-link-prefetch-regression.ts
 */

import fs from "fs";
import path from "path";

let passed = 0;
let failed = 0;

function check(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  PASS  ${msg}`);
    passed++;
  } else {
    console.error(`  FAIL  ${msg}`);
    failed++;
  }
}

const repoRoot = path.resolve(__dirname, "..");
function readSrc(relPath: string): string {
  return fs.readFileSync(path.join(repoRoot, relPath), "utf8");
}

// ── A. Already fixed by PR #16 ───────────────────────────────────────────────

console.log("\n── A. PR #16 sites (regression guard) ──\n");

const pr16Files = [
  "components/TimezoneSchedule.tsx",
  "app/schedule/ScheduleContent.tsx",
  "components/TodayMatches.tsx",
  "components/TimezoneSchedulePageContent.tsx",
  "components/TeamCard.tsx",
  "components/StandingsTable.tsx",
];

for (const file of pr16Files) {
  const src = readSrc(file);
  check(src.includes("prefetch={false}"), `${file} still contains prefetch={false}`);
}

// ── B. Newly fixed in this branch ────────────────────────────────────────────

console.log("\n── B. Remaining fan-out sites (this branch) ──\n");

const matchDetailSrc = readSrc("components/MatchDetail.tsx");
const teamsByConfSrc = readSrc("components/TeamsByConfederation.tsx");
const thirdPlaceSrc = readSrc("components/ThirdPlaceTable.tsx");

check(
  (matchDetailSrc.match(/prefetch=\{false\}/g) ?? []).length === 3,
  "components/MatchDetail.tsx has exactly 3 prefetch={false} occurrences (home team, away team, next-matches loop)"
);

check(
  /href=\{`\/teams\/\$\{slugFor\(homeKey[^}]*\}`\}\s+prefetch=\{false\}/.test(matchDetailSrc),
  "MatchDetail.tsx: home team Link carries prefetch={false}"
);

check(
  /href=\{`\/teams\/\$\{slugFor\(awayKey[^}]*\}`\}\s+prefetch=\{false\}/.test(matchDetailSrc),
  "MatchDetail.tsx: away team Link carries prefetch={false}"
);

check(
  /href=\{`\/matches\/\$\{matchSlug\(next\)\}`\}\s*\n\s*prefetch=\{false\}/.test(matchDetailSrc),
  "MatchDetail.tsx: next-matches loop Link carries prefetch={false}"
);

// Bottom static nav links (/groups, /bracket, /today, /stats, etc.) are a
// fixed small set, not data-driven fan-out — must remain UNGUARDED so this
// test fails loudly if someone accidentally narrows the intended scope.
check(
  /href=\{l\.href\}\s*\n\s*className/.test(matchDetailSrc),
  "MatchDetail.tsx: bottom static nav links deliberately left without prefetch={false} (not high-cardinality)"
);

check(
  (teamsByConfSrc.match(/prefetch=\{false\}/g) ?? []).length === 2,
  "components/TeamsByConfederation.tsx has exactly 2 prefetch={false} occurrences (preview loop + full-page loop)"
);

check(
  (thirdPlaceSrc.match(/prefetch=\{false\}/g) ?? []).length === 1,
  "components/ThirdPlaceTable.tsx has exactly 1 prefetch={false} occurrence (per-team row link)"
);

// ── C. No unintended side effects ────────────────────────────────────────────

console.log("\n── C. No unintended side effects ──\n");

// href targets, class names, and structure must be untouched — only the
// prefetch attribute was added. Spot-check that key hrefs are unchanged.
check(
  matchDetailSrc.includes('href={`/teams/${slugFor(homeKey ?? match.homeKey)}`}'),
  "MatchDetail.tsx: home team href unchanged"
);
check(
  matchDetailSrc.includes('href={`/teams/${slugFor(awayKey ?? match.awayKey)}`}'),
  "MatchDetail.tsx: away team href unchanged"
);
check(
  matchDetailSrc.includes('href={`/matches/${matchSlug(next)}`}'),
  "MatchDetail.tsx: next-match href unchanged"
);
check(
  matchDetailSrc.includes('href="/schedule"'),
  "MatchDetail.tsx: back-link href unchanged"
);

// ── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(50)}`);
console.log(`  ${passed} passed · ${failed} failed`);
if (failed > 0) process.exit(1);
