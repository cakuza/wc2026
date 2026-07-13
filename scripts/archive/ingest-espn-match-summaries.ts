import fs from 'fs';
import path from 'path';
import https from 'https';
import crypto from 'crypto';

const MAP_PATH = path.join(process.cwd(), 'data/archive/provenance/espn-match-map.json');
const RAW_DIR = path.join(process.cwd(), 'data/archive/raw/espn/2026');
const CHECKSUMS_PATH = path.join(process.cwd(), 'data/archive/provenance/checksums.json');
const SOURCES_PATH = path.join(process.cwd(), 'data/archive/provenance/sources.json');

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchSummary(eventId: string) {
    return new Promise<any>((resolve, reject) => {
        const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${eventId}`;
        https.get(url, { headers: { 'User-Agent': 'WorldCupMatchDayArchive/1.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } catch(e) { reject(e); }
            });
        }).on('error', reject);
    });
}

async function run() {
    const manifest = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
    const requestedEventIds = new Set(process.argv.slice(2));
    const mapped = manifest.filter((m: any) =>
        m.espnEventId &&
        m.mappingConfidence !== 'unresolved' &&
        (requestedEventIds.size === 0 || requestedEventIds.has(String(m.espnEventId)))
    );

    fs.mkdirSync(RAW_DIR, { recursive: true });
    
    let checksums: any = {};
    if (fs.existsSync(CHECKSUMS_PATH)) {
        checksums = JSON.parse(fs.readFileSync(CHECKSUMS_PATH, 'utf8'));
    }

    let sources: any = {};
    if (fs.existsSync(SOURCES_PATH)) {
        sources = JSON.parse(fs.readFileSync(SOURCES_PATH, 'utf8'));
    }

    let requests = 0;
    let failures = 0;

    for (const m of mapped) {
        try {
            const rawPath = path.join(RAW_DIR, `${m.espnEventId}.json`);
            if (fs.existsSync(rawPath)) {
                // skip fetch if already exists, just update checksums if missing
                if (!checksums[`data/archive/raw/espn/2026/${m.espnEventId}.json`]) {
                    const content = fs.readFileSync(rawPath, 'utf8');
                    const hash = crypto.createHash('sha256').update(content).digest('hex');
                    checksums[`data/archive/raw/espn/2026/${m.espnEventId}.json`] = hash;
                }
                continue;
            }
            console.log(`Fetching ${m.espnEventId} for ${m.internalMatchId}`);
            const payload = await fetchSummary(m.espnEventId);
            requests++;

            const content = JSON.stringify(payload, null, 2);
            fs.writeFileSync(rawPath, content);

            const hash = crypto.createHash('sha256').update(content).digest('hex');
            
            const relPath = `data/archive/raw/espn/2026/${m.espnEventId}.json`;
            checksums[relPath] = hash;

            sources[m.espnEventId] = {
                sourceId: 'espn',
                name: 'ESPN Public API',
                endpointPattern: 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event={eventId}',
                accessMethod: 'public_json',
                fetchedAt: new Date().toISOString(),
                rawPath: relPath,
                rawSha256: hash,
                parserVersion: '1.0',
                notes: `Mapped via exact date/team match for ${m.internalMatchId}`
            };

            await delay(1000); // 1000ms minimum delay
        } catch (e: any) {
            console.error(`Failed ${m.espnEventId}: ${e.message}`);
            failures++;
        }
    }

    fs.writeFileSync(CHECKSUMS_PATH, JSON.stringify(checksums, null, 2));
    fs.writeFileSync(SOURCES_PATH, JSON.stringify(sources, null, 2));

    console.log(`Ingestion complete: ${requests} requests, ${failures} failures.`);
}

run();
