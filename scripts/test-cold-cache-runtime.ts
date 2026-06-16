/**
 * Cold-cache production runtime integration test.
 *
 * Starts the real Next.js production server with deterministic fixture env
 * vars, requests three routes, and asserts the application behaves correctly
 * under a cold secondary-provider failure:
 *
 *   - Primary provider:  fixture file (Mexico 2-0, South Korea 3-1)
 *   - Secondary provider: forced immediate failure (WORLDCUP26_FORCE_FAIL=1)
 *   - Secondary cache:   cold (first request, nothing stale)
 *
 * Requires a production build to exist. Run `npm run build` first, or let
 * verify.ps1 do it.
 *
 * Never uses `taskkill /IM node.exe`. Process cleanup targets only the exact
 * spawned process tree by PID.
 */

import { spawn, execSync } from "child_process";
import * as net from "net";
import * as fs from "fs";
import * as path from "path";
import * as assert from "assert";

// ── Config ────────────────────────────────────────────────────────────────────

const PROJECT_ROOT = path.resolve(process.cwd());
const BUILD_MARKER = path.join(PROJECT_ROOT, ".next", "BUILD_ID");
const FIXTURE_PATH = path.join(PROJECT_ROOT, "scripts", "fixtures", "primary-fixture.json");
const SERVER_READY_TIMEOUT_MS = 60_000;
const REQUEST_TIMEOUT_MS = 15_000;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address() as net.AddressInfo;
      server.close(() => resolve(addr.port));
    });
    server.on("error", reject);
  });
}

