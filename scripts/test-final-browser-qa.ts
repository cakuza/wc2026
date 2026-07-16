/**
 * Local/manual browser acceptance test.
 * Excluded from the production TypeScript build.
 * Requires a local Puppeteer installation.
 * Supported setup: `npm install --no-save puppeteer`
 * Package.json and package-lock.json must remain unchanged.
 *
 * Base URL is configurable so the same script can validate a local static
 * server, a Vercel Preview, or (never in this hotfix) production:
 *   npx tsx scripts/test-final-browser-qa.ts
 *   QA_BASE_URL=https://<preview-url> npx tsx scripts/test-final-browser-qa.ts
 */

import puppeteer from 'puppeteer';

let failureCount = 0;
let passCount = 0;
function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failureCount++;
    process.exitCode = 1;
  }
}

// Exact required viewports — do not substitute 768, width-only values, or
// omit the mobile heights. Always logged as width×height, never a bare width.
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
  { width: 360, height: 800 },
];

const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:3000';

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
  '/bracket',
  '/teams',
  '/teams/france',
  '/teams/spain',
  '/teams/england',
  '/teams/argentina',
  '/teams/turkey',
  '/teams/brazil',
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
  '/stats',
  '/stats/top-scorers',
  '/stats/players',
  '/stats/teams',
  '/stats/compare',
  '/matches/match-101',
  '/matches/match-102',
  '/matches/match-103',
  '/matches/match-104',
  '/world-cup-2026',
  '/world-cup-2026/results',
  '/world-cup-2026/results/2026-07-11',
];

