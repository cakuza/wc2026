import fs from 'fs';
import path from 'path';
import https from 'https';
import { MATCHES, matchSlug } from '../../lib/matches';
import { getResolvedHomeTeam, getResolvedAwayTeam } from '../../lib/participant-resolution';

const OUTPUT_PATH = path.join(process.cwd(), 'data/archive/provenance/espn-match-map.candidate.json');

function normalize(str: string) {
    if (!str) return '';
    let n = str.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/[^a-z0-9]/g, ''); // strip punctuation and spaces

    const aliases: Record<string, string> = {
        'unitedstates': 'usa',
        'us': 'usa',
        'usmnt': 'usa',
        'turkiye': 'turkey',
        'czechia': 'czechrepublic',
        'saudiarabia': 'saudi',
        'southkorea': 'korearepublic',
        'bosnia': 'bosniaherzegovina',
        'bosniaandherzegovina': 'bosniaherzegovina',
        'cotedivoire': 'ivorycoast',
        'drcongo': 'congodr'
    };
    return aliases[n] || n;
}

async function fetchScoreboard() {
    return new Promise<any>((resolve, reject) => {
        const url = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719';
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } catch(e) { reject(e); }
            });
        }).on('error', reject);
    });
}

async function run() {
    const scoreboard = await fetchScoreboard();
    const espnEvents = scoreboard.events || [];
    
    const manifest = [];
    let exact = 0, likely = 0, unresolved = 0;
    let unresolvedReasons: Record<string, number> = {};
    let unresolvedSamples: string[] = [];

    for (const m of MATCHES) {
        let internalHome = normalize(m.homeKey);
        let internalAway = normalize(m.awayKey);
        if ('matchNumber' in m) {
            const rh = getResolvedHomeTeam(m);
            const ra = getResolvedAwayTeam(m);
            if (rh) internalHome = normalize(rh);
            if (ra) internalAway = normalize(ra);
        }
        const internalId = matchSlug(m);
        
        const mDateObj = new Date(m.date);
        
        let bestMatch = null;
        let bestConfidence = 'unresolved';
        let reason = 'teams not found in ESPN';

        for (const e of espnEvents) {
            const h = normalize(e.competitions[0]?.competitors?.find((c: any) => c.homeAway === 'home')?.team?.name || '');
            const a = normalize(e.competitions[0]?.competitors?.find((c: any) => c.homeAway === 'away')?.team?.name || '');
            
            // Check team matches (allow either direction since neutral venues might flip them)
            const teamsMatchDirect = (h === internalHome && a === internalAway);
            const teamsMatchFlipped = (h === internalAway && a === internalHome);
            const teamsMatch = teamsMatchDirect || teamsMatchFlipped;

            if (teamsMatch) {
                const eDateObj = new Date(e.date);
                const diffHours = Math.abs(eDateObj.getTime() - mDateObj.getTime()) / 3600000;
                
                if (diffHours <= 28) { // allow ±1 day due to timezone differences
                    bestMatch = e;
                    if (diffHours <= 12 || e.date.startsWith(m.date.substring(0, 10))) {
                        bestConfidence = 'exact';
                    } else {
                        bestConfidence = 'likely';
                    }
                    break;
                } else {
                    reason = `teams match but date too far (${Math.round(diffHours/24)} days off)`;
                }
            }
        }

        if (bestMatch) {
            manifest.push({
                internalMatchId: internalId,
                date: m.date,
                home: m.homeKey,
                away: m.awayKey,
                stage: m.group ? 'Group' : 'Knockout',
                espnEventId: bestMatch.id,
                mappingConfidence: bestConfidence,
                mappingBasis: bestConfidence === 'exact' ? 'date/team exact' : 'team exact, date offset'
            });
            if (bestConfidence === 'exact') exact++;
            else likely++;
        } else {
            manifest.push({
                internalMatchId: internalId,
                date: m.date,
                home: m.homeKey,
                away: m.awayKey,
                stage: m.group ? 'Group' : 'Knockout',
                espnEventId: null,
                mappingConfidence: 'unresolved',
                mappingBasis: 'unresolved'
            });
            unresolved++;
            unresolvedReasons[reason] = (unresolvedReasons[reason] || 0) + 1;
            if (unresolvedSamples.length < 5) unresolvedSamples.push(`${internalId} (${reason})`);
        }
    }

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(manifest, null, 2));

    console.log(`Manifest created: ${exact} exact, ${likely} likely, ${unresolved} unresolved. Total: ${manifest.length}`);
    if (unresolved > 0) {
        console.log('Unresolved reasons:', unresolvedReasons);
        console.log('Unresolved samples:', unresolvedSamples);
    }
}

run();
