import { matchBySlug, MATCHES, matchSlug, matchUtcDate, type KnockoutMatch } from "./matches";
import type { TournamentLiveSnapshot, SnapshotMatchStatus } from "./liveSnapshot";
import { isKnockoutMatch, getResolvedHomeTeam, getResolvedAwayTeam, matchStageLabel, type ResolvedParticipantLookup } from "./participant-resolution";
import { topScorerRows, type RankedPlayerRankingRecord } from "./topScorersPageData";
import type { TeamLeaderboard } from "./tournamentStats";

export type FormResult = "W" | "D" | "L";
export type PreviewCoverageStatus = "COMPLETE" | "PARTIAL" | "NONE";
const EM_DASH = String.fromCharCode(0x2014);

export interface PreviewStatItem {
  value: number | null;
  matchesCovered: number;
  completedMatches: number;
  coverageStatus: PreviewCoverageStatus;
}

export interface PreviewStatRow {
  label: string;
  home: PreviewStatItem;
  away: PreviewStatItem;
}

export interface PreviewScorerRow {
  playerName: string;
  goals: number;
}

interface PreviewDestinationBase {
  matchNumber: number;
  stage: "Final" | "Third-place playoff";
  displayLabel: string;
  href: string;
}

export interface WinnerDestination extends PreviewDestinationBase {
  outcome: "winner";
}

export interface LoserDestination extends PreviewDestinationBase {
  outcome: "loser";
}

export type RecentFormItem = FormResult;

export type TournamentJourneyItem = {
  stage: string;
  opponentName: string;
  scoreLabel: string;
  result: "W" | "D" | "L" | "UPCOMING";
  matchHref: string | null;
};

export interface KnockoutPreviewData {
  homeRecentForm: RecentFormItem[];
  awayRecentForm: RecentFormItem[];
  homeJourney: TournamentJourneyItem[];
  awayJourney: TournamentJourneyItem[];
  homeTopScorers: PreviewScorerRow[];
  awayTopScorers: PreviewScorerRow[];
  stats: PreviewStatRow[];
  winnerDestination?: WinnerDestination;
  loserDestination?: LoserDestination;
}

export interface RecentFormFixture {
  id: string;
  kickoffMs: number;
  homeKey: string | null;
  awayKey: string | null;
  status: SnapshotMatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  stage: string;
  venue: string | null;
}

export interface JourneyFixture {
  id: string;
  kickoffMs: number;
  stage: string;
  opponentKey: string;
  isHome: boolean;
  teamScore: number;
  opponentScore: number;
  result: FormResult;
  venue: string | null;
}

export function buildRecentForm({
  teamKey,
  targetMatchId,
  targetKickoffMs,
  fixtures,
}: {
  teamKey: string;
  targetMatchId: string;
  targetKickoffMs: number;
  fixtures: readonly RecentFormFixture[];
}): FormResult[] {
  return fixtures
    .filter((fixture) => fixture.id !== targetMatchId)
    .filter((fixture) => fixture.kickoffMs < targetKickoffMs)
    .filter((fixture) => fixture.status === "FINISHED")
    .filter((fixture) => fixture.homeKey === teamKey || fixture.awayKey === teamKey)
    .filter((fixture) => fixture.homeScore !== null && fixture.awayScore !== null)
    .sort((left, right) => right.kickoffMs - left.kickoffMs)
    .slice(0, 5)
    .map((fixture): FormResult => {
      const isHome = fixture.homeKey === teamKey;
      const teamScore = isHome ? fixture.homeScore! : fixture.awayScore!;
      const opponentScore = isHome ? fixture.awayScore! : fixture.homeScore!;
      if (teamScore > opponentScore) return "W";
      if (teamScore < opponentScore) return "L";
      return "D";
    });
}

export function buildRecentJourney({
  teamKey,
  targetMatchId,
  targetKickoffMs,
  fixtures,
}: {
  teamKey: string;
  targetMatchId: string;
  targetKickoffMs: number;
  fixtures: readonly RecentFormFixture[];
}): TournamentJourneyItem[] {
  return fixtures
    .filter((fixture) => fixture.id !== targetMatchId)
    .filter((fixture) => fixture.kickoffMs < targetKickoffMs)
    .filter((fixture) => fixture.homeKey === teamKey || fixture.awayKey === teamKey)
    .sort((left, right) => left.kickoffMs - right.kickoffMs)
    .map((fixture): TournamentJourneyItem => {
      const isHome = fixture.homeKey === teamKey;
      const opponentKey = isHome ? fixture.awayKey : fixture.homeKey;
      
      let result: "W" | "D" | "L" | "UPCOMING" = "UPCOMING";
      let scoreLabel = "";
      
      if (fixture.status === "FINISHED" && fixture.homeScore !== null && fixture.awayScore !== null) {
        const teamScore = isHome ? fixture.homeScore : fixture.awayScore;
        const opponentScore = isHome ? fixture.awayScore : fixture.homeScore;
        if (teamScore > opponentScore) result = "W";
        else if (teamScore < opponentScore) result = "L";
        else result = "D";
        scoreLabel = `${teamScore}-${opponentScore}`;
      }
      
      let opponentName = opponentKey ? opponentKey : "TBD";
      // We will map this to the proper country name if possible, or the frontend can map it.
      // But the requirement says opponentName: string. So let's provide the key or TBD.
      
      return {
        stage: fixture.stage,
        opponentName: opponentKey || "TBD",
        scoreLabel,
        result,
        matchHref: `/matches/${fixture.id}`,
      };
    });
}

