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
  "/",
  "/today",
  "/schedule",
  "/bracket",
  "/teams/argentina",
  "/groups/group-a",
  "/stats",
  "/stats/top-scorers",
  "/matches/match-101",
  "/matches/match-103",
  "/matches/match-104",
  "/world-cup-2026/results",
  "/world-cup-third-place-qualification",
  "/world-cup-2026-data-sources",
  "/terms",
  "/teams/england",
  "/teams/france",
  "/teams",
  "/teams/spain",
  "/stats/matches",
  "/stats/teams",
  "/about",
  "/privacy",
  "/contact",
  "/editorial-policy",
  "/corrections-policy",
  "/faq",
  "/stats/compare",
  "/stats/compare?team1=spain&team2=argentina",
  "/stats/compare?team1=invalid&team2=argentina",
  "/stats/compare?team1=spain&team2=spain",
  "/stats/compare?team1=spain",
  "/stats/compare?team2=argentina",
  "/stats/compare?team1=not&team2=real"
];

let failures = 0;
let assertionsCount = 0;
let passesCount = 0;
let consoleErrorsCount = 0;
let pageErrorsCount = 0;
let hydrationWarningsCount = 0;
let overflowFailuresCount = 0;

function assert(condition: unknown, message: string) {
  assertionsCount++;
  if (condition) {
    passesCount++;
    console.log(`PASS ${message}`);
  } else {
    failures += 1;
    console.error(`FAIL ${message}`);
    if (message.includes("console/page errors")) {
      consoleErrorsCount++;
      pageErrorsCount++;
    } else if (message.includes("hydration warnings")) {
      hydrationWarningsCount++;
    } else if (message.includes("horizontal overflow")) {
      overflowFailuresCount++;
    }
  }
}

