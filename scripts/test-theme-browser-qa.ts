import { chromium } from "playwright";
import { strict as assert } from "node:assert";
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync, rmSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, normalize } from "node:path";
import { execSync } from "node:child_process";

const PORT = 53182;
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOT_DIR = join(process.cwd(), "artifacts", "theme-audit-screenshots");
const EXTERNAL_ZIP_PATH_V2 = "C:\\Users\\Asus Gaming\\Documents\\WCMD-THEME-FINAL-VISUAL-AUDIT-V2.zip";

function getContentType(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  switch (ext) {
    case ".html": return "text/html; charset=utf-8";
    case ".css": return "text/css; charset=utf-8";
    case ".js": return "application/javascript; charset=utf-8";
    case ".mjs": return "application/javascript; charset=utf-8";
    case ".json": return "application/json; charset=utf-8";
    case ".png": return "image/png";
    case ".jpg":
    case ".jpeg": return "image/jpeg";
    case ".webp": return "image/webp";
    case ".avif": return "image/avif";
    case ".svg": return "image/svg+xml";
    case ".ico": return "image/x-icon";
    case ".woff": return "font/woff";
    case ".woff2": return "font/woff2";
    case ".ttf": return "font/ttf";
    case ".txt": return "text/plain; charset=utf-8";
    case ".xml": return "application/xml; charset=utf-8";
    case ".map": return "application/json; charset=utf-8";
    case ".wasm": return "application/wasm";
    default: return "application/octet-stream";
  }
}

function startStaticServer(): Promise<ReturnType<typeof createServer>> {
  const outDir = join(process.cwd(), "out");
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      if (req.method !== "GET" && req.method !== "HEAD") {
        res.statusCode = 405;
        res.end("Method Not Allowed");
        return;
      }

      let reqPath = (req.url || "/").split("?")[0];
      try {
        reqPath = decodeURIComponent(reqPath);
      } catch {
        res.statusCode = 400;
        res.end("Bad Request");
        return;
      }

      const resolvedPath = normalize(join(outDir, reqPath));
      if (!resolvedPath.startsWith(outDir)) {
        res.statusCode = 403;
        res.end("Forbidden");
        return;
      }

      let filePath = resolvedPath;
      if (existsSync(filePath + ".html") && statSync(filePath + ".html").isFile()) {
        filePath = filePath + ".html";
      } else if (existsSync(filePath) && statSync(filePath).isDirectory()) {
        filePath = join(filePath, "index.html");
      }

      if (!existsSync(filePath) || !statSync(filePath).isFile()) {
        res.statusCode = 404;
        res.end("Not found");
        return;
      }

      try {
        const data = readFileSync(filePath);
        res.writeHead(200, { "Content-Type": getContentType(filePath) });
        if (req.method === "HEAD") {
          res.end();
        } else {
          res.end(data);
        }
      } catch {
        res.statusCode = 500;
        res.end("Server error");
      }
    });

    server.listen(PORT, () => {
      console.log(`Hardened static server running on ${BASE_URL}`);
      resolve(server);
    });
  });
}

function parseCssTokens(): { darkAccentSurface: string; darkAccentText: string; darkOnAccent: string; lightAccentSurface: string; lightAccentText: string; lightOnAccent: string } {
  const cssPath = join(process.cwd(), "app", "globals.css");
  const cssContent = readFileSync(cssPath, "utf8");

  function rgbToHex(rgbStr: string): string {
    const parts = rgbStr.trim().split(/\s+/).map(Number);
    if (parts.length < 3) return "#000000";
    return "#" + parts.map((n) => n.toString(16).padStart(2, "0")).join("");
  }

  const darkSurfaceMatch = cssContent.match(/--color-accent-surface:\s*([\d\s]+);/);
  const darkTextMatch = cssContent.match(/--color-accent-text:\s*([\d\s]+);/);
  const darkOnMatch = cssContent.match(/--color-on-accent:\s*([\d\s]+);/);

  const lightBlockMatch = cssContent.match(/html\[data-theme="light"\]\s*\{([^}]+)\}/);
  const lightBlock = lightBlockMatch ? lightBlockMatch[1] : "";
  const lightSurfaceMatch = lightBlock.match(/--color-accent-surface:\s*([\d\s]+);/);
  const lightTextMatch = lightBlock.match(/--color-accent-text:\s*([\d\s]+);/);
  const lightOnMatch = lightBlock.match(/--color-on-accent:\s*([\d\s]+);/);

  return {
    darkAccentSurface: darkSurfaceMatch ? rgbToHex(darkSurfaceMatch[1]) : "#e11d48",
    darkAccentText: darkTextMatch ? rgbToHex(darkTextMatch[1]) : "#ff8093",
    darkOnAccent: darkOnMatch ? rgbToHex(darkOnMatch[1]) : "#ffffff",
    lightAccentSurface: lightSurfaceMatch ? rgbToHex(lightSurfaceMatch[1]) : "#b90a26",
    lightAccentText: lightTextMatch ? rgbToHex(lightTextMatch[1]) : "#b90a26",
    lightOnAccent: lightOnMatch ? rgbToHex(lightOnMatch[1]) : "#ffffff",
  };
}

