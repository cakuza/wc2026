import { Match, KnockoutMatch, ParticipantSlot } from "./matches";
import { TOURNAMENT_FINAL_DATE } from "./matches";
import { resolvedHome, resolvedAway, type ResolvedSide } from "./resolvedParticipants";

export type ResolvedParticipantLookup = Readonly<Record<number, {
  home?: ResolvedSide;
  away?: ResolvedSide;
}>>;

/**
 * Type guard to safely identify if a Match is a KnockoutMatch.
 */
export function isKnockoutMatch(match: Match): match is KnockoutMatch {
  return match.stage !== "group" && match.stage !== undefined;
}

/**
 * Gets the resolved team key for the home participant, or null if unresolved.
 */
export function getResolvedHomeTeam(match: Match, resolvedParticipants?: ResolvedParticipantLookup): string | null {
  if (!isKnockoutMatch(match)) {
    return match.homeKey;
  }
  const dynamic = resolvedParticipants?.[match.matchNumber]?.home;
  if (dynamic) {
    return dynamic.teamKey;
  }
  const resolved = resolvedHome(match.matchNumber);
  if (resolved) {
    return resolved.teamKey;
  }
  if (match.homeSlot.kind === "resolved") {
    return match.homeSlot.teamKey;
  }
  return null;
}

/**
 * Gets the resolved team key for the away participant, or null if unresolved.
 */
export function getResolvedAwayTeam(match: Match, resolvedParticipants?: ResolvedParticipantLookup): string | null {
  if (!isKnockoutMatch(match)) {
    return match.awayKey;
  }
  const dynamic = resolvedParticipants?.[match.matchNumber]?.away;
  if (dynamic) {
    return dynamic.teamKey;
  }
  const resolved = resolvedAway(match.matchNumber);
  if (resolved) {
    return resolved.teamKey;
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

/**
 * Returns the flag code (e.g. "nl", "ma", "gb-eng") for the resolved home participant,
 * or null if unresolved.
 * For group-stage matches, returns match.homeCode directly.
 */
export function getResolvedHomeCode(match: Match, resolvedParticipants?: ResolvedParticipantLookup): string | null {
  if (!isKnockoutMatch(match)) {
    return match.homeCode ?? null;
  }
  const dynamic = resolvedParticipants?.[match.matchNumber]?.home;
  if (dynamic) {
    return dynamic.teamCode ?? null;
  }
  const resolved = resolvedHome(match.matchNumber);
  if (resolved) {
    return resolved.teamCode ?? null;
  }
  return null;
}

/**
 * Returns the flag code (e.g. "nl", "ma", "gb-eng") for the resolved away participant,
 * or null if unresolved.
 * For group-stage matches, returns match.awayCode directly.
 */
export function getResolvedAwayCode(match: Match, resolvedParticipants?: ResolvedParticipantLookup): string | null {
  if (!isKnockoutMatch(match)) {
    return match.awayCode ?? null;
  }
  const dynamic = resolvedParticipants?.[match.matchNumber]?.away;
  if (dynamic) {
    return dynamic.teamCode ?? null;
  }
  const resolved = resolvedAway(match.matchNumber);
  if (resolved) {
    return resolved.teamCode ?? null;
  }
  return null;
}

export function matchStageLabel(match: Match): string {
  if (!isKnockoutMatch(match)) return match.group ? `Group ${match.group}` : "Group stage";
  switch (match.stage) {
    case "R32":
      return "Round of 32";
    case "R16":
      return "Round of 16";
    case "QF":
      return "Quarter-final";
    case "SF":
      return "Semi-final";
    case "3P":
      return "Third-place match";
    case "F":
      return "Final";
  }
}
