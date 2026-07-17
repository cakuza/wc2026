/**
 * Permanent regression coverage for the Statistics-overview tie bug the
 * owner reported: the "Most Goals Scored" and "Most Clean Sheets" cards
 * silently rendered array index [0] as if it were a sole leader, even
 * though the underlying data has genuine ties — Germany/Netherlands/France
 * tied at 10 team goals, Mexico/Spain tied at 3 clean sheets. Meanwhile the
 * Top Scorer (Messi, 8 goals) and Most Assists (Olise, 5) cards have no tie
 * and must keep naming a single leader, not be artificially pluralized.
 *
 * Also covers a truthfulness defect found while fixing the tie: rendering
 * a single "in N matches" coverage caption underneath multiple tied team
 * names is false whenever those teams don't share the same match count
 * (France reached 10 goals in 7 matches; Germany and Netherlands in 4) —
 * the caption must only render when every tied leader shares identical
 * coverage.
 *
 * Run after `npm run build`: npx tsx scripts/test-stats-tie-handling.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getTiedLeaders, type TeamLeaderboard } from "../lib/tournamentStats";

let failures = 0;
function check(condition: boolean, message: string): void {
  if (condition) {
    console.log(`PASS ${message}`);
  } else {
    console.error(`FAIL ${message}`);
    failures += 1;
  }
}

console.log("=== getTiedLeaders: pure-function behavior ===\n");

{
  const threeWayTie: TeamLeaderboard[] = [
    { teamKey: "germany", value: 10, matchesCovered: 4, completedMatches: 4, coverageStatus: "COMPLETE" },
    { teamKey: "netherlands", value: 10, matchesCovered: 4, completedMatches: 4, coverageStatus: "COMPLETE" },
    { teamKey: "france", value: 10, matchesCovered: 7, completedMatches: 7, coverageStatus: "COMPLETE" },
    { teamKey: "canada", value: 8, matchesCovered: 4, completedMatches: 4, coverageStatus: "COMPLETE" },
  ];
  const leaders = getTiedLeaders(threeWayTie, (t) => t.value);
  check(leaders.length === 3, "getTiedLeaders returns all 3 teams tied at the max value (not just index 0)");
  check(leaders.every((l) => l.value === 10), "every returned leader shares the true max value");
  check(!leaders.some((l) => l.teamKey === "canada"), "non-tied lower entries are excluded");

  const twoWayTie: TeamLeaderboard[] = [
    { teamKey: "mexico", value: 3, matchesCovered: 5, completedMatches: 5, coverageStatus: "COMPLETE" },
    { teamKey: "spain", value: 3, matchesCovered: 7, completedMatches: 7, coverageStatus: "COMPLETE" },
    { teamKey: "brazil", value: 2, matchesCovered: 5, completedMatches: 5, coverageStatus: "COMPLETE" },
  ];
  const cleanSheetLeaders = getTiedLeaders(twoWayTie, (t) => t.value);
  check(cleanSheetLeaders.length === 2, "getTiedLeaders returns both teams tied for clean sheets");
  check(
    cleanSheetLeaders.map((l) => l.teamKey).sort().join(",") === "mexico,spain",
    "clean-sheet tie leaders are exactly Mexico and Spain",
  );

  const soleLeader: TeamLeaderboard[] = [
    { teamKey: "argentina", value: 8, matchesCovered: 7, completedMatches: 7, coverageStatus: "COMPLETE" },
    { teamKey: "france", value: 6, matchesCovered: 7, completedMatches: 7, coverageStatus: "COMPLETE" },
  ];
  check(getTiedLeaders(soleLeader, (t) => t.value).length === 1, "no false tie is introduced when there is a genuine sole leader");

  check(getTiedLeaders([], (t: TeamLeaderboard) => t.value).length === 0, "empty leaderboard returns no leaders, not a crash");
}

console.log("\n=== Rendered-output evidence (out/stats.html) ===\n");

const OUT_STATS = join(process.cwd(), "out", "stats.html");
if (!existsSync(OUT_STATS)) {
  console.error("out/stats.html does not exist — run `npm run build` first.");
  process.exit(1);
}
const html = readFileSync(OUT_STATS, "utf8").replace(/<!-- -->/g, "");

{
  check(html.includes("Germany, Netherlands"), "/stats renders the full 3-way team-goals tie, not just Germany");
  check(html.includes("Mexico"), "/stats renders the clean-sheets tie");
  check(/Mexico\s*&amp;\s*Spain|Mexico\s*&\s*Spain/.test(html), "/stats joins the 2-way clean-sheets tie with '&', not silently picking one team");

  // The truthfulness regression: a coverage caption naming a match count that
  // doesn't apply to every tied team must never render.
  const tiedGoalsIdx = html.indexOf("Germany, Netherlands");
  check(tiedGoalsIdx !== -1, "found the tied team-goals card to inspect its caption");
  if (tiedGoalsIdx !== -1) {
    const nearby = html.slice(tiedGoalsIdx, tiedGoalsIdx + 400);
    check(
      !/in \d+ matches/.test(nearby),
      "tied team-goals card does not show a single 'in N matches' caption when tied teams have different match counts (Germany/Netherlands: 4, France: 7)",
    );
  }

  // Sole leaders (no tie in current data) must still read as singular claims.
  const messiIdx = html.indexOf("Lionel Messi");
  check(messiIdx !== -1, "Top Scorer still names Messi");
  const oliseIdx = html.indexOf("Michael Olise");
  check(oliseIdx !== -1, "Most Assists still names Olise");
  if (messiIdx !== -1) {
    const nearby = html.slice(Math.max(0, messiIdx - 300), messiIdx + 50);
    check(!/Golden Boot leaders:/.test(nearby) && !nearby.includes(" & "), "Top Scorer card is not falsely pluralized when there is no tie");
  }
}

if (failures > 0) {
  console.error(`\n${failures} failure(s).`);
  process.exitCode = 1;
} else {
  console.log("\nALL STATS TIE-HANDLING CHECKS PASSED.");
}
