import assert from 'assert';
import fs from 'fs';

async function runTests() {
  console.log('=== Running Durable Baseline Tests (Static Mode) ===');
  const config = fs.readFileSync('next.config.js', 'utf8');
  assert.ok(config.includes('output: "export"'), 'next config must have output: export');
  console.log('✅ output: export configured');
}
runTests().catch(e => { console.error(e); process.exit(1); });
