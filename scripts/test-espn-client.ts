import "./mock-server-only";
import assert from "assert";
import { EspnClient, type UpstreamAttemptBudget } from "../lib/espnClient";

let passed = 0;
let failed = 0;
async function test(name: string, fn: () => Promise<void> | void): Promise<void> {
  try {
    await fn();
    console.log(`  PASS  ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  FAIL  ${name}`);
    console.error(`        ${err?.message ?? err}`);
    failed++;
  }
}

function budget(max: number): UpstreamAttemptBudget {
  let used = 0;
  let rateLimited = false;
  return {
    tryConsume: () => {
      if (rateLimited || used >= max) return false;
      used++;
      return true;
    },
    markRateLimited: () => {
      rateLimited = true;
    },
    isStopped: () => rateLimited || used >= max,
  };
}

async function run() {
  console.log("=== ESPN Client Tests ===");

  await test("success: parses scoreboard JSON object", async () => {
    let capturedHeaders: any = null;
    const fetchFn = async (_url: any, init?: any) => {
      capturedHeaders = init?.headers;
      return new Response(JSON.stringify({ events: [] }), { status: 200 });
    };
    const client = new EspnClient({ fetchFn });
    const res = await client.getScoreboard("20260611-20260719");
    assert.strictEqual(res.category, "success");
    assert.ok(res.data);
    // No secret/auth header — only a generic UA + Accept.
    assert.ok(capturedHeaders["User-Agent"]);
    assert.strictEqual(capturedHeaders["x-api-key"], undefined);
    assert.strictEqual(capturedHeaders["Authorization"], undefined);
  });

  await test("success: summary fetch by event id", async () => {
    const fetchFn = async () => new Response(JSON.stringify({ keyEvents: [] }), { status: 200 });
    const res = await new EspnClient({ fetchFn }).getSummary("760415");
    assert.strictEqual(res.category, "success");
  });

  await test("http_error: 404 maps to http_error", async () => {
    const fetchFn = async () => new Response("not found", { status: 404 });
    const res = await new EspnClient({ fetchFn, maxRetries: 1 }).getSummary("x");
    assert.strictEqual(res.category, "http_error");
  });

  await test("rate_limited: 429 maps to rate_limited and marks budget", async () => {
    const fetchFn = async () => new Response("", { status: 429 });
    const b = budget(5);
    const res = await new EspnClient({ fetchFn, maxRetries: 2 }).getScoreboard("r", b);
    assert.strictEqual(res.category, "rate_limited");
    assert.strictEqual(b.isStopped(), true);
  });

  await test("invalid_payload: non-JSON body", async () => {
    const fetchFn = async () => new Response("<html>not json</html>", { status: 200 });
    const res = await new EspnClient({ fetchFn, maxRetries: 1 }).getSummary("x");
    assert.strictEqual(res.category, "invalid_payload");
  });

  await test("invalid_payload: JSON primitive rejected", async () => {
    const fetchFn = async () => new Response("123", { status: 200 });
    const res = await new EspnClient({ fetchFn, maxRetries: 1 }).getSummary("x");
    assert.strictEqual(res.category, "invalid_payload");
  });

  await test("network_error: fetch throws non-abort", async () => {
    const fetchFn = async () => {
      throw new Error("ECONNRESET");
    };
    const res = await new EspnClient({ fetchFn, maxRetries: 1 }).getSummary("x");
    assert.strictEqual(res.category, "network_error");
  });

  await test("timeout: abort error maps to timeout", async () => {
    const fetchFn = async () => {
      const e = new Error("aborted");
      e.name = "AbortError";
      throw e;
    };
    const res = await new EspnClient({ fetchFn, maxRetries: 1 }).getSummary("x");
    assert.strictEqual(res.category, "timeout");
  });

  await test("retry: transient 500 then success", async () => {
    let calls = 0;
    const fetchFn = async () => {
      calls++;
      if (calls === 1) return new Response("err", { status: 503 });
      return new Response(JSON.stringify({ keyEvents: [] }), { status: 200 });
    };
    const res = await new EspnClient({ fetchFn, maxRetries: 2 }).getSummary("x");
    assert.strictEqual(res.category, "success");
    assert.strictEqual(calls, 2);
  });

  await test("budget: exhausted budget short-circuits to rate_limited", async () => {
    const fetchFn = async () => new Response(JSON.stringify({ events: [] }), { status: 200 });
    const b = budget(0); // no allowance
    const res = await new EspnClient({ fetchFn }).getScoreboard("x", b);
    assert.strictEqual(res.category, "rate_limited");
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run();
