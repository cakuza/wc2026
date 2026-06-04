// One-off: add squadValue (€ millions, rounded) scraped from Transfermarkt
// (World Cup 2026 participants, competition FIWC) on 2026-06-05.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const teamsPath = join(__dirname, "..", "data", "teams.json");

// Keyed by data/teams.json "name". Values are rounded to nearest million.
const squadValues = {
  France: 1550,
  England: 1370,
  Spain: 1220,
  Portugal: 1010,
  Germany: 982,
  Brazil: 943,
  Netherlands: 814,
  Argentina: 800,
  Norway: 592,
  Belgium: 551,
  "Côte d'Ivoire": 522,
  Morocco: 490,
  Senegal: 478,
  Turkey: 474,
  Sweden: 404,
  Uruguay: 392,
  Croatia: 388,
  "United States": 386,
  Ecuador: 369,
  Switzerland: 333,
  Colombia: 298,
  Japan: 281,
  Algeria: 257,
  Ghana: 238,
  Austria: 232,
  Canada: 198,
  Mexico: 194,
  Czechia: 188,
  Scotland: 170,
  Paraguay: 154,
  "Bosnia and Herzegovina": 151,
  "DR Congo": 144,
  "South Korea": 138,
  Egypt: 116,
  Uzbekistan: 85,
  Australia: 78,
  Tunisia: 70,
  "Cape Verde": 56,
  Haiti: 56,
  "South Africa": 45,
  "Saudi Arabia": 41,
  Panama: 35,
  "New Zealand": 34,
  Iran: 32,
  Curaçao: 26,
  Iraq: 21,
  Jordan: 20,
  Qatar: 20
};

const teams = JSON.parse(await readFile(teamsPath, "utf8"));

const missing = [];
for (const team of teams) {
  const value = squadValues[team.name];
  if (value === undefined) {
    missing.push(team.name);
    continue;
  }
  team.squadValue = value;
}

if (missing.length) {
  console.error("No squadValue mapping for:", missing);
  process.exit(1);
}

const mapped = teams.filter((t) => typeof t.squadValue === "number").length;
await writeFile(teamsPath, JSON.stringify(teams, null, 2) + "\n", "utf8");
console.log(`Updated ${mapped}/${teams.length} teams with squadValue.`);
