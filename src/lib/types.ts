export type Group = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L";
export const GROUPS: Group[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export type Team = {
  id: string;
  slug: string;
  name: string;
  fifaCode: string;
  shortName?: string;
  countryCode?: string;
  flagEmoji?: string;
  flagUrl?: string;
  group: Group;
  confederation: string;
  coach: string;
  featured?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  featuredPlayer?: string;
  fanHook?: string;
  timezoneSuggestion?: string;
  aliases?: string[];
  dataStatus?: "sample" | "pending" | "verified";
  sourceLabel?: string;
};

export type Player = {
  id: string;
  name: string;
  displayName?: string;
  teamId: string;
  position: "GK" | "DF" | "MF" | "FW" | "Unknown";
  shirtNumber?: number;
  playerId?: string;
  club?: string;
  age?: number;
  caps?: number;
  goals?: number;
  assists?: number;
  yellowCards?: number;
  redCards?: number;
  matches?: number;
  minutes?: number;
  penalties?: number;
  isStar?: boolean;
  isCaptain?: boolean;
  dataStatus?: "pending" | "reported" | "provisional" | "official" | "sample";
  sourceLabel?: string;
  sourceUrl?: string;
};

export type Match = {
  id: string;
  date: string;
  kickoffUtc?: string | null;
  kickoffStatus?: "sample" | "pending" | "confirmed";
  stage: "group" | "Round of 32" | "Round of 16" | "Quarterfinal" | "Semifinal" | "Final";
  group?: Group;
  venue: string;
  city: string;
  venueStatus?: "sample" | "pending" | "confirmed";
  homeTeamId: string;
  awayTeamId: string;
  status: "scheduled" | "live" | "finished";
  homeScore: number | null;
  awayScore: number | null;
  dataStatus?: "sample" | "pending" | "schedulePending" | "scheduled" | "verified";
  sourceLabel?: string;
  sourceUrl?: string;
  lastVerifiedUtc?: string;
};

export type Standing = {
  teamId: string;
  group: Group;
  rank?: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference?: number;
  points: number;
  dataStatus?: "preTournament" | "sample" | "verified";
  isPreTournament?: boolean;
};

export type PlayerStat = {
  playerId: string;
  teamId?: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  matches?: number;
  minutes?: number;
  penalties?: number;
  position?: Player["position"];
};

export type DataMeta = {
  lastUpdatedUtc: string;
  dataSource: string;
  updateMode: string;
  note: string;
};

export type SquadPlayer = Player & {
  playerId?: string;
  matches?: number;
  minutes?: number;
  penalties?: number;
};

export type Squad = {
  teamId: string;
  squadStatus: "pending" | "reported" | "provisional" | "official";
  sourceLabel: string;
  sourceUrl?: string;
  lastCheckedUtc: string;
  note?: string;
  players: SquadPlayer[];
};

export type DataConfidence = "low" | "medium" | "high";

export type InjuryWatchStatus = "injured" | "doubtful" | "suspended" | "unavailable" | "monitoring";

export type InjuryWatchItem = {
  id: string;
  playerName: string;
  teamId: string;
  matchId?: string;
  status: InjuryWatchStatus;
  reason: string;
  expectedReturn?: string;
  sourceLabel: string;
  sourceUrl?: string;
  lastUpdatedUtc: string;
  confidence: DataConfidence;
  isSample: boolean;
};

export type LineupWatchItem = {
  matchId: string;
  teamId: string;
  type: "predicted" | "confirmed" | "sample";
  formation: string;
  players: Array<{
    playerName: string;
    position: string;
    shirtNumber?: number;
    status: "starter" | "bench";
  }>;
  sourceLabel: string;
  sourceUrl?: string;
  lastUpdatedUtc: string;
  confidence: DataConfidence;
  isSample: boolean;
};

export type NewsWatchItem = {
  id: string;
  teamId?: string;
  matchId?: string;
  title: string;
  sourceName: string;
  sourceUrl?: string;
  publishedAt: string;
  summary: string;
  category: "injury" | "lineup" | "tactical" | "drama" | "federation" | "player" | "general";
  confidence: DataConfidence;
  isSensitive: boolean;
  isSample: boolean;
};

export type TalkingPoint = {
  id: string;
  matchId: string;
  title: string;
  body: string;
  category: "tactical" | "player" | "injury" | "rivalry" | "pressure" | "drama";
  confidence: DataConfidence;
  sourceLabel?: string;
  isSample: boolean;
};

export type MatchIntelligence = {
  matchId: string;
  homeTeamId: string;
  awayTeamId: string;
  lastCheckedUtc: string;
  dataMode: "sample" | "manual" | "news-watch" | "api-future";
  confidence: DataConfidence;
  keyPlayerWatch: string[];
  opponentSummary: string;
  riskNotes: string[];
  sourceLabels: string[];
};

export type MatchWithTeams = Match & {
  homeTeam: Team;
  awayTeam: Team;
};

export type PlayerWithStats = Player & {
  team: Team;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
};
