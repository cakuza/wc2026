import { KickoffApiGoalEvent, KickoffFixtureMapping } from "./kickoffApiProvider";
import { ProviderScorerEventInput, MergeCanonicalContext } from "./scorerEventLedger";

export type AdapterInput = {
  event: KickoffApiGoalEvent;
  mapping: KickoffFixtureMapping;
  context: MergeCanonicalContext;
  providerHomeTeamId: string;
  providerAwayTeamId: string;
  fetchTimestamp: string;
};

export type AdapterResult = {
  attemptEvent?: ProviderScorerEventInput;
  rejectedReason?: string;
};

export function adaptKickoffEventToLedger(input: AdapterInput): AdapterResult {
  const { event, context, providerHomeTeamId, providerAwayTeamId } = input;

  // 1. canonical match identity from mapping
  if (context.canonicalMatchId !== input.mapping.canonicalMatchId) {
    return { rejectedReason: "canonical match ID mismatch" };
  }

  // 2. team ID mapping
  let playerCanonicalTeamId: string;
  if (event.providerTeamId === providerHomeTeamId) {
    playerCanonicalTeamId = context.canonicalHomeTeamId;
  } else if (event.providerTeamId === providerAwayTeamId) {
    playerCanonicalTeamId = context.canonicalAwayTeamId;
  } else {
    return { rejectedReason: `unknown provider team ID: ${event.providerTeamId}` };
  }

  // 3. own goal explicit attribution
  let creditedCanonicalSide: "home" | "away" | undefined;
  if (event.isOwnGoal) {
    // If the KickoffAPI own-goal contract cannot independently provide both player team and credited scoreboard side:
    // "preserve the observation as disputed/rejected for review; do not invent the missing relationship."
    // KickoffApiGoalEvent doesn't explicitly expose a separate "creditedSide" from the provider.
    // So we must leave it undefined. The ledger will safely reject it as "own_goal_credited_side_required"
    creditedCanonicalSide = undefined;
  } else {
    creditedCanonicalSide = (playerCanonicalTeamId === context.canonicalHomeTeamId) ? "home" : "away";
  }

  const attemptEvent: ProviderScorerEventInput = {
    provider: event.provider,
    providerFixtureId: event.providerFixtureId,
    providerEventId: event.providerEventId,
    providerPlayerId: event.providerPlayerId,
    providerTeamId: event.providerTeamId,
    playerName: event.playerName,
    assistPlayerId: event.assistPlayerId,
    assistName: event.assistName,
    minute: event.minute,
    extraMinute: event.extraMinute,
    isPenalty: event.isPenalty,
    isOwnGoal: event.isOwnGoal,
    creditedCanonicalSide,
    // ordinary provider payloads use non-authoritative replay/enrichment semantics
    authority: "enrichment"
  };

  return { attemptEvent };
}

export type PlannerCandidateSummary = {
  canonicalMatchId: string;
  canonicalStatus: "SCHEDULED" | "TIMED" | "IN_PLAY" | "PAUSED" | "FINISHED";
  canonicalKickoff: string;
  canonicalHomeScore: number | null;
  canonicalAwayScore: number | null;
  ledgerCompleteness: "consistent" | "partial" | "conflicted" | "temporarily_unavailable" | "never_received";
  providerFixtureId?: string;
  lastSuccessfulFetchAt?: number;
};

export type PlannerCandidate = PlannerCandidateSummary & { providerFixtureId: string };

export type BatchPlannerOptions = {
  maxCandidates: number;
};

export function planEnrichmentCandidates(
  summaries: PlannerCandidateSummary[],
  options: BatchPlannerOptions
): PlannerCandidate[] {
  // Rules:
  // no scheduled candidates
  // no unmapped candidates
  // skip scheduled 0-0 matches (covered by no scheduled)
  // skip finished matches already ledger-complete
  
  const eligible: PlannerCandidate[] = [];

  for (const s of summaries) {
    if (!s.providerFixtureId) continue;
    if (s.canonicalStatus === "SCHEDULED" || s.canonicalStatus === "TIMED") continue;
    if (s.canonicalStatus === "FINISHED" && s.ledgerCompleteness === "consistent") continue;

    eligible.push(s as PlannerCandidate);
  }

  // Priorities:
  // 1. live matches (IN_PLAY, PAUSED)
  // 2. newly finished unresolved matches
  // 3. older finished unresolved matches
  // Tie break by canonicalMatchId

  eligible.sort((a, b) => {
    const aLive = (a.canonicalStatus === "IN_PLAY" || a.canonicalStatus === "PAUSED") ? 1 : 0;
    const bLive = (b.canonicalStatus === "IN_PLAY" || b.canonicalStatus === "PAUSED") ? 1 : 0;

    if (aLive !== bLive) {
      return bLive - aLive; // 1 before 0
    }

    // Both are same live status. So both are FINISHED.
    // "newest finished before oldest finished"
    // Use canonicalKickoff as proxy for newest finished
    const aTime = new Date(a.canonicalKickoff).getTime();
    const bTime = new Date(b.canonicalKickoff).getTime();
    if (aTime !== bTime) {
      return bTime - aTime; // descending
    }

    return a.canonicalMatchId.localeCompare(b.canonicalMatchId);
  });

  return eligible.slice(0, options.maxCandidates);
}
