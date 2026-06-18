import "server-only";

import {
  ESPN_SCOREBOARD_PATH,
  ESPN_SOCCER_BASE_URL,
  ESPN_SUMMARY_PATH,
} from "./espnProvider";

// Server-only HTTP client for ESPN's public soccer JSON API. The public endpoints
// require no key and no auth header — the only outbound header is a generic,
// secret-free User-Agent identifying this application. Every failure mode maps to a
// sanitized category so callers can fail closed without leaking provider internals.

export type EspnClientResultCategory =
  | "success"
  | "timeout"
  | "rate_limited"
  | "http_error"
  | "invalid_payload"
  | "network_error";

export type EspnClientResult<T> = {
  category: EspnClientResultCategory;
  data?: T;
};

export interface UpstreamAttemptBudget {
  tryConsume(): boolean;
  markRateLimited(): void;
  isStopped(): boolean;
}

export type FetchFunction = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export type EspnClientOptions = {
  fetchFn?: FetchFunction;
  maxRetries?: number;
  timeoutMs?: number;
  userAgent?: string;
};

const DEFAULT_TIMEOUT_MS = 6000;
const DEFAULT_MAX_RETRIES = 2;
const MAX_RESPONSE_SIZE = 5 * 1024 * 1024; // 5 MB
const DEFAULT_USER_AGENT = "WorldCupMatchday/1.0 (+https://worldcupmatchday.com)";

export class EspnClient {
  private fetchFn: FetchFunction;
  private maxRetries: number;
  private timeoutMs: number;
  private userAgent: string;

  constructor(options: EspnClientOptions = {}) {
    this.fetchFn = options.fetchFn || globalThis.fetch;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.userAgent = options.userAgent ?? DEFAULT_USER_AGENT;
  }

  private async fetchJson<T>(url: string, budget?: UpstreamAttemptBudget): Promise<EspnClientResult<T>> {
    let attempt = 0;
    while (attempt <= this.maxRetries) {
      if (budget) {
        if (budget.isStopped() || !budget.tryConsume()) {
          return { category: "rate_limited" };
        }
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await this.fetchFn(url, {
          headers: { "User-Agent": this.userAgent, Accept: "application/json" },
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (response.status === 429) {
          if (budget) budget.markRateLimited();
          return { category: "rate_limited" };
        }

        if (!response.ok) {
          if (response.status >= 500 && attempt < this.maxRetries) {
            attempt++;
            await this.sleep(this.backoffMs(attempt));
            continue;
          }
          return { category: "http_error" };
        }

        const text = await response.text();
        if (text.length > MAX_RESPONSE_SIZE) {
          return { category: "invalid_payload" };
        }

        try {
          const parsed = JSON.parse(text) as T;
          if (parsed === null || typeof parsed !== "object") {
            return { category: "invalid_payload" };
          }
          return { category: "success", data: parsed };
        } catch {
          return { category: "invalid_payload" };
        }
      } catch (err: unknown) {
        clearTimeout(timer);
        const isAbort = err instanceof Error && err.name === "AbortError";
        if (attempt < this.maxRetries) {
          attempt++;
          await this.sleep(this.backoffMs(attempt));
          continue;
        }
        return { category: isAbort ? "timeout" : "network_error" };
      }
    }
    return { category: "network_error" };
  }

  private backoffMs(attempt: number): number {
    return Math.pow(2, attempt) * 100; // 200, 400, 800...
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Fetch the tournament scoreboard for a date range string ("YYYYMMDD-YYYYMMDD"
   * or "YYYYMMDD"). One range request returns the whole tournament fixture list.
   */
  public async getScoreboard(dateRange: string, budget?: UpstreamAttemptBudget): Promise<EspnClientResult<unknown>> {
    const range = encodeURIComponent(dateRange);
    const url = `${ESPN_SOCCER_BASE_URL}${ESPN_SCOREBOARD_PATH}?dates=${range}&limit=300`;
    return this.fetchJson(url, budget);
  }

  /** Fetch a single completed/in-play match summary (goal events live in keyEvents). */
  public async getSummary(eventId: string, budget?: UpstreamAttemptBudget): Promise<EspnClientResult<unknown>> {
    const id = encodeURIComponent(eventId);
    const url = `${ESPN_SOCCER_BASE_URL}${ESPN_SUMMARY_PATH}?event=${id}`;
    return this.fetchJson(url, budget);
  }
}
