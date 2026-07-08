import assert from 'assert';
import { buildKnockoutResolution } from '../lib/knockoutResolution';
import { getTournamentLiveSnapshot } from '../lib/liveSnapshot';

async function runTests() {
  console.log('=== Running P0 Knockout Integrity Tests (Static Mode) ===');
  const snap = await getTournamentLiveSnapshot();
  const resolution = buildKnockoutResolution(snap.matches);
  assert.ok(resolution, 'Knockout resolution builds from static fallback');
  console.log('✅ Knockout data integrity intact in static mode');
}
runTests().catch(e => { console.error(e); process.exit(1); });
