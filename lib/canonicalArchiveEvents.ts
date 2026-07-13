type CanonicalArchiveEvent = {
  matchId: string;
  eventType: string;
  minute?: number;
  stoppageMinute?: number;
  teamKey?: string;
  playerName: string;
  assistPlayerName?: string;
  relatedPlayerName?: string;
};

function isCanonicalArchiveEvent(value: unknown): value is CanonicalArchiveEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as Record<string, unknown>;
  return typeof event.matchId === "string" &&
    typeof event.eventType === "string" &&
    typeof event.playerName === "string";
}

/** Shared canonical archive boundary for archived match consumers. */
export function getCanonicalArchiveEventsForMatch(events: unknown, matchId: string): CanonicalArchiveEvent[] {
  if (!Array.isArray(events)) return [];
  return events.filter(isCanonicalArchiveEvent).filter((event) => event.matchId === matchId);
}

export function formatCanonicalGoalEvents(events: readonly CanonicalArchiveEvent[]): string | null {
  const goals = events.filter((event) =>
    event.eventType === "goal" || event.eventType === "own_goal" || event.eventType === "penalty_goal",
  );
  if (goals.length === 0) return null;

  return goals.map((event) => {
    const minute = event.stoppageMinute ? `${event.minute}+${event.stoppageMinute}'` : `${event.minute}'`;
    const suffix = event.eventType === "own_goal" ? " (OG)" : event.eventType === "penalty_goal" ? " (P)" : "";
    return `${minute} ${event.playerName}${suffix}`.trim();
  }).join(" · ");
}
