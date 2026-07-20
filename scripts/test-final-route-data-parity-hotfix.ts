import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getCanonicalGoalScoringTeam } from "../lib/canonicalArchiveEvents";
import { applyCanonicalMatchResultFallback } from "../lib/canonicalMatchResults";
import { getTournamentLiveSnapshot } from "../lib/liveSnapshot";
import { MATCHES } from "../lib/matches";
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

function mainText(html: string): string {
  const start = html.indexOf("<main");
  const end = html.indexOf("</main>", start);
  const main = start >= 0 && end >= 0 ? html.slice(start, end) : html;
  return main
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&ndash;|&mdash;/g, "–")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchCard(html: string, matchId: number): string {
  const marker = `href="/matches/match-${matchId}"`;
  const start = html.indexOf(marker);
  assert.notEqual(start, -1, `static HTML must link to Match ${matchId}`);
  return html.slice(start, start + 6000);
}

function assertCardContains(card: string, values: readonly string[]) {
  for (const value of values) {
    assert.ok(card.includes(value), `fixture card must contain ${value}`);
  }
  assert.equal(/\btbd\b/i.test(card), false, "canonically resolved fixture must not render tbd");
}

function htmlFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const item = path.join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === "_next" ? [] : htmlFiles(item);
    return entry.isFile() && entry.name.endsWith(".html") ? [item] : [];
  });
}

