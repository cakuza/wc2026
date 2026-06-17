export type ProviderAttemptState = "partial_snapshot" | "complete_snapshot" | "delta" | "timeout" | "error" | "unavailable";

export type EventLifecycleState = "active" | "retracted" | "superseded" | "disputed";

export type CanonicalReconciliationState = "consistent" | "partial" | "conflicted" | "temporarily_unavailable" | "never_received";

export type LedgerObservation = {
  stableEventId: string;
  canonicalMatchId: string;
  provider: string;
  providerFixtureId: string;
  providerEventId: string;

  playerName: string;
  providerPlayerId?: string;
  minute: number;
  extraMinute?: number;
  assistPlayerId?: string;
  assistName?: string;
  isPenalty: boolean;
  isOwnGoal: boolean;
  creditedCanonicalSide: "home" | "away";
  playerCanonicalTeamId: string;

  lifecycleState: EventLifecycleState;
  provenance: string;
  fetchedAt: string;
  stateReason?: string;
  canonicalGoalId?: string;
};

export type ExplicitRetraction = {
  provider: string;
  providerFixtureId: string;
  providerEventId: string;
  reason: string;
};

export type ExplicitEquivalence = {
  canonicalGoalId: string;
  stableEventIds: string[];
};

export type ProviderScorerEventInput = {
  provider: string;
  providerFixtureId: string;
  providerEventId: string;
  providerPlayerId?: string;
  providerTeamId: string;
  playerName: string;
  assistPlayerId?: string;
  assistName?: string;
  minute: number;
  extraMinute?: number;
  isPenalty: boolean;
  isOwnGoal: boolean;
};

export type MergeProviderAttempt = {
  state: ProviderAttemptState;
  events: ProviderScorerEventInput[];
  retractions?: ExplicitRetraction[];
  equivalences?: ExplicitEquivalence[];
  fetchedAt: string;
  provenance: string;
  providerHomeTeamId: string;
  providerAwayTeamId: string;
};

export type MergeCanonicalContext = {
  canonicalMatchId: string;
  canonicalHomeTeamId: string;
  canonicalAwayTeamId: string;
  canonicalHomeScore: number | null;
  canonicalAwayScore: number | null;
  canonicalStatus: "SCHEDULED" | "TIMED" | "IN_PLAY" | "PAUSED" | "FINISHED";
};

export type MatchCompleteness = {
  expectedHomeGoals: number;
  expectedAwayGoals: number;
  acceptedHomeGoals: number;
  acceptedAwayGoals: number;
  unresolvedHomeGoals: number;
  unresolvedAwayGoals: number;
  unresolvedGoalCount: number;
  disputedObservationCount: number;
  state: CanonicalReconciliationState;
};

export type MergeResult = {
  nextLedger: LedgerObservation[];
  diagnostics: {
    addedCount: number;
    rejectedCount: number;
    reasons: string[];
    cross_provider_equivalence_required?: boolean;
  };
  completeness: MatchCompleteness;
};

export function normalizePlayerName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function createStableId(provider: string, fixtureId: string, eventId: string): string {
  return JSON.stringify([provider, fixtureId, eventId]);
}

