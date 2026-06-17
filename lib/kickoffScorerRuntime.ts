import "server-only";

import { MATCHES } from "./matches";
import { KickoffEventCacheManager } from "./kickoffApiCache";
import { parseKickoffApiGoalEvents } from "./kickoffApiProvider";
import { adaptKickoffEventToLedger } from "./kickoffScorerAdapter";
import { mergeProviderAttempt, type MergeProviderAttempt, type MergeCanonicalContext } from "./scorerEventLedger";
import type { SerializableSnapshotMatch } from "./liveSnapshot";
import type { GoalScorerEvent } from "./worldcup26Provider";
import { countryName } from "./i18n";

// The kill switch logic
function isKickoffScorerEnabled(): boolean {
  if (process.env.KICKOFF_SCORER_ENABLED === "false") return false;
  if (!process.env.KICKOFF_API_KEY) return false;
  return true;
}

export async function enrichSnapshotScorers(
  matches: Record<string, SerializableSnapshotMatch>,
  primaryProviderOk: boolean,
  snapshotGeneratedAt: string
): Promise<void> {
  if (!isKickoffScorerEnabled()) {
    return;
  }

  const { KickoffApiClient } = await import("./kickoffApiClient");
  const apiKey = process.env.KICKOFF_API_KEY!;
  const client = new KickoffApiClient({ apiKey });
  const manager = new KickoffEventCacheManager(client, 6);

  // Fetch fixture map
  const fixRes = await manager.getCachedFixtures(300);
  if (fixRes.category !== "success" || !fixRes.data) {
    console.warn("[kickoffScorerRuntime] Failed to fetch fixtures from cache or network. Disabling enrichment for this snapshot.");
    return;
  }

  const { parseKickoffApiFixtures, mapKickoffFixturesToCanonicalMatches } = await import("./kickoffApiProvider");
  let parsedFixtures;
  try {
    parsedFixtures = parseKickoffApiFixtures({ data: fixRes.data, response: fixRes.data });
  } catch (err) {
    console.warn("[kickoffScorerRuntime] Failed to parse provider fixtures. Disabling enrichment.");
    return;
  }

  const mapResult = mapKickoffFixturesToCanonicalMatches({ 
    providerFixtures: parsedFixtures.fixtures,
    canonicalMatches: MATCHES 
  });
  
  if (
    mapResult.errors.length > 0 ||
    mapResult.mappings.length !== 72
  ) {
    console.warn("[kickoffScorerRuntime] Fixture mapping gate failed. Disabling enrichment for this snapshot.");
    return;
  }

  // Candidate generation
  const candidates: {
    match: SerializableSnapshotMatch;
    mapping: any; // mapped type
    providerFixtureId: string;
    sortKey: number;
  }[] = [];

  for (const internalId of Object.keys(matches)) {
    const matchData = matches[internalId];
    
    if (matchData.status === "SCHEDULED") continue;
    
    // Check baseline completeness
    let isComplete = false;
    if (matchData.goalEventCompleteness.missingGoalEventCount === 0) {
      const hasLowConfidence = matchData.scorers.some(s => s.confidence === "low");
      const hasUnresolvedOwnGoals = matchData.scorers.some(s => s.isOwnGoal && !s.playerTeamName);
      if (!hasLowConfidence && !hasUnresolvedOwnGoals) {
        isComplete = true;
      }
    }

    if (isComplete && matchData.status === "FINISHED") continue;

    const mapping = mapResult.mappings.find(m => m.canonicalMatchId === internalId);
    if (!mapping) continue;

    let sortPriority = 3;
    let timeVal = 0;
    
    if (matchData.status === "LIVE" || matchData.status === "HALFTIME" || matchData.status === "SYNCING") {
      sortPriority = 1;
    } else {
      sortPriority = 2;
      timeVal = matchData.sourceUpdatedAt ? new Date(matchData.sourceUpdatedAt).getTime() : 0;
    }

    candidates.push({
      match: matchData,
      mapping,
      providerFixtureId: mapping.providerFixtureId,
      sortKey: sortPriority * 10000000000000 - timeVal
    });
  }

  candidates.sort((a, b) => a.sortKey - b.sortKey);

  for (const candidate of candidates) {
    const { match, mapping, providerFixtureId } = candidate;

    const providerFixture = parsedFixtures.fixtures.find(f => f.providerFixtureId === providerFixtureId);
    if (!providerFixture) continue;

    const cachedRes = await manager.getCachedEvents(providerFixtureId, { ttl: 60 });
    if (!cachedRes || cachedRes.category !== "success" || !cachedRes.data) {
      if (cachedRes && cachedRes.category === "rate_limited") break;
      continue;
    }

    let parsedEvents;
    try {
      parsedEvents = parseKickoffApiGoalEvents(cachedRes.data, { providerFixtureId });
    } catch (err) {
      console.warn(`[kickoffScorerRuntime] Failed to parse events for ${match.internalId}`);
      continue;
    }

    const context = {
      canonicalMatchId: match.internalId,
      canonicalHomeTeamId: match.match.homeKey,
      canonicalAwayTeamId: match.match.awayKey,
      canonicalHomeScore: match.homeScore ?? 0,
      canonicalAwayScore: match.awayScore ?? 0,
      canonicalStatus: match.status as any
    };

    const inputs = [];
    for (const ev of parsedEvents.events) {
      const adp = adaptKickoffEventToLedger({
        event: ev,
        mapping,
        context,
        providerHomeTeamId: providerFixture.homeProviderTeamId,
        providerAwayTeamId: providerFixture.awayProviderTeamId,
        fetchTimestamp: snapshotGeneratedAt
      });
      if (adp.attemptEvent) inputs.push(adp.attemptEvent);
    }

    const attempt: MergeProviderAttempt = {
      state: "complete_snapshot",
      events: inputs,
      fetchedAt: snapshotGeneratedAt,
      provenance: "kickoffapi",
      providerHomeTeamId: providerFixture.homeProviderTeamId.toString(),
      providerAwayTeamId: providerFixture.awayProviderTeamId.toString()
    };
    
    const mergeContext: MergeCanonicalContext = {
      canonicalMatchId: context.canonicalMatchId,
      canonicalHomeTeamId: context.canonicalHomeTeamId,
      canonicalAwayTeamId: context.canonicalAwayTeamId,
      canonicalHomeScore: context.canonicalHomeScore,
      canonicalAwayScore: context.canonicalAwayScore,
      canonicalStatus: context.canonicalStatus
    };

    const ledgerOutput = mergeProviderAttempt([], attempt, mergeContext);

    if (ledgerOutput.completeness.state === "conflicted") {
      continue; // Preserve baseline if KickoffAPI creates a conflict
    }

    const kickoffEvents = ledgerOutput.nextLedger.filter(o => o.lifecycleState === "active");
    const baselineAcceptedCount = match.scorers.length;
    const kickoffAcceptedCount = kickoffEvents.length;

    // Adoption rule: adopt KickoffAPI if at least as complete as baseline.
    if (kickoffAcceptedCount >= baselineAcceptedCount) {
      const homeDisplay = countryName(match.match.homeKey, "en");
      const awayDisplay = countryName(match.match.awayKey, "en");

      const mappedScorers: GoalScorerEvent[] = kickoffEvents.map(kg => ({
        type: kg.isOwnGoal ? "OWN_GOAL" : kg.isPenalty ? "PENALTY_GOAL" : "GOAL",
        minute: kg.minute,
        stoppageTime: kg.extraMinute,
        minuteLabel: kg.extraMinute ? `${kg.minute}+${kg.extraMinute}'` : `${kg.minute}'`,
        teamName: kg.creditedCanonicalSide === "home" ? homeDisplay : awayDisplay,
        playerTeamName: kg.isOwnGoal ? (kg.creditedCanonicalSide === "home" ? awayDisplay : homeDisplay) : undefined,
        playerName: kg.playerName,
        isOwnGoal: kg.isOwnGoal,
        isPenalty: kg.isPenalty,
        provider: "kickoffapi",
        confidence: "high"
      }));

      match.scorers = mappedScorers;
      
      const expectedGoals = context.canonicalHomeScore + context.canonicalAwayScore;
      match.goalEventCompleteness.missingGoalEventCount = Math.max(0, expectedGoals - kickoffAcceptedCount);
      // We store the source temporarily so liveSnapshot can record it
      (match as any)._activeScorerSource = "kickoffapi";
    }
  }
}
