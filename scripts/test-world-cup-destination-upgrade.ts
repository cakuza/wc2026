import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { TEAMS } from "../lib/teams";
import { getTeamTournamentStatus } from "../lib/teamTournamentStatus";
import { getTournamentLiveSnapshot, type TournamentLiveSnapshot } from "../lib/liveSnapshot";
import { buildRecentForm, buildScheduledKnockoutPreviewData, type RecentFormFixture } from "../lib/scheduledKnockoutPreview";
import { buildKnockoutResolution } from "../lib/knockoutResolution";
import { getResolvedAwayTeam, getResolvedHomeTeam, isKnockoutMatch } from "../lib/participant-resolution";
import { MATCHES, matchSlug } from "../lib/matches";
import { comparisonColors, comparisonCoverageLabel, DEFAULT_COMPARE_TEAMS, resolveCompareTeams } from "../app/stats/compare/TeamCompareClient";

const EXPECTED_MAP: Record<string, string> = {
  mexico: "ELIMINATED_KNOCKOUT", southAfrica: "ELIMINATED_KNOCKOUT", southKorea: "ELIMINATED_GROUP_STAGE", czechia: "ELIMINATED_GROUP_STAGE",
  canada: "ELIMINATED_KNOCKOUT", bosnia: "ELIMINATED_KNOCKOUT", qatar: "ELIMINATED_GROUP_STAGE", switzerland: "ELIMINATED_KNOCKOUT",
  brazil: "ELIMINATED_KNOCKOUT", morocco: "ELIMINATED_KNOCKOUT", haiti: "ELIMINATED_GROUP_STAGE", scotland: "ELIMINATED_GROUP_STAGE",
  unitedStates: "ELIMINATED_KNOCKOUT", paraguay: "ELIMINATED_KNOCKOUT", australia: "ELIMINATED_KNOCKOUT", turkey: "ELIMINATED_GROUP_STAGE",
  germany: "ELIMINATED_KNOCKOUT", curacao: "ELIMINATED_GROUP_STAGE", ivoryCoast: "ELIMINATED_KNOCKOUT", ecuador: "ELIMINATED_KNOCKOUT",
  netherlands: "ELIMINATED_KNOCKOUT", japan: "ELIMINATED_KNOCKOUT", sweden: "ELIMINATED_KNOCKOUT", tunisia: "ELIMINATED_GROUP_STAGE",
  belgium: "ELIMINATED_KNOCKOUT", egypt: "ELIMINATED_KNOCKOUT", iran: "ELIMINATED_GROUP_STAGE", newZealand: "ELIMINATED_GROUP_STAGE",
  spain: "ACTIVE_KNOCKOUT", capeVerde: "ELIMINATED_KNOCKOUT", saudiArabia: "ELIMINATED_GROUP_STAGE", uruguay: "ELIMINATED_GROUP_STAGE",
  france: "ACTIVE_KNOCKOUT", senegal: "ELIMINATED_KNOCKOUT", iraq: "ELIMINATED_GROUP_STAGE", norway: "ELIMINATED_KNOCKOUT",
  argentina: "ACTIVE_KNOCKOUT", algeria: "ELIMINATED_KNOCKOUT", austria: "ELIMINATED_KNOCKOUT", jordan: "ELIMINATED_GROUP_STAGE",
  portugal: "ELIMINATED_KNOCKOUT", drCongo: "ELIMINATED_KNOCKOUT", uzbekistan: "ELIMINATED_GROUP_STAGE", colombia: "ELIMINATED_KNOCKOUT",
  england: "ACTIVE_KNOCKOUT", croatia: "ELIMINATED_KNOCKOUT", ghana: "ELIMINATED_KNOCKOUT", panama: "ELIMINATED_GROUP_STAGE",
};

