import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { TIMEZONE_SLUGS } from "../lib/timezones";

const outDirectory = path.join(process.cwd(), "out");

function readRouteHtml(route: string): string {
  const normalized = route === "/" ? "" : route.replace(/^\//, "");
  const candidates = normalized
    ? [`${normalized}.html`, path.join(normalized, "index.html")]
    : ["index.html"];
  const file = candidates.map((candidate) => path.join(outDirectory, candidate)).find(fs.existsSync);
  assert.ok(file, `npm run build must emit ${route}`);
  return fs.readFileSync(file, "utf8");
}

function matchCard(html: string, matchId: number): string {
  const marker = `href="/matches/match-${matchId}"`;
  const start = html.indexOf(marker);
  assert.notEqual(start, -1, `static HTML must link to Match ${matchId}`);
  return html.slice(start, start + 6000);
}

function assertResolvedScheduleFixture(card: string, expected: readonly string[], status: string) {
  for (const value of expected) assert.ok(card.includes(value), `fixture card must contain ${value}`);
  assert.ok(card.includes(status), `fixture card must show ${status}`);
  assert.equal(/\btbd\b/i.test(card), false, "canonically resolved fixture must not render tbd");
}

function run() {
  const schedule = readRouteHtml("/schedule");
  const scheduleCards = {
    96: matchCard(schedule, 96),
    99: matchCard(schedule, 99),
    100: matchCard(schedule, 100),
    101: matchCard(schedule, 101),
    102: matchCard(schedule, 102),
  };
  assertResolvedScheduleFixture(scheduleCards[96], ["Switzerland", "Colombia"], "PEN");
  assertResolvedScheduleFixture(scheduleCards[99], ["Norway", "England", "45+2"], "AET");
  assertResolvedScheduleFixture(scheduleCards[100], ["Argentina", "Switzerland", "Alexis Mac Allister", "120+1"], "AET");
  assertResolvedScheduleFixture(scheduleCards[101], ["France", "Spain"], "vs");
  assertResolvedScheduleFixture(scheduleCards[102], ["England", "Argentina"], "vs");

  for (const zone of TIMEZONE_SLUGS) {
    const html = readRouteHtml(`/schedule/${zone}`);
    for (const [matchId, values, status] of [
      [96, ["Switzerland", "Colombia"], "PEN"],
      [99, ["Norway", "England", "45+2"], "AET"],
      [100, ["Argentina", "Switzerland", "Alexis Mac Allister", "120+1"], "AET"],
      [101, ["France", "Spain"], "vs"],
      [102, ["England", "Argentina"], "vs"],
    ] as const) {
      assertResolvedScheduleFixture(matchCard(html, matchId), values, status);
    }
  }

  const today = readRouteHtml("/today");
  for (const stale of ["Loading matchday", "Loading timezone", "Latest Results", "Up Next"]) {
    assert.equal(today.includes(stale), false, `/today static HTML must not contain ${stale}`);
  }
  for (const matchId of [103, 104]) {
    assert.equal(today.includes(`href="/matches/match-${matchId}"`), false, `/today must not link Match ${matchId}`);
  }
  for (const matchId of [97, 98, 99, 100, 101, 102]) {
    assert.ok(today.includes(`href="/matches/match-${matchId}"`), `/today must contain Match ${matchId}`);
  }

  const todaySource = fs.readFileSync("components/TodayContent.tsx", "utf8");
  assert.equal(todaySource.includes("TodayPageLiveSection"), false, "query-string Today views must not select a second fixture list");
  assert.equal((todaySource.match(/<MatchCenterContent/g) ?? []).length, 1, "bare and query-string Today views must share one Match Center output path");

  const bracket = readRouteHtml("/bracket");
  assert.match(bracket, /Current phase[\s\S]{0,80}Semifinals/);
  assert.equal(bracket.includes("3rd-place qualifier"), false);
  assert.equal(bracket.includes("Eligible groups are shown in each Round-of-32 slot"), false);
  assert.equal((bracket.match(/>Final</g) ?? []).length, 1, "bracket must render one Final heading");
  assert.ok(bracket.includes("Third-place playoff"));
  assert.ok(bracket.includes("Format"));

  const argentina = readRouteHtml("/teams/argentina");
  const england = readRouteHtml("/teams/england");
  for (const html of [argentina, england]) {
    assert.ok(html.includes("Semifinalist"));
    assert.ok(html.includes("2026 Tournament Run"));
    assert.ok(html.includes("Next: England vs Argentina"));
    assert.ok(html.includes("Group-stage history"));
  }

  assert.ok(readRouteHtml("/matches/match-99").includes("England won after extra time"));
  assert.ok(readRouteHtml("/matches/match-100").includes("Argentina won after extra time"));

  console.log(`final route content parity passed across ${TIMEZONE_SLUGS.length} timezone schedule pages`);
}

try {
  run();
} catch (error) {
  console.error(error);
  process.exit(1);
}
