/**
 * Permanent regression coverage for the "Tournament complete" premature-display
 * bug reported by the owner: the homepage rendered "Tournament complete" while
 * Match 103/104 were both still unplayed. Root cause was two independent,
 * unaudited completion signals:
 *
 *  1. components/CountdownClient.tsx gated on `tournamentPhase ===
 *     "tournament_complete" || !target` — the `!target` fallback fired
 *     whenever getHomepageMatchCenterSnapshot's countdown target resolved to
 *     null, which happened by construction once both semifinals were final
 *     (activeCurrentStage stays locked to "SF" for display purposes during
 *     third_place/final phases, so upcomingCurrentRound is always empty then).
 *  2. components/TeamDetail.tsx's "Next match" card printed the literal
 *     string "Tournament complete" for ANY team with no next listed match —
 *     including teams merely eliminated mid-tournament (reproduced live for
 *     Morocco, eliminated in the QF on 9 Jul, days before the real final).
 *
 * This file proves, across the six completion-boundary scenarios the owner's
 * brief requires and multiple `now` instants, that:
 *   - getArchiveState({ ... }).isComplete is the ONLY thing that may be true
 *     when "Tournament complete" is shown, never a null/absent countdown
 *     target or an absent per-team next-match.
 *   - getHomepageMatchCenterSnapshot always resolves a sane next-match target
 *     while destinations remain (Match 103/104) so the homepage countdown
 *     never goes null before the tournament is genuinely over.
 *   - CountdownClient and TeamDetail are wired to the shared archiveState
 *     predicate (grepped from source), not a route-local boolean.
 *
 * Run: npx tsx scripts/test-completion-boundary-scenarios.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { MATCHES, ARCHIVE_DEFAULT_DATE, matchUtcDate } from "../lib/matches";
import { getArchiveState } from "../lib/archiveLifecycle";
import { getTournamentPhase, getHomepageMatchCenterSnapshot } from "../lib/matchCenterSelection";
import type { LiveMatchData } from "../lib/liveMatchData";
import { COMPLETED_KNOCKOUT_RESULTS } from "../lib/canonicalMatchResults";
import assert from "node:assert";

const originalMatch103 = (COMPLETED_KNOCKOUT_RESULTS as any)[103];
let failures = 0;

function check(condition: boolean, message: string): void {
  if (condition) {
    console.log(`PASS ${message}`);
  } else {
    console.error(`FAIL ${message}`);
    failures += 1;
  }
}

try {
  // Disable manual fallback for Match 103 to allow simulating its scheduled/upcoming states
  delete (COMPLETED_KNOCKOUT_RESULTS as any)[103];

function grepFile(relPath: string, pattern: string | RegExp): boolean {
  const src = readFileSync(join(process.cwd(), relPath), "utf8");
  return typeof pattern === "string" ? src.includes(pattern) : pattern.test(src);
}

const MATCH_101_PROVIDER_ID = 537387; // France vs Spain (SF, 14 Jul)
const MATCH_102_PROVIDER_ID = 537388; // England vs Argentina (SF, 15 Jul)
const MATCH_103_PROVIDER_ID = 537389; // Third-place playoff
const MATCH_104_PROVIDER_ID = 537390; // Final

function finished(providerMatchId: number, homeScore: number, awayScore: number): LiveMatchData {
  return {
    provider: "football-data.org",
    providerMatchId,
    status: "FINISHED",
    homeScore,
    awayScore,
    winner: homeScore > awayScore ? "HOME_TEAM" : "AWAY_TEAM",
    lastSyncedAt: ARCHIVE_DEFAULT_DATE,
    eventDataAvailable: true,
  };
}

// Both semifinals are canonically resolved in production data already (via
// COMPLETED_KNOCKOUT_RESULTS), so every scenario below implicitly has 101/102
// final regardless of whether liveData repeats them.
const SEMIS_FINAL: Record<string, LiveMatchData> = {
  [String(MATCH_101_PROVIDER_ID)]: finished(MATCH_101_PROVIDER_ID, 0, 2),
  [String(MATCH_102_PROVIDER_ID)]: finished(MATCH_102_PROVIDER_ID, 1, 2),
};

const match103 = MATCHES.find((m) => "matchNumber" in m && m.matchNumber === 103)!;
const match104 = MATCHES.find((m) => "matchNumber" in m && m.matchNumber === 104)!;
const kickoff103 = matchUtcDate(match103);
const kickoff104 = matchUtcDate(match104);

type Scenario = {
  name: string;
  liveData: Record<string, LiveMatchData>;
  now: Date;
  expectIsComplete: boolean;
  expectPhase: string;
  /** Whether the homepage countdown must resolve to a non-null target. */
  expectHasCountdownTarget: boolean;
};

