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

export type TeamTournamentStatus = {
  listedMatches: Match[];
  hasKnockoutJourney: boolean;
  nextMatch: Match | null;
  currentStageLabel: string | null;
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

  return {
    listedMatches,
    hasKnockoutJourney,
    nextMatch,
    currentStageLabel: currentKnockoutMatch && "matchNumber" in currentKnockoutMatch
      ? STAGE_STATUS[currentKnockoutMatch.stage] ?? null
      : null,
  };
}
