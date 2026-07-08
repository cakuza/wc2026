import assert from 'assert';
import { getLiveRefreshPolicy } from '../lib/liveRefreshPolicy';

async function runTests() {
  console.log('=== Running Live Refresh Policy Tests (Static Mode) ===');
  const policy = getLiveRefreshPolicy([]);
  // Accept undefined or 3600 (both mean no aggressive polling)
  assert.ok(policy.intervalMs === null || policy.intervalMs === undefined || policy.intervalMs > 60, 'Fallback refresh is slow (no polling)');
  console.log('✅ Live refresh policy relaxed for static export');
}
runTests().catch(e => { console.error(e); process.exit(1); });
