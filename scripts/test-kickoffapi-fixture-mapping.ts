import assert from "assert";
import {
  KICKOFF_FIXTURE_TOLERANCE_MINUTES,
  REVIEWED_KICKOFF_FIXTURE_OVERRIDES,
  mapKickoffFixturesToCanonicalMatches,
  parseKickoffApiFixtures,
  type KickoffApiFixture,
  type FixtureMappingOverride,
} from "../lib/kickoffApiProvider";
import { MATCHES, matchSlug, matchUtcDate, type Match } from "../lib/matches";
import { countryName } from "../lib/i18n";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  PASS  ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  FAIL  ${name}`);
    console.error(`        ${err?.message ?? err}`);
    failed++;
  }
}

function providerName(key: string): string {
  switch (key) {
    case "bosnia":
      return "Bosnia-Herzegovina";
    case "southKorea":
      return "Korea Republic";
    case "czechia":
      return "Czech Republic";
    case "turkey":
      return "Türkiye";
    case "unitedStates":
      return "USA";
    case "capeVerde":
      return "Cabo Verde";
    case "drCongo":
      return "Congo DR";
    default:
      return countryName(key, "en");
  }
}

function providerId(match: Match): string {
  switch (matchSlug(match)) {
    case "austria-vs-jordan-jun16":
      return "1489382";
    case "turkey-vs-paraguay-jun19":
      return "1539006";
    case "tunisia-vs-japan-jun20":
      return "1489394";
  }
  return `kickoff-${match.providerIds?.footballData ?? matchSlug(match)}`;
}

function rawFixture(match: Match, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  const slug = matchSlug(match);
  const kickoff = matchUtcDate(match);
  if (slug === "austria-vs-jordan-jun16" || slug === "tunisia-vs-japan-jun20") {
    kickoff.setUTCDate(kickoff.getUTCDate() + 1);
  }
  if (slug === "turkey-vs-paraguay-jun19") {
    kickoff.setUTCMinutes(kickoff.getUTCMinutes() + 1380);
  }

  return {
    fixture: {
      id: providerId(match),
      date: kickoff.toISOString(),
    },
    teams: {
      home: { id: `${match.homeKey}-provider`, name: providerName(match.homeKey) },
      away: { id: `${match.awayKey}-provider`, name: providerName(match.awayKey) },
    },
    goals: { home: 99, away: 99 },
    status: { short: "FT" },
    ...overrides,
  };
}

function deterministicRawFixtures(): Record<string, unknown>[] {
  return MATCHES.map((match) => rawFixture(match));
}

function deterministicFixtures(): KickoffApiFixture[] {
  const parsed = parseKickoffApiFixtures({ response: deterministicRawFixtures() });
  assert.strictEqual(parsed.errors.length, 0);
  return parsed.fixtures;
}

function mapOne(match: Match, fixture: KickoffApiFixture, overrides: readonly FixtureMappingOverride[] = []) {
  return mapKickoffFixturesToCanonicalMatches({
    canonicalMatches: [match],
    providerFixtures: [fixture],
    overrides,
  });
}

console.log("=== KickoffAPI fixture mapping test ===\n");

test("all 72 canonical fixtures map uniquely using deterministic fixtures", () => {
  const result = mapKickoffFixturesToCanonicalMatches({
    providerFixtures: deterministicFixtures(),
    overrides: REVIEWED_KICKOFF_FIXTURE_OVERRIDES,
  });
  assert.strictEqual(result.summary.canonicalCount, 72);
  assert.strictEqual(result.mappings.length, 72);
  assert.strictEqual(result.summary.automaticallyMappedCount, 69);
  assert.strictEqual(result.summary.explicitOverrideCount, 3);
  assert.strictEqual(result.summary.unmappedCount, 0);
});

test("Bosnia alias maps", () => {
  const match = MATCHES.find((item) => item.homeKey === "canada" && item.awayKey === "bosnia")!;
  const result = mapOne(match, parseKickoffApiFixtures([rawFixture(match)]).fixtures[0]);
  assert.strictEqual(result.mappings.length, 1);
});

test("South Korea alias maps", () => {
  const match = MATCHES.find((item) => item.homeKey === "southKorea")!;
  const result = mapOne(match, parseKickoffApiFixtures([rawFixture(match)]).fixtures[0]);
  assert.strictEqual(result.mappings.length, 1);
});

test("Czechia alias maps", () => {
  const match = MATCHES.find((item) => item.awayKey === "czechia")!;
  const result = mapOne(match, parseKickoffApiFixtures([rawFixture(match)]).fixtures[0]);
  assert.strictEqual(result.mappings.length, 1);
});

test("Turkey alias maps", () => {
  const match = MATCHES.find((item) => item.awayKey === "turkey")!;
  const result = mapOne(match, parseKickoffApiFixtures([rawFixture(match)]).fixtures[0]);
  assert.strictEqual(result.mappings.length, 1);
});

test("USA alias maps", () => {
  const match = MATCHES.find((item) => item.homeKey === "unitedStates")!;
  const result = mapOne(match, parseKickoffApiFixtures([rawFixture(match)]).fixtures[0]);
  assert.strictEqual(result.mappings.length, 1);
});

test("exact home-away orientation succeeds", () => {
  const match = MATCHES[0];
  const result = mapOne(match, parseKickoffApiFixtures([rawFixture(match)]).fixtures[0]);
  assert.strictEqual(result.mappings[0].canonicalMatchId, matchSlug(match));
});

test("reversed orientation fails", () => {
  const match = MATCHES[0];
  const raw = rawFixture(match, {
    teams: {
      home: { id: "away", name: providerName(match.awayKey) },
      away: { id: "home", name: providerName(match.homeKey) },
    },
  });
  const result = mapOne(match, parseKickoffApiFixtures([raw]).fixtures[0]);
  assert.strictEqual(result.mappings.length, 0);
  assert.strictEqual(result.errors[0].code, "unmapped_fixture");
});

test("kickoff inside tolerance succeeds", () => {
  const match = MATCHES[0];
  const date = new Date(matchUtcDate(match));
  date.setUTCMinutes(date.getUTCMinutes() + KICKOFF_FIXTURE_TOLERANCE_MINUTES);
  const result = mapOne(match, parseKickoffApiFixtures([rawFixture(match, { fixture: { id: providerId(match), date: date.toISOString() } })]).fixtures[0]);
  assert.strictEqual(result.mappings.length, 1);
});

test("kickoff outside tolerance fails", () => {
  const match = MATCHES[0];
  const date = new Date(matchUtcDate(match));
  date.setUTCMinutes(date.getUTCMinutes() + KICKOFF_FIXTURE_TOLERANCE_MINUTES + 1);
  const result = mapOne(match, parseKickoffApiFixtures([rawFixture(match, { fixture: { id: providerId(match), date: date.toISOString() } })]).fixtures[0]);
  assert.strictEqual(result.mappings.length, 0);
  assert.strictEqual(result.errors[0].kickoffDifferenceMinutes, KICKOFF_FIXTURE_TOLERANCE_MINUTES + 1);
});

test("Austria-Jordan fails without explicit override", () => {
  const match = MATCHES.find((item) => matchSlug(item) === "austria-vs-jordan-jun16")!;
  const result = mapOne(match, parseKickoffApiFixtures([rawFixture(match)]).fixtures[0], []);
  assert.strictEqual(result.mappings.length, 0);
  assert.strictEqual(result.errors[0].kickoffDifferenceMinutes, 1440);
});

test("Austria-Jordan succeeds only with explicit reviewed override", () => {
  const match = MATCHES.find((item) => matchSlug(item) === "austria-vs-jordan-jun16")!;
  const result = mapOne(match, parseKickoffApiFixtures([rawFixture(match)]).fixtures[0], REVIEWED_KICKOFF_FIXTURE_OVERRIDES);
  assert.strictEqual(result.mappings.length, 1);
  assert.strictEqual(result.mappings[0].source, "override");
  assert.strictEqual(result.mappings[0].kickoffDifferenceMinutes, 1440);
});

test("ambiguous candidates fail", () => {
  const match = MATCHES[0];
  const fixtureA = rawFixture(match);
  const fixtureB = rawFixture(match, { fixture: { id: "second-provider-id", date: matchUtcDate(match).toISOString() } });
  const result = mapOne(match, parseKickoffApiFixtures([fixtureA, fixtureB]).fixtures[0], []);
  const parsed = parseKickoffApiFixtures([fixtureA, fixtureB]);
  const ambiguous = mapKickoffFixturesToCanonicalMatches({ canonicalMatches: [match], providerFixtures: parsed.fixtures, overrides: [] });
  assert.strictEqual(result.mappings.length, 1);
  assert.strictEqual(ambiguous.mappings.length, 0);
  assert.strictEqual(ambiguous.errors[0].code, "ambiguous_fixture_mapping");
});

test("duplicate provider fixture ID fails", () => {
  const match = MATCHES[0];
  const parsed = parseKickoffApiFixtures([rawFixture(match), rawFixture(match)]);
  const result = mapKickoffFixturesToCanonicalMatches({ canonicalMatches: [match], providerFixtures: parsed.fixtures, overrides: [] });
  assert.ok(result.errors.some((error) => error.code === "duplicate_provider_fixture_id"));
});

test("duplicate canonical mapping fails", () => {
  const match = MATCHES[0];
  const result = mapKickoffFixturesToCanonicalMatches({
    canonicalMatches: [match, match],
    providerFixtures: parseKickoffApiFixtures([rawFixture(match)]).fixtures,
    overrides: [],
  });
  assert.ok(result.errors.some((error) => error.code === "duplicate_canonical_match"));
});

test("invalid timestamp fails fixture parsing", () => {
  const match = MATCHES[0];
  const parsed = parseKickoffApiFixtures([rawFixture(match, { fixture: { id: providerId(match), date: "not-a-date" } })]);
  assert.strictEqual(parsed.fixtures.length, 0);
  assert.strictEqual(parsed.errors[0].code, "invalid_fixture");
});

test("stale provider score and status have no mapping effect", () => {
  const match = MATCHES[0];
  const parsed = parseKickoffApiFixtures([rawFixture(match, { goals: { home: 7, away: 7 }, status: { short: "NS" } })]);
  const result = mapOne(match, parsed.fixtures[0]);
  assert.strictEqual(result.mappings.length, 1);
});

test("substring and fuzzy accidental names do not match", () => {
  const match = MATCHES.find((item) => item.homeKey === "unitedStates")!;
  const raw = rawFixture(match, {
    teams: {
      home: { id: "bad-home", name: "United" },
      away: { id: "away", name: providerName(match.awayKey) },
    },
  });
  const result = mapOne(match, parseKickoffApiFixtures([raw]).fixtures[0]);
  assert.strictEqual(result.mappings.length, 0);
  assert.strictEqual(result.errors[0].code, "unmapped_fixture");
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
