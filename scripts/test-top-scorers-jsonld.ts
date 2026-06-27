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
    { playerName: "Barış Alper Yılmaz", teamName: "Turkey", goals: 3 },
    { playerName: "Folarin Balogun", teamName: "United States", goals: 2 },
    { playerName: "Scorer unavailable", teamName: "Austria", goals: 1 },
  ],
};

const rows = topScorerRows(healthy.topScorers);
const itemList = buildTopScorersItemListLd(healthy.topScorers) as any;

assert(hasTrustedTopScorerData(healthy) === true, "healthy non-fallback snapshot is trusted");
assert(rows.length === 2, "visible Top Scorers rows exclude unresolved scorers", `got ${rows.length}`);
assert(rows[0]?.playerName === "Barış Alper Yılmaz", "canonical Unicode name preserved in visible rows");
assert(itemList?.["@type"] === "ItemList", "healthy snapshot emits ItemList JSON-LD");
assert(itemList?.numberOfItems === rows.length, "ItemList count matches visible rows");
assert(itemList?.itemListElement?.[0]?.name === rows[0]?.playerName, "ItemList first item matches visible ranking");
assert(itemList?.itemListElement?.[1]?.name === rows[1]?.playerName, "ItemList second item matches visible ranking");
assert(!JSON.stringify(itemList).includes("Scorer unavailable"), "ItemList excludes unresolved scorer");

const fallback = {
  isFallback: true,
  topScorers: healthy.topScorers,
};
assert(hasTrustedTopScorerData(fallback) === false, "fallback snapshot is not trusted");
assert(buildTopScorersItemListLd([]) === null, "empty scorer data emits no ItemList");

const noData = {
  isFallback: false,
  topScorers: [],
};
assert(hasTrustedTopScorerData(noData) === false, "empty scorer data is not trusted");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
