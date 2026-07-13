import { matchUtcDate, type Match } from "./matches";
import { formatKickoffTime, formatKickoffDate } from "./timezone";
import { applyCanonicalMatchResultFallback } from "./canonicalMatchResults";
import type { LiveMatchData } from "./liveMatchData";

export type SemanticMatchState =
  | "scheduled"
  | "live"
  | "halftime"
  | "final"
  | "syncing"
  | "postponed"
  | "cancelled";

export interface NormalizedMatchState {
  state: SemanticMatchState;
  hasTrustworthyScore: boolean;
  homeScore: number | null;
  awayScore: number | null;
  penaltyHome: number | null;
  penaltyAway: number | null;
  scoreDuration: string | null;
}

export function normalizeMatchState({
  match,
  liveData,
  now,
}: {
  match: Match;
  liveData?: LiveMatchData;
  now: Date;
}): NormalizedMatchState {
  // 1. apply canonical fallback
  const canonicalOrLive = applyCanonicalMatchResultFallback(
    match,
    liveData,
    now.toISOString(),
  );

  const status = canonicalOrLive?.status;
  const homeScore = canonicalOrLive?.homeScore ?? null;
  const awayScore = canonicalOrLive?.awayScore ?? null;
  const hasTrustworthyScore = homeScore !== null && awayScore !== null;
  const penaltyHome = canonicalOrLive?.penaltyShootoutScore?.home ?? null;
  const penaltyAway = canonicalOrLive?.penaltyShootoutScore?.away ?? null;
  const scoreDuration = canonicalOrLive?.scoreDuration ?? null;

  const kickoffMs = matchUtcDate(match).getTime();
  const isPostKickoff = now.getTime() >= kickoffMs;

  let state: SemanticMatchState = "scheduled";

  if (status === "POSTPONED") state = "postponed";
  else if (status === "CANCELLED") state = "cancelled";
  else if (status === "FINISHED") {
    if (hasTrustworthyScore) {
      state = "final";
    } else {
      state = isPostKickoff ? "syncing" : "scheduled";
    }
  } else if (status === "IN_PLAY") {
    state = "live";
  } else if (status === "PAUSED") {
    state = "halftime";
  } else if (status === "SCHEDULED" || status === "TIMED" || !status) {
    if (isPostKickoff) {
      state = "syncing";
    } else {
      state = "scheduled";
    }
  } else {
    // UNKNOWN or missing
    state = isPostKickoff ? "syncing" : "scheduled";
  }

  return {
    state,
    hasTrustworthyScore,
    homeScore,
    awayScore,
    penaltyHome,
    penaltyAway,
    scoreDuration,
  };
}

export interface MatchPresentation {
  state: SemanticMatchState;
  hasTrustworthyScore: boolean;
  homeScore: number | null;
  awayScore: number | null;
  penaltyHome: number | null;
  penaltyAway: number | null;
  scoreDuration: string | null;
  displayKickoffDate: string;
  displayKickoffTime: string;
  showStatus: boolean;
  showScore: boolean;
}

export function getMatchPresentation({
  match,
  liveData,
  timeZone,
  now,
}: {
  match: Match;
  liveData?: LiveMatchData;
  timeZone: string;
  now: Date;
}): MatchPresentation {
  const norm = normalizeMatchState({ match, liveData, now });

  const d = matchUtcDate(match);
  const displayKickoffDate = formatKickoffDate(d, timeZone);
  const displayKickoffTime = formatKickoffTime(d, timeZone);

  return {
    ...norm,
    displayKickoffDate,
    displayKickoffTime,
    showStatus: norm.state !== "scheduled",
    showScore: norm.hasTrustworthyScore,
  };
}
