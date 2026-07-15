import fs from 'fs';
import { TEAMS } from '../../lib/teams';
import { COMPLETED_KNOCKOUT_RESULTS } from '../../lib/canonicalMatchResults';

const matchesData = JSON.parse(fs.readFileSync('data/archive/matches.json', 'utf8'));
const sourcesData = JSON.parse(fs.readFileSync('data/archive/sources.json', 'utf8'));
type ArchiveEvent = {
  id: string;
  matchId: string;
  playerName: string;
  eventType: string;
  minute: number;
  period: string;
  teamKey: string;
  relatedPlayerName?: string;
  assistPlayerName?: string;
  sourceId: string;
  confidence: string;
};
const eventsData = JSON.parse(fs.readFileSync('data/archive/match-events.json', 'utf8')) as ArchiveEvent[];
const matchStatsData = JSON.parse(fs.readFileSync('data/archive/match-stats.json', 'utf8')) as Array<Record<string, unknown>>;
const espnMatchMap = JSON.parse(fs.readFileSync('data/archive/provenance/espn-match-map.json', 'utf8')) as Array<Record<string, unknown>>;

let errors = 0;
const slugs = new Set();
const numbers = new Set();

function fail(message: string) {
  console.error(message);
  errors++;
}

function validateMatch101Package() {
  const result = COMPLETED_KNOCKOUT_RESULTS[101];
  if (!result || result.homeScore !== 0 || result.awayScore !== 2 || result.winner !== 'AWAY_TEAM' || result.scoreDuration !== 'REGULAR' || result.penaltyShootoutScore !== undefined) {
    fail('Match 101 canonical result must be France 0-2 Spain in regular time without a shootout.');
  }

  const matchEvents = eventsData.filter((event) => event.matchId === 'match-101');
  const expectedIdentities = [
    'espn:49792055|yellow_card|9|first_half|France|Adrien Rabiot||',
    'espn:49792518|penalty_goal|22|first_half|Spain|Mikel Oyarzabal||',
    'espn:49792635|substitution|30|first_half|France|Maxence Lacroix|William Saliba|',
    'espn:49792649|yellow_card|31|first_half|Spain|Marc Cucurella||',
    'espn:49793060|substitution|45|first_half|France|Manu Koné|Adrien Rabiot|',
    'espn:49793341|substitution|57|second_half|France|Désiré Doué|Bradley Barcola|',
    'espn:49793380|goal|58|second_half|Spain|Pedro Porro||Dani Olmo',
    'espn:49793645|substitution|72|second_half|France|Theo Hernández|Lucas Digne|',
    'espn:49793646|substitution|72|second_half|France|Rayan Cherki|Michael Olise|',
    'espn:49793684|substitution|74|second_half|Spain|Ferran Torres|Mikel Oyarzabal|',
    'espn:49793726|substitution|78|second_half|Spain|Mikel Merino|Dani Olmo|',
    'espn:49793727|substitution|78|second_half|Spain|Pedri|Fabián Ruiz|',
    'espn:49793850|substitution|84|second_half|Spain|Marcos Llorente|Pedro Porro|',
    'espn:49793852|substitution|84|second_half|Spain|Nico Williams|Álex Baena|',
    'espn:49793901|yellow_card|86|second_half|France|Kylian Mbappé||',
  ];
  const eventIdentity = (event: ArchiveEvent) => [
    event.id,
    event.eventType,
    event.minute,
    event.period,
    event.teamKey,
    event.playerName,
    event.relatedPlayerName ?? '',
    event.assistPlayerName ?? '',
  ].join('|');
  const actualIdentities = matchEvents.map(eventIdentity).sort();
  if (matchEvents.length !== expectedIdentities.length || new Set(matchEvents.map((event) => event.id)).size !== matchEvents.length || JSON.stringify(actualIdentities) !== JSON.stringify([...expectedIdentities].sort())) {
    fail('Match 101 must contain exactly the authorized 15 unique event identities and no others.');
  }
  if (matchEvents.some((event) => event.sourceId !== 'espn' || event.confidence !== 'source_single')) {
    fail('Every Match 101 event must retain ESPN source_single provenance.');
  }

  const scoringEvents = matchEvents.filter((event) => event.eventType === 'goal' || event.eventType === 'penalty_goal');
  const spainGoals = scoringEvents.filter((event) => event.teamKey === 'Spain');
  if (scoringEvents.length !== 2 || spainGoals.length !== 2 || scoringEvents.some((event) => event.teamKey !== 'Spain')) {
    fail('Match 101 scoring events must reconcile exactly to Spain 2, France 0.');
  }
  const oyarzabal = matchEvents.find((event) => event.id === 'espn:49792518');
  if (!oyarzabal || oyarzabal.eventType !== 'penalty_goal' || oyarzabal.teamKey !== 'Spain' || oyarzabal.playerName !== 'Mikel Oyarzabal' || oyarzabal.minute !== 22) {
    fail('Match 101 must credit Oyarzabal’s 22nd-minute penalty to Spain.');
  }
  const porro = matchEvents.find((event) => event.id === 'espn:49793380');
  if (!porro || porro.eventType !== 'goal' || porro.teamKey !== 'Spain' || porro.playerName !== 'Pedro Porro' || porro.assistPlayerName !== 'Dani Olmo' || porro.minute !== 58) {
    fail('Match 101 must credit Pedro Porro’s 58th-minute Spain goal and Dani Olmo assist.');
  }
  if (matchEvents.some((event) => event.eventType.includes('shootout'))) {
    fail('Match 101 must not contain shootout events.');
  }

  const expectedStats = {
    matchId: 'match-101', possession: { home: 49.1, away: 50.9 }, shots: { home: 10, away: 10 }, shotsOnTarget: { home: 3, away: 2 },
    corners: { home: 7, away: 1 }, fouls: { home: 11, away: 12 }, yellowCards: { home: 2, away: 1 }, redCards: { home: 0, away: 0 },
    saves: { home: 0, away: 3 }, offsides: { home: 4, away: 5 }, sourceId: 'espn', confidence: 'source_single',
  };
  const statsRows = matchStatsData.filter((row) => row.matchId === 'match-101');
  if (statsRows.length !== 1 || JSON.stringify(statsRows[0]) !== JSON.stringify(expectedStats)) {
    fail('Match 101 must retain exactly one authorized provider-stat record.');
  }

  const expectedMapping = { internalMatchId: 'match-101', date: '2026-07-14', home: 'tbd', away: 'tbd', stage: 'Knockout', espnEventId: '760514', mappingConfidence: 'exact', mappingBasis: 'manual' };
  const mappings = espnMatchMap.filter((row) => row.internalMatchId === 'match-101');
  if (mappings.length !== 1 || JSON.stringify(mappings[0]) !== JSON.stringify(expectedMapping)) {
    fail('Match 101 must retain exactly one authorized ESPN mapping.');
  }
}