async function waitForServer(baseUrl: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let lastErr = "";
  while (Date.now() < deadline) {
    try {
      const res = await fetchWithTimeout(`${baseUrl}/`, 3_000);
      if (res.status < 500) return;
    } catch (err: any) {
      lastErr = err?.message ?? String(err);
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server at ${baseUrl} did not become ready within ${timeoutMs}ms — ${lastErr}`);
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function killTree(pid: number): void {
  try {
    execSync(`taskkill /PID ${pid} /T /F`, { stdio: "ignore" });
  } catch {
    // Already dead — ignore
  }
}

// ── Test runner ───────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
let serverPid: number | null = null;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e: any) {
    console.error(`  ❌ ${name}`);
    console.error(`     ${e.message ?? e}`);
    failed++;
  }
}

async function run(): Promise<void> {
  // ── Pre-flight: require production build ──────────────────────────────────

  if (!fs.existsSync(BUILD_MARKER)) {
    console.error(
      "[cold-cache] SKIP: no production build found at .next/BUILD_ID\n" +
        "             Run `npm run build` first.",
    );
    process.exitCode = 1;
    return;
  }

  if (!fs.existsSync(FIXTURE_PATH)) {
    console.error(`[cold-cache] FAIL: fixture not found at ${FIXTURE_PATH}`);
    process.exitCode = 1;
    return;
  }

  // ── Find free port ────────────────────────────────────────────────────────

  const port = await getFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`\n[cold-cache] Spawning next start on port ${port}…`);

  // ── Env vars: primary fixture + forced secondary failure ──────────────────

  const testEnv: NodeJS.ProcessEnv = {
    ...process.env,
    FOOTBALL_DATA_FIXTURE_FILE: FIXTURE_PATH,
    WORLDCUP26_FORCE_FAIL: "1",
    PORT: String(port),
    HOSTNAME: "127.0.0.1",
    NODE_ENV: "production",
  };

  // ── Spawn production server ───────────────────────────────────────────────

  const child = spawn(
    "node",
    ["node_modules/next/dist/bin/next", "start", "-p", String(port)],
    { env: testEnv, stdio: ["ignore", "pipe", "pipe"], shell: false },
  );
  serverPid = child.pid ?? null;

  const childLogs: string[] = [];
  child.stdout.on("data", (d: Buffer) => childLogs.push(d.toString()));
  child.stderr.on("data", (d: Buffer) => childLogs.push(d.toString()));

  try {
    // ── Wait for server ready ───────────────────────────────────────────────

    console.log("[cold-cache] Waiting for server to become ready…");
    await waitForServer(baseUrl, SERVER_READY_TIMEOUT_MS);
    console.log("[cold-cache] Server ready. Running assertions.\n");

    // ── Route: /today ───────────────────────────────────────────────────────

    console.log("=== /today ===");

    const todayRes = await fetchWithTimeout(`${baseUrl}/today`, REQUEST_TIMEOUT_MS);
    test("/today returns HTTP 200", () => {
      assert.strictEqual(todayRes.status, 200, `Got ${todayRes.status}`);
    });
    const todayBody = await todayRes.text();
    test("/today returns HTML (not error page)", () => {
      assert.ok(todayBody.includes("<html") || todayBody.includes("<!DOCTYPE"), "No HTML root element");
      assert.ok(!todayBody.includes("500 Internal Server Error"), "/today shows internal server error page");
    });

    // ── Route: /stats ───────────────────────────────────────────────────────

    console.log("\n=== /stats ===");

    const statsRes = await fetchWithTimeout(`${baseUrl}/stats`, REQUEST_TIMEOUT_MS);
    test("/stats returns HTTP 200", () => {
      assert.strictEqual(statsRes.status, 200, `Got ${statsRes.status}`);
    });
    const statsBody = await statsRes.text();
    test("/stats returns HTML (not error page)", () => {
      assert.ok(statsBody.includes("<html") || statsBody.includes("<!DOCTYPE"), "No HTML root element");
      assert.ok(!statsBody.includes("500 Internal Server Error"), "/stats shows internal server error page");
    });

    // ── Route: /matches/mexico-vs-south-africa-jun11 ────────────────────────

    console.log("\n=== /matches/mexico-vs-south-africa-jun11 ===");

    const matchRes = await fetchWithTimeout(
      `${baseUrl}/matches/mexico-vs-south-africa-jun11`,
      REQUEST_TIMEOUT_MS,
    );
    test("match detail returns HTTP 200", () => {
      assert.strictEqual(matchRes.status, 200, `Got ${matchRes.status}`);
    });
    const matchBody = await matchRes.text();

    test("score is rendered with numeric values (not 'vs' placeholder)", () => {
      // hasScore=true → score block: {homeScore}–{awayScore} (en-dash, MatchDetail.tsx:348)
      // hasScore=false → <span ...>vs</span> (MatchDetail.tsx:355)
      // The score is confirmed present by the en-dash and individual score tests;
      // here we verify the 'vs' placeholder element is absent.
      const vsLabelInScoreDiv =
        matchBody.includes("tracking-widest") && matchBody.match(/tracking-widest[^>]*>vs</);
      assert.ok(
        !vsLabelInScoreDiv,
        "Found 'vs' score-placeholder span — fixture score was not applied",
      );
    });

    test("Mexico score (2) appears in the rendered page", () => {
      // The home score is rendered as a bare text node inside a <span>
      assert.ok(matchBody.includes(">2<"), "Home score '2' not found in page HTML");
    });

    test("South Africa score (0) appears in the rendered page", () => {
      assert.ok(matchBody.includes(">0<"), "Away score '0' not found in page HTML");
    });

    test("final-score en-dash separator is rendered (not 'vs')", () => {
      // Line 348 of MatchDetail.tsx: <span ...>–</span>
      assert.ok(matchBody.includes("–"), "En-dash score separator not found");
    });

    test("honest scorer-incomplete copy is shown (secondary cold-failed)", () => {
      assert.ok(
        matchBody.includes("Scorer details are currently incomplete."),
        "Expected 'Scorer details are currently incomplete.' in page body",
      );
    });

    test("no unhandled 500 response on match detail route", () => {
      assert.notStrictEqual(matchRes.status, 500, "Match detail returned HTTP 500");
    });

    // ── Process-exit sanity: no unhandled rejection in server logs ──────────

    console.log("\n=== Server log sanity ===");
    const combinedLog = childLogs.join("");
    test("server logs contain no 'unhandledRejection'", () => {
      assert.ok(
        !combinedLog.includes("unhandledRejection"),
        "Server logs contain 'unhandledRejection'",
      );
    });
    test("server logs contain no 'TypeError: Cannot read'", () => {
      assert.ok(
        !combinedLog.includes("TypeError: Cannot read"),
        "Server logs contain a TypeError",
      );
    });

  } finally {
    // ── Cleanup: kill exact PID tree, never by image name ──────────────────
    if (serverPid !== null) {
      console.log(`\n[cold-cache] Killing server process tree (PID ${serverPid})…`);
      killTree(serverPid);
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────

  console.log(`\n${"─".repeat(56)}`);
  console.log(`Cold-cache runtime: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}

run().catch((err) => {
  console.error("[cold-cache] Fatal error:", err);
  if (serverPid !== null) killTree(serverPid);
  process.exitCode = 1;
});
