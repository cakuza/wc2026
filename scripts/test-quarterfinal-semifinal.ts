import assert from "node:assert/strict";
import events from "../data/archive/match-events.json";
import stats from "../data/archive/match-stats.json";
import { COMPLETED_KNOCKOUT_RESULTS } from "../lib/canonicalMatchResults";
import { getHomepageMatchCenterSnapshot, getTournamentPhase } from "../lib/matchCenterSelection";
import { matchUtcDate, MATCHES } from "../lib/matches";
import { buildKnockoutResolution } from "../lib/knockoutResolution";

const now = new Date("2026-07-12T12:00:00Z");
const result99 = COMPLETED_KNOCKOUT_RESULTS[99];
const result100 = COMPLETED_KNOCKOUT_RESULTS[100];

assert.deepEqual(result99.regularTimeScore, { home: 1, away: 1 });
assert.equal(result99.homeScore, 1);
assert.equal(result99.awayScore, 2);
assert.equal(result99.scoreDuration, "EXTRA_TIME");
assert.equal(result99.penaltyShootoutScore, undefined);
assert.deepEqual(result100.regularTimeScore, { home: 1, away: 1 });
assert.equal(result100.homeScore, 3);
assert.equal(result100.awayScore, 1);
assert.equal(result100.scoreDuration, "EXTRA_TIME");
assert.equal(result100.penaltyShootoutScore, undefined);

const match99Events = events.filter((event) => event.matchId === "match-99");
const match100Events = events.filter((event) => event.matchId === "match-100");
assert.equal(match99Events.filter((event) => event.eventType.includes("goal")).length, 3);
assert.equal(match100Events.filter((event) => event.eventType.includes("goal")).length, 4);
assert.equal(match99Events.some((event) => event.eventType.includes("shootout")), false);
assert.equal(match100Events.some((event) => event.eventType.includes("shootout")), false);
assert(match100Events.some((event) => event.eventType === "second_yellow" && event.playerName === "Breel Embolo"));
assert.equal(new Set([...match99Events, ...match100Events].map((event) => event.id)).size, match99Events.length + match100Events.length);
assert(stats.some((row) => row.matchId === "match-99"));
assert(stats.some((row) => row.matchId === "match-100"));

const liveData: Record<string, any> = {};
const phase = getTournamentPhase({ matches: MATCHES, liveData, now });
assert.equal(phase, "semifinals");
const homepage = getHomepageMatchCenterSnapshot({ matches: MATCHES, liveData, now, phase });
assert.deepEqual(homepage.completedPreviousRound.map((match) => "matchNumber" in match ? match.matchNumber : null), [97, 98, 99, 100]);
assert.deepEqual(homepage.upcomingCurrentRound.map((match) => "matchNumber" in match ? match.matchNumber : null), [101, 102]);
assert.equal(matchUtcDate(homepage.upcomingCurrentRound[0]).toISOString(), "2026-07-14T19:00:00.000Z");

const matches: Record<string, any> = {};
for (const match of MATCHES) {
  if (!("matchNumber" in match)) continue;
  const result = COMPLETED_KNOCKOUT_RESULTS[match.matchNumber];
  matches[`match-${match.matchNumber}`] = {
    match,
    status: result ? "FINISHED" : "SCHEDULED",
    homeScore: result?.homeScore ?? null,
    awayScore: result?.awayScore ?? null,
    live: result ? { winner: result.winner, status: "FINISHED" } : undefined,
  };
}
const resolved = buildKnockoutResolution(matches);
assert.equal(resolved[102]?.home?.teamKey, "england");
assert.equal(resolved[102]?.away?.teamKey, "argentina");

console.log("Quarterfinal semifinal regression passed.");
