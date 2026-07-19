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
  const out103 = join(outDir, 'matches', 'match-103.html');
  const out104 = join(outDir, 'matches', 'match-104.html');

  assert(existsSync(out101), 'out/matches/match-101.html exists');
  assert(existsSync(out102), 'out/matches/match-102.html exists');
  assert(existsSync(out103), 'out/matches/match-103.html exists');
  assert(existsSync(out104), 'out/matches/match-104.html exists');

  const html101 = readFileSync(out101, 'utf8').replace(/<!-- -->/g, '');
  const html102 = readFileSync(out102, 'utf8').replace(/<!-- -->/g, '');
  const html103 = readFileSync(out103, 'utf8').replace(/<!-- -->/g, '');
  const html104 = readFileSync(out104, 'utf8').replace(/<!-- -->/g, '');

  const getNoScriptHtml = (h: string) => h.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  assert(!getNoScriptHtml(html101).match(/tbd/i), 'Match 101 contains no visible TBD');
  assert(!getNoScriptHtml(html102).match(/tbd/i), 'Match 102 contains no visible TBD');
  assert(!getNoScriptHtml(html103).match(/tbd/i), 'Match 103 contains no visible TBD');
  assert(!getNoScriptHtml(html104).match(/tbd/i), 'Match 104 contains no visible TBD');

  assert(getNoScriptHtml(html103).includes('France') && getNoScriptHtml(html103).includes('England'), 'Match 103 contains France and England');
  assert(getNoScriptHtml(html103).includes('Third-place playoff'), 'Match 103 stage is Third-place playoff');
  assert(!getNoScriptHtml(html103).match(/Winner of/i) && !getNoScriptHtml(html103).match(/Loser of/i), 'Match 103 has no unresolved participants');

  assert(getNoScriptHtml(html104).includes('Spain') && getNoScriptHtml(html104).includes('Argentina'), 'Match 104 contains Spain and Argentina');
  assert(getNoScriptHtml(html104).includes('Final'), 'Match 104 stage is Final');
  assert(!getNoScriptHtml(html104).match(/Winner of/i) && !getNoScriptHtml(html104).match(/Loser of/i), 'Match 104 has no unresolved participants');

  assert((html101.match(/<h1[^>]*>France 0–2 Spain<\/h1>/) || []).length === 1, 'Match 101 contains exactly one H1: France 0–2 Spain');
  assert(!html101.includes('Tournament Journey') && !html101.includes('Recent Form'), 'Match 101 contains no scheduled preview');

  assert((html102.match(/<h1[^>]*>England 1–2 Argentina<\/h1>/) || []).length === 1, 'Match 102 contains exactly one H1: England 1–2 Argentina');
  assert(html102.includes('Mercedes-Benz Stadium'), 'Match 102 canonical stadium (Mercedes-Benz Stadium)');
  assert(html102.includes('Atlanta'), 'Match 102 canonical city (Atlanta)');
  assert(!html102.includes('Tournament Journey') && !html102.includes('Recent Form'), 'Match 102 contains no scheduled preview');

  // both journey containers
  const pEngland = html102.indexOf('England');
  const pArgentina = html102.indexOf('Argentina', pEngland + 1);
  assert(pEngland !== -1 && pArgentina !== -1, 'Match 102 containers for England and Argentina exist');

  assert(html102.includes('Spain') && html102.includes('Argentina') && html102.includes('href="/matches/match-104"'), 'Match 104 — Final and its link');
  assert(html102.includes('France') && html102.includes('England') && html102.includes('href="/matches/match-103"'), 'Match 103 — Third-place playoff and its link');

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
      assert(html.includes('Match 103') && html.includes('Third-place playoff') && html.includes('France') && html.includes('England'), 'Route ' + route + ' has visible Match 103, Third-place playoff, France, England');
      assert(html.includes('Match 104') && html.includes('Final') && html.includes('Spain') && html.includes('Argentina'), 'Route ' + route + ' has visible Match 104, Final, Spain, Argentina');
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
    join(outDir, 'bracket.html'),
    join(outDir, 'teams', 'england.html'),
    join(outDir, 'teams', 'france.html'),
    join(outDir, 'teams', 'spain.html'),
    join(outDir, 'teams', 'argentina.html'),
    out101,
    out102,
    out103,
    out104
  ];
  for (const route of routes) {
    assert(existsSync(route), route + ' exists');
    if (existsSync(route)) {
      const html = readFileSync(route, 'utf8').replace(/<!-- -->/g, '');
      assert((html.match(/<h1\b/g) || []).length === 1, route + ' has exactly one H1');
      assert(!getNoScriptHtml(html).match(/tbd/i), route + ' has no visible TBD');
      assert(!getNoScriptHtml(html).match(/Winner of England/i), route + ' has no Winner of England placeholder');
      assert(!getNoScriptHtml(html).match(/Loser of England/i), route + ' has no Loser of England placeholder');
      if (route.includes('bracket.html')) {
        assert(!getNoScriptHtml(html).match(/Semifinals/i), 'Bracket has no Semifinals phase framing');
      }
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
    assert(html.includes('All 48 national teams that competed at the 2026 World Cup, with their current or final tournament status.'), 'Teams directory contains truthful default copy');
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
