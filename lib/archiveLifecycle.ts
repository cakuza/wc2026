import { MATCHES, matchUtcDate, type Match } from "./matches";
import { getTournamentPhase, type TournamentPhase } from "./matchCenterSelection";
import { getMatchPresentation } from "./matchPresentation";
import { getParticipantDisplay, type ResolvedParticipantLookup } from "./participant-resolution";
import { computeTournamentStats, type TournamentStats } from "./tournamentStats";
import type { LiveMatchData } from "./liveMatchData";
import { getPublishedAwards, type TournamentAward } from "./tournamentAwards";

export interface ArchiveMatchResult {
  match: Match & { matchNumber: number };
  homeLabel: string;
  awayLabel: string;
  homeScore: number;
  awayScore: number;
  winnerLabel: string;
  loserLabel: string;
}

export interface ArchiveState {
  phase: TournamentPhase;
  /** True only once Match 104 (the Final) is canonically final. */
  isComplete: boolean;
  finalResult: ArchiveMatchResult | null;
  thirdPlaceResult: ArchiveMatchResult | null;
  champion: string | null;
  runnerUp: string | null;
  thirdPlace: string | null;
  fourthPlace: string | null;
  awards: TournamentAward[] | null;
}

function buildMatchResult({
  matchNumber,
  liveData,
  resolvedParticipants,
  now,
}: {
  matchNumber: number;
  liveData: Record<string, LiveMatchData>;
  resolvedParticipants?: ResolvedParticipantLookup;
  now: Date;
}): ArchiveMatchResult | null {
  const match = MATCHES.find((m): m is Match & { matchNumber: number } => "matchNumber" in m && m.matchNumber === matchNumber);
  if (!match) return null;

  const live = match.providerIds?.footballData ? liveData[String(match.providerIds.footballData)] : undefined;
  const pres = getMatchPresentation({ match, liveData: live, timeZone: "UTC", now });
  if (pres.state !== "final" || pres.homeScore === null || pres.awayScore === null) return null;

  const home = getParticipantDisplay(match, "home", resolvedParticipants, "en");
  const away = getParticipantDisplay(match, "away", resolvedParticipants, "en");
  const homeWins = live?.winner ? live.winner === "HOME_TEAM" : pres.homeScore > pres.awayScore;

  return {
    match,
    homeLabel: home.label,
    awayLabel: away.label,
    homeScore: pres.homeScore,
    awayScore: pres.awayScore,
    winnerLabel: homeWins ? home.label : away.label,
    loserLabel: homeWins ? away.label : home.label,
  };
}

/**
 * Single source of truth for "is the tournament over, and what happened."
 * Reuses the existing canonical phase system rather than a hardcoded date —
 * the champion is never known until Match 104 is genuinely resolved.
 */
export function getArchiveState({
  matches,
  liveData,
  resolvedParticipants,
  now,
}: {
  matches: Match[];
  liveData: Record<string, LiveMatchData>;
  resolvedParticipants?: ResolvedParticipantLookup;
  now: Date;
}): ArchiveState {
  const phase = getTournamentPhase({ matches, liveData, now });
  const finalResult = buildMatchResult({ matchNumber: 104, liveData, resolvedParticipants, now });
  const thirdPlaceResult = buildMatchResult({ matchNumber: 103, liveData, resolvedParticipants, now });
  const isComplete = phase === "tournament_complete" && finalResult !== null;

  return {
    phase,
    isComplete,
    finalResult,
    thirdPlaceResult,
    champion: isComplete && finalResult ? finalResult.winnerLabel : null,
    runnerUp: isComplete && finalResult ? finalResult.loserLabel : null,
    thirdPlace: isComplete && thirdPlaceResult ? thirdPlaceResult.winnerLabel : null,
    fourthPlace: isComplete && thirdPlaceResult ? thirdPlaceResult.loserLabel : null,
    awards: isComplete ? getPublishedAwards(liveData) : null,
  };
}

/**
 * Live-data view restricted to matches scheduled on or before a given
 * venue-local calendar date. Feeding this into the same aggregators the
 * live /stats page uses (computeTournamentStats, computeTopScorers) yields
 * a truthful "as of that date" snapshot without duplicating their logic.
 */
export function liveDataAsOfDate({
  liveData,
  cutoffDateStr,
}: {
  liveData: Record<string, LiveMatchData>;
  cutoffDateStr: string; // YYYY-MM-DD, inclusive
}): Map<number, LiveMatchData> {
  const filtered = new Map<number, LiveMatchData>();
  for (const match of MATCHES) {
    const pid = match.providerIds?.footballData;
    if (!pid) continue;
    if (match.date > cutoffDateStr) continue;
    const live = liveData[String(pid)];
    if (live) filtered.set(pid, live);
  }
  return filtered;
}

/**
 * Tournament-wide totals as they truthfully stood at the end of a given
 * venue-local calendar date. Never shows a later date's totals on an
 * earlier snapshot.
 */
export function getStatsAsOfDate({
  liveData,
  cutoffDateStr,
}: {
  liveData: Record<string, LiveMatchData>;
  cutoffDateStr: string; // YYYY-MM-DD, inclusive
}): TournamentStats {
  return computeTournamentStats(liveDataAsOfDate({ liveData, cutoffDateStr }));
}

/** All matches whose venue-local kickoff date equals the given date, in kickoff order. */
export function matchesOnDate(date: string): Match[] {
  return MATCHES.filter((m) => m.date === date).sort((a, b) => matchUtcDate(a).getTime() - matchUtcDate(b).getTime());
}

/**
 * A calendar date is truthfully renderable as an archive snapshot once every
 * match scheduled on or before it has a final, trustworthy result — not
 * just matches on that exact date. Rest days (e.g. between quarterfinals
 * and semifinals) have zero matches of their own but still have a valid,
 * fully-resolved cumulative snapshot once the prior matchday is final.
 * Gates indexability of /world-cup-2026/results/[date] pages for dates late
 * in the knockout stage (third-place, final) that may not have happened yet.
 */
export function isDateFullyResolved({
  date,
  liveData,
  now,
}: {
  date: string;
  liveData: Record<string, LiveMatchData>;
  now: Date;
}): boolean {
  const relevantMatches = MATCHES.filter((m) => m.date <= date);
  if (relevantMatches.length === 0) return false;
  return relevantMatches.every((match) => {
    const live = match.providerIds?.footballData ? liveData[String(match.providerIds.footballData)] : undefined;
    return getMatchPresentation({ match, liveData: live, timeZone: "UTC", now }).state === "final";
  });
}
