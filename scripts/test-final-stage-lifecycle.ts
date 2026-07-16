/**
 * Regression coverage for homepage/bracket behavior across every final-stage
 * lifecycle state: both semifinals complete (A), third-place complete only (B),
 * final complete only / out-of-order (C), and tournament complete (D).
 *
 * Pure-function tests only: exercises getTournamentPhase, getTournamentPhaseLabel,
 * getHomepageMatchCenterSnapshot and splitDestinationsByCompletion directly
 * against synthetic liveData overlays on the real MATCHES fixture list.
 */
import { MATCHES, ARCHIVE_DEFAULT_DATE, type Match } from "../lib/matches";
import {
  getTournamentPhase,
  getTournamentPhaseLabel,
  getHomepageMatchCenterSnapshot,
  splitDestinationsByCompletion,
} from "../lib/matchCenterSelection";
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

// Fixed instant strictly after both semifinals' canonical confirmedAt (101:
// 07-14T22:00Z, 102: 07-15T18:00Z) but strictly before Match 103's real
// kickoff (07-18). Using ARCHIVE_DEFAULT_DATE here would predate the
// confirmedAt gate for Match 101/102 and falsely report the semifinals as
// unresolved; a "now" past 07-18/07-19 would instead flip an untouched 103/104
// into "syncing" (started-but-no-data) rather than "scheduled". Production
// pages sidestep this either by supplying real archived liveData directly, or
// (bracket) by using the live snapshot's generatedAt instead of the frozen
// archive default.
const now = new Date("2026-07-16T00:00:00.000Z");

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

/**
 * Scenario A: both semifinals complete, 103/104 both scheduled (current production state).
 */
function scenarioA(): Record<string, LiveMatchData> {
  return {};
}

/** Scenario B: third-place complete, final scheduled. */
function scenarioB(): Record<string, LiveMatchData> {
  return { [String(MATCH_103_PROVIDER_ID)]: finished(MATCH_103_PROVIDER_ID, 2, 1) };
}

/** Scenario C: final complete, third-place still scheduled (out-of-order arrival). */
function scenarioC(): Record<string, LiveMatchData> {
  return { [String(MATCH_104_PROVIDER_ID)]: finished(MATCH_104_PROVIDER_ID, 3, 1) };
}

/** Scenario D: tournament complete — both 103 and 104 finished. */
function scenarioD(): Record<string, LiveMatchData> {
  return {
    [String(MATCH_103_PROVIDER_ID)]: finished(MATCH_103_PROVIDER_ID, 2, 1),
    [String(MATCH_104_PROVIDER_ID)]: finished(MATCH_104_PROVIDER_ID, 3, 1),
  };
}

function destinationsFor(liveData: Record<string, LiveMatchData>) {
  const phase = getTournamentPhase({ matches: MATCHES, liveData, now });
  const snapshot = getHomepageMatchCenterSnapshot({ matches: MATCHES, liveData, now, phase });
  return { phase, snapshot };
}

function rawMatchNumbersOf(matches: Match[] | undefined): number[] {
  return (matches ?? []).map((m) => ("matchNumber" in m ? m.matchNumber : -1));
}

function matchNumbersOf(matches: Match[] | undefined): number[] {
  return rawMatchNumbersOf(matches).sort((a, b) => a - b);
}

// --- Scenario A ---
{
  const { phase, snapshot } = destinationsFor(scenarioA());
  check(phase === "third_place", `Scenario A: phase is third_place (got ${phase})`);
  check(getTournamentPhaseLabel(phase) !== "Semifinals", "Scenario A: bracket phase label is not stale Semifinals");
  check(matchNumbersOf(snapshot.destinations) .join(",") === "103,104", "Scenario A: destinations contains Match 103 and 104");
  const split = splitDestinationsByCompletion({ destinations: snapshot.destinations ?? [], liveData: scenarioA(), now });
  check(split.completed.length === 0, "Scenario A: no placement match is misreported as completed");
  check(matchNumbersOf(split.upcoming).join(",") === "103,104", "Scenario A: both 103 and 104 are upcoming destinations");
}

