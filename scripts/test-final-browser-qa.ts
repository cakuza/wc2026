/**
 * Local/manual browser acceptance test.
 * Excluded from the production TypeScript build.
 * Requires a local Puppeteer installation.
 * Supported setup: `npm install --no-save puppeteer`
 * Package.json and package-lock.json must remain unchanged.
 */

import puppeteer from 'puppeteer';

let failureCount = 0;
function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
  } else {
    console.error(`❌ FAIL: ${message}`);
    failureCount++;
    process.exitCode = 1;
  }
}

const VIEWPORTS = [
  { width: 1440, height: 900, name: 'Desktop (1440)' },
  { width: 390, height: 844, name: 'Mobile (390)' },
  { width: 360, height: 800, name: 'Mobile (360)' }
];

const BASE_URL = 'http://localhost:3000';
const ROUTES = [
  '/',
  '/today',
  '/schedule',
  '/schedule/australia-time',
  '/schedule/brazil-time',
  '/schedule/eastern-time',
  '/schedule/india-time',
  '/schedule/japan-time',
  '/schedule/turkey-time',
  '/schedule/uk-time',
  '/teams',
  '/teams/france',
  '/teams/spain',
  '/teams/england',
  '/teams/argentina',
  '/groups/group-a',
  '/groups/group-b',
  '/groups/group-c',
  '/groups/group-d',
  '/groups/group-e',
  '/groups/group-f',
  '/groups/group-g',
  '/groups/group-h',
  '/groups/group-i',
  '/groups/group-j',
  '/groups/group-k',
  '/groups/group-l',
  '/stats/top-scorers',
  '/matches/match-101',
  '/matches/match-102'
];

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  for (const vp of VIEWPORTS) {
    console.log(`\n===================`);
    console.log(`TESTING AT ${vp.name}`);
    console.log(`===================\n`);
    for (const route of ROUTES) {
      const page = await browser.newPage();
      await page.setViewport(vp);
      const errors: string[] = [];
      const warnings: string[] = [];

      const onPageError = (err: any) => errors.push(err.message || err.toString());
      const onConsole = (msg: any) => {
        if (msg.type() === 'error' && !msg.text().includes('404') && !msg.text().includes('favicon')) {
          errors.push(msg.text());
        }
        if (msg.type() === 'warn') {
          warnings.push(msg.text());
        }
      };

      page.on('pageerror', onPageError);
      page.on('console', onConsole);

      try {
        const suffix = route === '/' ? '' : '.html';
        await page.goto(`${BASE_URL}${route}${suffix}`, { waitUntil: 'networkidle0' });

        const hydrationWarnings = warnings.filter(w => w.toLowerCase().includes('hydration') || w.toLowerCase().includes('did not match'));

        assert(errors.length === 0, `[${vp.width}] ${route} no unexpected console errors: ${errors.join(', ')}`);
        assert(hydrationWarnings.length === 0, `[${vp.width}] ${route} no hydration warnings: ${hydrationWarnings.join(', ')}`);

        const data = await page.evaluate(() => {
          const text = document.body.innerText || '';
          const links = Array.from(document.querySelectorAll('a')).map(a => a.href);
          const h1s = document.querySelectorAll('h1').length;

          const spainNode = Array.from(document.querySelectorAll('a')).find(a => a.href.includes('match-101'))?.getBoundingClientRect();
          const engNode = Array.from(document.querySelectorAll('a')).find(a => a.href.includes('match-102'))?.getBoundingClientRect();
          const destinations = Array.from(document.querySelectorAll('h2')).find(h => h.textContent?.includes('Destinations'))?.parentElement?.getBoundingClientRect();
          const qfNode = Array.from(document.querySelectorAll('a')).find(a => a.href.includes('match-97') || a.href.includes('match-98') || a.href.includes('match-99') || a.href.includes('match-100'))?.getBoundingClientRect();
          const tsInput = document.querySelector('input[type="search"]')?.getAttribute('aria-label');

          return {
            text,
            links,
            h1s,
            docWidth: document.documentElement.scrollWidth,
            bodyWidth: document.body.scrollWidth,
            innerWidth: window.innerWidth,
            spainExists: !!spainNode,
            engExists: !!engNode,
            destExists: !!destinations,
            qfExists: !!qfNode,
            spainY: spainNode ? spainNode.y : -1,
            engY: engNode ? engNode.y : -1,
            destY: destinations ? destinations.y : -1,
            qfY: qfNode ? qfNode.y : -1,
            destRight: destinations ? destinations.right : -1,
            destX: destinations ? destinations.x : -1,
            tsInput
          };
        });

        if (route === '/') {
          assert(data.h1s === 1, `[${vp.width}] ${route} exactly one H1`);
          assert(/(France\s*0\s*[–-]\s*2\s*Spain|Spain\s*2\s*[–-]\s*0\s*France)/i.test(data.text), `[${vp.width}] ${route} Spain 2-0 France exists`);
          assert(/(England\s*1\s*[–-]\s*2\s*Argentina|Argentina\s*2\s*[–-]\s*1\s*England)/i.test(data.text), `[${vp.width}] ${route} England 1-2 Argentina exists`);
          assert(data.destExists, `[${vp.width}] ${route} destination section exists`);
          assert(data.qfExists, `[${vp.width}] ${route} first quarterfinal archive item exists`);

          if (data.spainExists && data.engExists && data.destExists && data.qfExists) {
            assert(data.engY <= data.spainY, `[${vp.width}] ${route} visual order: England before Spain`);
            assert(data.spainY <= data.destY, `[${vp.width}] ${route} visual order: Spain before destinations`);
            assert(data.destY <= data.qfY, `[${vp.width}] ${route} visual order: destinations before quarterfinals`);
          }

          assert(data.links.some(l => l.includes('match-103')), `[${vp.width}] ${route} Match 103 link exists`);
          assert(data.links.some(l => l.includes('match-104')), `[${vp.width}] ${route} Match 104 link exists`);
          assert(!/tbd/i.test(data.text), `[${vp.width}] ${route} no raw TBD exists`);
          assert(!/Winner\s*of/i.test(data.text), `[${vp.width}] ${route} no Winner of... exists`);
          assert(!/Loser\s*of/i.test(data.text), `[${vp.width}] ${route} no Loser of... exists`);

          assert(data.docWidth <= data.innerWidth, `[${vp.width}] ${route} document has no horizontal overflow`);
          assert(data.bodyWidth <= data.innerWidth, `[${vp.width}] ${route} body has no horizontal overflow`);
          if (data.destExists) {
             assert(data.destRight <= data.innerWidth && data.destX >= 0, `[${vp.width}] ${route} destination section bounding box remains inside viewport`);
          }

          if (vp.width === 390 && data.spainExists && data.engExists) {
            assert(data.engY <= 650, `[${vp.width}] ${route} England y <= 650`);
            assert(data.spainY <= 820, `[${vp.width}] ${route} Spain y <= 820`);
          }
        }

        else if (route === '/today') {
          assert(data.h1s === 1, `[${vp.width}] ${route} exactly one H1`);
          assert(data.text.includes('France') && data.text.includes('Spain') && data.text.includes('2') && data.text.includes('0'), `[${vp.width}] ${route} current semifinal state is visible`);
          assert(data.docWidth <= data.innerWidth, `[${vp.width}] ${route} no horizontal overflow`);
        }

        else if (route === '/matches/match-101') {
          assert(data.h1s === 1, `[${vp.width}] ${route} exactly one H1`);
          assert(/France\s*0[–-]\s*2\s*Spain/i.test(data.text), `[${vp.width}] ${route} France 0-2 Spain visible`);
          assert(/Final|Completed|FT/i.test(data.text) && !/Scheduled/i.test(data.text), `[${vp.width}] ${route} completed state visible`);
          assert(!data.text.includes('Recent Form'), `[${vp.width}] ${route} no Recent Form`);
          assert(!data.text.includes('Tournament Journey'), `[${vp.width}] ${route} no Tournament Journey`);
          assert(!/Match Preview/i.test(data.text), `[${vp.width}] ${route} no scheduled-preview module`);
        }

        else if (route === '/matches/match-102') {
          assert(data.h1s === 1, `[${vp.width}] ${route} exactly one H1`);
          assert(/England\s*1[–-]\s*2\s*Argentina/i.test(data.text), `[${vp.width}] ${route} England 1-2 Argentina visible`);
          assert(/Final|Completed|FT/i.test(data.text) && !/Scheduled/i.test(data.text), `[${vp.width}] ${route} completed state visible`);
          assert(!data.text.includes('Recent Form'), `[${vp.width}] ${route} no Recent Form`);
          assert(!data.text.includes('Tournament Journey'), `[${vp.width}] ${route} no Tournament Journey`);
          assert(!/Match Preview/i.test(data.text), `[${vp.width}] ${route} no scheduled-preview module`);
        }

        else if (route.startsWith('/groups/group-')) {
          const c1 = (data.text.match(/Advanced as group winner/gi) || []).length;
          const c2 = (data.text.match(/Advanced as runner-up/gi) || []).length;
          const c3 = (data.text.match(/Advanced as a third-place qualifier/gi) || []).length;
          const c4 = (data.text.match(/Eliminated in the group stage/gi) || []).length;
          assert((c1 + c2 + c3 + c4) === 4, `[${vp.width}] ${route} exactly four final-outcome labels`);

          const forbidden = /may qualify|eligible to advance|current leader|leads the group/i.test(data.text);
          assert(!forbidden, `[${vp.width}] ${route} no forbidden phrases`);
        }

        else if (route.startsWith('/schedule')) {
          assert(/Match 103/i.test(data.text), `[${vp.width}] ${route} Match 103 visible`);
          assert(/Third-place/i.test(data.text), `[${vp.width}] ${route} Third-place playoff visible`);
          assert(/France/i.test(data.text) && /England/i.test(data.text), `[${vp.width}] ${route} France vs England visible for third place`);
          assert(!/Loser/i.test(data.text), `[${vp.width}] ${route} No 'Loser of' fallback string visible`);
          assert(/Match 104/i.test(data.text), `[${vp.width}] ${route} Match 104 visible`);
          assert(/Final/i.test(data.text), `[${vp.width}] ${route} Final visible`);
          assert(/Spain/i.test(data.text) && /Argentina/i.test(data.text), `[${vp.width}] ${route} Spain vs Argentina visible for final`);
          assert(!/Winner/i.test(data.text), `[${vp.width}] ${route} No 'Winner of' fallback string visible`);
          assert(!/France\s*vs\s*Spain/i.test(data.text), `[${vp.width}] ${route} no false future France vs Spain fixture`);
        }

        else if (route === '/stats/top-scorers') {
          assert(data.tsInput === 'Search players', `[${vp.width}] ${route} Top Scorers search field accessible name`);
        }

        else if (route === '/teams') {
          assert(data.text.includes('Teams that still have a match remaining in the tournament.'), `[${vp.width}] ${route} active-filter description exact match`);
        }

        else if (route === '/teams/france' || route === '/teams/spain') {
          assert(/France\s*0[–-]\s*2\s*Spain/i.test(data.text), `[${vp.width}] ${route} explicit France 0-2 Spain latest result`);
          assert(/lost to spain|beat france/i.test(data.text) || /0[–-]2/i.test(data.text), `[${vp.width}] ${route} opponent-aware result copy`);
          assert(data.links.some(l => l.includes('match-101')), `[${vp.width}] ${route} link to /matches/match-101`);
          assert(!/\btbd\b/i.test(data.text), `[${vp.width}] ${route} no raw tbd`);

          if (route === '/teams/france') {
             assert(/Third-place/i.test(data.text) || /3rd Place/i.test(data.text), `[${vp.width}] ${route} Third-place path visible`);
          } else if (route === '/teams/spain') {
             assert(/Final/i.test(data.text), `[${vp.width}] ${route} Final path visible`);
          }
        }
        else if (route === '/teams/england' || route === '/teams/argentina') {
          assert(/England\s*1[–-]\s*2\s*Argentina/i.test(data.text), `[${vp.width}] ${route} explicit England 1-2 Argentina latest result`);
          assert(/lost to argentina|beat england/i.test(data.text) || /1[–-]2/i.test(data.text), `[${vp.width}] ${route} opponent-aware result copy`);
          assert(data.links.some(l => l.includes('match-102')), `[${vp.width}] ${route} link to /matches/match-102`);
          assert(!/\btbd\b/i.test(data.text), `[${vp.width}] ${route} no raw tbd`);

          if (route === '/teams/england') {
             assert(/Third-place/i.test(data.text) || /3rd Place/i.test(data.text), `[${vp.width}] ${route} Third-place path visible`);
          } else if (route === '/teams/argentina') {
             assert(/Final/i.test(data.text), `[${vp.width}] ${route} Final path visible`);
          }
        }
      } catch (err: any) {
        assert(false, `[${vp.width}] ${route} evaluation or navigation error: ${err.message}`);
      } finally {
        page.off('pageerror', onPageError);
        page.off('console', onConsole);
        await page.close();
      }
    }
  }

  await browser.close();

  if (failureCount > 0) {
    console.error(`\nCompleted with ${failureCount} failures.`);
    process.exitCode = 1;
  } else {
    console.log('\nALL CHECKS PASSED SUCCESSFULLY.');
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
