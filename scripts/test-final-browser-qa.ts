import puppeteer from 'puppeteer';

const VIEWPORTS = [
  { width: 390, height: 844, name: 'Mobile (390)' }
];

const BASE_URL = 'http://localhost:3000';
const URLS_TO_TEST = [
  '/',
  '/teams/france',
  '/teams/spain',
  ...['a','b','c','d','e','f','g','h','i','j','k','l'].map(g => `/groups/group-${g}`),
  '/schedule'
];

async function checkClipping(page: any) {
  return await page.evaluate(() => {
    let culprets: string[] = [];
    document.querySelectorAll('*').forEach((el: any) => {
      // Check for horizontal clipping/overflow
      if (el.scrollWidth > el.clientWidth && window.getComputedStyle(el).overflow !== 'hidden' && window.getComputedStyle(el).overflowX !== 'auto' && window.getComputedStyle(el).overflowX !== 'scroll') {
        culprets.push(el.className + ' | <' + el.tagName + '>');
      }
    });
    
    // Check global horizontal scroll
    if (document.documentElement.scrollWidth > window.innerWidth) {
      culprets.push('document.documentElement exceeds innerWidth');
    }
    if (document.body.scrollWidth > window.innerWidth) {
      culprets.push('document.body exceeds innerWidth');
    }
    
    return culprets.length > 0 ? culprets : false;
  });
}

async function checkH1Count(page: any) {
  return await page.evaluate(() => document.querySelectorAll('h1').length);
}

