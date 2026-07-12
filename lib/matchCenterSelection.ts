import { matchUtcDate, type Match } from "./matches";
import { normalizeMatchState } from "./matchPresentation";
import type { LiveMatchData } from "./liveMatchData";

export function hasCompleteTournamentInventory(matches: Match[]): boolean {
  const seen = new Set<string>();
  for (const match of matches) {
    const internalId = 'matchNumber' in match ? `match-${match.matchNumber}` : `group-${match.group}-${match.homeKey}-${match.awayKey}`;
    seen.add(internalId);
  }
  return seen.size === 104;
}

export type TournamentPhase =
  | "pre_tournament"
  | "group_stage"
  | "round_of_32"
  | "round_of_16"
  | "quarterfinals"
  | "semifinals"
  | "third_place"
  | "final"
  | "tournament_complete";

export function getTournamentPhaseLabel(phase: TournamentPhase): string {
  switch (phase) {
    case "pre_tournament": return "Tournament begins soon";
    case "group_stage": return "Group Stage";
    case "round_of_32": return "Round of 32";
    case "round_of_16": return "Round of 16";
    case "quarterfinals": return "Quarterfinals";
    case "semifinals": return "Semifinals";
    case "third_place": return "Third-place playoff";
    case "final": return "Final";
    case "tournament_complete": return "Tournament Complete";
    default: return "";
  }
}

export function getTournamentPhase({
  matches,
  liveData,
  now,
}: {
  matches: Match[];
  liveData: Record<string, LiveMatchData>;
  now: Date;
}): TournamentPhase {
  const isInventoryComplete = hasCompleteTournamentInventory(matches);
  let hasStarted = false;
  let hasUnresolvedGroup = false;
  let hasUnresolvedR32 = false;
  let hasUnresolvedR16 = false;
  let hasUnresolvedQF = false;
  let hasUnresolvedSF = false;
  let hasUnresolvedThird = false;
  let hasUnresolvedFinal = false;

  let anyGroupStarted = false;
  let anyR32Started = false;
  let anyR16Started = false;
  let anyQFStarted = false;
  let anySFStarted = false;
  let thirdStarted = false;
  let finalStarted = false;
  let finalTrustworthy = false;

  let hasUnresolvedMatches = false;

  const seen = new Set<string>();

  for (const match of matches) {
    const internalId = 'matchNumber' in match ? `match-${match.matchNumber}` : `group-${match.group}-${match.homeKey}-${match.awayKey}`;
    if (seen.has(internalId)) continue;
    seen.add(internalId);

    const pid = match.providerIds?.footballData;
    const lData = pid ? liveData[pid] : undefined;
    const { state, hasTrustworthyScore } = normalizeMatchState({ match, liveData: lData, now });

    const isStarted = state !== "scheduled" && state !== "postponed" && state !== "cancelled";
    const isUnresolved = state !== "final" && state !== "cancelled";

    if (isUnresolved) {
      hasUnresolvedMatches = true;
    }
    
    if (isStarted) {
      hasStarted = true;
    }

    if (!('matchNumber' in match)) {
      if (isUnresolved) hasUnresolvedGroup = true;
      if (isStarted) anyGroupStarted = true;
    } else {
      const mn = match.matchNumber;
      if (mn >= 73 && mn <= 88) {
        if (isUnresolved) hasUnresolvedR32 = true;
        if (isStarted) anyR32Started = true;
      } else if (mn >= 89 && mn <= 96) {
        if (isUnresolved) hasUnresolvedR16 = true;
        if (isStarted) anyR16Started = true;
      } else if (mn >= 97 && mn <= 100) {
        if (isUnresolved) hasUnresolvedQF = true;
        if (isStarted) anyQFStarted = true;
      } else if (mn === 101 || mn === 102) {
        if (isUnresolved) hasUnresolvedSF = true;
        if (isStarted) anySFStarted = true;
      } else if (mn === 103) {
        if (isUnresolved) hasUnresolvedThird = true;
        if (isStarted) thirdStarted = true;
      } else if (mn === 104) {
        if (isUnresolved) hasUnresolvedFinal = true;
        if (isStarted) finalStarted = true;
        if (state === "final" && hasTrustworthyScore) finalTrustworthy = true;
      }
    }
  }

  if (finalTrustworthy && !hasUnresolvedMatches && isInventoryComplete) {
    return "tournament_complete";
  }

  if (!hasStarted) {
    return "pre_tournament";
  }

  if (hasUnresolvedGroup || (!anyR32Started && anyGroupStarted)) {
    return "group_stage";
  }

  if (hasUnresolvedR32 || (!anyR16Started && anyR32Started)) return "round_of_32";
  if (hasUnresolvedR16 || (!anyQFStarted && anyR16Started)) return "round_of_16";
  if (hasUnresolvedQF || (!anySFStarted && anyQFStarted)) return "quarterfinals";
  if (hasUnresolvedSF || (!thirdStarted && !finalStarted && anySFStarted)) return "semifinals";
  
  if (hasUnresolvedThird && !finalStarted) {
    return "third_place";
  }

  if (hasUnresolvedFinal || (finalTrustworthy && hasUnresolvedMatches) || !isInventoryComplete) {
    return "final";
  }

  return "tournament_complete";
}
export function selectLiveMatches({
  matches,
  liveData,
  now,
}: {
  matches: Match[];
  liveData: Record<string, LiveMatchData>;
  now: Date;
}): Match[] {
  const result: Match[] = [];
  const seen = new Set<string>();

  for (const match of matches) {
    const internalId = 'matchNumber' in match ? `match-${match.matchNumber}` : `group-${match.group}-${match.homeKey}-${match.awayKey}`;
    if (seen.has(internalId)) continue;
    seen.add(internalId);

    const pid = match.providerIds?.footballData;
    const lData = pid ? liveData[pid] : undefined;
    const { state } = normalizeMatchState({ match, liveData: lData, now });

    if (state === "live" || state === "halftime") {
      result.push(match);
    }
  }

  return result.sort((a, b) => matchUtcDate(a).getTime() - matchUtcDate(b).getTime());
}

