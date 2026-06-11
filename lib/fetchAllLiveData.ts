/**
 * Bulk live-data fetcher — one API call per revalidation window instead of
 * one per mapped match.  Uses the football-data.org competition/matches
 * endpoint and returns only the entries we have internally mapped.
 *
 * Returns an empty Map on any error or missing key; callers degrade gracefully.
 */

import { MATCHES } from "./matches";
import type { LiveMatchData, LiveMatchStatus } from "./liveMatchData";

const BASE = "https://api.football-data.org/v4";
const COMPETITION_ID = 2000; // FIFA World Cup

const KNOWN_STATUSES: readonly string[] = [
  "SCHEDULED", "TIMED", "IN_PLAY", "PAUSED", "FINISHED", "POSTPONED", "CANCELLED",
];
const KNOWN_WINNERS = ["HOME_TEAM", "AWAY_TEAM", "DRAW"];

export async function fetchAllLiveData(): Promise<Map<number, LiveMatchData>> {
  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) return new Map();

  const relevantIds = new Set(
    MATCHES
      .filter((m) => m.providerIds?.footballData)
      .map((m) => m.providerIds!.footballData!),
  );
  if (relevantIds.size === 0) return new Map();

  try {
    const res = await fetch(`${BASE}/competitions/${COMPETITION_ID}/matches`, {
      headers: { "X-Auth-Token": key },
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      console.warn(`[fetchAllLiveData] HTTP ${res.status}`);
      return new Map();
    }

    const data = await res.json();
    const raw: unknown[] = Array.isArray(data?.matches) ? data.matches : [];
    const result = new Map<number, LiveMatchData>();
    const now = new Date().toISOString();

    for (const entry of raw as Record<string, unknown>[]) {
      const id = typeof entry.id === "number" ? entry.id : null;
      if (!id || !relevantIds.has(id)) continue;

      const rawStatus = typeof entry.status === "string" ? entry.status : "";
      const status: LiveMatchStatus = KNOWN_STATUSES.includes(rawStatus)
        ? (rawStatus as LiveMatchStatus)
        : "UNKNOWN";

      const score = (entry.score as Record<string, unknown>) ?? {};
      const fullTime = (score.fullTime as Record<string, unknown>) ?? {};
      const homeScore = typeof fullTime.home === "number" ? fullTime.home : null;
      const awayScore = typeof fullTime.away === "number" ? fullTime.away : null;

      const rawWinner = typeof score.winner === "string" ? score.winner : null;
      const winner =
        rawWinner && KNOWN_WINNERS.includes(rawWinner)
          ? (rawWinner as "HOME_TEAM" | "AWAY_TEAM" | "DRAW")
          : null;

      result.set(id, {
        provider: "football-data.org",
        providerMatchId: id,
        status,
        homeScore,
        awayScore,
        winner,
        utcDate: typeof entry.utcDate === "string" ? entry.utcDate : undefined,
        lastSyncedAt: now,
        rawStatus,
      });
    }

    return result;
  } catch (err) {
    console.warn("[fetchAllLiveData] error:", err);
    return new Map();
  }
}
