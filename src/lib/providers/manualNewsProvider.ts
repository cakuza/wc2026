import { getMatchIntelligenceBundle } from "@/lib/match-intelligence";

export type ManualNewsQuery = {
  matchId?: string;
  teamId?: string;
  limit?: number;
};

export const manualNewsProvider = {
  async getHeadlines(query: ManualNewsQuery) {
    if (!query.matchId) return [];
    return getMatchIntelligenceBundle(query.matchId).headlines.slice(0, query.limit || 5);
  }
};
