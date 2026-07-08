import assert from 'assert';
import { getTournamentLiveSnapshot } from '../lib/liveSnapshot';

async function runTests() {
  console.log('=== Running Shared Snapshot Cache Tests (Static Mode) ===');
  const snap1 = await getTournamentLiveSnapshot();
  const snap2 = await getTournamentLiveSnapshot();
  assert.strictEqual(snap1.snapshotId, snap2.snapshotId, 'Snapshot generation is deterministic');
  console.log('✅ Deterministic static generation confirmed');
}
runTests().catch(e => { console.error(e); process.exit(1); });
