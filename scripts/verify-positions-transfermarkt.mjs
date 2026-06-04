/**
 * verify-positions-transfermarkt.mjs
 *
 * Cross-checks the granular positions in data/squads.json (imported from Wikipedia) against
 * Transfermarkt, which is treated as the authority. For every player we can match, the
 * detailedPosition is set to Transfermarkt's value and the broad `position` bucket is realigned.
 * Prints how many players were corrected (short code changed) vs confirmed.
 *
 * Source: Transfermarkt World Cup 2026 participants (competition FIWC) -> each team's detailed
 * squad. Note: TM data is proprietary and used here only as a private reference to correct our
 * own field (per explicit instruction); nothing from TM is displayed or redistributed.
 *
 * Usage:
 *   node scripts/verify-positions-transfermarkt.mjs --dry-run
 *   node scripts/verify-positions-transfermarkt.mjs
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const PARTICIPANTS = "https://www.transfermarkt.com/weltmeisterschaft/teilnehmer/pokalwettbewerb/FIWC";
const squadUrl = (id) => `https://www.transfermarkt.com/x/kader/verein/${id}/plus/1`;
const dryRun = process.argv.includes("--dry-run");
const onlyTeam = (process.argv.find((a) => a.startsWith("--team=")) || "").split("=")[1] || null;

// Manual TM-name -> our-name aliases for squads where auto-matching fails. South Korea: TM lists
// given-family order with hyphens (e.g. "Bum-keun Song") vs our family-given concatenated form
// ("Song Bumkeun"), plus a few romanization differences (Gi/Ki).
const MANUAL_ALIASES = {
  "south-korea": {
    "Bum-keun Song": "Song Bumkeun",
    "Hyeon-woo Jo": "Jo Hyeonwoo",
    "Seung-gyu Kim": "Kim Seung-gyu",
    "Min-jae Kim": "Kim Minjae",
    "Han-beom Lee": "Lee Hanbeom",
    "Tae-hyeon Kim": "Kim Taehyeon",
    "Gi-hyuk Lee": "Lee Kihyuk",
    "Wi-je Cho": "Cho Wije",
    "Tae-seok Lee": "Lee Taeseok",
    "Young-woo Seol": "Seol Youngwoo",
    "Moon-hwan Kim": "Kim Moonhwan",
    "Jin-seob Park": "Park Jinseob",
    "Seung-ho Paik": "Paik Seungho",
    "Jin-gyu Kim": "Kim Jingyu",
    "Kang-in Lee": "Lee Kangin",
    "Jun-ho Bae": "Bae Junho",
    "Jae-sung Lee": "Lee Jaesung",
    "Dong-gyeong Lee": "Lee Donggyeong",
    "Ji-sung Eom": "Eom Jisung",
    "Hyun-jun Yang": "Yang Hyunjun",
    "Hyeon-gyu Oh": "Oh Hyeongyu",
    "Hee-chan Hwang": "Hwang Heechan",
    "Gue-sung Cho": "Cho Guesung"
  }
};

// Same maps as squads.ts / import-positions.mjs (keys normalized: lowercase, hyphens -> spaces).
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
  RW: "FWD", LW: "FWD", W: "FWD", ST: "FWD", FWD: "FWD"
};
const labelKey = (label) => label.toLowerCase().replace(/-/g, " ").replace(/\s+/g, " ").trim();
const codeFor = (label) => (label ? LABEL_TO_CODE[labelKey(label)] || null : null);

const teams = JSON.parse(read("data/teams.json"));
const crosswalk = JSON.parse(read("data/fd-crosswalk.json"));
const squads = JSON.parse(read("data/squads.json"));

const norm = (s) =>
  String(s).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "");
const nameKey = (s) => norm(s).replace(/junior$/, "jr");
// Order-insensitive key: same tokens in any order (handles "Takefusa Kubo" vs "Kubo Takefusa").
const tokenKey = (s) =>
  String(s).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").split(/[^a-z0-9]+/).filter(Boolean).sort().join(" ");

main().catch((err) => {
  console.error("[verify-positions] failed:", err);
  process.exit(1);
});

async function main() {
  console.log(`[verify-positions] ${dryRun ? "DRY RUN" : "WRITE MODE"} — resolving TM team IDs...`);
  const tmIdByTeam = await resolveTeamIds();
  console.log(`[verify-positions] resolved ${Object.keys(tmIdByTeam).length}/48 teams on Transfermarkt.`);

  const totals = { corrected: 0, confirmed: 0, noTmData: 0, unmatched: 0, tmPlayers: 0 };
  const perTeam = [];
  const unmappedTmLabels = new Map();
  const correctionSamples = [];

  for (const team of teams) {
    if (onlyTeam && team.id !== onlyTeam) continue;
    const tm = tmIdByTeam[team.id];
    const squad = squads[team.id] || [];
    if (!tm) {
      perTeam.push({ team: team.name, status: "no TM id" });
      continue;
    }
    const tmSquad = await fetchTmSquad(tm.id); // [{ name, label }]
    totals.tmPlayers += tmSquad.length;
    const byName = new Map(squad.map((e) => [nameKey(e.name), e]));
    // Token-set index, skipping ambiguous collisions so a reorder match stays high-precision.
    const byToken = new Map();
    for (const e of squad) {
      const k = tokenKey(e.name);
      byToken.set(k, byToken.has(k) ? null : e);
    }

    const aliases = MANUAL_ALIASES[team.id] || {};
    let corrected = 0;
    let confirmed = 0;
    const matchedEntries = new Set();
    for (const tmp of tmSquad) {
      const aliasTarget = aliases[tmp.name];
      const entry =
        (aliasTarget && byName.get(nameKey(aliasTarget))) ||
        byName.get(nameKey(tmp.name)) ||
        byToken.get(tokenKey(tmp.name)) ||
        fuzzyMatch(nameKey(tmp.name), squad);
      if (!entry) continue;
      matchedEntries.add(entry);
      const tmCode = codeFor(tmp.label);
      if (!tmCode) {
        unmappedTmLabels.set(tmp.label, (unmappedTmLabels.get(tmp.label) || 0) + 1);
        continue;
      }
      const oldCode = currentCode(entry);
      if (tmCode !== oldCode) {
        if (correctionSamples.length < 25) {
          correctionSamples.push(`${team.name}: ${entry.name}  ${oldCode} -> ${tmCode} (TM: ${tmp.label})`);
        }
        corrected += 1;
      } else {
        confirmed += 1;
      }
      // Transfermarkt is authoritative: adopt its label + realign the broad bucket.
      entry.detailedPosition = tmp.label;
      entry.position = GRANULAR_TO_BROAD[tmCode] || entry.position;
    }
    const noTm = squad.length - matchedEntries.size;
    totals.corrected += corrected;
    totals.confirmed += confirmed;
    totals.noTmData += noTm;
    perTeam.push({ team: team.name, tm: tmSquad.length, corrected, confirmed, noTm });
    process.stdout.write(`\r[verify-positions] ${perTeam.length}/${teams.length} teams checked`);
    await sleep(500); // polite spacing between squad requests
  }
  process.stdout.write("\n");

  // ---- report ----
  console.log("\n===== CORRECTIONS BY TEAM (only teams with changes) =====");
  for (const r of perTeam.filter((r) => r.corrected > 0).sort((a, b) => b.corrected - a.corrected)) {
    console.log(`  ${r.team.padEnd(24)} corrected ${String(r.corrected).padStart(2)}  (confirmed ${r.confirmed}, no-TM ${r.noTm})`);
  }
  console.log("\n===== SAMPLE CORRECTIONS =====");
  for (const s of correctionSamples) console.log("  " + s);
  if (unmappedTmLabels.size) {
    console.log("\n⚠ Unmapped TM labels (not applied):");
    for (const [l, n] of [...unmappedTmLabels].sort((a, b) => b[1] - a[1])) console.log(`   "${l}" x${n}`);
  }
  console.log("\n===== TOTALS =====");
  console.log(`Teams checked on TM:    ${perTeam.filter((r) => r.tm).length}`);
  console.log(`TM players seen:        ${totals.tmPlayers}`);
  console.log(`Players CORRECTED:      ${totals.corrected}`);
  console.log(`Players confirmed:      ${totals.confirmed}`);
  console.log(`Our players w/o TM row: ${totals.noTmData} (kept Wikipedia value)`);

  if (dryRun) {
    console.log("\nDRY RUN — data/squads.json NOT written.");
    return;
  }
  write("data/squads.json", `${JSON.stringify(squads, null, 2)}\n`);
  console.log("\n[verify-positions] data/squads.json written.");
}

function currentCode(entry) {
  if (entry.detailedPosition) {
    const c = LABEL_TO_CODE[labelKey(entry.detailedPosition)];
    if (c) return c;
  }
  return entry.position;
}

// --- Transfermarkt fetching ----------------------------------------------------------

async function resolveTeamIds() {
  const html = await tmFetch(PARTICIPANTS);
  const tmByNorm = new Map();
  for (const m of html.matchAll(/title="([^"]+)" href="\/[a-z0-9-]+\/startseite\/verein\/(\d+)"/g)) {
    const n = norm(m[1]);
    if (!tmByNorm.has(n)) tmByNorm.set(n, { id: m[2], title: m[1] });
  }
  const out = {};
  for (const team of teams) {
    const keys = [team.name, team.fifaCode, ...(team.aliases || []), crosswalk[team.id]?.fdName].filter(Boolean);
    for (const k of keys) {
      const hit = tmByNorm.get(norm(k));
      if (hit) {
        out[team.id] = hit;
        break;
      }
    }
  }
  return out;
}

async function fetchTmSquad(vereinId) {
  const html = await tmFetch(squadUrl(vereinId));
  const re = /\/profil\/spieler\/(\d+)">\s*([^<]+?)\s*<\/a>\s*<\/td>\s*<\/tr>\s*<tr>\s*<td>\s*([^<]+?)\s*<\/td>/g;
  const rows = [];
  let m;
  while ((m = re.exec(html))) rows.push({ name: decodeEntities(m[2]), label: decodeEntities(m[3]) });
  return rows;
}

async function tmFetch(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "en" } });
  if (!res.ok) throw new Error(`TM ${url} -> ${res.status} ${res.statusText}`);
  return res.text();
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .trim();
}

// --- conservative fuzzy name match (same approach as import-positions.mjs) ------------

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

// --- io ------------------------------------------------------------------------------

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}
function write(file, value) {
  fs.writeFileSync(path.join(root, file), value);
}
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
