/**
 * import-positions.mjs
 *
 * Enriches data/squads.json with real shirt numbers + granular field positions for all 48
 * WC2026 squads, sourced from Wikipedia (CC BY-SA):
 *   - shirt number + broad position  <- "2026 FIFA World Cup squads" squad tables
 *   - granular position (Centre-back, Attacking midfielder, ...) <- each player's article infobox
 *
 * Granular labels are stored verbatim in `detailedPosition`; src/lib/squads.ts positionCode()
 * maps them to short codes (CB, CAM, LW, ...). The broad `position` bucket is realigned to the
 * granular role so squad grouping and the displayed code always agree.
 *
 * Usage:
 *   node scripts/import-positions.mjs --dry-run   # fetch + match, write nothing, print summary
 *   node scripts/import-positions.mjs             # write data/squads.json
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const WIKI = "https://en.wikipedia.org/w/api.php";
const UA = "WC26HubDev/1.0 (WC2026 squad positions import; contact funnyymoney@gmail.com)";
const SQUADS_PAGE = "2026 FIFA World Cup squads";
const dryRun = process.argv.includes("--dry-run");
const onlyTeam = (process.argv.find((a) => a.startsWith("--team=")) || "").split("=")[1] || null;

// Granular label -> broad bucket, so we can realign `position`. Mirrors the code map in squads.ts.
const GRANULAR_TO_BROAD = {
  GK: "GK",
  CB: "DEF", RB: "DEF", LB: "DEF", FB: "DEF", WB: "DEF", RWB: "DEF", LWB: "DEF", SW: "DEF", DEF: "DEF",
  CDM: "MID", CM: "MID", CAM: "MID", RM: "MID", LM: "MID", MID: "MID",
  RW: "FWD", LW: "FWD", W: "FWD", ST: "FWD", FWD: "FWD"
};
// Keys normalized (lowercase, hyphens -> spaces) — must match squads.ts.
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
const labelKey = (label) => label.toLowerCase().replace(/-/g, " ").replace(/\s+/g, " ").trim();
const BROAD_FROM_TABLE = { GK: "GK", DF: "DEF", MF: "MID", FW: "FWD" };

const teams = readJson("data/teams.json");
const squads = readJson("data/squads.json");
const norm = (s) =>
  String(s).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "");
// Name key for matching: norm + canonicalize the Jr/Junior suffix (Vinicius Jr <-> Vinícius Júnior).
const nameKey = (s) => norm(s).replace(/junior$/, "jr");

// Levenshtein distance (small squads, so the O(n*m) cost is negligible).
function editDistance(a, b) {
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 2) return 99; // early-out: we only accept <= 2 anyway
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

// Conservative fuzzy match within a single squad: nearest entry by edit distance, accepted only
// when it's <= 2 AND strictly closer than the runner-up (avoids ambiguous picks).
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

const teamByName = new Map();
for (const t of teams) {
  for (const key of [t.name, t.fifaCode, ...(t.aliases || [])]) if (key) teamByName.set(norm(key), t.id);
}

main().catch((err) => {
  console.error("[import-positions] failed:", err);
  process.exit(1);
});

async function main() {
  console.log(`[import-positions] ${dryRun ? "DRY RUN" : "WRITE MODE"} — fetching "${SQUADS_PAGE}"...`);
  const wt = (await wiki({ action: "parse", page: SQUADS_PAGE, prop: "wikitext" })).parse.wikitext;

  // ---- 1) Parse squad tables: per team -> [{ shirtNumber, tablePos, articleTitle, displayName }] ----
  const sections = splitSections(wt);
  const perTeam = new Map(); // teamId -> rows
  const articleTitles = new Set();
  let teamsFound = 0;
  for (const { heading, body } of sections) {
    const teamId = teamByName.get(norm(heading));
    if (!teamId || !squads[teamId]) continue;
    if (onlyTeam && teamId !== onlyTeam) continue;
    teamsFound += 1;
    const rows = [];
    for (const tpl of extractPlayerTemplates(body)) {
      const no = (tpl.match(/\|\s*no\s*=\s*(\d+)/) || [])[1];
      const pos = (tpl.match(/\|\s*pos\s*=\s*([A-Za-z]+)/) || [])[1];
      const nameLink = (tpl.match(/\|\s*name\s*=\s*\[\[([^\]]+)\]\]/) || [])[1];
      if (!nameLink) continue;
      const [target, display] = nameLink.split("|");
      rows.push({
        shirtNumber: no ? Number.parseInt(no, 10) : null,
        tablePos: pos || null,
        articleTitle: target.trim(),
        displayName: (display || target).trim()
      });
      articleTitles.add(target.trim());
    }
    perTeam.set(teamId, rows);
  }
  console.log(`[import-positions] parsed ${teamsFound} teams, ${articleTitles.size} unique player articles.`);

  // ---- 2) Fetch infoboxes in batches, extract granular position ----
  const positionByArticle = await fetchInfoboxPositions([...articleTitles]);

  // ---- 3) Match back into squads.json by diacritic-insensitive name ----
  const stats = { teams: 0, matched: 0, unmatched: 0, numbers: 0, granular: 0 };
  const unmappedLabels = new Map();
  const unmatchedSamples = [];

  for (const [teamId, rows] of perTeam) {
    const squad = squads[teamId];
    const byName = new Map(squad.map((entry) => [nameKey(entry.name), entry]));
    stats.teams += 1;
    for (const row of rows) {
      const entry =
        byName.get(nameKey(row.displayName)) ||
        byName.get(nameKey(row.articleTitle.split("(")[0])) ||
        fuzzyMatch(nameKey(row.displayName), squad);
      if (!entry) {
        stats.unmatched += 1;
        if (unmatchedSamples.length < 12) unmatchedSamples.push(`${teamId}: ${row.displayName}`);
        continue;
      }
      stats.matched += 1;
      if (row.shirtNumber != null) {
        entry.number = row.shirtNumber;
        stats.numbers += 1;
      }
      const label = positionByArticle.get(row.articleTitle);
      const code = label ? LABEL_TO_CODE[labelKey(label)] : null;
      if (label && !code) unmappedLabels.set(label, (unmappedLabels.get(label) || 0) + 1);
      if (label) {
        entry.detailedPosition = label;
        stats.granular += 1;
      }
      // Realign broad bucket: prefer granular-derived bucket, else the squad-table position.
      const broad = (code && GRANULAR_TO_BROAD[code]) || (row.tablePos && BROAD_FROM_TABLE[row.tablePos]) || entry.position;
      entry.position = broad;
    }
  }

  // ---- 4) Report + persist ----
  console.log("\n===== SUMMARY =====");
  console.log(`Teams processed:      ${stats.teams}`);
  console.log(`Players matched:      ${stats.matched}`);
  console.log(`  with shirt number:  ${stats.numbers}`);
  console.log(`  with granular pos:  ${stats.granular}`);
  console.log(`Players unmatched:    ${stats.unmatched}`);
  if (unmatchedSamples.length) console.log("  e.g.", unmatchedSamples.join(" | "));
  if (unmappedLabels.size) {
    console.log("\n⚠ Unmapped granular labels (add to LABEL_TO_CODE + squads.ts):");
    for (const [label, n] of [...unmappedLabels].sort((a, b) => b[1] - a[1])) console.log(`   "${label}" x${n}`);
  } else {
    console.log("\nAll granular labels mapped to short codes. ✅");
  }

  if (dryRun) {
    console.log("\nDRY RUN — data/squads.json NOT written.");
    return;
  }
  writeJson("data/squads.json", squads);
  console.log("\n[import-positions] data/squads.json written.");
}

// --- Wikipedia helpers ---------------------------------------------------------------

async function wiki(params) {
  const url = new URL(WIKI);
  url.search = new URLSearchParams({ format: "json", formatversion: "2", ...params }).toString();
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`wiki ${res.status} ${res.statusText}`);
  return res.json();
}

async function fetchInfoboxPositions(titles) {
  const result = new Map(); // requested article title -> cleaned granular label
  const batchSize = 40;
  for (let i = 0; i < titles.length; i += batchSize) {
    const batch = titles.slice(i, i + batchSize);
    const data = await wiki({
      action: "query",
      prop: "revisions",
      rvprop: "content",
      rvslots: "main",
      redirects: "1",
      titles: batch.join("|")
    });
    const q = data.query || {};
    // Map requested -> final title through normalized + redirect chains.
    const step = new Map();
    for (const n of q.normalized || []) step.set(n.from, n.to);
    for (const r of q.redirects || []) step.set(r.from, r.to);
    const resolve = (t) => {
      let cur = t;
      for (let k = 0; k < 5 && step.has(cur); k++) cur = step.get(cur);
      return cur;
    };
    const contentByTitle = new Map();
    for (const page of q.pages || []) {
      const content = page.revisions?.[0]?.slots?.main?.content || "";
      contentByTitle.set(page.title, content);
    }
    for (const requested of batch) {
      const content = contentByTitle.get(resolve(requested));
      const label = content ? extractInfoboxPosition(content) : null;
      if (label) result.set(requested, label);
    }
    process.stdout.write(`\r[import-positions] infoboxes ${Math.min(i + batchSize, titles.length)}/${titles.length}`);
    await sleep(250); // be polite to the API
  }
  process.stdout.write("\n");
  return result;
}

function extractInfoboxPosition(content) {
  const m = content.match(/\|\s*position\s*=\s*([^\n]*)/i);
  if (!m) return null;
  let s = m[1].split("<ref")[0].split("<!--")[0].split("{{")[0]; // drop refs/comments/templates
  const firstLink = s.match(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/); // if linked roles, take only the first
  s = (firstLink ? firstLink[1] : s).split(/[,/;]| and /i)[0]; // then first listed role only
  s = s.replace(/<[^>]*>/g, "").replace(/\([^)]*\)/g, "").replace(/\s+/g, " ").trim(); // drop html/parens
  return s || null;
}

// --- wikitext parsing ----------------------------------------------------------------

function splitSections(wt) {
  const re = /^===\s*([^=].*?)\s*===\s*$/gm;
  const heads = [];
  let m;
  while ((m = re.exec(wt))) heads.push({ heading: m[1], start: m.index, contentStart: re.lastIndex });
  return heads.map((h, i) => ({
    heading: h.heading,
    body: wt.slice(h.contentStart, i + 1 < heads.length ? heads[i + 1].start : wt.length)
  }));
}

// Extract each {{nat fs (g) player ...}} / {{fs player ...}} template as a balanced string
// (values contain nested {{birth date and age2|...}}, so naive [^}]* won't do).
function extractPlayerTemplates(text) {
  const out = [];
  const startRe = /\{\{\s*(?:nat fs g player|nat fs player|fs player)\b/gi;
  let m;
  while ((m = startRe.exec(text))) {
    const block = balanced(text, m.index);
    if (block) out.push(block);
  }
  return out;
}

function balanced(text, start) {
  let depth = 0;
  for (let i = start; i < text.length - 1; i++) {
    if (text[i] === "{" && text[i + 1] === "{") {
      depth++;
      i++;
    } else if (text[i] === "}" && text[i + 1] === "}") {
      depth--;
      i++;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

// --- io ------------------------------------------------------------------------------

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}
function writeJson(file, value) {
  fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);
}
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
