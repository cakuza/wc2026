import { unstable_cache as next_unstable_cache } from "next/cache";

export interface CacheAdapter {
  unstable_cache<T>(
    fetcher: () => Promise<T>,
    keys: string[],
    options?: { revalidate?: number; tags?: string[] }
  ): () => Promise<T>;
}

export const NextCacheAdapter: CacheAdapter = {
  unstable_cache: next_unstable_cache as any
};

/**
 * In-memory cache adapter for deterministic tests.
 * Preserves stale values on error (same contract as Next.js unstable_cache).
 * Not a perfect Vercel emulator — TTL and tag-based invalidation are not implemented.
 */
export class MemoryCacheAdapter implements CacheAdapter {
  public store = new Map<string, any>();
  private inflight = new Map<string, Promise<any>>();

  unstable_cache<T>(fetcher: () => Promise<T>, keys: string[]): () => Promise<T> {
    const key = keys.join(",");
    return async () => {
      if (this.inflight.has(key)) {
        try {
          return await this.inflight.get(key)!;
        } catch {
          if (this.store.has(key)) return this.store.get(key) as T;
          throw new Error(`[MemoryCacheAdapter] inflight failed and no stale value for ${key}`);
        }
      }

      const promise = fetcher();
      this.inflight.set(key, promise);

      try {
        const result = await promise;
        this.store.set(key, result);
        return result;
      } catch (err) {
        if (this.store.has(key)) {
          return this.store.get(key) as T;
        }
        throw err;
      } finally {
        this.inflight.delete(key);
      }
    };
  }
}

let activeAdapter: CacheAdapter = NextCacheAdapter;

export function setCacheAdapter(adapter: CacheAdapter) {
  activeAdapter = adapter;
}

export function unstable_cache<T>(
  fetcher: () => Promise<T>,
  keys: string[],
  options?: { revalidate?: number; tags?: string[] }
): () => Promise<T> {
  let cachedWrapper: (() => Promise<T>) | null = null;
  let lastAdapter: CacheAdapter | null = null;

  return async () => {
    if (lastAdapter !== activeAdapter || !cachedWrapper) {
      lastAdapter = activeAdapter;
      cachedWrapper = activeAdapter.unstable_cache(fetcher, keys, options);
    }
    return cachedWrapper();
  };
}
