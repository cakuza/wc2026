import { matchUtcDate, type Match } from "./matches";
import { normalizeMatchState } from "./matchPresentation";
import type { LiveMatchData } from "./liveMatchData";

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
