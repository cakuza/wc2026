import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { TIMEZONE_SLUGS } from "../lib/timezones";

const outDirectory = path.join(process.cwd(), "out");
function html(route: string) { const name = route === "/" ? "index.html" : `${route.slice(1)}.html`; const nested = route === "/" ? name : path.join(route.slice(1), "index.html"); const file = [name, nested].map((x) => path.join(outDirectory, x)).find(fs.existsSync); assert.ok(file, `npm run build:p0 must emit ${route}`); return fs.readFileSync(file, "utf8"); }
function card(value: string, matchNumber: number) { const start = value.indexOf(`href="/matches/match-${matchNumber}"`); assert.notEqual(start, -1, `static HTML must link to Match ${matchNumber}`); return value.slice(start, start + 6000); }
function fixture(value: string, matchNumber: number, expected: readonly string[]) { const item = card(value, matchNumber); for (const text of expected) assert.ok(item.includes(text), `Match ${matchNumber} must contain ${text}`); assert.equal(/\btbd\b/i.test(item), false, `Match ${matchNumber} participants must be resolved`); }

try {
  const scheduleRoutes = ["/schedule", ...TIMEZONE_SLUGS.map((zone) => `/schedule/${zone}`)];
  for (const route of scheduleRoutes) {
    const schedule = html(route);
    fixture(schedule, 96, ["Switzerland", "Colombia", "PEN"]); fixture(schedule, 99, ["Norway", "England", "45+2", "AET"]); fixture(schedule, 100, ["Argentina", "Switzerland", "120+1", "AET"]);
    fixture(schedule, 101, ["France", "Spain"]); fixture(schedule, 102, ["England", "Argentina"]);
    fixture(schedule, 103, ["Third-place playoff"]); fixture(schedule, 104, ["Final"]);
  }
  const today = html("/today");
  for (const stale of ["Loading matchday", "Loading timezone", "Latest Results", "Up Next", "Destinations"]) assert.equal(today.includes(stale), false, `/today must not contain obsolete ${stale} output`);
  for (const matchNumber of [97, 98, 99, 100, 101, 102, 103, 104]) assert.ok(today.includes(`href="/matches/match-${matchNumber}"`), `/today must expose Match ${matchNumber}`);
  assert.ok(today.includes("Final Weekend"), "/today must retain Final Weekend messaging before archive completion");
  const bracket = html("/bracket"); assert.ok(bracket.includes("Third-place playoff")); assert.ok(bracket.includes("Final"));
  for (const route of ["/", "/today"]) { const value=html(route); assert.ok(value.includes("Final Weekend"), `${route} must retain Final Weekend messaging`); assert.ok(value.includes('href="/matches/match-103"'), `${route} must link Match 103`); assert.ok(value.includes('href="/matches/match-104"'), `${route} must link Match 104`); }
  const todaySource=fs.readFileSync("components/TodayContent.tsx", "utf8"); assert.equal(todaySource.includes("TodayPageLiveSection"), false); assert.equal((todaySource.match(/<MatchCenterContent/g) ?? []).length, 1);
  console.log(`final route content parity passed across ${scheduleRoutes.length} schedule pages`);
} catch (error) { console.error(error); process.exit(1); }
