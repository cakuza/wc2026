// Type definitions for live match event data sourced from football-data.org v4 API.
// These are populated once the tournament is live and football-data.org match IDs
// are mapped into the fixture data.

export type GoalEvent = {
  minute: number;
  injuryTime?: number;
  scorer: string;
  team: string; // homeKey or awayKey
  type: "GOAL" | "OWN_GOAL" | "PENALTY";
};

export type CardEvent = {
  minute: number;
  player: string;
  team: string;
  type: "YELLOW" | "RED" | "YELLOW_RED";
};

export type SubEvent = {
  minute: number;
  playerIn: string;
  playerOut: string;
  team: string;
};

export type MatchStatus =
  | "SCHEDULED"
  | "TIMED"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED"
  | "POSTPONED"
  | "CANCELLED";

export type MatchScore = {
  home: number | null;
  away: number | null;
  status: MatchStatus;
};

export type MatchEvents = {
  score: MatchScore;
  goals: GoalEvent[];
  cards: CardEvent[];
  substitutions: SubEvent[];
};
