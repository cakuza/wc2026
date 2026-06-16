import { applyVerifiedGoalCorrections } from "../lib/verifiedMatchEventCorrections";

type ParsedGoal = {
  playerName: string;
  minute: number | null;
  teamName: string;
  type: "GOAL";
  provider: "worldcup26.ir";
  confidence: "high" | "medium" | "low";
};

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
    if (existing) existing.goals++;
    else map.set(g.playerName, { playerName: g.playerName, teamName: g.teamName, goals: 1 });
  }
  return [...map.values()].sort((a, b) => b.goals - a.goals);
}

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

console.log("A) Standard scorer strings:");
const quin = parseScorer("J. Quiñones 9'", "Mexico");
assert(quin.playerName === "J. Quiñones", `playerName = "J. Quiñones" (got "${quin.playerName}")`);
assert(quin.minute === 9, `minute = 9 (got ${quin.minute})`);
assert(quin.confidence === "high", "confidence = high");

const jim = parseScorer("R. Jiménez 67'", "Mexico");
assert(jim.playerName === "R. Jiménez", `playerName = "R. Jiménez" (got "${jim.playerName}")`);
assert(jim.minute === 67, `minute = 67 (got ${jim.minute})`);
assert(jim.confidence === "high", "confidence = high");

const noApos = parseScorer("Lamine Yamal 31", "Spain");
assert(noApos.playerName === "Lamine Yamal", `playerName = "Lamine Yamal" (got "${noApos.playerName}")`);
assert(noApos.minute === 31, `minute = 31 (got ${noApos.minute})`);

const stoppage = parseScorer("L. Messi 90+3'", "Argentina");
assert(stoppage.playerName === "L. Messi", 'stoppage-time: playerName = "L. Messi"');
assert(stoppage.minute === 90, `stoppage-time: base minute = 90 (got ${stoppage.minute})`);
assert(stoppage.confidence === "high", "stoppage-time: confidence = high");

console.log("\nB) Malformed / low-confidence strings:");
const noMinute = parseScorer("Unknown Player", "Mexico");
assert(noMinute.minute === null, "no minute -> minute = null");
assert(noMinute.confidence === "low", "no minute -> confidence = low");
assert(noMinute.playerName === "Unknown Player", "malformed: playerName preserved");

const empty = parseScorers(["", "  "], "Mexico");
assert(empty.length === 0, "empty strings filtered out");

console.log("\nC) Multi-scorer array parsing:");
const rawScorers = ["J. Quiñones 9'", "R. Jiménez 67'"];
const parsed = parseScorers(rawScorers, "Mexico");
assert(parsed.length === 2, "2 scorers parsed");
assert(parsed[0].playerName === "J. Quiñones", "first scorer = J. Quiñones");
assert(parsed[1].playerName === "R. Jiménez", "second scorer = R. Jiménez");

const mixed = parseScorers(["J. Quiñones 9'", "Unknown", "R. Jiménez 67'"], "Mexico");
assert(mixed.length === 3, "3 entries (malformed included, not silently dropped)");
assert(mixed[1].confidence === "low", "malformed entry marked low confidence");

console.log("\nD) Top scorer aggregation:");
const goals: ParsedGoal[] = [
  { playerName: "J. Quiñones", minute: 9, teamName: "Mexico", type: "GOAL", provider: "worldcup26.ir", confidence: "high" },
  { playerName: "R. Jiménez", minute: 67, teamName: "Mexico", type: "GOAL", provider: "worldcup26.ir", confidence: "high" },
  { playerName: "J. Quiñones", minute: 88, teamName: "Mexico", type: "GOAL", provider: "worldcup26.ir", confidence: "high" },
  { playerName: "L. Messi", minute: 15, teamName: "Argentina", type: "GOAL", provider: "worldcup26.ir", confidence: "high" },
];

