import { Match, KnockoutMatch, ParticipantSlot } from "./matches";
import { TOURNAMENT_FINAL_DATE } from "./matches";
import { resolvedHome, resolvedAway } from "./resolvedParticipants";
import { countryName } from "./i18n";

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
export function getResolvedAwayTeam(match: Match): string | null {
  if (!isKnockoutMatch(match)) {
    return match.awayKey;
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
 * Human-readable label for a knockout participant slot, for use in public-facing output.
 * For winnerOf R32 sources (73–88), returns "Germany/Paraguay Winner" using resolved names.
 * For deeper rounds, returns stage-aware phrases.
 * Prefer over getParticipantDisplayLabel for any user-visible text.
 */
export function knockoutSlotLabel(slot: ParticipantSlot): string {
  if (slot.kind === "winnerOf") {
    const mn = slot.matchNumber;
    if (mn >= 73 && mn <= 88) {
      const hp = resolvedHome(mn);
      const ap = resolvedAway(mn);
      if (hp && ap) {
        return `${countryName(hp.teamKey, "en")}/${countryName(ap.teamKey, "en")} Winner`;
      }
    }
    if (mn >= 89 && mn <= 96) return "Round of 16 winner";
    if (mn >= 97 && mn <= 100) return "Quarter-final winner";
    return "Semi-final winner";
  }
  if (slot.kind === "loserOf") return "Semi-final runner-up";
  return getParticipantDisplayLabel(slot);
}

/**
 * Returns the flag code (e.g. "nl", "ma", "gb-eng") for the resolved home participant,
 * or null if unresolved.
 * For group-stage matches, returns match.homeCode directly.
 */
export function getResolvedHomeCode(match: Match): string | null {
  if (!isKnockoutMatch(match)) {
    return match.homeCode ?? null;
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
export function getResolvedAwayCode(match: Match): string | null {
  if (!isKnockoutMatch(match)) {
    return match.awayCode ?? null;
  }
  const resolved = resolvedAway(match.matchNumber);
  if (resolved) {
    return resolved.teamCode ?? null;
  }
  return null;
}
