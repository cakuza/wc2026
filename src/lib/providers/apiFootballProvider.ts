import type { FootballDataProvider } from "./types";

export const apiFootballProvider: FootballDataProvider = {
  async getTeams() {
    // TODO: Map API-Football teams to the internal Team shape when paid API sync is enabled.
    throw new Error("API-Football provider is not configured for the MVP.");
  },
  async getTeam() {
    throw new Error("API-Football provider is not configured for the MVP.");
  },
  async getPlayers() {
    throw new Error("API-Football provider is not configured for the MVP.");
  },
  async getMatches() {
    throw new Error("API-Football provider is not configured for the MVP.");
  },
  async getStandings() {
    throw new Error("API-Football provider is not configured for the MVP.");
  },
  async getPlayerStats() {
    throw new Error("API-Football provider is not configured for the MVP.");
  },
  async getMeta() {
    throw new Error("API-Football provider is not configured for the MVP.");
  }
};
