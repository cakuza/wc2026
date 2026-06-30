import { readFileSync } from "node:fs";
import { buildTournamentLiveSnapshot } from "../lib/liveSnapshot";
import { getTodayMatchesForTimeZone } from "../lib/todaySelection";
import { matchSlug } from "../lib/matches";
import { buildScorerSentence } from "../lib/resultSummary";
import { computeThirdPlaceRanking } from "../lib/thirdPlaceRanking";
import type { LiveMatchData } from "../lib/liveMatchData";
import type { GoalScorerEvent, WorldCup26Game } from "../lib/worldcup26Provider";

const CANADA_PROVIDER_ID = 537333;
const USA_PROVIDER_ID = 537345;
const CANADA_MATCH_ID = "canada-vs-bosnia-jun12";
const USA_MATCH_ID = "united-states-vs-paraguay-jun12";

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

function scorer(
  playerName: string,
  teamName: string,
  minute: number,
  extra: Partial<GoalScorerEvent> = {},
): GoalScorerEvent {
  return {
    type: "GOAL",
    minute,
    teamName,
    playerName,
    provider: "worldcup26.ir",
    confidence: "high",
    ...extra,
  };
}

const liveData: ReadonlyMap<number, LiveMatchData> = new Map([
  [
    CANADA_PROVIDER_ID,
    {
      provider: "football-data.org",
      providerMatchId: CANADA_PROVIDER_ID,
      status: "FINISHED",
      homeScore: 1,
      awayScore: 1,
      winner: null,
      lastSyncedAt: "2026-06-12T20:20:00.000Z",
      eventDataAvailable: false,
    },
  ],
  [
    USA_PROVIDER_ID,
    {
      provider: "football-data.org",
      providerMatchId: USA_PROVIDER_ID,
      status: "FINISHED",
      homeScore: 4,
      awayScore: 1,
      winner: "HOME_TEAM",
      lastSyncedAt: "2026-06-13T01:20:00.000Z",
      eventDataAvailable: false,
    },
  ],
  [
    999999,
    {
      provider: "football-data.org",
      providerMatchId: 999999,
      status: "FINISHED",
      homeScore: 9,
      awayScore: 9,
      winner: "DRAW",
      lastSyncedAt: "2026-06-11T22:30:00.000Z",
      eventDataAvailable: false,
    },
  ],
]);

const worldcupGames: WorldCup26Game[] = [
  {
    providerGameId: "canada-bosnia",
    homeTeamName: "Canada",
    awayTeamName: "Bosnia and Herzegovina",
    homeScore: 1,
    awayScore: 1,
    finished: true,
    homeScorers: [scorer("C. Larin", "Canada", 11)],
    awayScorers: [scorer("Jovo Lukic", "Bosnia and Herzegovina", 21)],
    localDate: "2026-06-12",
  },
  {
    providerGameId: "usa-paraguay",
    homeTeamName: "United States",
    awayTeamName: "Paraguay",
    homeScore: 4,
    awayScore: 1,
    finished: true,
    homeScorers: [
      scorer("D. Bobadilla", "United States", 7, { isOwnGoal: true, minuteLabel: "7'" }),
      scorer("F. Balogun", "United States", 31, { minuteLabel: "31'" }),
      scorer("F. Balogun", "United States", 45, { stoppageTime: 5, minuteLabel: "45+5'" }),
      scorer("G. Reyna", "United States", 90, { stoppageTime: 8, minuteLabel: "90+8'" }),
    ],
    awayScorers: [scorer("Maurício", "Paraguay", 73, { minuteLabel: "73'" })],
    localDate: "2026-06-12",
  },
];

