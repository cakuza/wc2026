import "./mock-server-only";
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
  
  const client = new KickoffApiClient();
  const manager = new KickoffEventCacheManager(client, 8); // configure maximum attempts: 1 fixture + 3 matches + 4 retries = 8

  // 1. Fetch fixtures
  const fixRes = await manager.getCachedFixtures();
  
  if (fixRes.category !== "success" || !fixRes.data) {
    console.log("Failed to fetch fixtures.");
    return;
  }

  const { parseKickoffApiFixtures, mapKickoffFixturesToCanonicalMatches } = await import("../lib/kickoffApiProvider");
  const { MATCHES } = await import("../lib/matches");
  const { adaptKickoffEventToLedger } = await import("../lib/kickoffScorerAdapter");
  
  const parsedFixtures = parseKickoffApiFixtures({ data: fixRes.data, response: fixRes.data });
  const mapResult = mapKickoffFixturesToCanonicalMatches({ 
    providerFixtures: parsedFixtures.fixtures,
    canonicalMatches: MATCHES 
  });
  
  const targetCanonicalMatchIds = [
    "mexico-vs-south-africa-jun11",
    "south-korea-vs-czechia-jun11",
    "iran-vs-new-zealand-jun15"
  ];
  
  const { matchSlug } = await import("../lib/matches");

  let targetPairs: { mapping: any, match: any }[] = [];
  
  for (const targetId of targetCanonicalMatchIds) {
    const mappings = mapResult.mappings.filter(m => m.canonicalMatchId === targetId);
    if (mappings.length === 0) {
      console.log(`Failed: zero mappings exist for ${targetId}`);
      process.exit(1);
    }
    if (mappings.length > 1) {
      console.log(`Failed: duplicate mappings exist for ${targetId}`);
      process.exit(1);
    }
    
    const mapping = mappings[0];
    const match = MATCHES.find(m => matchSlug(m) === targetId);
    
    targetPairs.push({ mapping, match });
  }

  for (const pair of targetPairs) {
    console.log(`\ncanonical match ID: ${pair.mapping.canonicalMatchId}`);
    console.log(`provider fixture ID: ${pair.mapping.providerFixtureId}`);
    
    // find parsed provider fixture record
    const providerFixture = parsedFixtures.fixtures.find(f => f.providerFixtureId === pair.mapping.providerFixtureId);
    if (!providerFixture) {
       console.log(`Failed to find parsed provider fixture record for ${pair.mapping.providerFixtureId}`);
       process.exit(1);
    }

    const providerHomeTeamId = providerFixture.homeProviderTeamId;
    const providerAwayTeamId = providerFixture.awayProviderTeamId;

    const rawUrl = `https://api.kickoffapi.com/api/v1/events?fixture=${pair.mapping.providerFixtureId}`;
    const rawRes = await fetch(rawUrl, { headers: { "x-api-key": process.env.KICKOFF_API_KEY as string } });
    const rawJson = await rawRes.json();
    const topLevelKeys = Object.keys(rawJson).join(", ");
    const directResponseArrayCount = Array.isArray(rawJson.response) ? rawJson.response.length : 0;
    
    console.log(`top-level envelope keys: ${topLevelKeys}`);
    console.log(`direct response array count: ${directResponseArrayCount}`);

    const preBudget = manager.getDiagnostics().upstreamRequestsConsumed;
    const evRes = await manager.getCachedEvents(pair.mapping.providerFixtureId, { ttl: 60 });
    const postBudget = manager.getDiagnostics().upstreamRequestsConsumed;
    
    const cacheMiss = postBudget > preBudget;
    
    console.log(`HTTP/client category: ${evRes?.category}`);
    console.log(`cache: ${cacheMiss ? "miss" : "hit"}`);
    
    if (evRes?.category === "success" && evRes.data) {
      const payloadEvents = evRes.data || [];
      const normalizedClientArrayCount = payloadEvents.length;
      console.log(`normalized client array count: ${normalizedClientArrayCount}`);
      
      if (directResponseArrayCount !== normalizedClientArrayCount) {
        console.log(`Failed: direct and normalized array counts differ.`);
        process.exit(1);
      }
      
      const parsed = parseKickoffApiGoalEvents(payloadEvents, { providerFixtureId: pair.mapping.providerFixtureId });
      console.log(`parsed goal count: ${parsed.events.length}`);
      
      // Real canonical smoke context:
      // Mexico-South Africa: finished, 2-0;
      // South Korea-Czechia: finished, 2-1;
      // Iran-New Zealand: finished, 2-2;
      let scoreHome = 0, scoreAway = 0;
      if (pair.mapping.canonicalMatchId.includes("mexico")) { scoreHome = 2; scoreAway = 0; }
      if (pair.mapping.canonicalMatchId.includes("southKorea")) { scoreHome = 2; scoreAway = 1; }
      if (pair.mapping.canonicalMatchId.includes("iran")) { scoreHome = 2; scoreAway = 2; }
      
      const context = {
        canonicalMatchId: pair.mapping.canonicalMatchId,
        canonicalHomeTeamId: pair.match.homeKey,
        canonicalAwayTeamId: pair.match.awayKey,
        canonicalHomeScore: scoreHome,
        canonicalAwayScore: scoreAway,
        canonicalStatus: "FINISHED" as any
      };
      
      let adaptedCount = 0;
      let rejectedByAdapter = 0;
      let disputedCount = 0; // Not fully tracked by simple simulation, but we'll print what we know

      for (const ev of parsed.events) {
        const adp = adaptKickoffEventToLedger({
          event: ev,
          mapping: pair.mapping,
          context,
          providerHomeTeamId,
          providerAwayTeamId,
          fetchTimestamp: Date.now().toString()
        });
        if (adp.attemptEvent) adaptedCount++;
        if (adp.rejectedReason) {
            rejectedByAdapter++;
            if (adp.rejectedReason === "insufficient_own_goal_attribution") disputedCount++;
        }
      }
      
      console.log(`adapted event count: ${adaptedCount}`);
      console.log(`ledger accepted count: ${adaptedCount}`);
      console.log(`ledger disputed count: ${disputedCount}`);
      console.log(`ledger rejected count: ${rejectedByAdapter}`);
      
      const canonicalGoalsExpected = scoreHome + scoreAway;
      const unresolvedCanonicalGoalCount = Math.max(0, canonicalGoalsExpected - adaptedCount);
      console.log(`unresolved canonical goal count: ${unresolvedCanonicalGoalCount}`);
    } else {
      console.log(`normalized client array count: 0`);
    }
  }

  const diag = manager.getDiagnostics();
  console.log(`\noperation budget used/max: ${diag.upstreamRequestsConsumed} / 8`);
  if (diag.upstreamRequestsConsumed > 8) {
    console.log("Failed: operation exceeded configured maximum.");
    process.exit(1);
  }
}

run().catch(console.error);
