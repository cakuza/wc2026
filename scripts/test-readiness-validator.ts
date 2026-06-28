/**
 * Deterministic offline tests for lib/readinessValidator.ts.
 *
 * No network calls.  Build a minimal fixture of WorldCup26Game[] objects that
 * mirror what the secondary provider returns, then assert validateProviderPayload
 * classifies them correctly.
 *
 * Run with:
 *   npx tsx scripts/test-readiness-validator.ts
 */

import assert from "assert";
import { MATCHES, matchSlug } from "../lib/matches";
import { countryName } from "../lib/i18n";
import {
  validateProviderPayload,
  normalizeForMatching,
  HIGH_THRESHOLD,
  completedSlugsBefore,
} from "../lib/readinessValidator";
import type { WorldCup26Game, GoalScorerEvent } from "../lib/worldcup26Provider";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeGame(
  homeKey: string,
  awayKey: string,
  overrides: Partial<WorldCup26Game> = {},
): WorldCup26Game {
  const homeDisp = countryName(homeKey, "en");
  const awayDisp = countryName(awayKey, "en");
  return {
    providerGameId: `${homeKey}-${awayKey}`,
    homeTeamName: homeDisp,
    awayTeamName: awayDisp,
    homeScore: null,
    awayScore: null,
    finished: false,
    homeScorers: [],
    awayScorers: [],
    localDate: null,
    ...overrides,
  };
}

function fakeScorer(playerName = "Test Player", minute: number | null = 45): GoalScorerEvent {
  return {
    type: "GOAL",
    minute,
    playerName,
    teamName: "Test Team",
    provider: "worldcup26.ir",
    confidence: "high",
  };
}

/** Known scores required by KNOWN_SCORER_REQUIREMENTS in readinessValidator. */
const KNOWN_SCORES: Record<string, { h: number; a: number }> = {
  "mexico|southAfrica":     { h: 2, a: 0 },
  "southKorea|czechia":     { h: 2, a: 1 },
};

/** Build all 72 group-stage games as healthy finished-with-scorers entries.
 *  Knockout matches are excluded: they have "tbd" participants and cannot be
 *  matched against real team names in the provider payload. */
function buildFullHealthyPayload(): WorldCup26Game[] {
  const groupMatches = MATCHES.filter(
    (m) => !("stage" in m) || m.stage === "group" || m.stage === undefined,
  );
  return groupMatches.map((m) => {
    const homeDisp = countryName(m.homeKey, "en");
    const awayDisp = countryName(m.awayKey, "en");
    const knownKey = `${m.homeKey}|${m.awayKey}`;
    const scores = KNOWN_SCORES[knownKey] ?? { h: 1, a: 0 };
    const homeScorers = Array.from({ length: scores.h }, (_, i) => fakeScorer(`Home Player ${i + 1}`));
    const awayScorers = Array.from({ length: scores.a }, (_, i) => fakeScorer(`Away Player ${i + 1}`));
    return {
      providerGameId: `${m.homeKey}-${m.awayKey}`,
      homeTeamName: homeDisp,
      awayTeamName: awayDisp,
      homeScore: scores.h,
      awayScore: scores.a,
      finished: true,
      homeScorers,
      awayScorers,
      localDate: m.date,
    };
  });
}

/** Past-match slugs: all matches before 2026-06-16 (today in session context). */
const COMPLETED_SLUGS = completedSlugsBefore("2026-06-16");

// ── Test runner ───────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e: any) {
    console.error(`  ❌ ${name}`);
    console.error(`     ${e.message ?? e}`);
    failed++;
  }
}

// ── Scenario 1: Complete healthy payload ──────────────────────────────────────

console.log("\n=== Scenario 1: Complete healthy payload (all 72 matches, valid scorers) ===");

test("Result is ok", () => {
  const games = buildFullHealthyPayload();
  const result = validateProviderPayload(games, COMPLETED_SLUGS);
  assert.strictEqual(result.ok, true, `Errors: ${result.errors.join("; ")}`);
});

test("No errors", () => {
  const games = buildFullHealthyPayload();
  const result = validateProviderPayload(games, COMPLETED_SLUGS);
  assert.deepStrictEqual(result.errors, []);
});

