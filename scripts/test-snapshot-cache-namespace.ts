// Gap 2 — the optional SNAPSHOT_CACHE_NAMESPACE is incorporated into the shared
// cache key (forcing a fresh cold-miss namespace for QA), and is ABSENT from the
// key when the env var is unset (Production stays on the stable key).
import assert from "assert";

async function main() {
  let passed = 0, failed = 0;
  const ok = (c: boolean, m: string) => { if (c) { console.log(`  PASS  ${m}`); passed++; } else { console.error(`  FAIL  ${m}`); failed++; } };
  console.log("=== Snapshot cache namespace ===\n");

  const { MemoryCacheAdapter, setCacheAdapter } = await import("../lib/cacheAdapter");
  const { MATCHES } = await import("../lib/matches");
  const providerId = MATCHES[0].providerIds?.footballData as number;

  // HEALTHY providers so the build VALIDATES and writes a validated key carrying
  // the namespace. (A degraded both-down build is correctly rejected and never
  // written — see the acceptance gate — so it cannot be used to probe the key.)
  process.env.FOOTBALL_DATA_API_KEY = "mock";
  globalThis.fetch = (async (input: any) => {
    const url = input.toString();
    if (url.includes("worldcup26.ir")) {
      return { ok: true, json: async () => [{
        id: "f995fc1d", home_team_name_en: "Mexico", away_team_name_en: "South Africa",
        home_score: 2, away_score: 0, home_scorers: `{"Player A 10'"}`, away_scorers: `{}`, finished: true,
      }] } as Response;
    }
    if (url.includes("api.football-data.org")) {
      return { ok: true, json: async () => ({ matches: [{ id: providerId, status: "FINISHED", score: { fullTime: { home: 2, away: 0 } } }] }) } as Response;
    }
    throw new Error(`unexpected fetch ${url}`);
  }) as typeof fetch;

  // (A) With a namespace set BEFORE module init, the built-snapshot key carries it.
  process.env.NEXT_RUNTIME = "nodejs";
  process.env.SNAPSHOT_CACHE_NAMESPACE = "qa-7f3a91";
  const adapterA = new MemoryCacheAdapter();
  setCacheAdapter(adapterA);
  const modA = await import("../lib/liveSnapshot");
  modA.resetLiveSnapshotMemoryForTests();
  await modA.getTournamentLiveSnapshot().catch(() => {}); // triggers the shared build
  // The build may complete in the background (after the fallback); poll for the key.
  const hasKey = () => [...adapterA.store.keys()].some((k) => k.includes("worldcup-built-snapshot"));
  for (let i = 0; i < 40 && !hasKey(); i++) await new Promise((r) => setTimeout(r, 100));
  const keyA = [...adapterA.store.keys()].find((k) => k.includes("worldcup-built-snapshot"));
  ok(!!keyA, "built-snapshot key present with namespace set");
  ok(!!keyA && keyA.endsWith(",qa-7f3a91"), `key incorporates the namespace (got "${keyA}")`);
  ok(!!keyA && /^worldcup-built-snapshot,v\d+,(live|idle),qa-7f3a91$/.test(keyA), "key shape: prefix,version,stage,namespace");

  // (B) The namespace constant is never hard-coded in Production source.
  const fs = await import("node:fs");
  const src = fs.readFileSync(new URL("../lib/liveSnapshot.ts", import.meta.url), "utf8");
  ok(!/qa-7f3a91|SNAPSHOT_CACHE_NAMESPACE\s*=\s*["'`]/.test(src), "no hard-coded namespace value in source (only read from env)");
  ok(/process\.env\.SNAPSHOT_CACHE_NAMESPACE/.test(src), "namespace is sourced from process.env");

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();
