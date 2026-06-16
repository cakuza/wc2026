import { getTournamentLiveSnapshot } from "../lib/liveSnapshot";
import { MATCHES, matchSlug } from "../lib/matches";
import { countryName } from "../lib/i18n";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  PASS  ${msg}`);
    passed++;
  } else {
    console.error(`  FAIL  ${msg}`);
    failed++;
  }
}

async function main() {
  console.log("=== Match/stats scorer consistency test ===\n");

  const snapshot = await getTournamentLiveSnapshot();
  if (Object.keys(snapshot.matches).length === 0) {
    console.log("  ⚠️ Skipping match-scorer consistency tests (provider or Next.js cache unavailable)\n");
    return;
  }
  const matchSlugsWithScorers = Object.values(snapshot.matches).filter((m) => m.scorers.length > 0);
  console.log(`Snapshot has scorer events for ${matchSlugsWithScorers.length} match(es).\n`);

  const statsTopScorersMap = new Map<string, { teamName: string | null; goals: number }>();
  for (const stat of snapshot.topScorers) {
    statsTopScorersMap.set(stat.playerName, { teamName: stat.teamName, goals: stat.goals });
  }

  const derivedTopScorers = new Map<string, { teamName: string | null; goals: number }>();
  for (const match of Object.values(snapshot.matches)) {
    for (const goal of match.scorers) {
      if (goal.isOwnGoal) continue;
      const existing = derivedTopScorers.get(goal.playerName);
      if (existing) existing.goals++;
      else derivedTopScorers.set(goal.playerName, { teamName: goal.teamName, goals: 1 });
    }
  }

  console.log(`/stats shows ${snapshot.topScorers.length} distinct scorer(s).`);

  assert(
    snapshot.topScorers.length === derivedTopScorers.size,
    "The number of top scorers in snapshot matches the dynamically derived count from individual matches"
  );

  for (const [name, info] of derivedTopScorers) {
    const statInfo = statsTopScorersMap.get(name);
    assert(statInfo !== undefined, `Derived scorer ${name} exists in topScorers`);
    if (statInfo) {
      assert(statInfo.goals === info.goals, `Derived scorer ${name} goals match (${info.goals})`);
    }
  }

  console.log("\nPer-match consistency:");
  for (const match of MATCHES) {
    const slug = matchSlug(match);
    const events = snapshot.matches[slug]?.scorers || [];
    if (events.length === 0) continue;

    console.log(`\n${slug} (${countryName(match.homeKey, "en")} vs ${countryName(match.awayKey, "en")}):`);
    for (const event of events) {
      const minute = event.minuteLabel ?? (event.minute != null ? `${event.minute}'` : "?");
      console.log(`  ${minute} ${event.playerName}${event.isOwnGoal ? " (OG)" : ""} (${event.teamName})`);
      if (event.isOwnGoal) {
        assert(!statsTopScorersMap.has(event.playerName), `${event.playerName} own goal is excluded from /stats top-scorer aggregation`);
        continue;
      }
      assert(statsTopScorersMap.has(event.playerName), `${event.playerName} (from ${slug}) appears in /stats top-scorer aggregation`);
    }
  }

  const usaMatch = MATCHES.find(
    (match) => countryName(match.homeKey, "en") === "United States" && countryName(match.awayKey, "en") === "Paraguay",
  );
  if (usaMatch) {
    const slug = matchSlug(usaMatch);
    const events = snapshot.matches[slug]?.scorers;
    if (events && events.length > 0) {
      assert(events.length === 5, "united-states-vs-paraguay has 5 goal events");
      assert(events[0]?.playerName === "Damian Bobadilla" && events[0]?.isOwnGoal === true, "USA-Paraguay starts with Bobadilla own goal");
      assert(events[2]?.playerName === "Folarin Balogun" && events[2]?.minuteLabel === "45+5'", "USA-Paraguay includes Balogun 45+5'");
      assert(events[4]?.playerName === "Giovanni Reyna" && events[4]?.minuteLabel === "90+8'", "USA-Paraguay includes Reyna 90+8'");
      assert(statsTopScorersMap.get("Folarin Balogun")?.goals === 2, "Balogun has 2 goals in /stats aggregation");
      assert(!statsTopScorersMap.has("Damian Bobadilla"), "Bobadilla own goal is not in /stats aggregation");
    }
  }

  const korMatch = MATCHES.find(
    (match) => countryName(match.homeKey, "en") === "South Korea" && countryName(match.awayKey, "en") === "Czechia",
  );
  if (korMatch) {
    const slug = matchSlug(korMatch);
    const events = snapshot.matches[slug]?.scorers;
    if (events && events.length > 0) {
      assert(events.length === 3, `south-korea-vs-czechia has 3 scorer events (got ${events.length})`);
      assert(
        events.every((event) => event.teamName === "South Korea" || event.teamName === "Czechia"),
        "all scorer events use internal team display names (South Korea / Czechia)",
      );
    } else {
      console.log("  No scorer events found for South Korea vs Czechia (provider may not have parsed it yet)");
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});
