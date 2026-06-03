export type GoogleNewsRssQuery = {
  terms: string[];
  language?: string;
  region?: string;
};

export const googleNewsRssProvider = {
  async search(_query: GoogleNewsRssQuery) {
    void _query;
    // TODO: Build reviewed Google News RSS URLs and parse titles/links only.
    // MVP rule: no production network calls, no article copying, and no unsourced claims.
    return [];
  }
};
