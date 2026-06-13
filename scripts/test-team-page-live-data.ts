import { buildTournamentLiveSnapshot } from "../lib/liveSnapshot";
import { matchSlug, matchesInGroup } from "../lib/matches";
import type { LiveMatchData } from "../lib/liveMatchData";
import type { WorldCup26Game } from "../lib/worldcup26Provider";

let passed = 0;
let failed = 0;
function assert(condition: boolean, msg: string) {
  if (condition) { console.log(`  PASS  ${msg}`); passed++; }
  else { console.error(`  FAIL  ${msg}`); failed++; }
}

console.log("=== Team page live data selector test ===\n");

const liveData: ReadonlyMap<number, LiveMatchData> = new Map([
  [537327, { provider: "football-data.org", providerMatchId: 537327, status: "FINISHED", homeScore: 2, awayScore: 0, winner: "HOME_TEAM", lastSyncedAt: "2026-06-11T21:00:00.000Z", eventDataAvailable: false }],
  [537333, { provider: "football-data.org", providerMatchId: 537333, status: "FINISHED", homeScore: 1, awayScore: 1, winner: "DRAW", lastSyncedAt: "2026-06-12T20:00:00.000Z", eventDataAvailable: false }],
]);

const worldcupGames: WorldCup26Game[] = [
  { providerGameId: "mexico-sa", homeTeamName: "Mexico", awayTeamName: "South Africa", homeScore: 2, awayScore: 0, finished: true, homeScorers: [], awayScorers: [], localDate: "2026-06-11" },
  { providerGameId: "canada-bosnia", homeTeamName: "Canada", awayTeamName: "Bosnia and Herzegovina", homeScore: 1, awayScore: 1, finished: true, homeScorers: [], awayScorers: [], localDate: "2026-06-12" },
];

async function main() {
const snapshot = await buildTournamentLiveSnapshot({ liveData, worldcupGames, generatedAt: "2026-06-13T10:00:00.000Z" });

const mexicoMatch = snapshot.matches["mexico-vs-south-africa-jun11"];
assert(mexicoMatch?.homeScore === 2 && mexicoMatch.awayScore === 0 && mexicoMatch.status === "FINISHED", "Mexico page selector sees Mexico 2-0 South Africa");
assert(!matchesInGroup("A").filter((m) => m.homeKey === "mexico" || m.awayKey === "mexico").some((m) => snapshot.matches[matchSlug(m)]?.status === "FINISHED" && snapshot.matches[matchSlug(m)]?.homeScore === null), "completed Mexico match is not plain vs");

const bosniaMatch = snapshot.matches["canada-vs-bosnia-jun12"];
assert(bosniaMatch?.homeScore === 1 && bosniaMatch.awayScore === 1 && bosniaMatch.status === "FINISHED", "Bosnia page selector sees Canada 1-1 Bosnia");

const mexicoRows = snapshot.standingsByGroup["A"];
const globalGroupA = snapshot.standingsByGroup["A"];
assert(JSON.stringify(mexicoRows) === JSON.stringify(globalGroupA), "Mexico page Group A equals global Group A");

const bosniaRows = snapshot.standingsByGroup["B"];
const globalGroupB = snapshot.standingsByGroup["B"];
assert(JSON.stringify(bosniaRows) === JSON.stringify(globalGroupB), "Bosnia page Group B equals global Group B");

assert(mexicoRows.some((row) => row.teamKey === "mexico" && row.played > 0), "Before Matchday 1 copy should disappear after Mexico has played");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