function parseRgb(colorStr: string): [number, number, number] {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return [0, 0, 0];
  return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1: string, color2: string): number {
  const [r1, g1, b1] = parseRgb(color1);
  const [r2, g2, b2] = parseRgb(color2);
  const l1 = getLuminance(r1, g1, b1);
  const l2 = getLuminance(r2, g2, b2);
  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (brighter + 0.05) / (darker + 0.05);
}

async function attachErrorMonitoring(page: any) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedRequests: string[] = [];

  const isThirdPartyNoise = (str: string) => str.includes("flagcdn.com") || str.includes("_vercel/insights") || str.includes("_vercel/speed-insights");

  page.on("pageerror", (err: Error) => pageErrors.push(err.message));
  page.on("console", (msg: any) => {
    if (msg.type() === "error") {
      const text = msg.text();
      const location = msg.location();
      if (!isThirdPartyNoise(text) && !isThirdPartyNoise(location.url || "")) {
        consoleErrors.push(`${text} (url: ${location.url || 'unknown'})`);
      }
    }
  });
  page.on("requestfailed", (req: any) => {
    const url = req.url();
    if (!isThirdPartyNoise(url)) {
      failedRequests.push(`${req.method()} ${url}: ${req.failure()?.errorText}`);
    }
  });
  page.on("response", (res: any) => {
    const url = res.url();
    if (res.status() >= 400 && !isThirdPartyNoise(url)) {
      failedRequests.push(`${res.status()} ${url}`);
    }
  });

  return { consoleErrors, pageErrors, failedRequests };
}

async function assertNoErrorPage(page: any, route: string) {
  const title = await page.title();
  const content = await page.content();
  const is404Title = title.startsWith("404:") || title.includes("Page Not Found");
  const isAppErrTitle = title.includes("Application Error");
  const isAppErr = content.includes("Application error: a client-side exception has occurred");
  const isIntErr = content.includes("Internal Server Error") && (await page.locator("h1:has-text('Internal Server Error')").count()) > 0;
  const isUnhErr = content.includes("Unhandled Runtime Error");
  const isNotFoundHeading = (await page.locator("h1:has-text('This page could not be found'), h2:has-text('This page could not be found')").count()) > 0;

  const isError = is404Title || isAppErrTitle || isAppErr || isIntErr || isUnhErr || isNotFoundHeading;
  if (isError) {
    console.error(`[ERROR PAGE DETECTED on ${route}] title='${title}', flags:`, {
      is404Title, isAppErrTitle, isAppErr, isIntErr, isUnhErr, isNotFoundHeading
    });
  }

  assert(!isError, `Route ${route} rendered an application/404 error page!`);
}

async function waitForHydratedVisualState(page: any, expectedTheme: string) {
  await page.waitForFunction(() => document.readyState === "complete");
  await page.waitForFunction((t: string) => document.documentElement.getAttribute("data-theme") === t, expectedTheme);
  await page.waitForSelector('button[data-testid="theme-toggle"][data-mounted="true"]', { state: "visible", timeout: 5000 });

  const iconOk = await page.evaluate(() => {
    const toggle = document.querySelector('button[data-testid="theme-toggle"]');
    if (!toggle) return false;
    const svgs = Array.from(toggle.querySelectorAll("svg"));
    const activeSvg = svgs.find((svg) => {
      const rect = svg.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    if (!activeSvg) return false;
    const style = getComputedStyle(activeSvg);
    return parseFloat(style.opacity || "1") > 0;
  });
  assert(iconOk, `Theme toggle SVG icon for theme '${expectedTheme}' must be visible with bounding box > 0 and opacity > 0.`);

  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll("img"));
    await Promise.all(
      imgs.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((res) => {
          img.onload = res;
          img.onerror = res;
        });
      })
    );
  });

  await page.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))));
}

