import { ARCHIVE_DEFAULT_DATE, matchSlug, matchUtcDate, type Match } from "./matches";
import type { SerializableSnapshotMatch } from "./liveSnapshot";
import {
  getResolvedAwayTeam,
  getResolvedHomeTeam,
  type ResolvedParticipantLookup,
} from "./participant-resolution";

const STAGE_STATUS: Record<string, string> = {
  R32: "Round of 32 participant",
  R16: "Round of 16 participant",
  QF: "Quarter-finalist",
  SF: "Semifinalist",
  "3P": "Third-place playoff participant",
  F: "Finalist",
};

export function getWinnerSide({
  homeScore,
  awayScore,
  liveWinner,
  penaltyShootoutScore,
}: {
  homeScore: number | null;
  awayScore: number | null;
  liveWinner?: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
  penaltyShootoutScore?: { home: number | null; away: number | null } | null;
}): "home" | "away" | null {
  let side: "home" | "away" | null = null;
  if (liveWinner === "HOME_TEAM") side = "home";
  else if (liveWinner === "AWAY_TEAM") side = "away";
  else {
    const shootout = penaltyShootoutScore;
    if (shootout?.home !== null && shootout?.home !== undefined && shootout?.away !== null && shootout?.away !== undefined) {
      if (shootout.home > shootout.away) side = "home";
      else if (shootout.away > shootout.home) side = "away";
    }
  }

  if (!side && homeScore !== null && awayScore !== null) {
    if (homeScore > awayScore) side = "home";
    else if (awayScore > homeScore) side = "away";
  }
  return side;
}

export function getKnockoutWinnerAndLoser(
  m: SerializableSnapshotMatch,
  resolvedParticipants?: ResolvedParticipantLookup
) {
  const home = m.match.homeKey !== "tbd" ? m.match.homeKey : (getResolvedHomeTeam(m.match, resolvedParticipants) ?? "tbd");
  const away = m.match.awayKey !== "tbd" ? m.match.awayKey : (getResolvedAwayTeam(m.match, resolvedParticipants) ?? "tbd");
  if (home === "tbd" || away === "tbd") return null;

  const objWinner = (m as any).winner;
  let side: "home" | "away" | null = null;
  if (objWinner === "home") side = "home";
  else if (objWinner === "away") side = "away";
  else {
    side = getWinnerSide({
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      liveWinner: m.live?.winner,
      penaltyShootoutScore: m.live?.penaltyShootoutScore,
    });
  }

  if (side === "home") return { winner: home, loser: away };
  if (side === "away") return { winner: away, loser: home };
  return null;
}

export type TeamClassification =
  | "ACTIVE_KNOCKOUT"
  | "ELIMINATED_KNOCKOUT"
  | "ELIMINATED_GROUP_STAGE"
  | "UNKNOWN";

export type TeamTournamentStatus = {
  listedMatches: Match[];
  hasKnockoutJourney: boolean;
  nextMatch: Match | null;
  currentStageLabel: string | null;
  classification: TeamClassification;
};

