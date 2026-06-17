export type ProviderAttemptState = "success" | "empty" | "timeout" | "error" | "unavailable";

export type LedgerEvent = {
  stableEventId: string;
  canonicalMatchId: string;
  canonicalTeamId: string;
  canonicalSide: "home" | "away";
  provider: string;
  providerFixtureId: string;
  providerEventId: string;
  providerPlayerId?: string;
  playerName: string;
  assistPlayerId?: string;
  assistName?: string;
  minute: number;
  extraMinute?: number;
  isPenalty: boolean;
  isOwnGoal: boolean;
  provenance: string;
  fetchedAt: string;
};

export type MatchCompletenessState = "complete" | "partial" | "temporarily_unavailable" | "never_received";

export type MatchCompleteness = {
  expectedHomeGoals: number;
  expectedAwayGoals: number;
  acceptedHomeGoals: number;
  acceptedAwayGoals: number;
  unresolvedHomeGoals: number;
  unresolvedAwayGoals: number;
  unresolvedGoalCount: number;
  state: MatchCompletenessState;
};

export type MergeCanonicalContext = {
  canonicalMatchId: string;
  canonicalHomeTeamId: string;
  canonicalAwayTeamId: string;
  canonicalHomeScore: number | null;
  canonicalAwayScore: number | null;
  canonicalStatus: "SCHEDULED" | "TIMED" | "IN_PLAY" | "PAUSED" | "FINISHED";
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
  fetchedAt: string;
  provenance: string;
  // This helps us map provider team IDs to canonical team IDs (home or away)
  // because the provider team IDs might not literally equal the canonical team IDs
  // The context needs to tell us which provider team ID is home and away,
  // or we pass a mapping in the attempt. Let's pass the mapping:
  providerHomeTeamId: string;
  providerAwayTeamId: string;
};

export type MergeResult = {
  nextLedger: LedgerEvent[];
  diagnostics: {
    addedCount: number;
    rejectedCount: number;
    reasons: string[];
  };
  completeness: MatchCompleteness;
};

export function mergeProviderAttempt(
  previousLedger: LedgerEvent[],
  attempt: MergeProviderAttempt,
  context: MergeCanonicalContext
): MergeResult {
  const nextLedger = [...previousLedger];
  let addedCount = 0;
  let rejectedCount = 0;
  const reasons: string[] = [];

  const expectedHome = context.canonicalHomeScore ?? 0;
  const expectedAway = context.canonicalAwayScore ?? 0;

  const getAcceptedCounts = () => {
    let home = 0;
    let away = 0;
    for (const ev of nextLedger) {
      if (ev.canonicalMatchId === context.canonicalMatchId) {
        if (ev.canonicalSide === "home") home++;
        else if (ev.canonicalSide === "away") away++;
      }
    }
    return { home, away };
  };

  const isMatchStarted = ["IN_PLAY", "PAUSED", "FINISHED"].includes(context.canonicalStatus);

  if (!isMatchStarted) {
    if (attempt.events.length > 0) {
      rejectedCount += attempt.events.length;
      reasons.push("Scheduled match rejects scorer events by default.");
    }
  } else if (attempt.state === "success" || attempt.state === "empty") {
    for (const input of attempt.events) {
      const stableEventId = `${input.provider}|${input.providerFixtureId}|${input.providerEventId}`;
      if (nextLedger.some((e) => e.stableEventId === stableEventId)) {
        // exact replay counts once, preserved silently
        continue;
      }

      let canonicalSide: "home" | "away" | null = null;
      let canonicalTeamId: string | null = null;

      if (input.providerTeamId === attempt.providerHomeTeamId) {
        canonicalSide = "home";
        canonicalTeamId = context.canonicalHomeTeamId;
      } else if (input.providerTeamId === attempt.providerAwayTeamId) {
        canonicalSide = "away";
        canonicalTeamId = context.canonicalAwayTeamId;
      }

      if (!canonicalSide || !canonicalTeamId) {
        rejectedCount++;
        reasons.push(`Unknown or ambiguous team ID: ${input.providerTeamId}`);
        continue;
      }

      const counts = getAcceptedCounts();
      if (canonicalSide === "home" && counts.home >= expectedHome) {
        rejectedCount++;
        reasons.push("Home capacity exceeded.");
        continue;
      }
      if (canonicalSide === "away" && counts.away >= expectedAway) {
        rejectedCount++;
        reasons.push("Away capacity exceeded.");
        continue;
      }

      const ledgerEvent: LedgerEvent = {
        stableEventId,
        canonicalMatchId: context.canonicalMatchId,
        canonicalTeamId,
        canonicalSide,
        provider: input.provider,
        providerFixtureId: input.providerFixtureId,
        providerEventId: input.providerEventId,
        providerPlayerId: input.providerPlayerId,
        playerName: input.playerName,
        assistPlayerId: input.assistPlayerId,
        assistName: input.assistName,
        minute: input.minute,
        extraMinute: input.extraMinute,
        isPenalty: input.isPenalty,
        isOwnGoal: input.isOwnGoal,
        provenance: attempt.provenance,
        fetchedAt: attempt.fetchedAt,
      };

      nextLedger.push(ledgerEvent);
      addedCount++;
    }
  } else {
    // error, timeout, unavailable -> preserve existing events silently
  }

  // Calculate completeness
  // Ensure we output deterministic order
  nextLedger.sort((a, b) => {
    if (a.minute !== b.minute) return a.minute - b.minute;
    const aExtra = a.extraMinute ?? 0;
    const bExtra = b.extraMinute ?? 0;
    if (aExtra !== bExtra) return aExtra - bExtra;
    return a.stableEventId.localeCompare(b.stableEventId, "en");
  });

  const finalCounts = getAcceptedCounts();
  const unresHome = Math.max(0, expectedHome - finalCounts.home);
  const unresAway = Math.max(0, expectedAway - finalCounts.away);
  const unresTotal = unresHome + unresAway;

  let state: MatchCompletenessState = "never_received";
  
  if (!isMatchStarted) {
    state = "never_received";
  } else if (context.canonicalStatus === "FINISHED") {
    if (unresTotal === 0) {
      state = "complete";
    } else {
      // If we previously had some data but it's incomplete
      if (attempt.state === "success") {
        state = "partial";
      } else if (attempt.state === "empty") {
        state = "partial";
      } else {
        // If we are missing data and we just had an error,
        // we might be temporarily unavailable or we never received it.
        // We can check if we have ANY accepted goals. If we expect goals but have 0, and state is error, 
        // it's temporarily unavailable or never received.
        // To satisfy "failure after complete data does not regress completeness", if unresTotal is 0 it is complete.
        // If unresTotal > 0, it's partial or temporarily_unavailable.
        // We'll say if we have some goals, it's partial. If 0, temporarily_unavailable if error.
        state = (finalCounts.home > 0 || finalCounts.away > 0) ? "partial" : "temporarily_unavailable";
      }
    }
  } else {
    // In play / Paused
    if (attempt.state === "success" || attempt.state === "empty") {
      state = unresTotal === 0 ? "complete" : "partial";
    } else {
      state = (finalCounts.home > 0 || finalCounts.away > 0) ? "partial" : "temporarily_unavailable";
    }
  }

  // Important rule: "failure after complete data does not regress completeness"
  // Wait, the input `previousLedger` didn't have completeness. If it was already complete, how do we know?
  // Because if it was complete, unresTotal would be 0, and unresTotal === 0 => "complete". So we don't regress.

  return {
    nextLedger,
    diagnostics: {
      addedCount,
      rejectedCount,
      reasons,
    },
    completeness: {
      expectedHomeGoals: expectedHome,
      expectedAwayGoals: expectedAway,
      acceptedHomeGoals: finalCounts.home,
      acceptedAwayGoals: finalCounts.away,
      unresolvedHomeGoals: unresHome,
      unresolvedAwayGoals: unresAway,
      unresolvedGoalCount: unresTotal,
      state,
    },
  };
}

