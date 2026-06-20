// Gap 3 — fallback semantics across public surfaces. Proves the truthful cold
// fallback exposes an honest availability signal that consumers cannot silently
// ignore: the /api/live-snapshot route and the canonical snapshot both carry
// `isFallback` and per-match `liveDataUnavailable`, started matches are never
// presented as genuinely SCHEDULED, and standings/Top Scorers are not authoritative.
import assert from "assert";
import { MemoryCacheAdapter, setCacheAdapter } from "../lib/cacheAdapter";

const adapter = new MemoryCacheAdapter();
setCacheAdapter(adapter);
process.env.NEXT_RUNTIME = "nodejs";
process.env.FOOTBALL_DATA_API_KEY = "mock";

// Force the cold/empty path: providers fail + the build is slow, so the truthful
// fallback is served on the first request.
const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: any) => {
  await new Promise((r) => setTimeout(r, 3000));
  throw new Error("provider unavailable");
}) as typeof fetch;

async function main() {
  let passed = 0, failed = 0;
  const ok = (c: boolean, m: string) => { if (c) { console.log(`  PASS  ${m}`); passed++; } else { console.error(`  FAIL  ${m}`); failed++; } };
  console.log("=== Fallback public-surface audit ===\n");

  const { getTournamentLiveSnapshot, resetLiveSnapshotMemoryForTests } = await import("../lib/liveSnapshot");
  const { matchUtcDate } = await import("../lib/matches");
  resetLiveSnapshotMemoryForTests();

  // Canonical snapshot fallback
  const snap = await getTournamentLiveSnapshot();
  ok(snap.isFallback === true, "snapshot.isFallback === true (availability signal present)");
  const vals = Object.values(snap.matches);
  ok(vals.every((m) => m.homeScore === null && m.awayScore === null), "no fabricated scores on any surface");
  ok(vals.every((m) => m.scorers.length === 0), "no fabricated scorers on any surface");
  ok(snap.topScorers.length === 0, "Top Scorers omitted (not authoritative)");
  ok(Object.values(snap.standingsByGroup).flat().every((r) => r.played === 0), "standings not authoritative (all played=0)");
  ok(snap.primaryProviderOk === false && snap.primaryProviderFetchedAt === null, "freshness honest: no successful-sync implication");

  const past = vals.filter((m) => matchUtcDate(m.match).getTime() <= Date.now());
  ok(past.length > 0 && past.every((m) => m.liveDataUnavailable === true), "every started fixture flagged liveDataUnavailable (never genuinely SCHEDULED)");
  const future = vals.filter((m) => matchUtcDate(m.match).getTime() > Date.now());
  ok(future.every((m) => !m.liveDataUnavailable), "future fixtures keep honest SCHEDULED meaning (not flagged)");

  // Public API route surfaces the availability fields (no consumer can silently
  // read a stale SCHEDULED).
  const { GET } = await import("../app/api/live-snapshot/route");
  const res = await GET();
  const body = await res.json();
  ok(body.isFallback === true, "/api/live-snapshot exposes isFallback");
  const apiVals = Object.values(body.matches) as any[];
  ok(apiVals.every((m) => "liveDataUnavailable" in m), "/api/live-snapshot exposes per-match liveDataUnavailable");
  ok(apiVals.some((m) => m.liveDataUnavailable === true), "/api/live-snapshot marks started fixtures unavailable");
  ok(apiVals.every((m) => m.homeScore === null && m.awayScore === null && m.scorers.length === 0), "/api/live-snapshot fabricates no score/scorer");

  globalThis.fetch = realFetch;
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();
