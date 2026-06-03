export type GdeltQuery = {
  query: string;
  maxRecords?: number;
  language?: string;
};

export const gdeltProvider = {
  async search(_query: GdeltQuery) {
    void _query;
    // TODO: Explore GDELT 2.1 DOC API for free headline monitoring.
    // MVP rule: use this only as a discovery source, then manually review and attribute.
    return [];
  }
};
