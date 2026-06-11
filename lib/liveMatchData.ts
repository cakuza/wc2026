// Server-side fetcher for live match score/status from football-data.org v4.
// Score/status only — no events, no invented data.

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
};

const KNOWN_WINNERS = ["HOME_TEAM", "AWAY_TEAM", "DRAW"];

/**
 * Fetch normalized score/status for a single match from football-data.org.
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
    };
  } catch (err) {
    console.warn(`[liveMatchData] fetch error for match ${providerMatchId}:`, err);
    return null;
  }
}