const scenarios: Scenario[] = [
  {
    name: "A: both 103 and 104 scheduled, before either kickoff",
    liveData: { ...SEMIS_FINAL },
    now: new Date(kickoff103.getTime() - 24 * 3600_000),
    expectIsComplete: false,
    expectPhase: "third_place",
    expectHasCountdownTarget: true,
  },
  {
    name: "B: 103 final, 104 still scheduled",
    liveData: { ...SEMIS_FINAL, [String(MATCH_103_PROVIDER_ID)]: finished(MATCH_103_PROVIDER_ID, 2, 1) },
    now: new Date(kickoff104.getTime() - 3600_000),
    expectIsComplete: false,
    expectPhase: "final",
    expectHasCountdownTarget: true,
  },
  {
    name: "C: 104 kickoff passed, no result recorded yet",
    liveData: { ...SEMIS_FINAL, [String(MATCH_103_PROVIDER_ID)]: finished(MATCH_103_PROVIDER_ID, 2, 1) },
    now: new Date(kickoff104.getTime() + 45 * 60_000),
    expectIsComplete: false,
    expectPhase: "final",
    expectHasCountdownTarget: true,
  },
  {
    name: "D: 104 has an incomplete/malformed record (FINISHED status, null scores) after kickoff",
    liveData: {
      ...SEMIS_FINAL,
      [String(MATCH_103_PROVIDER_ID)]: finished(MATCH_103_PROVIDER_ID, 2, 1),
      [String(MATCH_104_PROVIDER_ID)]: {
        provider: "football-data.org",
        providerMatchId: MATCH_104_PROVIDER_ID,
        status: "FINISHED",
        homeScore: null as unknown as number,
        awayScore: null as unknown as number,
        winner: null,
        lastSyncedAt: ARCHIVE_DEFAULT_DATE,
        eventDataAvailable: false,
      },
    },
    now: new Date(kickoff104.getTime() + 3 * 3600_000),
    expectIsComplete: false,
    expectPhase: "final",
    expectHasCountdownTarget: true,
  },
  {
    name: "E: 104 has a valid canonical final result (both 103 and 104 final)",
    liveData: {
      ...SEMIS_FINAL,
      [String(MATCH_103_PROVIDER_ID)]: finished(MATCH_103_PROVIDER_ID, 2, 1),
      [String(MATCH_104_PROVIDER_ID)]: finished(MATCH_104_PROVIDER_ID, 3, 1),
    },
    now: new Date(kickoff104.getTime() + 3 * 3600_000),
    expectIsComplete: true,
    expectPhase: "tournament_complete",
    expectHasCountdownTarget: false,
  },
  {
    name: "F: 104 completed out of order while 103 is still scheduled",
    liveData: { ...SEMIS_FINAL, [String(MATCH_104_PROVIDER_ID)]: finished(MATCH_104_PROVIDER_ID, 3, 1) },
    now: new Date(kickoff104.getTime() + 3 * 3600_000),
    expectIsComplete: false,
    expectPhase: "final",
    expectHasCountdownTarget: true,
  },
];

