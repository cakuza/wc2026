import { MATCHES, type KnockoutMatch, type Match, type ParticipantSlot } from "./matches";
import { isKnockoutMatch, type ResolvedParticipantLookup } from "./participant-resolution";
import { RESOLVED_PARTICIPANTS, type ResolvedSide } from "./resolvedParticipants";
import type { SerializableSnapshotMatch } from "./liveSnapshot";

type WinnerRecord = {
  winner?: ResolvedSide;
  loser?: ResolvedSide;
};

function sideFromSlot(slot: ParticipantSlot, winners: ReadonlyMap<number, WinnerRecord>): ResolvedSide | null {
  if (slot.kind === "resolved") return { teamKey: slot.teamKey, teamCode: slot.teamCode };
  if (slot.kind === "winnerOf") return winners.get(slot.matchNumber)?.winner ?? null;
  if (slot.kind === "loserOf") return winners.get(slot.matchNumber)?.loser ?? null;
  return null;
}

function sideForMatch(match: KnockoutMatch, side: "home" | "away", winners: ReadonlyMap<number, WinnerRecord>): ResolvedSide | null {
  const seeded = RESOLVED_PARTICIPANTS[match.matchNumber]?.[side];
  if (seeded) return seeded;
  return sideFromSlot(side === "home" ? match.homeSlot : match.awaySlot, winners);
}

function winnerSide(snapshotMatch: SerializableSnapshotMatch | undefined): "home" | "away" | null {
  if (!snapshotMatch || snapshotMatch.status !== "FINISHED") return null;
  const providerWinner = snapshotMatch.live?.winner;
  if (providerWinner === "HOME_TEAM") return "home";
  if (providerWinner === "AWAY_TEAM") return "away";

  const shootout = snapshotMatch.live?.penaltyShootoutScore;
  if (shootout?.home !== null && shootout?.home !== undefined && shootout?.away !== null && shootout?.away !== undefined) {
    if (shootout.home > shootout.away) return "home";
    if (shootout.away > shootout.home) return "away";
  }

  if (snapshotMatch.homeScore !== null && snapshotMatch.awayScore !== null) {
    if (snapshotMatch.homeScore > snapshotMatch.awayScore) return "home";
    if (snapshotMatch.awayScore > snapshotMatch.homeScore) return "away";
  }

  return null;
}

export function buildKnockoutResolution(matches: Record<string, SerializableSnapshotMatch>): ResolvedParticipantLookup {
  const result: Record<number, { home?: ResolvedSide; away?: ResolvedSide }> = {};
  const winners = new Map<number, WinnerRecord>();

  for (const [matchNumber, participants] of Object.entries(RESOLVED_PARTICIPANTS)) {
    result[Number(matchNumber)] = {
      home: participants.home,
      away: participants.away,
    };
  }

  const knockoutMatches = MATCHES
    .filter((match): match is KnockoutMatch => isKnockoutMatch(match))
    .sort((a, b) => a.matchNumber - b.matchNumber);

  for (const match of knockoutMatches) {
    const home = sideForMatch(match, "home", winners);
    const away = sideForMatch(match, "away", winners);
    if (home || away) {
      result[match.matchNumber] = { ...result[match.matchNumber], ...(home ? { home } : {}), ...(away ? { away } : {}) };
    }

    const snapshotMatch = Object.values(matches).find((entry) => {
      const entryMatch = entry.match as Match;
      return isKnockoutMatch(entryMatch) && entryMatch.matchNumber === match.matchNumber;
    });
    const winningSide = winnerSide(snapshotMatch);
    if (!winningSide || !home || !away) continue;
    winners.set(match.matchNumber, {
      winner: winningSide === "home" ? home : away,
      loser: winningSide === "home" ? away : home,
    });
  }

  return result;
}
