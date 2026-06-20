// Gap 4 — live-score freshness budget (clock-controlled, deterministic).
//
// Proves the declared maximum application-added staleness for a LIVE score and
// the stage-aware revalidation policy, and that a score advance becomes visible
// within budget without ever regressing.
import assert from "assert";
import {
  MAX_LIVE_APP_STALENESS_SECONDS,
  LIVE_SNAPSHOT_CACHE_REVALIDATE_SECONDS,
  IDLE_SNAPSHOT_CACHE_REVALIDATE_SECONDS,
  PROVIDER_REVALIDATE_SECONDS,
  hasLiveWindow,
  snapshotRevalidateSeconds,
  createSerializableSnapshotCache,
  monotonicMergeLiveData,
} from "../lib/liveSnapshot";
import { MATCHES, matchUtcDate } from "../lib/matches";
import { getLiveRefreshPolicy } from "../lib/liveRefreshPolicy";
import type { LiveMatchData } from "../lib/liveMatchData";

let passed = 0, failed = 0;
function ok(c: boolean, m: string) { if (c) { console.log(`  PASS  ${m}`); passed++; } else { console.error(`  FAIL  ${m}`); failed++; } }

console.log("=== Live-score freshness budget ===\n");

async function main() {
// ── Stage detection from schedule + clock (no provider call) ──────────────────
const sample = MATCHES[0];
const kick = matchUtcDate(sample).getTime();
ok(hasLiveWindow(new Date(kick + 60 * 60 * 1000)) === true, "hasLiveWindow true 1h after a kickoff");
ok(hasLiveWindow(new Date(kick - 60 * 60 * 1000)) === false, "hasLiveWindow false before kickoff");
ok(hasLiveWindow(new Date(kick + 5 * 60 * 60 * 1000), [sample]) === false, "hasLiveWindow false long after the lone match's window");
ok(snapshotRevalidateSeconds(new Date(kick + 60 * 60 * 1000)) === LIVE_SNAPSHOT_CACHE_REVALIDATE_SECONDS, `live cadence = ${LIVE_SNAPSHOT_CACHE_REVALIDATE_SECONDS}s`);
ok(snapshotRevalidateSeconds(new Date(kick + 5 * 60 * 60 * 1000)) >= IDLE_SNAPSHOT_CACHE_REVALIDATE_SECONDS || hasLiveWindow(new Date(kick + 5 * 60 * 60 * 1000)), "idle cadence used outside live windows");

// ── Declared, enforced budget ────────────────────────────────────────────────
const livePollSeconds = (getLiveRefreshPolicy([{ match: sample, status: "LIVE" }]).intervalMs ?? 0) / 1000;
ok(livePollSeconds > 0 && livePollSeconds <= 15, `client live poll ≤ 15s (got ${livePollSeconds}s)`);
const worstCase = PROVIDER_REVALIDATE_SECONDS + LIVE_SNAPSHOT_CACHE_REVALIDATE_SECONDS + livePollSeconds;
ok(worstCase <= MAX_LIVE_APP_STALENESS_SECONDS, `provider(${PROVIDER_REVALIDATE_SECONDS}) + snapshot(${LIVE_SNAPSHOT_CACHE_REVALIDATE_SECONDS}) + poll(${livePollSeconds}) = ${worstCase}s ≤ declared ${MAX_LIVE_APP_STALENESS_SECONDS}s`);
ok(MAX_LIVE_APP_STALENESS_SECONDS <= 35, `declared budget ${MAX_LIVE_APP_STALENESS_SECONDS}s within ~30–35s target`);

// ── Clock-controlled SWR sequence: 1–0 → 2–0 visible within budget ───────────
{
  let clock = 0;
  const now = () => clock;
  let score: [number, number] = [1, 0];
  let builds = 0;
  const snap = (s: [number, number]) => ({ snapshotId: `s-${s[0]}-${s[1]}`, generatedAt: "", updatedAt: "", matches: {}, liveDataByProviderId: {}, standingsByGroup: {}, thirdPlaceRanking: [], tournamentStats: {} as any, teamLeaderboards: {} as any, topScorers: [], primaryProviderOk: true, secondaryProviderOk: true, primaryProviderFetchedAt: null, secondaryProviderFetchedAt: null });
  const ttlMs = LIVE_SNAPSHOT_CACHE_REVALIDATE_SECONDS * 1000;
  const cache = createSerializableSnapshotCache({ ttlMs, now, build: async () => { builds++; return snap(score) as any; } });

  const first = await cache();
  ok(first.snapshotId === "s-1-0" && builds === 1, "initial build serves 1–0");

  clock = 5000; // within ttl; provider advances to 2–0 now
  score = [2, 0];
  const stale = await cache();
  ok(stale.snapshotId === "s-1-0" && builds === 1, "within cadence the cached (validated old) 1–0 is briefly served, no rebuild");

  clock = ttlMs + 1; // cadence elapsed
  const [a, b] = await Promise.all([cache(), cache()]);
  ok(a.snapshotId === "s-2-0" && b.snapshotId === "s-2-0", "after the cadence the advanced 2–0 is visible");
  ok(builds === 2, "exactly one revalidation occurred for concurrent requests (single-flight, stale period not extended)");
  const visibleDelaySec = (clock - 5000) / 1000;
  ok(visibleDelaySec <= MAX_LIVE_APP_STALENESS_SECONDS, `2–0 visible ${visibleDelaySec}s after provider advance ≤ budget`);
}

// ── Refresh failure preserves last validated; never regresses ────────────────
{
  let clock = 0;
  const now = () => clock;
  let mode: "ok" | "fail" = "ok";
  let builds = 0;
  const good = { snapshotId: "good-2-0" } as any;
  const ttlMs = 10_000;
  const cache = createSerializableSnapshotCache({ ttlMs, now, build: async () => { builds++; if (mode === "fail") throw new Error("provider down"); return good; } });
  const v1 = await cache();
  ok(v1.snapshotId === "good-2-0", "validated snapshot cached");
  clock = ttlMs + 1; mode = "fail";
  const v2 = await cache();
  ok(v2.snapshotId === "good-2-0", "refresh failure serves the last validated snapshot (no blank, no regression)");
}

// ── Monotonic: score never decreases, FINISHED never regresses ───────────────
{
  const finished: LiveMatchData = { provider: "football-data.org", providerMatchId: 1, status: "FINISHED", homeScore: 2, awayScore: 0, winner: "HOME_TEAM", lastSyncedAt: "", eventDataAvailable: true };
  // A transient sync update (status regressed + scores nulled) must NOT lose the
  // validated FINISHED 2–0 — monotonic merge preserves status and non-null scores.
  const transientSync: LiveMatchData = { ...finished, status: "IN_PLAY", homeScore: null, awayScore: null, winner: null };
  const merged = monotonicMergeLiveData(new Map([[1, finished]]), new Map([[1, transientSync]]));
  const m = merged.get(1)!;
  ok(m.status === "FINISHED", "FINISHED never regresses to IN_PLAY on a transient update");
  ok(m.homeScore === 2 && m.awayScore === 0, "validated score preserved against a nulled/sync update (never lost)");
}

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();
