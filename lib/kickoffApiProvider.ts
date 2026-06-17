import { countryName } from "./i18n";
import { MATCHES, matchSlug, matchUtcDate, type Match } from "./matches";

export const KICKOFF_API_BASE_URL = "https://api.kickoffapi.com";
export const KICKOFF_FIXTURES_PATH = "/api/v1/fixtures?league=1&season=2026";
export const KICKOFF_EVENTS_PATH = "/api/v1/events";

// Three hours covers normal provider timezone rounding/correction drift while rejecting
// one-day upstream date defects such as the known Austria-Jordan fixture issue.
export const KICKOFF_FIXTURE_TOLERANCE_MINUTES = 180;

const GOAL_DETAILS = new Set(["Normal Goal", "Penalty", "Own Goal"]);
const IGNORED_GOAL_DETAILS = new Set([
  "Missed Penalty",
  "Penalty Missed",
  "Goal Disallowed",
  "Cancelled Goal",
  "Canceled Goal",
  "VAR",
]);

export type KickoffApiGoalEvent = {
  provider: "kickoffapi";
  providerFixtureId: string;
  providerEventId: string;
  providerPlayerId?: string;
  providerTeamId: string;
  playerName: string;
  assistPlayerId?: string;
  assistName?: string;
  minute: number;
  extraMinute?: number;
  detail: "Normal Goal" | "Penalty" | "Own Goal";
  isPenalty: boolean;
  isOwnGoal: boolean;
};

export type KickoffApiValidationError = {
  code: string;
  message: string;
  index?: number;
  providerFixtureId?: string;
  providerEventId?: string;
  canonicalMatchId?: string;
  canonicalMatchIds?: string[];
  providerFixtureIds?: string[];
  kickoffDifferenceMinutes?: number;
};

export type ParseGoalEventsResult = {
  events: KickoffApiGoalEvent[];
  errors: KickoffApiValidationError[];
};

export type KickoffApiFixture = {
  providerFixtureId: string;
  homeProviderTeamId: string;
  homeTeamName: string;
  awayProviderTeamId: string;
  awayTeamName: string;
  kickoffTimestamp: string;
};

export type ParseFixturesResult = {
  fixtures: KickoffApiFixture[];
  errors: KickoffApiValidationError[];
};

export type FixtureMappingOverride = {
  canonicalMatchId: string;
  providerFixtureId: string;
  reason: string;
  provenance: string;
};

export type KickoffFixtureMapping = {
  canonicalMatchId: string;
  providerFixtureId: string;
  kickoffDifferenceMinutes: number;
  source: "automatic" | "override";
};

export type MapKickoffFixturesResult = {
  mappings: KickoffFixtureMapping[];
  errors: KickoffApiValidationError[];
  summary: {
    canonicalCount: number;
    providerFixtureCount: number;
    automaticallyMappedCount: number;
    explicitOverrideCount: number;
    unmappedCount: number;
    ambiguousCount: number;
    duplicateProviderIds: string[];
    invalidFixtureCount: number;
  };
};

export const REVIEWED_KICKOFF_FIXTURE_OVERRIDES: FixtureMappingOverride[] = [
  {
    canonicalMatchId: "austria-vs-jordan-jun16",
    providerFixtureId: "1489382",
    reason: "KickoffAPI live investigation found this fixture published one calendar day away from the canonical kickoff.",
    provenance: "Manual review required; override is limited to fixture identity and still enforces home/away teams.",
  },
  {
    canonicalMatchId: "turkey-vs-paraguay-jun19",
    providerFixtureId: "1539006",
    reason: "KickoffAPI live investigation found this fixture published 23 hours away from the canonical kickoff.",
    provenance: "Sanitized live validation on 2026-06-17; override is limited to fixture identity and still enforces home/away teams.",
  },
  {
    canonicalMatchId: "tunisia-vs-japan-jun20",
    providerFixtureId: "1489394",
    reason: "KickoffAPI live investigation found this fixture published one calendar day away from the canonical kickoff.",
    provenance: "Sanitized live validation on 2026-06-17; override is limited to fixture identity and still enforces home/away teams.",
  },
];

const TEAM_ALIASES_BY_KEY: Record<string, string[]> = {
  bosnia: ["Bosnia-Herzegovina", "Bosnia & Herzegovina"],
  southKorea: ["Korea Republic", "South Korea"],
  czechia: ["Czech Republic", "Czechia"],
  turkey: ["Turkiye", "Turkey", "Türkiye"],
  unitedStates: ["USA", "United States"],
  capeVerde: ["Cabo Verde", "Cape Verde", "Cape Verde Islands"],
  drCongo: ["Congo DR", "DR Congo", "Democratic Republic of the Congo"],
};