export function mergeProviderAttempt(
  previousLedger: LedgerObservation[],
  attempt: MergeProviderAttempt,
  context: MergeCanonicalContext
): MergeResult {
  const nextLedger = [...previousLedger];
  let addedCount = 0;
  let rejectedCount = 0;
  const reasons: string[] = [];
  let cross_provider_equivalence_required = false;

  const isMatchStarted = ["IN_PLAY", "PAUSED", "FINISHED"].includes(context.canonicalStatus);

  // 1. Process explicit retractions
  if (attempt.retractions) {
    for (const ret of attempt.retractions) {
      const stableId = createStableId(ret.provider, ret.providerFixtureId, ret.providerEventId);
      for (let i = 0; i < nextLedger.length; i++) {
        if (nextLedger[i].stableEventId === stableId && nextLedger[i].lifecycleState === "active") {
          nextLedger[i] = {
            ...nextLedger[i],
            lifecycleState: "retracted",
            stateReason: ret.reason
          };
        }
      }
    }
  }

  // 2. Process explicit equivalences
  if (attempt.equivalences) {
    for (const eq of attempt.equivalences) {
      for (let i = 0; i < nextLedger.length; i++) {
        if (eq.stableEventIds.includes(nextLedger[i].stableEventId)) {
          nextLedger[i] = {
            ...nextLedger[i],
            canonicalGoalId: eq.canonicalGoalId,
            lifecycleState: "active",
            stateReason: "explicit equivalence resolved"
          };
        }
      }
    }
  }

  if (!isMatchStarted) {
    if (attempt.events.length > 0) {
      rejectedCount += attempt.events.length;
      reasons.push("Scheduled match rejects scorer events by default.");
    }
  } else if (attempt.state === "complete_snapshot" || attempt.state === "partial_snapshot" || attempt.state === "delta") {
    
    // We only process missing events for complete snapshots
    const incomingStableIds = new Set(attempt.events.map(e => createStableId(e.provider, e.providerFixtureId, e.providerEventId)));
    
    if (attempt.state === "complete_snapshot") {
      // Retract active events from this provider not in the payload
      for (let i = 0; i < nextLedger.length; i++) {
        const obs = nextLedger[i];
        if (obs.canonicalMatchId === context.canonicalMatchId && 
            obs.provider === attempt.events[0]?.provider && 
            obs.lifecycleState === "active" && 
            !incomingStableIds.has(obs.stableEventId)) {
          nextLedger[i] = {
            ...obs,
            lifecycleState: "retracted",
            stateReason: "omitted from complete snapshot"
          };
        }
      }
    }

    for (const input of attempt.events) {
      const stableEventId = createStableId(input.provider, input.providerFixtureId, input.providerEventId);
      
      let playerCanonicalTeamId: string | null = null;
      if (input.providerTeamId === attempt.providerHomeTeamId) {
        playerCanonicalTeamId = context.canonicalHomeTeamId;
      } else if (input.providerTeamId === attempt.providerAwayTeamId) {
        playerCanonicalTeamId = context.canonicalAwayTeamId;
      }

      if (!playerCanonicalTeamId) {
        rejectedCount++;
        reasons.push(`Unknown or ambiguous team ID: ${input.providerTeamId}`);
        continue;
      }

      let creditedCanonicalSide: "home" | "away" = playerCanonicalTeamId === context.canonicalHomeTeamId ? "home" : "away";
      if (input.isOwnGoal) {
        creditedCanonicalSide = creditedCanonicalSide === "home" ? "away" : "home";
      }

      const existingActive = nextLedger.find(e => e.stableEventId === stableEventId && e.lifecycleState === "active");

      let newObs: LedgerObservation = {
        stableEventId,
        canonicalMatchId: context.canonicalMatchId,
        provider: input.provider,
        providerFixtureId: input.providerFixtureId,
        providerEventId: input.providerEventId,
        playerName: input.playerName,
        providerPlayerId: input.providerPlayerId,
        minute: input.minute,
        extraMinute: input.extraMinute,
        assistPlayerId: input.assistPlayerId,
        assistName: input.assistName,
        isPenalty: input.isPenalty,
        isOwnGoal: input.isOwnGoal,
        creditedCanonicalSide,
        playerCanonicalTeamId,
        lifecycleState: "active",
        provenance: attempt.provenance,
        fetchedAt: attempt.fetchedAt
      };

      if (existingActive) {
        // Check for exact replay
        const isExact = 
          existingActive.playerName === newObs.playerName &&
          existingActive.minute === newObs.minute &&
          existingActive.extraMinute === newObs.extraMinute &&
          existingActive.isPenalty === newObs.isPenalty &&
          existingActive.isOwnGoal === newObs.isOwnGoal &&
          existingActive.providerPlayerId === newObs.providerPlayerId;

        if (isExact) {
          continue; // Idempotent
        }

        // Revision
        if (attempt.state === "partial_snapshot") {
          // Non-authoritative partial payload may enrich but not destructively overwrite richer data
          if (!newObs.providerPlayerId && existingActive.providerPlayerId) newObs.providerPlayerId = existingActive.providerPlayerId;
          if (newObs.extraMinute === undefined && existingActive.extraMinute !== undefined) newObs.extraMinute = existingActive.extraMinute;
        }
        
        // Supersede old
        existingActive.lifecycleState = "superseded";
        existingActive.stateReason = "superseded by revision";
        nextLedger.push(newObs);
        addedCount++;
      } else {
        // New observation
        nextLedger.push(newObs);
        addedCount++;
      }
    }
  }

  // Cross-provider resolution
  const activeObs = nextLedger.filter(e => e.canonicalMatchId === context.canonicalMatchId && e.lifecycleState === "active");
  for (let i = 0; i < activeObs.length; i++) {
    for (let j = i + 1; j < activeObs.length; j++) {
      const a = activeObs[i];
      const b = activeObs[j];
      if (a.provider !== b.provider && !a.canonicalGoalId && !b.canonicalGoalId) {
        if (a.creditedCanonicalSide === b.creditedCanonicalSide &&
            a.isOwnGoal === b.isOwnGoal &&
            Math.abs(a.minute - b.minute) <= 2 &&
            normalizePlayerName(a.playerName) === normalizePlayerName(b.playerName)) {
          
          // Heuristic match -> second one becomes disputed
          const bIdx = nextLedger.findIndex(e => e === b);
          if (bIdx > -1) {
            nextLedger[bIdx] = { ...b, lifecycleState: "disputed", stateReason: "heuristic cross-provider duplicate" };
            cross_provider_equivalence_required = true;
          }
        }
      }
    }
  }

  // Completeness & VAR Safety
  const expectedHome = context.canonicalHomeScore ?? 0;
  const expectedAway = context.canonicalAwayScore ?? 0;

  // Re-calculate active after disputes
  const finalActive = nextLedger.filter(e => e.canonicalMatchId === context.canonicalMatchId && e.lifecycleState === "active");
  
  // Dedup canonical goals (if explicit equivalence links them)
  const acceptedGoalIds = new Set<string>();
  let acceptedHomeGoals = 0;
  let acceptedAwayGoals = 0;

  for (const obs of finalActive) {
    const id = obs.canonicalGoalId || obs.stableEventId;
    if (!acceptedGoalIds.has(id)) {
      acceptedGoalIds.add(id);
      if (obs.creditedCanonicalSide === "home") acceptedHomeGoals++;
      else acceptedAwayGoals++;
    }
  }

  const unresHome = Math.max(0, expectedHome - acceptedHomeGoals);
  const unresAway = Math.max(0, expectedAway - acceptedAwayGoals);
  const unresTotal = unresHome + unresAway;
  const disputedCount = nextLedger.filter(e => e.canonicalMatchId === context.canonicalMatchId && e.lifecycleState === "disputed").length;

  let state: CanonicalReconciliationState = "never_received";

  if (!isMatchStarted) {
    state = "never_received";
  } else if (acceptedHomeGoals > expectedHome || acceptedAwayGoals > expectedAway) {
    // VAR Regression or over-reporting without retraction -> conflicted
    state = "conflicted";
  } else if (context.canonicalStatus === "FINISHED") {
    if (unresTotal === 0) {
      state = "consistent"; // The prompt used consistent/partial/conflicted
    } else {
      if (attempt.state === "complete_snapshot" || attempt.state === "partial_snapshot") {
        state = "partial";
      } else {
        state = (acceptedHomeGoals > 0 || acceptedAwayGoals > 0) ? "partial" : "temporarily_unavailable";
      }
    }
  } else {
    // In play / Paused
    if (attempt.state === "complete_snapshot" || attempt.state === "partial_snapshot") {
      state = unresTotal === 0 ? "consistent" : "partial";
    } else {
      state = (acceptedHomeGoals > 0 || acceptedAwayGoals > 0) ? "partial" : "temporarily_unavailable";
    }
  }

  // Sort nextLedger for determinism
  nextLedger.sort((a, b) => {
    if (a.minute !== b.minute) return a.minute - b.minute;
    const aExtra = a.extraMinute ?? 0;
    const bExtra = b.extraMinute ?? 0;
    if (aExtra !== bExtra) return aExtra - bExtra;
    return a.stableEventId.localeCompare(b.stableEventId, "en");
  });

  return {
    nextLedger,
    diagnostics: {
      addedCount,
      rejectedCount,
      reasons,
      cross_provider_equivalence_required
    },
    completeness: {
      expectedHomeGoals: expectedHome,
      expectedAwayGoals: expectedAway,
      acceptedHomeGoals,
      acceptedAwayGoals,
      unresolvedHomeGoals: unresHome,
      unresolvedAwayGoals: unresAway,
      unresolvedGoalCount: unresTotal,
      disputedObservationCount: disputedCount,
      state
    }
  };
}