async function run() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  let hasErrors = false;

  for (const vp of VIEWPORTS) {
    console.log(`\n=== Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ===`);
    await page.setViewport({ width: vp.width, height: vp.height });

    for (const route of URLS_TO_TEST) {
      console.log(`\nTesting ${route}`);
      
      const errors: string[] = [];
      const warnings: string[] = [];
      
      page.on('console', (msg) => {
        if (msg.type() === 'error' && !msg.text().includes('404')) errors.push(msg.text());
        if (msg.type() === 'warn') warnings.push(msg.text());
      });

      const suffix = route === '/' ? '' : '.html';
      await page.goto(`${BASE_URL}${route}${suffix}`, { waitUntil: 'networkidle0' });

      // Check H1 Count
      const h1Count = await checkH1Count(page);
      if (h1Count !== 1) {
        console.error(`❌ FAIL: Expected 1 H1 on ${route}, found ${h1Count}`);
        hasErrors = true;
      } else {
        console.log(`✅ PASS: exactly 1 H1`);
      }

      // Check Console Errors / Hydration Warnings
      if (errors.length > 0) {
        console.error(`❌ FAIL: Console errors found:`, errors);
        hasErrors = true;
      } else {
        console.log(`✅ PASS: no console errors`);
      }

      const hydrationWarnings = warnings.filter(w => w.toLowerCase().includes('hydration') || w.toLowerCase().includes('did not match'));
      if (hydrationWarnings.length > 0) {
        console.error(`❌ FAIL: Hydration warnings found:`, hydrationWarnings);
        hasErrors = true;
      } else {
        console.log(`✅ PASS: no hydration warnings`);
      }

      // Check for horizontal overflow/clipping
      const isClipped = await checkClipping(page);
      if (isClipped) {
        console.error(`❌ FAIL: Horizontal overflow / clipping detected on ${route}:`, isClipped);
        hasErrors = true;
      } else {
        console.log(`✅ PASS: no horizontal overflow / clipping`);
      }

      // PAGE SPECIFIC CHECKS
      if (route === '/') {
        const homeCheck = await page.evaluate(() => {
          const h1 = document.querySelector('h1')?.getBoundingClientRect();
          const spainCard = Array.from(document.querySelectorAll('a')).find(a => a.href.includes('match-101'))?.getBoundingClientRect();
          const engCard = Array.from(document.querySelectorAll('a')).find(a => a.href.includes('match-102'))?.getBoundingClientRect();
          const qfCard = Array.from(document.querySelectorAll('a')).find(a => a.href.includes('match-97') || a.href.includes('match-98') || a.href.includes('match-99') || a.href.includes('match-100'))?.getBoundingClientRect();
          const destinations = Array.from(document.querySelectorAll('h2')).find(h => h.textContent?.includes('Destinations'))?.parentElement?.getBoundingClientRect();
          return { 
            h1: h1 ? { x: h1.x, y: h1.y, width: h1.width, height: h1.height, right: h1.right } : null,
            spainCard: spainCard ? { x: spainCard.x, y: spainCard.y, width: spainCard.width, height: spainCard.height, right: spainCard.right } : null, 
            engCard: engCard ? { x: engCard.x, y: engCard.y, width: engCard.width, height: engCard.height, right: engCard.right } : null, 
            qfCard: qfCard ? { x: qfCard.x, y: qfCard.y, width: qfCard.width, height: qfCard.height, right: qfCard.right } : null,
            destinations: destinations ? { x: destinations.x, y: destinations.y, width: destinations.width, height: destinations.height, right: destinations.right } : null,
            innerWidth: window.innerWidth
          };
        });
        console.log('Homepage Bounding Boxes:', homeCheck);
        
        if (!homeCheck.destinations) {
          console.error(`❌ FAIL: destination section is absent`);
          hasErrors = true;
        } else {
          if (homeCheck.engCard && homeCheck.destinations.y < homeCheck.engCard.y) {
            console.error(`❌ FAIL: destination section appears before England-Argentina`);
            hasErrors = true;
          }
          if (homeCheck.qfCard && homeCheck.destinations.y > homeCheck.qfCard.y) {
            console.error(`❌ FAIL: destination section appears after the quarterfinal archive`);
            hasErrors = true;
          }
          if (vp.width === 390 || vp.width === 360) {
            if (homeCheck.destinations.right > homeCheck.innerWidth || homeCheck.destinations.x < 0) {
              console.error(`❌ FAIL: destination rect extends outside the mobile viewport`);
              hasErrors = true;
            }
          }
        }
        
        if (vp.width === 390) {
          if (homeCheck.spainCard && homeCheck.spainCard.y > 650) {
            console.error(`❌ FAIL: Spain card y=${homeCheck.spainCard.y} exceeds 650`);
            hasErrors = true;
          }
          if (homeCheck.engCard && homeCheck.engCard.y > 820) {
            console.error(`❌ FAIL: England card y=${homeCheck.engCard.y} exceeds 820`);
            hasErrors = true;
          }
          if (homeCheck.h1 && homeCheck.h1.right > homeCheck.innerWidth) {
            console.error(`❌ FAIL: H1 overflows viewport`);
            hasErrors = true;
          }
          if (homeCheck.spainCard && homeCheck.spainCard.right > homeCheck.innerWidth) {
            console.error(`❌ FAIL: Spain card overflows viewport`);
            hasErrors = true;
          }
          if (homeCheck.engCard && homeCheck.engCard.right > homeCheck.innerWidth) {
            console.error(`❌ FAIL: England card overflows viewport`);
            hasErrors = true;
          }
        }
      }
      
      if (route === '/matches/match-102') {
        const m102Check = await page.evaluate(() => {
          const form = document.body.innerText?.includes('Recent Form');
          const journey = document.body.innerText?.includes('Tournament Journey');
          const engJourney = document.body.innerText?.includes('Quarter-final vs Switzerland');
          const argJourney = document.body.innerText?.includes('Quarter-final vs Norway');
          const cityVenue = document.body.innerText?.includes('Mercedes-Benz Stadium') && document.body.innerText?.includes('Atlanta');
          const links = Array.from(document.querySelectorAll('a')).map(a => a.href);
          const hasM103 = links.some(l => l.includes('match-103'));
          const hasM104 = links.some(l => l.includes('match-104'));
          return { form, journey, engJourney, argJourney, cityVenue, hasM103, hasM104 };
        });
        console.log('Match 102 Data:', m102Check);
      }
      
      if (route.startsWith('/groups/group-')) {
        const groupsCheck = await page.evaluate(() => {
          const txt = document.body.innerText || '';
          const c1 = (txt.match(/Advanced as group winner/g) || []).length;
          const c2 = (txt.match(/Advanced as runner-up/g) || []).length;
          const c3 = (txt.match(/Advanced as a third-place qualifier/g) || []).length;
          const c4 = (txt.match(/Eliminated in the group stage/g) || []).length;
          const totalLabels = c1 + c2 + c3 + c4;
          
          const noForbidden = !txt.match(/may qualify|eligible to advance|current leader|leads the group/i);
          return { totalLabels, noForbidden };
        });
        console.log(`Group ${route} Data:`, groupsCheck);
      }

      if (route.startsWith('/schedule')) {
        const scheduleCheck = await page.evaluate(() => {
          const txt = document.body.innerText || '';
          const hasM103 = txt.includes('Match 103') && txt.includes('Third-place playoff');
          const hasM104 = txt.includes('Match 104') && txt.includes('Final');
          
          // Should not see raw "France vs Spain" scheduled future fixture
          const hasFranceSpainStr = (txt.match(/France.{0,20}vs.{0,20}Spain/i) || []).length > 0;
          return { hasM103, hasM104, hasFranceSpainStr };
        });
        console.log(`Schedule ${route} Data:`, scheduleCheck);
      }
      
      if (route === '/stats/top-scorers') {
        const tsCheck = await page.evaluate(() => {
          const input = document.querySelector('input[type="search"]');
          return input ? input.getAttribute('aria-label') : null;
        });
        console.log('Top Scorers Search ARIA Label:', tsCheck);
      }
    }
  }

  await browser.close();
  if (hasErrors) {
    console.error('FAILED SOME CHECKS');
    throw new Error('Test failed');
  } else {
    console.log('ALL PASSED');
  }
}

run().catch(console.error);
