/**
 * Live-polling transition regression test.
 *
 * isLiveOrImminent must be evaluated against the *current* live-data snapshot
 * and clock, not a stale initial value, so polling:
 *  - starts when the page loads with a match scheduled within 15 minutes of kickoff,
 *  - keeps running once a poll response flips that match to IN_PLAY,
 *  - stops once the clock advances past kickoff + 15 minutes for a finished match.
 *
 * Usage:
 *   npx tsx scripts/test-live-polling-transition.ts
 */

import { isLiveOrImminent } from "../components/TodayMatches";
import { MATCHES, matchUtcDate, type Match } from "../lib/matches";
import type { LiveMatchData } from "../lib/liveMatchData";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  PASS  ${msg}`);
    passed++;
  } else {
    console.error(`  FAIL  ${msg}`);
    failed++;
  }
}

console.log("=== Live polling transition test ===\n");

const match = MATCHES.find((m) => m.providerIds?.footballData);
assert(Boolean(match), "at least one fixture has a footballData providerId to test");

if (match) {
  const m = match as Match;
  const providerId = String(m.providerIds!.footballData!);
  const kickoffMs = matchUtcDate(m).getTime();

  function scheduledLive(overrides: Partial<LiveMatchData> = {}): LiveMatchData {
    return {
      provider: "football-data.org",
      providerMatchId: m.providerIds!.footballData!,
      status: "SCHEDULED",
      homeScore: null,
      awayScore: null,
      winner: null,
      utcDate: matchUtcDate(m).toISOString(),
      lastSyncedAt: new Date().toISOString(),
      rawStatus: "SCHEDULED",
      eventDataAvailable: false,
      goalEventCompleteness: { expectedGoalCount: 0, normalizedGoalEventCount: 0, missingGoalEventCount: 0, isGoalEventDataComplete: true, completenessReason: "complete" },
      goals: [],
      ...overrides,
    };
  }

  // --- Step 1: page loads while match is scheduled and within 15 minutes of kickoff ---
  const initialLiveData: Record<string, LiveMatchData> = { [providerId]: scheduledLive() };
  const tNearKickoff = kickoffMs - 10 * 60 * 1000; // 10 minutes before kickoff
  assert(
    isLiveOrImminent([m], initialLiveData, tNearKickoff) === true,
    "polling is active when loaded 10 minutes before kickoff (still SCHEDULED)",
  );

  // --- Step 2: a later API response flips the match to IN_PLAY ---
  const inPlayLiveData: Record<string, LiveMatchData> = {
    [providerId]: scheduledLive({ status: "IN_PLAY", rawStatus: "IN_PLAY", homeScore: 0, awayScore: 0 }),
  };
  const tAtKickoff = kickoffMs + 5 * 60 * 1000; // 5 minutes after kickoff
  assert(
    isLiveOrImminent([m], inPlayLiveData, tAtKickoff) === true,
    "polling stays active once the snapshot flips the match to IN_PLAY",
  );

  // --- Step 3: clock advances past kickoff + 15 minutes, match remains scheduled-shaped data stale but not live ---
  const tFarPastKickoff = kickoffMs + 20 * 60 * 1000; // 20 minutes after kickoff
  const finishedLiveData: Record<string, LiveMatchData> = {
    [providerId]: scheduledLive({ status: "FINISHED", rawStatus: "FINISHED", homeScore: 2, awayScore: 1 }),
  };
  assert(
    isLiveOrImminent([m], finishedLiveData, tFarPastKickoff) === false,
    "polling stops once the match is FINISHED and the clock is past kickoff + 15 minutes",
  );

  // --- Sanity: far from kickoff and not live -> not imminent ---
  const tFarBefore = kickoffMs - 60 * 60 * 1000; // 1 hour before kickoff
  assert(
    isLiveOrImminent([m], initialLiveData, tFarBefore) === false,
    "polling is inactive when more than 15 minutes before kickoff and not live",
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