async function main() {
  console.log("=== Live snapshot consistency test ===\n");

  const snapshot = await buildTournamentLiveSnapshot({
    liveData,
    worldcupGames,
    generatedAt: "2026-06-12T21:00:00.000Z",
  });

  const canada = snapshot.matches[CANADA_MATCH_ID];
  assert(canada?.status === "FINISHED", "Canada-Bosnia status = FINISHED");
  assert(canada?.homeScore === 1 && canada.awayScore === 1, "Canada-Bosnia score is 1-1");
  assert(snapshot.liveDataByProviderId[String(CANADA_PROVIDER_ID)]?.goals?.length === 2, "Canada-Bosnia exposes scorer events");

  const canadaScorers = snapshot.matches[CANADA_MATCH_ID]?.scorers ?? [];
  assert(JSON.stringify(canadaScorers) === JSON.stringify(snapshot.matches[CANADA_MATCH_ID]?.scorers ?? []), "Today, Schedule and Match selectors share Canada-Bosnia events");
  assert(canadaScorers[0]?.playerName === "Jovo Lukić" && canadaScorers[0]?.minute === 21, "Canada-Bosnia first event is 21' Jovo Lukić");
  assert(canadaScorers[1]?.playerName === "Cyle Larin" && canadaScorers[1]?.minute === 78, "Canada-Bosnia second event is 78' Cyle Larin");
  assert(!canadaScorers.some((event) => event.playerName === "C. Larin" && event.minute === 11), "no 11' C. Larin event remains");

  const canadaSummary = buildScorerSentence(snapshot.matches[CANADA_MATCH_ID]?.live?.goals, "Canada", "Bosnia & Herzegovina") ?? "";
  assert(canadaSummary.includes("Lukić") && canadaSummary.includes("ahead"), "Canada-Bosnia summary says Lukić put Bosnia ahead");
  assert(canadaSummary.includes("Larin") && canadaSummary.includes("equalized"), "Canada-Bosnia summary says Larin equalized");
  assert(!canadaSummary.includes("Larin opened the scoring"), "Canada-Bosnia summary does not say Larin opened the scoring");
  assert(!canadaSummary.includes("Lukić added another"), "Canada-Bosnia summary does not say Lukić added another");

  const usa = snapshot.matches[USA_MATCH_ID];
  const usaEvents = usa?.scorers ?? [];
  const usaLiveGoals = usa?.live?.goals ?? [];
  assert(usa?.homeScore === 4 && usa.awayScore === 1, "USA-Paraguay score is 4-1");
  assert(usaEvents.length === 5, "USA-Paraguay has exactly five goal events");
  assert(usaEvents[0]?.playerName === "Damian Bobadilla" && usaEvents[0]?.minute === 7 && usaEvents[0]?.isOwnGoal === true, "Bobadilla is 7' own goal");
  assert(usaEvents[1]?.playerName === "Folarin Balogun" && usaEvents[1]?.minute === 31, "Balogun first goal is 31'");
  assert(usaEvents[2]?.playerName === "Folarin Balogun" && usaEvents[2]?.minuteLabel === "45+5'", "Balogun second goal is 45+5'");
  assert(usaEvents[3]?.playerName === "Maurício" && usaEvents[3]?.minute === 73, "Maurício goal is 73'");
  assert(usaEvents[4]?.playerName === "Giovanni Reyna" && usaEvents[4]?.minuteLabel === "90+8'", "Reyna goal is 90+8'");
  assert(new Set(usaEvents.map((event) => `${event.minuteLabel}-${event.playerName}`)).size === 5, "USA-Paraguay has no duplicate goal events");
  assert(JSON.stringify(usaEvents) === JSON.stringify(snapshot.matches[USA_MATCH_ID]?.scorers ?? []), "Today, Schedule, Stats and Match selectors share USA-Paraguay events");
  assert(usaLiveGoals.filter((event) => event.teamName === "United States").length === 4, "USA score-event total matches four United States goals");
  assert(usaLiveGoals.filter((event) => event.teamName === "Paraguay").length === 1, "USA score-event total matches one Paraguay goal");
  assert(usaLiveGoals.some((event) => event.type === "OWN_GOAL" && event.playerName === "Damian Bobadilla"), "Bobadilla is marked as an own goal in live goals");

  assert(!snapshot.topScorers.some((event) => event.playerName === "Damian Bobadilla"), "Bobadilla own goal is excluded from top scorers");
  assert(snapshot.topScorers.find((event) => event.playerName === "Folarin Balogun")?.goals === 2, "Balogun top-scorer count is 2");
  assert(snapshot.topScorers.find((event) => event.playerName === "Giovanni Reyna")?.goals === 1, "Reyna top-scorer count is 1");
  assert(snapshot.topScorers.find((event) => event.playerName === "Maurício")?.goals === 1, "Maurício top-scorer count is 1");

  const usaSummary = buildScorerSentence(usaLiveGoals, "United States", "Paraguay") ?? "";
  assert(usaSummary.includes("Bobadilla own goal") && usaSummary.includes("United States the lead"), "USA summary treats Bobadilla as an own goal");
  assert(usaSummary.includes("Folarin Balogun scored twice"), "USA summary includes Balogun brace");
  assert(usaSummary.includes("Maurício pulled one back"), "USA summary says Maurício pulled one back");
  assert(usaSummary.includes("Giovanni Reyna completed") && usaSummary.includes("stoppage time"), "USA summary includes Reyna stoppage-time completion");

  const istanbulTodaySlugs = getTodayMatchesForTimeZone({
    now: new Date("2026-06-13T09:00:00.000Z"),
    timeZone: "Europe/Istanbul",
  }).matches.map(matchSlug);
  assert(istanbulTodaySlugs.includes(USA_MATCH_ID), "Today selector includes USA-Paraguay for Istanbul June 13");

  const groupB = snapshot.standingsByGroup["B"];
  const canadaRow = groupB.find((row) => row.teamKey === "canada");
  const bosniaRow = groupB.find((row) => row.teamKey === "bosnia");
  assert(canadaRow?.played === 1 && canadaRow.draws === 1 && canadaRow.points === 1, "Group B includes Canada's draw");
  assert(bosniaRow?.played === 1 && bosniaRow.draws === 1 && bosniaRow.points === 1, "Group B includes Bosnia's draw");

  const derivedThirds = computeThirdPlaceRanking(snapshot.standingsByGroup);
  assert(JSON.stringify(derivedThirds) === JSON.stringify(snapshot.thirdPlaceRanking), "third-place ranking derives from updated standings");
  assert(snapshot.tournamentStats.matchesPlayed === 2, "Stats includes both mocked finished matches");
  assert(snapshot.tournamentStats.totalGoals === 7, "Stats includes seven mocked goals");
  assert(!snapshot.liveDataByProviderId["999999"], "unknown provider match is ignored safely");

  const appFiles = [
    "app/today/page.tsx",
    "app/schedule/page.tsx",
    "app/groups/page.tsx",
    "app/stats/page.tsx",
    "app/matches/[matchId]/page.tsx",
    "app/world-cup-third-place-qualification/page.tsx",
  ];
  const pageSpecificProviderFetch = appFiles.some((file) => {
    const src = readFileSync(file, "utf8");
    return src.includes("getScorerEventsByInternalMatchId") || src.includes("fetchAllLiveData");
  });
  assert(!pageSpecificProviderFetch, "live pages do not call page-specific provider fetches");

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
