import { matchUtcDate, type Match } from "./matches";
import type { SnapshotMatchStatus } from "./liveSnapshot";
import type { GoalEventCompleteness } from "./goalEventCompleteness";
import type { LiveMatchData } from "./liveMatchData";
import { buildKnockoutResolution } from "./knockoutResolution";
import { isKnockoutMatch } from "./participant-resolution";

export type RefreshCandidate = {
  match: Match;
  status: SnapshotMatchStatus;
  providerUpdatedAt?: string | null;
  goalEventCompleteness?: GoalEventCompleteness;
  live?: LiveMatchData | null;
  homeScore?: number | null;
  awayScore?: number | null;
};

export type LiveRefreshPolicy = {
  intervalMs: number | null;
  reason: "live" | "near-match" | "idle";
};

const LIVE_INTERVAL_MS = 13_000;
const NEAR_MATCH_INTERVAL_MS = 60_000;
const NEAR_MATCH_WINDOW_MS = 2 * 60 * 60 * 1000;
const POST_FINAL_ENRICHMENT_WINDOW_MS = 6 * 60 * 60 * 1000;
const MAX_CANONICAL_RECONCILIATION_WINDOW_MS = 48 * 60 * 60 * 1000;

function isCanonicalComplete(item: RefreshCandidate, resolvedParticipants: any): boolean {
  if (item.status !== "FINISHED") return false;
  if (item.homeScore === null || item.homeScore === undefined || item.awayScore === null || item.awayScore === undefined) return false;
  if (!item.live) return false;
  if (!item.live.winner) return false;
  if (!item.live.scoreDuration) return false;

  if (item.live.scoreDuration === "PENALTY_SHOOTOUT") {
    const p = item.live.penaltyShootoutScore;
    if (!p || p.home === null || p.home === undefined || p.away === null || p.away === undefined) return false;
  }

  // Knockout match bracket propagation check
  if (isKnockoutMatch(item.match)) {
    const resolved = resolvedParticipants[item.match.matchNumber];
    if (!resolved || !resolved.home?.teamKey || !resolved.away?.teamKey) return false;
  }

  return true;
}

export function getLiveRefreshPolicy(
  candidates: RefreshCandidate[],
  now: Date = new Date(),
): LiveRefreshPolicy {
  if (candidates.some((item) => item.status === "LIVE" || item.status === "HALFTIME" || item.status === "SYNCING")) {
    return { intervalMs: LIVE_INTERVAL_MS, reason: "live" };
  }

  // Construct matches record for buildKnockoutResolution
  const matchesRecord: Record<string, any> = {};
  candidates.forEach((c, idx) => {
    matchesRecord[idx] = c;
  });
  const resolvedParticipants = buildKnockoutResolution(matchesRecord);

  const nowMs = now.getTime();
  const nearMatch = candidates.some((item) => {
    // 1. Not finished:
    if (item.status !== "FINISHED") {
      const kickoff = matchUtcDate(item.match).getTime();
      // Eligible if kickoff is within 2 hours in the future, or kickoff is in the past
      return nowMs >= kickoff - NEAR_MATCH_WINDOW_MS;
    }

    // 2. Finished, but canonical data is incomplete:
    if (!isCanonicalComplete(item, resolvedParticipants)) {
      const referenceTime = matchUtcDate(item.match).getTime();
      const ageMs = nowMs - referenceTime;
      const isWithinLimit = ageMs <= MAX_CANONICAL_RECONCILIATION_WINDOW_MS;
      if (!isWithinLimit) {
        const matchId = "matchNumber" in item.match ? item.match.matchNumber : `${item.match.homeKey}-vs-${item.match.awayKey}`;
        console.warn(
          `[liveRefreshPolicy] Match ${matchId} finished but incomplete ` +
          `exceeding max reconciliation safety window (48h). Stopping refreshes.`
        );
      }
      return isWithinLimit;
    }

    // 3. Finished and canonical data is complete, but scorer details are incomplete:
    if (item.goalEventCompleteness?.isGoalEventDataComplete === false) {
      const referenceTime = item.providerUpdatedAt ? new Date(item.providerUpdatedAt).getTime() : matchUtcDate(item.match).getTime();
      if (Number.isFinite(referenceTime)) {
        return Math.abs(nowMs - referenceTime) <= POST_FINAL_ENRICHMENT_WINDOW_MS;
      }
    }

    return false;
  });

  if (nearMatch) return { intervalMs: NEAR_MATCH_INTERVAL_MS, reason: "near-match" };
  return { intervalMs: null, reason: "idle" };
}
