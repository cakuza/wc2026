import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { MATCHES, matchSlug, matchUtcDate } from "../lib/matches";
import { getTodayMatchesForTimeZone, nextUpcomingMatchesForTimeZone, resolveSelectedMatchday } from "../lib/todaySelection";
import { getLiveRefreshPolicy } from "../lib/liveRefreshPolicy";
import { getScheduledKnockoutDestinations } from "../lib/scheduledKnockoutPreview";

let failures = 0;
function check(condition: unknown, message: string) {
  if (condition) console.log(`PASS ${message}`);
  else { console.error(`FAIL ${message}`); failures += 1; }
}
function text(path: string) {
  check(existsSync(path), `${path} exists`);
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}
function hasMatch(matches: typeof MATCHES, number: number) {
  return matches.some((match) => "matchNumber" in match && match.matchNumber === number);
}

const match103 = MATCHES.find((match) => "matchNumber" in match && match.matchNumber === 103)!;
const match104 = MATCHES.find((match) => "matchNumber" in match && match.matchNumber === 104)!;
check(Boolean(match103 && match104), "Final Weekend fixtures exist");

const nyBefore103 = new Date("2026-07-18T16:00:00.000Z");
const istanbulBeforeMidnight = new Date("2026-07-18T20:30:00.000Z");
const istanbulAfterMidnight = new Date("2026-07-18T21:30:00.000Z");
const after103 = new Date("2026-07-18T22:00:00.000Z");
const nyBefore104 = new Date("2026-07-19T18:00:00.000Z");

const nyToday = getTodayMatchesForTimeZone({ now: nyBefore103, timeZone: "America/New_York" });
check(nyToday.date === "2026-07-18" && hasMatch(nyToday.matches, 103), "New York on July 18 before Match 103 classifies Match 103 as today");
const istanbulBefore = getTodayMatchesForTimeZone({ now: istanbulBeforeMidnight, timeZone: "Europe/Istanbul" });
check(istanbulBefore.date === "2026-07-18" && !hasMatch(istanbulBefore.matches, 103), "Istanbul before local midnight does not classify Match 103 as today");
const istanbulAfter = getTodayMatchesForTimeZone({ now: istanbulAfterMidnight, timeZone: "Europe/Istanbul" });
check(istanbulAfter.date === "2026-07-19" && hasMatch(istanbulAfter.matches, 103), "Istanbul after local midnight classifies Match 103 as today");
const after103Upcoming = nextUpcomingMatchesForTimeZone({ now: after103, timeZone: "America/New_York" }).flatMap((day) => day.matches);
check(hasMatch(after103Upcoming, 104) && !hasMatch(after103Upcoming, 103), "after Match 103 the next fixture advances to Match 104");
const nyFinalToday = resolveSelectedMatchday({ now: nyBefore104, timeZone: "America/New_York", dateParam: undefined });
check(nyFinalToday.todayDate === "2026-07-19" && hasMatch(getTodayMatchesForTimeZone({ now: nyBefore104, timeZone: "America/New_York" }).matches, 104), "the final transition classifies Match 104 in New York on July 19");

const kickoff103 = matchUtcDate(match103);
const scheduledCandidate = { match: match103, status: "SCHEDULED" as const };
const liveCandidate = { match: match103, status: "LIVE" as const };
check(getLiveRefreshPolicy([scheduledCandidate], new Date(kickoff103.getTime() - 15 * 60_000 - 1)).intervalMs === null, "refreshing is off before the 15-minute window");
check(getLiveRefreshPolicy([liveCandidate], kickoff103).intervalMs === 30_000, "live refreshing uses the single 30-second interval");
check(getLiveRefreshPolicy([scheduledCandidate], new Date(kickoff103.getTime() + 3 * 60 * 60_000 + 1)).intervalMs === null, "refreshing stops after the three-hour window");

const ordinary = MATCHES.find((match) => "matchNumber" in match && match.matchNumber === 73)!;
const ordinaryDestinations = getScheduledKnockoutDestinations(ordinary);
const semifinalDestinations = getScheduledKnockoutDestinations(MATCHES.find((match) => "matchNumber" in match && match.matchNumber === 101)!);
check(Boolean(ordinaryDestinations.winnerDestination), "ordinary knockout match retains its onward destination");
check(semifinalDestinations.winnerDestination?.matchNumber === 104 && semifinalDestinations.loserDestination?.matchNumber === 103, "semifinal retains Final and third-place destinations");
const thirdPlaceDestinations = getScheduledKnockoutDestinations(match103);
const finalDestinations = getScheduledKnockoutDestinations(match104);
check(!thirdPlaceDestinations.winnerDestination && !thirdPlaceDestinations.loserDestination, "Match 103 has no onward bracket destination");
check(!finalDestinations.winnerDestination && !finalDestinations.loserDestination, "Match 104 has no onward bracket destination");

const todayHtml = text(join("out", "today.html"));
const thirdPlaceHtml = text(join("out", "world-cup-third-place-qualification.html"));
const methodologyHtml = text(join("out", "world-cup-2026-data-sources.html"));
const match103Html = text(join("out", "matches", "match-103.html"));
const match104Html = text(join("out", "matches", "match-104.html"));
const termsHtml = text(join("out", "terms.html"));

check(todayHtml.includes("Preparing the Match Center for your local timezone.") && !todayHtml.includes("No World Cup match is being played today."), "Today SSR fallback is timezone-neutral until hydration");
check(thirdPlaceHtml.includes("Final third-place ranking") && thirdPlaceHtml.includes("Qualified for the Round of 32") && thirdPlaceHtml.includes("Did not qualify") && thirdPlaceHtml.includes("preserved as tournament history"), "third-place page uses final historical copy");
check(!/current snapshot|current Round of 32 cut line|until all group matches are complete/i.test(thirdPlaceHtml), "third-place page removes provisional group-stage copy");
check(methodologyHtml.includes("15 minutes before kickoff") && methodologyHtml.includes("3 hours after kickoff") && methodologyHtml.includes("every 30 seconds"), "methodology states the bounded 30-second live policy");
check(!/10 seconds|12 seconds|90 seconds/i.test(methodologyHtml), "methodology contains no contradictory polling intervals");
check(!match103Html.includes("Bracket Destination") && !match104Html.includes("Bracket Destination"), "terminal match pages contain no false onward destination");
check(termsHtml.includes("<header") && termsHtml.includes("<footer") && termsHtml.includes('href="/terms"'), "Terms is rendered inside the shared navigation shell");

if (failures > 0) process.exitCode = 1;
