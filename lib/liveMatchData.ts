// Server-side fetcher for live match score/status/events from football-data.org v4.
// No invented data — if the provider doesn't expose a field, we leave it out.

import { providerFetch } from "./providerFetch";
import { getGoalEventCompleteness, type GoalEventCompleteness } from "./goalEventCompleteness";
import { parseFootballDataGoals } from "./footballDataEventNormalizer";
import { parseFootballDataScore, type PeriodScore } from "./footballDataScore";
import type { KnockoutStage } from "./matches";

const BASE = "https://api.football-data.org/v4";

export type LiveMatchStatus =
  | "SCHEDULED"
  | "TIMED"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED"
  | "POSTPONED"
  | "CANCELLED"
  | "UNKNOWN";

const KNOWN_STATUSES: readonly string[] = [
  "SCHEDULED", "TIMED", "IN_PLAY", "PAUSED", "FINISHED", "POSTPONED", "CANCELLED",
];

export type LiveMatchEvent = {
  type: "GOAL" | "OWN_GOAL" | "PENALTY_GOAL" | "YELLOW_CARD" | "RED_CARD" | "SUBSTITUTION" | "UNKNOWN";
  minute: number | null;
  stoppageTime?: number | null;
  minuteLabel?: string;
  teamName: string | null;
  playerTeamName?: string | null;
  playerName: string | null;
  isOwnGoal?: boolean;
  assistName?: string | null;
  detail?: string | null; // for substitutions: the player coming off
  providerEventId?: string | null;
};

export type LiveMatchData = {
  provider: "football-data.org";
  providerMatchId: number;
  status: LiveMatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  winner: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
  stage?: KnockoutStage | "group" | null;
  rawStage?: string | null;
  scoreDuration?: string | null;
  regularTimeScore?: PeriodScore | null;
  extraTimeScore?: PeriodScore | null;
  penaltyShootoutScore?: PeriodScore | null;
  utcDate?: string;
  lastSyncedAt: string;
  rawStatus?: string;
  eventDataAvailable: boolean;
  goalEventCompleteness?: GoalEventCompleteness;
  goals?: LiveMatchEvent[];
  bookings?: LiveMatchEvent[];
  substitutions?: LiveMatchEvent[];
};

function mapCardType(t: unknown): LiveMatchEvent["type"] {
  switch (t) {
    case "YELLOW": return "YELLOW_CARD";
    case "RED": return "RED_CARD";
    default: return "UNKNOWN";
  }
}

function safeStr(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

function safeInt(v: unknown): number | null {
  return typeof v === "number" ? v : null;
}

function parseBookings(raw: unknown[]): LiveMatchEvent[] {
  return raw.map((b) => {
    const bObj = b as Record<string, unknown>;
    const player = bObj.player as Record<string, unknown> | null | undefined;
    const team = bObj.team as Record<string, unknown> | null | undefined;
    return {
      type: mapCardType(bObj.card),
      minute: safeInt(bObj.minute),
      teamName: safeStr(team?.name),
      playerName: safeStr(player?.name),
    };
  });
}

function parseSubs(raw: unknown[]): LiveMatchEvent[] {
  return raw.map((s) => {
    const sObj = s as Record<string, unknown>;
    const playerIn = sObj.playerIn as Record<string, unknown> | null | undefined;
    const playerOut = sObj.playerOut as Record<string, unknown> | null | undefined;
    const team = sObj.team as Record<string, unknown> | null | undefined;
    return {
      type: "SUBSTITUTION" as const,
      minute: safeInt(sObj.minute),
      teamName: safeStr(team?.name),
      playerName: safeStr(playerIn?.name),
      detail: safeStr(playerOut?.name),
    };
  });
}

/**
 * Fetch normalized score/status/events for a single match from football-data.org.
 * Returns null if the match has no provider mapping, the API key is missing,
 * or the request fails — callers should fall back to scheduled fixture data.
 */
export async function fetchLiveMatchData(
  providerMatchId: number | null | undefined
): Promise<LiveMatchData | null> {
  if (!providerMatchId) return null;

  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[liveMatchData] FOOTBALL_DATA_API_KEY is not set — skipping live data fetch");
    }
    return null;
  }

  const fetchResult = await providerFetch(
    `${BASE}/matches/${providerMatchId}`,
    key,
    { revalidate: 30 },
  );
  if (!fetchResult.ok) return null;

  try {
    const data = fetchResult.data as Record<string, unknown>;

    const rawStatus: string | undefined = data?.status as string | undefined;
    const status: LiveMatchStatus = KNOWN_STATUSES.includes(rawStatus ?? "")
      ? (rawStatus as LiveMatchStatus)
      : "UNKNOWN";

    const parsedScore = parseFootballDataScore(data);
    const { homeScore, awayScore, winner } = parsedScore;

    const goals = parseFootballDataGoals(data, providerMatchId);
    const rawBookings = Array.isArray(data.bookings) ? (data.bookings as unknown[]) : null;
    const rawSubs = Array.isArray(data.substitutions) ? (data.substitutions as unknown[]) : null;
    const eventDataAvailable = goals !== undefined;
    const goalEventCompleteness = getGoalEventCompleteness({
      homeScore,
      awayScore,
      goals,
      eventDataAvailable,
    });

    return {
      provider: "football-data.org",
      providerMatchId,
      status,
      homeScore,
      awayScore,
      winner,
      stage: parsedScore.stage,
      rawStage: parsedScore.rawStage,
      scoreDuration: parsedScore.duration,
      regularTimeScore: parsedScore.regularTimeScore,
      extraTimeScore: parsedScore.extraTimeScore,
      penaltyShootoutScore: parsedScore.penaltyShootoutScore,
      utcDate: typeof data.utcDate === "string" ? data.utcDate : undefined,
      lastSyncedAt: new Date().toISOString(),
      rawStatus,
      eventDataAvailable,
      goalEventCompleteness,
      goals,
      bookings: rawBookings ? parseBookings(rawBookings) : undefined,
      substitutions: rawSubs ? parseSubs(rawSubs) : undefined,
    };
  } catch (err) {
    console.warn(`[liveMatchData] fetch error for match ${providerMatchId}:`, err);
    return null;
  }
}
