/**
 * Score/event reconciliation regression test.
 *
 * The primary provider is authoritative for status/home score/away score.
 * The secondary provider supplies scorer enrichment only. The shared
 * `reconcileGoalEvents` helper (used by both TodayMatches and MatchDetail)
 * must never let the rendered confirmed goal-event count exceed the
 * authoritative score *per side* — a global total cap is not enough, since
 * that can render an impossible result (e.g. an away goal under a 1-0 score).
 *
 * Usage:
 *   npx tsx scripts/test-score-reconciliation.ts
 */

import { reconcileGoalEvents, isMatchPollingActive } from "../lib/scoreReconciliation";
import { snapshotStatusToDisplay } from "../components/MatchDetail";
import type { GoalScorerEvent } from "../lib/worldcup26Provider";

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

console.log("=== Score/event reconciliation test ===\n");

const HOME = "Home Team";
const AWAY = "Away Team";

function scorer(minute: number, playerName: string, teamName: string, overrides: Partial<GoalScorerEvent> = {}): GoalScorerEvent {
  return {
    type: "GOAL",
    minute,
    teamName,
    playerName,
    provider: "worldcup26.ir",
    confidence: "high",
    ...overrides,
  };
}

function reconcile(homeScore: number | null, awayScore: number | null, events: GoalScorerEvent[]) {
  return reconcileGoalEvents({ homeScore, awayScore, homeTeamName: HOME, awayTeamName: AWAY, events });
}

// --- Case: primary 1-0, secondary returns two goal events (capped total) ---
{
  const events = [scorer(10, "A. Scorer", HOME), scorer(75, "B. Scorer", HOME)];
  const { confirmedEvents, scorerDetailsIncomplete, withheldCount } = reconcile(1, 0, events);
  assert(confirmedEvents.length === 1, "1-0 with two home secondary events renders only one confirmed goal");
  assert(confirmedEvents[0]?.playerName === "A. Scorer", "the earliest event is the confirmed one");
  assert(scorerDetailsIncomplete === false, "1-0 with one confirmed home event is not flagged incomplete");
  assert(withheldCount === 1, "the extra ahead-of-score event is withheld, not rendered");
}

// --- Case: primary 2-0, secondary returns one goal event -------------------
{
  const events = [scorer(20, "A. Scorer", HOME)];
  const { confirmedEvents, scorerDetailsIncomplete, homeScorerDetailsIncomplete, withheldCount } = reconcile(2, 0, events);
  assert(confirmedEvents.length === 1, "2-0 with one secondary event renders that one confirmed goal");
  assert(scorerDetailsIncomplete === true, "2-0 with one confirmed event is flagged scorer-details-incomplete");
  assert(homeScorerDetailsIncomplete === true, "the home side specifically is flagged incomplete");
  assert(withheldCount === 0, "no events are withheld when fewer events than score exist");
}

// --- Case: secondary provider unavailable (no events) ----------------------
{
  const { confirmedEvents, scorerDetailsIncomplete } = reconcile(1, 1, []);
  assert(confirmedEvents.length === 0, "no events to render when secondary provider is unavailable");
  assert(scorerDetailsIncomplete === true, "score with goals but no events is flagged scorer-details-incomplete");
}

// --- Case: score and events are exactly aligned ----------------------------
{
  const events = [scorer(10, "A. Scorer", HOME), scorer(50, "B. Scorer", AWAY)];
  const { confirmedEvents, scorerDetailsIncomplete, withheldCount } = reconcile(1, 1, events);
  assert(confirmedEvents.length === 2, "1-1 with exactly two events (one per side) renders both");
  assert(scorerDetailsIncomplete === false, "exact match is not flagged incomplete");
  assert(withheldCount === 0, "exact match withholds nothing");
}

// --- Case: score unavailable (null) -----------------------------------------
{
  const { confirmedEvents, scorerDetailsIncomplete, withheldCount } = reconcile(null, null, [scorer(10, "A. Scorer", HOME)]);
  assert(confirmedEvents.length === 0, "no score available -> no confirmed events rendered");
  assert(scorerDetailsIncomplete === false, "no score available is not flagged incomplete (nothing to compare against)");
  assert(withheldCount === 0, "no score available withholds nothing");
}

