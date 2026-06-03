import injuryWatchData from "../../data/injuryWatch.json";
import lineupWatchData from "../../data/lineupWatch.json";
import matchIntelligenceData from "../../data/matchIntelligence.json";
import newsWatchData from "../../data/newsWatch.json";
import talkingPointsData from "../../data/talkingPoints.json";
import type { InjuryWatchItem, LineupWatchItem, MatchIntelligence, MatchWithTeams, NewsWatchItem, TalkingPoint } from "@/lib/types";

export type MatchIntelligenceBundle = {
  intelligence?: MatchIntelligence;
  injuries: InjuryWatchItem[];
  lineups: LineupWatchItem[];
  headlines: NewsWatchItem[];
  talkingPoints: TalkingPoint[];
};

export function getMatchIntelligenceBundle(matchId: string, match?: MatchWithTeams): MatchIntelligenceBundle {
  const intelligence = (matchIntelligenceData as MatchIntelligence[]).find((item) => item.matchId === matchId);
  const talkingPoints = (talkingPointsData as TalkingPoint[]).filter((item) => item.matchId === matchId);
  const headlines = (newsWatchData as NewsWatchItem[]).filter((item) => item.matchId === matchId);
  return {
    intelligence: intelligence || (match ? buildFallbackIntelligence(match) : undefined),
    injuries: (injuryWatchData as InjuryWatchItem[]).filter((item) => item.matchId === matchId),
    lineups: (lineupWatchData as LineupWatchItem[]).filter((item) => item.matchId === matchId),
    headlines: headlines.length ? headlines : match ? [buildFallbackHeadline(match)] : [],
    talkingPoints: talkingPoints.length ? talkingPoints : match ? [buildFallbackTalkingPoint(match)] : []
  };
}

export function getTeamIntelligence(teamId: string) {
  return {
    injuries: (injuryWatchData as InjuryWatchItem[]).filter((item) => item.teamId === teamId),
    lineups: (lineupWatchData as LineupWatchItem[]).filter((item) => item.teamId === teamId),
    headlines: (newsWatchData as NewsWatchItem[]).filter((item) => item.teamId === teamId),
    matches: (matchIntelligenceData as MatchIntelligence[]).filter((item) => item.homeTeamId === teamId || item.awayTeamId === teamId)
  };
}

export function getAllMatchIntelligenceIds() {
  return (matchIntelligenceData as MatchIntelligence[]).map((item) => item.matchId);
}

function buildFallbackIntelligence(match: MatchWithTeams): MatchIntelligence {
  return {
    matchId: match.id,
    homeTeamId: match.homeTeamId,
    awayTeamId: match.awayTeamId,
    lastCheckedUtc: "2026-05-31T12:00:00.000Z",
    dataMode: "manual",
    confidence: "low",
    keyPlayerWatch: ["Create prediction card", "Create opponent watch card"],
    opponentSummary: "Save the matchup now and drop your own take. Pick a score, call the danger man, and share it before kickoff.",
    riskNotes: ["Fan prompt"],
    sourceLabels: []
  };
}

function buildFallbackHeadline(match: MatchWithTeams): NewsWatchItem {
  return {
    id: `nw-${match.id}-fallback`,
    matchId: match.id,
    title: `${match.homeTeam.name} vs ${match.awayTeam.name} fan prompt`,
    sourceName: "Fan prompt",
    sourceUrl: "",
    publishedAt: "2026-05-31T12:00:00.000Z",
    summary: "Use the schedule facts and your own fan angle to build the card.",
    category: "general",
    confidence: "low",
    isSensitive: false,
    isSample: true
  };
}

function buildFallbackTalkingPoint(match: MatchWithTeams): TalkingPoint {
  return {
    id: `tp-${match.id}-fallback`,
    matchId: match.id,
    title: "Pick your angle",
    body: "Use the schedule, the matchup, and your own fan take. Who wins, who is the danger man, and what is the score?",
    category: "tactical",
    confidence: "medium",
    sourceLabel: "",
    isSample: true
  };
}
