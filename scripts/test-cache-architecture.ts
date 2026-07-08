import assert from 'assert';
import { getTournamentLiveSnapshot } from '../lib/liveSnapshot';

async function runTests() {
  console.log('=== Running Cache Architecture Tests (Static Mode) ===');
  const snap = await getTournamentLiveSnapshot();
  assert.strictEqual(snap.isFallback, true, 'Must use fallback snapshot');
  assert.strictEqual(snap.primaryProviderOk, false);
  console.log('✅ Cache architecture replaced by static canonical fallback');
}
runTests().catch(e => { console.error(e); process.exit(1); });