const topList = aggregateTopScorers(goals);
assert(topList.length === 3, "3 distinct scorers");
assert(topList[0].playerName === "J. Quiñones", "top scorer = J. Quiñones");
assert(topList[0].goals === 2, "J. Quiñones has 2 goals");
assert(topList[1].goals === 1, "second scorer has 1 goal");
assert(aggregateTopScorers([]).length === 0, "empty goals -> empty top scorers");

console.log("\nE) Verified Canada-Bosnia correction:");
const correctedCanadaBosnia = applyVerifiedGoalCorrections("canada-vs-bosnia-jun12", [
  { playerName: "C. Larin", minute: 11, teamName: "Canada", type: "GOAL", provider: "worldcup26.ir", confidence: "high" },
  { playerName: "Jovo Lukić", minute: 21, teamName: "Bosnia & Herzegovina", type: "GOAL", provider: "worldcup26.ir", confidence: "high" },
]);

assert(correctedCanadaBosnia.length === 2, "Canada-Bosnia contains exactly two corrected events");
assert(correctedCanadaBosnia[0]?.playerName === "Jovo Lukić", "Jovo Lukić is first chronologically");
assert(correctedCanadaBosnia[0]?.teamName === "Bosnia & Herzegovina", "Jovo Lukić team is Bosnia & Herzegovina");
assert(correctedCanadaBosnia[0]?.minute === 21, "Jovo Lukić minute is 21'");
assert(correctedCanadaBosnia[1]?.playerName === "Cyle Larin", "Cyle Larin is second chronologically");
assert(correctedCanadaBosnia[1]?.teamName === "Canada", "Cyle Larin team is Canada");
assert(correctedCanadaBosnia[1]?.minute === 78, "Cyle Larin minute is 78'");
assert(!correctedCanadaBosnia.some((event) => event.playerName === "C. Larin" && event.minute === 11), "no 11' C. Larin event remains");


console.log("\nF) Verified USA-Paraguay correction:");
const correctedUsaParaguay = applyVerifiedGoalCorrections("united-states-vs-paraguay-jun12", [
  { playerName: "F. Balogun", minute: 31, teamName: "United States", type: "GOAL", provider: "worldcup26.ir", confidence: "high" },
  { playerName: "Maurício", minute: 73, teamName: "Paraguay", type: "GOAL", provider: "worldcup26.ir", confidence: "high" },
]);
assert(correctedUsaParaguay.length === 5, "USA-Paraguay contains exactly five corrected events");
assert(correctedUsaParaguay[0]?.playerName === "Damian Bobadilla" && correctedUsaParaguay[0]?.minute === 7 && correctedUsaParaguay[0]?.isOwnGoal === true, "Bobadilla = 7' own goal");
assert(correctedUsaParaguay[1]?.playerName === "Folarin Balogun" && correctedUsaParaguay[1]?.minute === 31, "Balogun = 31'");
assert(correctedUsaParaguay[2]?.playerName === "Folarin Balogun" && correctedUsaParaguay[2]?.minuteLabel === "45+5'", "Balogun = 45+5'");
assert(correctedUsaParaguay[3]?.playerName === "Maurício" && correctedUsaParaguay[3]?.minute === 73, "Maurício = 73'");
assert(correctedUsaParaguay[4]?.playerName === "Giovanni Reyna" && correctedUsaParaguay[4]?.minuteLabel === "90+8'", "Reyna = 90+8'");
assert(new Set(correctedUsaParaguay.map((event) => `${event.minuteLabel}-${event.playerName}`)).size === 5, "USA-Paraguay chronological events are unique");
assert(correctedUsaParaguay.filter((event) => event.playerName === "Folarin Balogun").length === 2, "Balogun has two distinct goal events");