// ============================================================================
// Adversarial per-side cap tests
// ============================================================================

// --- 1. 1-0, away event arrives chronologically before home event ----------
{
  const events = [scorer(5, "Away Scorer", AWAY), scorer(60, "Home Scorer", HOME)];
  const { confirmedEvents, withheldCount, unresolvedCount, awayScorerDetailsIncomplete } = reconcile(1, 0, events);
  assert(confirmedEvents.length === 1, "1-0: only one event is rendered despite two arriving");
  assert(confirmedEvents[0]?.playerName === "Home Scorer", "1-0: the home event is rendered, not the earlier away event");
  assert(withheldCount === 1, "1-0: the away event (awayScore=0) is withheld, not rendered");
  assert(unresolvedCount === 0, "1-0: both events have resolvable sides");
  assert(awayScorerDetailsIncomplete === false, "1-0: away side has 0 expected and 0 confirmed -> not incomplete");
}

// --- 2. 0-1, home event arrives chronologically before away event ----------
{
  const events = [scorer(5, "Home Scorer", HOME), scorer(60, "Away Scorer", AWAY)];
  const { confirmedEvents, withheldCount, homeScorerDetailsIncomplete } = reconcile(0, 1, events);
  assert(confirmedEvents.length === 1, "0-1: only one event is rendered despite two arriving");
  assert(confirmedEvents[0]?.playerName === "Away Scorer", "0-1: the away event is rendered, not the earlier home event");
  assert(withheldCount === 1, "0-1: the home event (homeScore=0) is withheld, not rendered");
  assert(homeScorerDetailsIncomplete === false, "0-1: home side has 0 expected and 0 confirmed -> not incomplete");
}

// --- 3. 2-1 with three home events and one away event -----------------------
{
  const events = [
    scorer(10, "Home A", HOME),
    scorer(30, "Away A", AWAY),
    scorer(50, "Home B", HOME),
    scorer(80, "Home C", HOME),
  ];
  const { confirmedEvents, withheldCount, scorerDetailsIncomplete } = reconcile(2, 1, events);
  assert(confirmedEvents.length === 3, "2-1: exactly three events are confirmed (2 home + 1 away)");
  assert(
    confirmedEvents.filter((e) => e.teamName === HOME).length === 2,
    "2-1: exactly two home events confirmed",
  );
  assert(
    confirmedEvents.filter((e) => e.teamName === AWAY).length === 1,
    "2-1: exactly one away event confirmed",
  );
  assert(
    confirmedEvents.map((e) => e.playerName).join(",") === "Home A,Away A,Home B",
    "2-1: chronological order is preserved among confirmed events",
  );
  assert(withheldCount === 1, "2-1: the third home event beyond homeScore=2 is withheld");
  assert(scorerDetailsIncomplete === false, "2-1: both sides fully accounted for");
}

// --- 4. 1-1 with only two home events ---------------------------------------
{
  const events = [scorer(10, "Home A", HOME), scorer(70, "Home B", HOME)];
  const { confirmedEvents, homeScorerDetailsIncomplete, awayScorerDetailsIncomplete, scorerDetailsIncomplete, withheldCount } = reconcile(1, 1, events);
  assert(confirmedEvents.length === 1, "1-1 with two home events: only one (the first) home event is confirmed");
  assert(confirmedEvents[0]?.playerName === "Home A", "1-1: the earlier home event is the confirmed one");
  assert(homeScorerDetailsIncomplete === false, "1-1: home side fully accounted for (1 confirmed of 1)");
  assert(awayScorerDetailsIncomplete === true, "1-1: away side scorer is missing/incomplete");
  assert(scorerDetailsIncomplete === true, "1-1: overall incomplete due to missing away scorer");
  assert(withheldCount === 1, "1-1: the second home event is withheld (home cap reached)");
}

// --- 5. Own goal credited to the opposing scoreboard side --------------------
{
  // An own goal by the away team's player is credited to the HOME side on the
  // scoreboard — teamName must reflect the *credited* side (post-normalization),
  // which is how scorersFromWorldcupGame / toLiveGoalEvent already produce it.
  const events = [scorer(15, "Away Defender", HOME, { isOwnGoal: true })];
  const { confirmedEvents, homeScorerDetailsIncomplete } = reconcile(1, 0, events);
  assert(confirmedEvents.length === 1, "own goal credited to home renders as a home-side confirmed event");
  assert(confirmedEvents[0]?.isOwnGoal === true, "own-goal flag is preserved");
  assert(homeScorerDetailsIncomplete === false, "home side is fully accounted for by the own goal");
}

