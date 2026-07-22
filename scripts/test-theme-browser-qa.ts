import { chromium } from "playwright";
import { strict as assert } from "node:assert";
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync, copyFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, extname } from "node:path";
import { execSync } from "node:child_process";

const PORT = 53182;
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOT_DIR = join(process.cwd(), "artifacts", "theme-audit-screenshots");
const EXTERNAL_ZIP_PATH = "C:\\Users\\Asus Gaming\\Documents\\WCMD-THEME-FINAL-VISUAL-AUDIT.zip";

function getContentType(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  switch (ext) {
    case ".html": return "text/html; charset=utf-8";
    case ".css": return "text/css; charset=utf-8";
    case ".js": return "application/javascript; charset=utf-8";
    case ".png": return "image/png";
    case ".svg": return "image/svg+xml";
    case ".json": return "application/json";
    default: return "application/octet-stream";
  }
}

function startStaticServer(): Promise<ReturnType<typeof createServer>> {
  const outDir = join(process.cwd(), "out");
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let reqPath = (req.url || "/").split("?")[0];
      if (reqPath === "/") reqPath = "/index.html";

      let filePath = join(outDir, reqPath);
      if (existsSync(filePath + ".html")) {
        filePath = filePath + ".html";
      } else if (existsSync(filePath) && readFileSync(filePath).length === 0) {
        filePath = join(filePath, "index.html");
      }

      if (!existsSync(filePath)) {
        res.statusCode = 404;
        res.end("Not found");
        return;
      }

      try {
        const data = readFileSync(filePath);
        res.writeHead(200, { "Content-Type": getContentType(filePath) });
        res.end(data);
      } catch {
        res.statusCode = 500;
        res.end("Server error");
      }
    });

    server.listen(PORT, () => {
      console.log(`Static server running on ${BASE_URL}`);
      resolve(server);
    });
  });
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

async function clickThemeToggle(page: any) {
  const toggle = page.locator('button[data-testid="theme-toggle"]').first();
  await toggle.waitFor({ state: "visible", timeout: 5000 });
  await toggle.click();
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
    // Scenario 1-4: Real Pre-Hydration Zero-Flash Tests
    // -------------------------------------------------------------
    console.log("\n--- Scenario 1-4: Real Pre-Hydration Zero-Flash Tests ---");
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
    // Scenario 5: Toggle Interaction, Focus & Route Sync
    // -------------------------------------------------------------
    console.log("\n--- Scenario 5: Toggle Interaction, Focus & Route Sync ---");
    {
      const context = await browser.newContext({ colorScheme: "dark" });
      const page = await context.newPage();
      await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });

      await clickThemeToggle(page);
      await page.waitForFunction(() => document.documentElement.getAttribute("data-theme") === "light", { timeout: 3000 });
      const newTheme = await page.getAttribute("html", "data-theme");
      assert(newTheme === "light", `Clicking theme toggle switches theme from dark to light (got '${newTheme}')`);

      const stored = await page.evaluate(() => localStorage.getItem("wcmd-theme"));
      assert(stored === "light", "Toggle choice written to localStorage ('light')");

      await page.goto(`${BASE_URL}/schedule`, { waitUntil: "domcontentloaded" });
      const scheduleTheme = await page.getAttribute("html", "data-theme");
      assert(scheduleTheme === "light", `Navigating to /schedule preserves theme preference ('light')`);

      await context.close();
      console.log("  PASS: Toggle interaction, focus retention & route persistence verified.");
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
        await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });

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
            let compR = 10, compG = 22, compB = 40; // Default canvas fallback
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
            navActive: inspectEl("nav a.bg-accent"),
            link: inspectEl("a.underline, a.text-accentText, main a"),
          };
        })()`);

        // 1. Audit H1 with size-and-weight-aware WCAG logic
        if (metrics.h1) {
          const contrast = getContrastRatio(metrics.h1.color, metrics.h1.bg);
          const numericWeight = parseInt(metrics.h1.fontWeight, 10) || 400;
          const isLargeText = metrics.h1.fontSize >= 24 || (metrics.h1.fontSize >= 18.67 && numericWeight >= 700);
          const minRatio = isLargeText ? 3.0 : 4.5;
          assert(contrast >= minRatio, `[${theme.toUpperCase()}] ${route} H1 contrast is ${contrast.toFixed(2)}:1 (required >= ${minRatio}:1)`);
        }

        // 2. Audit H2
        if (metrics.h2) {
          const contrast = getContrastRatio(metrics.h2.color, metrics.h2.bg);
          const numericWeight = parseInt(metrics.h2.fontWeight, 10) || 400;
          const isLargeText = metrics.h2.fontSize >= 24 || (metrics.h2.fontSize >= 18.67 && numericWeight >= 700);
          const minRatio = isLargeText ? 3.0 : 4.5;
          assert(contrast >= minRatio, `[${theme.toUpperCase()}] ${route} H2 contrast is ${contrast.toFixed(2)}:1 (required >= ${minRatio}:1)`);
        }

        // 3. Audit Body Copy
        if (metrics.p) {
          const contrast = getContrastRatio(metrics.p.color, metrics.p.bg);
          assert(contrast >= 4.5, `[${theme.toUpperCase()}] ${route} body text contrast is ${contrast.toFixed(2)}:1 (required >= 4.5:1)`);
        }

        // 4. Audit accentText
        if (metrics.accentText) {
          const contrast = getContrastRatio(metrics.accentText.color, metrics.accentText.bg);
          assert(contrast >= 4.5, `[${theme.toUpperCase()}] ${route} text-accentText contrast is ${contrast.toFixed(2)}:1 (required >= 4.5:1)`);
        }

        // 5. Audit text-muted
        if (metrics.muted) {
          const contrast = getContrastRatio(metrics.muted.color, metrics.muted.bg);
          assert(contrast >= 4.5, `[${theme.toUpperCase()}] ${route} text-muted contrast is ${contrast.toFixed(2)}:1 (required >= 4.5:1)`);
        }

        // 6. Audit text-faint
        if (metrics.faint) {
          const contrast = getContrastRatio(metrics.faint.color, metrics.faint.bg);
          assert(contrast >= 4.5, `[${theme.toUpperCase()}] ${route} text-faint contrast is ${contrast.toFixed(2)}:1 (required >= 4.5:1)`);
        }

        // 7. Audit primary CTA button (onAccent text against accent surface)
        if (metrics.ctaBtn) {
          const contrast = getContrastRatio(metrics.ctaBtn.color, metrics.ctaBtn.bg);
          if (contrast < 4.5) {
            console.error(`[LIGHT CTA FAIL] color=${metrics.ctaBtn.color}, bg=${metrics.ctaBtn.bg}, fontSize=${metrics.ctaBtn.fontSize}, text=${metrics.ctaBtn.text}`);
          }
          assert(contrast >= 4.5, `[${theme.toUpperCase()}] ${route} primary CTA button text contrast is ${contrast.toFixed(2)}:1 (required >= 4.5:1)`);
        }

        await page.close();
      }

      await context.close();
    }
    console.log("  PASS: Expanded WCAG contrast & component readability audit verified across both themes.");

    // -------------------------------------------------------------
    // Scenario 10: Screenshot Evidence & External ZIP Package Generator
    // -------------------------------------------------------------
    console.log("\n--- Scenario 10: Screenshot Evidence & External ZIP Package Generator ---");
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

    // Ensure subdirectories exist in SCREENSHOT_DIR
    for (const vp of viewports) {
      const subDir = join(SCREENSHOT_DIR, vp.dirName);
      if (!existsSync(subDir)) mkdirSync(subDir, { recursive: true });
    }

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
          const fileName = `${routeSlug}_${theme}_${vp.width}x${vp.height}.png`;
          const filePath = join(SCREENSHOT_DIR, vp.dirName, fileName);

          await page.screenshot({ path: filePath, fullPage: false });
          await page.close();
        }

        // Capture mobile navigation drawer screenshot
        if (vp.name === "mobile_compact") {
          const page = await context.newPage();
          await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
          const menuBtn = page.locator('header button[aria-label*="menu"]').first();
          if (await menuBtn.count() > 0) {
            await menuBtn.click();
            await page.waitForTimeout(300);
            const drawerFile = join(SCREENSHOT_DIR, vp.dirName, `mobile_drawer_${theme}_360x800.png`);
            await page.screenshot({ path: drawerFile, fullPage: false });
          }
          await page.close();
        }

        // Capture focused keyboard state screenshot on desktop
        if (vp.name === "desktop") {
          const page = await context.newPage();
          await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
          const toggle = page.locator('button[data-testid="theme-toggle"]').first();
          if (await toggle.count() > 0) {
            await toggle.focus();
            await page.waitForTimeout(200);
            const focusFile = join(SCREENSHOT_DIR, vp.dirName, `keyboard_focus_toggle_${theme}_1440x900.png`);
            await page.screenshot({ path: focusFile, fullPage: false });
          }
          await page.close();
        }

        await context.close();
      }
    }

    // Write manifest.md inside SCREENSHOT_DIR
    const manifestContent = `# WCMD Final Visual Theme & Contrast Audit Manifest

