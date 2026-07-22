import { chromium, Browser, Page } from "playwright";
import http from "http";
import path from "path";
import fs from "fs";

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "application/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};

function serveStaticFile(req: http.IncomingMessage, res: http.ServerResponse, publicDir: string) {
  let reqPath = (req.url || "/").split("?")[0];
  if (reqPath.startsWith("/")) reqPath = reqPath.slice(1);
  let filePath = path.join(publicDir, reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    const indexPath = path.join(filePath, "index.html");
    if (fs.existsSync(indexPath)) {
      filePath = indexPath;
    }
  }

  if (!fs.existsSync(filePath) && fs.existsSync(`${filePath}.html`)) {
    filePath = `${filePath}.html`;
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(publicDir, "404.html");
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  } catch (e) {
    res.writeHead(404);
    res.end("Not Found");
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  PASS: ${message}`);
}

async function runBrowserThemeQA() {
  console.log("=== Starting Playwright Day/Night Theme & Vault Browser QA ===");

  // Ensure build exists
  const outDir = path.join(process.cwd(), "out");
  if (!fs.existsSync(outDir)) {
    console.error("FAIL: 'out' directory missing. Please run 'npm run build:p0' before running browser QA.");
    process.exit(1);
  }

  // Start local static server on dynamic free port
  const server = http.createServer((req, res) => {
    serveStaticFile(req, res, outDir);
  });

  const { baseUrl } = await new Promise<{ baseUrl: string }>((resolve) => {
    server.listen(0, () => {
      const addr = server.address();
      const actualPort = typeof addr === "object" && addr ? addr.port : 3098;
      resolve({ baseUrl: `http://localhost:${actualPort}` });
    });
  });
  console.log(`  Static server running on ${baseUrl}`);

  const browser = await chromium.launch({ headless: true });

  try {
    // ── Scenario 1: System Light, No Saved Preference ────────────────────────
    console.log("\n--- Scenario 1: System Light (No Saved Preference) ---");
    {
      const context = await browser.newContext({ colorScheme: "light" });
      const page = await context.newPage();
      await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
      const themeAttr = await page.getAttribute("html", "data-theme");
      assert(themeAttr === "light", "Root data-theme is 'light' when OS prefers light");

      const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      assert(bodyBg === "rgb(245, 244, 240)", `Body background is light canvas rgb(245, 244, 240) (got ${bodyBg})`);

      const metaColor = await page.getAttribute('meta[name="theme-color"]', "content");
      assert(metaColor === "#f5f4f0", `theme-color meta is #f5f4f0 (got ${metaColor})`);
      await context.close();
    }

    // ── Scenario 2: System Dark, No Saved Preference ─────────────────────────
    console.log("\n--- Scenario 2: System Dark (No Saved Preference) ---");
    {
      const context = await browser.newContext({ colorScheme: "dark" });
      const page = await context.newPage();
      await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
      const themeAttr = await page.getAttribute("html", "data-theme");
      assert(themeAttr === "dark", "Root data-theme is 'dark' when OS prefers dark");

      const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      assert(bodyBg === "rgb(10, 22, 40)", `Body background is dark canvas rgb(10, 22, 40) (got ${bodyBg})`);

      const metaColor = await page.getAttribute('meta[name="theme-color"]', "content");
      assert(metaColor === "#0a1628", `theme-color meta is #0a1628 (got ${metaColor})`);
      await context.close();
    }

    // ── Scenario 3: Saved Light Overriding System Dark ────────────────────────
    console.log("\n--- Scenario 3: Saved Light Overriding System Dark ---");
    {
      const context = await browser.newContext({ colorScheme: "dark" });
      const page = await context.newPage();
      await page.addInitScript(() => {
        localStorage.setItem("wcmd-theme", "light");
      });
      await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
      const themeAttr = await page.getAttribute("html", "data-theme");
      assert(themeAttr === "light", "Saved 'light' overrides OS dark");

      const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      assert(bodyBg === "rgb(245, 244, 240)", `Body background is light canvas rgb(245, 244, 240) (got ${bodyBg})`);
      await context.close();
    }

    // ── Scenario 4: Saved Dark Overriding System Light ────────────────────────
    console.log("\n--- Scenario 4: Saved Dark Overriding System Light ---");
    {
      const context = await browser.newContext({ colorScheme: "light" });
      const page = await context.newPage();
      await page.addInitScript(() => {
        localStorage.setItem("wcmd-theme", "dark");
      });
      await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
      const themeAttr = await page.getAttribute("html", "data-theme");
      assert(themeAttr === "dark", "Saved 'dark' overrides OS light");

      const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      assert(bodyBg === "rgb(10, 22, 40)", `Body background is dark canvas rgb(10, 22, 40) (got ${bodyBg})`);
      await context.close();
    }

    // ── Scenario 5: Pre-Hydration Zero-Flash & Single Meta Verification ──────
    console.log("\n--- Scenario 5: Pre-Hydration Zero-Flash & Meta Integrity ---");
    {
      const context = await browser.newContext({ colorScheme: "light", javaScriptEnabled: false });
      const page = await context.newPage();
      await page.goto(`${baseUrl}/`, { waitUntil: "commit" });

      const metaCount = await page.evaluate(() => document.querySelectorAll('meta[name="theme-color"]').length);
      assert(metaCount <= 1, `No duplicate meta[name="theme-color"] tags exist (found ${metaCount})`);

      await context.close();
    }

    // ── Scenario 6: Toggle Interaction, Refresh & Route Persistence ──────────
    console.log("\n--- Scenario 6: Toggle Interaction, Refresh & Route Persistence ---");
    {
      const context = await browser.newContext({ colorScheme: "dark" });
      const page = await context.newPage();
      await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });

      // Click toggle button to switch to light
      const toggle = page.locator('button[aria-label*="mode"]').first();
      await toggle.click();
      await page.waitForTimeout(500);

      let themeAttr = await page.getAttribute("html", "data-theme");
      assert(themeAttr === "light", "Clicking toggle switches theme from dark to light");

      const storedValue = await page.evaluate(() => localStorage.getItem("wcmd-theme"));
      assert(storedValue === "light", "Toggle choice is written to localStorage ('light')");

      // Reload page and check persistence
      await page.reload({ waitUntil: "networkidle" });
      themeAttr = await page.getAttribute("html", "data-theme");
      assert(themeAttr === "light", "Reloading page preserves user choice ('light')");

      // Navigate to another route and check persistence
      await page.goto(`${baseUrl}/schedule`, { waitUntil: "networkidle" });
      themeAttr = await page.getAttribute("html", "data-theme");
      assert(themeAttr === "light", "Navigating to /schedule preserves user choice ('light')");

      await context.close();
    }

    // ── Scenario 7: Cross-Tab Storage Synchronization ────────────────────────
    console.log("\n--- Scenario 7: Cross-Tab Storage Synchronization ---");
    {
      const context = await browser.newContext({ colorScheme: "dark" });
      const page1 = await context.newPage();
      const page2 = await context.newPage();

      await page1.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
      await page2.goto(`${baseUrl}/schedule`, { waitUntil: "networkidle" });

      // Click toggle on Page 1
      const toggle1 = page1.locator('button[aria-label*="mode"]').first();
      await toggle1.click();
      await page1.waitForTimeout(500);

      const theme2Attr = await page2.getAttribute("html", "data-theme");
      assert(theme2Attr === "light", "Page 2 automatically updates to 'light' via storage event");

      await context.close();
    }

    // ── Scenario 8: Reduced Motion Behavior ──────────────────────────────────
    console.log("\n--- Scenario 8: Reduced Motion Behavior ---");
    {
      const context = await browser.newContext({ colorScheme: "dark", reducedMotion: "reduce" });
      const page = await context.newPage();
      await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });

      const toggle = page.locator('button[aria-label*="mode"]').first();
      await toggle.click();
      await page.waitForTimeout(100);

      const themeAttr = await page.getAttribute("html", "data-theme");
      assert(themeAttr === "light", "Theme switches immediately when prefers-reduced-motion is reduce");

      await context.close();
    }

    // ── Scenario 9: Browser Fallback Without View Transitions ─────────────────
    console.log("\n--- Scenario 9: Fallback Without View Transition Support ---");
    {
      const context = await browser.newContext({ colorScheme: "dark" });
      const page = await context.newPage();
      await page.addInitScript(() => {
        delete (document as any).startViewTransition;
      });
      await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });

      const toggle = page.locator('button[aria-label*="mode"]').first();
      await toggle.click();
      await page.waitForTimeout(200);

      const themeAttr = await page.getAttribute("html", "data-theme");
      assert(themeAttr === "light", "Theme switches cleanly without View Transition API");

      await context.close();
    }

    // ── Scenario 10: Rapid Repeated Toggle Activation ───────────────────────
    console.log("\n--- Scenario 10: Rapid Repeated Toggle Activation ---");
    {
      const context = await browser.newContext({ colorScheme: "dark" });
      const page = await context.newPage();
      await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });

      const toggle = page.locator('button[aria-label*="mode"]').first();
      for (let i = 0; i < 6; i++) {
        await toggle.click({ force: true }).catch(() => {});
        await page.waitForTimeout(50);
      }
      await page.waitForTimeout(600);

      const themeAttr = await page.getAttribute("html", "data-theme");
      const stored = await page.evaluate(() => localStorage.getItem("wcmd-theme"));
      const colorScheme = await page.evaluate(() => document.documentElement.style.colorScheme);

      assert(themeAttr === stored, `data-theme ('${themeAttr}') and localStorage ('${stored}') match after rapid clicks`);
      assert(themeAttr === colorScheme, `data-theme ('${themeAttr}') and colorScheme ('${colorScheme}') match after rapid clicks`);

      await context.close();
    }

    // ── Scenario 11: Comprehensive Route Matrix & Computed Style Verification ─
    console.log("\n--- Scenario 11: Route Matrix & Visual Computed Style Checks ---");
    const routesToTest = [
      "/",
      "/schedule",
      "/groups",
      "/bracket",
      "/stats",
      "/stats/top-scorers",
      "/stats/compare",
      "/teams",
      "/teams/spain",
      "/world-cup-2026",
      "/matches/match-104",
    ];

    for (const theme of ["dark", "light"] as const) {
      console.log(`\nTesting Route Matrix in ${theme.toUpperCase()} mode...`);
      const context = await browser.newContext({ colorScheme: theme });
      await context.addInitScript((t) => {
        localStorage.setItem("wcmd-theme", t);
      }, theme);

      for (const route of routesToTest) {
        const page = await context.newPage();
        await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
        const rootTheme = await page.getAttribute("html", "data-theme");
        assert(rootTheme === theme, `[${theme.toUpperCase()}] ${route} root data-theme is '${theme}'`);

        // Check text readability
        const h1Color = await page.evaluate(() => {
          const h1 = document.querySelector("h1");
          return h1 ? getComputedStyle(h1).color : "none";
        });
        assert(h1Color !== "transparent" && h1Color !== "rgba(0, 0, 0, 0)", `[${theme.toUpperCase()}] ${route} H1 text is visible (color: ${h1Color})`);

        // Check "2026 Vault" label in header nav
        const vaultNav = page.locator('nav[aria-label="Primary"] a[href="/world-cup-2026"]').first();
        if (await vaultNav.count() > 0) {
          const navText = await vaultNav.textContent();
          assert(navText?.trim() === "2026 Vault", `[${theme.toUpperCase()}] Header nav label is '2026 Vault' on ${route}`);
        }
        await page.close();
      }

      await context.close();
    }

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