/** Canonical team journey derived from resolved knockout participants and snapshot status. */
export function getTeamTournamentStatus({
  teamKey,
  matches,
  snapshotMatches,
  resolvedParticipants,
  now = new Date(ARCHIVE_DEFAULT_DATE),
}: {
  teamKey: string;
  matches: readonly Match[];
  snapshotMatches: Record<string, SerializableSnapshotMatch>;
  resolvedParticipants?: ResolvedParticipantLookup;
  now?: Date;
}): TeamTournamentStatus {
  const listedMatches = matches
    .filter((match) =>
      match.homeKey === teamKey ||
      match.awayKey === teamKey ||
      (match.homeKey !== "tbd" ? match.homeKey : getResolvedHomeTeam(match, resolvedParticipants)) === teamKey ||
      (match.awayKey !== "tbd" ? match.awayKey : getResolvedAwayTeam(match, resolvedParticipants)) === teamKey,
    )
    .sort((a, b) => matchUtcDate(a).getTime() - matchUtcDate(b).getTime());

  const hasKnockoutJourney = listedMatches.some((match) => "matchNumber" in match);
  const unfinished = listedMatches.filter((match) => snapshotMatches[matchSlug(match)]?.status !== "FINISHED");
  const nextMatch =
    unfinished.find((match) => matchUtcDate(match).getTime() >= now.getTime()) ??
    unfinished[0] ??
    null;

  const currentKnockoutMatch = nextMatch && "matchNumber" in nextMatch
    ? nextMatch
    : [...listedMatches].reverse().find((match) => "matchNumber" in match);

  let classification: TeamClassification = "UNKNOWN";

  if (!hasKnockoutJourney) {
    if (!nextMatch) {
      const groupStageOver = matches.filter(m => !("matchNumber" in m)).every(m => {
        const slug = matchSlug(m);
        return snapshotMatches[slug]?.status === "FINISHED";
      });
      classification = groupStageOver ? "ELIMINATED_GROUP_STAGE" : "UNKNOWN";
    }
  } else {
    if (nextMatch) {
      classification = "ACTIVE_KNOCKOUT";
    } else {
      classification = "ELIMINATED_KNOCKOUT";
    }
  }

  let currentStageLabel = currentKnockoutMatch && "matchNumber" in currentKnockoutMatch
    ? STAGE_STATUS[currentKnockoutMatch.stage] ?? null
    : null;

  const match104 = snapshotMatches["match-104"];
  const match103 = snapshotMatches["match-103"];

  if (match104) {
    const finalHome = match104.match.homeKey !== "tbd" ? match104.match.homeKey : (getResolvedHomeTeam(match104.match, resolvedParticipants) ?? "tbd");
    const finalAway = match104.match.awayKey !== "tbd" ? match104.match.awayKey : (getResolvedAwayTeam(match104.match, resolvedParticipants) ?? "tbd");
    if (finalHome !== "tbd" && finalAway !== "tbd") {
      if (match104.status === "FINISHED") {
        const res = getKnockoutWinnerAndLoser(match104, resolvedParticipants);
        if (res) {
          if (teamKey === res.winner) currentStageLabel = "Champion";
          if (teamKey === res.loser) currentStageLabel = "Runner-up";
        }
      } else {
        if (teamKey === finalHome || teamKey === finalAway) {
          currentStageLabel = "Finalist";
        }
      }
    }
  }

  if (match103) {
    if (match103.status === "FINISHED") {
      const res = getKnockoutWinnerAndLoser(match103, resolvedParticipants);
      if (res) {
        if (teamKey === res.winner) currentStageLabel = "Third place";
        if (teamKey === res.loser) currentStageLabel = "Fourth place";
      }
    }
  }

  return {
    listedMatches,
    hasKnockoutJourney,
    nextMatch,
    currentStageLabel,
    classification,
  };
}

export function getTeamStatusLabel(
  teamKey: string,
  status: TeamTournamentStatus,
  snapshotMatches: Record<string, SerializableSnapshotMatch>,
  resolvedParticipants?: ResolvedParticipantLookup
): string {
  const match104 = snapshotMatches["match-104"];
  const match103 = snapshotMatches["match-103"];

  if (match104) {
    const home = match104.match.homeKey !== "tbd" ? match104.match.homeKey : (getResolvedHomeTeam(match104.match, resolvedParticipants) ?? "tbd");
    const away = match104.match.awayKey !== "tbd" ? match104.match.awayKey : (getResolvedAwayTeam(match104.match, resolvedParticipants) ?? "tbd");
    if (home !== "tbd" && away !== "tbd") {
      if (match104.status === "FINISHED") {
        const res = getKnockoutWinnerAndLoser(match104, resolvedParticipants);
        if (res) {
          if (teamKey === res.winner) return "Champion";
          if (teamKey === res.loser) return "Runner-up";
        }
      } else {
        if (teamKey === home || teamKey === away) {
          return "Finalist";
        }
      }
    }
  }

  if (match103) {
    if (match103.status === "FINISHED") {
      const res = getKnockoutWinnerAndLoser(match103, resolvedParticipants);
      if (res) {
        if (teamKey === res.winner) return "Third place";
        if (teamKey === res.loser) return "Fourth place";
      }
    }
  }

  if (status.classification === "ELIMINATED_GROUP_STAGE") {
    return "Eliminated in group stage";
  }

  const knockoutMatches = status.listedMatches.filter(m => "matchNumber" in m);
  if (knockoutMatches.length === 0) {
    return "Eliminated in group stage";
  }

  const lastMatch = knockoutMatches[knockoutMatches.length - 1];
  const stage = lastMatch.stage;
  if (stage === "R32") return "Eliminated in Round of 32";
  if (stage === "R16") return "Eliminated in Round of 16";
  if (stage === "QF") return "Eliminated in Quarter-finals";
  if (stage === "SF" || stage === "3P") {
    return "Semifinalist";
  }
  return "Eliminated";
}