export function kickoffProviderAliasesForTeamKey(teamKey: string): readonly string[] {
  return [countryName(teamKey, "en"), ...(TEAM_ALIASES_BY_KEY[teamKey] ?? [])];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function arrayPayload(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  const record = asRecord(payload);
  const response = record?.response;
  return Array.isArray(response) ? response : [];
}

function stringValue(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function numberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function positiveMinute(value: unknown): number | null {
  const minute = numberValue(value);
  return minute !== null && Number.isInteger(minute) && minute >= 0 ? minute : null;
}

function nestedRecord(record: Record<string, unknown>, key: string): Record<string, unknown> | null {
  return asRecord(record[key]);
}

function readEventId(record: Record<string, unknown>): string | null {
  return stringValue(record.id) ?? stringValue(record.eventId) ?? stringValue(record.event_id);
}

function readFixtureId(record: Record<string, unknown>, fallbackFixtureId?: string | number): string | null {
  return (
    stringValue(record.fixtureId) ??
    stringValue(record.fixture_id) ??
    stringValue(nestedRecord(record, "fixture")?.id) ??
    stringValue(fallbackFixtureId)
  );
}

function readTeamId(record: Record<string, unknown>): string | null {
  return stringValue(record.teamId) ?? stringValue(record.team_id) ?? stringValue(nestedRecord(record, "team")?.id);
}

function readPlayer(record: Record<string, unknown>): { id?: string; name: string | null } {
  const player = nestedRecord(record, "player");
  return {
    id: stringValue(record.playerId) ?? stringValue(record.player_id) ?? stringValue(player?.id) ?? undefined,
    name: stringValue(record.playerName) ?? stringValue(record.player_name) ?? stringValue(player?.name),
  };
}

function readAssist(record: Record<string, unknown>): { id?: string; name?: string } {
  const assist = nestedRecord(record, "assist");
  const id =
    stringValue(record.assistPlayerId) ??
    stringValue(record.assistId) ??
    stringValue(record.assist_player_id) ??
    stringValue(assist?.id) ??
    undefined;
  const name = stringValue(record.assistName) ?? stringValue(record.assist_name) ?? stringValue(assist?.name) ?? undefined;
  return { id, name };
}

function readMinute(record: Record<string, unknown>): { minute: number | null; extraMinute?: number } {
  const time = nestedRecord(record, "time");
  const minute = positiveMinute(record.minute) ?? positiveMinute(record.elapsed) ?? positiveMinute(record.time) ?? positiveMinute(time?.elapsed);
  const extraMinute = positiveMinute(record.extraMinute) ?? positiveMinute(record.extra_minute) ?? positiveMinute(time?.extra);
  return {
    minute,
    extraMinute: extraMinute ?? undefined,
  };
}

function sanitizedError(
  code: string,
  message: string,
  context: Partial<KickoffApiValidationError>,
): KickoffApiValidationError {
  return { code, message, ...context };
}

export function parseKickoffApiGoalEvents(
  payload: unknown,
  options: { providerFixtureId?: string | number } = {},
): ParseGoalEventsResult {
  const errors: KickoffApiValidationError[] = [];
  const events: KickoffApiGoalEvent[] = [];

  for (const [index, item] of arrayPayload(payload).entries()) {
    const record = asRecord(item);
    if (!record) {
      errors.push(sanitizedError("invalid_event", "Event is not an object.", { index }));
      continue;
    }

    const providerEventId = readEventId(record) ?? undefined;
    const providerFixtureId = readFixtureId(record, options.providerFixtureId) ?? undefined;
    const type = stringValue(record.type);
    const detail = stringValue(record.detail);

    if (type !== "Goal") continue;
    if (detail && IGNORED_GOAL_DETAILS.has(detail)) continue;
    if (!detail || !GOAL_DETAILS.has(detail)) {
      errors.push(sanitizedError("unknown_goal_detail", "Goal detail is not an accepted regulation goal.", {
        index,
        providerFixtureId,
        providerEventId,
      }));
      continue;
    }

    const providerTeamId = readTeamId(record) ?? undefined;
    const player = readPlayer(record);
    const assist = readAssist(record);
    const { minute, extraMinute } = readMinute(record);

    const missing: string[] = [];
    if (!providerEventId) missing.push("event ID");
    if (!providerFixtureId) missing.push("fixture ID");
    if (!providerTeamId) missing.push("team ID");
    if (!player.name) missing.push("scorer name");
    if (minute === null) missing.push("minute");

    if (missing.length > 0) {
      errors.push(sanitizedError("invalid_goal_event", `Goal event is missing or has invalid ${missing.join(", ")}.`, {
        index,
        providerFixtureId,
        providerEventId,
      }));
      continue;
    }

    const validFixtureId = providerFixtureId as string;
    const validEventId = providerEventId as string;
    const validTeamId = providerTeamId as string;
    const validPlayerName = player.name as string;
    const validMinute = minute as number;

    events.push({
      provider: "kickoffapi",
      providerFixtureId: validFixtureId,
      providerEventId: validEventId,
      providerPlayerId: player.id,
      providerTeamId: validTeamId,
      playerName: validPlayerName,
      assistPlayerId: assist.id,
      assistName: assist.name,
      minute: validMinute,
      extraMinute,
      detail: detail as KickoffApiGoalEvent["detail"],
      isPenalty: detail === "Penalty",
      isOwnGoal: detail === "Own Goal",
    });
  }

  return {
    events: dedupeAndSortGoalEvents(events),
    errors,
  };
}

export function dedupeAndSortGoalEvents(events: KickoffApiGoalEvent[]): KickoffApiGoalEvent[] {
  const byKey = new Map<string, KickoffApiGoalEvent>();
  for (const event of events) {
    const key = `${event.providerFixtureId}|${event.providerEventId}`;
    if (!byKey.has(key)) byKey.set(key, event);
  }
  return [...byKey.values()].sort((a, b) =>
    a.minute - b.minute ||
    (a.extraMinute ?? 0) - (b.extraMinute ?? 0) ||
    a.providerEventId.localeCompare(b.providerEventId, "en"),
  );
}

function readFixtureIdentity(record: Record<string, unknown>): {
  id: string | null;
  kickoffTimestamp: string | null;
  home: Record<string, unknown> | null;
  away: Record<string, unknown> | null;
} {
  const fixture = nestedRecord(record, "fixture");
  const teams = nestedRecord(record, "teams");
  return {
    id: stringValue(record.id) ?? stringValue(record.fixtureId) ?? stringValue(fixture?.id),
    kickoffTimestamp:
      stringValue(record.kickoffTimestamp) ??
      stringValue(record.kickoff_timestamp) ??
      stringValue(record.date) ??
      stringValue(fixture?.date),
    home: nestedRecord(record, "homeTeam") ?? nestedRecord(record, "home") ?? nestedRecord(teams ?? {}, "home"),
    away: nestedRecord(record, "awayTeam") ?? nestedRecord(record, "away") ?? nestedRecord(teams ?? {}, "away"),
  };
}

function parseExplicitTimezoneTimestamp(value: string | null): string | null {
  if (!value) return null;

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3})\d*)?)?(Z|[+-]\d{2}:\d{2})$/,
  );
  if (!match) return null;

  const [, yearText, monthText, dayText, hourText, minuteText, secondText = "0", millisecondText = "0", zone] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  const millisecond = Number(millisecondText.padEnd(3, "0"));

  if (month < 1 || month > 12 || hour > 23 || minute > 59 || second > 59) return null;

  const localMillis = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);
  const localDate = new Date(localMillis);
  if (
    localDate.getUTCFullYear() !== year ||
    localDate.getUTCMonth() !== month - 1 ||
    localDate.getUTCDate() !== day ||
    localDate.getUTCHours() !== hour ||
    localDate.getUTCMinutes() !== minute ||
    localDate.getUTCSeconds() !== second ||
    localDate.getUTCMilliseconds() !== millisecond
  ) {
    return null;
  }

  let offsetMinutes = 0;
  if (zone !== "Z") {
    const offsetMatch = zone.match(/^([+-])(\d{2}):(\d{2})$/);
    if (!offsetMatch) return null;
    const [, sign, offsetHourText, offsetMinuteText] = offsetMatch;
    const offsetHour = Number(offsetHourText);
    const offsetMinute = Number(offsetMinuteText);
    if (offsetHour > 23 || offsetMinute > 59) return null;
    offsetMinutes = (offsetHour * 60 + offsetMinute) * (sign === "+" ? 1 : -1);
  }

  return new Date(localMillis - offsetMinutes * 60_000).toISOString();
}

