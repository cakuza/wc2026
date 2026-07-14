import assert from "node:assert/strict";
import fs from "node:fs";
import matchEventsData from "../data/archive/match-events.json";
import { formatCanonicalGoalEvents, getCanonicalArchiveEventsForMatch } from "../lib/canonicalArchiveEvents";
import { getMatchPresentation, getMatchStatusLabel } from "../lib/matchPresentation";
import { getHomepageMatchCenterSnapshot, getTournamentPhase, selectHomepageTickerMatches } from "../lib/matchCenterSelection";
import { ARCHIVE_DEFAULT_DATE, MATCHES, matchSlug } from "../lib/matches";
import { buildKnockoutResolution } from "../lib/knockoutResolution";
import { buildTournamentLiveSnapshot } from "../lib/liveSnapshot";
import { readStaticArchiveData } from "../lib/staticArchiveReader";

const auditNow = new Date(ARCHIVE_DEFAULT_DATE);

async function run() {
  const snapshot = await buildTournamentLiveSnapshot({
    liveData: readStaticArchiveData(),
    worldcupGames: null,
    generatedAt: ARCHIVE_DEFAULT_DATE,
    primaryProviderOk: false,
    secondaryProviderOk: false,
    primaryProviderFetchedAt: null,
    secondaryProviderFetchedAt: null,
    skipEnrichment: true,
  });
  const resolvedParticipants = buildKnockoutResolution(snapshot.matches);

  const ticker = selectHomepageTickerMatches({ matches: MATCHES, liveData: snapshot.liveDataByProviderId, now: auditNow, resolvedParticipants });
  assert.deepEqual(ticker.map((match) => "matchNumber" in match ? match.matchNumber : null), [101, 102]);

  const phase = getTournamentPhase({ matches: MATCHES, liveData: snapshot.liveDataByProviderId, now: auditNow });
  assert.equal(phase, "semifinals");
  const homepage = getHomepageMatchCenterSnapshot({ matches: MATCHES, liveData: snapshot.liveDataByProviderId, now: auditNow, phase });
  assert.deepEqual(homepage.completedPreviousRound.map((match) => "matchNumber" in match ? match.matchNumber : null), [97, 98, 99, 100]);
  assert.deepEqual(homepage.upcomingCurrentRound.map((match) => "matchNumber" in match ? match.matchNumber : null), [101, 102]);

  const presentation = (matchNumber: number) => {
    const match = MATCHES.find((candidate) => "matchNumber" in candidate && candidate.matchNumber === matchNumber);
    assert.ok(match, `match ${matchNumber} exists`);
    return getMatchPresentation({ match, liveData: snapshot.liveDataByProviderId[String(match.providerIds?.footballData)], timeZone: "UTC", now: auditNow });
  };
  assert.equal(getMatchStatusLabel(presentation(99)), "AET");
  assert.equal(getMatchStatusLabel(presentation(100)), "AET");
  assert.equal(getMatchStatusLabel(presentation(96)), "PEN");

  const match99Goals = formatCanonicalGoalEvents(getCanonicalArchiveEventsForMatch(matchEventsData, "match-99"));
  const match100Goals = formatCanonicalGoalEvents(getCanonicalArchiveEventsForMatch(matchEventsData, "match-100"));
  assert.match(match100Goals ?? "", /Alexis Mac Allister/);
  assert.match(match99Goals ?? "", /45\+2'/);
  assert.match(match100Goals ?? "", /120\+1'/);

  const englandMatches = MATCHES.filter((match) => match.homeKey === "england" || match.awayKey === "england" || resolvedParticipants[("matchNumber" in match ? match.matchNumber : -1)]?.home?.teamKey === "england" || resolvedParticipants[("matchNumber" in match ? match.matchNumber : -1)]?.away?.teamKey === "england");
  const argentinaMatches = MATCHES.filter((match) => match.homeKey === "argentina" || match.awayKey === "argentina" || resolvedParticipants[("matchNumber" in match ? match.matchNumber : -1)]?.home?.teamKey === "argentina" || resolvedParticipants[("matchNumber" in match ? match.matchNumber : -1)]?.away?.teamKey === "argentina");
  assert.ok(englandMatches.some((match) => "matchNumber" in match && match.matchNumber === 99));
  assert.ok(argentinaMatches.some((match) => "matchNumber" in match && match.matchNumber === 100));

  const matchCenterSource = fs.readFileSync("components/MatchCenterContent.tsx", "utf8");
  const scheduleSource = fs.readFileSync("app/schedule/ScheduleContent.tsx", "utf8");
  const teamSource = fs.readFileSync("components/TeamDetail.tsx", "utf8");
  const bracketSource = fs.readFileSync("app/bracket/BracketContent.tsx", "utf8");
  const homeTeamsSource = fs.readFileSync("components/TeamsByConfederation.tsx", "utf8");
  const scorersSource = fs.readFileSync("components/TopScorersTable.tsx", "utf8");
  assert.equal(matchCenterSource.includes("useEffect"), false, "homepage match-center output must not drift after hydration");
  assert.equal(scheduleSource.includes("useEffect"), false, "schedule output must not drift after hydration");
  assert.equal(matchCenterSource.includes("shortScorerName"), false, "homepage cards must preserve canonical compound names");
  assert.equal(scheduleSource.includes('aria-hidden="true"'), false, "responsive schedule metadata must remain exposed");
  assert.ok(scheduleSource.includes("data-schedule-meta"));
  assert.equal(scheduleSource.includes("data-schedule-right-meta"), false, "schedule must use one semantic metadata container");
  assert.ok(scheduleSource.includes('scoreDuration === "EXTRA_TIME" ? "AET"'));
  assert.ok(scheduleSource.includes('scoreDuration === "PENALTY_SHOOTOUT" ? "PEN"'));
  assert.ok(teamSource.includes("hasKnockoutJourney"));
  assert.ok(teamSource.includes("Tournament journey"));
  assert.ok(bracketSource.includes("Current phase"));
  assert.ok(bracketSource.includes("THIRD_PLACE_MATCH"));
  const homepagePreviewSource = homeTeamsSource.split("export function TeamsByConfederation()", 1)[0];
  assert.equal(homepagePreviewSource.includes("teams.map((tm)"), false, "homepage must not render all 48 team chips");
  assert.ok(scorersSource.includes("INITIAL_ROW_COUNT = 25"));
  assert.ok(scorersSource.includes("Show all ${rows.length} scorers"));
  assert.ok(scorersSource.includes("Search players or teams"));

  console.log("post-release content and visual audit passed");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
