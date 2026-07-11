import {
  buildTopScorersItemListLd,
  hasTrustedTopScorerData,
  topScorerRows,
} from "../lib/topScorersPageData";

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

const healthy = {
  isFallback: false,
  topScorers: [
    { playerName: "Lionel Messi", teamName: "Argentina", teamKey: "argentina", goals: 8 },
    { playerName: "Barış Alper Yılmaz", teamName: "Turkey", teamKey: "turkey", goals: 3 },
    { playerName: "Folarin Balogun", teamName: "United States", teamKey: "unitedStates", goals: 2 },
    { playerName: "Scorer unavailable", teamName: "Austria", teamKey: "austria", goals: 1 },
  ],
};

const rows = topScorerRows(healthy.topScorers);
const itemList = buildTopScorersItemListLd(healthy.topScorers) as any;

assert(hasTrustedTopScorerData(healthy) === true, "nonfallback + nonempty leaderboard is trusted");
assert(rows.length === 3, "visible Top Scorers rows exclude unresolved scorers", `got ${rows.length}`);
assert(rows[0]?.playerName === "Lionel Messi" && rows[0]?.goals === 8, "Lionel Messi remains first with 8 goals in the canonical fixture");
assert(rows[1]?.playerName === "Barış Alper Yılmaz", "canonical Unicode name preserved in visible rows");
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

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