export type PlayerIdentity = {
  id: string; 
  canonicalTeamId: string;
  displayName: string;
  providerPlayerIds: Set<string>;
};

export type PlayerScorerTotal = {
  identity: PlayerIdentity;
  goals: number;
  penalties: number;
};

export type GoldenBootAggregation = {
  completedMatchesWithUnresolvedGoals: Set<string>;
  totalUnresolvedGoals: number;
  scorerTotalsComplete: boolean;
  totals: PlayerScorerTotal[];
};

export function aggregateGoldenBoot(
  ledger: LedgerObservation[],
  completenessByMatch: Map<string, MatchCompleteness>
): GoldenBootAggregation {
  const playerMap = new Map<string, PlayerScorerTotal>();
  const completedMatchesWithUnresolvedGoals = new Set<string>();
  let totalUnresolvedGoals = 0;
  let scorerTotalsComplete = true;

  // Track conflicted matches so we skip their goals
  const conflictedMatchIds = new Set<string>();

  for (const [matchId, comp] of completenessByMatch.entries()) {
    if (comp.state === "conflicted") {
      conflictedMatchIds.add(matchId);
      scorerTotalsComplete = false;
    } else if (comp.unresolvedGoalCount > 0 && comp.state !== "consistent") {
      // partial or missing
      completedMatchesWithUnresolvedGoals.add(matchId);
      totalUnresolvedGoals += comp.unresolvedGoalCount;
      scorerTotalsComplete = false;
    }
  }

  const seenCanonicalGoals = new Set<string>();

  for (const ev of ledger) {
    if (ev.lifecycleState !== "active") continue;
    if (conflictedMatchIds.has(ev.canonicalMatchId)) continue;
    if (ev.isOwnGoal) continue;

    const canonicalGoalId = ev.canonicalGoalId || ev.stableEventId;
    if (seenCanonicalGoals.has(canonicalGoalId)) continue;
    seenCanonicalGoals.add(canonicalGoalId);

    let identityStr: string;
    if (ev.providerPlayerId) {
      identityStr = `id:${ev.provider}:${ev.playerCanonicalTeamId}:${ev.providerPlayerId}`;
    } else {
      const normName = normalizePlayerName(ev.playerName);
      identityStr = `name:${ev.playerCanonicalTeamId}:${normName}`;
    }

    let record = playerMap.get(identityStr);
    if (!record) {
      record = {
        identity: {
          id: identityStr,
          canonicalTeamId: ev.playerCanonicalTeamId,
          displayName: ev.playerName,
          providerPlayerIds: new Set<string>(),
        },
        goals: 0,
        penalties: 0,
      };
      playerMap.set(identityStr, record);
    }

    if (ev.providerPlayerId) {
      record.identity.providerPlayerIds.add(ev.providerPlayerId);
    }

    record.goals++;
    if (ev.isPenalty) record.penalties++;
  }

  const totals = Array.from(playerMap.values()).sort((a, b) => {
    if (b.goals !== a.goals) return b.goals - a.goals;
    if (a.penalties !== b.penalties) return a.penalties - b.penalties;
    return a.identity.displayName.localeCompare(b.identity.displayName, "en");
  });

  return {
    completedMatchesWithUnresolvedGoals,
    totalUnresolvedGoals,
    scorerTotalsComplete,
    totals,
  };
}