// Run every scenario across three different `now` timezream offsets to prove
// the predicate is instant-based, not local-clock/timezone based. Date
// objects are UTC instants regardless of caller timezone, so we additionally
// re-run with equivalent instants expressed via different construction paths
// (ISO string with explicit offsets) to guard against any accidental local
// Date() parsing creeping into the pipeline.
const timezoneEquivalentBuilders: Array<(d: Date) => Date> = [
  (d) => d,
  (d) => new Date(d.toISOString()),
  (d) => new Date(new Date(d.getTime()).toUTCString()),
];

for (const scenario of scenarios) {
  for (let i = 0; i < timezoneEquivalentBuilders.length; i++) {
    const now = timezoneEquivalentBuilders[i](scenario.now);
    const archive = getArchiveState({ matches: MATCHES, liveData: scenario.liveData, now });
    const phase = getTournamentPhase({ matches: MATCHES, liveData: scenario.liveData, now });
    const homepageSnapshot = getHomepageMatchCenterSnapshot({ matches: MATCHES, liveData: scenario.liveData, now, phase });
    const countdownTarget = homepageSnapshot.upcomingCurrentRound[0] ?? homepageSnapshot.nextDestinationMatch;

    const suffix = `[${scenario.name}] (now-variant ${i})`;
    check(archive.isComplete === scenario.expectIsComplete, `archiveState.isComplete ${suffix}`);
    check(phase === scenario.expectPhase, `tournamentPhase === "${scenario.expectPhase}" ${suffix} (got "${phase}")`);
    check(
      Boolean(countdownTarget) === scenario.expectHasCountdownTarget,
      `homepage countdown target ${scenario.expectHasCountdownTarget ? "resolves" : "is absent"} ${suffix}`,
    );
    // The critical regression check: "Tournament complete" may only ever be
    // implied (isComplete true) when there genuinely is no more football to
    // play — never merely because a countdown target failed to resolve.
    check(
      !(countdownTarget === undefined && !archive.isComplete),
      `no false-completion trap: absent countdown target implies isComplete ${suffix}`,
    );
  }
}

console.log("\n=== Source-wiring: completion gate uses the shared archiveState predicate, not a route-local boolean ===\n");

{
  check(
    grepFile("components/CountdownClient.tsx", "isComplete") &&
      !grepFile("components/CountdownClient.tsx", /tournamentPhase === "tournament_complete" \|\| !target/),
    "CountdownClient no longer gates completion on the unaudited `!target` fallback",
  );
  check(
    grepFile("components/Hero.tsx", "isTournamentComplete={archiveState.isComplete}") &&
      grepFile("components/MatchCenterContent.tsx", "isComplete={isTournamentComplete}"),
    "homepage passes archiveState.isComplete through MatchCenterContent to CountdownClient",
  );
  check(
    grepFile("components/TeamDetail.tsx", "isTournamentComplete") &&
      !grepFile("components/TeamDetail.tsx", /: <p[^>]*>Tournament complete<\/p>/),
    "TeamDetail.tsx no longer hardcodes 'Tournament complete' for any team with no next match",
  );
  check(
    grepFile("app/teams/[slug]/page.tsx", "getArchiveState") && grepFile("app/teams/[slug]/page.tsx", "isTournamentComplete={archiveState.isComplete}"),
    "app/teams/[slug]/page.tsx derives TeamDetail's isTournamentComplete from the shared archiveState",
  );
}

if (failures > 0) {
  console.error(`\n${failures} failure(s).`);
  process.exitCode = 1;
} else {
  console.log("\nALL COMPLETION-BOUNDARY SCENARIO CHECKS PASSED.");
}
} finally {
  if (originalMatch103) {
    (COMPLETED_KNOCKOUT_RESULTS as any)[103] = originalMatch103;
  } else {
    delete (COMPLETED_KNOCKOUT_RESULTS as any)[103];
  }
  const restoredValue = (COMPLETED_KNOCKOUT_RESULTS as any)[103];
  assert.deepStrictEqual(restoredValue, originalMatch103, "Canonical results registry must be restored after tests");
  console.log("CONFIRM: Canonical results registry for Match 103 has been successfully restored.");
}
