// End-to-end browser test for /today Previous/Next date navigation.
//
// Real Chromium with mobile emulation + touch. Asserts the behaviour that was
// broken in production: tapping Previous/Next must give immediate feedback
// (URL commits + loading skeleton) even when the server response is slow, and
// must update the rendered date while preserving the timezone.
//
// Requires a running server (a production build of this app) and Playwright.
// Playwright is intentionally NOT a project dependency (its postinstall can
// download browsers and is undesirable in the Vercel build), so install it
// on demand before running:
//
//   npm i -D playwright && npx playwright install chromium
//   npx next build && npx next start -p 3200 &
//   BASE_URL=http://localhost:3200 node scripts/test-today-date-nav-e2e.mjs
//
// Exit code 0 = all pass, 1 = any failure.
import { chromium, devices } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:3100";

let passed = 0;
let failed = 0;
function assert(cond, msg) {
  if (cond) { console.log(`  PASS  ${msg}`); passed++; }
  else { console.error(`  FAIL  ${msg}`); failed++; }
}

const NAV = '[aria-label="Matchday date navigation"]';
const heading = (page) => page.locator(`${NAV} p`).first().textContent().catch(() => null);

async function freshContext(browser, width, height) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    hasTouch: true, isMobile: true, deviceScaleFactor: 2,
    userAgent: devices["iPhone 13"].userAgent,
  });
  return ctx;
}

