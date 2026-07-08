import assert from 'assert';
import { getTournamentLiveSnapshot } from '../lib/liveSnapshot';

async function runTests() {
  console.log('=== Running Snapshot Consistency Tests (Static Mode) ===');
  const snap = await getTournamentLiveSnapshot();
  assert.ok(snap.isFallback, 'Must use local canonical fallback');
  assert.ok(Object.keys(snap.matches).length > 0, 'Must provide match fallbacks');
  console.log('✅ Static snapshot uses canonical/local data only');
}
runTests().catch(e => { console.error(e); process.exit(1); });
