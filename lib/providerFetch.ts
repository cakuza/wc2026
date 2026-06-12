/**
 * Thin 429-safe wrapper around fetch() for football-data.org API calls.
 * Handles rate-limit (429), server errors (5xx), timeouts, and network errors.
 * Always returns a result — never throws. Callers render their static/fixture fallback on failure.
 */

const DEFAULT_TIMEOUT_MS = 10_000;

export type ProviderFetchResult =
  | { ok: true; data: unknown }
  | { ok: false; status: number | null; retryAfter: number | null };

export async function providerFetch(
  url: string,
  apiKey: string,
  nextOpts?: { revalidate?: number },
): Promise<ProviderFetchResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: { "X-Auth-Token": apiKey },
      signal: controller.signal,
      next: nextOpts,
    });

    clearTimeout(timer);

    if (res.status === 429) {
      const retryAfterRaw = res.headers.get("Retry-After");
      const retryAfter = retryAfterRaw ? (parseInt(retryAfterRaw, 10) || null) : null;
      console.warn(
        `[providerFetch] 429 rate-limited: ${url}` +
        (retryAfter ? ` — retry after ${retryAfter}s` : ""),
      );
      return { ok: false, status: 429, retryAfter };
    }

    if (!res.ok) {
      console.warn(`[providerFetch] HTTP ${res.status}: ${url}`);
      return { ok: false, status: res.status, retryAfter: null };
    }

    const data = (await res.json()) as unknown;
    return { ok: true, data };
  } catch (err) {
    clearTimeout(timer);
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[providerFetch] error: ${url} — ${msg}`);
    return { ok: false, status: null, retryAfter: null };
  }
}
