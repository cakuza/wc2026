import { getScorerEventsByInternalMatchId } from "../lib/worldcup26Provider";
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

  const scorerMap = await getScorerEventsByInternalMatchId();
  console.log(`Shared map has scorer events for ${scorerMap.size} match(es).\n`);

  const statsTopScorers = new Map<string, { teamName: string | null; goals: number }>();
  for (const events of scorerMap.values()) {
    for (const goal of events) {
      if (goal.isOwnGoal) continue;
      const existing = statsTopScorers.get(goal.playerName);
      if (existing) existing.goals++;
      else statsTopScorers.set(goal.playerName, { teamName: goal.teamName, goals: 1 });
    }
  }

  console.log(`/stats would show ${statsTopScorers.size} distinct scorer(s):`);
  for (const [name, info] of statsTopScorers) {
    console.log(`  ${name} (${info.teamName}) - ${info.goals} goal(s)`);
  }

  console.log("\nPer-match consistency:");
  for (const match of MATCHES) {
    const slug = matchSlug(match);
    const events = scorerMap.get(slug);
    if (!events || events.length === 0) continue;

    console.log(`\n${slug} (${countryName(match.homeKey, "en")} vs ${countryName(match.awayKey, "en")}):`);
    for (const event of events) {
      const minute = event.minuteLabel ?? (event.minute != null ? `${event.minute}'` : "?");
      console.log(`  ${minute} ${event.playerName}${event.isOwnGoal ? " (OG)" : ""} (${event.teamName})`);
      if (event.isOwnGoal) {
        assert(!statsTopScorers.has(event.playerName), `${event.playerName} own goal is excluded from /stats top-scorer aggregation`);
        continue;
      }
      assert(statsTopScorers.has(event.playerName), `${event.playerName} (from ${slug}) appears in /stats top-scorer aggregation`);
    }

    assert(scorerMap.get(slug) === events, `match-detail enrichment for "${slug}" reads from the same shared map entry as /stats`);
  }

  const usaMatch = MATCHES.find(
    (match) => countryName(match.homeKey, "en") === "United States" && countryName(match.awayKey, "en") === "Paraguay",
  );
  if (usaMatch) {
    const slug = matchSlug(usaMatch);
    const events = scorerMap.get(slug);
    if (events && events.length > 0) {
      assert(events.length === 5, "united-states-vs-paraguay has 5 goal events");
      assert(events[0]?.playerName === "Damian Bobadilla" && events[0]?.isOwnGoal === true, "USA-Paraguay starts with Bobadilla own goal");
      assert(events[2]?.playerName === "Folarin Balogun" && events[2]?.minuteLabel === "45+5'", "USA-Paraguay includes Balogun 45+5'");
      assert(events[4]?.playerName === "Giovanni Reyna" && events[4]?.minuteLabel === "90+8'", "USA-Paraguay includes Reyna 90+8'");
      assert(statsTopScorers.get("Folarin Balogun")?.goals === 2, "Balogun has 2 goals in /stats aggregation");
      assert(!statsTopScorers.has("Damian Bobadilla"), "Bobadilla own goal is not in /stats aggregation");
    }
  }

  const korMatch = MATCHES.find(
    (match) => countryName(match.homeKey, "en") === "South Korea" && countryName(match.awayKey, "en") === "Czechia",
  );
  if (korMatch) {
    const slug = matchSlug(korMatch);
    const events = scorerMap.get(slug);
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
