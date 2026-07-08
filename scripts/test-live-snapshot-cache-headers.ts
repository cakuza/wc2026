import assert from 'assert';
import fs from 'fs';

async function runTests() {
  console.log('=== Running Cache Headers Tests (Static Mode) ===');
  const matchPage = fs.readFileSync('app/matches/[matchId]/page.tsx', 'utf8');
  const teamPage = fs.readFileSync('app/teams/[slug]/page.tsx', 'utf8');

  assert.ok(matchPage.includes('generateStaticParams'), 'dynamic routes must have generateStaticParams');
  assert.ok(teamPage.includes('generateStaticParams'), 'dynamic routes must have generateStaticParams');
  console.log('✅ generateStaticParams present on dynamic routes');
}
runTests().catch(e => { console.error(e); process.exit(1); });
