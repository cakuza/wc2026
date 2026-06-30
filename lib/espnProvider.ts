import { countryName } from "./i18n";
import { MATCHES, matchSlug, matchUtcDate, type Match } from "./matches";
import { getResolvedAwayTeam, getResolvedHomeTeam } from "./participant-resolution";

// ESPN's undocumented public soccer JSON API. No key, no auth. Public scoreboard
// (event discovery) and summary (goal events) resources only. This module is pure:
// it parses already-fetched payloads and maps provider fixtures onto canonical
// matches. All network access lives in espnClient.ts.
export const ESPN_SOCCER_BASE_URL = "https://site.api.espn.com/apis/site/v2/sports/soccer";
export const ESPN_WORLD_CUP_LEAGUE = "fifa.world";
export const ESPN_SCOREBOARD_PATH = `/${ESPN_WORLD_CUP_LEAGUE}/scoreboard`;
export const ESPN_SUMMARY_PATH = `/${ESPN_WORLD_CUP_LEAGUE}/summary`;

// Three hours absorbs provider timezone rounding/correction drift while still
// rejecting one-day fixture defects, matching the secondary-provider policy.
export const ESPN_FIXTURE_TOLERANCE_MINUTES = 180;

// ESPN keyEvents[].type.type values that represent a confirmed regulation/extra-time
// goal. A play is only adopted when scoringPlay === true AND its structured type is
// one of these. Penalty-shootout goals (shootout === true) are excluded separately.
const ESPN_SCORING_TYPE_TYPES = new Set([
  "goal",
  "goal---header",
  "goal---volley",
  "penalty---scored",
  "own-goal",
]);
const ESPN_PENALTY_TYPE_TYPE = "penalty---scored";
const ESPN_OWN_GOAL_TYPE_TYPE = "own-goal";

export type EspnFixtureStatus = "pre" | "in" | "post" | "unknown";

export type EspnGoalEvent = {
  // Internal provenance only — never surfaced in public output.
  provider: "espn";
  providerFixtureId: string;
  providerEventId: string;
  providerPlayerId?: string;
  // For normal goals this is the scorer's team; for own goals ESPN reports the
  // *beneficiary* (credited) team here, which the adapter handles explicitly.
  providerTeamId: string;
  playerName: string;
  minute: number;
  extraMinute?: number;
  isPenalty: boolean;
  isOwnGoal: boolean;
};

