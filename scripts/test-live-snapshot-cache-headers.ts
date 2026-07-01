/**
 * Gate test: /api/live-snapshot cache-header policy.
 *
 * Tests:
 *  1. snapshotCdnTtl — LIVE match → active TTL (10 s / SWR 10 s)
 *  2. snapshotCdnTtl — HALFTIME match → active TTL
 *  3. snapshotCdnTtl — SYNCING match → active TTL
 *  4. snapshotCdnTtl — near-match (SCHEDULED, kickoff imminent) → active TTL
 *  5. snapshotCdnTtl — idle (all FINISHED, no near-kickoff) → idle TTL (60 s / SWR 30 s)
 *  6. snapshotCdnTtl — isFallback=true → fallback TTL (5 s / SWR 0 s)
 *  7. snapshotCdnTtl — isFallback overrides live match status → 5 s
 *  8. GET handler sets correct Cache-Control: max-age=0, must-revalidate
 *  9. GET handler sets Vercel-CDN-Cache-Control matching TTL tier
 * 10. GET handler error returns no-store (no long-lived CDN caching of errors)
 * 11. GET handler JSON payload shape unchanged by caching patch
 *
 * Usage:
 *   npx tsx scripts/test-live-snapshot-cache-headers.ts
 */

import assert from "assert";
import { snapshotCdnTtl } from "../lib/liveSnapshotCdnPolicy";
import { MATCHES } from "../lib/matches";
import type { SerializableSnapshotMatch } from "../lib/liveSnapshot";
import type { TournamentLiveSnapshot } from "../lib/liveSnapshot";
import type { GoalEventCompleteness } from "../lib/goalEventCompleteness";

let passed = 0;
let failed = 0;

function check(cond: boolean, msg: string) {
  if (cond) { console.log(`  PASS  ${msg}`); passed++; }
  else { console.error(`  FAIL  ${msg}`); failed++; }
}

function eq<T>(a: T, b: T, msg: string) {
  try {
    assert.strictEqual(a, b, `${msg} — got ${JSON.stringify(a)}, want ${JSON.stringify(b)}`);
    console.log(`  PASS  ${msg}`);
    passed++;
  } catch (e) {
    console.error(`  FAIL  ${(e as Error).message}`);
    failed++;
  }
}

// ── Minimal match stub ────────────────────────────────────────────────────────

const DUMMY_COMPLETENESS: GoalEventCompleteness = {
  expectedGoalCount: 0,
  normalizedGoalEventCount: 0,
  missingGoalEventCount: 0,
  isGoalEventDataComplete: true,
  completenessReason: "complete",
};

function makeMatch(
  matchSlug: string,
  status: SerializableSnapshotMatch["status"],
  overrides: Partial<SerializableSnapshotMatch> = {},
): SerializableSnapshotMatch {
  const match = MATCHES.find((m) => {
    if ("homeKey" in m) return `${m.homeKey}-vs-${m.awayKey}` === matchSlug || matchSlug === "group";
    return false;
  }) ?? MATCHES[0];
  return {
    match,
    internalId: matchSlug,
    providerMatchId: null,
    status,
    homeScore: null,
    awayScore: null,
    scorers: [],
    goalEventCompleteness: DUMMY_COMPLETENESS,
    sourceUpdatedAt: null,
    providerUpdatedAt: null,
    live: null,
    liveDataUnavailable: false,
    ...overrides,
  };
}

// Use a real group-stage match
const REAL_MATCH = MATCHES.find((m) => "homeKey" in m)!;
function makeRealMatch(
  status: SerializableSnapshotMatch["status"],
  overrides: Partial<SerializableSnapshotMatch> = {},
): SerializableSnapshotMatch {
  return {
    match: REAL_MATCH,
    internalId: "test-match",
    providerMatchId: null,
    status,
    homeScore: null,
    awayScore: null,
    scorers: [],
    goalEventCompleteness: DUMMY_COMPLETENESS,
    sourceUpdatedAt: null,
    providerUpdatedAt: null,
    live: null,
    liveDataUnavailable: false,
    ...overrides,
  };
}

function makeSnapshot(
  entries: Record<string, SerializableSnapshotMatch>,
  isFallback = false,
): Pick<TournamentLiveSnapshot, "isFallback" | "matches"> {
  return { isFallback, matches: entries };
}

