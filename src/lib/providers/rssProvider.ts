export type RssFeedQuery = {
  feedUrl: string;
  teamId?: string;
  matchId?: string;
};

export const rssProvider = {
  async readFeed(_query: RssFeedQuery) {
    void _query;
    // TODO: Parse allowlisted RSS feeds with rate limits and attribution.
    // MVP rule: no required API keys, no scraping pages, no full article text.
    return [];
  }
};
