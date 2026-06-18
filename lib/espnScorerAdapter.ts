import "server-only";
import type { EspnGoalEvent, EspnFixtureMapping } from "./espnProvider";
import type { ProviderScorerEventInput, MergeCanonicalContext } from "./scorerEventLedger";

export type EspnAdapterInput = {
  event: EspnGoalEvent;
  mapping: EspnFixtureMapping;
  context: MergeCanonicalContext;
  providerHomeTeamId: string;
  providerAwayTeamId: string;
};

export type EspnAdapterResult = {
  attemptEvent?: ProviderScorerEventInput;
  rejectedReason?: string;
};

/**
 * Adapt one ESPN goal event into a provider-neutral ledger input.
 *
 * Normal goals: ESPN's play `team` is the scorer's team, so the credited scoreboard
 * side follows directly from team identity.
 *
 * Own goals: ESPN reports the *beneficiary* (credited) team in the play `team`
 * field and the player who put through their own net in `participants[0]`. We pass
 * that explicit credited side straight through — we never infer the scorer's own
 * club from it, and own goals are excluded from Golden Boot aggregation downstream.
 */
export function adaptEspnEventToLedger(input: EspnAdapterInput): EspnAdapterResult {
  const { event, context, mapping, providerHomeTeamId, providerAwayTeamId } = input;

  if (context.canonicalMatchId !== mapping.canonicalMatchId) {
    return { rejectedReason: "canonical match ID mismatch" };
  }

  let providerTeamSide: "home" | "away";
  if (event.providerTeamId === providerHomeTeamId) {
    providerTeamSide = "home";
  } else if (event.providerTeamId === providerAwayTeamId) {
    providerTeamSide = "away";
  } else {
    return { rejectedReason: `unknown provider team ID: ${event.providerTeamId}` };
  }

  // For both normal and own goals, ESPN's `team` corresponds to the credited
  // scoreboard side: the scorer's team for a normal goal, the beneficiary for an
  // own goal. Either way it is an explicit, provider-supplied attribution.
  const creditedCanonicalSide: "home" | "away" = providerTeamSide;

  const attemptEvent: ProviderScorerEventInput = {
    provider: event.provider,
    providerFixtureId: event.providerFixtureId,
    providerEventId: event.providerEventId,
    providerPlayerId: event.providerPlayerId,
    providerTeamId: event.providerTeamId,
    playerName: event.playerName,
    minute: event.minute,
    extraMinute: event.extraMinute,
    isPenalty: event.isPenalty,
    isOwnGoal: event.isOwnGoal,
    creditedCanonicalSide,
    authority: "enrichment",
  };

  return { attemptEvent };
}
