import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
function assert(condition: boolean, message: string): void {
  if (condition) console.log('PASS ' + message);
  else {
    console.error('FAIL ' + message);
    failures += 1;
  }
}

async function main() {
  const outDir = join(process.cwd(), 'out');
  assert(existsSync(outDir), 'out/ directory exists');
  if (!existsSync(outDir)) {
    process.exitCode = 1;
    return;
  }

  const out101 = join(outDir, 'matches', 'match-101.html');
  const out102 = join(outDir, 'matches', 'match-102.html');
  
  assert(existsSync(out101), 'out/matches/match-101.html exists');
  assert(existsSync(out102), 'out/matches/match-102.html exists');

  const html101 = readFileSync(out101, 'utf8').replace(/<!-- -->/g, '');
  const html102 = readFileSync(out102, 'utf8').replace(/<!-- -->/g, '');
  
  assert((html101.match(/<h1[^>]*>France 0–2 Spain<\/h1>/) || []).length === 1, 'Match 101 contains exactly one H1: France 0–2 Spain');
  assert(!html101.includes('Tournament Journey') && !html101.includes('Recent Form'), 'Match 101 contains no scheduled preview');
  
  assert((html102.match(/<h1[^>]*>England vs Argentina<\/h1>/) || []).length === 1, 'Match 102 contains exactly one H1: England vs Argentina');
  assert(html102.includes('Mercedes-Benz Stadium'), 'Match 102 canonical stadium (Mercedes-Benz Stadium)');
  assert(html102.includes('Atlanta'), 'Match 102 canonical city (Atlanta)');
  assert(html102.includes('Recent Form') && html102.includes('Tournament Journey'), 'Match 102 contains both Recent Form and Tournament Journey');
  
  // both journey containers
  const pEngland = html102.indexOf('England');
  const pArgentina = html102.indexOf('Argentina', pEngland + 1);
  assert(pEngland !== -1 && pArgentina !== -1, 'Match 102 containers for England and Argentina exist');
  
  // at least one completed knockout journey row for England
  // each tested row contains: full stage label, opponent, score/result, canonical match link
  assert(html102.includes('Quarter-final vs') && html102.includes('href="/matches/match-100"'), 'Match 102 contains completed knockout journey row for England with link');
  // at least one completed knockout journey row for Argentina
  assert(html102.includes('Quarter-final vs') && html102.includes('href="/matches/match-99"'), 'Match 102 contains completed knockout journey row for Argentina with link');

  assert(html102.includes('Match 104 — Final') || html102.includes('Match 104 — Final') || (html102.includes('Match 104') && html102.includes('Final') && html102.includes('href="/matches/match-104"')), 'Match 104 — Final and its link');
  assert(html102.includes('Match 103 — Third-place playoff') || html102.includes('Match 103 — Third-place playoff') || (html102.includes('Match 103') && html102.includes('Third-place playoff') && html102.includes('href="/matches/match-103"')), 'Match 103 — Third-place playoff and its link');

  for (const group of ['a','b','c','d','e','f','g','h','i','j','k','l']) {
    const outGroup = join(outDir, 'groups', `group-${group}.html`);
    assert(existsSync(outGroup), outGroup + ' exists');
    if (existsSync(outGroup)) {
      const html = readFileSync(outGroup, 'utf8').replace(/<!-- -->/g, '');
      const htmlNoScripts = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      const c1 = (htmlNoScripts.match(/Advanced as group winner/g) || []).length;
      const c2 = (htmlNoScripts.match(/Advanced as runner-up/g) || []).length;
      const c3 = (htmlNoScripts.match(/Advanced as a third-place qualifier/g) || []).length;
      const c4 = (htmlNoScripts.match(/Eliminated in the group stage/g) || []).length;
      assert(c1 + c2 + c3 + c4 === 4, 'Group ' + group + ' has exactly four allowed final outcome labels in total');
      assert(!html.includes('may qualify') && !html.includes('eligible to advance') && !html.includes('current leader') && !html.includes('leads the group'), 'Group ' + group + ' contains no forbidden transitional phrase');
    }
  }

  const timezones = ['eastern-time', 'uk-time', 'turkey-time', 'australia-time', 'brazil-time', 'india-time', 'japan-time'];
  const schedules = [join(outDir, 'schedule.html'), ...timezones.map(tz => join(outDir, 'schedule', `${tz}.html`))];
  
  for (const route of schedules) {
    assert(existsSync(route), route + ' exists');
    if (existsSync(route)) {
      const html = readFileSync(route, 'utf8').replace(/<!-- -->/g, '');
      assert(html.includes('Match 103') && html.includes('Third-place playoff') && html.includes('France') && html.includes('Loser of England vs Argentina'), 'Route ' + route + ' has visible Match 103, Third-place playoff, France, Loser of England vs Argentina');
      assert(html.includes('Match 104') && html.includes('Final') && html.includes('Spain') && html.includes('Winner of England vs Argentina'), 'Route ' + route + ' has visible Match 104, Final, Spain, Winner of England vs Argentina');
      const htmlNoScripts = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      assert(!htmlNoScripts.match(/France.{0,20}vs.{0,20}Spain/i), 'Route ' + route + ' has no future France vs Spain fixture');
      
      // Match 101 completed
      assert(html.includes('France') && html.includes('Spain') && html.includes('FT'), 'Route ' + route + ' shows Match 101 as completed');
      
      // Match 102 active semifinal
      assert(html.includes('England') && html.includes('Argentina') && html.includes('Match 102'), 'Route ' + route + ' shows Match 102 active semifinal');
    }
  }

  const routes = [
    join(outDir, 'index.html'),
    join(outDir, 'today.html'),
    join(outDir, 'schedule.html'),
    out101,
    out102
  ];
  for (const route of routes) {
    assert(existsSync(route), route + ' exists');
    if (existsSync(route)) {
      const html = readFileSync(route, 'utf8').replace(/<!-- -->/g, '');
      assert((html.match(/<h1\b/g) || []).length === 1, route + ' has exactly one H1');
    }
  }

  const teamFrance = join(outDir, 'teams', 'france.html');
  const teamSpain = join(outDir, 'teams', 'spain.html');
  assert(existsSync(teamFrance), teamFrance + ' exists');
  assert(existsSync(teamSpain), teamSpain + ' exists');
  for (const route of [teamFrance, teamSpain]) {
    if (existsSync(route)) {
      const html = readFileSync(route, 'utf8').replace(/<!-- -->/g, '');
      assert(html.includes('France') && html.includes('0–2') && html.includes('Spain') && html.includes('href="/matches/match-101"'), route + ' has Match 101 0-2 result with link');
    }
  }

  const teamsDirectory = join(outDir, 'teams.html');
  assert(existsSync(teamsDirectory), teamsDirectory + ' exists');
  if (existsSync(teamsDirectory)) {
    const html = readFileSync(teamsDirectory, 'utf8').replace(/<!-- -->/g, '');
    assert(html.includes('Teams that still have a match remaining in the tournament.'), 'Teams directory contains exact active text');
  }

  const topScorersOut = join(outDir, 'stats', 'top-scorers.html');
  assert(existsSync(topScorersOut), topScorersOut + ' exists');
  if (existsSync(topScorersOut)) {
    assert(readFileSync(topScorersOut, 'utf8').includes('aria-label="Search players"'), 'Top Scorers search accessible name remains Search players');
  }

  if (failures > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