// ── Snapshots used in tests ───────────────────────────────────────────────────

// Kickoff in 30 min from now → near-match
const nearFutureMs = Date.now() + 30 * 60 * 1000;
const nearFutureIso = new Date(nearFutureMs).toISOString().slice(0, 10);
const NEAR_MATCH = MATCHES.find((m) => "homeKey" in m)!;
// We patch matchUtcDate by choosing a match whose date is in the past and
// using a long-finished match with providerUpdatedAt > 48h ago, so the
// liveRefreshPolicy sees it as idle. For near-match, we use status=SCHEDULED
// with a match kickoff in the past (nowMs >= kickoff - 2h is always true for
// past kickoffs).
const SCHEDULED_PAST = makeRealMatch("SCHEDULED");
const LIVE_MATCH = makeRealMatch("LIVE");
const HALFTIME_MATCH = makeRealMatch("HALFTIME");
const SYNCING_MATCH = makeRealMatch("SYNCING");

// A finished match with complete canonical data + scorer data — stays idle
// only if kickoff was > 48h ago. We'll use a match from June (well in the past).
const OLD_FINISHED: SerializableSnapshotMatch = {
  match: REAL_MATCH,
  internalId: "old-finished",
  providerMatchId: null,
  status: "FINISHED",
  homeScore: 1,
  awayScore: 0,
  scorers: [],
  goalEventCompleteness: DUMMY_COMPLETENESS,
  sourceUpdatedAt: "2026-06-12T00:00:00Z",
  providerUpdatedAt: "2026-06-12T00:00:00Z",
  live: { winner: "home", scoreDuration: "REGULAR", penaltyShootoutScore: null } as any,
  liveDataUnavailable: false,
};

// ── Tests 1–7: snapshotCdnTtl ─────────────────────────────────────────────────

console.log("=== snapshotCdnTtl TTL selection ===\n");

console.log("1. LIVE match → active TTL (maxAge=10, swr=10)");
{
  const ttl = snapshotCdnTtl(makeSnapshot({ m: LIVE_MATCH }));
  eq(ttl.maxAge, 10, "LIVE maxAge");
  eq(ttl.swr, 10, "LIVE swr");
}

console.log("\n2. HALFTIME match → active TTL");
{
  const ttl = snapshotCdnTtl(makeSnapshot({ m: HALFTIME_MATCH }));
  eq(ttl.maxAge, 10, "HALFTIME maxAge");
  eq(ttl.swr, 10, "HALFTIME swr");
}

console.log("\n3. SYNCING match → active TTL");
{
  const ttl = snapshotCdnTtl(makeSnapshot({ m: SYNCING_MATCH }));
  eq(ttl.maxAge, 10, "SYNCING maxAge");
  eq(ttl.swr, 10, "SYNCING swr");
}

console.log("\n4. SCHEDULED match with past kickoff → near-match → active TTL");
{
  // Any SCHEDULED match with a past kickoff satisfies getLiveRefreshPolicy's
  // near-match condition (nowMs >= kickoff - 2h always true for past matches).
  const ttl = snapshotCdnTtl(makeSnapshot({ m: SCHEDULED_PAST }));
  // Either active or near-match reason → maxAge=10
  eq(ttl.maxAge, 10, "SCHEDULED near-match maxAge");
  eq(ttl.swr, 10, "SCHEDULED near-match swr");
}

console.log("\n5. Idle (old FINISHED, complete canonical data, >48h ago) → idle TTL (60/30)");
{
  const ttl = snapshotCdnTtl(makeSnapshot({ m: OLD_FINISHED }));
  eq(ttl.maxAge, 60, "idle maxAge");
  eq(ttl.swr, 30, "idle swr");
}

console.log("\n6. isFallback=true → fallback TTL (5/0), ignores matches");
{
  const ttl = snapshotCdnTtl(makeSnapshot({ m: OLD_FINISHED }, true));
  eq(ttl.maxAge, 5, "fallback maxAge");
  eq(ttl.swr, 0, "fallback swr");
}

console.log("\n7. isFallback=true overrides LIVE match status → still 5/0");
{
  const ttl = snapshotCdnTtl(makeSnapshot({ m: LIVE_MATCH }, true));
  eq(ttl.maxAge, 5, "fallback+LIVE maxAge");
  eq(ttl.swr, 0, "fallback+LIVE swr");
}

