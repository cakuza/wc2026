/**
 * Stats sync audit / smoke test.
 *
 * Checks whether live match data (status, score, goals, cards, substitutions) is actually
 * reachable from football-data.org for the opening match (Mexico vs South Africa), and
 * whether the data needed to feed /stats and the match pages is available.
 *
 * Does NOT write anything, does NOT invent data — it only reports what the upstream API
 * returns (or why nothing is returned).
 *
 * Usage:
 *   npx tsx scripts/test-stats-sync.ts
 */

const BASE = "https://api.football-data.org/v4";
const COMPETITION = 2000; // FIFA World Cup (recurring competition code)

const KEY = process.env.FOOTBALL_DATA_API_KEY;

async function main() {
  console.log("=== Stats sync audit ===\n");

  if (!KEY) {
    console.log("FOOTBALL_DATA_API_KEY is NOT set.");
    console.log("Result: Stats sync is not currently connected. UI is ready but no live data source is feeding it.");
    return;
  }
  console.log(`FOOTBALL_DATA_API_KEY is set (length ${KEY.length}).`);

  // 1. Pull the competition's match list around the opener date.
  const matchesUrl = `${BASE}/competitions/${COMPETITION}/matches?dateFrom=2026-06-10&dateTo=2026-06-12`;
  console.log(`\nGET ${matchesUrl}`);
  const res = await fetch(matchesUrl, { headers: { "X-Auth-Token": KEY } });
  console.log(`Response status: ${res.status}`);

  if (!res.ok) {
    const body = await res.text();
    console.log(`Body: ${body.slice(0, 500)}`);
    console.log("\nResult: Stats sync is configured (API key present) but the matches request failed.");
    console.log("Why no events were written: the upstream request did not succeed (see status above),");
    console.log("so no football-data.org match ID could be resolved for Mexico vs South Africa.");
    return;
  }

  const data = await res.json();
  const matches: any[] = data.matches ?? [];
  console.log(`Matches returned: ${matches.length}`);

  const opener = matches.find(
    (m) =>
      /mexico/i.test(m.homeTeam?.name ?? "") && /south africa/i.test(m.awayTeam?.name ?? "")
  );

  if (!opener) {
    console.log("\nMexico vs South Africa not found in this date range / competition response.");
    console.log("Sample teams returned:", matches.slice(0, 5).map((m) => `${m.homeTeam?.name} vs ${m.awayTeam?.name}`));
    console.log("\nResult: Stats sync is configured but the opener match could not be resolved from football-data.org.");
    console.log("Why no events were written: no matching fixture was found, so there is no football-data.org");
    console.log("match ID to map into lib/matches.ts / pass to fetchMatchEvents().");
    return;
  }

  const fdMatchId = opener.id;
  console.log(`\nFound opener: ${opener.homeTeam?.name} vs ${opener.awayTeam?.name}`);
  console.log(`football-data.org match id: ${fdMatchId}`);
  console.log(`Status: ${opener.status}`);
  console.log(`Score: ${JSON.stringify(opener.score)}`);

  // 2. Pull the single-match detail (goals/cards/subs live under match.goals / bookings / substitutions
  //    on football-data.org's /matches/{id} endpoint).
  const matchUrl = `${BASE}/matches/${fdMatchId}`;
  console.log(`\nGET ${matchUrl}`);
  const matchRes = await fetch(matchUrl, { headers: { "X-Auth-Token": KEY } });
  console.log(`Response status: ${matchRes.status}`);

  if (!matchRes.ok) {
    const body = await matchRes.text();
    console.log(`Body: ${body.slice(0, 500)}`);
    console.log("\nResult: Match found, but the match-detail request failed — no event data available.");
    return;
  }

  const matchData = await matchRes.json();
  const goals = matchData.goals ?? [];
  const bookings = matchData.bookings ?? [];
  const substitutions = matchData.substitutions ?? [];

  console.log(`\nGoals: ${goals.length}`);
  console.log(`Bookings (cards): ${bookings.length}`);
  console.log(`Substitutions: ${substitutions.length}`);

  console.log("\n=== Summary ===");
  console.log(`Match status: ${matchData.status}`);
  console.log(`Score: ${JSON.stringify(matchData.score)}`);

  if (goals.length === 0 && bookings.length === 0 && substitutions.length === 0) {
    console.log(
      "\nResult: API connection works and the match was resolved, but football-data.org currently " +
      "returns no goals/cards/substitutions for this match (status: " + matchData.status + ")."
    );
    console.log(
      "This is expected if the match has not kicked off yet or the provider has not populated " +
      "live events yet. UI is ready (MatchDetail renders these arrays when present) but the " +
      "fixture-to-football-data-ID mapping (lib/matches.ts) and the call to fetchMatchEvents() " +
      "in app/matches/[matchId]/page.tsx are NOT wired up yet — events is hardcoded to null."
    );
  } else {
    console.log("\nResult: Live event data IS available from football-data.org for this match.");
    console.log(
      "It is NOT yet wired into the UI: app/matches/[matchId]/page.tsx hardcodes `events = null` " +
      "and lib/matches.ts has no football-data.org ID field on Match objects."
    );
  }

  console.log(
    "\n/stats note: StatsContent currently renders only static all-time records (no aggregate " +
    "live tournament stats). There is no sync job populating per-tournament aggregates."
  );
}

main().catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});
