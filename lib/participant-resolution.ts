import { MATCHES, Match, KnockoutMatch, ParticipantSlot } from "./matches";
import { TOURNAMENT_FINAL_DATE } from "./matches";
import { resolvedHome, resolvedAway, type ResolvedSide } from "./resolvedParticipants";
import { countryName, type Lang } from "./i18n";

export type ResolvedParticipantLookup = Readonly<Record<number, {
  home?: ResolvedSide;
  away?: ResolvedSide;
}>>;

export type ParticipantSide = "home" | "away";

export type ParticipantDisplay = {
  label: string;
  teamKey: string | null;
  teamCode: string | null;
  isResolved: boolean;
};

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
  return getResolvedSide(match, "home", resolvedParticipants)?.teamKey ?? null;
}

/**
 * Gets the resolved team key for the away participant, or null if unresolved.
 */
export function getResolvedAwayTeam(match: Match, resolvedParticipants?: ResolvedParticipantLookup): string | null {
  return getResolvedSide(match, "away", resolvedParticipants)?.teamKey ?? null;
}

/**
 * Returns a display label for a slot if the team is unresolved.
 */
export function getParticipantDisplayLabel(slot: ParticipantSlot, lang: Lang = "en", resolvedParticipants?: ResolvedParticipantLookup): string {
  switch (slot.kind) {
    case "resolved":
      return slot.teamKey; // Up to caller to translate to human name
    case "groupSlot":
      return `${slot.place === 1 ? "Winner" : "Runner-up"} Group ${slot.group}`;
    case "bestThird":
      return `3rd Group ${slot.groups.join("/")}`;
    case "winnerOf": {
      const mn = slot.matchNumber;
      if (resolvedParticipants) {
        const downstreamMatch = MATCHES.find((m) => isKnockoutMatch(m) && (
          (m.homeSlot.kind === slot.kind && (m.homeSlot as any).matchNumber === (slot as any).matchNumber) ||
          (m.awaySlot.kind === slot.kind && (m.awaySlot as any).matchNumber === (slot as any).matchNumber)
        ));
        if (downstreamMatch) {
          const side = (downstreamMatch as KnockoutMatch).homeSlot.kind === slot.kind && ((downstreamMatch as KnockoutMatch).homeSlot as any).matchNumber === (slot as any).matchNumber ? "home" : "away";
          const resolved = getResolvedSide(downstreamMatch, side, resolvedParticipants);
          if (resolved) return countryName(resolved.teamKey, lang);
        }
      }
      const sourceMatch = MATCHES.find((m) => "matchNumber" in m && m.matchNumber === mn);
      if (sourceMatch && isKnockoutMatch(sourceMatch)) {
        const hp = getResolvedSide(sourceMatch, "home", resolvedParticipants);
        const ap = getResolvedSide(sourceMatch, "away", resolvedParticipants);
        if (hp && ap) {
          return `${countryName(hp.teamKey, lang)}/${countryName(ap.teamKey, lang)} Winner`;
        }
      }
      return `Winner Match ${slot.matchNumber}`;
    }
    case "loserOf": {
      const mn = slot.matchNumber;
      if (resolvedParticipants) {
        const downstreamMatch = MATCHES.find((m) => isKnockoutMatch(m) && (m.homeSlot === slot || m.awaySlot === slot));
        if (downstreamMatch) {
          const side = (downstreamMatch as KnockoutMatch).homeSlot === slot ? "home" : "away";
          const resolved = getResolvedSide(downstreamMatch as KnockoutMatch, side, resolvedParticipants);
          if (resolved) return countryName(resolved.teamKey, lang);
        }
      }
      const sourceMatch = MATCHES.find((m) => "matchNumber" in m && m.matchNumber === mn);
      if (sourceMatch && isKnockoutMatch(sourceMatch)) {
        const hp = getResolvedSide(sourceMatch, "home", resolvedParticipants);
        const ap = getResolvedSide(sourceMatch, "away", resolvedParticipants);
        if (hp && ap) {
          return `${countryName(hp.teamKey, lang)}/${countryName(ap.teamKey, lang)} Loser`;
        }
      }
      return `Loser Match ${slot.matchNumber}`;
    }
  }
}

import { COMPLETED_KNOCKOUT_RESULTS } from "./canonicalMatchResults";

function getResolvedSide(match: Match, side: ParticipantSide, resolvedParticipants?: ResolvedParticipantLookup): ResolvedSide | null {
  if (!isKnockoutMatch(match)) {
    const teamKey = side === "home" ? match.homeKey : match.awayKey;
    const teamCode = side === "home" ? match.homeCode : match.awayCode;
    return teamKey && teamKey !== "tbd" ? { teamKey, teamCode } : null;
  }

  const dynamic = resolvedParticipants?.[match.matchNumber]?.[side];
  if (dynamic) return dynamic;

  const seeded = side === "home" ? resolvedHome(match.matchNumber) : resolvedAway(match.matchNumber);
  if (seeded) return seeded;

  const slot = side === "home" ? match.homeSlot : match.awaySlot;
  if (slot.kind === "resolved") return { teamKey: slot.teamKey, teamCode: slot.teamCode };

  if (slot.kind === "winnerOf") {
    const sourceMatch = MATCHES.find((m) => "matchNumber" in m && m.matchNumber === slot.matchNumber);
    if (sourceMatch && isKnockoutMatch(sourceMatch)) {
      const result = COMPLETED_KNOCKOUT_RESULTS[slot.matchNumber];
      if (result) {
        const winSide = result.winner === "HOME_TEAM" ? "home" : "away";
        return getResolvedSide(sourceMatch, winSide, resolvedParticipants);
      }
    }
  }

  if (slot.kind === "loserOf") {
    const sourceMatch = MATCHES.find((m) => "matchNumber" in m && m.matchNumber === slot.matchNumber);
    if (sourceMatch && isKnockoutMatch(sourceMatch)) {
      const result = COMPLETED_KNOCKOUT_RESULTS[slot.matchNumber];
      if (result) {
        const loseSide = result.winner === "HOME_TEAM" ? "away" : "home";
        return getResolvedSide(sourceMatch, loseSide, resolvedParticipants);
      }
    }
  }

  return null;
}