async function run() {
  const schedule = readRouteHtml("/schedule");
  const canonicalCards = {
    86: matchCard(schedule, 86),
    96: matchCard(schedule, 96),
    99: matchCard(schedule, 99),
    100: matchCard(schedule, 100),
    101: matchCard(schedule, 101),
    102: matchCard(schedule, 102),
    103: matchCard(schedule, 103),
    104: matchCard(schedule, 104),
  };
  assertCardContains(canonicalCards[86], ["Argentina", "Cape Verde", "AET", "Diney Borges (OG)"]);
  assertCardContains(canonicalCards[96], ["Switzerland", "Colombia", "PEN"]);
  assertCardContains(canonicalCards[99], ["Norway", "England", "AET", "45+2", "Jude Bellingham"]);
  assertCardContains(canonicalCards[100], ["Argentina", "Switzerland", "AET", "Alexis Mac Allister", "120+1"]);
  assertCardContains(canonicalCards[101], ["France", "Spain"]);
  assertCardContains(canonicalCards[102], ["England", "Argentina"]);
  assertCardContains(canonicalCards[103], ["Third-place playoff"]);
  assertCardContains(canonicalCards[104], ["Final"]);

  for (const zone of TIMEZONE_SLUGS) {
    const html = readRouteHtml(`/schedule/${zone}`);
    assert.equal((html.match(/data-schedule-meta/g) ?? []).length, 104, `${zone} must expose one metadata block per fixture`);
    assertCardContains(matchCard(html, 86), ["Argentina", "Cape Verde", "AET", "Diney Borges (OG)"]);
    assertCardContains(matchCard(html, 96), ["Switzerland", "Colombia", "PEN"]);
    assertCardContains(matchCard(html, 99), ["Norway", "England", "AET", "45+2"]);
    assertCardContains(matchCard(html, 100), ["Argentina", "Switzerland", "AET", "Alexis Mac Allister", "120+1"]);
    assertCardContains(matchCard(html, 101), ["France", "Spain"]);
    assertCardContains(matchCard(html, 102), ["England", "Argentina"]);
    assertCardContains(matchCard(html, 103), ["Third-place playoff"]);
    assertCardContains(matchCard(html, 104), ["Final"]);
  }

  const match86Text = mainText(readRouteHtml("/matches/match-86"));
  assert.match(match86Text, /Argentina 3 – 2 AET/);
  assert.match(match86Text, /Argentina won after extra time/);
  for (const event of ["29' Lionel Messi", "59' Deroy Duarte", "92' Lisandro Martínez", "103' Sidny Lopes Cabral", "111' Diney Borges — Argentina (OG)"]) {
    assert.ok(match86Text.includes(event), `Match 86 must visibly render ${event}`);
  }
  assert.equal((match86Text.match(/111' Diney Borges \u2014 Argentina \(OG\)/g) ?? []).length, 1, "Match 86 own-goal event must render exactly once");

  const argentinaTeamText = mainText(readRouteHtml("/teams/argentina"));
  assert.ok(argentinaTeamText.includes("111' Diney Borges (OG)"), "Argentina journey must retain Match 86 own goal");

  const match99Text = mainText(readRouteHtml("/matches/match-99"));
  const match100Text = mainText(readRouteHtml("/matches/match-100"));
  assert.ok(match99Text.includes("England won after extra time"));
  assert.ok(match100Text.includes("Argentina won after extra time"));

  const today = readRouteHtml("/today");
  for (const stale of ["Loading matchday", "Loading timezone", "Latest Results", "Up Next"]) {
    assert.equal(today.includes(stale), false, `/today must not contain ${stale}`);
  }
  const todayIds = [...today.matchAll(/href="\/matches\/match-(\d+)"/g)].map((match) => Number(match[1]));
  assert.ok(today.includes("Is Complete") || today.includes("complete"), "/today must retain Completed messaging after archive completion");
  assert.deepEqual([...new Set(todayIds)], [104, 103, 102, 101, 97, 98, 99, 100]);
  const todaySource = fs.readFileSync("components/TodayContent.tsx", "utf8");
  assert.equal(todaySource.includes("TodayPageLiveSection"), false, "query parameters must not select a second Match Center list");

  const snapshot = await getTournamentLiveSnapshot();
  const match86 = snapshot.matches["match-86"];
  assert.ok(match86);
  assert.equal(match86.homeScore, 3);
  assert.equal(match86.awayScore, 2);
  assert.equal(match86.live?.scoreDuration, "EXTRA_TIME");
  assert.equal(match86.scorers.length, 5);
  assert.equal(match86.scorers.filter((event) => event.isOwnGoal).length, 1);
  assert.equal(match86.scorers.find((event) => event.isOwnGoal)?.playerName, "Diney Borges");
  const eventKeys = match86.scorers.map((event) => `${event.minute}|${event.stoppageTime ?? ""}|${event.playerName}|${event.isOwnGoal ? "og" : "goal"}`);
  assert.equal(new Set(eventKeys).size, eventKeys.length, "Match 86 snapshot must not duplicate archive events");
  assert.equal(snapshot.topScorers.some((player) => player.playerName === "Diney Borges"), false, "own goals must not inflate scorer totals");

  assert.equal(
    getCanonicalGoalScoringTeam({ eventType: "own_goal", teamKey: "Away Team" }, "homeTeam", "awayTeam"),
    "homeTeam",
    "own goals must credit the opposing canonical team while preserving their scorer",
  );
  const match73 = MATCHES.find((match) => "matchNumber" in match && match.matchNumber === 73);
  assert.ok(match73, "Match 73 must exist for normal-time stoppage regression coverage");
  const match73ProviderId = match73.providerIds?.footballData;
  assert.ok(match73ProviderId, "Match 73 must have a canonical provider ID");
  const normalTimeStoppage = applyCanonicalMatchResultFallback(match73, {
    provider: "football-data.org",
    providerMatchId: match73ProviderId,
    status: "FINISHED",
    homeScore: 0,
    awayScore: 1,
    winner: "AWAY_TEAM",
    lastSyncedAt: "2026-07-14T00:00:00.000Z",
    eventDataAvailable: true,
    goals: [{ type: "GOAL", minute: 90, stoppageTime: 11, teamName: "awayTeam", playerName: "Stoppage scorer" }],
  }, "2026-07-14T00:00:00.000Z");
  assert.equal(normalTimeStoppage?.scoreDuration, "REGULAR", "90+11 must remain normal time rather than becoming AET");

  for (const file of htmlFiles(outDirectory)) {
    const html = fs.readFileSync(file, "utf8");
    const headerEnd = html.indexOf("</header>");
    assert.ok(headerEnd >= 0, `${path.relative(outDirectory, file)} must use the shared site header`);
    const header = html.slice(0, headerEnd);
    for (const label of ["Match Center", "Schedule", "Bracket", "Teams"]) {
      assert.ok(header.includes(label), `${path.relative(outDirectory, file)} header must contain ${label}`);
    }
    assert.equal(header.includes(">Today<"), false, "legacy Today label must not appear in the shared header");
    assert.equal(header.includes(">Standings<"), false, "legacy Standings label must not appear in the shared header");
    assert.equal(header.includes(">3rd-Place<"), false, "legacy 3rd-Place label must not appear in the shared header");
  }

  console.log(`final route data parity hotfix passed across ${TIMEZONE_SLUGS.length} timezone schedules and ${htmlFiles(outDirectory).length} public HTML pages`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
