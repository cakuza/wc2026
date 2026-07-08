import fs from 'fs';
import { TEAMS } from '../../lib/teams';

const matchesData = JSON.parse(fs.readFileSync('data/archive/matches.json', 'utf8'));
const sourcesData = JSON.parse(fs.readFileSync('data/archive/sources.json', 'utf8'));
const eventsData = JSON.parse(fs.readFileSync('data/archive/match-events.json', 'utf8'));

let errors = 0;
const slugs = new Set();
const numbers = new Set();

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
    const evs = eventsData[m.slug]?.goals || [];
    const homeGoals = evs.filter((g: any) => (g.team === m.homeTeamId && !g.isOwnGoal) || (g.team === m.awayTeamId && g.isOwnGoal)).length;
    const awayGoals = evs.filter((g: any) => (g.team === m.awayTeamId && !g.isOwnGoal) || (g.team === m.homeTeamId && g.isOwnGoal)).length;

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
