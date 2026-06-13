import { matchUtcDate, type Match } from "./matches";
import type { SnapshotMatchStatus } from "./liveSnapshot";

export type RefreshCandidate = {
  match: Match;
  status: SnapshotMatchStatus;
  providerUpdatedAt?: string | null;
};

export type LiveRefreshPolicy = {
  intervalMs: number | null;
  reason: "live" | "near-match" | "idle";
};

const LIVE_INTERVAL_MS = 25_000;
const NEAR_MATCH_INTERVAL_MS = 60_000;
const NEAR_MATCH_WINDOW_MS = 2 * 60 * 60 * 1000;

export function getLiveRefreshPolicy(
  candidates: RefreshCandidate[],
  now: Date = new Date(),
): LiveRefreshPolicy {
  if (candidates.some((item) => item.status === "LIVE" || item.status === "HALFTIME" || item.status === "SYNCING")) {
    return { intervalMs: LIVE_INTERVAL_MS, reason: "live" };
  }

  const nowMs = now.getTime();
  const nearMatch = candidates.some((item) => {
    const kickoff = matchUtcDate(item.match).getTime();
    if (Math.abs(kickoff - nowMs) <= NEAR_MATCH_WINDOW_MS) return true;

    if (item.status !== "FINISHED" || !item.providerUpdatedAt) return false;
    const updated = new Date(item.providerUpdatedAt).getTime();
    return Number.isFinite(updated) && Math.abs(nowMs - updated) <= NEAR_MATCH_WINDOW_MS;
  });

  if (nearMatch) return { intervalMs: NEAR_MATCH_INTERVAL_MS, reason: "near-match" };
  return { intervalMs: null, reason: "idle" };
}
