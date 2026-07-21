import { MATCHES, matchSlug, matchUtcDate, type KnockoutMatch, type Match } from "./matches";
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

const LIVE_INTERVAL_MS = 30_000;
const NEAR_MATCH_INTERVAL_MS = 120_000;
const NEAR_MATCH_WINDOW_MS = 2 * 60 * 60 * 1000;
const POST_FINAL_ENRICHMENT_WINDOW_MS = 6 * 60 * 60 * 1000;
const MAX_CANONICAL_RECONCILIATION_WINDOW_MS = 48 * 60 * 60 * 1000;

function dependentSlotsFor(match: KnockoutMatch): Array<{ matchNumber: number; side: "home" | "away" }> {
  const slots: Array<{ matchNumber: number; side: "home" | "away" }> = [];
  for (const candidate of MATCHES) {
    if (!isKnockoutMatch(candidate)) continue;
    if (
      (candidate.homeSlot.kind === "winnerOf" || candidate.homeSlot.kind === "loserOf") &&
      candidate.homeSlot.matchNumber === match.matchNumber
    ) {
      slots.push({ matchNumber: candidate.matchNumber, side: "home" });
    }
    if (
      (candidate.awaySlot.kind === "winnerOf" || candidate.awaySlot.kind === "loserOf") &&
      candidate.awaySlot.matchNumber === match.matchNumber
    ) {
      slots.push({ matchNumber: candidate.matchNumber, side: "away" });
    }
  }
  return slots;
}

export function isCanonicalComplete(item: RefreshCandidate, resolvedParticipants: ReturnType<typeof buildKnockoutResolution>): boolean {
  if (item.status !== "FINISHED") return false;
  if (item.homeScore === null || item.homeScore === undefined || item.awayScore === null || item.awayScore === undefined) return false;
  if (!item.live) return false;
  if (!item.live.winner) return false;
  if (!item.live.scoreDuration) return false;

  if (item.live.scoreDuration === "PENALTY_SHOOTOUT") {
    const p = item.live.penaltyShootoutScore;
    if (!p || p.home === null || p.home === undefined || p.away === null || p.away === undefined) return false;
  }

  if (isKnockoutMatch(item.match)) {
    const resolved = resolvedParticipants[item.match.matchNumber];
    if (!resolved || !resolved.home?.teamKey || !resolved.away?.teamKey) return false;

    for (const slot of dependentSlotsFor(item.match)) {
      if (!resolvedParticipants[slot.matchNumber]?.[slot.side]?.teamKey) return false;
    }
  }

  return true;
}

export const LIVE_REFRESH_START_BEFORE_MS = 15 * 60 * 1000;
// The owner policy is deliberately bounded: start fifteen minutes before
// kickoff and stop three hours after it. Nothing continuously refreshes a
// provider-backed page outside that match window.
export const LIVE_REFRESH_STOP_AFTER_MS = 180 * 60 * 1000;

export function getLiveRefreshPolicy(
  candidates: RefreshCandidate[],
  now: Date = new Date(),
): LiveRefreshPolicy {
  const nowMs = now.getTime();

  // Filter candidates to only those within the strict match window
  const activeCandidates = candidates.filter((item) => {
    const kickoff = matchUtcDate(item.match).getTime();
    return nowMs >= kickoff - LIVE_REFRESH_START_BEFORE_MS && nowMs <= kickoff + LIVE_REFRESH_STOP_AFTER_MS;
  });

  if (activeCandidates.length === 0) {
    return { intervalMs: null, reason: "idle" };
  }

  // If any active candidate is currently LIVE, HALFTIME, or SYNCING, use the aggressive interval
  if (activeCandidates.some((item) => item.status === "LIVE" || item.status === "HALFTIME" || item.status === "SYNCING")) {
    return { intervalMs: LIVE_INTERVAL_MS, reason: "live" };
  }

  const matchesRecord: Record<string, any> = {};
  candidates.forEach((c) => {
    matchesRecord[matchSlug(c.match)] = {
      match: c.match,
      homeScore: c.homeScore ?? c.live?.homeScore,
      awayScore: c.awayScore ?? c.live?.awayScore,
      status: c.status,
      live: c.live,
    };
  });
  const resolvedParticipants = buildKnockoutResolution(matchesRecord);

  const nearMatch = activeCandidates.some((item) => {
    // 1. Not finished:
    if (item.status !== "FINISHED") {
      return true;
    }

    // 2. Finished, but canonical data is incomplete:
    if (!isCanonicalComplete(item, resolvedParticipants)) {
      return true;
    }

    // 3. Finished and canonical data is complete, but scorer details are incomplete:
    if (item.goalEventCompleteness?.isGoalEventDataComplete === false) {
      return true;
    }

    return false;
  });

  if (nearMatch) return { intervalMs: NEAR_MATCH_INTERVAL_MS, reason: "near-match" };
  return { intervalMs: null, reason: "idle" };
}
