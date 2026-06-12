/**
 * React cache()-wrapped bulk live-data fetcher.
 *
 * Within a single server render pass, all callers that call getCachedLiveData()
 * receive the same Promise — no duplicate HTTP requests in the same ISR pass.
 *
 * Between ISR passes, Next.js's fetch cache (next: { revalidate: 60 } in
 * fetchAllLiveData) deduplicates the actual HTTP call across pages revalidating
 * at the same time, so 72 match pages never trigger 72 separate API calls.
 */

import { cache } from "react";
import { fetchAllLiveData } from "./fetchAllLiveData";

export const getCachedLiveData = cache(fetchAllLiveData);