test("mappedCount is 72", () => {
  const games = buildFullHealthyPayload();
  const result = validateProviderPayload(games, COMPLETED_SLUGS);
  assert.strictEqual(result.mappedCount, 72);
});

// ── Scenario 2: Only 10 matches ───────────────────────────────────────────────

console.log("\n=== Scenario 2: Payload with only 10 matches ===");

test("Result is NOT ok", () => {
  const games = buildFullHealthyPayload().slice(0, 10);
  const result = validateProviderPayload(games, COMPLETED_SLUGS);
  assert.strictEqual(result.ok, false);
});

test("Error mentions payload too small", () => {
  const games = buildFullHealthyPayload().slice(0, 10);
  const result = validateProviderPayload(games, COMPLETED_SLUGS);
  const hasSmallError = result.errors.some((e) => e.includes("Payload too small") || e.includes("Coverage too low"));
  assert.strictEqual(hasSmallError, true, `Errors: ${result.errors.join("; ")}`);
});

test(`Threshold is ${HIGH_THRESHOLD}`, () => {
  assert.ok(HIGH_THRESHOLD >= 60, `HIGH_THRESHOLD ${HIGH_THRESHOLD} is unexpectedly low`);
  assert.ok(HIGH_THRESHOLD <= 72, `HIGH_THRESHOLD ${HIGH_THRESHOLD} exceeds total matches`);
});

// ── Scenario 3: Required completed match missing ───────────────────────────────

console.log("\n=== Scenario 3: Required completed match missing from payload ===");

test("Result is NOT ok when a completed match is absent", () => {
  const games = buildFullHealthyPayload();
  // Remove the first completed match slug from the payload
  const firstCompleted = [...COMPLETED_SLUGS][0];
  const match = MATCHES.find((m) => matchSlug(m) === firstCompleted)!;
  const homeDisp = normalizeForMatching(countryName(match.homeKey, "en"));
  const awayDisp = normalizeForMatching(countryName(match.awayKey, "en"));
  const filtered = games.filter((g) => {
    return !(
      normalizeForMatching(g.homeTeamName) === homeDisp &&
      normalizeForMatching(g.awayTeamName) === awayDisp
    );
  });
  const result = validateProviderPayload(filtered, COMPLETED_SLUGS);
  assert.strictEqual(result.ok, false);
});

test("Error message names the missing slug", () => {
  const games = buildFullHealthyPayload();
  const firstCompleted = [...COMPLETED_SLUGS][0];
  const match = MATCHES.find((m) => matchSlug(m) === firstCompleted)!;
  const homeDisp = normalizeForMatching(countryName(match.homeKey, "en"));
  const awayDisp = normalizeForMatching(countryName(match.awayKey, "en"));
  const filtered = games.filter((g) => {
    return !(
      normalizeForMatching(g.homeTeamName) === homeDisp &&
      normalizeForMatching(g.awayTeamName) === awayDisp
    );
  });
  const result = validateProviderPayload(filtered, COMPLETED_SLUGS);
  const hasSlugError = result.errors.some((e) => e.includes(firstCompleted));
  assert.strictEqual(hasSlugError, true, `Errors: ${result.errors.join("; ")}`);
});

// ── Scenario 4: Known scorer match missing events ─────────────────────────────

console.log("\n=== Scenario 4: Known scorer match has zero scorer events ===");

test("Result is NOT ok when Mexico vs South Africa has 2-0 but zero scorers", () => {
  const games = buildFullHealthyPayload().map((g) => {
    if (
      normalizeForMatching(g.homeTeamName) === "mexico" &&
      normalizeForMatching(g.awayTeamName) === "southafrica"
    ) {
      return { ...g, homeScore: 2, awayScore: 0, finished: true, homeScorers: [], awayScorers: [] };
    }
    return g;
  });
  const result = validateProviderPayload(games, COMPLETED_SLUGS);
  assert.strictEqual(result.ok, false);
});

