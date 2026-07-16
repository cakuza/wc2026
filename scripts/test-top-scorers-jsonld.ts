import {
  buildTopScorersItemListLd,
  hasTrustedTopScorerData,
  topScorerRows,
} from "../lib/topScorersPageData";
import type { PlayerRankingRecord } from "../lib/tournamentStats";

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

console.log("=== Top Scorers JSON-LD deterministic tests ===\n");

const healthy: { isFallback: boolean; topScorers: PlayerRankingRecord[] } = {
  isFallback: false,
  topScorers: [
    { playerName: "Kylian Mbappé", teamName: "France", teamKey: "fra", goals: 8, assists: { value: 2, isOfficial: false, isComplete: true }, minutesPlayed: { value: 600, isVerifiedComplete: true } },
    { playerName: "Lionel Messi", teamName: "Argentina", teamKey: "arg", goals: 8, assists: { value: 3, isOfficial: false, isComplete: true }, minutesPlayed: { value: 650, isVerifiedComplete: true } },
    { playerName: "Folarin Balogun", teamName: "United States", teamKey: "unitedStates", goals: 2, assists: { value: 0, isOfficial: false, isComplete: true }, minutesPlayed: { value: 100, isVerifiedComplete: true } },
    { playerName: "Scorer unavailable", teamName: "Austria", teamKey: "austria", goals: 1, assists: { value: 0, isOfficial: false, isComplete: true }, minutesPlayed: { value: 90, isVerifiedComplete: true } },
  ],
};

const rows = topScorerRows(healthy.topScorers);
const itemList = buildTopScorersItemListLd(healthy.topScorers);

assert(hasTrustedTopScorerData(healthy) === true, "nonfallback + nonempty leaderboard is trusted");
assert(rows.length === 3, "visible Top Scorers rows exclude unresolved scorers", `got ${rows.length}`);
// Lionel Messi has 8 goals, 3 assists. Mbappe has 8 goals, 2 assists. Messi ranks higher (1st), Mbappe ranks 2nd.
assert(rows[0]?.playerName === "Lionel Messi" && rows[0]?.goals === 8 && rows[0]?.rank === 1, "Lionel Messi is ranked 1st with 8 goals, 3 assists");
assert(rows[1]?.playerName === "Kylian Mbappé" && rows[1]?.rank === 2, "Kylian Mbappé is ranked 2nd with 8 goals, 2 assists");
assert(itemList?.["@type"] === "ItemList", "healthy snapshot emits ItemList JSON-LD");
assert(itemList?.numberOfItems === rows.length, "ItemList count matches visible rows");
assert(itemList?.itemListElement?.[0]?.name === rows[0]?.playerName, "ItemList first item matches visible ranking");
assert(itemList?.itemListElement?.[1]?.name === rows[1]?.playerName, "ItemList second item matches visible ranking");
assert(!JSON.stringify(itemList).includes("Scorer unavailable"), "ItemList excludes unresolved scorer");

const itemListStr = JSON.stringify(itemList);
assert(!itemListStr.includes("null") && !itemListStr.includes("undefined") && !itemListStr.includes("NaN") && !itemListStr.includes("Infinity"), "no null, undefined, NaN, or Infinity is emitted in JSON-LD");

const fallbackPopulated = {
  isFallback: true,
  topScorers: healthy.topScorers,
};

const fallbackRows = topScorerRows(fallbackPopulated.topScorers);

assert(hasTrustedTopScorerData(fallbackPopulated) === true, "fallback + nonempty canonical leaderboard is trusted");
assert(fallbackRows.length === 3, "populated fallback rows remain visible");
assert(fallbackRows[0]?.playerName === "Lionel Messi", "scorer ordering is unchanged in fallback rows");

const fallbackEmpty = {
  isFallback: true,
  topScorers: [],
};
assert(hasTrustedTopScorerData(fallbackEmpty) === false, "fallback + empty leaderboard is not trusted (fail-closed)");
assert(topScorerRows(fallbackEmpty.topScorers).length === 0, "empty fallback remains fail-closed (no rows)");

const noData = {
  isFallback: false,
  topScorers: [],
};
assert(hasTrustedTopScorerData(noData) === false, "nonfallback + empty leaderboard is not trusted");

assert(buildTopScorersItemListLd([]) === null, "empty scorer data emits no ItemList");

// --- Edge cases tests ---

// 1. three-player goals cohort with one unknown assist -> whole cohort remains tied
const unknownAssistData: PlayerRankingRecord[] = [
  { playerName: "A", teamName: "T1", teamKey: "t1", goals: 5, assists: { value: 2, isOfficial: true, isComplete: true }, minutesPlayed: { value: 100, isVerifiedComplete: true } },
  { playerName: "B", teamName: "T2", teamKey: "t2", goals: 5, assists: { value: 1, isOfficial: true, isComplete: false }, minutesPlayed: { value: 100, isVerifiedComplete: true } },
  { playerName: "C", teamName: "T3", teamKey: "t3", goals: 5, assists: { value: 3, isOfficial: true, isComplete: true }, minutesPlayed: { value: 100, isVerifiedComplete: true } }
];
const unknownAssistRows = topScorerRows(unknownAssistData);
assert(unknownAssistRows.every(r => r.rank === 1), "three-player goals cohort with one unknown assist -> whole cohort remains tied at rank 1");