let failures = 0;
const EM_DASH = String.fromCharCode(0x2014);
function assert(condition: boolean, message: string): void {
  if (condition) console.log(`PASS ${message}`);
  else {
    console.error(`FAIL ${message}`);
    failures += 1;
  }
}

function controlledScheduledSemifinal(snapshot: TournamentLiveSnapshot): TournamentLiveSnapshot {
  const match101 = snapshot.matches["match-101"];
  return {
    ...snapshot,
    matches: { ...snapshot.matches, "match-101": { ...match101, status: "SCHEDULED" } },
    teamStatLeaderboards: {
      ...snapshot.teamStatLeaderboards,
      goalsScored: [
        { teamKey: "france", value: 9, matchesCovered: 4, completedMatches: 5, coverageStatus: "PARTIAL" },
        { teamKey: "spain", value: 11, matchesCovered: 5, completedMatches: 5, coverageStatus: "COMPLETE" },
      ],
      shotsOnTarget: [],
    },
  };
}

function assertRecentFormCutoff(): void {
  const fixtures: RecentFormFixture[] = [
    { id: "target", kickoffMs: 1_000, homeKey: "france", awayKey: "spain", status: "FINISHED", homeScore: 3, awayScore: 0, stage: "", venue: null },
    { id: "same-kickoff", kickoffMs: 1_000, homeKey: "france", awayKey: "a", status: "FINISHED", homeScore: 4, awayScore: 0, stage: "", venue: null },
    { id: "future", kickoffMs: 1_100, homeKey: "france", awayKey: "b", status: "FINISHED", homeScore: 5, awayScore: 0, stage: "", venue: null },
    { id: "lower-number-but-later", kickoffMs: 1_200, homeKey: "france", awayKey: "c", status: "FINISHED", homeScore: 6, awayScore: 0, stage: "", venue: null },
    { id: "900", kickoffMs: 900, homeKey: "france", awayKey: "d", status: "FINISHED", homeScore: 2, awayScore: 0, stage: "", venue: null },
    { id: "800", kickoffMs: 800, homeKey: "france", awayKey: "e", status: "FINISHED", homeScore: 0, awayScore: 1, stage: "", venue: null },
    { id: "700", kickoffMs: 700, homeKey: "france", awayKey: "f", status: "FINISHED", homeScore: 1, awayScore: 1, stage: "", venue: null },
    { id: "600", kickoffMs: 600, homeKey: "france", awayKey: "g", status: "FINISHED", homeScore: 3, awayScore: 1, stage: "", venue: null },
    { id: "500", kickoffMs: 500, homeKey: "france", awayKey: "h", status: "FINISHED", homeScore: 0, awayScore: 2, stage: "", venue: null },
    { id: "400", kickoffMs: 400, homeKey: "france", awayKey: "i", status: "FINISHED", homeScore: 2, awayScore: 2, stage: "", venue: null },
  ];
  const form = buildRecentForm({ teamKey: "france", targetMatchId: "target", targetKickoffMs: 1_000, fixtures });
  assert(JSON.stringify(form) === JSON.stringify(["W", "L", "D", "W", "L"]), "recent form excludes target/current/future/lower-number-later fixtures, is newest-first, and caps at five");
}

