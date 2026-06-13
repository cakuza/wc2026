import { buildTournamentLiveSnapshot } from "../lib/liveSnapshot";
import { groupMatchesByCalendarDate } from "../lib/todaySelection";
import { MATCHES, matchSlug } from "../lib/matches";
import type { LiveMatchData } from "../lib/liveMatchData";
import type { WorldCup26Game } from "../lib/worldcup26Provider";

let passed = 0;
let failed = 0;
function assert(condition: boolean, msg: string) {
  if (condition) { console.log(`  PASS  ${msg}`); passed++; }
  else { console.error(`  FAIL  ${msg}`); failed++; }
}

console.log("=== Timezone page results test ===\n");

const liveData: ReadonlyMap<number, LiveMatchData> = new Map([
  [537327, { provider: "football-data.org", providerMatchId: 537327, status: "FINISHED", homeScore: 2, awayScore: 0, winner: "HOME_TEAM", lastSyncedAt: "2026-06-11T21:00:00.000Z", eventDataAvailable: false }],
]);
const worldcupGames: WorldCup26Game[] = [
  { providerGameId: "mexico-sa", homeTeamName: "Mexico", awayTeamName: "South Africa", homeScore: 2, awayScore: 0, finished: true, homeScorers: [], awayScorers: [], localDate: "2026-06-11" },
];
async function main() {
const snapshot = await buildTournamentLiveSnapshot({ liveData, worldcupGames, generatedAt: "2026-06-13T10:00:00.000Z" });
const mexico = snapshot.matches["mexico-vs-south-africa-jun11"];

assert(mexico?.status === "FINISHED" && mexico.homeScore === 2 && mexico.awayScore === 0, "fixed timezone pages receive completed score state");

const easternGroups = groupMatchesByCalendarDate(MATCHES, "America/New_York");
const mexicoDay = easternGroups.find((day) => day.matches.some((match) => matchSlug(match) === "mexico-vs-south-africa-jun11"));
assert(mexicoDay?.date === "2026-06-11", "Eastern Time page groups Mexico opener from UTC instant");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
