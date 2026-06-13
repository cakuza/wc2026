/**
 * Bulk live-data fetcher — one API call per revalidation window instead of
 * one per mapped match.  Uses the football-data.org competition/matches
 * endpoint and returns only the entries we have internally mapped.
 *
 * Returns an empty Map on any error, 429, or missing key; callers degrade gracefully.
 */

import { MATCHES } from "./matches";
import type { LiveMatchData, LiveMatchEvent, LiveMatchStatus } from "./liveMatchData";
import { providerFetch } from "./providerFetch";
import { getGoalEventCompleteness } from "./goalEventCompleteness";
import { parseFootballDataGoals } from "./footballDataEventNormalizer";

const BASE = "https://api.football-data.org/v4";
const COMPETITION_ID = 2000; // FIFA World Cup

const KNOWN_STATUSES: readonly string[] = [
  "SCHEDULED", "TIMED", "IN_PLAY", "PAUSED", "FINISHED", "POSTPONED", "CANCELLED",
];
const KNOWN_WINNERS = ["HOME_TEAM", "AWAY_TEAM", "DRAW"];

function safeStr(v: unknown): string | null {
  return typeof v === "string" && (v as string).length > 0 ? (v as string) : null;
}

function safeInt(v: unknown): number | null {
  return typeof v === "number" ? (v as number) : null;
}

function mapCardType(t: unknown): LiveMatchEvent["type"] {
  switch (t) {
    case "YELLOW": return "YELLOW_CARD";
    case "RED": return "RED_CARD";
    default: return "UNKNOWN";
  }
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

export async function fetchAllLiveData(): Promise<Map<number, LiveMatchData>> {
  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) return new Map();

  const relevantIds = new Set(
    MATCHES
      .filter((m) => m.providerIds?.footballData)
      .map((m) => m.providerIds!.footballData!),
  );
  if (relevantIds.size === 0) return new Map();

  const fetchResult = await providerFetch(
    `${BASE}/competitions/${COMPETITION_ID}/matches`,
    key,
    { revalidate: 30 },
  );
  if (!fetchResult.ok) return new Map();

  const data = fetchResult.data as Record<string, unknown>;
  const raw: unknown[] = Array.isArray(data?.matches) ? (data.matches as unknown[]) : [];
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

    const goals = parseFootballDataGoals(entry, id);
    const rawBookings = Array.isArray(entry.bookings) ? (entry.bookings as unknown[]) : null;
    const rawSubs = Array.isArray(entry.substitutions) ? (entry.substitutions as unknown[]) : null;
    const eventDataAvailable = goals !== undefined;
    const goalEventCompleteness = getGoalEventCompleteness({
      homeScore,
      awayScore,
      goals,
      eventDataAvailable,
    });

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
      eventDataAvailable,
      goalEventCompleteness,
      goals,
      bookings: rawBookings ? parseBookings(rawBookings) : undefined,
      substitutions: rawSubs ? parseSubs(rawSubs) : undefined,
    });
  }

  return result;
}
