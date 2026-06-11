// Server-side fetcher for live match score/status/events from football-data.org v4.
// No invented data — if the provider doesn't expose a field, we leave it out.

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
  teamName: string | null;
  playerName: string | null;
  assistName?: string | null;
  detail?: string | null; // for substitutions: the player coming off
};

export type LiveMatchData = {
  provider: "football-data.org";
  providerMatchId: number;
  status: LiveMatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  winner: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
  utcDate?: string;
  lastSyncedAt: string;
  rawStatus?: string;
  eventDataAvailable: boolean;
  goals?: LiveMatchEvent[];
  bookings?: LiveMatchEvent[];
  substitutions?: LiveMatchEvent[];
};

const KNOWN_WINNERS = ["HOME_TEAM", "AWAY_TEAM", "DRAW"];

function mapGoalType(t: unknown): LiveMatchEvent["type"] {
  switch (t) {
    case "NORMAL": return "GOAL";
    case "OWN_GOAL": return "OWN_GOAL";
    case "PENALTY": return "PENALTY_GOAL";
    default: return "UNKNOWN";
  }
}

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

function parseGoals(raw: unknown[]): LiveMatchEvent[] {
  return raw.map((g) => {
    const gObj = g as Record<string, unknown>;
    const scorer = gObj.scorer as Record<string, unknown> | null | undefined;
    const assist = gObj.assist as Record<string, unknown> | null | undefined;
    const team = gObj.team as Record<string, unknown> | null | undefined;
    return {
      type: mapGoalType(gObj.type),
      minute: safeInt(gObj.minute),
      teamName: safeStr(team?.name),
      playerName: safeStr(scorer?.name),
      assistName: safeStr(assist?.name),
    };
  });
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

  try {
    const res = await fetch(`${BASE}/matches/${providerMatchId}`, {
      headers: { "X-Auth-Token": key },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.warn(`[liveMatchData] /matches/${providerMatchId} → HTTP ${res.status}`);
      return null;
    }

    const data = await res.json();

    const rawStatus: string | undefined = data?.status;
    const status: LiveMatchStatus = KNOWN_STATUSES.includes(rawStatus ?? "")
      ? (rawStatus as LiveMatchStatus)
      : "UNKNOWN";

    const fullTime = data?.score?.fullTime ?? {};
    const homeScore = typeof fullTime.home === "number" ? fullTime.home : null;
    const awayScore = typeof fullTime.away === "number" ? fullTime.away : null;

    const rawWinner: string | null = data?.score?.winner ?? null;
    const winner = KNOWN_WINNERS.includes(rawWinner ?? "")
      ? (rawWinner as "HOME_TEAM" | "AWAY_TEAM" | "DRAW")
      : null;

    const rawGoals = Array.isArray(data?.goals) ? data.goals as unknown[] : null;
    const rawBookings = Array.isArray(data?.bookings) ? data.bookings as unknown[] : null;
    const rawSubs = Array.isArray(data?.substitutions) ? data.substitutions as unknown[] : null;
    const eventDataAvailable = rawGoals !== null;

    return {
      provider: "football-data.org",
      providerMatchId,
      status,
      homeScore,
      awayScore,
      winner,
      utcDate: typeof data?.utcDate === "string" ? data.utcDate : undefined,
      lastSyncedAt: new Date().toISOString(),
      rawStatus,
      eventDataAvailable,
      goals: rawGoals ? parseGoals(rawGoals) : undefined,
      bookings: rawBookings ? parseBookings(rawBookings) : undefined,
      substitutions: rawSubs ? parseSubs(rawSubs) : undefined,
    };
  } catch (err) {
    console.warn(`[liveMatchData] fetch error for match ${providerMatchId}:`, err);
    return null;
  }
}
