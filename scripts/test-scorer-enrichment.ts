export {};

/**
 * Unit test for scorer string parsing logic.
 *
 * Tests the regex-based parser used to extract playerName + minute from
 * scorer strings like "J. Quiñones 9'" or "R. Jiménez 67'".
 *
 * Also tests top-scorer aggregation from parsed goal events.
 *
 * Does NOT make network requests.
 *
 * Usage:
 *   npx tsx scripts/test-scorer-enrichment.ts
 */

// ── Parser (mirrors lib/worldcup26Provider.ts logic) ─────────────────────────

type ParsedGoal = {
  playerName: string;
  minute: number | null;
  teamName: string;
  type: "GOAL";
  provider: "worldcup26.ir";
  confidence: "high" | "medium" | "low";
};

// Matches: "<name> <minute>[+<extra>]'"
const SCORER_RE = /^(.+?)\s+(\d+)(?:\+\d+)?'?$/;

function parseScorer(raw: string, teamName: string): ParsedGoal {
  const m = SCORER_RE.exec(raw.trim());
  if (m) {
    return {
      playerName: m[1].trim(),
      minute: parseInt(m[2], 10),
      teamName,
      type: "GOAL",
      provider: "worldcup26.ir",
      confidence: "high",
    };
  }
  return {
    playerName: raw.trim(),
    minute: null,
    teamName,
    type: "GOAL",
    provider: "worldcup26.ir",
    confidence: "low",
  };
}

function parseScorers(raw: unknown[], teamName: string): ParsedGoal[] {
  return raw
    .filter((s) => typeof s === "string" && s.trim().length > 0)
    .map((s) => parseScorer(s as string, teamName));
}

