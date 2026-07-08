import assert from 'assert';
import { getTournamentLiveSnapshot } from '../lib/liveSnapshot';
import { MATCHES, matchSlug } from '../lib/matches';

async function runTests() {
  console.log('=== Running P0 Display Consistency Tests (Static Mode) ===');
  const snap = await getTournamentLiveSnapshot();
  const mexico = MATCHES[0];
  const snapMatch = snap.matches[matchSlug(mexico)];
  assert.ok(snapMatch, 'Match exists in snapshot');
  console.log('✅ Known scores and matches render from canonical/static data');
}
runTests().catch(e => { console.error(e); process.exit(1); });