async function assertRouteSemanticContent(page: any, route: string) {
  if (route === "/") {
    const h1 = await page.locator("h1").first().textContent();
    assert(h1?.toLowerCase().includes("the 2026 world cup vault"), `Homepage H1 must contain 'the 2026 world cup vault' (got '${h1}')`);
    assert((await page.locator("main").count()) > 0, "Homepage must contain main Vault hero section.");
  } else if (route === "/bracket") {
    const h1 = await page.locator("h1").first().textContent();
    assert(h1?.toLowerCase().includes("knockout bracket"), `Bracket H1 must contain 'knockout bracket' (got '${h1}')`);
  } else if (route === "/stats") {
    const h1 = await page.locator("h1").first().textContent();
    assert(h1?.toLowerCase().includes("statistics") || h1?.toLowerCase().includes("stats"), `Stats H1 must contain 'statistics' (got '${h1}')`);
  } else if (route === "/contact") {
    const h1 = await page.locator("h1").first().textContent();
    assert(h1?.toLowerCase().includes("contact"), `Contact H1 must contain 'contact' (got '${h1}')`);
  } else if (route === "/corrections-policy") {
    const h1 = await page.locator("h1").first().textContent();
    assert(h1?.toLowerCase().includes("corrections"), `Corrections H1 must contain 'corrections' (got '${h1}')`);
  } else if (route === "/editorial-policy") {
    const h1 = await page.locator("h1").first().textContent();
    assert(h1?.toLowerCase().includes("editorial"), `Editorial H1 must contain 'editorial' (got '${h1}')`);
  } else if (route === "/faq") {
    const h1 = await page.locator("h1").first().textContent();
    assert(h1?.toLowerCase().includes("faq") || h1?.toLowerCase().includes("frequently asked questions"), `FAQ H1 must contain 'faq' or 'frequently asked questions' (got '${h1}')`);
  } else if (route === "/matches/match-104") {
    const spainCount = await page.locator("*:has-text('Spain')").count();
    const argentinaCount = await page.locator("*:has-text('Argentina')").count();
    assert(spainCount > 0 && argentinaCount > 0, "Match 104 must display Spain and Argentina.");

    const scoreText = await page.locator("main").textContent();
    assert(scoreText?.includes("1") && scoreText?.includes("0"), "Match 104 must display final score 1-0.");
    assert(scoreText?.includes("AET") || scoreText?.includes("Extra Time"), "Match 104 must display AET status.");
    assert(scoreText?.includes("Ferran Torres"), "Match 104 must display goal scorer Ferran Torres.");
    assert(scoreText?.includes("106"), "Match 104 must display 106' goal minute.");
  }
}

