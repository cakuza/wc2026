import { chromium } from "playwright";

const BASE_URL = process.env.QA_BASE_URL || "http://localhost:3000";
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
  { width: 360, height: 800 },
];
const ROUTES = [
  "/", "/today", "/schedule", "/schedule/australia-time", "/schedule/brazil-time", "/schedule/eastern-time", "/schedule/india-time", "/schedule/japan-time", "/schedule/turkey-time", "/schedule/uk-time",
  "/bracket", "/teams", "/teams/france", "/teams/spain", "/teams/england", "/teams/argentina", "/teams/turkey", "/teams/brazil",
  ...Array.from({ length: 12 }, (_, index) => `/groups/group-${String.fromCharCode(97 + index)}`),
  "/stats", "/stats/top-scorers", "/stats/players", "/stats/teams", "/stats/compare",
  "/matches/match-101", "/matches/match-102", "/matches/match-103", "/matches/match-104",
  "/world-cup-2026", "/world-cup-2026/results", "/world-cup-2026/results/2026-07-11",
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
        const response = await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });
        const text = await page.locator("body").innerText();
        const metrics = await page.evaluate(() => ({ h1: document.querySelectorAll("h1").length, scrollWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth, innerWidth: window.innerWidth }));
        assert(response?.ok(), `[${label}] ${route} loads`);
        assert(errors.length === 0, `[${label}] ${route} has no console/page errors`);
        assert(warnings.length === 0, `[${label}] ${route} has no hydration warnings`);
        assert(metrics.scrollWidth <= metrics.innerWidth && metrics.bodyWidth <= metrics.innerWidth, `[${label}] ${route} has no horizontal overflow`);
        if (["/", "/today", "/schedule", "/matches/match-101", "/matches/match-102"].includes(route)) assert(metrics.h1 === 1, `[${label}] ${route} has exactly one H1`);
        if (route === "/") {
          const final = await page.locator('a[href*="match-104"]').first().boundingBox();
          const third = await page.locator('a[href*="match-103"]').first().boundingBox();
          const semifinal = await page.locator('a[href*="match-102"]').first().boundingBox();
          assert(/Final Weekend/.test(text) && /Spain/.test(text) && /Argentina/.test(text), `[${label}] homepage shows Final Weekend`);
          assert(!/Destinations|UPCOMING\s*·\s*NEXT 7 DAYS/i.test(text), `[${label}] homepage suppresses obsolete lifecycle copy`);
          assert(!!final && !!third && !!semifinal && final.bottom <= third.top + 5 && third.bottom <= semifinal.top + 5, `[${label}] homepage orders Final, third-place, then semifinal history`);
          if (viewport.width === 1440 && final) assert(final.top < viewport.height, `[${label}] Final is in the first desktop viewport`);
          if (viewport.width === 360) {
            const required = await page.locator('a[href*="match-104"]').first().evaluate((card) => Array.from(card.querySelectorAll("span,p")).map((node) => ({ text: node.textContent?.trim(), bottom: node.getBoundingClientRect().bottom })).filter((item) => /FINAL|Spain|Argentina|MetLife|East Rutherford|View the Final/i.test(item.text || "")));
            assert(required.length > 0 && required.every((item) => item.bottom <= viewport.height), `[${label}] required Final content is in the first viewport`);
          }
        }
        if (route === "/today") assert(/No World Cup match is being played today|Final Weekend/.test(text) && !/Destinations/i.test(text), `[${label}] Match Center prioritizes Final Weekend`);
        if (route === "/stats") {
          assert(/102\s*\/\s*104/.test(text) && /Messi/.test(text) && /Olise/.test(text), `[${label}] Statistics shows the current snapshot and leaders`);
          assert(/Germany/.test(text) && /Netherlands/.test(text) && /France/.test(text) && /Mexico/.test(text) && /Spain/.test(text), `[${label}] Statistics renders tied teams distinctly`);
          assert(/Last updated\s+\d{1,2}\s+\w+\s+2026/i.test(text), `[${label}] Statistics has a full dated timestamp`);
        }
        if (route === "/world-cup-2026") assert(/World Cup 2026/i.test(text), `[${label}] archive hub remains reachable`);
        if (route === "/world-cup-2026/results") assert(/Results/i.test(text), `[${label}] archive results remain reachable`);
        await page.close();
      }
    }
  } finally { await browser.close(); }
  if (failures > 0) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