export function selectLatestCompletedMatches({
  matches,
  liveData,
  now,
}: {
  matches: Match[];
  liveData: Record<string, LiveMatchData>;
  now: Date;
}): Match[] {
  const result: Match[] = [];
  const seen = new Set<string>();

  for (const match of matches) {
    const internalId = 'matchNumber' in match ? `match-${match.matchNumber}` : `group-${match.group}-${match.homeKey}-${match.awayKey}`;
    if (seen.has(internalId)) continue;
    seen.add(internalId);

    const pid = match.providerIds?.footballData;
    const lData = pid ? liveData[pid] : undefined;
    const { state } = normalizeMatchState({ match, liveData: lData, now });

    if (state === "final") {
      result.push(match);
    }
  }

  return result.sort((a, b) => {
    const timeDiff = matchUtcDate(b).getTime() - matchUtcDate(a).getTime();
    if (timeDiff !== 0) return timeDiff;
    const idA = 'matchNumber' in a ? a.matchNumber : a.homeKey;
    const idB = 'matchNumber' in b ? b.matchNumber : b.homeKey;
    return idA > idB ? -1 : 1;
  });
}

export function selectUpcomingMatches({
  matches,
  liveData,
  now,
}: {
  matches: Match[];
  liveData: Record<string, LiveMatchData>;
  now: Date;
}): Match[] {
  const result: Match[] = [];
  const seen = new Set<string>();

  for (const match of matches) {
    const internalId = 'matchNumber' in match ? `match-${match.matchNumber}` : `group-${match.group}-${match.homeKey}-${match.awayKey}`;
    if (seen.has(internalId)) continue;
    seen.add(internalId);

    const pid = match.providerIds?.footballData;
    const lData = pid ? liveData[pid] : undefined;
    const { state } = normalizeMatchState({ match, liveData: lData, now });

    // Exclude cancelled/postponed from normal upcoming if appropriate,
    // but the prompt says "nonfinal, strictly after now".
    // Syncing is not strictly after now. Cancelled/postponed are usually nonfinal but not upcoming.
    if (state === "scheduled") {
      if (matchUtcDate(match).getTime() > now.getTime()) {
        result.push(match);
      }
    }
  }

  return result.sort((a, b) => {
    const timeDiff = matchUtcDate(a).getTime() - matchUtcDate(b).getTime();
    if (timeDiff !== 0) return timeDiff;
    const idA = 'matchNumber' in a ? a.matchNumber : a.homeKey;
    const idB = 'matchNumber' in b ? b.matchNumber : b.homeKey;
    return idA > idB ? 1 : -1;
  });
}

export function selectSyncingMatches({
  matches,
  liveData,
  now,
}: {
  matches: Match[];
  liveData: Record<string, LiveMatchData>;
  now: Date;
}): Match[] {
  const result: Match[] = [];
  const seen = new Set<string>();

  for (const match of matches) {
    const internalId = 'matchNumber' in match ? `match-${match.matchNumber}` : `group-${match.group}-${match.homeKey}-${match.awayKey}`;
    if (seen.has(internalId)) continue;
    seen.add(internalId);

    const pid = match.providerIds?.footballData;
    const lData = pid ? liveData[pid] : undefined;
    const { state } = normalizeMatchState({ match, liveData: lData, now });

    if (state === "syncing") {
      result.push(match);
    }
  }

  return result.sort((a, b) => {
    const timeDiff = matchUtcDate(a).getTime() - matchUtcDate(b).getTime();
    if (timeDiff !== 0) return timeDiff;
    const idA = 'matchNumber' in a ? a.matchNumber : a.homeKey;
    const idB = 'matchNumber' in b ? b.matchNumber : b.homeKey;
    return idA > idB ? 1 : -1;
  });
}

export interface MatchCenterSnapshot {
  liveNow: Match[];
  syncing: Match[];
  latestResult: Match | null;
  upNext: Match[];
}

export function getMatchCenterSnapshot({
  matches,
  liveData,
  timeZone,
  now,
}: {
  matches: Match[];
  liveData: Record<string, LiveMatchData>;
  timeZone: string;
  now: Date;
}): MatchCenterSnapshot {
  const liveNow = selectLiveMatches({ matches, liveData, now });
  const syncing = selectSyncingMatches({ matches, liveData, now });
  const latestCompleted = selectLatestCompletedMatches({ matches, liveData, now });
  const upNext = selectUpcomingMatches({ matches, liveData, now });

  return {
    liveNow,
    syncing,
    latestResult: latestCompleted.length > 0 ? latestCompleted[0] : null,
    upNext: upNext.slice(0, 4), // The UI wants "next one or two", but can be up to 4 for Match Center
  };
}
