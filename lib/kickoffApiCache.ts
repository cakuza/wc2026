import "server-only";
import { unstable_cache } from "./cacheAdapter";
import { KickoffApiClient, KickoffApiClientResult, UpstreamAttemptBudget, KickoffApiClientResultCategory } from "./kickoffApiClient";

class KickoffApiCacheError extends Error {
  public category: KickoffApiClientResultCategory;
  constructor(category: KickoffApiClientResultCategory) {
    super(category);
    this.name = "KickoffApiCacheError";
    this.category = category;
  }
}
import { KickoffApiGoalEvent } from "./kickoffApiProvider"; // Assume parser exports this

export type EventFetchStrategy = {
  // If undefined, don't fetch. If number, use as revalidate TTL.
  ttl?: number;
};

export function getEventCacheStrategy(
  canonicalStatus: "SCHEDULED" | "TIMED" | "IN_PLAY" | "PAUSED" | "FINISHED",
  ledgerCompleteness: "consistent" | "partial" | "conflicted" | "temporarily_unavailable" | "never_received",
  elapsedSinceFinishedMs?: number
): EventFetchStrategy {
  if (canonicalStatus === "SCHEDULED" || canonicalStatus === "TIMED") {
    return { ttl: undefined }; // do not fetch
  }
  
  if (canonicalStatus === "IN_PLAY" || canonicalStatus === "PAUSED") {
    return { ttl: 60 }; // live match short TTL
  }
  
  if (canonicalStatus === "FINISHED") {
    if (ledgerCompleteness === "consistent") {
      return { ttl: 86400 }; // 24 hours
    }
    
    // Finished but unresolved
    // If it's been finished for a very long time, we might stop live checking, but the requirements
    // say "older finished unresolved matches" are deprioritized, but still fetched.
    // Let's say recently finished: 5 mins TTL. Older: 15 mins.
    if (elapsedSinceFinishedMs !== undefined && elapsedSinceFinishedMs > 24 * 60 * 60 * 1000) {
      return { ttl: 86400 }; // very old unresolved match, just cache long
    }
    return { ttl: 300 }; // 5 mins
  }
  
  return { ttl: 300 };
}

// Bounded request protection
const MAX_UPSTREAM_REQUESTS_PER_OPERATION = 6;

export class KickoffEventCacheManager {
  private upstreamRequestsConsumed = 0;
  private client: KickoffApiClient;
  private maxRequests: number;

  constructor(client: KickoffApiClient, maxRequests = MAX_UPSTREAM_REQUESTS_PER_OPERATION) {
    this.client = client;
    this.maxRequests = maxRequests;
  }

  public getDiagnostics() {
    return {
      upstreamRequestsConsumed: this.upstreamRequestsConsumed,
      budgetExceeded: this.upstreamRequestsConsumed >= this.maxRequests
    };
  }

  private getBudget(): UpstreamAttemptBudget {
    return {
      tryConsume: () => {
        if (this.upstreamRequestsConsumed >= this.maxRequests) return false;
        this.upstreamRequestsConsumed++;
        return true;
      },
      markRateLimited: () => {
        this.upstreamRequestsConsumed = this.maxRequests;
      },
      isStopped: () => this.upstreamRequestsConsumed >= this.maxRequests
    };
  }

  public async getCachedEvents(
    providerFixtureId: string,
    strategy: EventFetchStrategy
  ): Promise<KickoffApiClientResult<any> | null> {
    if (strategy.ttl === undefined) {
      return null;
    }

    const fetcher = async () => {
      const result = await this.client.getEvents(providerFixtureId, this.getBudget());
      if (result.category !== "success") {
        throw new KickoffApiCacheError(result.category);
      }
      return result.data;
    };

    // The cache key must include version and providerFixtureId and TTL class
    const cachedFn = unstable_cache(
      fetcher,
      ["kickoffapi-events", "v1", providerFixtureId, `ttl-${strategy.ttl}`],
      { revalidate: strategy.ttl }
    );

    try {
      const data = await cachedFn();
      return { category: "success", data };
    } catch (e: any) {
      if (e instanceof KickoffApiCacheError) {
        return { category: e.category };
      }
      return { category: "network_error" };
    }
  }
  
  public async getCachedFixtures(ttl: number = 86400): Promise<KickoffApiClientResult<any>> {
    const fetcher = async () => {
      const result = await this.client.getFixtures(this.getBudget());
      if (result.category !== "success") {
        throw new KickoffApiCacheError(result.category);
      }
      return result.data;
    };
    
    const cachedFn = unstable_cache(
      fetcher,
      ["kickoffapi-fixtures", "v1", `ttl-${ttl}`],
      { revalidate: ttl }
    );
    
    try {
      const data = await cachedFn();
      return { category: "success", data };
    } catch (e: any) {
      if (e instanceof KickoffApiCacheError) {
        return { category: e.category };
      }
      return { category: "network_error" };
    }
  }
}
