import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE_URL = process.env.BROWSER_QA_BASE_URL || process.env.QA_BASE_URL || "http://127.0.0.1:4173";
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
  { width: 360, height: 800 },
];
const ROUTES = [
  "/", "/today", "/schedule", "/bracket", "/teams/argentina", "/groups/group-a", "/stats",
  "/matches/match-101", "/matches/match-103", "/matches/match-104", "/world-cup-2026/results",
];

let failures = 0;
function assert(condition: unknown, message: string) {
  if (condition) console.log(`PASS ${message}`);
  else { console.error(`FAIL ${message}`); failures += 1; }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of VIEWPORTS) {
      const label = `${viewport.width}×${viewport.height}`;
      for (const route of ROUTES) {
        const page = await browser.newPage({ viewport });
        const errors: string[] = [];
        const warnings: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("console", (message) => {
          if (message.type() === "error" && !/favicon|404/i.test(message.text())) errors.push(message.text());
          if (message.type() === "warning" && /hydration|did not match/i.test(message.text())) warnings.push(message.text());
        });
        const response = await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(200);
        const text = await page.locator("body").innerText();
        const metrics = await page.evaluate(() => ({ h1: document.querySelectorAll("h1").length, scrollWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth, innerWidth: window.innerWidth }));
        assert(response?.ok(), `[${label}] ${route} loads`);
        assert(errors.length === 0, `[${label}] ${route} has no console/page errors`);
        assert(warnings.length === 0, `[${label}] ${route} has no hydration warnings`);
        assert(metrics.scrollWidth <= metrics.innerWidth && metrics.bodyWidth <= metrics.innerWidth, `[${label}] ${route} has no horizontal overflow`);
        if (["/", "/schedule", "/matches/match-101"].includes(route)) assert(metrics.h1 === 1, `[${label}] ${route} has exactly one H1`);
        if (route === "/") {
          const decidingSection = page.locator('section[aria-labelledby="deciding-matches-heading"]');
          const final = decidingSection.locator('a[href="/matches/match-104"]');
          const thirdPlace = decidingSection.locator('a[href="/matches/match-103"]');
          const semifinalHeading = page.getByRole("heading", { name: "Semifinal results" });
          await decidingSection.waitFor({ state: "visible" });
          assert(await decidingSection.isVisible() && /final weekend/i.test(text), `[${label}] Final Weekend remains after hydration`);
          assert(await final.isVisible() && await thirdPlace.isVisible(), `[${label}] Final Weekend exposes both deciding matches`);
          assert(!/(?:Destinations|UPCOMING.*NEXT 7 DAYS)/i.test(text), `[${label}] homepage suppresses obsolete lifecycle copy`);
          const decidingBox = await decidingSection.boundingBox();
          const semifinalBox = await semifinalHeading.boundingBox();
          assert(!!decidingBox && !!semifinalBox && decidingBox.y < semifinalBox.y, `[${label}] Final Weekend precedes semifinal history`);
          await final.scrollIntoViewIfNeeded();
          assert(await final.isVisible() && await final.boundingBox() !== null, `[${label}] Final card is visible and reachable`);
        }
        if (route === "/today") assert(/No World Cup match is being played today|Final Weekend/.test(text) && !/Destinations/i.test(text), `[${label}] Match Center prioritizes Final Weekend`);
        if (route === "/stats") {
          assert(/102\s*\/\s*104/.test(text) && /Messi/.test(text) && /Olise/.test(text), `[${label}] Statistics shows the current snapshot and leaders`);
          assert(/Germany/.test(text) && /Netherlands/.test(text) && /France/.test(text) && /Mexico/.test(text) && /Spain/.test(text), `[${label}] Statistics renders tied teams distinctly`);
          assert(/Last updated\s+\d{1,2}\s+\w+\s+2026/i.test(text), `[${label}] Statistics has a full dated timestamp`);
        }
        if (route === "/world-cup-2026") assert(/World Cup 2026/i.test(text), `[${label}] archive hub remains reachable`);
        if (route === "/world-cup-2026/results") assert(/Results/i.test(text), `[${label}] archive results remain reachable`);
        if (["/", "/today", "/stats"].includes(route)) {
          const screenshotDirectory = join(process.cwd(), "qa-artifacts", "browser");
          mkdirSync(screenshotDirectory, { recursive: true });
          await page.screenshot({ path: join(screenshotDirectory, `${route === "/" ? "home" : route.slice(1)}-${viewport.width}x${viewport.height}.png`), fullPage: false });
        }
        await page.close();
      }
    }
  } finally { await browser.close(); }
  if (failures > 0) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
