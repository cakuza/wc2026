import assert from 'assert';
import fs from 'fs';

async function runTests() {
  console.log('=== Running Fallback Surfaces Tests (Static Mode) ===');
  assert.ok(!fs.existsSync('app/api'), 'API routes must not exist');
  console.log('✅ app/api routes deleted');
}
runTests().catch(e => { console.error(e); process.exit(1); });