test("Error mentions Mexico vs South Africa scorer insufficiency or zero events", () => {
  const games = buildFullHealthyPayload().map((g) => {
    if (
      normalizeForMatching(g.homeTeamName) === "mexico" &&
      normalizeForMatching(g.awayTeamName) === "southafrica"
    ) {
      return { ...g, homeScore: 2, awayScore: 0, finished: true, homeScorers: [], awayScorers: [] };
    }
    return g;
  });
  const result = validateProviderPayload(games, COMPLETED_SLUGS);
  const hasMexError = result.errors.some(
    (e) => e.toLowerCase().includes("mexico") || e.includes("home scorers insufficient"),
  );
  assert.strictEqual(hasMexError, true, `Errors: ${result.errors.join("; ")}`);
});

// ── Scenario 5: Malformed event array ────────────────────────────────────────

console.log("\n=== Scenario 5: Malformed scorer arrays (non-Array values) ===");

test("Result is NOT ok when homeScorers is not an array", () => {
  const games = buildFullHealthyPayload().map((g) => {
    if (
      normalizeForMatching(g.homeTeamName) === "mexico" &&
      normalizeForMatching(g.awayTeamName) === "southafrica"
    ) {
      // Cast to simulate corrupted payload
      return { ...g, homeScore: 2, awayScore: 0, finished: true, homeScorers: null as any, awayScorers: [] };
    }
    return g;
  });
  const result = validateProviderPayload(games, COMPLETED_SLUGS);
  assert.strictEqual(result.ok, false);
});

test("Error mentions malformed scorer arrays or missing home scorers", () => {
  const games = buildFullHealthyPayload().map((g) => {
    if (
      normalizeForMatching(g.homeTeamName) === "mexico" &&
      normalizeForMatching(g.awayTeamName) === "southafrica"
    ) {
      return { ...g, homeScore: 2, awayScore: 0, finished: true, homeScorers: null as any, awayScorers: [] };
    }
    return g;
  });
  const result = validateProviderPayload(games, COMPLETED_SLUGS);
  const hasMalformError = result.errors.some(
    (e) =>
      e.includes("malformed scorer") ||
      e.includes("not Array") ||
      e.includes("home scorers insufficient") ||
      e.includes("scorer arrays"),
  );
  assert.strictEqual(hasMalformError, true, `Errors: ${result.errors.join("; ")}`);
});

test("Scorer event with empty playerName is flagged", () => {
  const games = buildFullHealthyPayload().map((g) => {
    if (
      normalizeForMatching(g.homeTeamName) === "mexico" &&
      normalizeForMatching(g.awayTeamName) === "southafrica"
    ) {
      return {
        ...g,
        homeScore: 2,
        awayScore: 0,
        finished: true,
        homeScorers: [fakeScorer("   ")], // blank name
        awayScorers: [],
      };
    }
    return g;
  });
  const result = validateProviderPayload(games, COMPLETED_SLUGS);
  assert.strictEqual(result.ok, false);
  const hasNameError = result.errors.some((e) => e.includes("playerName"));
  assert.strictEqual(hasNameError, true, `Errors: ${result.errors.join("; ")}`);
});

test("Scorer event with non-number non-null minute is flagged", () => {
  const games = buildFullHealthyPayload().map((g) => {
    if (
      normalizeForMatching(g.homeTeamName) === "mexico" &&
      normalizeForMatching(g.awayTeamName) === "southafrica"
    ) {
      return {
        ...g,
        homeScore: 2,
        awayScore: 0,
        finished: true,
        homeScorers: [{ ...fakeScorer("Good Player"), minute: "45" as any }],
        awayScorers: [],
      };
    }
    return g;
  });
  const result = validateProviderPayload(games, COMPLETED_SLUGS);
  assert.strictEqual(result.ok, false);
  const hasMinuteError = result.errors.some((e) => e.includes("minute"));
  assert.strictEqual(hasMinuteError, true, `Errors: ${result.errors.join("; ")}`);
});

// ── Scenario 6: Duplicate / unmappable records ────────────────────────────────

console.log("\n=== Scenario 6: Duplicate records for the same fixture ===");

test("Result is NOT ok when the same fixture appears twice", () => {
  const games = buildFullHealthyPayload();
  // Duplicate the Mexico vs South Africa game
  const mexGame = games.find(
    (g) =>
      normalizeForMatching(g.homeTeamName) === "mexico" &&
      normalizeForMatching(g.awayTeamName) === "southafrica",
  )!;
  const withDupe = [...games, { ...mexGame, providerGameId: "dupe" }];
  const result = validateProviderPayload(withDupe, COMPLETED_SLUGS);
  assert.strictEqual(result.ok, false);
});

