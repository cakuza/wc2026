import { buildTournamentLiveSnapshot } from "../lib/liveSnapshot";
import type { WorldCup26Game } from "../lib/worldcup26Provider";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string, detail?: string) {
  if (condition) {
    console.log(`  PASS  ${msg}`);
    passed++;
  } else {
    console.error(`  FAIL  ${msg}${detail ? ` -- ${detail}` : ""}`);
    failed++;
  }
}

function game(
  homeTeamName: string,
  awayTeamName: string,
  homeScore: number,
  awayScore: number,
): WorldCup26Game {
  return {
    providerGameId: `${homeTeamName}-${awayTeamName}`,
    homeTeamName,
    awayTeamName,
    homeScore,
    awayScore,
    finished: true,
    homeScorers: [],
    awayScorers: [],
    localDate: "06/18/2026 12:00",
  };
}

const fixture: WorldCup26Game[] = [
  game("Turkey", "United States", 3, 2),
  game("Czechia", "South Africa", 1, 1),
  game("Switzerland", "Bosnia and Herzegovina", 4, 1),
  game("Austria", "Jordan", 3, 1),
  game("Tunisia", "Netherlands", 1, 3),
  game("United States", "Australia", 2, 0),
];

function scorerTotals(snapshot: Awaited<ReturnType<typeof buildTournamentLiveSnapshot>>) {
  const finished = Object.values(snapshot.matches).filter((m) => m.status === "FINISHED");
  const scorerEvents = finished.flatMap((m) => m.scorers);
  const scoreEventMismatches = finished
    .filter((m) => typeof m.homeScore === "number" && typeof m.awayScore === "number")
    .filter((m) => m.scorers.length !== (m.homeScore ?? 0) + (m.awayScore ?? 0))
    .map((m) => `${m.internalId}:${m.homeScore}-${m.awayScore}:${m.scorers.length}`);

  return {
    finishedMatches: finished.length,
    nonShootoutGoals: finished.reduce((sum, m) => sum + (m.homeScore ?? 0) + (m.awayScore ?? 0), 0),
    scorerEvents: scorerEvents.length,
    ownGoals: scorerEvents.filter((s) => s.isOwnGoal).length,
    penalties: scorerEvents.filter((s) => s.isPenalty || s.type === "PENALTY_GOAL").length,
    namedScorers: scorerEvents.filter((s) => s.playerName !== "Scorer unavailable").length,
    deliberateUnresolved: scorerEvents.filter((s) => s.playerName === "Scorer unavailable").length,
    scoreEventMismatches,
  };
}

async function main() {
  console.log("=== Deterministic match/stats scorer consistency test ===\n");

  assert(fixture.length > 0, "frozen fixture is available");

  const snapshot = await buildTournamentLiveSnapshot({
    liveData: new Map(),
    worldcupGames: fixture,
    generatedAt: "2026-06-28T00:00:00.000Z",
    primaryProviderOk: false,
    secondaryProviderOk: true,
  });

  const totals = scorerTotals(snapshot);
  console.log(JSON.stringify(totals, null, 2));

  assert(totals.finishedMatches === 6, "finished matches total is deterministic", `got ${totals.finishedMatches}`);
  assert(totals.nonShootoutGoals === 22, "non-shootout goals total is deterministic", `got ${totals.nonShootoutGoals}`);
  assert(totals.scorerEvents === totals.nonShootoutGoals, "scorer event count equals score total");
  assert(totals.scorerEvents > 0, "finished scored matches have scorer events");
  assert(totals.ownGoals === 3, "own-goal total is deterministic", `got ${totals.ownGoals}`);
  assert(totals.penalties === 4, "penalty total is deterministic", `got ${totals.penalties}`);
  assert(totals.namedScorers === 22, "all deterministic fixture scorers are named");
  assert(totals.deliberateUnresolved === 0, "no deliberate unresolved scorers in deterministic fixture");
  assert(totals.scoreEventMismatches.length === 0, "score/event mismatches = 0", totals.scoreEventMismatches.join(", "));

  const topScorerGoals = new Map(snapshot.topScorers.map((s) => [s.playerName, s.goals]));
  assert(!topScorerGoals.has("Ellyes Skhiri"), "Skhiri own goal excluded from Top Scorers");
  assert(!topScorerGoals.has("Cameron Burgess"), "Burgess own goal excluded from Top Scorers");
  assert(!topScorerGoals.has("Yazan Al-Arab"), "Yazan Al-Arab own goal excluded from Top Scorers");

  const turkeyUsa = snapshot.matches["turkey-vs-united-states-jun25"]?.scorers.map((s) => `${s.minuteLabel} ${s.playerName}`);
  assert(
    JSON.stringify(turkeyUsa) === JSON.stringify(["3' Auston Trusty", "10' Arda Güler", "31' Barış Alper Yılmaz", "49' Sebastian Berhalter", "90+8' Kaan Ayhan"]),
    "Turkey-USA canonical scorer list is stable",
    JSON.stringify(turkeyUsa),
  );

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});
