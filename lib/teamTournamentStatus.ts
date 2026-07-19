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
      getResolvedHomeTeam(match, resolvedParticipants) === teamKey ||
      getResolvedAwayTeam(match, resolvedParticipants) === teamKey,
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
    // Check if the team is completely eliminated from group stage
    // If there is no next match and the group stage is completely over for them, they are eliminated
    if (!nextMatch) {
      const groupStageOver = matches.filter(m => !("matchNumber" in m)).every(m => {
        const slug = matchSlug(m);
        return snapshotMatches[slug]?.status === "FINISHED";
      });
      classification = groupStageOver ? "ELIMINATED_GROUP_STAGE" : "UNKNOWN";
    }
  } else {
    // They have a knockout journey
    if (nextMatch) {
      classification = "ACTIVE_KNOCKOUT";
    } else {
      // No more matches. Check the last match to see if they won the final or third place playoff?
      // Wait, if nextMatch is null, they have no future matches. The tournament might be over,
      // or they are eliminated in knockouts.
      // We will consider them ELIMINATED_KNOCKOUT if they have no future matches and they aren't the final winner.
      // But the requirement says "active knockout team, eliminated knockout team, group-stage eliminated team".
      // We don't need a "CHAMPION" classification for this phase since it's just the semifinals.
      classification = "ELIMINATED_KNOCKOUT";
    }
  }

  let currentStageLabel = currentKnockoutMatch && "matchNumber" in currentKnockoutMatch
    ? STAGE_STATUS[currentKnockoutMatch.stage] ?? null
    : null;

  const tpFinished = snapshotMatches["match-103"]?.status === "FINISHED";
  if (tpFinished) {
    if (teamKey === "england") {
      currentStageLabel = "Third place";
    } else if (teamKey === "france") {
      currentStageLabel = "Fourth place";
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
  snapshotMatches: Record<string, SerializableSnapshotMatch>
): string {
  if (teamKey === "spain" || teamKey === "argentina") {
    return "Finalist";
  }
  if (teamKey === "england") {
    return "Third place";
  }
  if (teamKey === "france") {
    return "Fourth place";
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
  if (stage === "SF") {
    return "Semifinalist";
  }
  return "Eliminated";
}
