import type { KnockoutStage } from "./matches";

export type PeriodScore = {
  home: number | null;
  away: number | null;
};

export type FootballDataWinner = "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;

export type FootballDataScoreSemantics = {
  stage: KnockoutStage | "group" | null;
  rawStage: string | null;
  duration: string | null;
  homeScore: number | null;
  awayScore: number | null;
  winner: FootballDataWinner;
  regularTimeScore: PeriodScore | null;
  extraTimeScore: PeriodScore | null;
  penaltyShootoutScore: PeriodScore | null;
};

const KNOWN_WINNERS = new Set(["HOME_TEAM", "AWAY_TEAM", "DRAW"]);

function periodScore(value: unknown): PeriodScore | null {
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
  if (!record) return null;
  const home = typeof record.home === "number" ? record.home : null;
  const away = typeof record.away === "number" ? record.away : null;
  return home === null && away === null ? null : { home, away };
}

function addPeriodScores(a: PeriodScore | null, b: PeriodScore | null): PeriodScore | null {
  if (!a && !b) return null;
  return {
    home: (a?.home ?? 0) + (b?.home ?? 0),
    away: (a?.away ?? 0) + (b?.away ?? 0),
  };
}

function winnerFromScore(score: PeriodScore | null): FootballDataWinner {
  if (!score || score.home === null || score.away === null) return null;
  if (score.home > score.away) return "HOME_TEAM";
  if (score.away > score.home) return "AWAY_TEAM";
  return "DRAW";
}

function stageFromFootballData(rawStage: string | null): FootballDataScoreSemantics["stage"] {
  switch (rawStage) {
    case "GROUP_STAGE":
      return "group";
    case "LAST_32":
      return "R32";
    case "LAST_16":
      return "R16";
    case "QUARTER_FINALS":
      return "QF";
    case "SEMI_FINALS":
      return "SF";
    case "THIRD_PLACE":
      return "3P";
    case "FINAL":
      return "F";
    default:
      return null;
  }
}

export function parseFootballDataScore(entry: Record<string, unknown>): FootballDataScoreSemantics {
  const score = entry.score && typeof entry.score === "object" && !Array.isArray(entry.score)
    ? (entry.score as Record<string, unknown>)
    : {};
  const rawStage = typeof entry.stage === "string" ? entry.stage : null;
  const duration = typeof score.duration === "string" ? score.duration : null;
  const fullTimeScore = periodScore(score.fullTime);
  const regularTimeScore = periodScore(score.regularTime);
  const extraTimeScore = periodScore(score.extraTime);
  const penaltyShootoutScore = periodScore(score.penalties);
  const rawWinner = typeof score.winner === "string" && KNOWN_WINNERS.has(score.winner)
    ? (score.winner as FootballDataWinner)
    : null;

  const displayScore = duration === "PENALTY_SHOOTOUT"
    ? addPeriodScores(regularTimeScore, extraTimeScore) ?? fullTimeScore
    : fullTimeScore;
  const winner = rawWinner ?? (duration === "PENALTY_SHOOTOUT"
    ? winnerFromScore(penaltyShootoutScore)
    : winnerFromScore(displayScore));

  return {
    stage: stageFromFootballData(rawStage),
    rawStage,
    duration,
    homeScore: displayScore?.home ?? null,
    awayScore: displayScore?.away ?? null,
    winner,
    regularTimeScore,
    extraTimeScore,
    penaltyShootoutScore,
  };
}
