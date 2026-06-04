/**
 * verify-positions-eafc.mjs
 *
 * Cross-checks granular positions in data/squads.json against EA SPORTS FC player ratings
 * (drop-api.ea.com). EA exposes a primary position short code (ST, CB, CAM, LW, ...) per player;
 * where it differs from ours, EA is treated as the source of truth.
 *
 * EA data is proprietary and used here only as a private reference to correct our own field
 * (per explicit instruction); nothing from EA is displayed or redistributed.
 *
 * Usage:
 *   node scripts/verify-positions-eafc.mjs --dry-run   # report corrections, write nothing
 *   node scripts/verify-positions-eafc.mjs             # apply EA positions to squads.json
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const API = "https://drop-api.ea.com/rating/ea-sports-fc";
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  Accept: "application/json",
  "Accept-Language": "en",
  Origin: "https://www.ea.com",
  Referer: "https://www.ea.com/"
};
const dryRun = process.argv.includes("--dry-run");

// Label -> code (for computing OUR current code from the TM/Wikipedia labels in squads.json).
const LABEL_TO_CODE = {
  "goalkeeper": "GK",
  "centre back": "CB", "center back": "CB", "central defender": "CB", "defender": "DEF", "defence": "DEF",
  "right back": "RB", "left back": "LB", "full back": "FB", "fullback": "FB",
  "wing back": "WB", "right wing back": "RWB", "left wing back": "LWB", "sweeper": "SW",
  "defensive midfield": "CDM", "defensive midfielder": "CDM",
  "central midfield": "CM", "central midfielder": "CM", "centre midfielder": "CM",
  "attacking midfield": "CAM", "attacking midfielder": "CAM",
  "right midfield": "RM", "right midfielder": "RM", "left midfield": "LM", "left midfielder": "LM",
  "midfield": "MID", "midfielder": "MID",
  "right winger": "RW", "left winger": "LW", "winger": "W", "wide midfielder": "W",
  "centre forward": "ST", "center forward": "ST", "striker": "ST", "second striker": "ST", "forward": "FWD",
  "offence": "FWD", "attacker": "FWD"
};
const GRANULAR_TO_BROAD = {
  GK: "GK",
  CB: "DEF", RB: "DEF", LB: "DEF", FB: "DEF", WB: "DEF", RWB: "DEF", LWB: "DEF", SW: "DEF", DEF: "DEF",
  CDM: "MID", CM: "MID", CAM: "MID", RM: "MID", LM: "MID", MID: "MID",
  RW: "FWD", LW: "FWD", W: "FWD", ST: "FWD", CF: "FWD", FWD: "FWD"
};
const KNOWN_CODES = new Set(Object.keys(GRANULAR_TO_BROAD));
// "Genuine fix" mode: only adopt EA when our current code is generic (a broad bucket or an
// unsided winger) and EA gives something more specific. This refines vague values without
// importing EA's specific-vs-specific reclassifications (RW->RM, CM->CDM, CAM->LW, ...).
const GENERIC_CODES = new Set(["DEF", "MID", "FWD", "W"]);
const genuineOnly = !process.argv.includes("--all");
// Known namesake collisions: our player shares a name with a DIFFERENT EA player. EA lists e.g.
// a "Nicolás Paz" (CB) separate from "Nico Paz" (CAM, the Argentina squad member), so the exact
// match grabs the wrong one. Skip these so they keep their current value.
const EXCLUDE = { argentina: new Set(["Nicolas Paz"]) };
const labelKey = (l) => l.toLowerCase().replace(/-/g, " ").replace(/\s+/g, " ").trim();
function currentCode(entry) {
  if (entry.detailedPosition) {
    const c = LABEL_TO_CODE[labelKey(entry.detailedPosition)];
    if (c) return c;
    const u = entry.detailedPosition.trim().toUpperCase();
    if (KNOWN_CODES.has(u)) return u;
  }
  return entry.position;
}

const teams = JSON.parse(read("data/teams.json"));
const crosswalk = JSON.parse(read("data/fd-crosswalk.json"));
const squads = JSON.parse(read("data/squads.json"));

const norm = (s) =>
  String(s).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "");
const nameKey = (s) => norm(s).replace(/junior$/, "jr");
const tokenKey = (s) =>
  String(s).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").split(/[^a-z0-9]+/).filter(Boolean).sort().join(" ");

main().catch((err) => {
  console.error("[verify-eafc] failed:", err);
  process.exit(1);
});

async function main() {
  console.log(`[verify-eafc] ${dryRun ? "DRY RUN" : "WRITE MODE"} — resolving EA nation IDs...`);
  const filters = await eaJson(`${API}/filters?locale=en`);
  const natByNorm = new Map(filters.nationality.map((n) => [norm(n.label), n]));
  const eaIdByTeam = {};
  const noEaNation = [];
  for (const team of teams) {
    const keys = [team.name, ...(team.aliases || []), crosswalk[team.id]?.fdName].filter(Boolean);
    let hit = null;
    for (const k of keys) if (natByNorm.has(norm(k))) { hit = natByNorm.get(norm(k)); break; }
    if (hit) eaIdByTeam[team.id] = hit;
    else noEaNation.push(team.name);
  }
  console.log(`[verify-eafc] resolved ${Object.keys(eaIdByTeam).length}/48 nations. Not on EA FC: ${noEaNation.join(", ") || "none"}`);

  console.log(`[verify-eafc] mode: ${genuineOnly ? "genuine fixes only (generic -> specific)" : "all differences"}`);
  const totals = { corrected: 0, confirmed: 0, noEaPlayer: 0, noEaNation: 0, skippedReclass: 0 };
  const perTeam = [];
  const samples = [];
  const reclassSamples = [];
  const unmappedEaCodes = new Map();

  for (const team of teams) {
    const ea = eaIdByTeam[team.id];
    const squad = squads[team.id] || [];
    if (!ea) {
      totals.noEaNation += squad.length;
      perTeam.push({ team: team.name, status: "no EA nation" });
      continue;
    }
    const eaPlayers = await fetchNationPlayers(ea.id, squad); // [{ name, code }]
    const byName = new Map(squad.map((e) => [nameKey(e.name), e]));
    const byToken = new Map();
    for (const e of squad) {
      const k = tokenKey(e.name);
      byToken.set(k, byToken.has(k) ? null : e);
    }

    let corrected = 0;
    let confirmed = 0;
    let skippedReclass = 0;
    const matched = new Set();
    for (const p of eaPlayers) {
      // Exact + token-set only. EA name forms vary too much (word order, Korean spacing) for fuzzy
      // matching to be safe — it produced false corrections (e.g. Son -> a CM namesake).
      const entry = byName.get(nameKey(p.name)) || byToken.get(tokenKey(p.name));
      if (!entry || matched.has(entry)) continue;
      if (EXCLUDE[team.id]?.has(entry.name)) continue; // namesake collision — keep current value
      if (!KNOWN_CODES.has(p.code)) {
        unmappedEaCodes.set(p.code, (unmappedEaCodes.get(p.code) || 0) + 1);
        continue;
      }
      matched.add(entry);
      const oldCode = currentCode(entry);
      if (p.code === oldCode) {
        confirmed += 1;
      } else if (genuineOnly && !GENERIC_CODES.has(oldCode)) {
        skippedReclass += 1; // specific -> specific reclassification, skipped in genuine-only mode
        if (reclassSamples.length < 15) reclassSamples.push(`${team.name}: ${entry.name}  ${oldCode} -> ${p.code} (skipped)`);
      } else {
        if (samples.length < 30) samples.push(`${team.name}: ${entry.name}  ${oldCode} -> ${p.code}`);
        corrected += 1;
        entry.detailedPosition = p.code; // EA short code, handled by positionCode() passthrough
        entry.position = GRANULAR_TO_BROAD[p.code] || entry.position;
      }
    }
    const noEaPlayer = squad.length - matched.size;
    totals.corrected += corrected;
    totals.confirmed += confirmed;
    totals.noEaPlayer += noEaPlayer;
    totals.skippedReclass += skippedReclass;
    perTeam.push({ team: team.name, corrected, confirmed, noEaPlayer });
    process.stdout.write(`\r[verify-eafc] ${perTeam.length}/${teams.length} teams checked`);
  }
  process.stdout.write("\n");

  console.log("\n===== CORRECTIONS BY TEAM (changes only) =====");
  for (const r of perTeam.filter((r) => r.corrected > 0).sort((a, b) => b.corrected - a.corrected)) {
    console.log(`  ${r.team.padEnd(24)} corrected ${String(r.corrected).padStart(2)}  (confirmed ${r.confirmed}, no-EA ${r.noEaPlayer})`);
  }
  console.log("\n===== SAMPLE CORRECTIONS =====");
  for (const s of samples) console.log("  " + s);
  if (unmappedEaCodes.size) {
    console.log("\n⚠ Unmapped EA codes:", JSON.stringify([...unmappedEaCodes]));
  }
  if (genuineOnly && reclassSamples.length) {
    console.log("\n===== SKIPPED RECLASSIFICATIONS (specific -> specific, not applied) =====");
    for (const s of reclassSamples) console.log("  " + s);
  }
  console.log("\n===== TOTALS =====");
  console.log(`Players CORRECTED:        ${totals.corrected}`);
  console.log(`Reclass. SKIPPED:         ${totals.skippedReclass}`);
  console.log(`Players confirmed:        ${totals.confirmed}`);
  console.log(`Our players not on EA:    ${totals.noEaPlayer} (kept current value)`);
  console.log(`Players in skipped teams: ${totals.noEaNation} (no EA nation, e.g. Qatar)`);

  if (dryRun) {
    console.log("\nDRY RUN — data/squads.json NOT written.");
    return;
  }
  write("data/squads.json", `${JSON.stringify(squads, null, 2)}\n`);
  console.log("\n[verify-eafc] data/squads.json written.");
}

// Fetch men's players for a nation, paging until our whole squad is covered (or pages run out).
async function fetchNationPlayers(nationId, squad) {
  const remaining = new Set(squad.map((e) => nameKey(e.name)));
  const out = [];
  const limit = 100;
  let offset = 0;
  let total = Infinity;
  for (let page = 0; page < 15 && offset < total && remaining.size; page++) {
    const j = await eaJson(`${API}?locale=en&limit=${limit}&offset=${offset}&gender=0&nationality=${nationId}`);
    total = j.totalItems ?? 0;
    for (const it of j.items || []) {
      if (it.gender?.id !== 0) continue; // men only
      const name = it.commonName || `${it.firstName || ""} ${it.lastName || ""}`.trim();
      const code = it.position?.shortLabel;
      if (!name || !code) continue;
      out.push({ name, code });
      remaining.delete(nameKey(name));
    }
    offset += limit;
    await sleep(150); // polite spacing
  }
  return out;
}

async function eaJson(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`EA ${url} -> ${res.status} ${res.statusText}`);
  return res.json();
}

function fuzzyMatch(targetKey, entries) {
  if (targetKey.length < 6) return null;
  let best = null;
  let bestDist = 3;
  let secondDist = 3;
  for (const entry of entries) {
    const d = editDistance(targetKey, nameKey(entry.name));
    if (d < bestDist) {
      secondDist = bestDist;
      bestDist = d;
      best = entry;
    } else if (d < secondDist) {
      secondDist = d;
    }
  }
  return bestDist <= 2 && bestDist < secondDist ? best : null;
}
function editDistance(a, b) {
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 2) return 99;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}
function write(file, value) {
  fs.writeFileSync(path.join(root, file), value);
}
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
