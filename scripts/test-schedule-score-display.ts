import { readFileSync } from "node:fs";
import type { LiveMatchData } from "../lib/liveMatchData";
import { MATCHES } from "../lib/matches";

const MEXICO_PROVIDER_ID = 537327;
const SOUTH_KOREA_CZECHIA_PROVIDER_ID = 537328;

type ScheduleMatchScore = {
  status: LiveMatchData["status"];
  homeScore: number | null;
  awayScore: number | null;
};

function renderScoreChip(score: ScheduleMatchScore | undefined, vs: string): string {
  if (!score) return vs;
  const { status, homeScore, awayScore } = score;
  const isFinished = status === "FINISHED";
  const isLive = status === "IN_PLAY" || status === "PAUSED";
  const hasScore = homeScore !== null && awayScore !== null;

  if ((isFinished || isLive) && hasScore) {
    const badge = isFinished ? "FT" : status === "PAUSED" ? "HT" : "Live";
    return `${homeScore}-${awayScore} ${badge}`;
  }
  if (isLive && !hasScore) return "Score syncing";
  return vs;
}

function renderMatchRow(homeTeam: string, awayTeam: string, score: ScheduleMatchScore | undefined): string {
  const chip = renderScoreChip(score, "vs");
  return `${homeTeam} | ${chip} | ${awayTeam}`;
}

type GoalScorerEvent = {
  minute: number | null;
  minuteLabel?: string;
  playerName: string;
  isOwnGoal?: boolean;
};

function shortScorerName(playerName: string) {
  if (playerName.includes(".")) return playerName;
  const parts = playerName.trim().split(/\s+/);
  return parts[parts.length - 1] ?? playerName;
}

