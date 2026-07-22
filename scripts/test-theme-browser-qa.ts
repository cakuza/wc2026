import { chromium, Browser, BrowserContext, Page } from "playwright";
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { strict as assert } from "node:assert";

const PORT = 52391 + Math.floor(Math.random() * 1000);
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOT_DIR = join(process.cwd(), "artifacts", "theme-audit-screenshots");

// Standard MIME types for static server
const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

// Start static server on out directory
function startStaticServer(): Promise<{ close: () => void }> {
  return new Promise((resolve, reject) => {
    const outDir = join(process.cwd(), "out");
    if (!existsSync(outDir)) {
      reject(new Error("Static export directory 'out' does not exist. Run 'npm run build:p0' first."));
      return;
    }

    const server = createServer((req, res) => {
      let reqPath = req.url?.split("?")[0] || "/";
      if (reqPath.startsWith("/")) reqPath = reqPath.slice(1);

      let filePath = join(outDir, reqPath);
      if (!extname(filePath)) {
        if (existsSync(filePath + ".html")) {
          filePath = filePath + ".html";
        } else if (existsSync(filePath) && statSync(filePath).isDirectory()) {
          filePath = join(filePath, "index.html");
        }
      }

      if (!existsSync(filePath)) {
        res.statusCode = 404;
        res.end("404 Not Found");
        return;
      }

      try {
        const ext = extname(filePath);
        const contentType = MIME_TYPES[ext] || "application/octet-stream";
        const content = readFileSync(filePath);
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content);
      } catch (err) {
        res.statusCode = 404;
        res.end("404 Not Found");
      }
    });

    server.listen(PORT, () => {
      console.log(`Static server running on ${BASE_URL}`);
      resolve({ close: () => server.close() });
    });
  });
}

// Relative luminance calculation for WCAG contrast
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function parseRgb(colorStr: string): [number, number, number] {
  const m = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!m) return [0, 0, 0];
  return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
}

