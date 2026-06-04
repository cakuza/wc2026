/**
 * sync-results.mjs — SKELETON (no live API calls yet)
 *
 * Pulls FIFA World Cup 2026 match results + group standings from football-data.org
 * (competition code "WC") and writes them into data/matches.json + data/standings.json,
 * then bumps data/meta.json. Designed to be run on a schedule by
 * .github/workflows/sync-results.yml during the tournament.
 *
 * The actual HTTP calls + field mapping are left as TODOs until the free API token
 * (FOOTBALL_DATA_API_KEY) is available. Until then this runs as a safe no-op that
 * validates the environment and the crosswalk wiring.
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
  // TODO: const fdMatches = await fdFetch(`/competitions/${COMPETITION}/matches`);
  // TODO: for (const fdMatch of fdMatches.matches) {
  //   const homeId = resolveTeamId(fdMatch.homeTeam?.name);
  //   const awayId = resolveTeamId(fdMatch.awayTeam?.name);
  //   if (!homeId || !awayId) { console.warn("[sync] unmatched teams", fdMatch.homeTeam?.name, fdMatch.awayTeam?.name); continue; }
  //   const local = matches.find((m) => m.homeTeamId === homeId && m.awayTeamId === awayId);
  //   if (!local) continue;
  //   // Only touch live result fields — never overwrite verified date/venue/kickoff.
  //   local.status = mapStatus(fdMatch.status);            // SCHEDULED|IN_PLAY|PAUSED|FINISHED -> scheduled|live|finished
  //   local.homeScore = fdMatch.score?.fullTime?.home ?? null;
  //   local.awayScore = fdMatch.score?.fullTime?.away ?? null;
  //   local.lastVerifiedUtc = new Date().toISOString();
  // }
  const updatedMatches = matches; // no-op until API wired

  // ---- 2) GROUP STANDINGS -----------------------------------------------------------
  // TODO: const fdStandings = await fdFetch(`/competitions/${COMPETITION}/standings`);
  // TODO: const nextStandings = [];
  // for (const groupBlock of fdStandings.standings) {        // groupBlock.group === "GROUP_A"
  //   const group = (groupBlock.group || "").replace("GROUP_", "");
  //   for (const row of groupBlock.table) {
  //     const teamId = resolveTeamId(row.team?.name);
  //     if (!teamId) continue;
  //     nextStandings.push({
  //       teamId, group,
  //       rank: row.position,
  //       played: row.playedGames, won: row.won, drawn: row.draw, lost: row.lost,
  //       goalsFor: row.goalsFor, goalsAgainst: row.goalsAgainst,
  //       goalDifference: row.goalDifference, points: row.points,
  //       dataStatus: "verified", isPreTournament: false
  //     });
  //   }
  // }
  const updatedStandings = standings; // no-op until API wired

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

  console.log("[sync-results] Skeleton ran. API calls are still TODO — data files unchanged except meta timestamp.");
}

// --- helpers -------------------------------------------------------------------------

// eslint-disable-next-line no-unused-vars
async function fdFetch(endpoint) {
  // TODO: enable once FOOTBALL_DATA_API_KEY exists.
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "X-Auth-Token": apiKey }
  });
  if (!res.ok) {
    throw new Error(`football-data.org ${endpoint} -> ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// eslint-disable-next-line no-unused-vars
function mapStatus(fdStatus) {
  if (fdStatus === "FINISHED") return "finished";
  if (fdStatus === "IN_PLAY" || fdStatus === "PAUSED") return "live";
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
