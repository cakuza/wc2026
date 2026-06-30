import "server-only";

import { MATCHES } from "./matches";
import { countryName } from "./i18n";
import { EspnClient } from "./espnClient";
import { EspnEventCacheManager, summaryTtlForStatus } from "./espnEventCache";
import {
  mapEspnFixturesToCanonicalMatches,
  parseEspnGoalEvents,
  parseEspnScoreboard,
  type EspnFixture,
} from "./espnProvider";
import { adaptEspnEventToLedger } from "./espnScorerAdapter";
import {
  mergeProviderAttempt,
  type MergeCanonicalContext,
  type MergeProviderAttempt,
} from "./scorerEventLedger";
import type { SerializableSnapshotMatch } from "./liveSnapshot";
import type { GoalScorerEvent } from "./worldcup26Provider";
import type { LiveMatchData } from "./liveMatchData";
import { getResolvedAwayTeam, getResolvedHomeTeam } from "./participant-resolution";

// Provider-neutral scorer enrichment runtime. football-data.org remains the sole
// authority for match identity, status, score, teams, and kickoff; this runtime may
// only supply scorer/event enrichment on top of an existing canonical baseline, and
// it fails closed on any provider error, schema drift, or ambiguity. The active
// secondary event provider is ESPN's public soccer JSON API (no key, no auth).

// Scoreboard status ("pre/in/post") only decides whether event summaries are
// worth reading. Score/status authority remains football-data.org.
const SCOREBOARD_TTL_SECONDS = 90;

// Accurate provider label for enriched scorers. ESPN is the real source; it is
// never rewritten to football-data.org or any other authority.
const PUBLIC_SCORER_PROVIDER: GoalScorerEvent["provider"] = "espn";

/**
 * Whether scorer enrichment is active.
 *
 * Fail-closed: enrichment runs ONLY when SCORER_ENRICHMENT_ENABLED is the exact
 * string "true". Any other value — absent, "false", "1", or anything else — is
 * treated as disabled. No inference from NEXT_RUNTIME, Vercel env, or build phase.
 */
export function isScorerEnrichmentEnabled(): boolean {
  return process.env.SCORER_ENRICHMENT_ENABLED === "true";
}