// --- 6. Event with unresolved team/side attribution ---------------------------
{
  const events = [scorer(10, "Mystery Scorer", "Some Other Team"), scorer(40, "Home A", HOME)];
  const { confirmedEvents, unresolvedCount, homeScorerDetailsIncomplete } = reconcile(1, 0, events);
  assert(confirmedEvents.length === 1, "unresolved-side event is withheld; only the resolvable home event is confirmed");
  assert(confirmedEvents[0]?.playerName === "Home A", "the resolvable home event is the confirmed one");
  assert(unresolvedCount === 1, "the unresolved-side event is counted as unresolved");
  assert(homeScorerDetailsIncomplete === false, "home side is fully accounted for despite the unresolved event");
}

// --- 7. Excess secondary event becomes renderable after score increases ------
{
  const events = [scorer(5, "Home A", HOME), scorer(40, "Home B", HOME)];
  const before = reconcile(1, 0, events);
  assert(before.confirmedEvents.length === 1, "before score update: only one home event confirmed");
  assert(before.withheldCount === 1, "before score update: the second home event is withheld");

  const after = reconcile(2, 0, events);
  assert(after.confirmedEvents.length === 2, "after score increases to 2-0: both home events become confirmed");
  assert(after.withheldCount === 0, "after score update: nothing withheld");
  assert(
    after.confirmedEvents.map((e) => e.playerName).join(",") === "Home A,Home B",
    "after score update: chronological order is preserved",
  );
}

// --- 8. Stable ordering preserved after per-side filtering --------------------
{
  // Two home goals at the same minute (tie on sort key) — original relative
  // order must be preserved.
  const events = [
    scorer(30, "Home First", HOME),
    scorer(30, "Home Second", HOME),
    scorer(60, "Away A", AWAY),
  ];
  const { confirmedEvents } = reconcile(2, 1, events);
  assert(confirmedEvents.length === 3, "all three events confirmed for 2-1");
  assert(
    confirmedEvents.map((e) => e.playerName).join(",") === "Home First,Home Second,Away A",
    "tied-minute home events retain their original relative order",
  );
}

// --- isMatchPollingActive ----------------------------------------------------
const now = Date.now();
assert(isMatchPollingActive("LIVE", now - 60 * 60 * 1000, now) === true, "LIVE status keeps polling active regardless of kickoff time");
assert(isMatchPollingActive("HALFTIME", now - 60 * 60 * 1000, now) === true, "HALFTIME status keeps polling active");
assert(isMatchPollingActive("SYNCING", now - 60 * 60 * 1000, now) === true, "SYNCING status keeps polling active");
assert(isMatchPollingActive("SCHEDULED", now + 10 * 60 * 1000, now) === true, "SCHEDULED within 15 minutes of kickoff is polling-active");
assert(isMatchPollingActive("SCHEDULED", now + 60 * 60 * 1000, now) === false, "SCHEDULED far from kickoff is not polling-active");
assert(isMatchPollingActive("FINISHED", now - 60 * 60 * 1000, now) === false, "FINISHED long after kickoff stops polling");
assert(isMatchPollingActive("FINISHED", now - 5 * 60 * 1000, now) === true, "FINISHED within 15 minutes of kickoff still polls briefly");

// --- snapshotStatusToDisplay mapping (shared by MatchDetail) ----------------
assert(snapshotStatusToDisplay("SCHEDULED") === "upcoming", "SCHEDULED maps to upcoming");
assert(snapshotStatusToDisplay("LIVE") === "live", "LIVE maps to live");
assert(snapshotStatusToDisplay("HALFTIME") === "halftime", "HALFTIME maps to halftime");
assert(snapshotStatusToDisplay("FINISHED") === "finished", "FINISHED maps to finished");
assert(snapshotStatusToDisplay("SYNCING") === "syncing", "SYNCING maps to syncing");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
