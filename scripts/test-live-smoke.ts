import { KickoffApiClient } from "../lib/kickoffApiClient";
import { KickoffEventCacheManager } from "../lib/kickoffApiCache";
import { parseKickoffApiGoalEvents } from "../lib/kickoffApiProvider";
import fs from "fs";
import { MemoryCacheAdapter, setCacheAdapter } from "../lib/cacheAdapter";

async function run() {
  if (fs.existsSync(".env")) {
    const env = fs.readFileSync(".env", "utf8");
    env.split("\n").forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) process.env[match[1].trim()] = match[2].trim();
    });
  }
  
  setCacheAdapter(new MemoryCacheAdapter());
  
  console.log("=== Live Smoke Test ===");
  
  const client = new KickoffApiClient(); // uses process.env.KICKOFF_API_KEY
  const manager = new KickoffEventCacheManager(client, 4);

  // 1. Fetch fixtures
  console.log("Fetching fixtures...");
  const fixRes = await manager.getCachedFixtures();
  console.log(`Fixtures Category: ${fixRes.category}`);

  if (fixRes.category !== "success" || !fixRes.data) {
    console.log("Failed to fetch fixtures.");
    return;
  }

  // 2. We need specific matches:
  // Mexico-South Africa, South Korea-Czechia, and one partial-coverage completed match.
  // We can just find them in the fixtures if available, or just fetch directly by fixture ID if we can guess.
  // Actually KickoffAPI uses fixture IDs. Let's just grab 3 fixture IDs from the fetched fixtures.
  const fixtures = fixRes.data.data || fixRes.data; // Depending on actual payload
  const fixtureArray = Array.isArray(fixtures) ? fixtures : (fixtures.response ? fixtures.response : []);
  
  // We need to map them to find mex_rsa and kor_cze
  const { parseKickoffApiFixtures, mapKickoffFixturesToCanonicalMatches } = await import("../lib/kickoffApiProvider");
  const { MATCHES } = await import("../lib/matches");
  
  const parsedFixtures = parseKickoffApiFixtures({ data: fixtureArray, response: fixtureArray });
  const mapResult = mapKickoffFixturesToCanonicalMatches({ 
    providerFixtures: parsedFixtures.fixtures,
    canonicalMatches: MATCHES 
  });
  
  let targets: string[] = [];
  for (const f of parsedFixtures.fixtures) {
    const name = `${f.homeTeamName} ${f.awayTeamName}`.toLowerCase();
    if (name.includes("mexico") && name.includes("south africa")) targets.push(f.providerFixtureId);
    if (name.includes("south korea") && name.includes("czechia")) targets.push(f.providerFixtureId);
    if (name.includes("austria") && name.includes("jordan")) targets.push(f.providerFixtureId);
  }
  
  if (targets.length === 0) {
    console.log("Could not find specific mapped fixtures, falling back to first 3.");
    targets = fixtureArray.slice(0, 3).map((f: any) => f.id?.toString() || f.fixture_id?.toString());
  }
  
  if (targets.length === 0) {
    console.log("Could not find specific fixtures, falling back to first 3.");
    targets = fixtureArray.slice(0, 3).map((f: any) => f.fixture?.id?.toString() || f.providerFixtureId || f.id);
  }
  
  // Deduplicate and slice 3 just in case
  targets = [...new Set(targets)].filter(Boolean).slice(0, 3);

  let totalRawEvents = 0;
  let totalParsed = 0;

  for (const fId of targets) {
    console.log(`Fetching events for ${fId}...`);
    const evRes = await manager.getCachedEvents(fId, { ttl: 60 });
    console.log(`Events Category [${fId}]: ${evRes?.category}`);
    if (evRes?.category === "success" && evRes.data) {
      const payloadEvents = Array.isArray(evRes.data.data) ? evRes.data.data : Array.isArray(evRes.data) ? evRes.data : [];
      totalRawEvents += payloadEvents.length;
      
      const parsed = parseKickoffApiGoalEvents(payloadEvents, { providerFixtureId: fId });
      totalParsed += parsed.events.length;
      
      console.log(`  Raw events: ${payloadEvents.length}`);
      console.log(`  Parsed goals: ${parsed.events.length}`);
      if (parsed.errors.length > 0) {
        console.log(`  Rejected/disputed count: ${parsed.errors.length}`);
        console.log(`  Sanitized codes: ${[...new Set(parsed.errors.map(e => e.code))].join(", ")}`);
      }
    }
  }

  console.log("\n=== Smoke Summary ===");
  console.log(`Raw event count: ${totalRawEvents}`);
  console.log(`Parsed goal count: ${totalParsed}`);
  console.log(`Cache Status / Request-budget consumption: ${manager.getDiagnostics().upstreamRequestsConsumed} / 4`);
}

run().catch(console.error);