// 2. complete assists split the cohort
const completeAssistData: PlayerRankingRecord[] = [
  { playerName: "A", teamName: "T1", teamKey: "t1", goals: 5, assists: { value: 2, isOfficial: true, isComplete: true }, minutesPlayed: { value: 100, isVerifiedComplete: true } },
  { playerName: "B", teamName: "T2", teamKey: "t2", goals: 5, assists: { value: 1, isOfficial: true, isComplete: true }, minutesPlayed: { value: 100, isVerifiedComplete: true } },
  { playerName: "C", teamName: "T3", teamKey: "t3", goals: 5, assists: { value: 3, isOfficial: true, isComplete: true }, minutesPlayed: { value: 100, isVerifiedComplete: true } }
];
const completeAssistRows = topScorerRows(completeAssistData);
assert(completeAssistRows[0]?.playerName === "C" && completeAssistRows[0].rank === 1, "complete assists split cohort, highest assist ranks first");
assert(completeAssistRows[1]?.playerName === "A" && completeAssistRows[1].rank === 2, "second highest assist ranks second");
assert(completeAssistRows[2]?.playerName === "B" && completeAssistRows[2].rank === 3, "lowest assist ranks third");

// 3. tied assists with one unknown minute -> minute criterion not applied
const unknownMinuteData: PlayerRankingRecord[] = [
  { playerName: "A", teamName: "T1", teamKey: "t1", goals: 5, assists: { value: 2, isOfficial: true, isComplete: true }, minutesPlayed: { value: 100, isVerifiedComplete: true } },
  { playerName: "B", teamName: "T2", teamKey: "t2", goals: 5, assists: { value: 2, isOfficial: true, isComplete: true }, minutesPlayed: { value: 90, isVerifiedComplete: false } },
  { playerName: "C", teamName: "T3", teamKey: "t3", goals: 5, assists: { value: 2, isOfficial: true, isComplete: true }, minutesPlayed: { value: 80, isVerifiedComplete: true } }
];
const unknownMinuteRows = topScorerRows(unknownMinuteData);
assert(unknownMinuteRows.every(r => r.rank === 1), "tied assists with one unknown minute -> minute criterion not applied, all tied at 1");

// 4. complete minutes -> fewer minutes ranks higher + competition ranks (1, 2, 2, 4)
const completeMinuteData: PlayerRankingRecord[] = [
  { playerName: "A", teamName: "T1", teamKey: "t1", goals: 5, assists: { value: 2, isOfficial: true, isComplete: true }, minutesPlayed: { value: 100, isVerifiedComplete: true } }, // Rank 4
  { playerName: "B", teamName: "T2", teamKey: "t2", goals: 5, assists: { value: 2, isOfficial: true, isComplete: true }, minutesPlayed: { value: 90, isVerifiedComplete: true } },  // Rank 2
  { playerName: "C", teamName: "T3", teamKey: "t3", goals: 5, assists: { value: 2, isOfficial: true, isComplete: true }, minutesPlayed: { value: 90, isVerifiedComplete: true } },  // Rank 2
  { playerName: "D", teamName: "T4", teamKey: "t4", goals: 5, assists: { value: 2, isOfficial: true, isComplete: true }, minutesPlayed: { value: 80, isVerifiedComplete: true } },  // Rank 1
];
const completeMinuteRows = topScorerRows(completeMinuteData);
assert(completeMinuteRows[0]?.playerName === "D" && completeMinuteRows[0].rank === 1, "complete minutes -> fewer minutes ranks higher (1st)");
// We have a tie for 2nd
assert(completeMinuteRows[1]?.rank === 2 && completeMinuteRows[2]?.rank === 2, "tied players share the same rank (2nd)");
assert(completeMinuteRows[3]?.playerName === "A" && completeMinuteRows[3].rank === 4, "competition rank jumps after ties (4th)");

// 5. page order, displayed rank, and JSON-LD position agree
const jsonLdData = buildTopScorersItemListLd(completeMinuteData);
const listElements = jsonLdData?.itemListElement ?? [];
assert(listElements[0].position === 1 && listElements[0].name === "D", "JSON-LD position agrees with rank 1");
assert(listElements[1].position === 2 && listElements[2].position === 2, "JSON-LD position reflects tied rank 2");
assert(listElements[3].position === 4 && listElements[3].name === "A", "JSON-LD position reflects rank 4 after ties");


console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
