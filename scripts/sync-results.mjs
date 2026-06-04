/**
 * sync-results.mjs
 *
 * Pulls FIFA World Cup 2026 match results + group standings from football-data.org
 * (competition code "WC") and writes them into data/matches.json + data/standings.json,
 * then bumps data/meta.json. Designed to be run on a schedule by
 * .github/workflows/sync-results.yml during the tournament.
 *
 * Requires FOOTBALL_DATA_API_KEY (free tier). Without it, runs as a safe no-op.
 * Only mutates result fields (status/score) — never the verified kickoffUtc/venue/city.
 *
 * Endpoints (v4, header `X-Auth-Token: <key>`):
 *   GET https://api.football-data.org/v4/competitions/WC/matches
 *   GET https://api.football-data.org/v4/competitions/WC/standings
 */

import fs from "node:fs";
import path from "node:path";

const API_BASE = "https://api.football-data.org/v4";
const COMPETITION = "WC";

const root = process.cwd();
const matchesPath = path.join(root, "data/matches.json");
const standingsPath = path.join(root, "data/standings.json");
const metaPath = path.join(root, "data/meta.json");
const teamsPath = path.join(root, "data/teams.json");
const crosswalkPath = path.join(root, "data/fd-crosswalk.json");

const apiKey = process.env.FOOTBALL_DATA_API_KEY;
// --dry-run: fetch + resolve from the API but write nothing. Useful for verifying team-name
// matching before the tournament without touching data/*.json.
const dryRun = process.argv.includes("--dry-run");