test("Error mentions duplicate fixture key", () => {
  const games = buildFullHealthyPayload();
  const mexGame = games.find(
    (g) =>
      normalizeForMatching(g.homeTeamName) === "mexico" &&
      normalizeForMatching(g.awayTeamName) === "southafrica",
  )!;
  const withDupe = [...games, { ...mexGame, providerGameId: "dupe" }];
  const result = validateProviderPayload(withDupe, COMPLETED_SLUGS);
  const hasDupeError = result.errors.some((e) => e.includes("Duplicate"));
  assert.strictEqual(hasDupeError, true, `Errors: ${result.errors.join("; ")}`);
});

test("completedSlugsBefore gives 0 slugs for a date before tournament", () => {
  const before = completedSlugsBefore("2026-06-10");
  assert.strictEqual(before.size, 0);
});

test("completedSlugsBefore gives non-zero slugs for 2026-06-16", () => {
  const slugs = completedSlugsBefore("2026-06-16");
  assert.ok(slugs.size > 0, "Expected some completed matches by Jun 16");
});

// ── Scenario 7: Canonical score falsification — South Korea vs Czechia ───────

console.log("\n=== Scenario 7: Wrong score for South Korea vs Czechia is rejected ===");

function patchKoreaScore(homeScore: number, awayScore: number): WorldCup26Game[] {
  return buildFullHealthyPayload().map((g) => {
    if (
      normalizeForMatching(g.homeTeamName) === "southkorea" &&
      normalizeForMatching(g.awayTeamName) === "czechia"
    ) {
      const homeScorers = Array.from({ length: homeScore }, (_, i) => fakeScorer(`Home ${i + 1}`));
      const awayScorers = Array.from({ length: awayScore }, (_, i) => fakeScorer(`Away ${i + 1}`));
      return { ...g, homeScore, awayScore, finished: true, homeScorers, awayScorers };
    }
    return g;
  });
}

test("Correct canonical 2-1 payload passes for South Korea vs Czechia", () => {
  const games = patchKoreaScore(2, 1);
  const result = validateProviderPayload(games, COMPLETED_SLUGS);
  assert.strictEqual(result.ok, true, `Errors: ${result.errors.join("; ")}`);
});

test("False 3-1 payload fails for South Korea vs Czechia", () => {
  const games = patchKoreaScore(3, 1);
  const result = validateProviderPayload(games, COMPLETED_SLUGS);
  assert.strictEqual(result.ok, false, "Expected failure for incorrect 3-1 score");
  const hasScoreError = result.errors.some((e) =>
    e.includes("score mismatch") && (e.includes("3") || e.includes("South Korea")),
  );
  assert.strictEqual(hasScoreError, true, `Expected score-mismatch error, got: ${result.errors.join("; ")}`);
});

test("False 1-0 payload fails for South Korea vs Czechia", () => {
  const games = patchKoreaScore(1, 0);
  const result = validateProviderPayload(games, COMPLETED_SLUGS);
  assert.strictEqual(result.ok, false, "Expected failure for incorrect 1-0 score");
  const hasScoreError = result.errors.some((e) => e.includes("score mismatch"));
  assert.strictEqual(hasScoreError, true, `Expected score-mismatch error, got: ${result.errors.join("; ")}`);
});

test("Missing scorer events for South Korea vs Czechia fails", () => {
  const games = buildFullHealthyPayload().map((g) => {
    if (
      normalizeForMatching(g.homeTeamName) === "southkorea" &&
      normalizeForMatching(g.awayTeamName) === "czechia"
    ) {
      return { ...g, homeScore: 2, awayScore: 1, finished: true, homeScorers: [], awayScorers: [] };
    }
    return g;
  });
  const result = validateProviderPayload(games, COMPLETED_SLUGS);
  assert.strictEqual(result.ok, false, "Expected failure when scorer events missing");
  const hasError = result.errors.some(
    (e) => e.includes("home scorers insufficient") || e.includes("zero scorer events") || e.includes("away scorers insufficient"),
  );
  assert.strictEqual(hasError, true, `Expected scorer error, got: ${result.errors.join("; ")}`);
});

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(56)}`);
console.log(`Readiness validator: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
