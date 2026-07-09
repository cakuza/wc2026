import fs from 'fs';
import path from 'path';

const EVENTS_PATH = path.join(process.cwd(), 'data/archive/match-events.candidate.json');
const STATS_PATH = path.join(process.cwd(), 'data/archive/match-stats.candidate.json');
const MAP_PATH = path.join(process.cwd(), 'data/archive/provenance/espn-match-map.candidate.json');

function run() {
    const manifest = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
    const exact = manifest.filter((m: any) => m.mappingConfidence === 'exact');
    const unresolved = manifest.filter((m: any) => m.mappingConfidence === 'unresolved');
    
    let events = [];
    if (fs.existsSync(EVENTS_PATH)) {
        events = JSON.parse(fs.readFileSync(EVENTS_PATH, 'utf8'));
    }

    let stats = [];
    if (fs.existsSync(STATS_PATH)) {
        stats = JSON.parse(fs.readFileSync(STATS_PATH, 'utf8'));
    }

    const matchSet = new Set(events.map((e: any) => e.matchId));
    
    let goals = 0, penalty = 0, own = 0, assists = 0, cards = 0, subs = 0, shootouts = 0;
    events.forEach((e: any) => {
        if (e.eventType === 'goal') goals++;
        if (e.eventType === 'penalty_goal') { goals++; penalty++; }
        if (e.eventType === 'own_goal') { goals++; own++; }
        if (e.eventType === 'yellow_card' || e.eventType === 'red_card' || e.eventType === 'second_yellow') cards++;
        if (e.eventType === 'substitution') subs++;
        if (e.eventType === 'penalty_shootout_scored' || e.eventType === 'penalty_shootout_missed') shootouts++;
        if (e.assistPlayerName) assists++;
    });

    console.log(`
## Coverage
- total internal matches: ${manifest.length}
- mapped ESPN matches: ${exact.length}
- unmapped matches: ${unresolved.length}
- fetched raw summaries: ${exact.length}
- matches with events: ${matchSet.size}
- total events: ${events.length}
- goals: ${goals}
- penalty goals: ${penalty}
- own goals: ${own}
- assists: ${assists}
- yellow/red cards: ${cards}
- substitutions: ${subs}
- lineups if captured: Yes
- team stats: Yes (for ${stats.length} matches)
- player stats: No
- penalty shootouts: ${shootouts}
    `);
}

run();
