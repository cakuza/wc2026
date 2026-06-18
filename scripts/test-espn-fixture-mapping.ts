import assert from "assert";
import {
  mapEspnFixturesToCanonicalMatches,
  type EspnFixture,
} from "../lib/espnProvider";
import { MATCHES, matchSlug, matchUtcDate } from "../lib/matches";
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

console.log("=== ESPN Fixture Mapping Tests ===");

function fixtureFor(homeKey: string, awayKey: string, opts: { homeName?: string; awayName?: string; id?: string; offsetMin?: number } = {}): EspnFixture {
  const match = MATCHES.find((m) => m.homeKey === homeKey && m.awayKey === awayKey)!;
  const kickoff = new Date(matchUtcDate(match).getTime() + (opts.offsetMin ?? 0) * 60_000);
  return {
    providerFixtureId: opts.id ?? `espn-${homeKey}-${awayKey}`,
    homeProviderTeamId: `h-${homeKey}`,
    homeTeamName: opts.homeName ?? countryName(homeKey, "en"),
    awayProviderTeamId: `a-${awayKey}`,
    awayTeamName: opts.awayName ?? countryName(awayKey, "en"),
    kickoffTimestamp: kickoff.toISOString(),
    status: "post",
  };
}

test("maps full real-name fixtures to canonical with zero errors on team identity", () => {
  const fixtures = MATCHES.map((m) => fixtureFor(m.homeKey, m.awayKey, { id: `e-${matchSlug(m)}` }));
  const result = mapEspnFixturesToCanonicalMatches({ providerFixtures: fixtures });
  assert.strictEqual(result.summary.unmappedCount, 0, `unmapped: ${result.summary.unmappedCount}`);
  assert.strictEqual(result.summary.ambiguousCount, 0);
  assert.strictEqual(result.mappings.length, MATCHES.length);
});

test("alias: ESPN spellings map (Türkiye, Congo DR, Bosnia-Herzegovina, Czech Republic)", () => {
  const cases: Array<[string, string, string]> = [
    ["turkey", "Türkiye", "turkey alias"],
    ["drCongo", "Congo DR", "congo alias"],
    ["bosnia", "Bosnia-Herzegovina", "bosnia alias"],
    ["czechia", "Czech Republic", "czechia alias"],
  ];
  for (const [key, espnName] of cases) {
    const asHome = MATCHES.find((m) => m.homeKey === key);
    const asAway = MATCHES.find((m) => m.awayKey === key);
    if (asHome) {
      const fx = fixtureFor(asHome.homeKey, asHome.awayKey, { homeName: espnName });
      const r = mapEspnFixturesToCanonicalMatches({ providerFixtures: [fx] });
      assert.ok(r.mappings.some((m) => m.canonicalMatchId === matchSlug(asHome)), `${espnName} home should map`);
    } else if (asAway) {
      const fx = fixtureFor(asAway.homeKey, asAway.awayKey, { awayName: espnName });
      const r = mapEspnFixturesToCanonicalMatches({ providerFixtures: [fx] });
      assert.ok(r.mappings.some((m) => m.canonicalMatchId === matchSlug(asAway)), `${espnName} away should map`);
    }
  }
});

test("kickoff tolerance: a fixture one day off does not map", () => {
  const m = MATCHES[0];
  const fx = fixtureFor(m.homeKey, m.awayKey, { offsetMin: 24 * 60 });
  const r = mapEspnFixturesToCanonicalMatches({ providerFixtures: [fx] });
  assert.strictEqual(r.mappings.length, 0);
  assert.ok(r.errors.some((e) => e.code === "unmapped_fixture"));
});

test("kickoff tolerance: a fixture within tolerance maps", () => {
  const m = MATCHES[0];
  const fx = fixtureFor(m.homeKey, m.awayKey, { offsetMin: 60 });
  const r = mapEspnFixturesToCanonicalMatches({ providerFixtures: [fx] });
  assert.strictEqual(r.mappings.length, 1);
  assert.strictEqual(r.mappings[0].canonicalMatchId, matchSlug(m));
});

test("ambiguous: two fixtures for same teams within tolerance → no mapping, error", () => {
  const m = MATCHES[0];
  const fixtures = [
    fixtureFor(m.homeKey, m.awayKey, { id: "dup-a", offsetMin: 0 }),
    fixtureFor(m.homeKey, m.awayKey, { id: "dup-b", offsetMin: 30 }),
  ];
  const r = mapEspnFixturesToCanonicalMatches({ providerFixtures: fixtures });
  assert.ok(!r.mappings.some((x) => x.canonicalMatchId === matchSlug(m)));
  assert.ok(r.errors.some((e) => e.code === "ambiguous_fixture_mapping"));
  assert.strictEqual(r.summary.ambiguousCount, 1);
});

test("duplicate provider fixture id reported", () => {
  const m0 = MATCHES[0];
  const m1 = MATCHES[1];
  const fixtures = [
    fixtureFor(m0.homeKey, m0.awayKey, { id: "same" }),
    fixtureFor(m1.homeKey, m1.awayKey, { id: "same" }),
  ];
  const r = mapEspnFixturesToCanonicalMatches({ providerFixtures: fixtures });
  assert.ok(r.summary.duplicateProviderIds.includes("same"));
  assert.ok(r.errors.some((e) => e.code === "duplicate_provider_fixture_id"));
});

test("unknown team names do not map (no fabrication)", () => {
  const m = MATCHES[0];
  const fx = fixtureFor(m.homeKey, m.awayKey, { homeName: "Atlantis", awayName: "El Dorado" });
  const r = mapEspnFixturesToCanonicalMatches({ providerFixtures: [fx] });
  assert.strictEqual(r.mappings.length, 0);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