export function getParticipantDisplay(
  match: Match,
  side: ParticipantSide,
  resolvedParticipants?: ResolvedParticipantLookup,
  lang: Lang = "en",
): ParticipantDisplay {
  const resolved = getResolvedSide(match, side, resolvedParticipants);
  if (resolved) {
    return {
      label: countryName(resolved.teamKey, lang),
      teamKey: resolved.teamKey,
      teamCode: resolved.teamCode,
      isResolved: true,
    };
  }

  if (!isKnockoutMatch(match)) {
    const teamKey = side === "home" ? match.homeKey : match.awayKey;
    const teamCode = side === "home" ? match.homeCode : match.awayCode;
    return {
      label: teamKey || "TBD",
      teamKey: teamKey && teamKey !== "tbd" ? teamKey : null,
      teamCode: teamCode && teamCode !== "tbd" ? teamCode : null,
      isResolved: Boolean(teamKey && teamKey !== "tbd"),
    };
  }

  return {
    label: getParticipantDisplayLabel(side === "home" ? match.homeSlot : match.awaySlot, lang, resolvedParticipants),
    teamKey: null,
    teamCode: null,
    isResolved: false,
  };
}

/**
 * Human-readable label for a knockout participant slot, for use in public-facing output.
 * For winnerOf R32 sources (73–88), returns "Germany/Paraguay Winner" using resolved names.
 * For deeper rounds, returns stage-aware phrases.
 * Prefer over getParticipantDisplayLabel for any user-visible text.
 */
export function knockoutSlotLabel(slot: ParticipantSlot, lang: Lang = "en", resolvedParticipants?: ResolvedParticipantLookup): string {
  if (slot.kind === "winnerOf") {
    const mn = slot.matchNumber;
    if (resolvedParticipants) {
      const downstreamMatch = MATCHES.find((m) => isKnockoutMatch(m) && (
        (m.homeSlot.kind === slot.kind && (m.homeSlot as any).matchNumber === (slot as any).matchNumber) ||
        (m.awaySlot.kind === slot.kind && (m.awaySlot as any).matchNumber === (slot as any).matchNumber)
      ));
      if (downstreamMatch) {
        const side = (downstreamMatch as KnockoutMatch).homeSlot.kind === slot.kind && ((downstreamMatch as KnockoutMatch).homeSlot as any).matchNumber === (slot as any).matchNumber ? "home" : "away";
        const resolved = getResolvedSide(downstreamMatch, side, resolvedParticipants);
        if (resolved) return countryName(resolved.teamKey, lang);
      }
    }
    const sourceMatch = MATCHES.find((m) => "matchNumber" in m && m.matchNumber === mn);
    if (sourceMatch && isKnockoutMatch(sourceMatch)) {
      const hp = getResolvedSide(sourceMatch, "home", resolvedParticipants);
      const ap = getResolvedSide(sourceMatch, "away", resolvedParticipants);
      if (hp && ap) {
        return `${countryName(hp.teamKey, lang)}/${countryName(ap.teamKey, lang)} Winner`;
      }
    }
    if (mn >= 89 && mn <= 96) return "Round of 16 winner";
    if (mn >= 97 && mn <= 100) return "Quarter-final winner";
    return "Semi-final winner";
  }
  if (slot.kind === "loserOf") {
    if (resolvedParticipants) {
      const downstreamMatch = MATCHES.find((m) => isKnockoutMatch(m) && (m.homeSlot === slot || m.awaySlot === slot));
      if (downstreamMatch) {
        const side = (downstreamMatch as KnockoutMatch).homeSlot === slot ? "home" : "away";
        const resolved = getResolvedSide(downstreamMatch as KnockoutMatch, side, resolvedParticipants);
        if (resolved) return countryName(resolved.teamKey, lang);
      }
    }
    return "Semi-final runner-up";
  }
  return getParticipantDisplayLabel(slot, lang, resolvedParticipants);
}

/**
 * Returns the flag code (e.g. "nl", "ma", "gb-eng") for the resolved home participant,
 * or null if unresolved.
 * For group-stage matches, returns match.homeCode directly.
 */
export function getResolvedHomeCode(match: Match, resolvedParticipants?: ResolvedParticipantLookup): string | null {
  return getResolvedSide(match, "home", resolvedParticipants)?.teamCode ?? null;
}

/**
 * Returns the flag code (e.g. "nl", "ma", "gb-eng") for the resolved away participant,
 * or null if unresolved.
 * For group-stage matches, returns match.awayCode directly.
 */
export function getResolvedAwayCode(match: Match, resolvedParticipants?: ResolvedParticipantLookup): string | null {
  return getResolvedSide(match, "away", resolvedParticipants)?.teamCode ?? null;
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