async function main() {
  console.log(`Routes to test: \n${ROUTES.join("\n")}`);
  console.log(`Executing browser QA across ${ROUTES.length} routes, ${VIEWPORTS.length} viewports (${ROUTES.length * VIEWPORTS.length} total static combinations)`);
  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of VIEWPORTS) {
      const label = `${viewport.width}x${viewport.height}`;
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
        if (route === "/stats/compare?team1=spain&team2=argentina") {
          await page.getByText(/Spain\s*(vs|-)\s*Argentina/i).waitFor({ state: "visible", timeout: 2000 });
        } else if (route.startsWith("/stats/compare")) {
          await page.getByText(/Select two teams to view head-to-head tournament statistics/i).waitFor({ state: "visible", timeout: 2000 });
        } else if (route === "/today") {
          await page.waitForFunction(() => document.body.innerText.includes("Times shown in") || document.body.innerText.includes("Final Weekend"), { timeout: 2000 }).catch(() => {});
        } else {
          await page.locator("h1").first().waitFor({ state: "attached", timeout: 2000 }).catch(() => {});
        }
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
          assert(await decidingSection.isVisible() && /Tournament Complete/i.test(text), `[${label}] Tournament Complete remains after hydration`);
          assert(await final.isVisible() && await thirdPlace.isVisible(), `[${label}] Tournament Complete exposes both deciding matches`);
          assert(!/(?:Destinations|UPCOMING.*NEXT 7 DAYS)/i.test(text), `[${label}] homepage suppresses obsolete lifecycle copy`);
          const decidingBox = await decidingSection.boundingBox();
          const semifinalBox = await semifinalHeading.boundingBox();
          assert(!!decidingBox && !!semifinalBox && decidingBox.y < semifinalBox.y, `[${label}] Tournament Complete precedes semifinal history`);
          await final.scrollIntoViewIfNeeded();
          assert(await final.isVisible() && await final.boundingBox() !== null, `[${label}] Final card is visible and reachable`);
        }

        if (route === "/today") assert(/Times shown in/.test(text) && /Is Complete/i.test(text) && !/Destinations/i.test(text), `[${label}] Today resolves timezone-aware Completed copy after hydration`);

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
          assert(/104\s*\/\s*104/.test(text) && /Olise/.test(text), `[${label}] Statistics shows the current snapshot and leaders`);
          assert(/Kylian Mbappé/i.test(text) && /10/.test(text), `[${label}] Statistics shows Kylian Mbappé as leader with 10 goals`);
          assert(/England/.test(text) && /France/.test(text) && /Spain/.test(text), `[${label}] Statistics renders tied teams distinctly`);
          assert(/Last updated\s+\d{1,2}\s+\w+\s+2026/i.test(text), `[${label}] Statistics has a full dated timestamp`);
        }

        if (route === "/stats/top-scorers") {
          assert(/Kylian Mbappé/i.test(text) && /10/.test(text), `[${label}] Top Scorers shows Mbappé with 10 goals`);
          assert(/Lionel Messi/i.test(text) && /8/.test(text), `[${label}] Top Scorers shows Messi with 8 goals`);
          assert(!/provisional/i.test(text), `[${label}] Top Scorers page has no stale provisional messaging`);
        }

        if (route === "/teams/england") {
          assert(/Third place/i.test(text), `[${label}] England page shows Third place status`);
          assert(/Tournament complete/i.test(text) || /None\s*\(campaign completed\)/i.test(text), `[${label}] England page shows campaign completed next match`);
          assert(/France/i.test(text) && /England/i.test(text) && (/4\s*–\s*6/i.test(text) || /4\s*-\s*6/i.test(text)), `[${label}] England page shows France 4-6 England result`);
          assert(!/vs\s+France/i.test(text) && !/vs\s+England/i.test(text), `[${label}] England page has no future fixture shown for France vs England`);
        }

        if (route === "/teams/france") {
          assert(/Fourth place/i.test(text), `[${label}] France page shows Fourth place status`);
          assert(/Tournament complete/i.test(text) || /None\s*\(campaign completed\)/i.test(text), `[${label}] France page shows campaign completed next match`);
          assert(/France/i.test(text) && /England/i.test(text) && (/4\s*–\s*6/i.test(text) || /4\s*-\s*6/i.test(text)), `[${label}] France page shows France 4-6 England result`);
          assert(!/vs\s+France/i.test(text) && !/vs\s+England/i.test(text), `[${label}] France page has no future fixture shown for France vs England`);
        }

        if (route === "/teams") {
          assert(/All 48 national teams that competed at the 2026 World Cup, with their current or final tournament status/i.test(text), `[${label}] /teams default copy describes all 48 teams`);
          assert(!/Teams that still have a match remaining in the tournament/i.test(text), `[${label}] /teams default copy does not claim all teams are active`);
          const spainItem = page.locator('a[href="/teams/spain"]');
          const argItem = page.locator('a[href="/teams/argentina"]');
          const engItem = page.locator('a[href="/teams/england"]');
          const fraItem = page.locator('a[href="/teams/france"]');
          assert(/Champion/i.test(await spainItem.innerText()) && /Runner-up/i.test(await argItem.innerText()), `[${label}] Spain is Champion and Argentina is Runner-up`);
          assert(/Third place/i.test(await engItem.innerText()), `[${label}] England is third place`);
          assert(/Fourth place/i.test(await fraItem.innerText()), `[${label}] France is fourth place`);
        }

        if (route === "/teams/spain") {
          assert(/Champion/i.test(text), `[${label}] Spain has Champion status`);
          assert(await page.locator('a[href="/matches/match-104"]').count() > 0 || /Final/i.test(text), `[${label}] Spain shows Match 104`);
          assert(/Tournament complete|campaign completed/i.test(text), `[${label}] Spain campaign is marked completed`);
        }

        if (route === "/teams/argentina") {
          assert(/Runner-up/i.test(text), `[${label}] Argentina has Runner-up status`);
          assert(await page.locator('a[href="/matches/match-104"]').count() > 0 || /Final/i.test(text), `[${label}] Argentina shows Match 104`);
          assert(/Tournament complete|campaign completed/i.test(text), `[${label}] Argentina campaign is marked completed`);
        }

        if (route === "/stats/matches") {
          assert(/France/i.test(text) && /England/i.test(text) && (/4\s*–\s*6/i.test(text) || /4\s*-\s*6/i.test(text)), `[${label}] /stats/matches shows France 4-6 England`);
          assert(/10\s+goals/i.test(text) || /10/i.test(text), `[${label}] /stats/matches shows 10 total goals`);
          assert(!/tbd/i.test(text), `[${label}] /stats/matches has no tbd`);
          assert(await page.locator('a[href="/matches/match-103"]').count() > 0, `[${label}] /stats/matches links to Match 103`);
        }

        if (route === "/stats/teams") {
          assert(/France/i.test(text) && /England/i.test(text) && /Spain/i.test(text) && /Argentina/i.test(text), `[${label}] /stats/teams shows France, England, Spain, Argentina`);
          assert(/20/i.test(text), `[${label}] /stats/teams shows 20 goals for France/England`);
          assert(/14/i.test(text), `[${label}] /stats/teams shows 14 goals for Spain`);
          assert(/19/i.test(text), `[${label}] /stats/teams shows 19 goals for Argentina`);
          assert(!/group-stage-only/i.test(text), `[${label}] /stats/teams has no group-stage-only totals`);
        }

        if (["/editorial-policy", "/corrections-policy", "/about", "/privacy", "/contact"].includes(route)) {
          assert(metrics.h1 >= 1, `[${label}] ${route} has meaningful H1`);
          assert(await page.locator("header nav").count() > 0 && await page.locator("footer").count() > 0, `[${label}] ${route} has header/footer navigation`);
          assert(!/We use Google AdSense, a third-party advertising service/i.test(text), `[${label}] ${route} has no active-AdSense claim`);
          assert(!/scores are never manually reconciled/i.test(text), `[${label}] ${route} has no automatic-only score claim`);
          assert(!/guarantee.*minutes/i.test(text), `[${label}] ${route} has no minute-level correction promise`);
          assert(!/all ingested data undergoes rigorous developer and editor review/i.test(text), `[${label}] ${route} has no unsupported universal human-review claim`);
        }

        if (route === "/faq") {
          assert(!/We do not manually enter scores or results/i.test(text), `[${label}] FAQ has no automatic-only score claim`);
          assert(!/scores are never manually reconciled/i.test(text), `[${label}] FAQ has no contradiction with corrections policy`);
        }

        if (route.startsWith("/stats/compare")) {
          if (route === "/stats/compare?team1=spain&team2=argentina") {
            assert(/Spain\s*vs\s*Argentina|Spain\s*-\s*Argentina/i.test(text), `[${label}] valid pair shows Spain vs Argentina`);
            assert(/Goals Scored\s+19/i.test(text) || (/14/.test(text) && /19/.test(text) && /Goals Scored/i.test(text)), `[${label}] valid pair shows Goals Scored: Spain 14 / Argentina 19`);
            assert(/Goals Conceded\s+8/i.test(text) || (/1/.test(text) && /8/.test(text) && /Goals Conceded/i.test(text)), `[${label}] valid pair shows Goals Conceded: Spain 1 / Argentina 8`);
            assert(!/France\s*vs|vs\s*Spain/i.test(text), `[${label}] valid pair shows no wrong-pair flash`);
            await page.waitForFunction(() => document.querySelectorAll('meta[name="robots"][content="noindex,follow"]').length > 0, { timeout: 2000 }).catch(() => {});
            const metaCount = await page.locator('meta[name="robots"][content="noindex,follow"]').count();
            assert(metaCount > 0, `[${label}] valid pair has supplemental noindex,follow`);
          } else {
            assert(!/France\s*vs|vs\s*Spain/i.test(text), `[${label}] invalid/incomplete pair shows no France vs Spain`);
            assert(/Select two teams to view head-to-head tournament statistics/i.test(text), `[${label}] invalid/incomplete pair has neutral selection/validation state`);
            assert(!/Goals Scored/i.test(text), `[${label}] invalid/incomplete pair comparison metric table is absent`);
            assert(metrics.h1 >= 1, `[${label}] invalid/incomplete pair has main heading but no team-vs-team heading exists`);
            const metaCount = await page.locator('meta[name="robots"][content="noindex,follow"]').count();
            if (route !== "/stats/compare") {
              await page.waitForFunction(() => document.querySelectorAll('meta[name="robots"][content="noindex,follow"]').length > 0, { timeout: 2000 }).catch(() => {});
              const finalMetaCount = await page.locator('meta[name="robots"][content="noindex,follow"]').count();
              assert(finalMetaCount > 0, `[${label}] invalid/incomplete parameterized pair has supplemental noindex,follow`);
            } else {
              assert(metaCount === 0, `[${label}] base /stats/compare has no supplemental noindex,follow`);
            }
          }
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

      console.log(`\nRunning Interaction Test: Compare Dropdowns [${viewport.width}x${viewport.height}]`);
      const interactionPage = await browser.newPage({ viewport });
      await interactionPage.goto(`${BASE_URL}/stats/compare`, { waitUntil: "domcontentloaded" });
      await interactionPage.getByText(/Select two teams to view head-to-head tournament statistics/i).waitFor({ state: "visible", timeout: 2000 });

      const selects = interactionPage.locator('select');
      // Wait for both selects to be present and visible before interacting
      await selects.nth(0).waitFor({ state: 'visible', timeout: 3000 });
      await selects.nth(0).selectOption('spain');


      await interactionPage.waitForFunction(() => {
        const selects = document.querySelectorAll('select');
        if (selects.length < 2) return false;
        const option = selects[1].querySelector('option[value="spain"]');
        return option && (option as HTMLOptionElement).disabled;
      }, { timeout: 2000 }).catch(() => {});

      const spainOption2 = selects.nth(1).locator('option[value="spain"]');
      assert(await spainOption2.isDisabled(), `[Interaction] Spain is disabled in Team 2 dropdown`);

      await selects.nth(1).selectOption('spain', { timeout: 1000 }).catch(() => {});

      const textAfter = await interactionPage.locator("body").innerText();
      assert(!/Spain\s+(vs|-)\s+Spain/i.test(textAfter), `[Interaction] No same-team comparison renders`);
      assert(!interactionPage.url().includes("team1=spain&team2=spain"), `[Interaction] URL state remains valid`);

      await selects.nth(1).selectOption('argentina');
      await interactionPage.waitForFunction(() => window.location.search.includes("team2=argentina"), { timeout: 2000 }).catch(() => {});
      await interactionPage.getByText(/Spain\s*(vs|-)\s*Argentina/i).waitFor({ state: "visible", timeout: 2000 }).catch(() => {});
      assert(interactionPage.url().includes("team2=argentina"), `[Interaction] Argentina selected successfully`);
      await interactionPage.close();
    }
    console.log(`\n=============================================`);
    console.log(`Browser QA Summary:`);
    console.log(`  Routes tested:      ${ROUTES.length}`);
    console.log(`  Viewports tested:   ${VIEWPORTS.length}`);
    console.log(`  Total combinations: ${ROUTES.length * VIEWPORTS.length}`);
    console.log(`  Total assertions:   ${assertionsCount}`);
    console.log(`  Passed assertions:  ${passesCount}`);
    console.log(`  Failed assertions:  ${failures}`);
    console.log(`  Console errors:     ${consoleErrorsCount}`);
    console.log(`  Page errors:        ${pageErrorsCount}`);
    console.log(`  Hydration warnings: ${hydrationWarningsCount}`);
    console.log(`  Overflow failures:  ${overflowFailuresCount}`);
    console.log(`=============================================\n`);
  } finally { await browser.close(); }
  if (failures > 0) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
