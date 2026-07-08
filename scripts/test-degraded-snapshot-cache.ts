import assert from 'assert';
import fs from 'fs';

async function runTests() {
  console.log('=== Running Degraded Cache Tests (Static Mode) ===');
  const src = fs.readFileSync('lib/liveSnapshot.ts', 'utf8');
  assert.ok(!src.includes('unstable_cache'), 'No unstable_cache in render path');
  console.log('✅ unstable_cache completely removed');
}
runTests().catch(e => { console.error(e); process.exit(1); });