// --- Scenario B: third-place completed, final scheduled ---
{
  const liveData = scenarioB();
  const { phase, snapshot } = destinationsFor(liveData);
  check(phase === "final", `Scenario B: phase is final (got ${phase})`);
  check(getTournamentPhaseLabel(phase) === "Final", "Scenario B: bracket phase truthfully prioritizes the Final");
  const split = splitDestinationsByCompletion({ destinations: snapshot.destinations ?? [], liveData, now });
  check(matchNumbersOf(split.completed).join(",") === "103", "Scenario B: Match 103 is classified as a completed placement result");
  check(matchNumbersOf(split.upcoming).join(",") === "104", "Scenario B: Match 104 remains the only upcoming destination");
  check(!matchNumbersOf(split.completed).includes(104), "Scenario B: Match 104 is not falsely marked complete");
}

// --- Scenario C: final completed, third-place still scheduled (unusual, out-of-order) ---
{
  const liveData = scenarioC();
  const { phase, snapshot } = destinationsFor(liveData);
  check(phase !== "tournament_complete", "Scenario C: tournament is not marked complete while Match 103 remains unresolved");
  const split = splitDestinationsByCompletion({ destinations: snapshot.destinations ?? [], liveData, now });
  check(matchNumbersOf(split.completed).join(",") === "104", "Scenario C: Match 104 (Final) is classified as completed");
  check(matchNumbersOf(split.upcoming).join(",") === "103", "Scenario C: Match 103 remains classified as upcoming, not stale");
  check(split.completed.length + split.upcoming.length === (snapshot.destinations ?? []).length, "Scenario C: no destination is duplicated or dropped across the split");
}

// --- Scenario D: tournament complete ---
{
  const liveData = scenarioD();
  const { phase, snapshot } = destinationsFor(liveData);
  check(phase === "tournament_complete", `Scenario D: phase is tournament_complete (got ${phase})`);
  check(getTournamentPhaseLabel(phase) !== "Third-place playoff", "Scenario D: bracket phase label is not stale Third-place playoff");
  check(getTournamentPhaseLabel(phase) === "Tournament Complete", "Scenario D: bracket phase label reads Tournament Complete");
  check(rawMatchNumbersOf(snapshot.destinations).join(",") === "104,103", "Scenario D: destinations exist for the completed placement matches, newest first");
  const split = splitDestinationsByCompletion({ destinations: snapshot.destinations ?? [], liveData, now });
  check(split.upcoming.length === 0, "Scenario D: no destination is left dangling as upcoming once the tournament is complete");
  check(matchNumbersOf(split.completed).join(",") === "103,104", "Scenario D: both placement matches are recognized as completed");
}

// --- No duplicate Match 103/104 across completed+previous rounds in any scenario ---
for (const [label, liveData] of Object.entries({ A: scenarioA(), B: scenarioB(), C: scenarioC(), D: scenarioD() })) {
  const { snapshot } = destinationsFor(liveData);
  const all = [
    ...matchNumbersOf(snapshot.completedPreviousRound),
    ...matchNumbersOf(snapshot.completedCurrentRound),
    ...matchNumbersOf(snapshot.upcomingCurrentRound),
    ...matchNumbersOf(snapshot.destinations),
  ];
  const counts103 = all.filter((n) => n === 103).length;
  const counts104 = all.filter((n) => n === 104).length;
  check(counts103 <= 1, `Scenario ${label}: Match 103 does not appear more than once across homepage sections`);
  check(counts104 <= 1, `Scenario ${label}: Match 104 does not appear more than once across homepage sections`);
}

// --- Required bracket phase truths across states ---
{
  // Both semifinals completed, 103/104 scheduled -> not Semifinals
  const { phase: phaseA } = destinationsFor(scenarioA());
  check(getTournamentPhaseLabel(phaseA) !== "Semifinals", "Bracket: both-semis-complete state is not labeled Semifinals");

  // Both 103/104 completed -> no stale Third-place playoff label
  const { phase: phaseD } = destinationsFor(scenarioD());
  check(getTournamentPhaseLabel(phaseD) !== "Third-place playoff", "Bracket: tournament-complete state has no stale Third-place playoff label");
}

if (failures > 0) {
  console.error(`\n${failures} failure(s).`);
  process.exitCode = 1;
} else {
  console.log("\nALL FINAL-STAGE LIFECYCLE CHECKS PASSED.");
}
