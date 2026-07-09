import fs from 'fs';
import path from 'path';
import { MATCHES, matchSlug } from '../../lib/matches';

const EVENTS_PATH = path.join(process.cwd(), 'data/archive/match-events.candidate.json');
const STATS_PATH = path.join(process.cwd(), 'data/archive/match-stats.candidate.json');
const SOURCES_PATH = path.join(process.cwd(), 'data/archive/provenance/sources.candidate.json');

function run() {
    let passed = true;
    const log = (msg: string) => console.log(msg);
    const fail = (msg: string) => { console.error(`FAIL: ${msg}`); passed = false; };

    const validIds = new Set(MATCHES.map(m => matchSlug(m)));

    let sources: any = {};
    if (fs.existsSync(SOURCES_PATH)) {
        sources = JSON.parse(fs.readFileSync(SOURCES_PATH, 'utf8'));
    }

    if (fs.existsSync(EVENTS_PATH)) {
        const events = JSON.parse(fs.readFileSync(EVENTS_PATH, 'utf8'));
        log(`Validating ${events.length} events...`);
        
        events.forEach((e: any, i: number) => {
            if (!e.matchId) fail(`Event ${i} missing matchId`);
            if (e.matchId && !validIds.has(e.matchId)) fail(`Event ${i} has invalid matchId ${e.matchId}`);
            if (!e.sourceId) fail(`Event ${i} missing sourceId`);
            if (e.sourceId !== 'repo_verified' && e.sourceId !== 'espn') fail(`Event ${i} has unknown sourceId ${e.sourceId}`);
            if (!e.confidence) fail(`Event ${i} missing confidence`);
            
            const validTypes = ["goal", "penalty_goal", "own_goal", "yellow_card", "second_yellow", "red_card", "substitution", "penalty_shootout_scored", "penalty_shootout_missed"];
            if (!validTypes.includes(e.eventType)) fail(`Event ${i} has invalid eventType ${e.eventType}`);
        });
    }

    if (fs.existsSync(STATS_PATH)) {
        const stats = JSON.parse(fs.readFileSync(STATS_PATH, 'utf8'));
        log(`Validating ${stats.length} match stats...`);

        stats.forEach((s: any, i: number) => {
            if (!s.matchId) fail(`Stats ${i} missing matchId`);
            if (s.matchId && !validIds.has(s.matchId)) fail(`Stats ${i} has invalid matchId ${s.matchId}`);
        });
    }

    if (passed) log('All validation checks passed.');
    else process.exit(1);
}

run();