// Small documented tolerance for sub-pixel/anti-aliasing rounding when
// comparing one section's bottom edge against the next section's top edge.
const ORDER_TOLERANCE_PX = 5;

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    // --disable-dev-shm-usage and --disable-gpu harden long sequential-page
    // Chromium runs against sandboxed/constrained environments, where the
    // default /dev/shm size or GPU process can otherwise cause a silent
    // mid-run crash with no error output after dozens of page navigations.
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  let totalAssertionsBefore = 0;

  for (const vp of VIEWPORTS) {
    const label = `${vp.width}×${vp.height}`;
    console.log(`\n===================`);
    console.log(`TESTING AT ${label}`);
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
        // Clean URLs work universally: Vercel's routing layer serves the
        // static export's <route>.html file for the extensionless path (and
        // 404s on an explicit .html suffix), and the local `serve` static
        // server resolves the same way.
        await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle0' });

        const hydrationWarnings = warnings.filter(w => w.toLowerCase().includes('hydration') || w.toLowerCase().includes('did not match'));

        assert(errors.length === 0, `[${label}] ${route} no unexpected console errors: ${errors.join(', ')}`);
        assert(hydrationWarnings.length === 0, `[${label}] ${route} no hydration warnings: ${hydrationWarnings.join(', ')}`);

        const data = await page.evaluate(() => {
          const text = document.body.innerText || '';
          const links = Array.from(document.querySelectorAll('a')).map(a => a.href);
          const h1s = document.querySelectorAll('h1').length;

          // Durable semantic selectors: closest section/card container, not
          // Tailwind utility classes. A match "card" is the whole clickable
          // link, already the semantic unit for that fixture.
          const match102Card = Array.from(document.querySelectorAll('a')).find(a => a.href.includes('match-102'))?.getBoundingClientRect();
          const match101Card = Array.from(document.querySelectorAll('a')).find(a => a.href.includes('match-101'))?.getBoundingClientRect();
          const placementHeading = Array.from(document.querySelectorAll('h2')).find(h => h.textContent?.includes('Destinations') || h.textContent?.includes('Placement Results'));
          const placementSection = (placementHeading?.closest('section') ?? placementHeading?.parentElement)?.getBoundingClientRect();
          const qfLink = Array.from(document.querySelectorAll('a')).find(a => /match-(97|98|99|100)/.test(a.href));
          const qfSection = qfLink?.closest('section')?.getBoundingClientRect();
          const tsInput = document.querySelector('input[type="search"]')?.getAttribute('aria-label');

          return {
            text,
            links,
            h1s,
            docWidth: document.documentElement.scrollWidth,
            bodyWidth: document.body.scrollWidth,
            innerWidth: window.innerWidth,
            match101Exists: !!match101Card,
            match102Exists: !!match102Card,
            destExists: !!placementSection,
            qfExists: !!qfSection,
            match101Top: match101Card ? match101Card.top : -1,
            match101Bottom: match101Card ? match101Card.bottom : -1,
            match102Top: match102Card ? match102Card.top : -1,
            match102Bottom: match102Card ? match102Card.bottom : -1,
            destTop: placementSection ? placementSection.top : -1,
            destBottom: placementSection ? placementSection.bottom : -1,
            destRight: placementSection ? placementSection.right : -1,
            destX: placementSection ? placementSection.x : -1,
            qfTop: qfSection ? qfSection.top : -1,
            tsInput,
          };
        });

        if (route === '/') {
          assert(data.h1s === 1, `[${label}] ${route} exactly one H1`);
          assert(/(France\s*0\s*[–-]\s*2\s*Spain|Spain\s*2\s*[–-]\s*0\s*France)/i.test(data.text), `[${label}] ${route} Spain 2-0 France exists`);
          assert(/(England\s*1\s*[–-]\s*2\s*Argentina|Argentina\s*2\s*[–-]\s*1\s*England)/i.test(data.text), `[${label}] ${route} England 1-2 Argentina exists`);
          assert(data.destExists, `[${label}] ${route} placement/current-stage section exists`);
          assert(data.qfExists, `[${label}] ${route} at least one quarterfinal archive item exists`);

          if (data.match101Exists && data.match102Exists && data.destExists && data.qfExists) {
            assert(data.match102Bottom <= data.match101Top + ORDER_TOLERANCE_PX, `[${label}] ${route} DOM order: Match 102 card bottom <= Match 101 card top`);
            assert(data.match101Bottom <= data.destTop + ORDER_TOLERANCE_PX, `[${label}] ${route} DOM order: Match 101 card bottom <= placement section top`);
            assert(data.destBottom <= data.qfTop + ORDER_TOLERANCE_PX, `[${label}] ${route} DOM order: placement section bottom <= quarterfinal archive top`);
          }

          assert(data.links.some(l => l.includes('match-103')), `[${label}] ${route} Match 103 link exists`);
          assert(data.links.some(l => l.includes('match-104')), `[${label}] ${route} Match 104 link exists`);
          assert(!/tbd/i.test(data.text), `[${label}] ${route} no raw TBD exists`);
          assert(!/Winner\s*of/i.test(data.text), `[${label}] ${route} no Winner of... exists`);
          assert(!/Loser\s*of/i.test(data.text), `[${label}] ${route} no Loser of... exists`);
          assert(!/England[^.]{0,40}vs[^.]{0,40}Argentina[^.]{0,60}Upcoming/i.test(data.text), `[${label}] ${route} no upcoming England vs Argentina card`);

          // Lifecycle-aware navigation: pre-completion nav must not surface
          // the archive hub link yet (that only appears once the tournament
          // is canonically complete — see lib/navLinks.ts ARCHIVE_DESKTOP_LINKS).
          assert(!data.links.some(l => l.endsWith('/world-cup-2026') || l.endsWith('/world-cup-2026/')), `[${label}] ${route} primary nav does not surface archive hub link before completion`);
          assert(data.links.some(l => l.includes('/today')), `[${label}] ${route} /today remains reachable in navigation`);
          assert(data.links.some(l => l.includes('/schedule')), `[${label}] ${route} /schedule remains reachable in navigation`);

          const match103Count = data.links.filter(l => l.includes('match-103')).length;
          const match104Count = data.links.filter(l => l.includes('match-104')).length;
          assert(match103Count === 1, `[${label}] ${route} exactly one Match 103 link (no duplicate)`);
          assert(match104Count === 1, `[${label}] ${route} exactly one Match 104 link (no duplicate)`);

          assert(data.docWidth <= data.innerWidth, `[${label}] ${route} document has no horizontal overflow`);
          assert(data.bodyWidth <= data.innerWidth, `[${label}] ${route} body has no horizontal overflow`);
          if (data.destExists) {
             assert(data.destRight <= data.innerWidth && data.destX >= 0, `[${label}] ${route} placement section bounding box remains inside viewport`);
          }

          if (vp.width === 390 && data.match101Exists && data.match102Exists) {
            assert(data.match102Top <= 650, `[${label}] ${route} England-Argentina y <= 650`);
            assert(data.match101Top <= 820, `[${label}] ${route} Spain-France y <= 820`);
          }
        }

        else if (route === '/today') {
          assert(data.h1s === 1, `[${label}] ${route} exactly one H1`);
          assert(data.text.includes('France') && data.text.includes('Spain') && data.text.includes('2') && data.text.includes('0'), `[${label}] ${route} current semifinal state is visible`);
          assert(data.docWidth <= data.innerWidth, `[${label}] ${route} no horizontal overflow`);
        }

        else if (route === '/matches/match-101') {
          assert(data.h1s === 1, `[${label}] ${route} exactly one H1`);
          assert(/France\s*0[–-]\s*2\s*Spain/i.test(data.text), `[${label}] ${route} France 0-2 Spain visible`);
          assert(/Final|Completed|FT/i.test(data.text) && !/Scheduled/i.test(data.text), `[${label}] ${route} completed state visible`);
          assert(!data.text.includes('Recent Form'), `[${label}] ${route} no Recent Form`);
          assert(!data.text.includes('Tournament Journey'), `[${label}] ${route} no Tournament Journey`);
          assert(!/Match Preview/i.test(data.text), `[${label}] ${route} no scheduled-preview module`);
          assert(data.links.some(l => l.includes('match-103')), `[${label}] ${route} next France match links to Match 103`);
          assert(data.links.some(l => l.includes('match-104')), `[${label}] ${route} next Spain match links to Match 104`);
          assert(!/\btbd\b/i.test(data.text), `[${label}] ${route} no raw tbd`);
        }

        else if (route === '/matches/match-102') {
          assert(data.h1s === 1, `[${label}] ${route} exactly one H1`);
          assert(/England\s*1[–-]\s*2\s*Argentina/i.test(data.text), `[${label}] ${route} England 1-2 Argentina visible`);
          assert(/Final|Completed|FT/i.test(data.text) && !/Scheduled/i.test(data.text), `[${label}] ${route} completed state visible`);
          assert(!data.text.includes('Recent Form'), `[${label}] ${route} no Recent Form`);
          assert(!data.text.includes('Tournament Journey'), `[${label}] ${route} no Tournament Journey`);
          assert(!/Match Preview/i.test(data.text), `[${label}] ${route} no scheduled-preview module`);
          assert(data.links.some(l => l.includes('match-103')), `[${label}] ${route} next England match links to Match 103`);
          assert(data.links.some(l => l.includes('match-104')), `[${label}] ${route} next Argentina match links to Match 104`);
          assert(!/\btbd\b/i.test(data.text), `[${label}] ${route} no raw tbd`);
        }

        else if (route === '/matches/match-103') {
          assert(data.h1s === 1, `[${label}] ${route} exactly one H1`);
          assert(/France\s*(vs|v\.?)\s*England/i.test(data.text), `[${label}] ${route} H1 is France vs England`);
          assert(/Third-place playoff/i.test(data.text), `[${label}] ${route} stage is Third-place playoff`);
          assert(!/\btbd\b/i.test(data.text), `[${label}] ${route} no raw tbd`);
          assert(!/Winner\s*of|Loser\s*of/i.test(data.text), `[${label}] ${route} no unresolved participant labels`);
        }

        else if (route === '/matches/match-104') {
          assert(data.h1s === 1, `[${label}] ${route} exactly one H1`);
          assert(/Spain\s*(vs|v\.?)\s*Argentina/i.test(data.text), `[${label}] ${route} H1 is Spain vs Argentina`);
          assert(/\bFinal\b/.test(data.text), `[${label}] ${route} stage is Final`);
          // "Matchday \d" targets the group-stage matchday indicator (1-3), not
          // the sitewide "WorldCupMatchDay 2026" brand+year header.
          assert(!/Group\s*Stage|\bMatchday\s+[1-3]\b/i.test(data.text), `[${label}] ${route} no Group-stage framing`);
          assert(!/Winner Match 101|Winner Match 102/i.test(data.text), `[${label}] ${route} no raw Winner Match 101/102 labels`);
          assert(!/\btbd\b/i.test(data.text), `[${label}] ${route} no raw tbd`);
          assert(!/Winner\s*of|Loser\s*of/i.test(data.text), `[${label}] ${route} no unresolved participant labels`);
        }

        else if (route === '/world-cup-2026') {
          assert(data.h1s === 1, `[${label}] ${route} exactly one H1`);
          assert(data.links.some(l => l.includes('/world-cup-2026/results')), `[${label}] ${route} links to full results archive`);
          assert(data.links.some(l => l.includes('/bracket')), `[${label}] ${route} links to bracket`);
          assert(data.links.some(l => l.includes('/stats')), `[${label}] ${route} links to stats`);
          assert(data.links.some(l => l.includes('/teams')), `[${label}] ${route} links to teams`);
          assert(data.links.some(l => l.includes('/groups')), `[${label}] ${route} links to groups`);
          assert(data.docWidth <= data.innerWidth, `[${label}] ${route} no horizontal overflow`);
        }

        else if (route === '/world-cup-2026/results') {
          assert(data.h1s === 1, `[${label}] ${route} exactly one H1`);
          assert(data.links.some(l => l.includes('/matches/match-104')), `[${label}] ${route} links to the Final match page`);
          assert(data.links.some(l => l.includes('/matches/match-103')), `[${label}] ${route} links to the Third-place match page`);
          assert(!/\btbd\b/i.test(data.text), `[${label}] ${route} no raw tbd`);
          assert(data.docWidth <= data.innerWidth, `[${label}] ${route} no horizontal overflow`);
        }

        else if (route === '/world-cup-2026/results/2026-07-11') {
          assert(data.h1s === 1, `[${label}] ${route} exactly one H1`);
          assert(/July 11,? 2026/i.test(data.text), `[${label}] ${route} date-page heading is visible`);
          assert(!/\btbd\b/i.test(data.text), `[${label}] ${route} no raw tbd`);
          assert(data.docWidth <= data.innerWidth, `[${label}] ${route} no horizontal overflow`);
        }

        else if (route === '/bracket') {
          assert(data.h1s === 1, `[${label}] ${route} exactly one H1`);
          assert(!/Semifinals/i.test(data.text.match(/Current phase[^\n]*/)?.[0] ?? ''), `[${label}] ${route} current-phase line is not stale Semifinals`);
          assert(data.docWidth <= data.innerWidth, `[${label}] ${route} no horizontal overflow`);
        }

        else if (route.startsWith('/groups/group-')) {
          const c1 = (data.text.match(/Advanced as group winner/gi) || []).length;
          const c2 = (data.text.match(/Advanced as runner-up/gi) || []).length;
          const c3 = (data.text.match(/Advanced as a third-place qualifier/gi) || []).length;
          const c4 = (data.text.match(/Eliminated in the group stage/gi) || []).length;
          assert((c1 + c2 + c3 + c4) === 4, `[${label}] ${route} exactly four final-outcome labels`);

          const forbidden = /may qualify|eligible to advance|current leader|leads the group/i.test(data.text);
          assert(!forbidden, `[${label}] ${route} no forbidden phrases`);
        }

        else if (route.startsWith('/schedule')) {
          assert(/Match 103/i.test(data.text), `[${label}] ${route} Match 103 visible`);
          assert(/Third-place/i.test(data.text), `[${label}] ${route} Third-place playoff visible`);
          assert(/France/i.test(data.text) && /England/i.test(data.text), `[${label}] ${route} France vs England visible for third place`);
          assert(!/Loser/i.test(data.text), `[${label}] ${route} No 'Loser of' fallback string visible`);
          assert(/Match 104/i.test(data.text), `[${label}] ${route} Match 104 visible`);
          assert(/Final/i.test(data.text), `[${label}] ${route} Final visible`);
          assert(/Spain/i.test(data.text) && /Argentina/i.test(data.text), `[${label}] ${route} Spain vs Argentina visible for final`);
          assert(!/Winner/i.test(data.text), `[${label}] ${route} No 'Winner of' fallback string visible`);
          assert(!/France\s*vs\s*Spain/i.test(data.text), `[${label}] ${route} no false future France vs Spain fixture`);
        }

        else if (route === '/stats/top-scorers') {
          assert(data.tsInput === 'Search players', `[${label}] ${route} Top Scorers search field accessible name`);
        }

        else if (route === '/stats' || route === '/stats/players' || route === '/stats/teams' || route === '/stats/compare') {
          assert(data.h1s === 1, `[${label}] ${route} exactly one H1`);
          assert(data.docWidth <= data.innerWidth, `[${label}] ${route} no horizontal overflow`);
        }

        else if (route === '/teams') {
          assert(data.text.includes('Teams that still have a match remaining in the tournament.'), `[${label}] ${route} active-filter description exact match`);
        }

        else if (route === '/teams/france' || route === '/teams/spain') {
          assert(/France\s*0[–-]\s*2\s*Spain/i.test(data.text), `[${label}] ${route} explicit France 0-2 Spain latest result`);
          assert(/lost to spain|beat france/i.test(data.text) || /0[–-]2/i.test(data.text), `[${label}] ${route} opponent-aware result copy`);
          assert(data.links.some(l => l.includes('match-101')), `[${label}] ${route} link to /matches/match-101`);
          assert(!/\btbd\b/i.test(data.text), `[${label}] ${route} no raw tbd`);

          if (route === '/teams/france') {
             assert(/Third-place/i.test(data.text) || /3rd Place/i.test(data.text), `[${label}] ${route} Third-place path visible`);
             assert(data.links.some(l => l.includes('match-103')), `[${label}] ${route} link to /matches/match-103`);
          } else if (route === '/teams/spain') {
             assert(/Final/i.test(data.text), `[${label}] ${route} Final path visible`);
             assert(data.links.some(l => l.includes('match-104')), `[${label}] ${route} link to /matches/match-104`);
          }
        }
        else if (route === '/teams/england' || route === '/teams/argentina') {
          assert(/England\s*1[–-]\s*2\s*Argentina/i.test(data.text), `[${label}] ${route} explicit England 1-2 Argentina latest result`);
          assert(/lost to argentina|beat england/i.test(data.text) || /1[–-]2/i.test(data.text), `[${label}] ${route} opponent-aware result copy`);
          assert(data.links.some(l => l.includes('match-102')), `[${label}] ${route} link to /matches/match-102`);
          assert(!/\btbd\b/i.test(data.text), `[${label}] ${route} no raw tbd`);

          if (route === '/teams/england') {
             assert(/Third-place/i.test(data.text) || /3rd Place/i.test(data.text), `[${label}] ${route} Third-place path visible`);
             assert(data.links.some(l => l.includes('match-103')), `[${label}] ${route} link to /matches/match-103`);
          } else if (route === '/teams/argentina') {
             assert(/Final/i.test(data.text), `[${label}] ${route} Final path visible`);
             assert(data.links.some(l => l.includes('match-104')), `[${label}] ${route} link to /matches/match-104`);
          }
        }

        else if (route === '/teams/turkey' || route === '/teams/brazil') {
          assert(data.h1s === 1, `[${label}] ${route} exactly one H1`);
          assert(!/\btbd\b/i.test(data.text), `[${label}] ${route} no raw tbd`);
          assert(data.docWidth <= data.innerWidth, `[${label}] ${route} no horizontal overflow`);
          if (route === '/teams/turkey') {
            assert(/eliminat/i.test(data.text), `[${label}] ${route} states elimination status`);
            assert(/Group D/i.test(data.text), `[${label}] ${route} names the correct group (D)`);
          }
        }
      } catch (err: any) {
        assert(false, `[${label}] ${route} evaluation or navigation error: ${err.message}`);
      } finally {
        page.off('pageerror', onPageError);
        page.off('console', onConsole);
        await page.close();
      }
    }
  }

  await browser.close();

  const totalAssertions = passCount + failureCount;
  console.log(`\nRoutes covered: ${ROUTES.length}`);
  console.log(`Viewports covered: ${VIEWPORTS.length} (${VIEWPORTS.map(v => `${v.width}×${v.height}`).join(', ')})`);
  console.log(`Assertions run: ${totalAssertions} (pass: ${passCount}, fail: ${failureCount})`);

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