async function run() {
  const browser = await chromium.launch();
  try {
    // ── 1. Not intercepted + real tap navigates (390 and 320) ──────────────
    for (const [w, h] of [[390, 844], [320, 568]]) {
      console.log(`\n[${w}x${h}] tap navigation + overlay check`);
      const ctx = await freshContext(browser, w, h);
      const page = await ctx.newPage();
      await page.goto(`${BASE}/today?tz=Europe/Istanbul`, { waitUntil: "networkidle", timeout: 60000 });

      for (const label of ["Previous day", "Next day"]) {
        const sel = `a[aria-label="${label}"]`;
        await page.locator(sel).first().waitFor({ state: "visible", timeout: 15000 });
        const probe = await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (!el) return { found: false };
          const r = el.getBoundingClientRect();
          const top = document.elementFromPoint(Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2));
          let n = top, hit = false;
          while (n) { if (n === el) { hit = true; break; } n = n.parentElement; }
          return { found: true, w: Math.round(r.width), h: Math.round(r.height), centerHitsLink: hit, pe: getComputedStyle(el).pointerEvents };
        }, sel);
        assert(probe.found && probe.centerHitsLink, `[${w}] ${label}: centre point hits the link (not intercepted)`);
        assert(probe.w >= 44 && probe.h >= 44, `[${w}] ${label}: ≥44px target (${probe.w}x${probe.h})`);
        assert(probe.pe === "auto", `[${w}] ${label}: pointer-events auto`);

        const before = page.url();
        const hBefore = await heading(page);
        await page.locator(sel).first().tap();
        await page.waitForFunction((u) => location.href !== u, before, { timeout: 20000 }).catch(() => {});
        const after = page.url();
        assert(after !== before, `[${w}] ${label}: tap updates the URL`);
        assert(/[?&]date=2026-06-\d\d/.test(after), `[${w}] ${label}: URL carries ?date= (${after.split("/today")[1] || ""})`);
        assert(/tz=Europe%2FIstanbul|tz=Europe\/Istanbul/.test(after), `[${w}] ${label}: timezone preserved in URL`);
        await page.waitForFunction((h) => {
          const p = document.querySelector('[aria-label="Matchday date navigation"] p');
          return p && p.textContent && p.textContent.trim() !== (h || "").trim();
        }, hBefore, { timeout: 20000 }).catch(() => {});
        const hAfter = await heading(page);
        assert(hAfter && hAfter !== hBefore, `[${w}] ${label}: rendered date heading changes (${hBefore} → ${hAfter})`);
        await page.goto(`${BASE}/today?tz=Europe/Istanbul`, { waitUntil: "networkidle", timeout: 60000 });
        await page.locator(NAV).first().waitFor({ state: "visible", timeout: 15000 });
      }
      await ctx.close();
    }

    // ── 2. Loading feedback appears before a DELAYED server response ────────
    // This is the core fail-before/pass-after assertion: with a loading
    // boundary the URL commits and a skeleton shows immediately even though the
    // dated response is slow. Without it, the tap looks dead.
    {
      console.log(`\n[390x844] immediate loading feedback during a slow response`);
      const ctx = await freshContext(browser, 390, 844);
      const page = await ctx.newPage();
      await page.goto(`${BASE}/today?tz=Europe/Istanbul`, { waitUntil: "networkidle", timeout: 60000 });

      // Delay only the *navigation* request to a dated /today (RSC or document).
      const DELAY_MS = 3000;
      await page.route(/\/today\?.*date=/, async (route) => {
        await new Promise((r) => setTimeout(r, DELAY_MS));
        await route.continue();
      });

      const before = page.url();
      const hBefore = await heading(page);
      const tap0 = Date.now();
      await page.locator('a[aria-label="Next day"]').first().tap();

      // Within a short window (well under DELAY_MS) we must see IMMEDIATE
      // feedback — a pending indicator AND the date heading flipping
      // optimistically — even though the URL/content settle only once the slow
      // response returns. (Before the fix neither happened for ~DELAY_MS.)
      let pendingMs = null, headingFlipMs = null;
      try {
        await page.waitForSelector('[data-pending="true"], [aria-busy="true"]', { state: "visible", timeout: 1500 });
        pendingMs = Date.now() - tap0;
      } catch { /* leave null */ }
      try {
        await page.waitForFunction((h) => {
          const p = document.querySelector('[aria-label="Matchday date navigation"] p');
          return p && p.textContent && p.textContent.trim() !== (h || "").trim();
        }, hBefore, { timeout: 1500 });
        headingFlipMs = Date.now() - tap0;
      } catch { /* leave null */ }

      assert(pendingMs !== null && pendingMs < DELAY_MS, `pending feedback appears immediately (${pendingMs}ms ≪ ${DELAY_MS}ms response)`);
      assert(headingFlipMs !== null && headingFlipMs < DELAY_MS, `date heading updates optimistically and immediately (${headingFlipMs}ms)`);

      // Then the URL settles to the new date and pending clears.
      await page.waitForFunction((u) => location.href !== u, before, { timeout: 20000 });
      assert(/[?&]date=2026-06-20/.test(page.url()), `URL settles to the dated route after the response (${page.url().split("/today")[1] || ""})`);
      await page.waitForSelector('[data-pending="true"]', { state: "detached", timeout: 8000 }).catch(() => {});
      const finalHeading = await heading(page);
      assert(/Saturday, 20 June 2026/.test(finalHeading || ""), `dated content resolves correctly after the delay (${finalHeading})`);
      await page.unroute(/\/today\?.*date=/);
      await ctx.close();
    }

    // ── 3. Back/forward works ───────────────────────────────────────────────
    {
      console.log(`\n[390x844] browser back/forward`);
      const ctx = await freshContext(browser, 390, 844);
      const page = await ctx.newPage();
      await page.goto(`${BASE}/today?tz=Europe/Istanbul`, { waitUntil: "networkidle", timeout: 60000 });
      const startUrl = page.url();
      const h0 = await heading(page);
      await page.locator('a[aria-label="Previous day"]').first().tap();
      // Wait for the forward navigation to fully commit a dated URL to history.
      await page.waitForFunction(() => /[?&]date=/.test(location.search), null, { timeout: 20000 });
      const datedUrl = page.url();
      const h1 = await heading(page);
      assert(h1 !== h0, `previous-day navigation committed a new date (${h0} → ${h1})`);

      await page.goBack();
      await page.waitForFunction((u) => location.href === u, startUrl, { timeout: 20000 }).catch(() => {});
      await page.waitForFunction((h) => {
        const p = document.querySelector('[aria-label="Matchday date navigation"] p');
        return p && p.textContent.trim() === (h || "").trim();
      }, h0, { timeout: 20000 }).catch(() => {});
      const hBack = await heading(page);
      assert(hBack === h0, `back returns to original date (${hBack} === ${h0})`);

      await page.goForward();
      await page.waitForFunction((u) => location.href === u, datedUrl, { timeout: 20000 }).catch(() => {});
      await page.waitForFunction((h) => {
        const p = document.querySelector('[aria-label="Matchday date navigation"] p');
        return p && p.textContent.trim() === (h || "").trim();
      }, h1, { timeout: 20000 }).catch(() => {});
      const hFwd = await heading(page);
      assert(hFwd === h1, `forward returns to previous-day date (${hFwd} === ${h1})`);
      await ctx.close();
    }

    // ── 4. Rapid double-tap does not corrupt state ──────────────────────────
    {
      console.log(`\n[390x844] rapid double-tap`);
      const ctx = await freshContext(browser, 390, 844);
      const page = await ctx.newPage();
      await page.goto(`${BASE}/today?tz=Europe/Istanbul`, { waitUntil: "networkidle", timeout: 60000 });
      const next = page.locator('a[aria-label="Next day"]').first();
      await next.tap();
      await next.tap().catch(() => {});
      // The app commits the URL once the (last) navigation's response returns;
      // wait for that rather than reading mid-flight.
      await page.waitForFunction(() => /[?&]date=2026-06-\d\d/.test(location.search), null, { timeout: 20000 }).catch(() => {});
      await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
      const url = page.url();
      const hd = await heading(page);
      const dateMatches = url.match(/[?&]date=(2026-06-\d\d)/g) || [];
      assert(dateMatches.length === 1 && /[?&]date=2026-06-\d\d/.test(url), `after rapid taps URL is a single coherent dated URL (${url.split("/today")[1] || ""})`);
      assert(/June 2026/.test(hd || ""), `after rapid taps a coherent date renders (${hd})`);
      await ctx.close();
    }

    // ── 5. Keyboard activation ──────────────────────────────────────────────
    {
      console.log(`\n[390x844] keyboard activation`);
      const ctx = await freshContext(browser, 390, 844);
      const page = await ctx.newPage();
      await page.goto(`${BASE}/today?tz=Europe/Istanbul`, { waitUntil: "networkidle", timeout: 60000 });
      const before = page.url();
      const h0 = await heading(page);
      await page.locator('a[aria-label="Next day"]').first().focus();
      await page.keyboard.press("Enter");
      await page.waitForFunction((u) => location.href !== u, before, { timeout: 20000 }).catch(() => {});
      const after = page.url();
      const h1 = await heading(page);
      assert(after !== before && /[?&]date=/.test(after), `Enter on focused Next navigates (${after.split("/today")[1] || ""})`);
      assert(h1 && h1 !== h0, `keyboard navigation updates the rendered date`);
      await ctx.close();
    }
  } finally {
    await browser.close();
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run().catch((e) => { console.error("E2E ERROR:", e); process.exit(1); });
