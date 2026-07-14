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

type DisplayableGoalEvent = {
  playerName: string;
  minute?: number | null;
  stoppageMinute?: number | null;
  stoppageTime?: number | null;
  minuteLabel?: string | null;
  displayMinute?: string | null;
  isOwnGoal?: boolean;
  isPenalty?: boolean;
  eventType?: string;
  type?: string;
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

/** Canonical, human-facing minute label shared by archive and snapshot cards. */
export function formatEventDisplayMinute(event: Pick<DisplayableGoalEvent, "minute" | "stoppageMinute" | "stoppageTime" | "minuteLabel" | "displayMinute">): string {
  const supplied = event.displayMinute ?? event.minuteLabel;
  if (supplied) return supplied.endsWith("'") ? supplied : `${supplied}'`;
  if (event.minute == null) return "";
  const stoppage = event.stoppageMinute ?? event.stoppageTime;
  return `${event.minute}${stoppage ? `+${stoppage}` : ""}'`;
}

/** Shared scorer-card formatter. Never truncates a canonical display minute or player name. */
export function formatGoalEventDisplay(event: DisplayableGoalEvent): string {
  const minute = formatEventDisplayMinute(event);
  const ownGoal = event.isOwnGoal || event.eventType === "own_goal" || event.type === "OWN_GOAL";
  const penalty = event.isPenalty || event.eventType === "penalty_goal" || event.type === "PENALTY_GOAL";
  return `${minute ? `${minute} ` : ""}${event.playerName}${ownGoal ? " (OG)" : penalty ? " (P)" : ""}`;
}

export function formatCanonicalGoalEvents(events: readonly CanonicalArchiveEvent[]): string | null {
  const goals = events.filter((event) =>
    event.eventType === "goal" || event.eventType === "own_goal" || event.eventType === "penalty_goal",
  );
  if (goals.length === 0) return null;

  return goals.map(formatGoalEventDisplay).join(" · ");
}
