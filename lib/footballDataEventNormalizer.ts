import type { LiveMatchEvent } from "./liveMatchData";

type RawObject = Record<string, unknown>;

function asObj(value: unknown): RawObject | null {
  return value && typeof value === "object" ? value as RawObject : null;
}

function safeStr(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function safeInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === "string" && /^\d+$/.test(value.trim())) return parseInt(value, 10);
  return null;
}

function nestedName(value: unknown): string | null {
  const obj = asObj(value);
  if (!obj) return safeStr(value);
  return safeStr(obj.name) ?? safeStr(obj.fullName) ?? safeStr(obj.displayName) ?? safeStr(obj.shortName);
}

function firstNameFrom(raw: RawObject, keys: string[]): string | null {
  for (const key of keys) {
    const value = raw[key];
    const direct = nestedName(value);
    if (direct) return direct;

    if (Array.isArray(value)) {
      for (const item of value) {
        const name = nestedName(item);
        if (name) return name;
      }
    }
  }
  return null;
}

function firstObjFrom(raw: RawObject, keys: string[]): RawObject | null {
  for (const key of keys) {
    const obj = asObj(raw[key]);
    if (obj) return obj;
    const arr = raw[key];
    if (Array.isArray(arr)) {
      const found = arr.map(asObj).find(Boolean);
      if (found) return found;
    }
  }
  return null;
}

function rawLabel(raw: RawObject): string {
  return [
    raw.type,
    raw.subType,
    raw.subtype,
    raw.detail,
    raw.eventType,
    raw.incidentType,
    raw.action,
  ]
    .map((value) => String(value ?? "").toLowerCase())
    .join(" ");
}

function scoringType(raw: RawObject): LiveMatchEvent["type"] | null {
  const label = rawLabel(raw).replace(/[_-]/g, " ");
  if (label.includes("shootout")) return null;
  if (label.includes("penalty") && label.includes("goal")) return "PENALTY_GOAL";
  if (label.includes("own") && label.includes("goal")) return "OWN_GOAL";
  if (label.includes("goal")) return "GOAL";
  if (String(raw.type ?? "").toUpperCase() === "PENALTY") return "PENALTY_GOAL";
  if (String(raw.type ?? "").toUpperCase() === "OWN_GOAL") return "OWN_GOAL";
  if (String(raw.type ?? "").toUpperCase() === "NORMAL") return "GOAL";
  return null;
}

function minuteLabel(minute: number | null, stoppageTime: number | null): string | undefined {
  if (minute === null) return undefined;
  return `${minute}${stoppageTime && stoppageTime > 0 ? `+${stoppageTime}` : ""}'`;
}

function eventKey(matchId: number, event: LiveMatchEvent): string {
  if (event.providerEventId) return `id:${event.providerEventId}`;
  return [
    "compound",
    matchId,
    event.teamName ?? "",
    event.minute ?? "",
    event.stoppageTime ?? "",
    event.type,
    event.playerName ?? "pending",
  ].join("|").toLowerCase();
}

function normalizeScoringEvent(rawValue: unknown): LiveMatchEvent | null {
  const raw = asObj(rawValue);
  if (!raw) return null;
  const type = scoringType(raw);
  if (!type) return null;

  const minute =
    safeInt(raw.minute) ??
    safeInt(raw.elapsed) ??
    safeInt(raw.time) ??
    safeInt(asObj(raw.clock)?.minute) ??
    safeInt(asObj(raw.matchTime)?.minute);
  const stoppageTime =
    safeInt(raw.stoppageTime) ??
    safeInt(raw.extraMinute) ??
    safeInt(asObj(raw.clock)?.stoppageTime) ??
    safeInt(asObj(raw.matchTime)?.stoppageTime);
  const team = firstObjFrom(raw, ["team", "club", "competitor"]);
  const scorerName = firstNameFrom(raw, [
    "scorer",
    "player",
    "athlete",
    "competitor",
    "playerIn",
    "participants",
    "athletesInvolved",
  ]);
  const assistName = firstNameFrom(raw, ["assist", "assister"]);

  return {
    type,
    minute,
    stoppageTime,
    minuteLabel: minuteLabel(minute, stoppageTime),
    teamName: nestedName(team),
    playerTeamName: nestedName(firstObjFrom(raw, ["playerTeam", "scoringTeam"])) ?? nestedName(team),
    playerName: scorerName,
    isOwnGoal: type === "OWN_GOAL",
    assistName,
    providerEventId: safeStr(raw.id) ?? safeStr(raw.eventId) ?? safeStr(raw.uuid),
  };
}

export function parseFootballDataGoals(rawMatch: RawObject, providerMatchId: number): LiveMatchEvent[] | undefined {
  const candidateArrays = [
    rawMatch.goals,
    rawMatch.events,
    rawMatch.timeline,
    rawMatch.incidents,
    rawMatch.details,
    rawMatch.plays,
  ].filter(Array.isArray) as unknown[][];

  if (candidateArrays.length === 0) return undefined;

  const seen = new Set<string>();
  const events: LiveMatchEvent[] = [];
  for (const rawEvent of candidateArrays.flat()) {
    const event = normalizeScoringEvent(rawEvent);
    if (!event) continue;
    const key = eventKey(providerMatchId, event);
    if (seen.has(key)) continue;
    seen.add(key);
    events.push(event);
  }

  return events.sort((a, b) => (a.minute ?? 999) - (b.minute ?? 999) || (a.stoppageTime ?? 0) - (b.stoppageTime ?? 0));
}
