import {
  firstMatchResultSentence,
  matchesText,
  playedGroupSummary,
  pointsText,
  possessiveTeamName,
} from "../lib/teamCopy";

let passed = 0;
let failed = 0;
function assert(condition: boolean, msg: string) {
  if (condition) { console.log(`  PASS  ${msg}`); passed++; }
  else { console.error(`  FAIL  ${msg}`); failed++; }
}

console.log("=== Team page copy test ===\n");

assert(pointsText(0) === "0 points", "0 points");
assert(pointsText(1) === "1 point", "1 point");
assert(pointsText(3) === "3 points", "3 points");
assert(matchesText(1) === "1 match", "1 match");
assert(matchesText(2) === "2 matches", "2 matches");

const czechiaFirst = firstMatchResultSentence({
  teamName: "Czechia",
  opponentName: "South Korea",
  date: "11 June 2026",
  homeScore: 2,
  awayScore: 1,
});
assert(czechiaFirst.startsWith("Czechia's first match"), "Czechia first-match sentence uses possessive");

const unitedStatesFirst = firstMatchResultSentence({
  teamName: "United States",
  opponentName: "Paraguay",
  date: "12 June 2026",
  homeScore: 4,
  awayScore: 1,
});
assert(unitedStatesFirst.startsWith("United States' first match"), "United States first-match sentence is possessive-safe");

const summary = playedGroupSummary({
  teamName: "Czechia",
  group: "A",
  played: 1,
  points: 0,
  goalDifference: -1,
});
assert(summary.includes("1 match"), "summary uses singular match");
assert(summary.includes("0 points"), "summary uses plural zero points");
assert(possessiveTeamName("Mexico") === "Mexico's", "regular team possessive");
const badPointFragment = ["point", "s"].join(" ");
const badMatchFragment = ["match", "es"].join(" ");
assert(!`${summary} ${czechiaFirst} ${unitedStatesFirst}`.includes(badPointFragment), "no split point plural artifact");
assert(!`${summary} ${czechiaFirst} ${unitedStatesFirst}`.includes(badMatchFragment), "no split match plural artifact");
assert(!/\s{2,}/.test(`${summary} ${czechiaFirst} ${unitedStatesFirst}`), "no double spaces");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
