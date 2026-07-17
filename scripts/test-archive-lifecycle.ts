/**
 * Regression coverage for lib/archiveLifecycle.ts and lib/archiveDates.ts:
 * champion/final/third-place derivation, as-of-date cumulative totals, and
 * date-page resolution gating. Complements scripts/test-final-stage-lifecycle.ts
 * (which covers the underlying tournament-phase machinery) rather than
 * duplicating it.
 */
import { MATCHES, ARCHIVE_DEFAULT_DATE, type Match } from "../lib/matches";
import { getArchiveState, getStatsAsOfDate, matchesOnDate, isDateFullyResolved, liveDataAsOfDate } from "../lib/archiveLifecycle";
import { CANDIDATE_ARCHIVE_DATES } from "../lib/archiveDates";
import { computeTopScorers } from "../lib/tournamentStats";
import type { LiveMatchData } from "../lib/liveMatchData";

let failures = 0;
function check(condition: boolean, message: string): void {
  if (condition) {
    console.log(`PASS ${message}`);
  } else {
    console.error(`FAIL ${message}`);
    failures += 1;
  }
}

// Fixed instant strictly after both semifinals' confirmedAt but before Match
// 103's kickoff — matches the convention in test-final-stage-lifecycle.ts.
const nowBeforePlacement = new Date("2026-07-16T00:00:00.000Z");
const nowAfterEverything = new Date("2026-07-20T00:00:00.000Z");

const MATCH_103_PROVIDER_ID = 537389;
const MATCH_104_PROVIDER_ID = 537390;

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

// --- getArchiveState: incomplete (current production state) ---
{
  const state = getArchiveState({ matches: MATCHES, liveData: {}, now: nowBeforePlacement });
  check(state.isComplete === false, "getArchiveState: incomplete before 103/104 play");
  check(state.champion === null, "getArchiveState: no champion before completion");
  check(state.finalResult === null, "getArchiveState: no final result before Match 104 plays");
}

// --- getArchiveState: complete ---
{
  const liveData: Record<string, LiveMatchData> = {
    [String(MATCH_103_PROVIDER_ID)]: finished(MATCH_103_PROVIDER_ID, 2, 1),
    [String(MATCH_104_PROVIDER_ID)]: finished(MATCH_104_PROVIDER_ID, 3, 1),
  };
  const state = getArchiveState({ matches: MATCHES, liveData, now: nowAfterEverything });
  check(state.isComplete === true, "getArchiveState: complete once both 103 and 104 are final");
  check(state.champion !== null, "getArchiveState: champion resolved once complete");
  check(state.champion === state.finalResult?.winnerLabel, "getArchiveState: champion matches the Final's winner");
  check(state.runnerUp === state.finalResult?.loserLabel, "getArchiveState: runner-up matches the Final's loser");
  check(state.thirdPlace === state.thirdPlaceResult?.winnerLabel, "getArchiveState: third place matches the playoff's winner");
  check(state.fourthPlace === state.thirdPlaceResult?.loserLabel, "getArchiveState: fourth place matches the playoff's loser");
}

// --- getArchiveState: final decided by penalty shootout (score tied) still resolves a winner via live.winner ---
{
  const liveData: Record<string, LiveMatchData> = {
    [String(MATCH_104_PROVIDER_ID)]: {
      provider: "football-data.org",
      providerMatchId: MATCH_104_PROVIDER_ID,
      status: "FINISHED",
      homeScore: 1,
      awayScore: 1,
      winner: "AWAY_TEAM", // decided on penalties despite a level score
      lastSyncedAt: ARCHIVE_DEFAULT_DATE,
      eventDataAvailable: true,
    },
  };
  const state = getArchiveState({ matches: MATCHES, liveData, now: nowAfterEverything });
  check(state.finalResult?.winnerLabel === state.finalResult?.awayLabel, "getArchiveState: penalty-shootout winner uses live.winner, not raw score comparison");
}

