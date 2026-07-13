import fs from 'fs';
import path from 'path';

const RAW_DIR = path.join(process.cwd(), 'data/archive/raw/espn/2026');
const MAP_PATH = path.join(process.cwd(), 'data/archive/provenance/espn-match-map.json');
const OUTPUT_STATS = path.join(process.cwd(), 'data/archive/match-stats.json');

function parseStat(teamStats: any[], statName: string) {
    const stat = teamStats.find(s => s.name === statName);
    if (!stat) return undefined;
    return parseFloat(stat.displayValue);
}

function run() {
    const manifest = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
    const requestedMatchIds = new Set(process.argv.slice(2));
    const mapped = manifest.filter((m: any) =>
        m.espnEventId &&
        m.mappingConfidence !== 'unresolved' &&
        (requestedMatchIds.size === 0 || requestedMatchIds.has(m.internalMatchId))
    );
    
    const isIncremental = requestedMatchIds.size > 0;
    let allStats: any[] = isIncremental && fs.existsSync(OUTPUT_STATS)
        ? JSON.parse(fs.readFileSync(OUTPUT_STATS, 'utf8')).filter((stat: any) => !requestedMatchIds.has(stat.matchId))
        : [];

    for (const m of mapped) {
        const rawPath = path.join(RAW_DIR, `${m.espnEventId}.json`);
        if (!fs.existsSync(rawPath)) continue;

        const payload = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
        if (!payload.boxscore || !payload.boxscore.teams) continue;

        const espnTeams = payload.boxscore.teams;
        // ESPN boxscore.teams doesn't strictly label home/away in array order sometimes,
        // but typically 0 is away, 1 is home. Better to crosscheck with header.
        const homeTeamId = payload.header.competitions[0].competitors.find((c:any) => c.homeAway === 'home').team.id;
        
        let homeStatsSource = espnTeams.find((t:any) => t.team.id === homeTeamId)?.statistics || [];
        let awayStatsSource = espnTeams.find((t:any) => t.team.id !== homeTeamId)?.statistics || [];

        allStats.push({
            matchId: m.internalMatchId,
            possession: { home: parseStat(homeStatsSource, 'possessionPct'), away: parseStat(awayStatsSource, 'possessionPct') },
            shots: { home: parseStat(homeStatsSource, 'totalShots'), away: parseStat(awayStatsSource, 'totalShots') },
            shotsOnTarget: { home: parseStat(homeStatsSource, 'shotsOnTarget'), away: parseStat(awayStatsSource, 'shotsOnTarget') },
            corners: { home: parseStat(homeStatsSource, 'wonCorners'), away: parseStat(awayStatsSource, 'wonCorners') },
            fouls: { home: parseStat(homeStatsSource, 'foulsCommitted'), away: parseStat(awayStatsSource, 'foulsCommitted') },
            yellowCards: { home: parseStat(homeStatsSource, 'yellowCards'), away: parseStat(awayStatsSource, 'yellowCards') },
            redCards: { home: parseStat(homeStatsSource, 'redCards'), away: parseStat(awayStatsSource, 'redCards') },
            saves: { home: parseStat(homeStatsSource, 'saves'), away: parseStat(awayStatsSource, 'saves') },
            offsides: { home: parseStat(homeStatsSource, 'offsides'), away: parseStat(awayStatsSource, 'offsides') },
            sourceId: 'espn',
            confidence: 'source_single'
        });
    }

    fs.mkdirSync(path.dirname(OUTPUT_STATS), { recursive: true });
    fs.writeFileSync(OUTPUT_STATS, JSON.stringify(allStats, null, 2));

    console.log(`Stats candidate created with ${allStats.length} matches.`);
}

run();
