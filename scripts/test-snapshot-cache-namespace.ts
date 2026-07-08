import assert from 'assert';
import fs from 'fs';

async function runTests() {
  console.log('=== Running Cache Namespace Tests (Static Mode) ===');
  assert.ok(!fs.existsSync('lib/clientLiveSnapshot.ts'), 'clientLiveSnapshot.ts deleted');
  console.log('✅ Client API snapshot fetcher deleted');
}
runTests().catch(e => { console.error(e); process.exit(1); });