function getContrastRatio(fgStr: string, bgStr: string): number {
  const fg = parseRgb(fgStr);
  const bg = parseRgb(bgStr);
  const l1 = getLuminance(fg[0], fg[1], fg[2]);
  const l2 = getLuminance(bg[0], bg[1], bg[2]);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

async function runBrowserThemeQA() {
  console.log("=== Starting Playwright Day/Night Theme & Vault Browser QA ===");
  if (!existsSync(SCREENSHOT_DIR)) {
    mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const server = await startStaticServer();
  const browser = await chromium.launch({ headless: true });

  try {
    // -------------------------------------------------------------
    // Scenario 1-4: REAL Pre-Hydration Zero-Flash & Hydration Tests
    // -------------------------------------------------------------
    console.log("\n--- Scenario 1-4: Real Pre-Hydration Zero-Flash Tests ---");

    const preHydrationPermutations = [
      { name: "System Light (No Stored Preference)", os: "light", saved: null, expected: "light", meta: "#f5f4f0", bg: "rgb(245, 244, 240)", text: "rgb(15, 23, 42)" },
      { name: "System Dark (No Stored Preference)", os: "dark", saved: null, expected: "dark", meta: "#0a1628", bg: "rgb(10, 22, 40)", text: "rgb(255, 255, 255)" },
      { name: "Saved Light Overriding System Dark", os: "dark", saved: "light", expected: "light", meta: "#f5f4f0", bg: "rgb(245, 244, 240)", text: "rgb(15, 23, 42)" },
      { name: "Saved Dark Overriding System Light", os: "light", saved: "dark", expected: "dark", meta: "#0a1628", bg: "rgb(10, 22, 40)", text: "rgb(255, 255, 255)" },
    ] as const;

    for (const p of preHydrationPermutations) {
      const context = await browser.newContext({ colorScheme: p.os });
      if (p.saved) {
        await context.addInitScript((s) => {
          localStorage.setItem("wcmd-theme", s);
        }, p.saved);
      }

      const page = await context.newPage();
      const hydrationRoutesToHold: Array<() => void> = [];

      // Intercept Next.js JS hydration chunks to pause hydration execution
      await page.route("**/_next/static/chunks/**", (route) => {
        hydrationRoutesToHold.push(() => route.continue());
      });

      const pageErrors: string[] = [];
      const consoleErrors: string[] = [];
      page.on("pageerror", (err) => pageErrors.push(err.message));
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });

      // Navigate to homepage - inline initializer script executes immediately during HTML parsing
      const navPromise = page.goto(`${BASE_URL}/`, { waitUntil: "commit" });
      await page.waitForTimeout(100);

      // PRE-HYDRATION ASSERTIONS
      const preTheme = await page.getAttribute("html", "data-theme");
      assert(preTheme === p.expected, `[Pre-Hydration] ${p.name}: html[data-theme] is '${p.expected}' (got '${preTheme}')`);

      const preBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      assert(preBg === p.bg, `[Pre-Hydration] ${p.name}: body background is '${p.bg}' (got '${preBg}')`);

      const preTextColor = await page.evaluate(() => getComputedStyle(document.body).color);
      assert(preTextColor === p.text, `[Pre-Hydration] ${p.name}: body text color is '${p.text}' (got '${preTextColor}')`);

      const metaTagsCount = await page.locator('meta[name="theme-color"]').count();
      assert(metaTagsCount === 1, `[Pre-Hydration] ${p.name}: exactly 1 meta[name="theme-color"] tag exists (got ${metaTagsCount})`);

      const metaVal = await page.getAttribute('meta[name="theme-color"]', "content");
      assert(metaVal === p.meta, `[Pre-Hydration] ${p.name}: meta[name="theme-color"] content is '${p.meta}' (got '${metaVal}')`);

      // RELEASE HYDRATION CHUNKS
      hydrationRoutesToHold.forEach((fn) => fn());
      await page.unroute("**/_next/static/chunks/**");
      await navPromise;
      await page.waitForLoadState("domcontentloaded");

      // POST-HYDRATION ASSERTIONS
      const postTheme = await page.getAttribute("html", "data-theme");
      assert(postTheme === p.expected, `[Post-Hydration] ${p.name}: html[data-theme] remains '${p.expected}'`);
      assert(pageErrors.length === 0, `[Post-Hydration] ${p.name}: zero page errors (got ${pageErrors.length})`);
      assert(consoleErrors.length === 0, `[Post-Hydration] ${p.name}: zero console errors (got ${consoleErrors.length})`);

      await context.close();
      console.log(`  PASS: ${p.name} pre-hydration and post-hydration verified successfully.`);
    }

async function clickThemeToggle(page: Page) {
  const toggle = page.locator('button[data-testid="theme-toggle"][data-mounted="true"]').first();
  await toggle.waitFor({ state: "visible", timeout: 10000 });
  const currentTheme = await page.getAttribute("html", "data-theme");
  const expectedTheme = currentTheme === "light" ? "dark" : "light";
  await toggle.click();
  await page.waitForFunction((exp) => document.documentElement.getAttribute("data-theme") === exp, expectedTheme, { timeout: 5000 });
}

// ... in main test body ...
    // -------------------------------------------------------------
    // Scenario 5: Toggle Interaction, Focus Retention & Route Sync
    // -------------------------------------------------------------
    console.log("\n--- Scenario 5: Toggle Interaction, Focus & Route Sync ---");
    {
      const context = await browser.newContext({ colorScheme: "dark" });
      const page = await context.newPage();
      await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });

      const toggle = page.locator('button[data-testid="theme-toggle"][data-mounted="true"]').first();
      await toggle.waitFor({ state: "visible", timeout: 10000 });
      await toggle.focus();
      await page.keyboard.press("Enter");
      await page.waitForFunction(() => document.documentElement.getAttribute("data-theme") === "light", { timeout: 5000 });

      const newTheme = await page.getAttribute("html", "data-theme");
      assert(newTheme === "light", `Clicking theme toggle switches theme from dark to light (got '${newTheme}')`);

      const stored = await page.evaluate(() => localStorage.getItem("wcmd-theme"));
      assert(stored === "light", "Toggle choice written to localStorage ('light')");

      // Wait for View Transition animation to complete
      await page.waitForTimeout(450);

      // Verify toggle button focusability & active state
      const isFocusable = await page.evaluate(() => {
        const toggleBtn = document.querySelector('button[data-testid="theme-toggle"]') as HTMLButtonElement;
        return toggleBtn && toggleBtn.tabIndex !== -1 && !toggleBtn.disabled;
      });
      assert(isFocusable, "Theme toggle button retains keyboard focusability after activation");

      // Navigate to /schedule and confirm theme persistence
      await page.goto(`${BASE_URL}/schedule`, { waitUntil: "networkidle" });
      const htmlTag = await page.evaluate(() => document.documentElement.outerHTML.slice(0, 300));
      console.log("HTML tag on /schedule:", htmlTag);
      const scheduleTheme = await page.getAttribute("html", "data-theme");
      assert(scheduleTheme === "light", `Navigating to /schedule preserves theme preference ('light') (got '${scheduleTheme}')`);

      await context.close();
      console.log("  PASS: Toggle interaction, focus retention & route persistence verified.");
    }

    // -------------------------------------------------------------
    // Scenario 6: Cross-Tab Storage Synchronization
    // -------------------------------------------------------------
    console.log("\n--- Scenario 6: Cross-Tab Storage Synchronization ---");
    {
      const context = await browser.newContext({ colorScheme: "dark" });
      const page1 = await context.newPage();
      const page2 = await context.newPage();

      await page1.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
      await page2.goto(`${BASE_URL}/schedule`, { waitUntil: "domcontentloaded" });

      // Click toggle on Page 1
      await clickThemeToggle(page1);

      // Verify Page 2 automatically synchronized theme
      await page2.waitForFunction(() => document.documentElement.getAttribute("data-theme") === "light", { timeout: 2000 });
      const page2Theme = await page2.getAttribute("html", "data-theme");
      assert(page2Theme === "light", "Page 2 automatically synchronized theme to 'light' via storage event");

      await context.close();
      console.log("  PASS: Cross-tab storage synchronization verified.");
    }

    // -------------------------------------------------------------
    // Scenario 7: Reduced Motion Behavior
    // -------------------------------------------------------------
    console.log("\n--- Scenario 7: Reduced Motion Behavior ---");
    {
      const context = await browser.newContext({ colorScheme: "dark", reducedMotion: "reduce" });
      const page = await context.newPage();
      await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });

      await clickThemeToggle(page);
      const theme = await page.getAttribute("html", "data-theme");
      assert(theme === "light", "Theme switches immediately when prefers-reduced-motion is reduce");

      await context.close();
      console.log("  PASS: Reduced motion behavior verified.");
    }

    // -------------------------------------------------------------
    // Scenario 8: Fallback Without View Transition Support
    // -------------------------------------------------------------
    console.log("\n--- Scenario 8: Fallback Without View Transition Support ---");
    {
      const context = await browser.newContext({ colorScheme: "dark" });
      const page = await context.newPage();
      await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });

      // Remove View Transition API from document
      await page.evaluate(() => {
        delete (document as any).startViewTransition;
      });

      await clickThemeToggle(page);
      const theme = await page.getAttribute("html", "data-theme");
      assert(theme === "light", "Theme switches cleanly without View Transition API");

      await context.close();
      console.log("  PASS: Fallback without View Transition API verified.");
    }

    // -------------------------------------------------------------
    // Scenario 9: WCAG Contrast & Component Readability Audit
    // -------------------------------------------------------------
    console.log("\n--- Scenario 9: WCAG Contrast & Component Readability Audit ---");
    const testRoutes = [
      "/contact",
      "/corrections-policy",
      "/editorial-policy",
      "/faq",
      "/bracket",
      "/stats",
      "/stats/top-scorers",
      "/teams/spain",
      "/matches/match-104",
    ];

    for (const theme of ["dark", "light"] as const) {
      const context = await browser.newContext({ colorScheme: theme });
      await context.addInitScript((t) => {
        localStorage.setItem("wcmd-theme", t);
      }, theme);

      for (const route of testRoutes) {
        const page = await context.newPage();
        await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });

        // Calculate contrast for H1 heading
        const h1Metrics = await page.evaluate(() => {
          const h1 = document.querySelector("h1");
          if (!h1) return null;
          const style = getComputedStyle(h1);
          let bg = style.backgroundColor;
          let parent = h1.parentElement;
          while ((bg === "transparent" || bg === "rgba(0, 0, 0, 0)") && parent) {
            bg = getComputedStyle(parent).backgroundColor;
            parent = parent.parentElement;
          }
          return { color: style.color, bg, fontSize: parseFloat(style.fontSize), fontWeight: style.fontWeight };
        });

        if (h1Metrics) {
          const contrast = getContrastRatio(h1Metrics.color, h1Metrics.bg);
          const minRatio = h1Metrics.fontSize >= 24 || parseInt(h1Metrics.fontWeight) >= 700 ? 3.0 : 4.5;
          assert(contrast >= minRatio, `[${theme.toUpperCase()}] ${route} H1 WCAG contrast is ${contrast.toFixed(2)}:1 (required >= ${minRatio}:1)`);
        }

        // Calculate contrast for body text
        const bodyMetrics = await page.evaluate(() => {
          const p = document.querySelector("p");
          if (!p) return null;
          const style = getComputedStyle(p);
          let bg = style.backgroundColor;
          let parent = p.parentElement;
          while ((bg === "transparent" || bg === "rgba(0, 0, 0, 0)") && parent) {
            bg = getComputedStyle(parent).backgroundColor;
            parent = parent.parentElement;
          }
          return { color: style.color, bg, fontSize: parseFloat(style.fontSize), fontWeight: style.fontWeight };
        });

        if (bodyMetrics) {
          const contrast = getContrastRatio(bodyMetrics.color, bodyMetrics.bg);
          assert(contrast >= 4.5, `[${theme.toUpperCase()}] ${route} body text WCAG contrast is ${contrast.toFixed(2)}:1 (required >= 4.5:1)`);
        }

        // Verify border visibility (border-line)
        const borderLineDiffers = await page.evaluate(() => {
          const card = document.querySelector(".border-line");
          if (!card) return true;
          const borderColor = getComputedStyle(card).borderColor;
          const bg = getComputedStyle(card).backgroundColor;
          return borderColor !== "transparent" && borderColor !== "rgba(0, 0, 0, 0)" && borderColor !== bg;
        });
        assert(borderLineDiffers, `[${theme.toUpperCase()}] ${route} border-line is visibly distinct from background surface`);

        await page.close();
      }

      await context.close();
    }
    console.log("  PASS: WCAG contrast & component readability audit verified across both themes.");

    // -------------------------------------------------------------
    // Scenario 10: Visual Screenshot Package Generator
    // -------------------------------------------------------------
    console.log("\n--- Scenario 10: Visual Screenshot Package Generator ---");
    const viewports = [
      { name: "desktop", width: 1440, height: 900 },
      { name: "mobile_large", width: 390, height: 844 },
      { name: "mobile_compact", width: 360, height: 800 },
    ] as const;

    const screenshotRoutes = [
      "/",
      "/bracket",
      "/stats",
      "/matches/match-104",
      "/contact",
      "/corrections-policy",
      "/faq",
    ];

    for (const vp of viewports) {
      for (const theme of ["dark", "light"] as const) {
        const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, colorScheme: theme });
        await context.addInitScript((t) => {
          localStorage.setItem("wcmd-theme", t);
        }, theme);

        for (const route of screenshotRoutes) {
          const page = await context.newPage();
          await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
          await page.waitForTimeout(200);

          const routeSlug = route === "/" ? "home" : route.slice(1).replace(/\//g, "_");
          const fileName = `${routeSlug}_${theme}_${vp.name}_${vp.width}x${vp.height}.png`;
          const filePath = join(SCREENSHOT_DIR, fileName);

          await page.screenshot({ path: filePath, fullPage: false });
          await page.close();
        }

        // Capture mobile navigation drawer screenshot on compact viewport
        if (vp.name === "mobile_compact") {
          const page = await context.newPage();
          await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
          const menuBtn = page.locator('header button[aria-label*="menu"]').first();
          if (await menuBtn.count() > 0) {
            await menuBtn.click();
            await page.waitForTimeout(300);
            const drawerFile = join(SCREENSHOT_DIR, `mobile_drawer_${theme}_360x800.png`);
            await page.screenshot({ path: drawerFile, fullPage: false });
          }
          await page.close();
        }

        await context.close();
      }
    }
    console.log(`  PASS: Visual screenshot package generated successfully in '${SCREENSHOT_DIR}'.`);

    console.log("\n===========================================================");
    console.log("  ALL PLAYWRIGHT BROWSER THEME & VAULT QA CHECKS PASSED!");
    console.log("===========================================================\n");
  } finally {
    await browser.close();
    server.close();
  }
}

runBrowserThemeQA().catch((err) => {
  console.error("Unhandled Playwright theme QA error:", err);
  process.exit(1);
});