async function main() {
  if (!apiKey) {
    console.log("[sync-results] FOOTBALL_DATA_API_KEY not set — skipping (no-op). Nothing written.");
    process.exit(0);
  }

  const teams = readJson(teamsPath);
  const crosswalk = readJson(crosswalkPath);
  const matches = readJson(matchesPath);
  const standings = readJson(standingsPath);

  // Build an fd-name/alias -> our-team-id resolver. fd team names are matched against the
  // crosswalk first, then against each team's aliases as a tolerant fallback.
  const resolveTeamId = buildTeamResolver(teams, crosswalk);

  // ---- 1) MATCH RESULTS -------------------------------------------------------------
  const matchesRes = await fdFetch(`/competitions/${COMPETITION}/matches`);
  const fdMatches = matchesRes.matches || [];

  // ---- 2) UPDATE MATCH RESULTS ------------------------------------------------------
  let matchesUpdated = 0;
  const unmatched = [];
  for (const fdMatch of fdMatches) {
    const homeId = resolveTeamId(fdMatch.homeTeam?.name);
    const awayId = resolveTeamId(fdMatch.awayTeam?.name);
    if (!homeId || !awayId) {
      // Knockout placeholders ("Winner Group A", "1B", TBD) won't resolve before the bracket
      // is set — that's expected, so collect for a summary rather than spamming warnings.
      unmatched.push(`${fdMatch.homeTeam?.name || "?"} vs ${fdMatch.awayTeam?.name || "?"}`);
      continue;
    }
    const local = matches.find((m) => m.homeTeamId === homeId && m.awayTeamId === awayId);
    if (!local) continue;

    // Only touch live result fields — never overwrite verified kickoffUtc/venue/city.
    local.status = mapStatus(fdMatch.status);
    if (local.status === "finished") {
      local.homeScore = fdMatch.score?.fullTime?.home ?? null;
      local.awayScore = fdMatch.score?.fullTime?.away ?? null;
    } else if (local.status === "live") {
      // Show the running score while in play; fall back to null if the API omits it.
      local.homeScore = fdMatch.score?.fullTime?.home ?? null;
      local.awayScore = fdMatch.score?.fullTime?.away ?? null;
    } else {
      local.homeScore = null;
      local.awayScore = null;
    }
    local.dataStatus = "verified";
    local.lastVerifiedUtc = new Date().toISOString();
    matchesUpdated += 1;
  }
  const updatedMatches = matches;

  // ---- 3) FETCH STANDINGS -----------------------------------------------------------
  const standingsRes = await fdFetch(`/competitions/${COMPETITION}/standings`);
  const fdStandings = standingsRes.standings || [];

  // ---- 4) UPDATE STANDINGS ----------------------------------------------------------
  const nextStandings = [];
  for (const groupBlock of fdStandings) {
    // football-data returns TOTAL/HOME/AWAY blocks; keep only the combined table.
    if (groupBlock.type && groupBlock.type !== "TOTAL") continue;
    const group = (groupBlock.group || "").replace("GROUP_", "");
    for (const row of groupBlock.table || []) {
      const teamId = resolveTeamId(row.team?.name);
      if (!teamId) continue;
      nextStandings.push({
        teamId,
        group,
        rank: row.position,
        played: row.playedGames,
        won: row.won,
        drawn: row.draw,
        lost: row.lost,
        goalsFor: row.goalsFor,
        goalsAgainst: row.goalsAgainst,
        goalDifference: row.goalDifference,
        points: row.points,
        dataStatus: "verified",
        isPreTournament: false
      });
    }
  }
  // Only replace standings.json once the API actually returns a table; otherwise keep the
  // existing pre-tournament file so an empty/early response can't wipe it.
  const updatedStandings = nextStandings.length ? nextStandings : standings;

  if (dryRun) {
    const resolvedCount = fdMatches.length - unmatched.length;
    console.log("===== DRY RUN =====");
    console.log(`Matches found (API):     ${fdMatches.length}`);
    console.log(`Matches resolved:        ${resolvedCount}`);
    console.log(`Matches updated locally: ${matchesUpdated}`);
    console.log(`Matches unmatched:       ${unmatched.length}`);
    if (unmatched.length) {
      console.log("  Unmatched fixtures:");
      for (const pair of unmatched) console.log(`    - ${pair}`);
    }
    console.log(`Standings rows found:    ${nextStandings.length}`);
    if (nextStandings.length) {
      console.log("  Sample (first 3 rows):");
      for (const row of nextStandings.slice(0, 3)) {
        console.log(`    - Group ${row.group} #${row.rank} ${row.teamId}: ${row.points}pts (${row.won}-${row.drawn}-${row.lost}, GD ${row.goalDifference})`);
      }
    }
    console.log("DRY RUN — no files written");
    return;
  }

  console.log(`[sync-results] matches updated: ${matchesUpdated}/${fdMatches.length}; standings rows: ${nextStandings.length}.`);
  if (unmatched.length) {
    console.log(`[sync-results] ${unmatched.length} fixtures unresolved (expected for knockout placeholders): ${unmatched.slice(0, 6).join(" | ")}${unmatched.length > 6 ? " …" : ""}`);
  }

  // ---- 3) PERSIST -------------------------------------------------------------------
  writeJson(matchesPath, updatedMatches);
  writeJson(standingsPath, updatedStandings);

  const meta = readJson(metaPath);
  writeJson(metaPath, {
    ...meta,
    lastUpdatedUtc: new Date().toISOString(),
    dataSource: "football-data.org (FIFA World Cup 2026, code WC)",
    updateMode: "api-sync-football-data-org",
    note: "Match results and group standings synced from football-data.org during the tournament. Scores may be slightly delayed on the free tier."
  });

  console.log("[sync-results] Done. data/matches.json, data/standings.json, and data/meta.json written.");
}

// --- helpers -------------------------------------------------------------------------

async function fdFetch(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "X-Auth-Token": apiKey }
  });
  if (!res.ok) {
    throw new Error(`football-data.org ${endpoint} -> ${res.status} ${res.statusText}`);
  }
  return res.json();
}

function mapStatus(fdStatus) {
  if (fdStatus === "FINISHED") return "finished";
  if (fdStatus === "IN_PLAY" || fdStatus === "PAUSED" || fdStatus === "LIVE") return "live";
  return "scheduled";
}

function buildTeamResolver(teams, crosswalk) {
  const byName = new Map();
  for (const team of teams) {
    const keys = new Set([team.name, team.fifaCode, ...(team.aliases || [])]);
    const cw = crosswalk[team.id];
    if (cw?.fdName) keys.add(cw.fdName);
    for (const key of keys) {
      if (key) byName.set(normalize(key), team.id);
    }
  }
  return (fdName) => (fdName ? byName.get(normalize(fdName)) || null : null);
}

function normalize(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics (Türkiye -> turkiye, Curaçao -> curacao)
    .replace(/[^a-z0-9]+/g, "");
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

main().catch((error) => {
  console.error("[sync-results] failed:", error);
  process.exit(1);
});