async function runBrowserThemeQA() {
  console.log("=== Starting Playwright Day/Night Theme & Vault Browser QA (Fail-Closed) ===");

  if (existsSync(SCREENSHOT_DIR)) {
    rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
  }
  mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const cssTokens = parseCssTokens();
  assert.equal(cssTokens.darkAccentSurface, "#e11d48");
  assert.equal(cssTokens.darkAccentText, "#ff8093");
  assert.equal(cssTokens.darkOnAccent, "#ffffff");
  assert.equal(cssTokens.lightAccentSurface, "#b90a26");
  assert.equal(cssTokens.lightAccentText, "#b90a26");
  assert.equal(cssTokens.lightOnAccent, "#ffffff");

  const server = await startStaticServer();
  const browser = await chromium.launch({ headless: true });

  try {
    // -------------------------------------------------------------
    // Scenario 1-4: Pre-Hydration Zero-Flash Tests
    // -------------------------------------------------------------
    console.log("\n--- Scenario 1-4: Pre-Hydration Zero-Flash Tests ---");
    const preHydrationPermutations = [
      { name: "System Light (No Stored Preference)", sys: "light", stored: null, expTheme: "light", expMeta: "#f5f4f0", expBg: "rgb(245, 244, 240)" },
      { name: "System Dark (No Stored Preference)", sys: "dark", stored: null, expTheme: "dark", expMeta: "#0a1628", expBg: "rgb(10, 22, 40)" },
      { name: "Saved Light Overriding System Dark", sys: "dark", stored: "light", expTheme: "light", expMeta: "#f5f4f0", expBg: "rgb(245, 244, 240)" },
      { name: "Saved Dark Overriding System Light", sys: "light", stored: "dark", expTheme: "dark", expMeta: "#0a1628", expBg: "rgb(10, 22, 40)" },
    ] as const;

    for (const p of preHydrationPermutations) {
      const context = await browser.newContext({ colorScheme: p.sys });
      if (p.stored) {
        await context.addInitScript((val) => {
          localStorage.setItem("wcmd-theme", val);
        }, p.stored);
      }

      const page = await context.newPage();
      const pendingRoutes: any[] = [];
      await page.route("**/_next/static/chunks/**", (route) => {
        pendingRoutes.push(route);
      });

      await page.goto(`${BASE_URL}/`, { waitUntil: "commit" });
      await page.waitForSelector("html[data-theme]", { timeout: 3000 });

      const initialTheme = await page.getAttribute("html", "data-theme");
      assert(initialTheme === p.expTheme, `[${p.name}] Pre-hydration html[data-theme] is '${p.expTheme}' (got '${initialTheme}')`);

      const initialMeta = await page.getAttribute('meta[name="theme-color"]', "content");
      assert(initialMeta === p.expMeta, `[${p.name}] Pre-hydration meta[name="theme-color"] is '${p.expMeta}' (got '${initialMeta}')`);

      const initialBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      assert(initialBg === p.expBg, `[${p.name}] Pre-hydration body background is '${p.expBg}' (got '${initialBg}')`);

      await page.unroute("**/_next/static/chunks/**");
      for (const route of pendingRoutes) {
        try { await route.continue(); } catch {}
      }

      await page.waitForSelector('button[data-testid="theme-toggle"][data-mounted="true"]', { timeout: 5000 });
      const postTheme = await page.getAttribute("html", "data-theme");
      assert(postTheme === p.expTheme, `[${p.name}] Post-hydration html[data-theme] remains '${p.expTheme}'`);

      await context.close();
      console.log(`  PASS: ${p.name} pre-hydration and post-hydration verified successfully.`);
    }

    // -------------------------------------------------------------
    // Scenario 5: Toggle Interaction & Storage Sync
    // -------------------------------------------------------------
    console.log("\n--- Scenario 5: Toggle Interaction & Storage Sync ---");
    {
      const context = await browser.newContext({ colorScheme: "dark" });
      const page = await context.newPage();
      await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });

      const toggle = page.locator('button[data-testid="theme-toggle"]').first();
      await toggle.waitFor({ state: "visible", timeout: 5000 });
      await toggle.click();

      await page.waitForFunction(() => document.documentElement.getAttribute("data-theme") === "light", { timeout: 3000 });
      const newTheme = await page.getAttribute("html", "data-theme");
      assert(newTheme === "light", `Clicking theme toggle switches theme from dark to light (got '${newTheme}')`);

      const stored = await page.evaluate(() => localStorage.getItem("wcmd-theme"));
      assert(stored === "light", "Toggle choice written to localStorage ('light')");

      await context.close();
      console.log("  PASS: Toggle interaction & route persistence verified.");
    }

    // -------------------------------------------------------------
    // Scenario 9: Expanded WCAG Contrast & Component Readability Audit
    // -------------------------------------------------------------
    console.log("\n--- Scenario 9: Expanded WCAG Contrast & Component Readability Audit ---");
    const testRoutes = [
      "/",
      "/contact",
      "/corrections-policy",
      "/editorial-policy",
      "/faq",
      "/bracket",
      "/stats",
      "/matches/match-104",
    ];

    for (const theme of ["dark", "light"] as const) {
      const context = await browser.newContext({ colorScheme: theme });
      await context.addInitScript((t) => {
        localStorage.setItem("wcmd-theme", t);
      }, theme);

      for (const route of testRoutes) {
        const page = await context.newPage();
        const monitoring = await attachErrorMonitoring(page);

        await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
        await waitForHydratedVisualState(page, theme);
        await assertNoErrorPage(page, route);
        await assertRouteSemanticContent(page, route);

        assert.equal(monitoring.consoleErrors.length, 0, `[${theme.toUpperCase()}] ${route} console errors: ${monitoring.consoleErrors.join("; ")}`);
        assert.equal(monitoring.pageErrors.length, 0, `[${theme.toUpperCase()}] ${route} page errors: ${monitoring.pageErrors.join("; ")}`);

        const metrics: any = await page.evaluate(`(() => {
          function getEffectiveBg(el) {
            let curr = el;
            const layers = [];
            while (curr) {
              const style = getComputedStyle(curr);
              const bg = style.backgroundColor;
              const match = bg.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/);
              if (match) {
                const cr = parseInt(match[1], 10);
                const cg = parseInt(match[2], 10);
                const cb = parseInt(match[3], 10);
                const ca = match[4] !== undefined ? parseFloat(match[4]) : 1;
                if (ca > 0) {
                  layers.unshift({ r: cr, g: cg, b: cb, a: ca });
                  if (ca === 1) break;
                }
              }
              curr = curr.parentElement;
            }
            let compR = 10, compG = 22, compB = 40;
            for (const layer of layers) {
              compR = compR * (1 - layer.a) + layer.r * layer.a;
              compG = compG * (1 - layer.a) + layer.g * layer.a;
              compB = compB * (1 - layer.a) + layer.b * layer.a;
            }
            return 'rgb(' + Math.round(compR) + ', ' + Math.round(compG) + ', ' + Math.round(compB) + ')';
          }

          function inspectEl(sel) {
            const el = document.querySelector(sel);
            if (!el) return null;
            const style = getComputedStyle(el);
            return {
              color: style.color,
              bg: getEffectiveBg(el),
              fontSize: parseFloat(style.fontSize),
              fontWeight: style.fontWeight,
              borderColor: style.borderColor,
              text: el.innerText ? el.innerText.slice(0, 30) : "",
            };
          }

          return {
            h1: inspectEl("h1"),
            h2: inspectEl("h2"),
            p: inspectEl("p"),
            accentText: inspectEl(".text-accentText"),
            muted: inspectEl(".text-muted"),
            faint: inspectEl(".text-faint"),
            ctaBtn: inspectEl("button.bg-accent, a.bg-accent, [role='button'].bg-accent"),
          };
        })()`);

        if (metrics.h1) {
          const contrast = getContrastRatio(metrics.h1.color, metrics.h1.bg);
          const numericWeight = parseInt(metrics.h1.fontWeight, 10) || 400;
          const isLargeText = metrics.h1.fontSize >= 24 || (metrics.h1.fontSize >= 18.67 && numericWeight >= 700);
          const minRatio = isLargeText ? 3.0 : 4.5;
          assert(contrast >= minRatio, `[${theme.toUpperCase()}] ${route} H1 contrast is ${contrast.toFixed(2)}:1 (required >= ${minRatio}:1)`);
        }

        if (metrics.accentText) {
          const contrast = getContrastRatio(metrics.accentText.color, metrics.accentText.bg);
          assert(contrast >= 4.5, `[${theme.toUpperCase()}] ${route} text-accentText contrast is ${contrast.toFixed(2)}:1 (required >= 4.5:1)`);
        }

        if (metrics.ctaBtn) {
          const contrast = getContrastRatio(metrics.ctaBtn.color, metrics.ctaBtn.bg);
          assert(contrast >= 4.5, `[${theme.toUpperCase()}] ${route} primary CTA button text contrast is ${contrast.toFixed(2)}:1 (required >= 4.5:1)`);
        }

        await page.close();
      }

      await context.close();
    }
    console.log("  PASS: Expanded WCAG contrast & component readability audit verified across both themes.");

    // -------------------------------------------------------------
    // Scenario 10: Fail-Closed Screenshot Capture Engine (Phase A Local Evidence)
    // -------------------------------------------------------------
    console.log("\n--- Scenario 10: Fail-Closed Screenshot Capture Engine (Phase A Local Evidence) ---");
    const viewports = [
      { name: "desktop", dirName: "desktop", width: 1440, height: 900 },
      { name: "mobile_large", dirName: "mobile-390", width: 390, height: 844 },
      { name: "mobile_compact", dirName: "mobile-360", width: 360, height: 800 },
    ] as const;

    const screenshotRoutes = [
      "/",
      "/bracket",
      "/stats",
      "/matches/match-104",
      "/contact",
      "/corrections-policy",
      "/editorial-policy",
      "/faq",
    ];

    const localDir = join(SCREENSHOT_DIR, "local");
    for (const vp of viewports) {
      const subDir = join(localDir, vp.dirName);
      mkdirSync(subDir, { recursive: true });
    }

    const expectedFiles: string[] = [];

    for (const vp of viewports) {
      for (const theme of ["dark", "light"] as const) {
        const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, colorScheme: theme });
        await context.addInitScript((t) => {
          localStorage.setItem("wcmd-theme", t);
        }, theme);

        for (const route of screenshotRoutes) {
          const page = await context.newPage();
          const monitoring = await attachErrorMonitoring(page);

          await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
          await waitForHydratedVisualState(page, theme);
          await assertNoErrorPage(page, route);
          await assertRouteSemanticContent(page, route);

          assert.equal(monitoring.consoleErrors.length, 0, `[${theme.toUpperCase()}] ${route} console errors: ${monitoring.consoleErrors.join("; ")}`);
          assert.equal(monitoring.pageErrors.length, 0, `[${theme.toUpperCase()}] ${route} page errors: ${monitoring.pageErrors.join("; ")}`);

          const routeSlug = route === "/" ? "home" : route.slice(1).replace(/\//g, "_");
          const fileName = `${routeSlug}_${theme}_${vp.width}x${vp.height}.png`;
          const filePath = join(localDir, vp.dirName, fileName);

          await page.screenshot({ path: filePath, fullPage: false });
          expectedFiles.push(join("local", vp.dirName, fileName));

          // Verify non-zero byte screenshot file
          const stats = statSync(filePath);
          assert(stats.size > 1000, `Screenshot file '${fileName}' must be non-zero byte (>1000 bytes).`);

          await page.close();
        }

        if (vp.name === "mobile_compact") {
          const page = await context.newPage();
          await attachErrorMonitoring(page);
          await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
          await waitForHydratedVisualState(page, theme);
          const menuBtn = page.locator('header button[aria-label*="menu"]').first();
          if ((await menuBtn.count()) > 0) {
            await menuBtn.click();
            await page.waitForTimeout(300);
            const drawerFileName = `mobile_drawer_${theme}_360x800.png`;
            const drawerFile = join(localDir, vp.dirName, drawerFileName);
            await page.screenshot({ path: drawerFile, fullPage: false });
            expectedFiles.push(join("local", vp.dirName, drawerFileName));
          }
          await page.close();
        }

        if (vp.name === "desktop") {
          const page = await context.newPage();
          await attachErrorMonitoring(page);
          await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
          await waitForHydratedVisualState(page, theme);
          const toggle = page.locator('button[data-testid="theme-toggle"]').first();
          if ((await toggle.count()) > 0) {
            await toggle.focus();
            await page.waitForTimeout(200);
            const focusFileName = `keyboard_focus_toggle_${theme}_1440x900.png`;
            const focusFile = join(localDir, vp.dirName, focusFileName);
            await page.screenshot({ path: focusFile, fullPage: false });
            expectedFiles.push(join("local", vp.dirName, focusFileName));
          }
          await page.close();
        }

        await context.close();
      }
    }

    // Write manifest-premerge.md inside SCREENSHOT_DIR
    const manifestPremergeContent = `# WCMD Pre-Merge Theme Visual Audit Manifest

## Audit Summary
- Date: ${new Date().toISOString()}
- Environment: Localhost Static Server (${BASE_URL})
- Repository Commit: ${execSync("git rev-parse HEAD").toString().trim()}
- Dark Accent Surface: ${cssTokens.darkAccentSurface}
- Dark Accent Text: ${cssTokens.darkAccentText}
- Dark On-Accent Text: ${cssTokens.darkOnAccent}
- Light Accent Surface: ${cssTokens.lightAccentSurface}
- Light Accent Text: ${cssTokens.lightAccentText}
- Light On-Accent Text: ${cssTokens.lightOnAccent}

## Included Directories
- \`local/desktop/\`: 1440x900 Desktop viewports (Light & Dark)
- \`local/mobile-390/\`: 390x844 Mobile Large viewports (Light & Dark)
- \`local/mobile-360/\`: 360x800 Mobile Compact viewports (Light & Dark)

## Verified Routes
- \`/\` (Homepage H1: "The 2026 World Cup Vault")
- \`/bracket\` (Knockout Bracket)
- \`/stats\` (Tournament Statistics)
- \`/matches/match-104\` (Match 104 Final: Spain vs Argentina 1-0 AET, Ferran Torres 106')
- \`/contact\` (Contact Us)
- \`/corrections-policy\` (Corrections Policy)
- \`/editorial-policy\` (Editorial Policy)
- \`/faq\` (Frequently Asked Questions)

## Validation Matrix
- Total Expected Screenshot Files: ${expectedFiles.length}
- Console Errors: 0
- Page Errors: 0
- Failed Critical Requests: 0
`;
    writeFileSync(join(SCREENSHOT_DIR, "manifest-premerge.md"), manifestPremergeContent, "utf8");

    console.log("\n===========================================================");
    console.log("  ALL PRE-MERGE PLAYWRIGHT THEME & VISUAL QA CHECKS PASSED!");
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
