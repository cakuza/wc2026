import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

let passed = 0;
let failed = 0;
function assert(condition: boolean, msg: string) {
  if (condition) { console.log(`  PASS  ${msg}`); passed++; }
  else { console.error(`  FAIL  ${msg}`); failed++; }
}

console.log("=== Homepage opening banner removal test ===\n");

const root = process.cwd();
const page = readFileSync(join(root, "app/page.tsx"), "utf8");
assert(!page.includes("OpeningMatchBanner"), "homepage no longer imports/renders OpeningMatchBanner");
assert(!existsSync(join(root, "components/OpeningMatchBanner.tsx")), "obsolete OpeningMatchBanner component file is removed");
assert(!page.includes("Opening match complete"), "homepage source does not contain opening-match complete text");
assert(!page.includes("View match result"), "homepage source does not contain opening-match result link");
assert(page.includes("<Ticker items={tickerMatches} />"), "homepage upcoming ticker remains present");
assert(page.includes("<Hero initialMatchday={initialMatchday} />"), "homepage hero remains present after ticker");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
