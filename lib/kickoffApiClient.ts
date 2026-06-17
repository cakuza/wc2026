export type KickoffApiClientResultCategory =
  | "success"
  | "timeout"
  | "rate_limited"
  | "unauthorized"
  | "invalid_payload"
  | "http_error"
  | "network_error"
  | "unavailable";

export type KickoffApiClientResult<T> = {
  category: KickoffApiClientResultCategory;
  data?: T;
};

export type FetchFunction = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export type KickoffApiClientOptions = {
  fetchFn?: FetchFunction;
  clock?: () => number;
  apiKey?: string;
  maxRetries?: number;
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 5000;
const MAX_RESPONSE_SIZE = 5 * 1024 * 1024; // 5 MB

export class KickoffApiClient {
  private fetchFn: FetchFunction;
  private clock: () => number;
  private apiKey?: string;
  private maxRetries: number;
  private timeoutMs: number;

  constructor(options: KickoffApiClientOptions = {}) {
    this.fetchFn = options.fetchFn || globalThis.fetch;
    this.clock = options.clock || Date.now;
    this.apiKey = options.apiKey || process.env.KICKOFF_API_KEY;
    this.maxRetries = options.maxRetries ?? 2;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  private async fetchWithRetry<T>(url: string): Promise<KickoffApiClientResult<T>> {
    if (!this.apiKey) {
      return { category: "unavailable" };
    }

    let attempt = 0;
    while (attempt <= this.maxRetries) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await this.fetchFn(url, {
          headers: { "x-api-key": this.apiKey },
          signal: controller.signal,
        });

        clearTimeout(id);

        if (response.status === 401 || response.status === 403) {
          return { category: "unauthorized" };
        }

        if (response.status === 429) {
          return { category: "rate_limited" };
        }

        if (response.status === 400) {
          return { category: "http_error" }; // Don't retry 400
        }

        if (!response.ok) {
          if (response.status >= 500 && attempt < this.maxRetries) {
            // Transient 5xx
            attempt++;
            await this.sleep(this.getBackoffMs(attempt));
            continue;
          }
          return { category: "http_error" };
        }

        // Bounded response size if we wanted to enforce strictly, but for JSON we'll just parse.
        // Node's fetch doesn't expose easy size limits before downloading, so we trust reasonable JSON size.
        const text = await response.text();
        if (text.length > MAX_RESPONSE_SIZE) {
          return { category: "invalid_payload" };
        }

        try {
          const data = JSON.parse(text) as T;
          return { category: "success", data };
        } catch {
          return { category: "invalid_payload" };
        }
      } catch (err: any) {
        clearTimeout(id);
        if (err.name === "AbortError") {
          if (attempt < this.maxRetries) {
            attempt++;
            await this.sleep(this.getBackoffMs(attempt));
            continue;
          }
          return { category: "timeout" };
        }
        
        // Network error
        if (attempt < this.maxRetries) {
          attempt++;
          await this.sleep(this.getBackoffMs(attempt));
          continue;
        }
        return { category: "network_error" };
      }
    }
    return { category: "network_error" };
  }

  private getBackoffMs(attempt: number): number {
    return Math.pow(2, attempt) * 100; // 200, 400, 800...
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
  }

  public async getFixtures(): Promise<KickoffApiClientResult<any>> {
    return this.fetchWithRetry("https://api.kickoffapi.com/api/v1/fixtures?league=1&season=2026");
  }

  public async getEvents(fixtureId: string): Promise<KickoffApiClientResult<any>> {
    // Sanitize to avoid injection
    const cleanId = encodeURIComponent(fixtureId);
    return this.fetchWithRetry(`https://api.kickoffapi.com/api/v1/events?fixture=${cleanId}`);
  }
}
