import assert from 'assert';
import fs from 'fs';

async function runTests() {
  console.log('=== Running Live Polling Tests (Static Mode) ===');
  const tMatches = fs.readFileSync('components/TodayMatches.tsx', 'utf8');
  const mDetail = fs.readFileSync('components/MatchDetail.tsx', 'utf8');
  const ticker = fs.readFileSync('components/Ticker.tsx', 'utf8');

  assert.ok(!tMatches.includes('router.refresh'), 'no router.refresh in TodayMatches');
  assert.ok(!mDetail.includes('router.refresh'), 'no router.refresh in MatchDetail');
  assert.ok(!ticker.includes('fetchClientLiveSnapshot'), 'no client fetch in Ticker');
  console.log('✅ Client polling eliminated');
}
runTests().catch(e => { console.error(e); process.exit(1); });