function previewFixtures(
  snapshot: TournamentLiveSnapshot,
  resolvedParticipants: ResolvedParticipantLookup,
): RecentFormFixture[] {
  return MATCHES.map((fixture) => {
    const snapshotMatch = snapshot.matches[matchSlug(fixture)];
    return {
      id: matchSlug(fixture),
      kickoffMs: matchUtcDate(fixture).getTime(),
      homeKey: getResolvedHomeTeam(fixture, resolvedParticipants),
      awayKey: getResolvedAwayTeam(fixture, resolvedParticipants),
      status: snapshotMatch?.status ?? "SCHEDULED",
      homeScore: snapshotMatch?.homeScore ?? null,
      awayScore: snapshotMatch?.awayScore ?? null,
      stage: matchStageLabel(fixture) ?? fixture.stage ?? "",
      venue: fixture.venue ?? null,
    };
  });
}

function previewMetric(list: readonly TeamLeaderboard[], teamKey: string): PreviewStatItem {
  const row = list.find((candidate) => candidate.teamKey === teamKey);
  if (!row) {
    return { value: null, matchesCovered: 0, completedMatches: 0, coverageStatus: "NONE" };
  }

  const matchesCovered = row.matchesCovered ?? 0;
  const completedMatches = row.completedMatches ?? matchesCovered;
  const coverageStatus: PreviewCoverageStatus = row.coverageStatus
    ?? (matchesCovered === 0 ? "NONE" : matchesCovered === completedMatches ? "COMPLETE" : "PARTIAL");

  return {
    value: coverageStatus === "NONE" ? null : row.value,
    matchesCovered,
    completedMatches,
    coverageStatus,
  };
}

function findDestination(match: KnockoutMatch, outcome: "winner" | "loser"): KnockoutMatch | undefined {
  return MATCHES.find((candidate): candidate is KnockoutMatch => {
    if (!isKnockoutMatch(candidate)) return false;
    const slotMatches = (slot: KnockoutMatch["homeSlot"]) => (
      outcome === "winner"
        ? slot.kind === "winnerOf" && slot.matchNumber === match.matchNumber
        : slot.kind === "loserOf" && slot.matchNumber === match.matchNumber
    );
    return slotMatches(candidate.homeSlot) || slotMatches(candidate.awaySlot);
  });
}

function formatDestination(
  match: KnockoutMatch,
  outcome: "winner",
): WinnerDestination;
function formatDestination(
  match: KnockoutMatch,
  outcome: "loser",
): LoserDestination;
function formatDestination(
  match: KnockoutMatch,
  outcome: "winner" | "loser",
): WinnerDestination | LoserDestination {
  const stage = match.stage === "F" ? "Final" : "Third-place playoff";
  return {
    outcome,
    matchNumber: match.matchNumber,
    stage,
    displayLabel: `Match ${match.matchNumber} ${EM_DASH} ${stage}`,
    href: `/matches/${matchSlug(match)}`,
  };
}

export function buildScheduledKnockoutPreviewData(
  matchId: string,
  snapshot: TournamentLiveSnapshot,
  resolvedParticipants: ResolvedParticipantLookup,
): KnockoutPreviewData | null {
  const match = matchBySlug(matchId);
  const snapshotMatch = snapshot.matches[matchId];
  if (!match || !isKnockoutMatch(match) || snapshotMatch?.status !== "SCHEDULED") return null;

  const homeKey = getResolvedHomeTeam(match, resolvedParticipants);
  const awayKey = getResolvedAwayTeam(match, resolvedParticipants);
  if (!homeKey || !awayKey) return null;

  const rankedScorers: RankedPlayerRankingRecord[] = topScorerRows(snapshot.topScorers);
  const toPreviewScorers = (teamKey: string): PreviewScorerRow[] => rankedScorers
    .filter((scorer) => scorer.teamKey === teamKey)
    .slice(0, 2)
    .map(({ playerName, goals }) => ({ playerName, goals }));
  const fixtures = previewFixtures(snapshot, resolvedParticipants);
  const targetKickoffMs = matchUtcDate(match).getTime();
  const winnerMatch = findDestination(match, "winner");
  const loserMatch = findDestination(match, "loser");

  return {
    homeRecentForm: buildRecentForm({ teamKey: homeKey, targetMatchId: matchId, targetKickoffMs, fixtures }),
    awayRecentForm: buildRecentForm({ teamKey: awayKey, targetMatchId: matchId, targetKickoffMs, fixtures }),
    homeJourney: buildRecentJourney({ teamKey: homeKey, targetMatchId: matchId, targetKickoffMs, fixtures }),
    awayJourney: buildRecentJourney({ teamKey: awayKey, targetMatchId: matchId, targetKickoffMs, fixtures }),
    homeTopScorers: toPreviewScorers(homeKey),
    awayTopScorers: toPreviewScorers(awayKey),
    stats: [
      { label: "Goals Scored", home: previewMetric(snapshot.teamStatLeaderboards.goalsScored, homeKey), away: previewMetric(snapshot.teamStatLeaderboards.goalsScored, awayKey) },
      { label: "Goals Conceded", home: previewMetric(snapshot.teamStatLeaderboards.goalsConceded, homeKey), away: previewMetric(snapshot.teamStatLeaderboards.goalsConceded, awayKey) },
      { label: "Clean Sheets", home: previewMetric(snapshot.teamStatLeaderboards.cleanSheets, homeKey), away: previewMetric(snapshot.teamStatLeaderboards.cleanSheets, awayKey) },
      { label: "Shots on Target", home: previewMetric(snapshot.teamStatLeaderboards.shotsOnTarget, homeKey), away: previewMetric(snapshot.teamStatLeaderboards.shotsOnTarget, awayKey) },
    ],
    winnerDestination: winnerMatch ? formatDestination(winnerMatch, "winner") : undefined,
    loserDestination: loserMatch ? formatDestination(loserMatch, "loser") : undefined,
  };
}