function normalizePlayerName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, ""); // collapse punctuation and whitespace
}

export type PlayerIdentity = {
  id: string; // The stable identity string
  canonicalTeamId: string;
  displayName: string; // The first seen display name
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
  ledger: LedgerEvent[],
  completenessByMatch: Map<string, MatchCompleteness>
): GoldenBootAggregation {
  const playerMap = new Map<string, PlayerScorerTotal>();
  const completedMatchesWithUnresolvedGoals = new Set<string>();
  let totalUnresolvedGoals = 0;
  let allCompletedReconciled = true;

  for (const [matchId, completeness] of completenessByMatch.entries()) {
    // This expects that the user passed only FINISHED matches in completeness map if we want to know if it's completed?
    // Actually, we must rely on the caller to provide only FINISHED match completeness? 
    // Or we assume `unresolvedGoalCount > 0` and `state !== 'complete'` indicates a problem.
    // Wait, let's just use unresolvedGoalCount and state.
    if (completeness.unresolvedGoalCount > 0) {
      // If it's a finished match... The function doesn't know if the match is FINISHED unless we tell it.
      // Wait, "scorerTotalsComplete: true when every completed match reconciles."
      // Let's assume completenessByMatch only contains finished matches for this aggregation, OR we look at state.
      // Wait! The Golden Boot usually only considers FINISHED matches for "scorerTotalsComplete", but live goals count.
      // If `state === "partial" || state === "temporarily_unavailable" || state === "never_received"`, it could be live or finished.
      // I'll just check if it's not complete and unresolvedGoalCount > 0.
      if (completeness.unresolvedGoalCount > 0) {
         // Is it finished? The prompt says "completedMatchesWithUnresolvedGoals".
         // I'll assume the caller filters the map to only FINISHED matches, OR I can determine from state? 
         // Actually, if it's unresolved, it's unresolved. Let's just track it.
         completedMatchesWithUnresolvedGoals.add(matchId);
         totalUnresolvedGoals += completeness.unresolvedGoalCount;
         allCompletedReconciled = false;
      }
    }
  }

  const seen = new Set<string>();
  for (const ev of ledger) {
    if (seen.has(ev.stableEventId)) continue;
    seen.add(ev.stableEventId);
    if (ev.isOwnGoal) continue;

    let identityStr: string;
    if (ev.providerPlayerId) {
      identityStr = `id:${ev.canonicalTeamId}:${ev.providerPlayerId}`;
    } else {
      const normName = normalizePlayerName(ev.playerName);
      identityStr = `name:${ev.canonicalTeamId}:${normName}`;
    }

    let record = playerMap.get(identityStr);
    if (!record) {
      record = {
        identity: {
          id: identityStr,
          canonicalTeamId: ev.canonicalTeamId,
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

  // Sort totals deterministicly: goals desc, penalties asc, displayName asc
  const totals = Array.from(playerMap.values()).sort((a, b) => {
    if (b.goals !== a.goals) return b.goals - a.goals;
    if (a.penalties !== b.penalties) return a.penalties - b.penalties;
    return a.identity.displayName.localeCompare(b.identity.displayName, "en");
  });

  return {
    completedMatchesWithUnresolvedGoals,
    totalUnresolvedGoals,
    scorerTotalsComplete: allCompletedReconciled,
    totals,
  };
}
