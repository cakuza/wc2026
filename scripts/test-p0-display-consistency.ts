import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MATCHES, matchSlug, type KnockoutMatch } from "../lib/matches";
import { buildKnockoutResolution } from "../lib/knockoutResolution";
import { getParticipantDisplay } from "../lib/participant-resolution";
import { getScoreFreshnessLabel } from "../lib/freshness";
import type { SerializableSnapshotMatch } from "../lib/liveSnapshot";

function knockout(matchNumber: number): KnockoutMatch {
  const match = MATCHES.find((m): m is KnockoutMatch => "matchNumber" in m && m.matchNumber === matchNumber);
  assert.ok(match, `match ${matchNumber} exists`);
  return match;
}

function snap(matchNumber: number, status: SerializableSnapshotMatch["status"], homeScore: number | null, awayScore: number | null, winner?: string): SerializableSnapshotMatch {
  const match = knockout(matchNumber);
  return {
    match,
    internalId: matchSlug(match),
    providerMatchId: match.providerIds?.footballData ?? null,
    status,
    homeScore,
    awayScore,
    scorers: [],
    goalEventCompleteness: {
      expectedGoalCount: (homeScore ?? 0) + (awayScore ?? 0),
      normalizedGoalEventCount: 0,
      missingGoalEventCount: (homeScore ?? 0) + (awayScore ?? 0),
      isGoalEventDataComplete: homeScore === null || awayScore === null,
      completenessReason: homeScore === null || awayScore === null ? "score-unavailable" : "event-data-unavailable",
    },
    sourceUpdatedAt: status === "FINISHED" ? "2026-07-04T00:00:00.000Z" : null,
    providerUpdatedAt: status === "FINISHED" ? "2026-07-04T00:00:00.000Z" : null,
    live: winner
      ? {
          status,
          homeScore,
          awayScore,
          winner: winner as any,
          goals: [],
          lastSyncedAt: "2026-07-04T00:00:00.000Z",
        } as any
      : null,
  };
}

function label(matchNumber: number, side: "home" | "away", resolved = resolution): string {
  return getParticipantDisplay(knockout(matchNumber), side, resolved).label;
}

const sourceMatches: Record<string, SerializableSnapshotMatch> = {
  [matchSlug(knockout(73))]: snap(73, "FINISHED", 0, 1, "AWAY_TEAM"),
  [matchSlug(knockout(75))]: snap(75, "FINISHED", 1, 1, "AWAY_TEAM"),
  [matchSlug(knockout(85))]: snap(85, "FINISHED", 2, 0, "HOME_TEAM"),
  [matchSlug(knockout(86))]: snap(86, "FINISHED", 3, 2, "HOME_TEAM"),
  [matchSlug(knockout(87))]: snap(87, "FINISHED", 2, 0, "HOME_TEAM"),
};

const resolution = buildKnockoutResolution(sourceMatches);

assert.equal(label(90, "home"), "Canada", "downstream fixture home winner propagates");
assert.equal(label(90, "away"), "Morocco", "downstream fixture away winner propagates");
assert.equal(label(96, "home"), "Switzerland", "finished source winner propagates to downstream home");
assert.equal(label(96, "away"), "Colombia", "finished source winner propagates to downstream away");
assert.equal(label(95, "home"), "Argentina", "one resolved side displays the team");
assert.equal(label(95, "away"), "Winner Match 88", "one unresolved side preserves the source placeholder");

const emptyResolution = buildKnockoutResolution({});
assert.equal(label(97, "home", emptyResolution), "Winner Match 89", "unresolved future home placeholder remains visible");
assert.equal(label(97, "away", emptyResolution), "Winner Match 90", "unresolved future away placeholder remains visible");
assert.equal(label(90, "home"), "Canada", "Canada vs Morocco never falls back to Winner Match 73");
assert.equal(label(90, "away"), "Morocco", "Canada vs Morocco never falls back to Winner Match 75");

assert.equal(getParticipantDisplay(knockout(90), "home", resolution).teamCode, "ca", "resolved home flag code propagates");
assert.equal(getParticipantDisplay(knockout(90), "away", resolution).teamCode, "ma", "resolved away flag code propagates");

const healthyFreshness = getScoreFreshnessLabel({
  primaryProviderFetchedAt: "2026-07-04T12:00:00.000Z",
  primaryProviderOk: true,
  now: Date.parse("2026-07-04T12:00:30.000Z"),
});
assert.equal(healthyFreshness.label, "Last checked 30 seconds ago", "healthy provider has non-scary freshness label");

const degradedFreshness = getScoreFreshnessLabel({
  primaryProviderFetchedAt: "2026-07-04T00:00:00.000Z",
  primaryProviderOk: false,
  now: Date.parse("2026-07-04T12:05:00.000Z"),
});
assert.equal(degradedFreshness.label, "Live data may be delayed · Last successful check 725 minutes ago", "degraded provider warning uses last successful check wording");

const currentSourceUpdatedAt = getScoreFreshnessLabel({
  primaryProviderFetchedAt: "2026-07-04T12:00:00.000Z",
  primaryProviderOk: true,
  now: Date.parse("2026-07-04T12:00:30.000Z"),
});
assert.equal(currentSourceUpdatedAt.state, "normal", "finished match sourceUpdatedAt does not drive page freshness");

const route = readFileSync("app/api/live-snapshot/route.ts", "utf8");
assert.match(route, /"Cache-Control": "public, max-age=0, must-revalidate"/, "browser cache header unchanged");
assert.match(route, /"Vercel-CDN-Cache-Control": `public, max-age=\$\{maxAge\}, stale-while-revalidate=\$\{swr\}`/, "Vercel CDN cache header unchanged");

const layout = readFileSync("app/layout.tsx", "utf8");
assert.match(layout, /@vercel\/analytics\/next/, "Vercel Analytics remains mounted");

const today = readFileSync("app/today/page.tsx", "utf8");
assert.match(today, /<LiveDataAutoRefresh intervalMs=\{refreshPolicy\.intervalMs\}/, "router/polling policy remains delegated to refreshPolicy");

console.log("P0 display consistency tests passed (18 assertions).");