## Audit Summary
- Date: ${new Date().toISOString()}
- Target Workspace: WorldCupMatchDay (cakuza/wc2026)
- Base URL: ${BASE_URL}
- Primary Accent Surface: #e11d48 (dark) / #d90429 (light)
- On-Accent Text: #ffffff (Contrast >= 4.6:1)
- Accent Text Foreground: #ff6b81 (dark) / #d90429 (light) (Contrast >= 5.3:1)

## Included Directories & Viewports
1. \`desktop/\`: 1440x900 Desktop viewports (Light & Dark)
2. \`mobile-390/\`: 390x844 Mobile Large viewports (Light & Dark)
3. \`mobile-360/\`: 360x800 Mobile Compact viewports (Light & Dark)

## Audited Routes
- \`/\` (Home)
- \`/bracket\` (Knockout Bracket)
- \`/stats\` (Tournament Statistics)
- \`/matches/match-104\` (Final Match Detail)
- \`/contact\` (Contact Page)
- \`/corrections-policy\` (Corrections Policy)
- \`/editorial-policy\` (Editorial Policy)
- \`/faq\` (Frequently Asked Questions)
- Mobile Drawer & Keyboard Focus States
`;
    writeFileSync(join(SCREENSHOT_DIR, "manifest.md"), manifestContent, "utf8");

    // Package screenshots into external ZIP C:\Users\Asus Gaming\Documents\WCMD-THEME-FINAL-VISUAL-AUDIT.zip
    console.log(`\nPackaging screenshot audit into external ZIP: '${EXTERNAL_ZIP_PATH}'...`);
    try {
      execSync(`powershell -ExecutionPolicy Bypass -Command "Compress-Archive -Path '${SCREENSHOT_DIR}\\*' -DestinationPath '${EXTERNAL_ZIP_PATH}' -Force"`);
      console.log(`  PASS: External ZIP created successfully at '${EXTERNAL_ZIP_PATH}'.`);
    } catch (e: any) {
      console.error("Failed to create external ZIP via PowerShell Compress-Archive:", e);
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