export function parseKickoffApiFixtures(payload: unknown): ParseFixturesResult {
  const fixtures: KickoffApiFixture[] = [];
  const errors: KickoffApiValidationError[] = [];

  for (const [index, item] of arrayPayload(payload).entries()) {
    const record = asRecord(item);
    if (!record) {
      errors.push(sanitizedError("invalid_fixture", "Fixture is not an object.", { index }));
      continue;
    }

    const identity = readFixtureIdentity(record);
    const homeId = stringValue(identity.home?.id);
    const homeName = stringValue(identity.home?.name);
    const awayId = stringValue(identity.away?.id);
    const awayName = stringValue(identity.away?.name);
    const kickoffTimestamp = parseExplicitTimezoneTimestamp(identity.kickoffTimestamp);

    const missing: string[] = [];
    if (!identity.id) missing.push("fixture ID");
    if (!homeId) missing.push("home team ID");
    if (!homeName) missing.push("home team name");
    if (!awayId) missing.push("away team ID");
    if (!awayName) missing.push("away team name");
    if (!kickoffTimestamp) missing.push("kickoff timestamp");

    if (missing.length > 0) {
      errors.push(sanitizedError("invalid_fixture", `Fixture is missing or has invalid ${missing.join(", ")}.`, {
        index,
        providerFixtureId: identity.id ?? undefined,
      }));
      continue;
    }

    const validFixtureId = identity.id as string;
    const validHomeId = homeId as string;
    const validHomeName = homeName as string;
    const validAwayId = awayId as string;
    const validAwayName = awayName as string;
    const validKickoffTimestamp = kickoffTimestamp as string;

    fixtures.push({
      providerFixtureId: validFixtureId,
      homeProviderTeamId: validHomeId,
      homeTeamName: validHomeName,
      awayProviderTeamId: validAwayId,
      awayTeamName: validAwayName,
      kickoffTimestamp: validKickoffTimestamp,
    });
  }

  return { fixtures, errors };
}

