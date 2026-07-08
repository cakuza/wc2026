import assert from 'assert';
import fs from 'fs';

async function runTests() {
  console.log('=== Running Live Freshness Tests (Static Mode) ===');
  const src = fs.readFileSync('app/page.tsx', 'utf8');
  assert.ok(!src.includes('export const dynamic = "force-dynamic"'), 'force-dynamic must be removed');
  assert.ok(!src.includes('import { cookies }'), 'cookies() must be removed');
  console.log('✅ force-dynamic and cookies() removed');
}
runTests().catch(e => { console.error(e); process.exit(1); });
