import assert from "node:assert/strict";
import fs from "node:fs";
import matchEventsData from "../data/archive/match-events.json";
import { formatCanonicalGoalEvents, getCanonicalArchiveEventsForMatch } from "../lib/canonicalArchiveEvents";
import { T } from "../lib/i18n";
import type { LiveMatchData, LiveMatchEvent } from "../lib/liveMatchData";
import { getMatchPresentation, getMatchStatusLabel } from "../lib/matchPresentation";
import { selectHomepageTickerMatches } from "../lib/matchCenterSelection";
import { ARCHIVE_DEFAULT_DATE, MATCHES, matchSlug } from "../lib/matches";
import { buildKnockoutResolution } from "../lib/knockoutResolution";
import { buildTournamentLiveSnapshot } from "../lib/liveSnapshot";
import { readStaticArchiveData } from "../lib/staticArchiveReader";
import { computePlayerEventLeaderboards, computeTopScorers, resolveCanonicalPlayerIdentity } from "../lib/tournamentStats";

const auditNow = new Date("2026-07-12T12:00:00Z");

function makeLive(events: Partial<LiveMatchData>): LiveMatchData {
  return {
    provider: "football-data.org",
    providerMatchId: 999999,
    status: "FINISHED",
    homeScore: 0,
    awayScore: 0,
    winner: "DRAW",
    lastSyncedAt: ARCHIVE_DEFAULT_DATE,
    eventDataAvailable: true,
    ...events,
  };
}

function playerRow<T extends { playerName: string; teamKey: string | null }>(rows: T[], playerName: string, teamKey: string) {
  return rows.find((row) => row.playerName === playerName && row.teamKey === teamKey);
}

