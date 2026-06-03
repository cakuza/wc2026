import { getMatchIntelligenceBundle, getTeamIntelligence } from "@/lib/match-intelligence";

export const matchIntelligenceProvider = {
  async getMatch(matchId: string) {
    return getMatchIntelligenceBundle(matchId);
  },
  async getTeam(teamId: string) {
    return getTeamIntelligence(teamId);
  }
};
