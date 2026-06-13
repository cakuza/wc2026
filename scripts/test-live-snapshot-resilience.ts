/**
 * Live snapshot resilience + freshness regression test (Parts 2, 5, 9).
 *
 * Covers:
 *  - buildTournamentLiveSnapshot never throws when a provider returns nothing,
 *    and reports primaryProviderOk/secondaryProviderOk accordingly.
 *  - generatedAt always advances even when both providers are unavailable
 *    (it is taken from the caller's clock, not from provider payloads).
 *  - snapshotId changes when match state changes, and stays stable when it doesn't.
 *  - score data can be present before scorer metadata ("syncing" goalEventCompleteness).
 *  - freshness thresholds (normal / updating / stale) match Part 5/3's
 *    30-60s / 90-180s / >180s targets.
 *
 * Usage:
 *   npx tsx scripts/test-live-snapshot-resilience.ts
 */

import { buildTournamentLiveSnapshot } from "../lib/liveSnapshot";
import { MATCHES, matchSlug } from "../lib/matches";
import type { LiveMatchData } from "../lib/liveMatchData";
import { formatRelativeAge, getFreshnessState } from "../lib/freshness";

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

async function main() {
  console.log("=== Live snapshot resilience + freshness test ===\n");

  // --- Both providers empty: must not throw, must report providers down, generatedAt still advances ---
  const t0 = new Date("2026-06-14T01:32:00.000Z").toISOString();
  const emptySnapshot = await buildTournamentLiveSnapshot({
    liveData: new Map(),
    worldcupGames: null,
    generatedAt: t0,
  });
  assert(emptySnapshot.generatedAt === t0, "generatedAt is taken from the caller's clock even with no provider data");
  assert(emptySnapshot.primaryProviderOk === false, "primaryProviderOk is false when liveData is empty");
  assert(emptySnapshot.secondaryProviderOk === false, "secondaryProviderOk is false when worldcupGames is null");
  assert(Object.keys(emptySnapshot.matches).length === MATCHES.length, "snapshot still contains an entry for every match");

  // --- Live match with a score but no scorer metadata yet ("score before scorer") ---
  const liveMatch = MATCHES.find((m) => m.providerIds?.footballData);
  assert(Boolean(liveMatch), "at least one match has a footballData providerId");

  if (liveMatch) {
    const providerId = liveMatch.providerIds!.footballData!;
    const t1 = new Date("2026-06-14T01:35:00.000Z").toISOString();
    const liveData = new Map<number, LiveMatchData>([
      [
        providerId,
        {
          provider: "football-data.org",
          providerMatchId: providerId,
          status: "IN_PLAY",
          homeScore: 1,
          awayScore: 0,
          winner: null,
          utcDate: t1,
          lastSyncedAt: t1,
          rawStatus: "IN_PLAY",
          eventDataAvailable: false,
          goalEventCompleteness: { expectedGoalCount: 0, normalizedGoalEventCount: 0, missingGoalEventCount: 0, isGoalEventDataComplete: true, completenessReason: "complete" },
          goals: [],
        },
      ],
    ]);

    const snapshotWithScoreOnly = await buildTournamentLiveSnapshot({
      liveData,
      worldcupGames: null,
      generatedAt: t1,
    });

    const slug = matchSlug(liveMatch);
    const entry = snapshotWithScoreOnly.matches[slug];
    assert(entry.status === "SYNCING" || entry.status === "LIVE", "live match with a score gets LIVE or SYNCING status, not SCHEDULED");
    assert(entry.homeScore === 1 && entry.awayScore === 0, "score is visible immediately, before scorer metadata arrives");
    assert(snapshotWithScoreOnly.primaryProviderOk === true, "primaryProviderOk is true once liveData is non-empty");

    // --- snapshotId changes when the score changes, stable when nothing changes ---
    const repeatSnapshot = await buildTournamentLiveSnapshot({
      liveData,
      worldcupGames: null,
      generatedAt: t1,
    });
    assert(repeatSnapshot.snapshotId === snapshotWithScoreOnly.snapshotId, "snapshotId is stable when match state is unchanged");

    const changedLiveData = new Map<number, LiveMatchData>([
      [
        providerId,
        {
          ...liveData.get(providerId)!,
          homeScore: 2,
        },
      ],
    ]);
    const changedSnapshot = await buildTournamentLiveSnapshot({
      liveData: changedLiveData,
      worldcupGames: null,
      generatedAt: t1,
    });
    assert(changedSnapshot.snapshotId !== snapshotWithScoreOnly.snapshotId, "snapshotId changes when the score changes");
  }

  // --- Freshness thresholds (Part 3/5: <90s normal, 90-180s updating, >=180s stale) ---
  const now = new Date("2026-06-14T01:40:00.000Z").getTime();
  const fresh = new Date(now - 20_000).toISOString();
  const updating = new Date(now - 120_000).toISOString();
  const stale = new Date(now - 200_000).toISOString();
  assert(getFreshnessState(fresh, now) === "normal", "20s old snapshot is 'normal'");
  assert(getFreshnessState(updating, now) === "updating", "120s old snapshot is 'updating'");
  assert(getFreshnessState(stale, now) === "stale", "200s old snapshot is 'stale' (>=180s, must be observable)");
  assert(formatRelativeAge(fresh, now) === "20 seconds ago", "formatRelativeAge renders seconds for sub-minute ages");
  assert(formatRelativeAge(updating, now) === "2 minutes ago", "formatRelativeAge renders minutes for >=60s ages");

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}

main();