matchesData.forEach((m: any) => {
  if (slugs.has(m.slug)) {
    console.error('Duplicate slug: ' + m.slug);
    errors++;
  }
  slugs.add(m.slug);

  if (numbers.has(m.matchNumber)) {
    console.error('Duplicate matchNumber: ' + m.matchNumber);
    errors++;
  }
  numbers.add(m.matchNumber);

  if (!TEAMS.find((t: any) => t.key === m.homeTeamId) && !['tbd'].includes(m.homeTeamId)) {
    console.error('Invalid home team: ' + m.homeTeamId);
    errors++;
  }
  if (!TEAMS.find((t: any) => t.key === m.awayTeamId) && !['tbd'].includes(m.awayTeamId)) {
    console.error('Invalid away team: ' + m.awayTeamId);
    errors++;
  }

  if (m.scoreComplete) {
    if (m.score.home === null || m.score.away === null) {
      console.error('Score missing for completed match: ' + m.slug);
      errors++;
    }

    const src = sourcesData[m.slug];
    if (!src || !src.finalScoreSource) {
      console.error('Missing source for completed score: ' + m.slug);
      errors++;
    } else {
      if (typeof src.finalScoreSource === 'string') {
        console.error('finalScoreSource must be structured metadata, not a string: ' + m.slug);
        errors++;
      } else {
        if (!src.finalScoreSource.sourceName) {
          console.error('Missing sourceName in finalScoreSource for: ' + m.slug);
          errors++;
        }
        if (src.finalScoreSource.sourceUrl && src.finalScoreSource.sourceUrl.includes(m.slug)) {
          console.error('Fake URL detected containing slug for: ' + m.slug);
          errors++;
        }
      }
    }

    if (m.score.home > m.score.away && m.winnerTeamId !== m.homeTeamId) {
      console.error('Winner mismatch (home win): ' + m.slug);
      errors++;
    }
    if (m.score.away > m.score.home && m.winnerTeamId !== m.awayTeamId) {
      console.error('Winner mismatch (away win): ' + m.slug);
      errors++;
    }

    if (m.score.home === m.score.away && m.penaltyScore) {
      if (m.penaltyScore.home > m.penaltyScore.away && m.winnerTeamId !== m.homeTeamId) {
        console.error('Penalty winner mismatch (home win): ' + m.slug);
        errors++;
      }
      if (m.penaltyScore.away > m.penaltyScore.home && m.winnerTeamId !== m.awayTeamId) {
        console.error('Penalty winner mismatch (away win): ' + m.slug);
        errors++;
      }
    }
  }

  if (m.eventsComplete) {
    const evs = eventsData.filter((event) => event.matchId === m.slug);
    const homeGoals = evs.filter((event) => (event.teamKey === m.homeTeamId && event.eventType !== 'own_goal') || (event.teamKey === m.awayTeamId && event.eventType === 'own_goal')).length;
    const awayGoals = evs.filter((event) => (event.teamKey === m.awayTeamId && event.eventType !== 'own_goal') || (event.teamKey === m.homeTeamId && event.eventType === 'own_goal')).length;

    if (homeGoals !== m.score.home || awayGoals !== m.score.away) {
      console.error('Goals sum mismatch for: ' + m.slug);
      errors++;
    }
  }

  if (m.kickoffUtc === undefined) {
    console.error('kickoffUtc is missing (must be string or null): ' + m.slug);
    errors++;
  }
  if (m.venue === undefined) {
    console.error('venue is missing (must be string or null): ' + m.slug);
    errors++;
  }

  const values = Object.values(m);
  if (values.includes('TBD')) {
    console.error('TBD value found in: ' + m.slug);
    errors++;
  }
});

validateMatch101Package();

import { execSync } from 'child_process';
try {
  const res = execSync('findstr /s /C:"fetchWorldCup26Games" app\\*.tsx app\\*.ts', { encoding: 'utf8' });
  if (res.trim()) {
    console.error('Found runtime provider fetch in app/ path!');
    errors++;
  }
} catch (e) {}
try {
  const res2 = execSync('findstr /s /C:"fetchAllLiveData" app\\*.tsx app\\*.ts', { encoding: 'utf8' });
  if (res2.trim()) {
    console.error('Found runtime provider fetch in app/ path!');
    errors++;
  }
} catch (e) {}

if (errors > 0) {
  console.error('Validation failed with ' + errors + ' errors.');
  process.exit(1);
} else {
  console.log('Archive validation passed.');
}
