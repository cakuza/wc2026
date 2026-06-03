import type { DataMeta, Match, Player, PlayerStat, Standing, Team } from "@/lib/types";

export interface FootballDataProvider {
  getTeams(): Promise<Team[]>;
  getTeam(slug: string): Promise<Team | null>;
  getPlayers(): Promise<Player[]>;
  getMatches(): Promise<Match[]>;
  getStandings(): Promise<Standing[]>;
  getPlayerStats(): Promise<PlayerStat[]>;
  getMeta(): Promise<DataMeta>;
}
