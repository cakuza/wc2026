import { matchUtcDate, type Match } from "./matches";
import { getGoalEventCompleteness } from "./goalEventCompleteness";
import type { PeriodScore } from "./footballDataScore";
import type { LiveMatchData } from "./liveMatchData";

type CompletedResult = {
  homeScore: number;
  awayScore: number;
  winner: NonNullable<LiveMatchData["winner"]>;
  scoreDuration: "REGULAR" | "EXTRA_TIME" | "PENALTY_SHOOTOUT";
  confirmedAt: string;
  regularTimeScore?: PeriodScore;
  extraTimeScore?: PeriodScore;
  penaltyShootoutScore?: PeriodScore;
};

export const COMPLETED_GROUP_RESULTS: Readonly<Record<number, CompletedResult>> = {
  // Generated Group Results
  537327: { homeScore: 2, awayScore: 0, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-11T10:00:00.000Z" }, // mexico 2-0 southAfrica
  537328: { homeScore: 2, awayScore: 1, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-11T17:00:00.000Z" }, // southKorea 2-1 czechia
  537333: { homeScore: 1, awayScore: 1, winner: "DRAW", scoreDuration: "REGULAR", confirmedAt: "2026-06-12T12:00:00.000Z" }, // canada 1-1 bosnia
  537345: { homeScore: 4, awayScore: 1, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-12T15:00:00.000Z" }, // unitedStates 4-1 paraguay
  537340: { homeScore: 0, awayScore: 1, winner: "AWAY_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-13T18:00:00.000Z" }, // haiti 0-1 scotland
  537346: { homeScore: 2, awayScore: 0, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-13T18:00:00.000Z" }, // australia 2-0 turkey
  537339: { homeScore: 1, awayScore: 1, winner: "DRAW", scoreDuration: "REGULAR", confirmedAt: "2026-06-13T15:00:00.000Z" }, // brazil 1-1 morocco
  537334: { homeScore: 1, awayScore: 1, winner: "DRAW", scoreDuration: "REGULAR", confirmedAt: "2026-06-13T09:00:00.000Z" }, // qatar 1-1 switzerland
  537352: { homeScore: 1, awayScore: 0, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-14T16:00:00.000Z" }, // ivoryCoast 1-0 ecuador
  537351: { homeScore: 7, awayScore: 1, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-14T09:00:00.000Z" }, // germany 7-1 curacao
  537357: { homeScore: 2, awayScore: 2, winner: "DRAW", scoreDuration: "REGULAR", confirmedAt: "2026-06-14T12:00:00.000Z" }, // netherlands 2-2 japan
  537358: { homeScore: 5, awayScore: 1, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-14T17:00:00.000Z" }, // sweden 5-1 tunisia
  537364: { homeScore: 2, awayScore: 2, winner: "DRAW", scoreDuration: "REGULAR", confirmedAt: "2026-06-15T15:00:00.000Z" }, // iran 2-2 newZealand
  537369: { homeScore: 0, awayScore: 0, winner: "DRAW", scoreDuration: "REGULAR", confirmedAt: "2026-06-15T09:00:00.000Z" }, // spain 0-0 capeVerde
  537363: { homeScore: 1, awayScore: 1, winner: "DRAW", scoreDuration: "REGULAR", confirmedAt: "2026-06-15T09:00:00.000Z" }, // belgium 1-1 egypt
  537370: { homeScore: 1, awayScore: 1, winner: "DRAW", scoreDuration: "REGULAR", confirmedAt: "2026-06-15T15:00:00.000Z" }, // saudiArabia 1-1 uruguay
  537391: { homeScore: 3, awayScore: 1, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-16T12:00:00.000Z" }, // france 3-1 senegal
  537392: { homeScore: 1, awayScore: 4, winner: "AWAY_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-16T15:00:00.000Z" }, // iraq 1-4 norway
  537397: { homeScore: 3, awayScore: 0, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-16T17:00:00.000Z" }, // argentina 3-0 algeria
  537398: { homeScore: 3, awayScore: 1, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-16T18:00:00.000Z" }, // austria 3-1 jordan
  537403: { homeScore: 1, awayScore: 1, winner: "DRAW", scoreDuration: "REGULAR", confirmedAt: "2026-06-17T09:00:00.000Z" }, // portugal 1-1 drCongo
  537409: { homeScore: 4, awayScore: 2, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-17T12:00:00.000Z" }, // england 4-2 croatia
  537404: { homeScore: 1, awayScore: 3, winner: "AWAY_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-17T17:00:00.000Z" }, // uzbekistan 1-3 colombia
  537410: { homeScore: 1, awayScore: 0, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-17T16:00:00.000Z" }, // ghana 1-0 panama
  537330: { homeScore: 1, awayScore: 0, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-18T16:00:00.000Z" }, // mexico 1-0 southKorea
  537335: { homeScore: 4, awayScore: 1, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-18T09:00:00.000Z" }, // switzerland 4-1 bosnia
  537336: { homeScore: 6, awayScore: 0, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-18T12:00:00.000Z" }, // canada 6-0 qatar
  537329: { homeScore: 1, awayScore: 1, winner: "DRAW", scoreDuration: "REGULAR", confirmedAt: "2026-06-18T09:00:00.000Z" }, // czechia 1-1 southAfrica
  537341: { homeScore: 3, awayScore: 0, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-19T18:00:00.000Z" }, // brazil 3-0 haiti
  537342: { homeScore: 0, awayScore: 1, winner: "AWAY_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-19T15:00:00.000Z" }, // scotland 0-1 morocco
  537348: { homeScore: 2, awayScore: 0, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-19T09:00:00.000Z" }, // unitedStates 2-0 australia
  537347: { homeScore: 0, awayScore: 1, winner: "AWAY_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-19T17:00:00.000Z" }, // turkey 0-1 paraguay
  537353: { homeScore: 2, awayScore: 1, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-20T13:00:00.000Z" }, // germany 2-1 ivoryCoast
  537354: { homeScore: 0, awayScore: 0, winner: "DRAW", scoreDuration: "REGULAR", confirmedAt: "2026-06-20T16:00:00.000Z" }, // ecuador 0-0 curacao
  537359: { homeScore: 5, awayScore: 1, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-20T09:00:00.000Z" }, // netherlands 5-1 sweden
  537360: { homeScore: 0, awayScore: 4, winner: "AWAY_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-20T19:00:00.000Z" }, // tunisia 0-4 japan
  537365: { homeScore: 0, awayScore: 0, winner: "DRAW", scoreDuration: "REGULAR", confirmedAt: "2026-06-21T09:00:00.000Z" }, // belgium 0-0 iran
  537366: { homeScore: 1, awayScore: 3, winner: "AWAY_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-21T15:00:00.000Z" }, // newZealand 1-3 egypt
  537371: { homeScore: 4, awayScore: 0, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-21T09:00:00.000Z" }, // spain 4-0 saudiArabia
  537372: { homeScore: 2, awayScore: 2, winner: "DRAW", scoreDuration: "REGULAR", confirmedAt: "2026-06-21T15:00:00.000Z" }, // uruguay 2-2 capeVerde
  537393: { homeScore: 3, awayScore: 0, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-22T14:00:00.000Z" }, // france 3-0 iraq
  537394: { homeScore: 3, awayScore: 2, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-22T17:00:00.000Z" }, // norway 3-2 senegal
  537399: { homeScore: 2, awayScore: 0, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-22T09:00:00.000Z" }, // argentina 2-0 austria
  537400: { homeScore: 1, awayScore: 2, winner: "AWAY_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-22T17:00:00.000Z" }, // jordan 1-2 algeria
  537405: { homeScore: 5, awayScore: 0, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-23T09:00:00.000Z" }, // portugal 5-0 uzbekistan
  537412: { homeScore: 0, awayScore: 1, winner: "AWAY_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-23T16:00:00.000Z" }, // panama 0-1 croatia
  537406: { homeScore: 1, awayScore: 0, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-23T17:00:00.000Z" }, // colombia 1-0 drCongo
  537411: { homeScore: 0, awayScore: 0, winner: "DRAW", scoreDuration: "REGULAR", confirmedAt: "2026-06-23T13:00:00.000Z" }, // england 0-0 ghana
  537343: { homeScore: 0, awayScore: 3, winner: "AWAY_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-24T15:00:00.000Z" }, // scotland 0-3 brazil
  537344: { homeScore: 4, awayScore: 2, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-24T15:00:00.000Z" }, // morocco 4-2 haiti
  537332: { homeScore: 1, awayScore: 0, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-24T16:00:00.000Z" }, // southAfrica 1-0 southKorea
  537331: { homeScore: 0, awayScore: 3, winner: "AWAY_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-24T16:00:00.000Z" }, // czechia 0-3 mexico
  537338: { homeScore: 3, awayScore: 1, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-24T09:00:00.000Z" }, // bosnia 3-1 qatar
  537337: { homeScore: 2, awayScore: 1, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-24T09:00:00.000Z" }, // switzerland 2-1 canada
  537356: { homeScore: 0, awayScore: 2, winner: "AWAY_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-25T13:00:00.000Z" }, // curacao 0-2 ivoryCoast
  537355: { homeScore: 2, awayScore: 1, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-25T13:00:00.000Z" }, // ecuador 2-1 germany
  537350: { homeScore: 0, awayScore: 0, winner: "DRAW", scoreDuration: "REGULAR", confirmedAt: "2026-06-25T16:00:00.000Z" }, // paraguay 0-0 australia
  537349: { homeScore: 3, awayScore: 2, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-25T16:00:00.000Z" }, // turkey 3-2 unitedStates
  537362: { homeScore: 1, awayScore: 1, winner: "DRAW", scoreDuration: "REGULAR", confirmedAt: "2026-06-25T15:00:00.000Z" }, // japan 1-1 sweden
  537361: { homeScore: 1, awayScore: 3, winner: "AWAY_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-25T15:00:00.000Z" }, // tunisia 1-3 netherlands
  537396: { homeScore: 5, awayScore: 0, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-26T12:00:00.000Z" }, // senegal 5-0 iraq
  537395: { homeScore: 1, awayScore: 4, winner: "AWAY_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-26T12:00:00.000Z" }, // norway 1-4 france
  537368: { homeScore: 1, awayScore: 1, winner: "DRAW", scoreDuration: "REGULAR", confirmedAt: "2026-06-26T17:00:00.000Z" }, // egypt 1-1 iran
  537367: { homeScore: 1, awayScore: 5, winner: "AWAY_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-26T17:00:00.000Z" }, // newZealand 1-5 belgium
  537374: { homeScore: 0, awayScore: 0, winner: "DRAW", scoreDuration: "REGULAR", confirmedAt: "2026-06-26T16:00:00.000Z" }, // capeVerde 0-0 saudiArabia
  537373: { homeScore: 0, awayScore: 1, winner: "AWAY_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-26T15:00:00.000Z" }, // uruguay 0-1 spain
  537413: { homeScore: 0, awayScore: 2, winner: "AWAY_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-27T14:00:00.000Z" }, // panama 0-2 england
  537414: { homeScore: 2, awayScore: 1, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-27T14:00:00.000Z" }, // croatia 2-1 ghana
  537402: { homeScore: 3, awayScore: 3, winner: "DRAW", scoreDuration: "REGULAR", confirmedAt: "2026-06-27T18:00:00.000Z" }, // algeria 3-3 austria
  537401: { homeScore: 1, awayScore: 3, winner: "AWAY_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-27T18:00:00.000Z" }, // jordan 1-3 argentina
  537407: { homeScore: 0, awayScore: 0, winner: "DRAW", scoreDuration: "REGULAR", confirmedAt: "2026-06-27T16:30:00.000Z" }, // colombia 0-0 portugal
  537408: { homeScore: 3, awayScore: 1, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-27T16:30:00.000Z" }, // drCongo 3-1 uzbekistan

};

export const COMPLETED_KNOCKOUT_RESULTS: Readonly<Record<number, CompletedResult>> = {
  73: { homeScore: 0, awayScore: 1, winner: "AWAY_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-29T12:00:00.000Z" },
  74: {
    homeScore: 1,
    awayScore: 1,
    winner: "AWAY_TEAM",
    scoreDuration: "PENALTY_SHOOTOUT",
    confirmedAt: "2026-06-29T22:00:00.000Z",
    penaltyShootoutScore: { home: 3, away: 4 },
  },
  75: {
    homeScore: 1,
    awayScore: 1,
    winner: "AWAY_TEAM",
    scoreDuration: "PENALTY_SHOOTOUT",
    confirmedAt: "2026-06-29T23:30:00.000Z",
    penaltyShootoutScore: { home: 2, away: 3 },
  },
  76: { homeScore: 2, awayScore: 1, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-29T12:00:00.000Z" },
  77: { homeScore: 3, awayScore: 0, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-29T12:00:00.000Z" },
  78: { homeScore: 1, awayScore: 2, winner: "AWAY_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-29T12:00:00.000Z" },
  79: { homeScore: 2, awayScore: 0, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-29T12:00:00.000Z" },
  80: { homeScore: 2, awayScore: 1, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-29T12:00:00.000Z" },
  81: { homeScore: 2, awayScore: 0, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-29T12:00:00.000Z" },
  82: { homeScore: 3, awayScore: 2, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-29T12:00:00.000Z" },
  83: { homeScore: 2, awayScore: 1, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-29T12:00:00.000Z" },
  84: { homeScore: 3, awayScore: 0, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-29T12:00:00.000Z" },
  85: { homeScore: 2, awayScore: 0, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-07-03T05:30:00.000Z" },
  86: { homeScore: 3, awayScore: 2, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-06-29T12:00:00.000Z" },
  87: { homeScore: 1, awayScore: 0, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-07-04T03:30:00.000Z" },
  88: {
    homeScore: 1,
    awayScore: 1,
    winner: "AWAY_TEAM",
    scoreDuration: "PENALTY_SHOOTOUT",
    confirmedAt: "2026-07-03T20:30:00.000Z",
    penaltyShootoutScore: { home: 2, away: 4 },
  },
  89: { homeScore: 0, awayScore: 1, winner: "AWAY_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-07-04T23:00:00.000Z" },
  90: { homeScore: 0, awayScore: 3, winner: "AWAY_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-07-04T19:00:00.000Z" },
  91: { homeScore: 1, awayScore: 2, winner: "AWAY_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-07-05T20:00:00.000Z" },
  92: { homeScore: 2, awayScore: 3, winner: "AWAY_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-07-06T03:00:00.000Z" },
  93: { homeScore: 0, awayScore: 1, winner: "AWAY_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-07-06T22:00:00.000Z" },
  94: { homeScore: 1, awayScore: 4, winner: "AWAY_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-07-06T23:00:00.000Z" },
  95: { homeScore: 3, awayScore: 2, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-07-06T12:00:00.000Z" },
  96: {
    homeScore: 0,
    awayScore: 0,
    winner: "HOME_TEAM",
    scoreDuration: "PENALTY_SHOOTOUT",
    confirmedAt: "2026-07-06T12:00:00.000Z",
    penaltyShootoutScore: { home: 4, away: 3 },
  },
  97: { homeScore: 2, awayScore: 0, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-07-09T18:00:00.000Z" },
  98: { homeScore: 2, awayScore: 1, winner: "HOME_TEAM", scoreDuration: "REGULAR", confirmedAt: "2026-07-10T22:00:00.000Z" },
  99: {
    homeScore: 1,
    awayScore: 2,
    winner: "AWAY_TEAM",
    scoreDuration: "EXTRA_TIME",
    regularTimeScore: { home: 1, away: 1 },
    extraTimeScore: { home: 0, away: 1 },
    confirmedAt: "2026-07-12T00:00:00.000Z",
  },
  100: {
    homeScore: 3,
    awayScore: 1,
    winner: "HOME_TEAM",
    scoreDuration: "EXTRA_TIME",
    regularTimeScore: { home: 1, away: 1 },
    extraTimeScore: { home: 2, away: 0 },
    confirmedAt: "2026-07-12T00:00:00.000Z",
  },
  101: {
    homeScore: 0,
    awayScore: 2,
    winner: "AWAY_TEAM",
    scoreDuration: "REGULAR",
    confirmedAt: "2026-07-14T22:00:00.000Z",
  },
  102: {
    homeScore: 1,
    awayScore: 2,
    winner: "AWAY_TEAM",
    scoreDuration: "REGULAR",
    confirmedAt: "2026-07-15T18:00:00.000Z",
  },
  103: {
    homeScore: 4,
    awayScore: 6,
    winner: "AWAY_TEAM",
    scoreDuration: "REGULAR",
    confirmedAt: "2026-07-18T23:00:18.000Z", // Derived from provider's official completion metadata (meta.lastUpdatedAt)
  },
};

function matchNumber(match: Match): number | null {
  return "matchNumber" in match ? match.matchNumber : null;
}

export function hasCanonicalCompletedResult(match: Match): boolean {
  const num = matchNumber(match);
  return num !== null && COMPLETED_KNOCKOUT_RESULTS[num] !== undefined;
}

function shouldUseCompletedFallback(live: LiveMatchData | undefined, result: CompletedResult): boolean {
  if (!live) return true;
  if (live.status !== "FINISHED") return true;
  if (live.homeScore !== result.homeScore || live.awayScore !== result.awayScore) return true;
  if (live.winner !== result.winner) return true;
  if (live.scoreDuration !== result.scoreDuration) return true;
  if (result.regularTimeScore && (live.regularTimeScore?.home !== result.regularTimeScore.home || live.regularTimeScore?.away !== result.regularTimeScore.away)) return true;
  if (result.extraTimeScore && (live.extraTimeScore?.home !== result.extraTimeScore.home || live.extraTimeScore?.away !== result.extraTimeScore.away)) return true;
  if (result.scoreDuration === "PENALTY_SHOOTOUT" && !live.penaltyShootoutScore) return true;
  return false;
}

function resultIsConfirmed(result: CompletedResult, generatedAt: string): boolean {
  const generatedAtMs = Date.parse(generatedAt);
  const confirmedAtMs = Date.parse(result.confirmedAt);
  return Number.isFinite(generatedAtMs) && Number.isFinite(confirmedAtMs) && generatedAtMs >= confirmedAtMs;
}

/**
 * Archive events use 90+N for stoppage time but continue from 91 in extra
 * time. Preserve that stronger event-timeline evidence when an older result
 * record only says "regular"; this remains data-driven for every match.
 */
function resultWithArchiveDurationEvidence(
  result: CompletedResult,
  live: LiveMatchData | undefined,
): CompletedResult {
  // Explicit non-regular durations remain authoritative. A regular duration
  // may be an older fallback record, so a canonical 91+ archive event can
  // still correct it; normal-time stoppage remains minute 90 with stoppage.
  if (result.scoreDuration === "PENALTY_SHOOTOUT") return result;
  if (live?.scoreDuration === "EXTRA_TIME") {
    return { ...result, scoreDuration: "EXTRA_TIME" };
  }
  if (live?.scoreDuration === "PENALTY_SHOOTOUT") {
    return { ...result, scoreDuration: "PENALTY_SHOOTOUT" };
  }
  const archiveShowsExtraTime =
    (live?.goals ?? []).some((event) => (event.minute ?? 0) > 90);
  if (result.scoreDuration !== "REGULAR" || !archiveShowsExtraTime) return result;
  return { ...result, scoreDuration: "EXTRA_TIME" };
}

function isNonScoreBearingStatus(status: LiveMatchData["status"]): boolean {
  return (
    status === "SCHEDULED" ||
    status === "TIMED" ||
    status === "UNKNOWN" ||
    status === "POSTPONED" ||
    status === "CANCELLED"
  );
}

function stripUnconfirmedScore(live: LiveMatchData, generatedAt: string): LiveMatchData {
  return {
    ...live,
    homeScore: null,
    awayScore: null,
    winner: null,
    scoreDuration: undefined,
    regularTimeScore: undefined,
    extraTimeScore: undefined,
    penaltyShootoutScore: undefined,
    lastSyncedAt: live.lastSyncedAt ?? generatedAt,
    goalEventCompleteness: getGoalEventCompleteness({
      homeScore: null,
      awayScore: null,
      goals: live.goals ?? [],
      eventDataAvailable: Boolean(live.eventDataAvailable),
    }),
  };
}

export function applyCanonicalMatchResultFallback(
  match: Match,
  live: LiveMatchData | undefined,
  generatedAt: string,
): LiveMatchData | undefined {
  const providerId = match.providerIds?.footballData;
  if (!providerId) return live;

  const num = matchNumber(match);
  const knockoutCompleted = num !== null ? COMPLETED_KNOCKOUT_RESULTS[num] : undefined;
  const groupCompleted = providerId !== null ? COMPLETED_GROUP_RESULTS[providerId] : undefined;
  const completed = knockoutCompleted ?? groupCompleted;
  
  const presentationResult = completed ? resultWithArchiveDurationEvidence(completed, live) : undefined;

  if (presentationResult && resultIsConfirmed(presentationResult, generatedAt) && shouldUseCompletedFallback(live, presentationResult)) {
    const goals = live?.goals ?? [];
    return {
      ...(live ?? {
        provider: "football-data.org",
        providerMatchId: providerId,
        eventDataAvailable: false,
      }),
      provider: "football-data.org",
      providerMatchId: providerId,
      status: "FINISHED",
      homeScore: presentationResult.homeScore,
      awayScore: presentationResult.awayScore,
      winner: presentationResult.winner,
      scoreDuration: presentationResult.scoreDuration,
      regularTimeScore: presentationResult.regularTimeScore ?? live?.regularTimeScore,
      extraTimeScore: presentationResult.extraTimeScore ?? live?.extraTimeScore,
      penaltyShootoutScore: presentationResult.penaltyShootoutScore ?? live?.penaltyShootoutScore,
      lastSyncedAt: live?.lastSyncedAt ?? generatedAt,
      goalEventCompleteness: getGoalEventCompleteness({
        homeScore: presentationResult.homeScore,
        awayScore: presentationResult.awayScore,
        goals,
        eventDataAvailable: Boolean(live?.eventDataAvailable),
      }),
      goals,
    };
  }

  const generatedAtMs = Date.parse(generatedAt);
  const kickoffMs = matchUtcDate(match).getTime();
  const isPreKickoff = Number.isFinite(generatedAtMs) && generatedAtMs < kickoffMs;
  if (live && isNonScoreBearingStatus(live.status) && (live.homeScore !== null || live.awayScore !== null || live.winner !== null)) {
    return stripUnconfirmedScore(live, generatedAt);
  }
  if (
    live &&
    isPreKickoff &&
    (live.status === "IN_PLAY" || live.status === "PAUSED") &&
    live.homeScore === null &&
    live.awayScore === null
  ) {
    return {
      ...live,
      status: "SCHEDULED",
      lastSyncedAt: live.lastSyncedAt ?? generatedAt,
    };
  }

  return live;
}
