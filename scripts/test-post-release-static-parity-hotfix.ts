import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { MATCHES } from "../lib/matches";

const outDirectory = path.join(process.cwd(), "out");

function readRouteHtml(route: string): string {
  const normalized = route === "/" ? "" : route.replace(/^\//, "");
  const candidates = normalized
    ? [`${normalized}.html`, path.join(normalized, "index.html")]
    : ["index.html"];
  const file = candidates
    .map((candidate) => path.join(outDirectory, candidate))
    .find((candidate) => fs.existsSync(candidate));

  assert.ok(file, `npm run build must emit static HTML for ${route}`);
  return fs.readFileSync(file, "utf8");
}

function countOccurrences(value: string, needle: string): number {
  return value.split(needle).length - 1;
}

function matchCardHtml(html: string, slug: string): string {
  const start = html.indexOf(`href="/matches/${slug}"`);
  assert.notEqual(start, -1, `static HTML must link to ${slug}`);
  return html.slice(start, start + 5000);
}

function run() {
  const homepageHtml = readRouteHtml("/");
  const todayHtml = readRouteHtml("/today");
  const scheduleHtml = readRouteHtml("/schedule");

  assert.equal(todayHtml.includes("Latest Results"), false, "/today must not render stale latest-results content");
  assert.equal(todayHtml.includes("Up Next"), false, "/today must not render generic up-next content");
  for (const matchNumber of [103, 104]) {
    assert.ok(todayHtml.includes(`href="/matches/match-${matchNumber}"`), `/today must expose Match ${matchNumber} links`);
  }
  assert.ok(todayHtml.includes("Final Weekend"), "/today must retain Final Weekend messaging before archive completion");
  assert.ok(homepageHtml.includes("Final Weekend"), "homepage must retain Final Weekend messaging before archive completion");

  for (const [name, html] of [["homepage", homepageHtml], ["schedule", scheduleHtml]] as const) {
    assert.match(html, /45\+2['’]/, `${name} static HTML must preserve Match 99 stoppage time`);
    assert.match(html, /120\+1['’]/, `${name} static HTML must preserve Match 100 stoppage time`);
  }

  const metadataCount = countOccurrences(scheduleHtml, "data-schedule-meta");
  assert.equal(metadataCount, MATCHES.length, "schedule static HTML must contain exactly one metadata container per match");
  assert.equal(countOccurrences(scheduleHtml, "data-schedule-right-meta"), 0, "legacy duplicate desktop metadata must not be emitted");

  assert.match(matchCardHtml(scheduleHtml, "match-99"), /AET/, "Match 99 must show AET in static schedule HTML");
  assert.match(matchCardHtml(scheduleHtml, "match-100"), /AET/, "Match 100 must show AET in static schedule HTML");
  assert.match(matchCardHtml(scheduleHtml, "match-103"), /Third-place playoff/, "Match 103 must remain discoverable in static schedule HTML");
  assert.match(matchCardHtml(scheduleHtml, "match-104"), /Final/, "Match 104 must remain discoverable in static schedule HTML");
  assert.match(matchCardHtml(scheduleHtml, "match-96"), /PEN/, "Match 96 must show PEN in static schedule HTML");

  const todaySource = fs.readFileSync("components/TodayContent.tsx", "utf8");
  const matchCenterSource = fs.readFileSync("components/MatchCenterContent.tsx", "utf8");
  const scheduleSource = fs.readFileSync("app/schedule/ScheduleContent.tsx", "utf8");
  assert.ok(todaySource.includes('mode="current"'), "/today must use the phase-aware current Match Center mode");
  assert.ok(matchCenterSource.includes('mode === "homepage" || mode === "current"'), "homepage and /today must share the phase-aware selector");
  assert.ok(matchCenterSource.includes("isComplete={isTournamentComplete}"), "archive completion must not be inferred from phase or countdown state");
  assert.equal(matchCenterSource.includes("useEffect"), false, "Match Center must not client-filter after hydration");
  assert.equal(scheduleSource.includes("useEffect"), false, "schedule must not alter static semantics after hydration");

  console.log(`post-release static parity hotfix passed (schedule metadata containers: ${metadataCount})`);
}

try {
  run();
} catch (error) {
  console.error(error);
  process.exit(1);
}