async function run() {
  const snapshot = await buildTournamentLiveSnapshot({
    liveData: readStaticArchiveData(),
    worldcupGames: null,
    generatedAt: "2026-07-12T12:00:00Z",
    primaryProviderOk: false,
    secondaryProviderOk: false,
    primaryProviderFetchedAt: null,
    secondaryProviderFetchedAt: null,
    skipEnrichment: true,
  });

  const fullLiveData = readStaticArchiveData();
  const semiStateLiveData = new Map(fullLiveData);
  [537387, 537388, 537389, 537390].forEach((id) => semiStateLiveData.delete(id));
  const semiSnapshot = await buildTournamentLiveSnapshot({
    liveData: semiStateLiveData,
    worldcupGames: null,
    generatedAt: "2026-07-12T12:00:00Z",
    primaryProviderOk: false,
    secondaryProviderOk: false,
    primaryProviderFetchedAt: null,
    secondaryProviderFetchedAt: null,
    skipEnrichment: true,
  });

  const resolvedParticipants = buildKnockoutResolution(semiSnapshot.matches);

  const ticker = selectHomepageTickerMatches({
    matches: MATCHES,
    liveData: semiSnapshot.liveDataByProviderId,
    now: auditNow,
    resolvedParticipants,
  });
  assert.deepEqual(ticker.map((match) => "matchNumber" in match ? match.matchNumber : null), [101, 102]);
  assert.equal(ticker.some((match) => "matchNumber" in match && (match.matchNumber === 103 || match.matchNumber === 104)), false);

  const goals: LiveMatchEvent[] = [
    { type: "GOAL", minute: 1, teamName: "Argentina", playerName: "ALVAREZ Julian" },
    { type: "GOAL", minute: 2, teamName: "Argentina", playerName: "Julian Alvarez" },
    { type: "GOAL", minute: 3, teamName: "Argentina", playerName: "Julián Álvarez" },
    { type: "GOAL", minute: 4, teamName: "Argentina", playerName: "MAC ALLISTER Alexis" },
    { type: "GOAL", minute: 5, teamName: "Argentina", playerName: "Alexis Mac Allister" },
    { type: "GOAL", minute: 6, teamName: "Canada", playerName: "Alexis Mac Allister" },
  ];
  const synthetic = makeLive({
    goals,
    bookings: [{ type: "SECOND_YELLOW", minute: 70, teamName: "Argentina", playerName: "MAC ALLISTER Alexis" }],
    shootoutAttempts: [{ type: "PENALTY_SHOOTOUT_SCORED", minute: null, teamName: "Argentina", playerName: "Julian Alvarez" }],
  });
  const scorers = computeTopScorers(new Map([[synthetic.providerMatchId, synthetic]]));
  assert.equal(playerRow(scorers, "Julián Álvarez", "argentina")?.goals, 3);
  assert.equal(playerRow(scorers, "Alexis Mac Allister", "argentina")?.goals, 2);
  assert.equal(playerRow(scorers, "Alexis Mac Allister", "canada")?.goals, 1);
  assert.equal(scorers.filter((row) => row.playerName === "Alexis Mac Allister").length, 2);

  const playerEvents = computePlayerEventLeaderboards(new Map([[synthetic.providerMatchId, synthetic]]));
  assert.equal(playerRow(playerEvents.redCards, "Alexis Mac Allister", "argentina")?.value, 1);
  assert.equal(playerRow(playerEvents.shootoutScored, "Julián Álvarez", "argentina")?.value, 1);

  const canonicalArchiveGoalCount = (playerName: string, teamName: string) => {
    const identity = resolveCanonicalPlayerIdentity(playerName, teamName);
    assert.ok(identity, `canonical identity required for ${playerName}`);
    return MATCHES.reduce((count, match) => count + getCanonicalArchiveEventsForMatch(matchEventsData, matchSlug(match))
      .filter((event) => event.eventType === "goal" || event.eventType === "penalty_goal")
      .filter((event) => resolveCanonicalPlayerIdentity(event.playerName, event.teamKey)?.key === identity.key)
      .length, 0);
  };
  const assertArchiveScorer = (playerName: string, teamName: string, expectedTotal: number) => {
    const identity = resolveCanonicalPlayerIdentity(playerName, teamName)!;
    const archiveCount = canonicalArchiveGoalCount(playerName, teamName);
    assert.equal(archiveCount, expectedTotal, `${playerName} canonical archive goals`);
    assert.ok(archiveCount > 0, `${playerName} must have a canonical archive goal`);
    const rows = snapshot.topScorers.filter((row) => row.teamKey === identity.teamKey && row.playerName === identity.playerName);
    assert.equal(rows.length, 1, `${playerName} must have exactly one canonical snapshot row`);
    assert.equal(rows[0]?.goals, archiveCount, `${playerName} snapshot total must equal canonical archive goals`);
  };
  const alvarez = "Juli\u00e1n \u00c1lvarez";
  const lautaro = "Lautaro Mart\u00ednez";
  assertArchiveScorer(alvarez, "Argentina", 1);
  assertArchiveScorer("Alexis Mac Allister", "Argentina", 1);
  assertArchiveScorer(lautaro, "Argentina", 2);
  assertArchiveScorer("Jude Bellingham", "England", 7);
  assertArchiveScorer("Dan Ndoye", "Switzerland", 2);
  assertArchiveScorer("Anthony Gordon", "England", 1);
  assertArchiveScorer("Enzo Fern\u00e1ndez", "Argentina", 2);

  const messiAssists = MATCHES.flatMap((match) => getCanonicalArchiveEventsForMatch(matchEventsData, matchSlug(match)))
    .filter((event) => event.eventType === "goal" && resolveCanonicalPlayerIdentity(event.assistPlayerName || "", event.teamKey)?.playerName === "Lionel Messi")
    .length;
  assert.equal(messiAssists, 4, "Lionel Messi gains two Match 102 assists");

  const rogersAssists = MATCHES.flatMap((match) => getCanonicalArchiveEventsForMatch(matchEventsData, matchSlug(match)))
    .filter((event) => event.eventType === "goal" && resolveCanonicalPlayerIdentity(event.assistPlayerName || "", event.teamKey)?.playerName === "Morgan Rogers")
    .length;
  assert.equal(rogersAssists, 1, "Morgan Rogers assist total");

  for (const rawAlias of ["ALVAREZ Julian", "Julian Alvarez", "MAC ALLISTER Alexis"]) {
    assert.equal(snapshot.topScorers.some((row) => row.playerName === rawAlias), false, `${rawAlias} must not appear as a separate snapshot scorer`);
  }
  const canonicalArchiveGoalTotal = MATCHES.flatMap((match) => getCanonicalArchiveEventsForMatch(matchEventsData, matchSlug(match)))
    .filter((event) => event.eventType === "goal" || event.eventType === "penalty_goal")
    .length;
  assert.equal(
    snapshot.topScorers.reduce((total, row) => total + row.goals, 0),
    canonicalArchiveGoalTotal,
    "snapshot scorer totals must not duplicate canonical archive goals",
  );

  const match102 = MATCHES.find((match) => "matchNumber" in match && match.matchNumber === 102)!;
  const match102Events = getCanonicalArchiveEventsForMatch(matchEventsData, matchSlug(match102));
  const match102Goals = match102Events.filter((e) => e.eventType === "goal");
  assert.equal(match102Goals.length, 3, "exactly three goal events in Match 102");

  const gordonGoal = match102Goals.find(g => g.playerName === "Anthony Gordon");
  const enzoGoal = match102Goals.find(g => g.playerName === "Enzo Fernández");
  const lautaroGoal = match102Goals.find(g => g.playerName === "Lautaro Martínez");

  assert.equal(gordonGoal?.assistPlayerName, "Morgan Rogers", "Gordon assisted by Rogers");
  assert.equal(enzoGoal?.assistPlayerName, "Lionel Messi", "Enzo assisted by Messi");
  assert.equal(lautaroGoal?.assistPlayerName, "Lionel Messi", "Lautaro assisted by Messi");

  const matchStatsData = JSON.parse(fs.readFileSync("data/archive/match-stats.json", "utf8"));
  const match102Stats = matchStatsData.find((s: any) => s.matchId === "match-102");
  assert.ok(match102Stats, "exactly one completed Match 102 result stats");
  assert.equal(match102Stats.possession.home, 35.7, "England possession is 35.7");
  assert.equal(match102Stats.possession.away, 64.3, "Argentina possession is 64.3");

  for (const e of match102Events as any[]) {
    assert.ok(!e.id.startsWith("espn:102_"), "no espn:102_* IDs");
    assert.ok(e.id.startsWith("espn:"), "authentic ESPN provider event IDs");
  }
  const match102Yellows = match102Events.filter(e => e.eventType === "yellow_card");
  assert.equal(match102Yellows.length, 4, "all ESPN cards are represented");

  const match102Subs = match102Events.filter(e => e.eventType === "substitution");
  assert.equal(match102Subs.length, 10, "all ESPN substitutions supported by the schema are represented");

  const match102GoalsHT = match102Goals.filter(g => (g as any).period === "first_half");
  assert.equal(match102GoalsHT.length, 0, "halftime score is 0-0");

  const engGoals = match102Goals.filter(g => g.teamKey === "England").length;
  const argGoals = match102Goals.filter(g => g.teamKey === "Argentina").length;
  assert.equal(engGoals, 1, "final score England 1");
  assert.equal(argGoals, 2, "final score Argentina 2");

  const match99 = MATCHES.find((match) => "matchNumber" in match && match.matchNumber === 99)!;
  const match100 = MATCHES.find((match) => "matchNumber" in match && match.matchNumber === 100)!;
  const presentation = (match: typeof match99) => getMatchPresentation({
    match,
    liveData: match.providerIds?.footballData == null ? undefined : snapshot.liveDataByProviderId[String(match.providerIds.footballData)],
    timeZone: "UTC",
    now: auditNow,
  });
  assert.equal(presentation(match99).scoreDuration, "EXTRA_TIME");
  assert.equal(presentation(match100).scoreDuration, "EXTRA_TIME");
  assert.equal(getMatchStatusLabel(presentation(match99)), "AET");
  assert.equal(getMatchStatusLabel(presentation(match100)), "AET");
  const shootout = MATCHES.find((match) => presentation(match as typeof match99).scoreDuration === "PENALTY_SHOOTOUT");
  assert.ok(shootout, "a canonical shootout fixture is required");
  assert.equal(presentation(shootout).scoreDuration, "PENALTY_SHOOTOUT");
  assert.equal(getMatchStatusLabel(presentation(shootout)), "PEN");

  for (const match of [match99, match100]) {
    const events = getCanonicalArchiveEventsForMatch(matchEventsData, matchSlug(match));
    assert.ok(events.length > 0, `canonical archive events required for ${matchSlug(match)}`);
    assert.ok(formatCanonicalGoalEvents(events) !== null, `canonical goal line required for ${matchSlug(match)}`);
  }
  const embolo = getCanonicalArchiveEventsForMatch(matchEventsData, matchSlug(match100))
    .find((event) => event.playerName === "Breel Embolo" && event.eventType === "second_yellow");
  assert.equal(embolo?.eventType, "second_yellow");
  for (const [language, translations] of Object.entries(T)) {
    assert.ok(translations.lbl_second_yellow, `missing second-yellow translation for ${language}`);
    assert.ok(translations.match_status_aet, `missing AET translation for ${language}`);
    assert.ok(translations.match_status_pen, `missing PEN translation for ${language}`);
  }

  const scheduleSource = fs.readFileSync("app/schedule/ScheduleContent.tsx", "utf8");
  assert.equal(scheduleSource.includes('aria-hidden="true" className="mt-2 flex items-center gap-2 sm:hidden'), false);
  assert.ok(scheduleSource.includes("data-schedule-meta"));
  assert.equal(scheduleSource.includes("data-schedule-right-meta"), false, "schedule must use one semantic metadata container");
  assert.ok(scheduleSource.includes('scoreDuration === "EXTRA_TIME" ? "AET"'));
  assert.ok(scheduleSource.includes('scoreDuration === "PENALTY_SHOOTOUT" ? "PEN"'));
  assert.ok(scheduleSource.includes('t("match_status_aet")'));
  assert.ok(scheduleSource.includes('t("match_status_pen")'));

  const teamDetailSource = fs.readFileSync("components/TeamDetail.tsx", "utf8");
  const teamPageSource = fs.readFileSync("app/teams/[slug]/page.tsx", "utf8");
  const teamTournamentStatusSource = fs.readFileSync("lib/teamTournamentStatus.ts", "utf8");
  const matchDetailSource = fs.readFileSync("components/MatchDetail.tsx", "utf8");
  assert.ok(teamDetailSource.includes("getCanonicalArchiveEventsForMatch(eventsArchive, matchSlug(m))"));
  assert.ok(teamDetailSource.includes("formatCanonicalGoalEvents(archiveEvents)"));
  assert.ok(teamDetailSource.includes("getMatchStatusLabel(getMatchPresentation({"));
  assert.ok(teamPageSource.includes("teamMatches={teamMatches}"));
  assert.ok(teamPageSource.includes("eventsArchive={teamEvents}"));
  assert.ok(teamPageSource.includes("getTeamTournamentStatus("));
  assert.ok(teamTournamentStatusSource.includes("getResolvedHomeTeam(match, resolvedParticipants)"));
  assert.ok(matchDetailSource.includes("getCanonicalArchiveEventsForMatch(archiveEvents || [], matchSlug(match))"));
  assert.ok(matchDetailSource.includes("eventType === 'second_yellow' ? 'SECOND_YELLOW'"));
  assert.ok(matchDetailSource.includes('t("lbl_second_yellow")'));
  assert.equal(matchDetailSource.includes("{b.playerName} (${b.type})"), false);
  console.log("post-semifinal audit passed");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
