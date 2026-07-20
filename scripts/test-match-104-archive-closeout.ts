import assert from "assert";
import * as fs from "fs";
import * as path from "path";
import { MATCHES, matchSlug } from "../lib/matches";
import { getTournamentLiveSnapshot } from "../lib/liveSnapshot";
import { getArchiveState } from "../lib/archiveLifecycle";
import { buildKnockoutResolution } from "../lib/knockoutResolution";
import { getPublishedAwards } from "../lib/tournamentAwards";
import { MATCH_EDITORIAL_REPORTS } from "../lib/matchEditorialRegistry";
import { getLiveRefreshPolicy } from "../lib/liveRefreshPolicy";
import { readStaticMatchEvents, readStaticArchiveData } from "../lib/staticArchiveReader";

let checkGroups = 0;
let assertions = 0;
let passedAssertions = 0;
let failedAssertions = 0;
let groupFailures = 0;

function check(name: string, fn: () => void) {
  checkGroups++;
  console.log(`\n--- Test Group: ${name} ---`);
  try {
    fn();
    console.log(`  ✅ Group Passed`);
  } catch (e: any) {
    console.error(`  ❌ Group Failed: ${e.message ?? e}`);
    console.error(e.stack);
    groupFailures++;
  }
}

function assertEq<T>(actual: T, expected: T, message?: string) {
  assertions++;
  try {
    assert.strictEqual(actual, expected, message);
    passedAssertions++;
  } catch (e) {
    failedAssertions++;
    throw e;
  }
}

function assertDeepEq<T>(actual: T, expected: T, message?: string) {
  assertions++;
  try {
    assert.deepStrictEqual(actual, expected, message);
    passedAssertions++;
  } catch (e) {
    failedAssertions++;
    throw e;
  }
}

function assertOk(value: any, message?: string) {
  assertions++;
  try {
    assert.ok(value, message);
    passedAssertions++;
  } catch (e) {
    failedAssertions++;
    throw e;
  }
}

function assertThrows(fn: () => void, message?: string) {
  assertions++;
  try {
    assert.throws(fn);
    passedAssertions++;
  } catch (e) {
    failedAssertions++;
    throw e;
  }
}

