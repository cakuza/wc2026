import matches from "../../../data/matches.json";
import meta from "../../../data/meta.json";
import players from "../../../data/players.json";
import playerStats from "../../../data/playerStats.json";
import standings from "../../../data/standings.json";
import teams from "../../../data/teams.json";
import type { FootballDataProvider } from "./types";
import type { DataMeta, Match, Player, PlayerStat, Standing, Team } from "@/lib/types";

export const mockProvider: FootballDataProvider = {
  async getTeams() {
    return teams as Team[];
  },
  async getTeam(slug: string) {
    const normalized = normalizeSlug(slug);
    return (
      (teams as Team[]).find(
        (team) =>
          normalizeSlug(team.slug) === normalized ||
          normalizeSlug(team.id) === normalized ||
          normalizeSlug(team.fifaCode) === normalized ||
          team.aliases?.some((alias) => normalizeSlug(alias) === normalized)
      ) || null
    );
  },
  async getPlayers() {
    return players as Player[];
  },
  async getMatches() {
    return matches as Match[];
  },
  async getStandings() {
    return standings as Standing[];
  },
  async getPlayerStats() {
    return playerStats as PlayerStat[];
  },
  async getMeta() {
    return meta as DataMeta;
  }
};

function normalizeSlug(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
}
