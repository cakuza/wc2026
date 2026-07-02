import { getLiveRefreshPolicy } from "./liveRefreshPolicy";
import type { RefreshCandidate } from "./liveRefreshPolicy";
import type { TournamentLiveSnapshot } from "./liveSnapshot";

export type CdnTtl = { maxAge: number; swr: number };

/**
 * Select Vercel CDN TTL for the /api/live-snapshot response based on snapshot
 * state. The caller sets `Vercel-CDN-Cache-Control` with these values so
 * Vercel's edge collapses concurrent polls into one Function invocation per
 * TTL window, while browsers always revalidate (Cache-Control: max-age=0).
 *
 * Tiers:
 *   fallback  (isFallback=true)                  →  5 s / SWR  0 s
 *   active    (LIVE / HALFTIME / SYNCING / near)  → 10 s / SWR 10 s
 *   idle      (no imminent match)                 → 60 s / SWR 30 s
 */
export function snapshotCdnTtl(
  snapshot: Pick<TournamentLiveSnapshot, "isFallback" | "matches">,
): CdnTtl {
  // Degraded cold-start fallback — valid data could arrive on the next pass;
  // do not lock the CDN into a stale unknown state for long.
  if (snapshot.isFallback) return { maxAge: 5, swr: 0 };

  const candidates: RefreshCandidate[] = Object.values(snapshot.matches).map((m) => ({
    match: m.match,
    status: m.status,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    live: m.live,
    goalEventCompleteness: m.goalEventCompleteness,
    providerUpdatedAt: m.providerUpdatedAt,
  }));

  const { reason } = getLiveRefreshPolicy(candidates);

  // Active or near-match: short TTL so goal events and status changes propagate
  // within the same window as the underlying snapshot revalidation (~10 s live).
  if (reason === "live" || reason === "near-match") return { maxAge: 10, swr: 10 };

  // Idle: longer TTL stays within the idle snapshot revalidation cadence (90 s).
  return { maxAge: 60, swr: 30 };
}