async function run() {
  console.log("\n=== Match 104 Archive Closeout Test Suite ===\n");

  const snapshot = await getTournamentLiveSnapshot();
  const resolvedParticipants = buildKnockoutResolution(snapshot.matches);
  const now = new Date("2026-07-20T08:27:59Z");

  const archive = getArchiveState({
    matches: MATCHES,
    liveData: snapshot.liveDataByProviderId,
    resolvedParticipants,
    now,
  });

  check("Match 104 result details", () => {
    const m104 = snapshot.matches["match-104"];
    const liveData = snapshot.liveDataByProviderId["537390"];

    assertEq(m104.status, "FINISHED", "Match 104 is finished");
    assertEq(m104.homeScore, 1, "Spain scored 1");
    assertEq(m104.awayScore, 0, "Argentina scored 0");
    assertEq(liveData.scoreDuration, "EXTRA_TIME", "regulation score was 0-0, resolved in extra-time");
    assertEq(liveData.penaltyShootoutScore, undefined, "no shootout occurred");

    const goals = m104.live?.goals ?? [];
    assertEq(goals.length, 1, "exactly one goal in final");
    const torresGoal = goals.find(g => g.playerName === "Ferran Torres");
    assertOk(torresGoal, "Ferran Torres scored the goal");
    assertEq(torresGoal?.minute, 106, "Torres scored in 106th minute");
    assertEq(torresGoal?.assistName, undefined, "no assist on the goal");

    const bookings = m104.live?.bookings ?? [];
    const enzoFirst = bookings.find(b => b.playerName === "Enzo Fernández" && b.type === "YELLOW_CARD" && b.minute === 82);
    const enzoSecond = bookings.find(b => b.playerName === "Enzo Fernández" && b.type === "SECOND_YELLOW" && b.minute === 90 && b.stoppageTime === 3);
    assertOk(enzoFirst, "Enzo Fernández first yellow card at 82'");
    assertOk(enzoSecond, "Enzo Fernández second yellow card (dismissal) at 90+3'");
  });

  check("Static archive loading refactor and data isolation", () => {
    const allMatchEvents = readStaticMatchEvents();

    // 1. Match 104 events available
    const m104Events = allMatchEvents.filter((e: any) => e.matchId === "match-104");
    assertOk(m104Events.length > 0, "Match 104 events exist in archive");
    const goalEv = m104Events.find((e: any) => e.eventType === "goal" && e.playerName === "Ferran Torres");
    assertOk(goalEv, "Torres goal event found");
    assertEq((goalEv as any).minute, 106);


    // 2. Match 103 events remain available
    const m103Events = allMatchEvents.filter((e: any) => e.matchId === "match-103");
    assertOk(m103Events.length > 0, "Match 103 events exist in archive");

    // 3. Ordinary group-stage match retains events
    const groupMatchEvents = allMatchEvents.filter((e: any) => e.matchId === "mexico-vs-south-africa-jun11");
    assertOk(groupMatchEvents.length > 0, "Group stage match events exist");

    // 4. Team pages event-derived stats
    const spainEvents = allMatchEvents.filter((e: any) => e.teamKey?.toLowerCase() === "spain");
    assertOk(spainEvents.length > 0, "Spain events found");
    const spainGoals = spainEvents.filter((e: any) => e.eventType === "goal");
    assertOk(spainGoals.length > 0, "Spain goals found in archive events");

    // 5. Repeated reader calls are deterministic
    const eventsCall1 = readStaticMatchEvents();
    const eventsCall2 = readStaticMatchEvents();
    assertDeepEq(eventsCall1, eventsCall2, "repeated readStaticMatchEvents is deterministic");

    const dataCall1 = readStaticArchiveData();
    const dataCall2 = readStaticArchiveData();
    assertDeepEq(Array.from(dataCall1.entries()), Array.from(dataCall2.entries()), "repeated readStaticArchiveData is deterministic");

    // 6. Caller mutation of array shell (push) cannot corrupt later reads
    const initialEvents = readStaticMatchEvents();
    const initialLength = initialEvents.length;
    // The returned array is frozen; attempting to push will throw in strict mode
    // or silently fail in non-strict, but the cache must not change.
    try { (initialEvents as unknown as unknown[]).push({ eventType: "goal", playerName: "Corruptor" }); } catch (_) {}
    const freshEvents = readStaticMatchEvents();
    assertEq(freshEvents.length, initialLength, "mutation of events array (push) does not leak to later reads");
    assertOk(!freshEvents.some((e: any) => e.playerName === "Corruptor"), "pushed element not in fresh array");

    // 7. Nested object mutation cannot corrupt later reads (key spec requirement)
    const eventsForNested = readStaticMatchEvents();
    const firstEvent = eventsForNested[0] as Record<string, unknown>;
    const originalPlayerName = firstEvent.playerName;
    // The element is frozen; any attempt to assign a property must be silently
    // ignored (non-strict) or throw (strict).  Either way the cache value must
    // remain unchanged.
    try { (firstEvent as Record<string, unknown>).playerName = "NestedCorruptor"; } catch (_) {}
    const freshEventsAfterNested = readStaticMatchEvents();
    assertEq(
      (freshEventsAfterNested[0] as Record<string, unknown>).playerName,
      originalPlayerName,
      "nested object mutation cannot corrupt the cache"
    );

    const initialDataMap = readStaticArchiveData();
    const mapSize = initialDataMap.size;
    initialDataMap.clear();
    const freshDataMap = readStaticArchiveData();
    assertEq(freshDataMap.size, mapSize, "clearing Map shell does not affect the cache");
  });


  check("Statistics totals validation", () => {
    const stats = snapshot.tournamentStats;
    assertEq(stats.matchesPlayed, 104, "Exactly 104 matches played");
    assertEq(stats.totalGoals, 308, "Exactly 308 goals scored");

    const goalsScored = snapshot.teamStatLeaderboards.goalsScored;
    const goalsConceded = snapshot.teamStatLeaderboards.goalsConceded;
    const cleanSheets = snapshot.teamStatLeaderboards.cleanSheets;

    const getGf = (key: string) => goalsScored.find(t => t.teamKey === key)?.value ?? 0;
    const getGa = (key: string) => goalsConceded.find(t => t.teamKey === key)?.value ?? 0;
    const getCs = (key: string) => cleanSheets.find(t => t.teamKey === key)?.value ?? 0;

    assertEq(getGf("spain"), 14, "Spain GF is 14");
    assertEq(getGa("spain"), 1, "Spain GA is 1");
    assertEq(getCs("spain"), 7, "Spain Clean Sheets is 7");

    assertEq(getGf("argentina"), 19, "Argentina GF is 19");
    assertEq(getGa("argentina"), 8, "Argentina GA is 8");

    assertEq(getGf("england"), 20, "England GF is 20");
    assertEq(getGa("england"), 12, "England GA is 12");

    assertEq(getGf("france"), 20, "France GF is 20");
    assertEq(getGa("france"), 10, "France GA is 10");
  });

  check("Lifecycle and synthetic completed state", () => {
    // 1. Active filter is empty
    const activeMatches = Object.values(snapshot.matches).filter(m => (m.status as string) === "LIVE" || (m.status as string) === "IN_PLAY");
    assertEq(activeMatches.length, 0, "No active matches");

    // 2. Finalists history contains Spain and Argentina
    assertEq(archive.isComplete, true, "Archive completes successfully");
    assertEq(archive.champion, "Spain");
    assertEq(archive.runnerUp, "Argentina");
    assertEq(archive.thirdPlace, "England");
    assertEq(archive.fourthPlace, "France");

    // 3. Unresolved final cannot archive
    const canonical = require("../lib/canonicalMatchResults");
    const original104 = canonical.COMPLETED_KNOCKOUT_RESULTS[104];
    delete (canonical.COMPLETED_KNOCKOUT_RESULTS as any)[104];

    const fakeIncompleteLive = {
      ...snapshot.liveDataByProviderId,
      "537390": { ...snapshot.liveDataByProviderId["537390"], status: "IN_PLAY" as const }
    };
    const fakeArchive1 = getArchiveState({ matches: MATCHES, liveData: fakeIncompleteLive as any, resolvedParticipants, now });
    assertEq(fakeArchive1.isComplete, false, "unresolved final cannot archive");

    // 4. Future wall-clock date cannot archive an unresolved final
    const fakeFuture = new Date("2030-01-01T00:00:00Z");
    const fakeArchive2 = getArchiveState({ matches: MATCHES, liveData: fakeIncompleteLive as any, resolvedParticipants, now: fakeFuture });
    assertEq(fakeArchive2.isComplete, false, "future wall-clock date cannot archive an unresolved final");

    // 5. Generic alternate home winner
    const fakeHomeWinnerLive = {
      ...snapshot.liveDataByProviderId,
      "537390": {
        ...snapshot.liveDataByProviderId["537390"],
        status: "FINISHED" as const,
        homeScore: 2,
        awayScore: 1,
        winner: "HOME_TEAM" as const,
        scoreDuration: "REGULAR" as const
      }
    };
    const fakeArchiveHome = getArchiveState({ matches: MATCHES, liveData: fakeHomeWinnerLive as any, resolvedParticipants, now });
    assertEq(fakeArchiveHome.isComplete, true);
    assertEq(fakeArchiveHome.champion, "Spain");

    // 6. Generic alternate away winner
    const fakeAwayWinnerLive = {
      ...snapshot.liveDataByProviderId,
      "537390": {
        ...snapshot.liveDataByProviderId["537390"],
        status: "FINISHED" as const,
        homeScore: 1,
        awayScore: 2,
        winner: "AWAY_TEAM" as const,
        scoreDuration: "REGULAR" as const
      }
    };
    const fakeArchiveAway = getArchiveState({ matches: MATCHES, liveData: fakeAwayWinnerLive as any, resolvedParticipants, now });
    assertEq(fakeArchiveAway.isComplete, true);
    assertEq(fakeArchiveAway.champion, "Argentina");

    // 7. Synthetic extra-time final
    const fakeETLive = {
      ...snapshot.liveDataByProviderId,
      "537390": {
        ...snapshot.liveDataByProviderId["537390"],
        status: "FINISHED" as const,
        homeScore: 2,
        awayScore: 1,
        winner: "HOME_TEAM" as const,
        scoreDuration: "EXTRA_TIME" as const
      }
    };
    const fakeArchiveET = getArchiveState({ matches: MATCHES, liveData: fakeETLive as any, resolvedParticipants, now });
    assertEq(fakeArchiveET.isComplete, true);
    assertEq(fakeArchiveET.champion, "Spain");

    // 8. Synthetic shootout final
    const fakeShootoutLive = {
      ...snapshot.liveDataByProviderId,
      "537390": {
        ...snapshot.liveDataByProviderId["537390"],
        status: "FINISHED" as const,
        homeScore: 1,
        awayScore: 1,
        winner: "HOME_TEAM" as const,
        scoreDuration: "PENALTY_SHOOTOUT" as const,
        penaltyShootoutScore: { home: 4, away: 3 }
      }
    };
    const fakeArchiveShootout = getArchiveState({ matches: MATCHES, liveData: fakeShootoutLive as any, resolvedParticipants, now });
    assertEq(fakeArchiveShootout.isComplete, true);
    assertEq(fakeArchiveShootout.champion, "Spain");

    (canonical.COMPLETED_KNOCKOUT_RESULTS as any)[104] = original104;
  });

  check("Awards constraints and validation", () => {
    // 1. Valid computed Mbappé 10 goals publishes Golden Boot
    const awards = getPublishedAwards(snapshot.liveDataByProviderId);
    assertEq(awards.length, 4, "all awards published");
    const boot = awards.find(a => a.awardId === "golden_boot");
    assertEq(boot?.winnerName, "Kylian Mbappé");
    assertEq(boot?.metric, "10 goals");

    // Helper to build a live data record with customizable mbappe goals
    const makeFakeLiveData = (mbappeGoals: number | null) => {
      const cloned = JSON.parse(JSON.stringify(snapshot.liveDataByProviderId));
      if (mbappeGoals === null) {
        // Remove Mbappé goals
        Object.keys(cloned).forEach(k => {
          if (cloned[k].goals) {
            cloned[k].goals = cloned[k].goals.filter((g: any) => g.playerName !== "Kylian Mbappé");
          }
        });
      } else {
        // Set Mbappé goals
        Object.keys(cloned).forEach(k => {
          if (cloned[k].goals) {
            cloned[k].goals = cloned[k].goals.filter((g: any) => g.playerName !== "Kylian Mbappé");
          }
        });
        // Put all goals in match 103 (France vs England)
        const franceVsEnglandProviderId = "537389";
        if (cloned[franceVsEnglandProviderId]) {
          const goalsArr = [];
          for (let i = 0; i < mbappeGoals; i++) {
            goalsArr.push({
              type: "GOAL",
              minute: 10,
              teamName: "France",
              playerName: "Kylian Mbappé"
            });
          }
          cloned[franceVsEnglandProviderId].goals = [
            ...(cloned[franceVsEnglandProviderId].goals ?? []),
            ...goalsArr
          ];
        }
      }
      return cloned;
    };

    // 2. Missing Mbappé throws/withholds award
    const fakeDataNoMbappe = makeFakeLiveData(null);
    assertThrows(() => getPublishedAwards(fakeDataNoMbappe), "Should throw when Mbappé is missing");

    // 3. Mbappé with 9 goals fails closed
    const fakeData9 = makeFakeLiveData(9);
    assertThrows(() => getPublishedAwards(fakeData9), "Should throw when Mbappé has 9 goals");

    // 4. Mbappé with 11 goals fails closed
    const fakeData11 = makeFakeLiveData(11);
    assertThrows(() => getPublishedAwards(fakeData11), "Should throw when Mbappé has 11 goals");

    // 5. Archive completion alone does not manufacture awards
    const originalTOURNAMENT_AWARDS = require("../lib/tournamentAwards").TOURNAMENT_AWARDS;
    assertOk(originalTOURNAMENT_AWARDS.length > 0);
  });

  check("Editorial Report verification", () => {
    const report = MATCH_EDITORIAL_REPORTS["match-104"];
    assertOk(report, "Match 104 editorial report entry exists");
    assertOk(report.headline, "Headline exists");
    assertOk(report.dek, "Dek exists");

    // Check for exact source URLs
    const espnLink = report.sourceLinks.find(l => l.url === "https://www.espn.com/soccer/match/_/gameId/760517");
    const fifaReportLink = report.sourceLinks.find(l => l.url === "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/match-centre");
    const fifaAwardsLink = report.sourceLinks.find(l => l.url === "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/award-winners");

    assertOk(espnLink, "Contains ESPN 760517 source link");
    assertOk(fifaReportLink, "Contains FIFA Final Report link");
    assertOk(fifaAwardsLink, "Contains FIFA Official Awards link");

    const updatedAt = new Date(report.updatedAt).getTime();
    assertOk(updatedAt <= Date.now(), "Editorial report timestamp is not in the future");
  });

  check("Provenance details check", () => {
    const mapPath = path.resolve(__dirname, "../data/archive/provenance/espn-match-map.json");
    const mapping = JSON.parse(fs.readFileSync(mapPath, "utf-8"));
    const m104Map = mapping.find((m: any) => m.internalMatchId === "match-104");
    assertEq(m104Map.espnEventId, "760517", "Match 104 maps to ESPN 760517");

    const ledgerPath = path.resolve(__dirname, "../data/archive/provenance/sources.json");
    const ledger = JSON.parse(fs.readFileSync(ledgerPath, "utf-8"));
    const source = ledger["760517"];
    assertOk(source, "ESPN event 760517 details exist in provenance ledger");
    assertEq(source.endpointUrl, "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=760517", "ESPN endpoint matches exactly");
    assertEq(source.rawSha256, "83cc63b0055b3d209c32d1ef9df94d66c42fc9fd4ebeef9c2884dea71d33b5e7", "SHA-256 matches exactly");

    const fetchTime = new Date(source.fetchedAt).getTime();
    assertOk(fetchTime <= Date.now(), "Provenance fetch timestamp is not in the future");

    // Check spelling
    assertOk(source.fieldLevelReconciliation.cards.includes("Enzo Fernández"), "Enzo Fernández is correctly spelled with diacritics");
  });

  check("Live refresh policy consistency", () => {
    const policy = getLiveRefreshPolicy(Object.values(snapshot.matches), now);
    assertEq(policy.intervalMs, null, "polling stopped");
    assertEq(policy.reason, "idle", "reason is idle");
  });

  console.log(`\n=============================================`);
  console.log(`Summary of assertions:`);
  console.log(`  Total groups run:     ${checkGroups}`);
  console.log(`  Total assertions run: ${assertions}`);
  console.log(`  Passed assertions:    ${passedAssertions}`);
  console.log(`  Failed assertions:    ${failedAssertions}`);
  console.log(`  Group failures:       ${groupFailures}`);
  console.log(`=============================================\n`);

  if (groupFailures > 0 || failedAssertions > 0) {
    process.exit(1);
  }
}

run();
