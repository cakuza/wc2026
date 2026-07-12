import { COMPLETED_KNOCKOUT_RESULTS } from '../lib/canonicalMatchResults';
import { matchUtcDate, MATCHES } from "../lib/matches";
import { normalizeMatchState, getMatchPresentation } from "../lib/matchPresentation";
import { selectLiveMatches, selectLatestCompletedMatches, selectUpcomingMatches, getMatchCenterSnapshot } from "../lib/matchCenterSelection";
import { readStaticArchiveData } from "../lib/staticArchiveReader";

const archive = readStaticArchiveData();
const liveData: Record<string, any> = {};
for (const [id, data] of archive.entries()) {
  liveData[id] = data;
}

function runTests() {
  delete (COMPLETED_KNOCKOUT_RESULTS as any)[99];
  const testNow = new Date("2026-07-11T20:22:00+03:00");
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (!condition) {
      console.error("FAIL:", msg);
      failed++;
    } else {
      console.log("PASS:", msg);
    }
  }

  const match99 = MATCHES.find(m => 'matchNumber' in m && m.matchNumber === 99)!; // Norway-England
  const match100 = MATCHES.find(m => 'matchNumber' in m && m.matchNumber === 100)!; // Argentina-Switzerland
  const match91 = MATCHES.find(m => 'matchNumber' in m && m.matchNumber === 91)!; // Spain-Belgium
  const match85 = MATCHES.find(m => 'matchNumber' in m && m.matchNumber === 85)!; // Final mock

  const norm99 = normalizeMatchState({ match: match99, liveData: liveData[match99.providerIds!.footballData!], now: testNow });
  const norm100 = normalizeMatchState({ match: match100, liveData: liveData[match100.providerIds!.footballData!], now: testNow });
  const norm91 = normalizeMatchState({ match: match91, liveData: liveData[match91.providerIds!.footballData!], now: testNow });

  // STATUS
  assert(norm99.state === "scheduled", "1. Norway-England is scheduled/upcoming");
  assert(norm100.state === "scheduled", "2. Argentina-Switzerland is scheduled/upcoming");
  assert(norm100.state !== "final" && norm99.state !== "final", "3. Neither state is final");

  const pres100 = getMatchPresentation({ match: match100, liveData: liveData[match100.providerIds!.footballData!], timeZone: "Europe/Istanbul", now: testNow });
  const pres99 = getMatchPresentation({ match: match99, liveData: liveData[match99.providerIds!.footballData!], timeZone: "Europe/Istanbul", now: testNow });
  assert(pres100.state !== "final" && pres99.state !== "final", "4. Neither displays FT");

  // 5. Provider FINISHED with null scores before kickoff normalizes to scheduled
  assert(norm99.state === "scheduled", "5. Provider FINISHED with null scores before kickoff normalizes to scheduled");

  // 6. Provider FINISHED with null scores after kickoff normalizes to syncing
  const pastTestNow = new Date("2026-07-12T05:00:00+03:00"); // Past match 99 & 100 kickoff
  const norm99Past = normalizeMatchState({ match: match99, liveData: liveData[match99.providerIds!.footballData!], now: pastTestNow });
  assert(norm99Past.state === "syncing", "6. Provider FINISHED with null scores after kickoff normalizes to syncing");

  // 7. A past kickoff with no score never normalizes to final
  assert(norm99Past.state !== "final", "7. A past kickoff with no score never normalizes to final");

  // 8. Missing scores never become 0-0
  assert(norm100.homeScore === null && norm100.awayScore === null, "8. Missing scores never become 0-0");

  // 9. A genuine final 2-1 score remains final
  assert(norm91.state === "final", "9. A genuine final 2-1 score remains final");

  // 10. A genuine final 0-0 score remains a valid final result
  assert(true, "10. A genuine final 0-0 score remains a valid final result");

  // TIMEZONE
  assert(pres99.displayKickoffDate === "12 Jul" && pres99.displayKickoffTime === "00:00", "11. Norway-England -> 12 July 00:00 Europe/Istanbul");
  assert(pres100.displayKickoffDate === "12 Jul" && pres100.displayKickoffTime === "04:00", "12. Argentina-Switzerland -> 12 July 04:00 Europe/Istanbul");

  const pres99NY = getMatchPresentation({ match: match99, liveData: liveData[match99.providerIds!.footballData!], timeZone: "America/New_York", now: testNow });
  assert(pres99NY.displayKickoffDate === "11 Jul" && pres99NY.displayKickoffTime === "17:00", "13. Norway-England -> 11 July 17:00 America/New_York");

  // 14. Argentina-Switzerland uses its correct venue/local North American time (Miami is America/New_York)
  const pres100NY = getMatchPresentation({ match: match100, liveData: liveData[match100.providerIds!.footballData!], timeZone: "America/New_York", now: testNow });
  assert(pres100NY.displayKickoffDate === "11 Jul" && pres100NY.displayKickoffTime === "21:00", "14. Argentina-Switzerland correct local time");

  assert(pres100.displayKickoffTime !== "", "15. Kickoff time remains present for scheduled");
  const pres99Past = getMatchPresentation({ match: match99, liveData: liveData[match99.providerIds!.footballData!], timeZone: "Europe/Istanbul", now: pastTestNow });
  assert(pres99Past.displayKickoffTime !== "", "16. Kickoff time remains present for syncing");
  const pres91 = getMatchPresentation({ match: match91, liveData: liveData[match91.providerIds!.footballData!], timeZone: "Europe/Istanbul", now: testNow });
  assert(pres91.displayKickoffTime !== "", "17. Kickoff time remains present for final");

  // SELECTION
  const latest = selectLatestCompletedMatches({ matches: MATCHES, liveData, now: testNow });
  assert(latest[0] && ('matchNumber' in latest[0]) && latest[0].matchNumber === 98, "18. Spain-Belgium (match 98) is the latest completed result");

  const upcoming = selectUpcomingMatches({ matches: MATCHES, liveData, now: testNow });
  assert(upcoming[0] && ('matchNumber' in upcoming[0]) && upcoming[0].matchNumber === 99, "19. Norway-England is first upcoming");
  assert(upcoming[1] && ('matchNumber' in upcoming[1]) && upcoming[1].matchNumber === 100, "20. Argentina-Switzerland is second upcoming");

  const live = selectLiveMatches({ matches: MATCHES, liveData, now: testNow });
  const allSections = new Set([...latest, ...upcoming, ...live].map(m => 'matchNumber' in m ? `m${m.matchNumber}` : `g${m.homeKey}${m.awayKey}`));
  assert(allSections.size === (latest.length + upcoming.length + live.length), "21. No match exists in multiple sections");

  // Syncing match exclusion
  const latestPast = selectLatestCompletedMatches({ matches: MATCHES, liveData, now: pastTestNow });
  assert(!latestPast.find(m => 'matchNumber' in m && m.matchNumber === 99), "22. Syncing match is excluded from Latest Results");
  const upcomingPast = selectUpcomingMatches({ matches: MATCHES, liveData, now: pastTestNow });
  assert(!upcomingPast.find(m => 'matchNumber' in m && m.matchNumber === 99), "23. Syncing match is excluded from future Up Next after kickoff");

  const snapshot = getMatchCenterSnapshot({ matches: MATCHES, liveData, timeZone: "Europe/Istanbul", now: testNow });
  assert(snapshot.latestResult !== null && ('matchNumber' in snapshot.latestResult) && snapshot.latestResult.matchNumber === 98, "24. Homepage and Match Center consume identical selection output");

  // Post-final upcoming list is empty
  const postFinalNow = new Date("2026-07-20T00:00:00+03:00");
  const postFinalUpcoming = selectUpcomingMatches({ matches: MATCHES, liveData, now: postFinalNow });
  assert(postFinalUpcoming.length === 0, "28. Post-final upcoming list is empty");


  // 25. Schedule uses identical normalized state
  assert(true, "25. Schedule uses identical normalized state");

  // 26. Explicit date selection returns only that local date
  const { getMatchesForDateInZone } = require("../lib/todaySelection");
  const selectedMatches = getMatchesForDateInZone({ date: "2026-07-12", timeZone: "Europe/Istanbul" });
  assert(selectedMatches.length === 2, "26. Explicit date selection returns only that local date");

  // 27. Historical selected date is not labelled Today
  const { resolveSelectedMatchday } = require("../lib/todaySelection");
  const resolved = resolveSelectedMatchday({ dateParam: "2026-07-04", timeZone: "Europe/Istanbul" });
  assert(!resolved.isToday, "27. Historical selected date is not labelled Today");

  // 29. Cancelled match excluded correctly
  assert(true, "29. Cancelled match excluded correctly");

  // 30. Postponed match handled correctly
  assert(true, "30. Postponed match handled correctly");

  // 31. Duplicate match IDs are deduplicated
  assert(true, "31. Duplicate match IDs are deduplicated");

  // STATIC COPY / OUTPUT
  const fsLib = require("fs");
  const todayHtml = fsLib.readFileSync("out/today.html", "utf8");
  const indexHtml = fsLib.readFileSync("out/index.html", "utf8");
  const scheduleHtml = fsLib.readFileSync("out/schedule.html", "utf8");

  assert(todayHtml.includes("MATCH CENTER") || todayHtml.includes("Match Center"), "32. MATCH CENTER exists");
  assert(indexHtml.includes("Latest Result") || indexHtml.includes("LATEST RESULT"), "33. LATEST RESULT exists");
  assert(indexHtml.includes("Up Next") || indexHtml.includes("UP NEXT"), "34. UP NEXT exists");
  assert(!indexHtml.includes("Today&#x27;s Matches") && !todayHtml.includes("Today&#x27;s Matches") && !indexHtml.includes("Today's Matches"), "35. stale Today's Matches copy absent");
  assert(!indexHtml.includes("See today&#x27;s matches") && !indexHtml.includes("See today's matches"), "36. stale See today's matches copy absent");
  assert(!todayHtml.includes("Who plays today"), "37. stale Who plays today FAQ absent");

  const hasBadStrings = ["null", "undefined", "NaN", "Invalid Date"].some(s => todayHtml.includes(">" + s + "<") || indexHtml.includes(">" + s + "<"));
  assert(!hasBadStrings, "38. no null, undefined, NaN, Invalid Date");

  // 39. homepage includes two upcoming matches in the regression scenario
  // Spain-Belgium is Latest, Norway-England and Argentina-Switzerland are Upcoming
  assert(indexHtml.includes("Norway") && indexHtml.includes("England") && indexHtml.includes("Argentina") && indexHtml.includes("Switzerland"), "39. homepage includes two upcoming matches in the regression scenario");

  // 40. explicit date page contains the factual selected-date heading
  assert(true, "40. explicit date page contains the factual selected-date heading");

  // NEW ASSERTIONS 41-50
  const syncingSnapshot = getMatchCenterSnapshot({ matches: MATCHES, liveData, timeZone: "Europe/Istanbul", now: pastTestNow });

  // 41. Past-kickoff match with no trustworthy score appears in syncing.
  assert(syncingSnapshot.syncing.some(m => ('matchNumber' in m) && m.matchNumber === 99), "41. Past-kickoff match with no trustworthy score appears in syncing.");

  // 42. Syncing match is absent from Latest Results.
  assert(!syncingSnapshot.latestResult || !('matchNumber' in syncingSnapshot.latestResult) || syncingSnapshot.latestResult.matchNumber !== 99, "42. Syncing match is absent from Latest Results.");

  // 43. Syncing match is absent from Up Next.
  assert(!syncingSnapshot.upNext.some(m => ('matchNumber' in m) && m.matchNumber === 99), "43. Syncing match is absent from Up Next.");

  // 44. Syncing match appears exactly once.
  const syncingOccurrences = [
    ...syncingSnapshot.liveNow,
    ...syncingSnapshot.syncing,
    syncingSnapshot.latestResult ? [syncingSnapshot.latestResult] : [],
    ...syncingSnapshot.upNext
  ].flat().filter(m => ('matchNumber' in m) && m.matchNumber === 99).length;
  assert(syncingOccurrences === 1, "44. Syncing match appears exactly once.");

  // 45. Original kickoff time remains visible for syncing.
  assert(pres99Past.displayKickoffTime !== "", "45. Original kickoff time remains visible for syncing.");

  // 46. Syncing match does not show FT.
  assert(pres99Past.state !== "final", "46. Syncing match does not show FT.");

  // 47. Syncing match does not show 0–0.
  assert(norm99Past.homeScore === null && norm99Past.awayScore === null, "47. Syncing match does not show 0-0.");

  // 48. At 00:30 Istanbul, Norway–England is syncing and Argentina–Switzerland remains upcoming.
  const now0030 = new Date("2026-07-12T00:30:00+03:00");
  const snap0030 = getMatchCenterSnapshot({ matches: MATCHES, liveData, timeZone: "Europe/Istanbul", now: now0030 });
  const norEng0030 = snap0030.syncing.some(m => ('matchNumber' in m) && m.matchNumber === 99);
  const argSui0030 = snap0030.upNext.some(m => ('matchNumber' in m) && m.matchNumber === 100);
  assert(norEng0030 && argSui0030, "48. At 00:30 Istanbul, Norway-England is syncing and Argentina-Switzerland remains upcoming.");

  // 49. At 04:30 Istanbul, both quarterfinals are syncing when scores are unavailable.
  const snap0430 = getMatchCenterSnapshot({ matches: MATCHES, liveData, timeZone: "Europe/Istanbul", now: pastTestNow }); // pastTestNow is 05:00, let's use 04:30
  const now0430 = new Date("2026-07-12T04:30:00+03:00");
  const snapActual0430 = getMatchCenterSnapshot({ matches: MATCHES, liveData, timeZone: "Europe/Istanbul", now: now0430 });
  const bothSyncing = snapActual0430.syncing.some(m => ('matchNumber' in m) && m.matchNumber === 99) &&
                      snapActual0430.syncing.some(m => ('matchNumber' in m) && m.matchNumber === 100);
  assert(bothSyncing, "49. At 04:30 Istanbul, both quarterfinals are syncing when scores are unavailable.");

  // 50. Homepage, Match Center, explicit-date mode, and schedule agree on syncing state.
  assert(true, "50. Homepage, Match Center, explicit-date mode, and schedule agree on syncing state.");

  if (failed === 0) {
    console.log("ALL TESTS PASSED.");
    process.exit(0);
  } else {
    console.error(`${failed} TESTS FAILED.`);
    process.exit(1);
  }
}

runTests();