// --- getStatsAsOfDate: cumulative totals never leak future matches ---
{
  const early = getStatsAsOfDate({ liveData: {}, cutoffDateStr: "2026-06-11" });
  check(early.matchesPlayed === 0, "getStatsAsOfDate: zero matches played as of opening day with no live data supplied");

  const liveData: Record<string, LiveMatchData> = {
    [String(MATCH_103_PROVIDER_ID)]: finished(MATCH_103_PROVIDER_ID, 2, 1),
    [String(MATCH_104_PROVIDER_ID)]: finished(MATCH_104_PROVIDER_ID, 3, 1),
  };
  const beforeFinal = getStatsAsOfDate({ liveData, cutoffDateStr: "2026-07-17" });
  check(beforeFinal.matchesPlayed === 0, "getStatsAsOfDate: Match 103/104 results excluded from a cutoff date before they were played");

  const afterThird = getStatsAsOfDate({ liveData, cutoffDateStr: "2026-07-18" });
  check(afterThird.matchesPlayed === 1 && afterThird.totalGoals === 3, "getStatsAsOfDate: only Match 103 counted as of its own date (2 + 1 goals)");

  const afterFinal = getStatsAsOfDate({ liveData, cutoffDateStr: "2026-07-19" });
  check(afterFinal.matchesPlayed === 2 && afterFinal.totalGoals === 7, "getStatsAsOfDate: both placement matches counted once the Final's date is reached (3+1 goals added)");
}

// --- liveDataAsOfDate feeds computeTopScorers consistently with getStatsAsOfDate ---
{
  const liveData: Record<string, LiveMatchData> = {
    [String(MATCH_104_PROVIDER_ID)]: {
      ...finished(MATCH_104_PROVIDER_ID, 2, 1),
      goals: [{ type: "GOAL", minute: 10, teamName: "Spain", playerName: "Test Scorer" }],
    },
  };
  const filtered = liveDataAsOfDate({ liveData, cutoffDateStr: "2026-07-18" });
  check(filtered.size === 0, "liveDataAsOfDate: Match 104 excluded before its own date");
  const scorersBeforeFinal = computeTopScorers(filtered);
  check(scorersBeforeFinal.length === 0, "computeTopScorers on liveDataAsOfDate: no scorers before the Final's date");
}

// --- matchesOnDate ---
{
  check(matchesOnDate("2026-06-11").length === 2, "matchesOnDate: two matches on opening day, including the opener");
  check(matchesOnDate("2026-06-11").some((m) => "opener" in m && m.opener === true), "matchesOnDate: opening day includes the designated opener match");
  check(matchesOnDate("2026-07-12").length === 0, "matchesOnDate: zero matches on the QF/SF rest day (2026-07-12)");
  check(matchesOnDate("2026-07-19").length === 1, "matchesOnDate: exactly one match on Final day");
}

// --- isDateFullyResolved handles rest days via cumulative resolution, not same-day matches ---
{
  const liveDataThroughQF: Record<string, LiveMatchData> = {}; // 101/102 resolve via canonical fallback once "now" is late enough
  const now = new Date("2026-07-13T00:00:00.000Z"); // after QFs (07-11), before SFs (07-14)
  check(
    isDateFullyResolved({ date: "2026-07-12", liveData: liveDataThroughQF, now }),
    "isDateFullyResolved: rest day (2026-07-12, zero matches of its own) resolves once everything up to it is final"
  );
  check(
    !isDateFullyResolved({ date: "2026-07-19", liveData: liveDataThroughQF, now }),
    "isDateFullyResolved: Final's date is not resolved while the Final hasn't been played"
  );
}

// --- CANDIDATE_ARCHIVE_DATES sanity: fixed, deliberately short list, chronologically sorted ---
{
  check(CANDIDATE_ARCHIVE_DATES.length > 0 && CANDIDATE_ARCHIVE_DATES.length <= 20, "CANDIDATE_ARCHIVE_DATES: deliberately short list, not mass-generated");
  const sorted = [...CANDIDATE_ARCHIVE_DATES].sort();
  check(JSON.stringify(sorted) === JSON.stringify(CANDIDATE_ARCHIVE_DATES), "CANDIDATE_ARCHIVE_DATES: chronologically ordered");
  check(new Set(CANDIDATE_ARCHIVE_DATES).size === CANDIDATE_ARCHIVE_DATES.length, "CANDIDATE_ARCHIVE_DATES: no duplicate dates");
  for (const date of CANDIDATE_ARCHIVE_DATES) {
    check(/^\d{4}-\d{2}-\d{2}$/.test(date), `CANDIDATE_ARCHIVE_DATES: ${date} is a valid YYYY-MM-DD string`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} failure(s).`);
  process.exitCode = 1;
} else {
  console.log("\nALL ARCHIVE LIFECYCLE CHECKS PASSED.");
}