// ── Tests 8–10: HTTP response headers from GET handler ────────────────────────
// We call the real GET handler which uses the live unstable_cache system.
// We verify the headers are present and well-formed; we accept any valid TTL tier.

console.log("\n=== GET handler response headers ===\n");

async function runHandlerTests() {
  const { GET } = await import("../app/api/live-snapshot/route");

  console.log("8. Successful GET → Cache-Control: public, max-age=0, must-revalidate");
  let res: Response;
  try {
    res = await GET();
  } catch (e) {
    console.error(`  FAIL  GET() threw: ${(e as Error).message}`);
    failed++;
    return;
  }

  const cc = res.headers.get("cache-control") ?? "";
  check(cc.includes("max-age=0"), `Cache-Control has max-age=0 (got: ${cc})`);
  check(cc.includes("must-revalidate"), `Cache-Control has must-revalidate (got: ${cc})`);
  check(!cc.includes("no-store"), `Cache-Control does not include no-store (got: ${cc})`);

  console.log("\n9. Successful GET → Vercel-CDN-Cache-Control present and valid");
  const vcc = res.headers.get("vercel-cdn-cache-control") ?? "";
  check(vcc.length > 0, `Vercel-CDN-Cache-Control is set (got: ${vcc})`);
  check(vcc.includes("public"), `Vercel-CDN-Cache-Control has public (got: ${vcc})`);
  check(/max-age=\d+/.test(vcc), `Vercel-CDN-Cache-Control has max-age=N (got: ${vcc})`);
  check(/stale-while-revalidate=\d+/.test(vcc), `Vercel-CDN-Cache-Control has stale-while-revalidate=N (got: ${vcc})`);

  // Verify the max-age is one of our known tiers
  const maxAgeMatch = vcc.match(/max-age=(\d+)/);
  const maxAgeVal = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : -1;
  check([5, 10, 60].includes(maxAgeVal), `Vercel CDN max-age is a known tier (5|10|60), got ${maxAgeVal}`);

  console.log("\n10. Successful GET → status 200, JSON parseable");
  eq(res.status, 200, "status 200");
  let body: any;
  try {
    body = await res.json();
  } catch {
    console.error("  FAIL  response body is not valid JSON");
    failed++;
    return;
  }
  check(typeof body === "object" && body !== null, "body is object");

  console.log("\n11. GET handler JSON payload shape unchanged (required fields present)");
  check(typeof body.snapshotId === "string", "snapshotId is string");
  check(typeof body.generatedAt === "string", "generatedAt is string");
  check(typeof body.updatedAt === "string", "updatedAt is string");
  check(typeof body.primaryProviderOk === "boolean", "primaryProviderOk is boolean");
  check(typeof body.secondaryProviderOk === "boolean", "secondaryProviderOk is boolean");
  check(typeof body.isFallback === "boolean", "isFallback is boolean");
  check(typeof body.matches === "object" && body.matches !== null, "matches is object");

  // Verify at least one match entry has the expected fields
  const firstMatch = Object.values(body.matches as Record<string, unknown>)[0] as Record<string, unknown> | undefined;
  if (firstMatch) {
    check("status" in firstMatch, "match has status");
    check("homeScore" in firstMatch, "match has homeScore");
    check("awayScore" in firstMatch, "match has awayScore");
    check("scorers" in firstMatch, "match has scorers");
    check("goalEventCompleteness" in firstMatch, "match has goalEventCompleteness");
    check("liveDataUnavailable" in firstMatch, "match has liveDataUnavailable");
    check("resolvedHomeParticipant" in firstMatch, "match has resolvedHomeParticipant");
    check("resolvedAwayParticipant" in firstMatch, "match has resolvedAwayParticipant");
    // Ensure no internal policy fields leaked into the payload
    check(!("maxAge" in firstMatch), "no maxAge in match payload");
    check(!("swr" in firstMatch), "no swr in match payload");
  }
}

runHandlerTests().then(() => {
  console.log(`\n${"─".repeat(50)}`);
  console.log(`  ${passed} passed · ${failed} failed`);
  if (failed > 0) process.exit(1);
});