function tournamentDateRange(): string {
  let min = Infinity;
  let max = -Infinity;
  for (const match of MATCHES) {
    const t = Date.parse(`${match.date}T00:00:00Z`);
    if (Number.isFinite(t)) {
      if (t < min) min = t;
      if (t > max) max = t;
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    // Fail closed at the caller if the canonical calendar is unexpectedly empty.
    return "";
  }
  const pad = 24 * 60 * 60 * 1000; // ±1 day absorbs timezone rounding at the edges.
  const fmt = (ms: number) => {
    const d = new Date(ms);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}${m}${day}`;
  };
  return `${fmt(min - pad)}-${fmt(max + pad)}`;
}

function baselineIsComplete(match: SerializableSnapshotMatch): boolean {
  if (match.goalEventCompleteness.missingGoalEventCount !== 0) return false;
  const hasLowConfidence = match.scorers.some((s) => s.confidence === "low");
  const hasUnresolvedOwnGoals = match.scorers.some((s) => s.isOwnGoal && !s.playerTeamName);
  // An own goal with no scorer-club attribution is the canonical "safe" shape, not an
  // unresolved gap; only treat genuinely missing scorers as incomplete.
  return !hasLowConfidence && !hasUnresolvedOwnGoals;
}

/**
 * Enrich the snapshot's scorer events from the secondary provider, in place.
 *
 * Primary rule: football-data.org remains the sole authority for score, status,
 * teams, and kickoff. ESPN enrichment replaces only the scorer list.
 */
export async function enrichSnapshotScorers(
  matches: Record<string, SerializableSnapshotMatch>,
  _primaryProviderOk: boolean,
  _snapshotGeneratedAt: string,
  canonicalLiveData: Map<number, LiveMatchData>,
): Promise<void> {
  if (!isScorerEnrichmentEnabled()) return;
  void canonicalLiveData;

  const dateRange = tournamentDateRange();
  if (!dateRange) return;

  const client = new EspnClient();
  const manager = new EspnEventCacheManager(client);

  const scoreboardRes = await manager.getCachedScoreboard(dateRange, SCOREBOARD_TTL_SECONDS);
  if (scoreboardRes.category !== "success" || !scoreboardRes.data) {
    console.warn("[scorerProviderRuntime] Scoreboard fetch failed; preserving baseline for this snapshot.");
    return;
  }

  const parsedScoreboard = parseEspnScoreboard(scoreboardRes.data);
  if (parsedScoreboard.fixtures.length === 0) {
    console.warn("[scorerProviderRuntime] Scoreboard produced no fixtures; preserving baseline.");
    return;
  }

  const mapResult = mapEspnFixturesToCanonicalMatches({ providerFixtures: parsedScoreboard.fixtures });
  const mappingByCanonical = new Map(mapResult.mappings.map((m) => [m.canonicalMatchId, m]));
  const fixtureById = new Map<string, EspnFixture>(
    parsedScoreboard.fixtures.map((fixture) => [fixture.providerFixtureId, fixture]),
  );

  // Candidate selection: never request scheduled matches; skip already-complete
  // finished matches; prioritize live, then most-recent finished.
  type Candidate = {
    match: SerializableSnapshotMatch;
    providerFixtureId: string;
    fixture: EspnFixture;
    sortKey: number;
  };
  const candidates: Candidate[] = [];

  for (const internalId of Object.keys(matches)) {
    const matchData = matches[internalId];
    if (matchData.status === "SCHEDULED") continue;
    if (matchData.status === "FINISHED" && baselineIsComplete(matchData)) continue;

    const mapping = mappingByCanonical.get(internalId);
    if (!mapping) continue;
    const fixture = fixtureById.get(mapping.providerFixtureId);
    if (!fixture) continue;
    // The provider must also believe the match has started before we read events.
    if (fixture.status === "pre") continue;

    const live = matchData.status === "LIVE" || matchData.status === "HALFTIME" || matchData.status === "SYNCING";
    const timeVal = matchData.sourceUpdatedAt ? new Date(matchData.sourceUpdatedAt).getTime() : 0;
    candidates.push({
      match: matchData,
      providerFixtureId: mapping.providerFixtureId,
      fixture,
      sortKey: (live ? 1 : 2) * 1e13 - timeVal,
    });
  }

  candidates.sort((a, b) => a.sortKey - b.sortKey);

  for (const candidate of candidates) {
    const { match, providerFixtureId, fixture } = candidate;

    const finishedAndConsistent = match.status === "FINISHED" && baselineIsComplete(match);
    const ttl = summaryTtlForStatus(match.status, finishedAndConsistent);
    const summaryRes = await manager.getCachedSummary(providerFixtureId, ttl);
    if (summaryRes.category !== "success" || !summaryRes.data) {
      // Rate-limited means the budget is spent — stop cleanly; other failures just
      // skip this match. Either way the canonical baseline is preserved.
      if (summaryRes.category === "rate_limited") break;
      continue;
    }

    const parsedEvents = parseEspnGoalEvents(summaryRes.data, { providerFixtureId });

    const canonicalHomeTeamId = getResolvedHomeTeam(match.match);
    const canonicalAwayTeamId = getResolvedAwayTeam(match.match);
    if (!canonicalHomeTeamId || !canonicalAwayTeamId) continue;

    const context: MergeCanonicalContext = {
      canonicalMatchId: match.internalId,
      canonicalHomeTeamId,
      canonicalAwayTeamId,
      canonicalHomeScore: match.homeScore ?? 0,
      canonicalAwayScore: match.awayScore ?? 0,
      canonicalStatus: toLedgerStatus(match.status),
    };

    const inputs = [];
    for (const ev of parsedEvents.events) {
      const adapted = adaptEspnEventToLedger({
        event: ev,
        mapping: { canonicalMatchId: match.internalId, providerFixtureId, kickoffDifferenceMinutes: 0, source: "automatic" },
        context,
        providerHomeTeamId: fixture.homeProviderTeamId,
        providerAwayTeamId: fixture.awayProviderTeamId,
      });
      if (adapted.attemptEvent) inputs.push(adapted.attemptEvent);
    }

    const attempt: MergeProviderAttempt = {
      state: "complete_snapshot",
      events: inputs,
      fetchedAt: _snapshotGeneratedAt,
      provenance: "espn",
      providerHomeTeamId: fixture.homeProviderTeamId,
      providerAwayTeamId: fixture.awayProviderTeamId,
    };

    const ledgerOutput = mergeProviderAttempt([], attempt, context);
    if (ledgerOutput.completeness.state === "conflicted") {
      // Events are inconsistent with the effective canonical state — preserve baseline.
      continue;
    }

    const activeEvents = ledgerOutput.nextLedger.filter((o) => o.lifecycleState === "active");
    const baselineAcceptedCount = match.scorers.length;

    // Adoption rule: only adopt when the provider is at least as complete as the
    // existing baseline. A richer baseline is never degraded.
    if (activeEvents.length < baselineAcceptedCount) continue;

    const homeDisplay = countryName(canonicalHomeTeamId, "en");
    const awayDisplay = countryName(canonicalAwayTeamId, "en");

    const mappedScorers: GoalScorerEvent[] = activeEvents.map((event) => ({
      type: event.isPenalty ? "PENALTY_GOAL" : "GOAL",
      minute: event.minute,
      stoppageTime: event.extraMinute,
      minuteLabel: event.extraMinute ? `${event.minute}+${event.extraMinute}'` : `${event.minute}'`,
      teamName: event.creditedCanonicalSide === "home" ? homeDisplay : awayDisplay,
      // Never infer the scorer's own club — especially for own goals, where the
      // credited side is the beneficiary, not the player's team.
      playerTeamName: undefined,
      playerName: event.playerName,
      isOwnGoal: event.isOwnGoal,
      isPenalty: event.isPenalty,
      provider: PUBLIC_SCORER_PROVIDER,
      confidence: "high",
    }));

    match.scorers = mappedScorers;
    const espnHomeGoals = 0;
    const espnAwayGoals = 0;
    const failover = false;

    // When the failover advanced the match, propagate the corrected state so
    // every downstream consumer (API response, match detail, group standings)
    // sees FINISHED at the ESPN-derived score without waiting for the primary
    // provider to catch up.
    if (failover) {
      const prevStatus = match.status;
      const prevHome = match.homeScore ?? 0;
      const prevAway = match.awayScore ?? 0;

      match.status = "FINISHED";
      match.homeScore = espnHomeGoals;
      match.awayScore = espnAwayGoals;
      match.goalEventCompleteness = {
        ...match.goalEventCompleteness,
        isGoalEventDataComplete: true,
        missingGoalEventCount: 0,
      };

      if (match.live) {
        const winner =
          espnHomeGoals > espnAwayGoals ? "HOME_TEAM" as const :
          espnAwayGoals > espnHomeGoals ? "AWAY_TEAM" as const :
          "DRAW" as const;
        match.live = { ...match.live, status: "FINISHED", homeScore: espnHomeGoals, awayScore: espnAwayGoals, winner };
      }

      if (match.providerMatchId !== null) {
        const existing = canonicalLiveData.get(match.providerMatchId);
        if (existing) {
          const winner =
            espnHomeGoals > espnAwayGoals ? "HOME_TEAM" as const :
            espnAwayGoals > espnHomeGoals ? "AWAY_TEAM" as const :
            "DRAW" as const;
          canonicalLiveData.set(match.providerMatchId, {
            ...existing,
            status: "FINISHED",
            homeScore: espnHomeGoals,
            awayScore: espnAwayGoals,
            winner,
          });
        }
      }

      console.info(
        `[scorerProviderRuntime] score-status failover: ${match.internalId} ` +
        `${prevStatus} ${prevHome}-${prevAway} → FINISHED ${espnHomeGoals}-${espnAwayGoals} ` +
        `(ESPN "post", ${activeEvents.length} events accepted)`
      );
    } else {
      const expectedGoals = (match.homeScore ?? 0) + (match.awayScore ?? 0);
      match.goalEventCompleteness.missingGoalEventCount = Math.max(0, expectedGoals - activeEvents.length);
    }
  }
}

function toLedgerStatus(status: SerializableSnapshotMatch["status"]): MergeCanonicalContext["canonicalStatus"] {
  switch (status) {
    case "LIVE":
      return "IN_PLAY";
    case "HALFTIME":
    case "SYNCING":
      return "PAUSED";
    case "FINISHED":
      return "FINISHED";
    default:
      return "SCHEDULED";
  }
}
