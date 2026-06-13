import type { LiveMatchEvent } from "./liveMatchData";

export type GoalEventCompleteness = {
  expectedGoalCount: number;
  normalizedGoalEventCount: number;
  missingGoalEventCount: number;
  isGoalEventDataComplete: boolean;
  completenessReason: "complete" | "score-unavailable" | "event-data-unavailable" | "missing-goal-events";
};

export function isScoringEvent(event: LiveMatchEvent): boolean {
  return event.type === "GOAL" || event.type === "PENALTY_GOAL" || event.type === "OWN_GOAL";
}

export function getGoalEventCompleteness({
  homeScore,
  awayScore,
  goals,
  eventDataAvailable,
}: {
  homeScore: number | null;
  awayScore: number | null;
  goals?: LiveMatchEvent[];
  eventDataAvailable: boolean;
}): GoalEventCompleteness {
  if (homeScore === null || awayScore === null) {
    return {
      expectedGoalCount: 0,
      normalizedGoalEventCount: goals?.filter(isScoringEvent).length ?? 0,
      missingGoalEventCount: 0,
      isGoalEventDataComplete: false,
      completenessReason: "score-unavailable",
    };
  }

  const expectedGoalCount = Math.max(0, homeScore + awayScore);
  const normalizedGoalEventCount = goals?.filter(isScoringEvent).length ?? 0;
  const missingGoalEventCount = Math.max(0, expectedGoalCount - normalizedGoalEventCount);

  if (!eventDataAvailable && expectedGoalCount > 0) {
    return {
      expectedGoalCount,
      normalizedGoalEventCount,
      missingGoalEventCount: expectedGoalCount,
      isGoalEventDataComplete: false,
      completenessReason: "event-data-unavailable",
    };
  }

  return {
    expectedGoalCount,
    normalizedGoalEventCount,
    missingGoalEventCount,
    isGoalEventDataComplete: missingGoalEventCount === 0,
    completenessReason: missingGoalEventCount === 0 ? "complete" : "missing-goal-events",
  };
}

export function missingScorerDetailText(missingGoalEventCount: number): string | null {
  if (missingGoalEventCount <= 0) return null;
  return `${missingGoalEventCount} scorer detail${missingGoalEventCount === 1 ? " is" : "s are"} still syncing.`;
}
