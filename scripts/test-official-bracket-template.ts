import { ROUND_OF_32_MATCHES, pathSlotsForGroup, slotLabel } from "../lib/knockoutBracket2026";

let passed = 0;
let failed = 0;
function assert(condition: boolean, msg: string) {
  if (condition) { console.log(`  PASS  ${msg}`); passed++; }
  else { console.error(`  FAIL  ${msg}`); failed++; }
}

console.log("=== Official bracket template test ===\n");

assert(ROUND_OF_32_MATCHES.length === 16, "all 16 Round-of-32 slots exist");
assert(new Set(ROUND_OF_32_MATCHES.map((match) => match.matchNumber)).size === 16, "match numbers are unique");

const labels = ROUND_OF_32_MATCHES.map((match) => `${slotLabel(match.home)} vs ${slotLabel(match.away)}`);
const obsoleteRoundOf32Slot = ["1A", "2B"].join(" vs ");
assert(!labels.includes(obsoleteRoundOf32Slot), "obsolete Group A winner vs Group B runner-up slot is absent");

const m73 = ROUND_OF_32_MATCHES.find((match) => match.matchNumber === 73);
assert(m73 ? `${slotLabel(m73.home)} vs ${slotLabel(m73.away)}` === "2A vs 2B" : false, "M73 is 2A vs 2B");

const m79 = ROUND_OF_32_MATCHES.find((match) => match.matchNumber === 79);
assert(m79 ? `${slotLabel(m79.home)} vs ${slotLabel(m79.away)}` === "1A vs 3rd C/E/F/H/I" : false, "M79 is 1A vs 3rd C/E/F/H/I");

const groupA = pathSlotsForGroup("A");
assert(groupA.winner?.matchNumber === 79, "Group A winner path derives from M79");
assert(groupA.runnerUp?.matchNumber === 73, "Group A runner-up path derives from M73");
assert(groupA.third.some((match) => match.matchNumber === 74 || match.matchNumber === 82), "Group A third-place path derives from eligible config");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
