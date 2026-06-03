import type { FootballDataProvider } from "./types";

export const sportmonksProvider: FootballDataProvider = {
  async getTeams() {
    // TODO: Map Sportmonks squads to the internal Team shape when paid API sync is enabled.
    throw new Error("Sportmonks provider is not configured for the MVP.");
  },
  async getTeam() {
    throw new Error("Sportmonks provider is not configured for the MVP.");
  },
  async getPlayers() {
    throw new Error("Sportmonks provider is not configured for the MVP.");
  },
  async getMatches() {
    throw new Error("Sportmonks provider is not configured for the MVP.");
  },
  async getStandings() {
    throw new Error("Sportmonks provider is not configured for the MVP.");
  },
  async getPlayerStats() {
    throw new Error("Sportmonks provider is not configured for the MVP.");
  },
  async getMeta() {
    throw new Error("Sportmonks provider is not configured for the MVP.");
  }
};
