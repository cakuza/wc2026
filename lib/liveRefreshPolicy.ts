import { matchUtcDate, type Match } from "./matches";
import type { SnapshotMatchStatus } from "./liveSnapshot";
import type { GoalEventCompleteness } from "./goalEventCompleteness";

export type RefreshCandidate = {
  match: Match;
  status: SnapshotMatchStatus;
  providerUpdatedAt?: string | null;
  goalEventCompleteness?: GoalEventCompleteness;
};

export type LiveRefreshPolicy = {
  intervalMs: number | null;
  reason: "live" | "near-match" | "idle";
};

const LIVE_INTERVAL_MS = 13_000;
const NEAR_MATCH_INTERVAL_MS = 60_000;
const NEAR_MATCH_WINDOW_MS = 2 * 60 * 60 * 1000;
const POST_FINAL_ENRICHMENT_WINDOW_MS = 6 * 60 * 60 * 1000;

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
    if (!Number.isFinite(updated)) return false;
    const windowMs = item.goalEventCompleteness?.isGoalEventDataComplete === false
      ? POST_FINAL_ENRICHMENT_WINDOW_MS
      : NEAR_MATCH_WINDOW_MS;
    return Math.abs(nowMs - updated) <= windowMs;
  });

  if (nearMatch) return { intervalMs: NEAR_MATCH_INTERVAL_MS, reason: "near-match" };
  return { intervalMs: null, reason: "idle" };
}