function assertCompareContract(): void {
  const productionTeams = TEAMS.map(({ key }) => ({ key }));
  assert(DEFAULT_COMPARE_TEAMS.team1 === "france" && DEFAULT_COMPARE_TEAMS.team2 === "spain", "Compare static defaults use canonical France and Spain team keys");
  const defaults = resolveCompareTeams(new URLSearchParams(), productionTeams);
  assert(defaults.team1 === "france" && defaults.team2 === "spain", "Compare resolves production defaults to France vs Spain");
  const query = new URLSearchParams("team1=argentina&team2=spain");
  assert(resolveCompareTeams(query, productionTeams).team1 === "argentina", "Compare query is parsed separately from static defaults after hydration");
  const invalid = resolveCompareTeams(new URLSearchParams("team1=invalid&team2=argentina"), productionTeams);
  assert(invalid.team1 === "france" && invalid.team2 === "argentina", "Compare invalid query falls back safely");
  const colors = comparisonColors({
    left: { teamKey: "fra", value: 8, matchesCovered: 3, completedMatches: 4, coverageStatus: "PARTIAL" },
    right: { teamKey: "esp", value: 6, matchesCovered: 4, completedMatches: 4, coverageStatus: "COMPLETE" },
    label: "Goals Scored",
  });
  assert(colors.left === "text-white" && colors.right === "text-white", "partial comparison coverage stays visually neutral");
  assert(comparisonCoverageLabel({ teamKey: "france", value: 8, matchesCovered: 3, completedMatches: 4, coverageStatus: "PARTIAL" }) === "3 of 4 matches covered", "partial comparison coverage includes both denominators");
}