export type EspnValidationError = {
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

export type ParseEspnGoalEventsResult = {
  events: EspnGoalEvent[];
  errors: EspnValidationError[];
};

export type EspnFixture = {
  providerFixtureId: string;
  homeProviderTeamId: string;
  homeTeamName: string;
  awayProviderTeamId: string;
  awayTeamName: string;
  kickoffTimestamp: string;
  status: EspnFixtureStatus;
};

export type ParseEspnFixturesResult = {
  fixtures: EspnFixture[];
  errors: EspnValidationError[];
};

export type EspnFixtureMapping = {
  canonicalMatchId: string;
  providerFixtureId: string;
  kickoffDifferenceMinutes: number;
  source: "automatic" | "override";
};

export type EspnFixtureMappingOverride = {
  canonicalMatchId: string;
  providerFixtureId: string;
  reason: string;
  provenance: string;
};

export type MapEspnFixturesResult = {
  mappings: EspnFixtureMapping[];
  errors: EspnValidationError[];
  summary: {
    canonicalCount: number;
    providerFixtureCount: number;
    automaticallyMappedCount: number;
    explicitOverrideCount: number;
    unmappedCount: number;
    ambiguousCount: number;
    duplicateProviderIds: string[];
  };
};

// No reviewed overrides are required today; ESPN's calendar aligned with the
// canonical kickoff times for every audited fixture. Reviewed overrides may be
// added here for proven ambiguity only.
export const REVIEWED_ESPN_FIXTURE_OVERRIDES: EspnFixtureMappingOverride[] = [];

const TEAM_ALIASES_BY_KEY: Record<string, string[]> = {
  bosnia: ["Bosnia-Herzegovina", "Bosnia & Herzegovina", "Bosnia and Herzegovina"],
  southKorea: ["Korea Republic", "South Korea"],
  czechia: ["Czech Republic", "Czechia"],
  turkey: ["Turkiye", "Türkiye", "Turkey"],
  unitedStates: ["USA", "United States", "United States of America"],
  capeVerde: ["Cabo Verde", "Cape Verde", "Cape Verde Islands"],
  drCongo: ["Congo DR", "DR Congo", "Democratic Republic of the Congo"],
  ivoryCoast: ["Ivory Coast", "Cote d'Ivoire", "Côte d'Ivoire"],
  curacao: ["Curacao", "Curaçao"],
};

export function espnAliasesForTeamKey(teamKey: string): readonly string[] {
  return [countryName(teamKey, "en"), ...(TEAM_ALIASES_BY_KEY[teamKey] ?? [])];
}

export function normalizeEspnTeamName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function stringValue(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function nestedRecord(record: Record<string, unknown>, key: string): Record<string, unknown> | null {
  return asRecord(record[key]);
}

function sanitizedError(
  code: string,
  message: string,
  context: Partial<EspnValidationError>,
): EspnValidationError {
  return { code, message, ...context };
}

/**
 * Parse an ESPN clock display value ("9'", "45'+5'", "90'+12'") into a base
 * minute and optional added/stoppage minute. Returns null on any unexpected shape
 * so the caller can fail closed rather than guess.
 */
export function parseEspnClock(displayValue: string | null): { minute: number; extraMinute?: number } | null {
  if (!displayValue) return null;
  const match = displayValue.trim().match(/^(\d{1,3})'(?:\+(\d{1,3})')?$/);
  if (!match) return null;
  const minute = Number(match[1]);
  const extra = match[2] !== undefined ? Number(match[2]) : undefined;
  if (!Number.isInteger(minute) || minute < 0) return null;
  if (extra !== undefined && (!Number.isInteger(extra) || extra < 0)) return null;
  return { minute, extraMinute: extra };
}

function scoreboardEvents(payload: unknown): unknown[] {
  const record = asRecord(payload);
  const events = record?.events;
  return Array.isArray(events) ? events : [];
}

function readFixtureStatus(competition: Record<string, unknown>, event: Record<string, unknown>): EspnFixtureStatus {
  const status = nestedRecord(competition, "status") ?? nestedRecord(event, "status");
  const type = status ? nestedRecord(status, "type") : null;
  const state = type ? stringValue(type.state) : null;
  if (state === "pre" || state === "in" || state === "post") return state;
  return "unknown";
}

/**
 * Parse the ESPN scoreboard payload into provider fixtures. Each event yields one
 * fixture with the ESPN event id, home/away team ids + display names, kickoff
 * timestamp, and lifecycle state. Malformed events are collected as errors, never
 * silently dropped.
 */
export function parseEspnScoreboard(payload: unknown): ParseEspnFixturesResult {
  const fixtures: EspnFixture[] = [];
  const errors: EspnValidationError[] = [];

  for (const [index, item] of scoreboardEvents(payload).entries()) {
    const event = asRecord(item);
    if (!event) {
      errors.push(sanitizedError("invalid_fixture", "Scoreboard event is not an object.", { index }));
      continue;
    }

    const providerFixtureId = stringValue(event.id);
    const competitions = Array.isArray(event.competitions) ? event.competitions : [];
    const competition = asRecord(competitions[0]);
    const kickoffTimestamp = stringValue(event.date);

    if (!competition) {
      errors.push(sanitizedError("invalid_fixture", "Scoreboard event has no competition.", {
        index,
        providerFixtureId: providerFixtureId ?? undefined,
      }));
      continue;
    }

    const competitors = Array.isArray(competition.competitors) ? competition.competitors : [];
    let home: Record<string, unknown> | null = null;
    let away: Record<string, unknown> | null = null;
    for (const raw of competitors) {
      const competitor = asRecord(raw);
      if (!competitor) continue;
      if (stringValue(competitor.homeAway) === "home") home = competitor;
      else if (stringValue(competitor.homeAway) === "away") away = competitor;
    }

    const homeTeam = home ? nestedRecord(home, "team") : null;
    const awayTeam = away ? nestedRecord(away, "team") : null;
    const homeProviderTeamId = homeTeam ? stringValue(homeTeam.id) : null;
    const homeTeamName = homeTeam ? stringValue(homeTeam.displayName) ?? stringValue(homeTeam.name) : null;
    const awayProviderTeamId = awayTeam ? stringValue(awayTeam.id) : null;
    const awayTeamName = awayTeam ? stringValue(awayTeam.displayName) ?? stringValue(awayTeam.name) : null;

    const missing: string[] = [];
    if (!providerFixtureId) missing.push("event ID");
    if (!homeProviderTeamId) missing.push("home team ID");
    if (!homeTeamName) missing.push("home team name");
    if (!awayProviderTeamId) missing.push("away team ID");
    if (!awayTeamName) missing.push("away team name");
    if (!kickoffTimestamp) missing.push("kickoff timestamp");

    if (missing.length > 0) {
      errors.push(sanitizedError("invalid_fixture", `Scoreboard event is missing or has invalid ${missing.join(", ")}.`, {
        index,
        providerFixtureId: providerFixtureId ?? undefined,
      }));
      continue;
    }

    fixtures.push({
      providerFixtureId: providerFixtureId as string,
      homeProviderTeamId: homeProviderTeamId as string,
      homeTeamName: homeTeamName as string,
      awayProviderTeamId: awayProviderTeamId as string,
      awayTeamName: awayTeamName as string,
      kickoffTimestamp: kickoffTimestamp as string,
      status: readFixtureStatus(competition, event),
    });
  }

  return { fixtures, errors };
}

function summaryKeyEvents(payload: unknown): unknown[] {
  const record = asRecord(payload);
  if (!record) return [];
  const keyEvents = record.keyEvents;
  if (Array.isArray(keyEvents)) return keyEvents;
  const plays = record.plays;
  return Array.isArray(plays) ? plays : [];
}

/**
 * Parse the ESPN match summary into confirmed goal events. Only plays with
 * scoringPlay === true and a recognized structured goal type are accepted;
 * penalty-shootout plays, cards, VAR upgrades, substitutions, and any unknown
 * type are excluded. Duplicate representations (same event id) collapse to one.
 */
export function parseEspnGoalEvents(
  payload: unknown,
  options: { providerFixtureId: string },
): ParseEspnGoalEventsResult {
  const errors: EspnValidationError[] = [];
  const events: EspnGoalEvent[] = [];

  for (const [index, item] of summaryKeyEvents(payload).entries()) {
    const record = asRecord(item);
    if (!record) {
      errors.push(sanitizedError("invalid_event", "keyEvent is not an object.", {
        index,
        providerFixtureId: options.providerFixtureId,
      }));
      continue;
    }

    const scoringPlay = record.scoringPlay === true;
    if (!scoringPlay) continue; // Cards, VAR upgrades, subs, kickoff, etc.
    if (record.shootout === true) continue; // Penalty-shootout goals are not regulation goals.

    const type = nestedRecord(record, "type");
    const typeType = type ? stringValue(type.type) : null;
    if (!typeType || !ESPN_SCORING_TYPE_TYPES.has(typeType)) {
      // A scoring play with an unrecognized structured type — fail closed and record it.
      errors.push(sanitizedError("unknown_scoring_type", "Scoring play has an unrecognized structured goal type.", {
        index,
        providerFixtureId: options.providerFixtureId,
        providerEventId: stringValue(record.id) ?? undefined,
      }));
      continue;
    }

    const providerEventId = stringValue(record.id);
    const team = nestedRecord(record, "team");
    const providerTeamId = team ? stringValue(team.id) : null;
    const participants = Array.isArray(record.participants) ? record.participants : [];
    const scorer = asRecord(participants[0]);
    const athlete = scorer ? nestedRecord(scorer, "athlete") : null;
    const playerName = athlete ? stringValue(athlete.displayName) ?? stringValue(athlete.name) : null;
    const providerPlayerId = athlete ? stringValue(athlete.id) ?? undefined : undefined;
    const clock = nestedRecord(record, "clock");
    const parsedClock = parseEspnClock(clock ? stringValue(clock.displayValue) : null);

    const missing: string[] = [];
    if (!providerEventId) missing.push("event ID");
    if (!providerTeamId) missing.push("team ID");
    if (!playerName) missing.push("scorer name");
    if (!parsedClock) missing.push("minute");

    if (missing.length > 0) {
      errors.push(sanitizedError("invalid_goal_event", `Goal event is missing or has invalid ${missing.join(", ")}.`, {
        index,
        providerFixtureId: options.providerFixtureId,
        providerEventId: providerEventId ?? undefined,
      }));
      continue;
    }

    events.push({
      provider: "espn",
      providerFixtureId: options.providerFixtureId,
      providerEventId: providerEventId as string,
      providerPlayerId,
      providerTeamId: providerTeamId as string,
      playerName: playerName as string,
      minute: (parsedClock as { minute: number }).minute,
      extraMinute: (parsedClock as { extraMinute?: number }).extraMinute,
      isPenalty: typeType === ESPN_PENALTY_TYPE_TYPE,
      isOwnGoal: typeType === ESPN_OWN_GOAL_TYPE_TYPE,
    });
  }

  return { events: dedupeAndSortGoalEvents(events), errors };
}

export function dedupeAndSortGoalEvents(events: EspnGoalEvent[]): EspnGoalEvent[] {
  const byKey = new Map<string, EspnGoalEvent>();
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

function canonicalAliases(match: Match, side: "home" | "away"): Set<string> {
  const key = side === "home" ? getResolvedHomeTeam(match) : getResolvedAwayTeam(match);
  if (!key) return new Set();
  return new Set(espnAliasesForTeamKey(key).map(normalizeEspnTeamName));
}

function teamMatches(providerName: string, aliases: Set<string>): boolean {
  return aliases.has(normalizeEspnTeamName(providerName));
}

function fixtureMatchesTeams(match: Match, fixture: EspnFixture): boolean {
  return (
    teamMatches(fixture.homeTeamName, canonicalAliases(match, "home")) &&
    teamMatches(fixture.awayTeamName, canonicalAliases(match, "away"))
  );
}

function kickoffDifferenceMinutes(match: Match, fixture: EspnFixture): number {
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

/**
 * Deterministically map ESPN fixtures onto canonical matches using normalized
 * home + away team identity within a kickoff tolerance. Ambiguous, duplicate, and
 * unmapped fixtures are reported as errors and never guessed.
 */
export function mapEspnFixturesToCanonicalMatches({
  providerFixtures,
  canonicalMatches = MATCHES,
  overrides = REVIEWED_ESPN_FIXTURE_OVERRIDES,
  toleranceMinutes = ESPN_FIXTURE_TOLERANCE_MINUTES,
}: {
  providerFixtures: EspnFixture[];
  canonicalMatches?: readonly Match[];
  overrides?: readonly EspnFixtureMappingOverride[];
  toleranceMinutes?: number;
}): MapEspnFixturesResult {
  const errors: EspnValidationError[] = [];
  const mappings: EspnFixtureMapping[] = [];
  const usedProviderIds = new Set<string>();
  const providerIdAssignments = new Map<string, string>();
  const duplicateProviderIds = duplicateValues(providerFixtures.map((fixture) => fixture.providerFixtureId));

  for (const providerFixtureId of duplicateProviderIds) {
    errors.push(sanitizedError("duplicate_provider_fixture_id", "Provider fixture ID appears more than once.", {
      providerFixtureId,
    }));
  }

  const fixtureById = new Map(providerFixtures.map((fixture) => [fixture.providerFixtureId, fixture]));
  const overrideBySlug = new Map(overrides.map((override) => [override.canonicalMatchId, override]));
  let ambiguousCount = 0;

  for (const match of canonicalMatches) {
    const canonicalMatchId = matchSlug(match);
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
    },
  };
}