function aggregateTopScorers(goals: ParsedGoal[]): { playerName: string; teamName: string; goals: number }[] {
  const map = new Map<string, { playerName: string; teamName: string; goals: number }>();
  for (const g of goals) {
    if (!g.playerName) continue;
    const existing = map.get(g.playerName);
    if (existing) {
      existing.goals++;
    } else {
      map.set(g.playerName, { playerName: g.playerName, teamName: g.teamName, goals: 1 });
    }
  }
  return [...map.values()].sort((a, b) => b.goals - a.goals);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  PASS  ${msg}`);
    passed++;
  } else {
    console.error(`  FAIL  ${msg}`);
    failed++;
  }
}

console.log("=== Scorer enrichment test ===\n");

// ── A) Standard scorer strings ────────────────────────────────────────────────
console.log("A) Standard scorer strings:");

const quin = parseScorer("J. Quiñones 9'", "Mexico");
assert(quin.playerName === "J. Quiñones", `playerName = "J. Quiñones" (got "${quin.playerName}")`);
assert(quin.minute === 9, `minute = 9 (got ${quin.minute})`);
assert(quin.confidence === "high", "confidence = high");

const jim = parseScorer("R. Jiménez 67'", "Mexico");
assert(jim.playerName === "R. Jiménez", `playerName = "R. Jiménez" (got "${jim.playerName}")`);
assert(jim.minute === 67, `minute = 67 (got ${jim.minute})`);
assert(jim.confidence === "high", "confidence = high");

// No trailing apostrophe variant
const noApos = parseScorer("Lamine Yamal 31", "Spain");
assert(noApos.playerName === "Lamine Yamal", `playerName = "Lamine Yamal" (got "${noApos.playerName}")`);
assert(noApos.minute === 31, `minute = 31 (got ${noApos.minute})`);

// Stoppage-time variant: "90+3'"
const stoppage = parseScorer("L. Messi 90+3'", "Argentina");
assert(stoppage.playerName === "L. Messi", `stoppage-time: playerName = "L. Messi"`);
assert(stoppage.minute === 90, `stoppage-time: base minute = 90 (got ${stoppage.minute})`);
assert(stoppage.confidence === "high", "stoppage-time: confidence = high");

// ── B) Malformed strings ──────────────────────────────────────────────────────
console.log("\nB) Malformed / low-confidence strings:");

const noMinute = parseScorer("Unknown Player", "Mexico");
assert(noMinute.minute === null, "no minute → minute = null");
assert(noMinute.confidence === "low", "no minute → confidence = low");
assert(noMinute.playerName === "Unknown Player", "malformed: playerName preserved");

const empty = parseScorers(["", "  "], "Mexico");
assert(empty.length === 0, "empty strings filtered out");

// ── C) Multi-scorer parsing ───────────────────────────────────────────────────
console.log("\nC) Multi-scorer array parsing:");

const rawScorers = ["J. Quiñones 9'", "R. Jiménez 67'"];
const parsed = parseScorers(rawScorers, "Mexico");
assert(parsed.length === 2, "2 scorers parsed");
assert(parsed[0].playerName === "J. Quiñones", "first scorer = J. Quiñones");
assert(parsed[1].playerName === "R. Jiménez", "second scorer = R. Jiménez");

// Mixed valid + invalid
const mixed = parseScorers(["J. Quiñones 9'", "Unknown", "R. Jiménez 67'"], "Mexico");
assert(mixed.length === 3, "3 entries (malformed included, not silently dropped)");
assert(mixed[1].confidence === "low", "malformed entry marked low confidence");

// ── D) Top scorer aggregation ─────────────────────────────────────────────────
console.log("\nD) Top scorer aggregation:");

const goals: ParsedGoal[] = [
  { playerName: "J. Quiñones", minute: 9,  teamName: "Mexico", type: "GOAL", provider: "worldcup26.ir", confidence: "high" },
  { playerName: "R. Jiménez",  minute: 67, teamName: "Mexico", type: "GOAL", provider: "worldcup26.ir", confidence: "high" },
  { playerName: "J. Quiñones", minute: 88, teamName: "Mexico", type: "GOAL", provider: "worldcup26.ir", confidence: "high" },
  { playerName: "L. Messi",    minute: 15, teamName: "Argentina", type: "GOAL", provider: "worldcup26.ir", confidence: "high" },
];

const topList = aggregateTopScorers(goals);
assert(topList.length === 3, "3 distinct scorers");
assert(topList[0].playerName === "J. Quiñones", "top scorer = J. Quiñones");
assert(topList[0].goals === 2, "J. Quiñones has 2 goals");
assert(topList[1].goals === 1, "second scorer has 1 goal");

// Empty input
const emptyTop = aggregateTopScorers([]);
assert(emptyTop.length === 0, "empty goals → empty top scorers");

// ── E) Shared scorer enrichment map (live network check) ─────────────────────
async function runSharedMapTests() {
  console.log("\nE) Shared scorer enrichment map:");

  const { getScorerEventsByInternalMatchId } = await import("../lib/worldcup26Provider");
  const { MATCHES, matchSlug } = await import("../lib/matches");
  const { countryName } = await import("../lib/i18n");

  const scorerMap = await getScorerEventsByInternalMatchId();

  const mexMatch = MATCHES.find(
    (m) => countryName(m.homeKey, "en") === "Mexico" && countryName(m.awayKey, "en") === "South Africa",
  );
  const korMatch = MATCHES.find(
    (m) => countryName(m.homeKey, "en") === "South Korea" && countryName(m.awayKey, "en") === "Czechia",
  );

  if (mexMatch) {
    const slug = matchSlug(mexMatch);
    assert(scorerMap.has(slug), `shared map contains "${slug}"`);
  }

  if (korMatch) {
    const slug = matchSlug(korMatch);
    assert(scorerMap.has(slug), `shared map contains "${slug}"`);
    const events = scorerMap.get(slug) ?? [];
    if (scorerMap.has(slug)) {
      assert(events.length === 3, `${slug} has 3 scorer events (got ${events.length})`);
      const teamNames = new Set(events.map((e) => e.teamName));
      assert(teamNames.has("South Korea"), `${slug} events use internal display name "South Korea"`);
      assert(teamNames.has("Czechia"), `${slug} events use internal display name "Czechia" (alias for provider's "Czech Republic")`);
      assert(!teamNames.has("Czech Republic"), `${slug} events do NOT use raw provider name "Czech Republic"`);
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}

runSharedMapTests().catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});
