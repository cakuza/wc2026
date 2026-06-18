import "server-only";
import { unstable_cache } from "./cacheAdapter";
import {
  EspnClient,
  type EspnClientResult,
  type EspnClientResultCategory,
  type UpstreamAttemptBudget,
} from "./espnClient";

class EspnCacheError extends Error {
  public category: EspnClientResultCategory;
  constructor(category: EspnClientResultCategory) {
    super(category);
    this.name = "EspnCacheError";
    this.category = category;
  }
}

// Bounds the number of upstream ESPN requests a single snapshot build may make,
// independent of how many candidates exist. The scoreboard costs one request; each
// candidate summary costs one more. Sized to clear a full matchday's worth of
// not-yet-cached finished matches in a single build (summaries are then cached for
// up to 24h, so this ceiling is only approached on a cold cache, never in steady
// state).
const MAX_UPSTREAM_REQUESTS_PER_OPERATION = 12;

export class EspnEventCacheManager {
  private upstreamRequestsConsumed = 0;
  private client: EspnClient;
  private maxRequests: number;

  constructor(client: EspnClient, maxRequests = MAX_UPSTREAM_REQUESTS_PER_OPERATION) {
    this.client = client;
    this.maxRequests = maxRequests;
  }

  public getDiagnostics() {
    return {
      upstreamRequestsConsumed: this.upstreamRequestsConsumed,
      budgetExceeded: this.upstreamRequestsConsumed >= this.maxRequests,
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
      isStopped: () => this.upstreamRequestsConsumed >= this.maxRequests,
    };
  }

  /**
   * Fetch and cache the tournament scoreboard. Scoreboard identity (fixtures, teams,
   * kickoff) is stable, so it can be cached for a long TTL; the per-match summary is
   * where fresh goal data lives.
   */
  public async getCachedScoreboard(dateRange: string, ttl: number): Promise<EspnClientResult<unknown>> {
    const fetcher = async () => {
      const result = await this.client.getScoreboard(dateRange, this.getBudget());
      if (result.category !== "success") {
        throw new EspnCacheError(result.category);
      }
      return result.data;
    };

    const cachedFn = unstable_cache(
      fetcher,
      ["espn-scoreboard", "v1", dateRange, `ttl-${ttl}`],
      { revalidate: ttl },
    );

    try {
      const data = await cachedFn();
      return { category: "success", data };
    } catch (e: unknown) {
      if (e instanceof EspnCacheError) return { category: e.category };
      return { category: "network_error" };
    }
  }

  /** Fetch and cache a single match summary, keyed by event id and TTL class. */
  public async getCachedSummary(providerFixtureId: string, ttl: number): Promise<EspnClientResult<unknown>> {
    const fetcher = async () => {
      const result = await this.client.getSummary(providerFixtureId, this.getBudget());
      if (result.category !== "success") {
        throw new EspnCacheError(result.category);
      }
      return result.data;
    };

    const cachedFn = unstable_cache(
      fetcher,
      ["espn-summary", "v1", providerFixtureId, `ttl-${ttl}`],
      { revalidate: ttl },
    );

    try {
      const data = await cachedFn();
      return { category: "success", data };
    } catch (e: unknown) {
      if (e instanceof EspnCacheError) return { category: e.category };
      return { category: "network_error" };
    }
  }
}

/** TTL (seconds) for a match summary, based on its canonical lifecycle. */
export function summaryTtlForStatus(
  status: "SCHEDULED" | "LIVE" | "HALFTIME" | "SYNCING" | "FINISHED",
  finishedAndConsistent: boolean,
): number {
  if (status === "LIVE" || status === "HALFTIME" || status === "SYNCING") return 60;
  if (status === "FINISHED") return finishedAndConsistent ? 86_400 : 300;
  return 300;
}