async function main(): Promise<void> {
  const snapshot = await getTournamentLiveSnapshot();
  const resolved = buildKnockoutResolution(snapshot.matches);
  const allMatches = Object.values(snapshot.matches).map((entry) => entry.match);
  assert(TEAMS.length === 48 && Object.keys(EXPECTED_MAP).length === 48, "frozen expected map covers exactly 48 teams");
  const counts: Record<string, number> = { ACTIVE_KNOCKOUT: 0, ELIMINATED_KNOCKOUT: 0, ELIMINATED_GROUP_STAGE: 0, UNKNOWN: 0 };
  for (const team of TEAMS) {
    const classification = getTeamTournamentStatus({ teamKey: team.key, matches: allMatches, snapshotMatches: snapshot.matches }).classification;
    assert(classification === EXPECTED_MAP[team.key], `frozen classification matches for ${team.key}`);
    counts[classification] = (counts[classification] ?? 0) + 1;
  }
  assert(counts.ACTIVE_KNOCKOUT === 4 && counts.ELIMINATED_KNOCKOUT === 28 && counts.ELIMINATED_GROUP_STAGE === 16 && counts.UNKNOWN === 0, "team classification totals are exactly 4 / 28 / 16 / 0");

  assertRecentFormCutoff();
  assertCompareContract();

  const completedPreview = buildScheduledKnockoutPreviewData("match-101", snapshot, resolved);
  assert(completedPreview === null, "completed Match 101 receives no scheduled preview payload");
  for (const [matchId, entry] of Object.entries(snapshot.matches)) {
    if (entry.status === "FINISHED" && isKnockoutMatch(entry.match)) {
      assert(buildScheduledKnockoutPreviewData(matchId, snapshot, resolved) === null, `completed knockout ${matchId} receives no scheduled preview payload`);
    }
  }

  const controlled = controlledScheduledSemifinal(snapshot);
  const controlledResolved = buildKnockoutResolution(controlled.matches);
  const controlledPreview = buildScheduledKnockoutPreviewData("match-101", controlled, controlledResolved);
  assert(controlledPreview !== null && controlledPreview.stats.length === 4, "controlled scheduled semifinal produces a bounded non-empty preview payload");
  assert(controlledPreview?.stats[0]?.home.coverageStatus === "PARTIAL" && controlledPreview.stats[0]?.home.matchesCovered === 4 && controlledPreview.stats[0]?.home.completedMatches === 5, "PARTIAL metric preserves value and 4 of 5 coverage");
  assert(controlledPreview?.stats[3]?.home.coverageStatus === "NONE" && controlledPreview.stats[3]?.home.value === null, "missing metric remains null with NONE coverage rather than zero");
  assert(controlledPreview?.winnerDestination?.displayLabel === `Match 104 ${EM_DASH} Final` && controlledPreview?.winnerDestination.href === "/matches/match-104", "winner destination is the typed Final record");
  assert(controlledPreview?.loserDestination?.displayLabel === `Match 103 ${EM_DASH} Third-place playoff` && controlledPreview?.loserDestination.href === "/matches/match-103", "loser destination is the typed Third-place record");
  const previewKeys = Object.keys(controlledPreview ?? {});
  assert(!previewKeys.includes("matches") && !previewKeys.includes("teamLeaderboards") && !previewKeys.includes("topScorers") && !previewKeys.includes("liveDataByProviderId"), "preview payload contains no snapshot maps or full leaderboard collections");

  const scheduled102 = buildScheduledKnockoutPreviewData("match-102", snapshot, resolved);
  const match102 = snapshot.matches["match-102"];
  if (match102?.status === "SCHEDULED") {
    assert(scheduled102 !== null && scheduled102.stats.length > 0 && scheduled102.winnerDestination !== undefined && scheduled102.loserDestination !== undefined, "scheduled Match 102 receives full preview data by status, not match number hardcoding");
  } else if (match102?.status === "FINISHED") {
    assert(scheduled102 === null, "completed Match 102 receives no scheduled preview payload");
  }
  for (const [matchId, entry] of Object.entries(snapshot.matches)) {
    if (entry.status !== "SCHEDULED" || !isKnockoutMatch(entry.match)) continue;
    if (getResolvedHomeTeam(entry.match, resolved) && getResolvedAwayTeam(entry.match, resolved)) {
      assert(buildScheduledKnockoutPreviewData(matchId, snapshot, resolved) !== null, `resolved scheduled knockout ${matchId} receives preview data`);
    }
  }

  const out101 = join(process.cwd(), "out", "matches", "match-101.html");
  const out102 = join(process.cwd(), "out", "matches", "match-102.html");
  const outCompare = join(process.cwd(), "out", "stats", "compare.html");
  assert(existsSync(out101) && existsSync(out102) && existsSync(outCompare), "fresh required static HTML exists; missing output is a failure");
  if (existsSync(out101) && existsSync(out102)) {
    const html101 = readFileSync(out101, "utf8");
    const html102 = readFileSync(out102, "utf8");
    const htmlCompare = readFileSync(outCompare, "utf8");
    assert(html101.includes("France") && html101.includes("Spain") && html101.includes("Mikel Oyarzabal") && html101.includes("Semi-final"), "completed Match 101 static HTML contains canonical result, event, and stage");
    assert(html101.includes("/matches/match-103") && html101.includes("/matches/match-104"), "completed Match 101 contains advancement consequences");
    assert(!html101.includes("Bracket Destination") && !html101.includes("Tournament Stats Comparison"), "completed Match 101 contains no scheduled-preview module or copy");
    
    // Match 102 is now completed too
    assert(html102.includes("England") && html102.includes("Argentina") && html102.includes("Anthony Gordon") && html102.includes("Semi-final"), "completed Match 102 static HTML contains canonical result, event, and stage");
    assert(html102.includes("/matches/match-103") && html102.includes("/matches/match-104"), "completed Match 102 contains advancement consequences");
    assert(!html102.includes("Bracket Destination") && !html102.includes("Tournament Stats Comparison"), "completed Match 102 contains no scheduled-preview module or copy");

    const title101 = html101.match(/<title>(.*?)<\/title>/)?.[1];
    const title102 = html102.match(/<title>(.*?)<\/title>/)?.[1];
    const description101 = html101.match(/name="description" content="(.*?)"/)?.[1];
    const description102 = html102.match(/name="description" content="(.*?)"/)?.[1];
    assert(Boolean(title101 && title102 && title101 !== title102 && description101 && description102 && description101 !== description102), "Match 101 and 102 metadata is unique and status-truthful");
    assert(htmlCompare.includes(">France</p>") && htmlCompare.includes(">Spain</p>") && !htmlCompare.includes(">fra</p>") && !htmlCompare.includes(">esp</p>"), "static Compare HTML defaults to France vs Spain with canonical keys");
  }

  if (failures > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
