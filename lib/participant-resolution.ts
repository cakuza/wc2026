import { Match, KnockoutMatch, ParticipantSlot } from "./matches";
import { TOURNAMENT_FINAL_DATE } from "./matches";

/**
 * Type guard to safely identify if a Match is a KnockoutMatch.
 */
export function isKnockoutMatch(match: Match): match is KnockoutMatch {
  return match.stage !== "group" && match.stage !== undefined;
}

/**
 * Gets the resolved team key for the home participant, or null if unresolved.
 */
export function getResolvedHomeTeam(match: Match): string | null {
  if (!isKnockoutMatch(match)) {
    return match.homeKey;
  }
  // If we dynamically resolved the slot, we'd do it here. 
  // For now, if the schema doesn't store dynamic results in code,
  // we return null for unplayed slots unless kind is 'resolved'.
  if (match.homeSlot.kind === "resolved") {
    return match.homeSlot.teamKey;
  }
  return null;
}

/**
 * Gets the resolved team key for the away participant, or null if unresolved.
 */
export function getResolvedAwayTeam(match: Match): string | null {
  if (!isKnockoutMatch(match)) {
    return match.awayKey;
  }
  if (match.awaySlot.kind === "resolved") {
    return match.awaySlot.teamKey;
  }
  return null;
}

/**
 * Returns a display label for a slot if the team is unresolved.
 */
export function getParticipantDisplayLabel(slot: ParticipantSlot): string {
  switch (slot.kind) {
    case "resolved":
      return slot.teamKey; // Up to caller to translate to human name
    case "groupSlot":
      return `${slot.place === 1 ? "Winner" : "Runner-up"} Group ${slot.group}`;
    case "bestThird":
      return `3rd Group ${slot.groups.join("/")}`;
    case "winnerOf":
      return `Winner Match ${slot.matchNumber}`;
    case "loserOf":
      return `Loser Match ${slot.matchNumber}`;
  }
}
