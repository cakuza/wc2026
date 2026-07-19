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
  "/stats/top-scorers",
  "/matches/match-101", "/matches/match-103", "/matches/match-104", "/world-cup-2026/results",
  "/world-cup-third-place-qualification", "/world-cup-2026-data-sources", "/terms",
  "/teams/england", "/teams/france",
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
        if (route === "/today") assert(/Times shown in/.test(text) && /Final Weekend/.test(text) && !/Destinations/i.test(text), `[${label}] Today resolves timezone-aware Final Weekend copy after hydration`);
        if (route === "/world-cup-third-place-qualification") {
          assert(/Final third-place ranking/i.test(text) && /Qualified for Round of 32/i.test(text) && /Did not qualify/i.test(text), `[${label}] third-place ranking is final historical truth`);
          assert(!/current snapshot|current Round of 32 cut line|until all group matches are complete/i.test(text), `[${label}] third-place ranking suppresses provisional copy`);
        }
        if (route === "/world-cup-2026-data-sources") {
          assert(/15 minutes before kickoff/i.test(text) && /3 hours after kickoff/i.test(text) && /every 30 seconds/i.test(text), `[${label}] methodology states the bounded live refresh policy`);
          assert(!/10 seconds|12 seconds|90 seconds/i.test(text), `[${label}] methodology has no contradictory polling intervals`);
        }
        if (["/matches/match-103", "/matches/match-104"].includes(route)) assert(!/Bracket Destination/i.test(text), `[${label}] ${route} has no false onward destination`);
        if (route === "/terms") {
          assert(await page.locator("header nav a").count() > 0 && await page.locator('footer a[href="/terms"]').count() > 0, `[${label}] Terms uses the shared header and footer navigation`);
        }
        if (route === "/stats") {
          assert(/103\s*\/\s*104/.test(text) && /Olise/.test(text), `[${label}] Statistics shows the current snapshot and leaders`);
          assert(/Kylian Mbappé/i.test(text) && /10/.test(text), `[${label}] Statistics shows Kylian Mbappé as leader with 10 goals`);
          assert(/Germany/.test(text) && /Netherlands/.test(text) && /France/.test(text) && /Mexico/.test(text) && /Spain/.test(text), `[${label}] Statistics renders tied teams distinctly`);
          assert(/Last updated\s+\d{1,2}\s+\w+\s+2026/i.test(text), `[${label}] Statistics has a full dated timestamp`);
        }
        if (route === "/stats/top-scorers") {
          assert(/Kylian Mbappé/i.test(text) && /10/.test(text), `[${label}] Top Scorers shows Mbappé with 10 goals`);
          assert(/Lionel Messi/i.test(text) && /8/.test(text), `[${label}] Top Scorers shows Messi with 8 goals`);
          assert(/provisional|tiebreak/i.test(text), `[${label}] Top Scorers page mentions provisional / tiebreak standings`);
        }
        if (route === "/teams/england") {
          assert(/Third place/i.test(text), `[${label}] England page shows Third place status`);
          assert(/None\s*\(campaign completed\)/i.test(text), `[${label}] England page shows campaign completed next match`);
          assert(/France/i.test(text) && /England/i.test(text) && (/4\s*–\s*6/i.test(text) || /4\s*-\s*6/i.test(text)), `[${label}] England page shows France 4-6 England result`);
          assert(!/vs\s+France/i.test(text) && !/vs\s+England/i.test(text), `[${label}] England page has no future fixture shown for France vs England`);
        }
        if (route === "/teams/france") {
          assert(/Fourth place/i.test(text), `[${label}] France page shows Fourth place status`);
          assert(/None\s*\(campaign completed\)/i.test(text), `[${label}] France page shows campaign completed next match`);
          assert(/France/i.test(text) && /England/i.test(text) && (/4\s*–\s*6/i.test(text) || /4\s*-\s*6/i.test(text)), `[${label}] France page shows France 4-6 England result`);
          assert(!/vs\s+France/i.test(text) && !/vs\s+England/i.test(text), `[${label}] France page has no future fixture shown for France vs England`);
        }
        if (route === "/world-cup-2026") assert(/World Cup 2026/i.test(text), `[${label}] archive hub remains reachable`);
        if (route === "/world-cup-2026/results") assert(/Results/i.test(text), `[${label}] archive results remain reachable`);
        if (["/", "/today", "/stats", "/stats/top-scorers"].includes(route)) {
          const screenshotDirectory = join(process.cwd(), "qa-artifacts", "browser");
          mkdirSync(screenshotDirectory, { recursive: true });
          const safeName = route === "/" ? "home" : route.slice(1).replace(/\//g, "-");
          await page.screenshot({ path: join(screenshotDirectory, `${safeName}-${viewport.width}x${viewport.height}.png`), fullPage: false });
        }
        await page.close();
      }
    }
  } finally { await browser.close(); }
  if (failures > 0) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