export function normalizeKickoffTeamName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function canonicalAliases(match: Match, side: "home" | "away"): Set<string> {
  const key = side === "home" ? match.homeKey : match.awayKey;
  const names = kickoffProviderAliasesForTeamKey(key);
  return new Set(names.map(normalizeKickoffTeamName));
}

function teamMatches(providerName: string, aliases: Set<string>): boolean {
  return aliases.has(normalizeKickoffTeamName(providerName));
}

function kickoffDifferenceMinutes(match: Match, fixture: KickoffApiFixture): number {
  return Math.round(Math.abs(Date.parse(fixture.kickoffTimestamp) - matchUtcDate(match).getTime()) / 60_000);
}

function duplicateValues(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates].sort((a, b) => a.localeCompare(b, "en"));
}

export function mapKickoffFixturesToCanonicalMatches({
  providerFixtures,
  canonicalMatches = MATCHES,
  overrides = REVIEWED_KICKOFF_FIXTURE_OVERRIDES,
  toleranceMinutes = KICKOFF_FIXTURE_TOLERANCE_MINUTES,
}: {
  providerFixtures: KickoffApiFixture[];
  canonicalMatches?: readonly Match[];
  overrides?: readonly FixtureMappingOverride[];
  toleranceMinutes?: number;
}): MapKickoffFixturesResult {
  const errors: KickoffApiValidationError[] = [];
  const mappings: KickoffFixtureMapping[] = [];
  const usedProviderIds = new Set<string>();
  const providerIdAssignments = new Map<string, string>();
  const duplicateProviderIds = duplicateValues(providerFixtures.map((fixture) => fixture.providerFixtureId));
  const duplicateCanonicalIds = duplicateValues(canonicalMatches.map(matchSlug));

  for (const providerFixtureId of duplicateProviderIds) {
    errors.push(sanitizedError("duplicate_provider_fixture_id", "Provider fixture ID appears more than once.", {
      providerFixtureId,
    }));
  }
  for (const canonicalMatchId of duplicateCanonicalIds) {
    errors.push(sanitizedError("duplicate_canonical_match", "Canonical match appears more than once.", {
      canonicalMatchId,
    }));
  }

  const fixtureById = new Map(providerFixtures.map((fixture) => [fixture.providerFixtureId, fixture]));
  const overrideBySlug = new Map(overrides.map((override) => [override.canonicalMatchId, override]));

  let ambiguousCount = 0;

  for (const match of canonicalMatches) {
    const canonicalMatchId = matchSlug(match);
    if (duplicateCanonicalIds.includes(canonicalMatchId)) continue;
    const override = overrideBySlug.get(canonicalMatchId);

    if (override) {
      const fixture = fixtureById.get(override.providerFixtureId);
      if (!fixture) {
        errors.push(sanitizedError("override_fixture_missing", "Reviewed override references an absent provider fixture.", {
          canonicalMatchId,
          providerFixtureId: override.providerFixtureId,
        }));
        continue;
      }
      if (!fixtureMatchesTeams(match, fixture)) {
        errors.push(sanitizedError("override_team_mismatch", "Reviewed override does not match canonical home/away teams.", {
          canonicalMatchId,
          providerFixtureId: fixture.providerFixtureId,
        }));
        continue;
      }
      if (usedProviderIds.has(fixture.providerFixtureId)) {
        errors.push(sanitizedError("duplicate_provider_fixture_assignment", "Provider fixture is mapped to more than one canonical match.", {
          canonicalMatchId,
          canonicalMatchIds: [providerIdAssignments.get(fixture.providerFixtureId), canonicalMatchId].filter((value): value is string => Boolean(value)),
          providerFixtureId: fixture.providerFixtureId,
        }));
        continue;
      }
      mappings.push({
        canonicalMatchId,
        providerFixtureId: fixture.providerFixtureId,
        kickoffDifferenceMinutes: kickoffDifferenceMinutes(match, fixture),
        source: "override",
      });
      usedProviderIds.add(fixture.providerFixtureId);
      providerIdAssignments.set(fixture.providerFixtureId, canonicalMatchId);
      continue;
    }

    const teamCandidates = providerFixtures.filter((fixture) => fixtureMatchesTeams(match, fixture));
    const candidates = teamCandidates
      .map((fixture) => ({ fixture, diff: kickoffDifferenceMinutes(match, fixture) }))
      .filter(({ diff }) => diff <= toleranceMinutes);

    if (candidates.length === 0) {
      const nearest = teamCandidates
        .map((fixture) => kickoffDifferenceMinutes(match, fixture))
        .sort((a, b) => a - b)[0];
      errors.push(sanitizedError("unmapped_fixture", "No unique provider fixture matched canonical teams within kickoff tolerance.", {
        canonicalMatchId,
        kickoffDifferenceMinutes: nearest,
      }));
      continue;
    }

    if (candidates.length > 1) {
      ambiguousCount++;
      errors.push(sanitizedError("ambiguous_fixture_mapping", "More than one provider fixture matched canonical teams within kickoff tolerance.", {
        canonicalMatchId,
        providerFixtureIds: candidates.map(({ fixture }) => fixture.providerFixtureId).sort((a, b) => a.localeCompare(b, "en")),
      }));
      continue;
    }

    const { fixture, diff } = candidates[0];
    if (usedProviderIds.has(fixture.providerFixtureId)) {
      errors.push(sanitizedError("duplicate_provider_fixture_assignment", "Provider fixture is mapped to more than one canonical match.", {
        canonicalMatchId,
        canonicalMatchIds: [providerIdAssignments.get(fixture.providerFixtureId), canonicalMatchId].filter((value): value is string => Boolean(value)),
        providerFixtureId: fixture.providerFixtureId,
      }));
      continue;
    }

    mappings.push({
      canonicalMatchId,
      providerFixtureId: fixture.providerFixtureId,
      kickoffDifferenceMinutes: diff,
      source: "automatic",
    });
    usedProviderIds.add(fixture.providerFixtureId);
    providerIdAssignments.set(fixture.providerFixtureId, canonicalMatchId);
  }

  const automaticallyMappedCount = mappings.filter((mapping) => mapping.source === "automatic").length;
  const explicitOverrideCount = mappings.filter((mapping) => mapping.source === "override").length;

  return {
    mappings: mappings.sort((a, b) => a.canonicalMatchId.localeCompare(b.canonicalMatchId, "en")),
    errors,
    summary: {
      canonicalCount: canonicalMatches.length,
      providerFixtureCount: providerFixtures.length,
      automaticallyMappedCount,
      explicitOverrideCount,
      unmappedCount: canonicalMatches.length - mappings.length,
      ambiguousCount,
      duplicateProviderIds,
      invalidFixtureCount: 0,
    },
  };
}

function fixtureMatchesTeams(match: Match, fixture: KickoffApiFixture): boolean {
  return (
    teamMatches(fixture.homeTeamName, canonicalAliases(match, "home")) &&
    teamMatches(fixture.awayTeamName, canonicalAliases(match, "away"))
  );
}