function renderScorerLine(events: GoalScorerEvent[] | undefined): string | null {
  if (!events || events.length === 0) return null;
  const parts = events.map((event) => {
    const minute = event.minuteLabel ?? (event.minute != null ? `${event.minute}'` : "");
    return `${minute ? `${minute} ` : ""}${shortScorerName(event.playerName)}${event.isOwnGoal ? " (OG)" : ""}`;
  });
  return `Goals: ${parts.join(" · ")}`;
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

console.log("=== Schedule score display test ===\n");

const finishedScore: ScheduleMatchScore = { status: "FINISHED", homeScore: 2, awayScore: 0 };
const finishedRow = renderMatchRow("Mexico", "South Africa", finishedScore);
console.log(`Finished match row: "${finishedRow}"`);
assert(finishedRow.includes("2-0"), "score shows 2-0");
assert(finishedRow.includes("FT"), "finished badge shows FT");
assert(!finishedRow.includes("vs"), "no 'vs' in finished row");
assert(!finishedRow.includes("- vs -"), "no '- vs -' pattern");

const upcomingRow = renderMatchRow("South Korea", "Czechia", undefined);
console.log(`\nUpcoming match row: "${upcomingRow}"`);
assert(upcomingRow.includes("vs"), "upcoming match shows 'vs'");
assert(!upcomingRow.includes("- vs -"), "no '- vs -' pattern");
assert(!upcomingRow.includes("null"), "no null values rendered");

const liveScore: ScheduleMatchScore = { status: "IN_PLAY", homeScore: 1, awayScore: 0 };
const liveRow = renderMatchRow("Mexico", "South Africa", liveScore);
console.log(`\nLive match row: "${liveRow}"`);
assert(liveRow.includes("1-0"), "live score shows 1-0");
assert(liveRow.includes("Live"), "live badge shows Live");

const syncingScore: ScheduleMatchScore = { status: "IN_PLAY", homeScore: null, awayScore: null };
const syncingRow = renderMatchRow("Mexico", "South Africa", syncingScore);
console.log(`\nSyncing match row: "${syncingRow}"`);
assert(syncingRow.includes("syncing"), "syncing row shows syncing text");
assert(!syncingRow.includes("null"), "no null values in syncing row");

assert(!finishedRow.includes("MexicoMexico") && !finishedRow.includes("South AfricaSouth Africa"), "no duplicated team names in finished row");
assert(!upcomingRow.includes("South KoreaSouth Korea") && !upcomingRow.includes("CzechiaCzechia"), "no duplicated team names in upcoming row");
for (const [label, row] of [["finished", finishedRow], ["upcoming", upcomingRow], ["live", liveRow], ["syncing", syncingRow]]) {
  assert(!row.includes("- vs -"), `no '- vs -' in ${label} row`);
}

const mapped = MATCHES.filter((match) => match.providerIds?.footballData);
assert(mapped.length >= 71, `all 71 fixtures mapped (got ${mapped.length})`);
assert(MATCHES.find((match) => match.providerIds?.footballData === MEXICO_PROVIDER_ID) !== undefined, `Mexico vs South Africa has provider id ${MEXICO_PROVIDER_ID}`);
assert(MATCHES.find((match) => match.providerIds?.footballData === SOUTH_KOREA_CZECHIA_PROVIDER_ID) !== undefined, `South Korea vs Czechia has provider id ${SOUTH_KOREA_CZECHIA_PROVIDER_ID}`);

console.log("\n=== Scorer line test ===\n");

const skczEvents: GoalScorerEvent[] = [
  { minute: 59, playerName: "L. Krejčí" },
  { minute: 67, playerName: "I.B. Hwang" },
  { minute: 80, playerName: "H.G. Oh" },
];
const skczLine = renderScorerLine(skczEvents);
console.log(`Scorer line: "${skczLine}"`);
assert(skczLine === "Goals: 59' L. Krejčí · 67' I.B. Hwang · 80' H.G. Oh", "scorer line formatted with separator");

const usaEvents: GoalScorerEvent[] = [
  { minute: 7, minuteLabel: "7'", playerName: "Damian Bobadilla", isOwnGoal: true },
  { minute: 31, minuteLabel: "31'", playerName: "Folarin Balogun" },
  { minute: 45, minuteLabel: "45+5'", playerName: "Folarin Balogun" },
  { minute: 73, minuteLabel: "73'", playerName: "Maurício" },
  { minute: 90, minuteLabel: "90+8'", playerName: "Giovanni Reyna" },
];
const usaLine = renderScorerLine(usaEvents);
assert(
  usaLine === "Goals: 7' Bobadilla (OG) · 31' Balogun · 45+5' Balogun · 73' Maurício · 90+8' Reyna",
  "USA-Paraguay compact scorer line keeps own goal and stoppage labels",
);

assert(renderScorerLine(undefined) === null, "no scorer line rendered when scorer data unavailable");
assert(renderScorerLine([]) === null, "no scorer line rendered for empty events array");

console.log("\n=== Layout structure test ===\n");

const todaySource = readFileSync("app/today/page.tsx", "utf8");
assert(todaySource.includes("data-today-score-cluster"), "Today has a dedicated central score cluster");
assert(todaySource.includes("data-today-right-meta"), "Today has a dedicated right meta column");
assert(todaySource.indexOf("data-today-score-cluster") < todaySource.indexOf("data-today-right-meta"), "Today score cluster appears before right meta");

const scheduleSource = readFileSync("app/schedule/ScheduleContent.tsx", "utf8");
assert(scheduleSource.includes("data-schedule-score-cluster"), "Schedule has a central score cluster");
assert(scheduleSource.includes("data-schedule-scorer-line"), "Schedule scorer line is inside central score wrapper");
assert(scheduleSource.includes("data-schedule-right-meta"), "Schedule has a dedicated right meta wrapper");
assert(
  scheduleSource.indexOf("data-schedule-score-cluster") < scheduleSource.indexOf("data-schedule-scorer-line") &&
    scheduleSource.indexOf("data-schedule-scorer-line") < scheduleSource.indexOf("data-schedule-right-meta"),
  "Schedule scorer line is not inside the right/global meta wrapper",
);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