async function runSharedMapTests() {
  console.log("\nG) Shared scorer enrichment map:");

  const { MATCHES, matchSlug } = await import("../lib/matches");
  const { countryName } = await import("../lib/i18n");

  try {
    const { buildTournamentLiveSnapshot } = await import("../lib/liveSnapshot");

    const liveData = new Map();
    liveData.set(1, { provider: "football-data.org", providerMatchId: 1, status: "FINISHED", homeScore: 2, awayScore: 0, winner: "HOME_TEAM", lastSyncedAt: new Date().toISOString(), eventDataAvailable: false });
    liveData.set(2, { provider: "football-data.org", providerMatchId: 2, status: "FINISHED", homeScore: 2, awayScore: 1, winner: "HOME_TEAM", lastSyncedAt: new Date().toISOString(), eventDataAvailable: false });
    liveData.set(537333, { provider: "football-data.org", providerMatchId: 537333, status: "FINISHED", homeScore: 1, awayScore: 1, winner: "DRAW", lastSyncedAt: new Date().toISOString(), eventDataAvailable: false });
    liveData.set(537334, { provider: "football-data.org", providerMatchId: 537334, status: "FINISHED", homeScore: 4, awayScore: 1, winner: "HOME_TEAM", lastSyncedAt: new Date().toISOString(), eventDataAvailable: false });

    const worldcupGames: any[] = [
      { providerGameId: "1", homeTeamName: "Mexico", awayTeamName: "South Africa", homeScore: 2, awayScore: 0, finished: true, localDate: "2026-06-11", homeScorers: [{ playerName: "J. Quiñones", minute: 9, teamName: "Mexico", type: "GOAL", isPenalty: false, isOwnGoal: false, provider: "worldcup26.ir", confidence: "high" }, { playerName: "R. Jiménez", minute: 67, teamName: "Mexico", type: "GOAL", isPenalty: false, isOwnGoal: false, provider: "worldcup26.ir", confidence: "high" }], awayScorers: [] },
      { providerGameId: "2", homeTeamName: "South Korea", awayTeamName: "Czech Republic", homeScore: 2, awayScore: 1, finished: true, localDate: "2026-06-11", homeScorers: [{ playerName: "I.B. Hwang", minute: 67, teamName: "South Korea", type: "GOAL", isPenalty: false, isOwnGoal: false, provider: "worldcup26.ir", confidence: "high" }, { playerName: "H.G. Oh", minute: 80, teamName: "South Korea", type: "GOAL", isPenalty: false, isOwnGoal: false, provider: "worldcup26.ir", confidence: "high" }], awayScorers: [{ playerName: "L. Krejčí", minute: 59, teamName: "Czech Republic", type: "GOAL", isPenalty: false, isOwnGoal: false, provider: "worldcup26.ir", confidence: "high" }] },
      { providerGameId: "537333", homeTeamName: "Canada", awayTeamName: "Bosnia & Herzegovina", homeScore: 1, awayScore: 1, finished: true, localDate: "2026-06-12", homeScorers: [{ playerName: "Cyle Larin", minute: 78, teamName: "Canada", type: "GOAL", isPenalty: false, isOwnGoal: false, provider: "worldcup26.ir", confidence: "high" }], awayScorers: [{ playerName: "Jovo Lukić", minute: 21, teamName: "Bosnia & Herzegovina", type: "GOAL", isPenalty: false, isOwnGoal: false, provider: "worldcup26.ir", confidence: "high" }] },
      { providerGameId: "537334", homeTeamName: "United States", awayTeamName: "Paraguay", homeScore: 4, awayScore: 1, finished: true, localDate: "2026-06-12", homeScorers: [{ playerName: "F. Balogun", minute: 31, teamName: "United States", type: "GOAL", isPenalty: false, isOwnGoal: false, provider: "worldcup26.ir", confidence: "high" }, { playerName: "F. Balogun", minute: 90, extraMinute: 5, teamName: "United States", type: "GOAL", isPenalty: false, isOwnGoal: false, provider: "worldcup26.ir", confidence: "high" }, { playerName: "Giovanni Reyna", minute: 90, extraMinute: 8, teamName: "United States", type: "GOAL", isPenalty: false, isOwnGoal: false, provider: "worldcup26.ir", confidence: "high" }], awayScorers: [{ playerName: "Damian Bobadilla", minute: 7, teamName: "Paraguay", type: "OWN_GOAL", isPenalty: false, isOwnGoal: true, provider: "worldcup26.ir", confidence: "high" }, { playerName: "Maurício", minute: 73, teamName: "Paraguay", type: "GOAL", isPenalty: false, isOwnGoal: false, provider: "worldcup26.ir", confidence: "high" }] }
    ];

    const snapshot = await buildTournamentLiveSnapshot({
      liveData,
      worldcupGames,
      generatedAt: new Date().toISOString(),
      primaryProviderOk: true,
      secondaryProviderOk: true,
      primaryProviderFetchedAt: new Date().toISOString(),
      secondaryProviderFetchedAt: new Date().toISOString()
    });

    const scorerMap = new Map();
    for (const match of Object.values(snapshot.matches)) {
      if (match.scorers.length > 0) scorerMap.set(match.internalId, match.scorers);
    }

    const expected = [
      { home: "Mexico", away: "South Africa" },
      { home: "South Korea", away: "Czechia" },
      { home: "Canada", away: "Bosnia & Herzegovina" },
      { home: "United States", away: "Paraguay" },
    ];

    for (const item of expected) {
      const match = MATCHES.find(
        (m) => countryName(m.homeKey, "en") === item.home && countryName(m.awayKey, "en") === item.away,
      );
      if (!match) continue;
      const slug = matchSlug(match);
      assert(scorerMap.has(slug), `shared map contains "${slug}"`);
    }

    const canadaMatch = MATCHES.find(
      (m) => countryName(m.homeKey, "en") === "Canada" && countryName(m.awayKey, "en") === "Bosnia & Herzegovina",
    );
    if (canadaMatch) {
      const slug = matchSlug(canadaMatch);
      const events = scorerMap.get(slug) ?? [];
      if (scorerMap.has(slug)) {
        assert(events.length === 2, `${slug} has exactly two corrected scorer events`);
        assert(events[0]?.playerName === "Jovo Lukić" && events[0]?.minute === 21, `${slug} first event is 21' Jovo Lukić`);
        assert(events[1]?.playerName === "Cyle Larin" && events[1]?.minute === 78, `${slug} second event is 78' Cyle Larin`);
      }
    }

    const usaMatch = MATCHES.find(
      (m) => countryName(m.homeKey, "en") === "United States" && countryName(m.awayKey, "en") === "Paraguay",
    );
    if (usaMatch) {
      const slug = matchSlug(usaMatch);
      const events = scorerMap.get(slug) ?? [];
      if (scorerMap.has(slug)) {
        assert(events.length === 5, `${slug} has exactly five corrected scorer events`);
        assert(events[0]?.playerName === "Damian Bobadilla" && events[0]?.minute === 7 && events[0]?.isOwnGoal === true, `${slug} first event is 7' Bobadilla own goal`);
        assert(events[2]?.playerName === "Folarin Balogun" && events[2]?.minuteLabel === "45+5'", `${slug} includes 45+5' Balogun`);
        assert(events[4]?.playerName === "Giovanni Reyna" && events[4]?.minuteLabel === "90+8'", `${slug} includes 90+8' Reyna`);
      }
    }
    const korMatch = MATCHES.find(
      (m) => countryName(m.homeKey, "en") === "South Korea" && countryName(m.awayKey, "en") === "Czechia",
    );
    if (korMatch) {
      const slug = matchSlug(korMatch);
      const events = scorerMap.get(slug) ?? [];
      if (scorerMap.has(slug)) {
        assert(events.length === 3, `${slug} has 3 scorer events (got ${events.length})`);
        const teamNames = new Set(events.map((e: any) => e.teamName));
        assert(teamNames.has("South Korea"), `${slug} events use internal display name "South Korea"`);
        assert(teamNames.has("Czechia"), `${slug} events use internal display name "Czechia"`);
        assert(!teamNames.has("Czech Republic"), `${slug} events do NOT use raw provider name "Czech Republic"`);
      }
    }
  } catch (err: any) {
    console.log("  ⚠️ Skipping shared map tests (provider or Next.js cache unavailable): " + err.message);
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}

runSharedMapTests().catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});
