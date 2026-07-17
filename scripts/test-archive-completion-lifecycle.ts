/**
 * Proves archive lifecycle behavior on both sides of tournament completion.
 *
 * "Before" assertions run against the real static build in out/ (the
 * current production state genuinely is pre-completion, since Match
 * 103/104 haven't been played) — this is real rendered-output evidence,
 * not a guess about what the code does.
 *
 * "After" assertions can't be produced by mutating real archive data, so
 * they combine two kinds of proof instead of hardcoded page strings
 * disconnected from the data model:
 *   1. Pure-function fixture proof (synthetic liveData, same pattern as
 *      test-archive-lifecycle.ts) — showing getArchiveState/getTournamentPhase
 *      genuinely resolve champion/final/third-place/navigation-truth once
 *      Match 104 is final.
 *   2. Source-wiring proof — grepping each page/component file to confirm
 *      it actually branches on the shared archiveState.isComplete /
 *      isTournamentComplete value (not a hardcoded champion, not a value
 *      disconnected from lib/archiveLifecycle.ts).
 *
 * Run after `npm run build`:
 *   npx tsx scripts/test-archive-completion-lifecycle.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { MATCHES, ARCHIVE_DEFAULT_DATE } from "../lib/matches";
import { getArchiveState } from "../lib/archiveLifecycle";
import { getTournamentPhase, getTournamentPhaseLabel } from "../lib/matchCenterSelection";
import { getDesktopLinks, getPrimaryLinks } from "../lib/navLinks";
import type { LiveMatchData } from "../lib/liveMatchData";

const OUT_DIR = join(process.cwd(), "out");

let failures = 0;
function check(condition: boolean, message: string): void {
  if (condition) {
    console.log(`PASS ${message}`);
  } else {
    console.error(`FAIL ${message}`);
    failures += 1;
  }
}

function readOut(relPath: string): string {
  return readFileSync(join(OUT_DIR, relPath), "utf8").replace(/<!-- -->/g, "");
}

function grepFile(relPath: string, pattern: string | RegExp): boolean {
  const src = readFileSync(join(process.cwd(), relPath), "utf8");
  return typeof pattern === "string" ? src.includes(pattern) : pattern.test(src);
}

console.log("=== BEFORE completion: real build evidence (out/) ===\n");

if (!existsSync(join(OUT_DIR, "index.html"))) {
  console.error("out/ does not exist — run `npm run build` first.");
  process.exit(1);
}

{
  const hub = readOut("world-cup-2026.html");
  check(/Final Weekend/i.test(hub), "archive hub shows the truthful pre-completion 'Final Weekend' state");
  check(!/\b(Spain|Argentina) won\b/i.test(hub), "archive hub does not claim a champion before completion");
  check(!/2026 World Cup Archive: \w+ Win/i.test(hub), "archive hub H1 is not the post-completion champion headline");

  const home = readOut("index.html");
  check(!/\bwon the Final\b/i.test(home), "homepage does not claim a Final result before completion");
  check(home.includes("Match Center") || home.includes("Matchdays"), "homepage retains its pre-completion identity");

  const today = readOut("today.html");
  check(!/tournament is complete/i.test(today), "/today does not falsely claim completion");

  check(!home.includes('href="/world-cup-2026"'), "homepage nav does not surface the archive hub link before completion (archive-mode nav not active)");
  // Nav resolves /today through getTodayHref(tz), which appends a date/tz
  // param — match the href prefix rather than a literal closing quote.
  check(/href="\/today(\?[^"]*)?"/.test(home), "/today remains a primary nav destination before completion");
}

console.log("\n=== AFTER completion: fixture proof + source wiring ===\n");

{
  const MATCH_103_PROVIDER_ID = 537389;
  const MATCH_104_PROVIDER_ID = 537390;
  const liveData: Record<string, LiveMatchData> = {
    [String(MATCH_103_PROVIDER_ID)]: {
      provider: "football-data.org", providerMatchId: MATCH_103_PROVIDER_ID, status: "FINISHED",
      homeScore: 2, awayScore: 1, winner: "HOME_TEAM", lastSyncedAt: ARCHIVE_DEFAULT_DATE, eventDataAvailable: true,
    },
    [String(MATCH_104_PROVIDER_ID)]: {
      provider: "football-data.org", providerMatchId: MATCH_104_PROVIDER_ID, status: "FINISHED",
      homeScore: 3, awayScore: 1, winner: "HOME_TEAM", lastSyncedAt: ARCHIVE_DEFAULT_DATE, eventDataAvailable: true,
    },
  };
  const now = new Date("2026-07-20T00:00:00.000Z");
  const archive = getArchiveState({ matches: MATCHES, liveData, now });
  const phase = getTournamentPhase({ matches: MATCHES, liveData, now });

  check(archive.isComplete === true, "fixture: getArchiveState reports complete once Match 104 is final");
  check(archive.champion !== null && archive.champion === archive.finalResult?.winnerLabel, "fixture: champion resolves to the Final's actual winner");
  check(archive.thirdPlace !== null, "fixture: third-place result resolves once Match 103 is final");
  check(phase === "tournament_complete", "fixture: tournament phase reports tournament_complete");
  check(getTournamentPhaseLabel(phase) !== "Semifinals" && getTournamentPhaseLabel(phase) !== "Third-place playoff", "fixture: bracket phase label is not stale once complete");

  const archiveDesktop = getDesktopLinks(true);
  const archivePrimary = getPrimaryLinks(true);
  check(archiveDesktop[0]?.href === "/world-cup-2026", "fixture: post-completion desktop nav leads with the archive hub");
  check(archivePrimary[0]?.href === "/world-cup-2026", "fixture: post-completion mobile nav leads with the archive hub");
}

{
  // Source-wiring proof: every archive-aware surface must derive its
  // completion state from lib/archiveLifecycle.ts's getArchiveState (the
  // single shared lifecycle truth), not a disconnected or hardcoded value.
  check(grepFile("app/layout.tsx", "getArchiveState") && grepFile("app/layout.tsx", "isTournamentComplete"), "app/layout.tsx derives nav lifecycle state from getArchiveState");
  check(grepFile("components/Nav.tsx", "isTournamentComplete") && grepFile("components/Nav.tsx", "getDesktopLinks"), "components/Nav.tsx consumes the shared lifecycle prop via getDesktopLinks/getPrimaryLinks");
  check(grepFile("components/Hero.tsx", "archiveState.isComplete"), "components/Hero.tsx branches on archiveState.isComplete for the homepage headline");
  check(grepFile("components/TodayContent.tsx", "archiveState.isComplete"), "components/TodayContent.tsx branches on archiveState.isComplete for the completion banner");
  check(grepFile("app/world-cup-2026/page.tsx", "archive.isComplete"), "app/world-cup-2026/page.tsx branches on archive.isComplete for champion copy");
  check(grepFile("app/page.tsx", "getArchiveState"), "app/page.tsx computes archiveState via getArchiveState (not hardcoded)");
  check(grepFile("app/today/page.tsx", "getArchiveState"), "app/today/page.tsx computes archiveState via getArchiveState (not hardcoded)");

  // No hardcoded champion/result anywhere in the wiring — the only place a
  // team name may legitimately appear is inside lib/matches.ts fixture data
  // and lib/archiveLifecycle.ts's own logic, never as a literal string in a
  // page/component that should be deriving it dynamically.
  const noHardcodeFiles = [
    "app/layout.tsx", "components/Nav.tsx", "components/Hero.tsx",
    "components/TodayContent.tsx", "app/world-cup-2026/page.tsx",
  ];
  for (const file of noHardcodeFiles) {
    check(!grepFile(file, /["'`](Spain|Argentina) (won|wins|beat)/i), `${file} does not hardcode a champion/result string`);
  }
}

console.log("\n=== Stats/bracket final-state consistency (no separate branch needed) ===\n");

{
  // /stats and /bracket don't need an isComplete conditional in the page
  // body — they already render the true current tournamentStats/phase
  // unconditionally, so "uses final totals" falls out of the data being
  // correct rather than a special-cased branch. Prove that assumption holds
  // by confirming neither hardcodes a mid-tournament totals disclaimer that
  // would become false once the data is actually final.
  check(!grepFile("app/stats/page.tsx", /goals so far|matches so far/i), "/stats metadata does not hardcode 'so far' language that would go stale post-completion");
  check(grepFile("app/bracket/page.tsx", "tournamentPhase"), "/bracket derives its phase label from the live tournamentPhase, not a hardcoded stage");
}

if (failures > 0) {
  console.error(`\n${failures} failure(s).`);
  process.exitCode = 1;
} else {
  console.log("\nALL COMPLETION-LIFECYCLE CHECKS PASSED.");
}
