import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const templatePath = path.join(root, "data/squadImportTemplate.csv");
const teams = readJson("data/teams.json");
const squads = readJson("data/squads.json");
const existingPlayers = readJson("data/players.json");
const teamsBySlug = new Map(teams.flatMap((team) => [[team.slug, team], [team.id, team]]));
const validStatuses = new Set(["official", "reported", "provisional", "sample", "pending"]);
const validPositions = new Set(["GK", "DF", "MF", "FW", "Unknown"]);

if (!fs.existsSync(templatePath)) {
  console.error("Missing data/squadImportTemplate.csv");
  process.exit(1);
}

const rows = parseCsv(fs.readFileSync(templatePath, "utf8")).filter((row) =>
  Object.values(row).some((value) => String(value || "").trim())
);

if (!rows.length) {
  console.log("Squad import OK: template has no rows, so no data was changed.");
  process.exit(0);
}

const errors = [];
const importedPlayers = [];
const seenImportKeys = new Set();

for (const [index, row] of rows.entries()) {
  const rowNumber = index + 2;
  const teamSlug = slugify(clean(row.teamSlug));
  const team = teamsBySlug.get(teamSlug);
  const name = clean(row.playerName);
  const displayName = clean(row.displayName) || name;
  const position = normalizePosition(row.position);
  const dataStatus = clean(row.dataStatus) || "reported";
  const sourceUrl = clean(row.sourceUrl);

  if (!team) errors.push(`Row ${rowNumber}: unknown teamSlug "${clean(row.teamSlug)}".`);
  if (!name) errors.push(`Row ${rowNumber}: missing playerName.`);
  if (!validPositions.has(position)) errors.push(`Row ${rowNumber}: invalid position "${clean(row.position)}".`);
  if (!validStatuses.has(dataStatus)) errors.push(`Row ${rowNumber}: invalid dataStatus "${dataStatus}".`);
  if (dataStatus === "official" && !sourceUrl) errors.push(`Row ${rowNumber}: official player "${name}" needs sourceUrl.`);
  if (dataStatus === "official" && clean(row.sourceLabel).toLowerCase().includes("sample")) {
    errors.push(`Row ${rowNumber}: official player "${name}" cannot use a sample source label.`);
  }

  const duplicateKey = `${team?.id || teamSlug}:${normalizeName(name)}`;
  if (seenImportKeys.has(duplicateKey)) errors.push(`Row ${rowNumber}: duplicate player "${name}" for ${teamSlug}.`);
  seenImportKeys.add(duplicateKey);

  if (!team || !name || !validStatuses.has(dataStatus)) continue;

  importedPlayers.push({
    id: `${team.id}-${slugify(name)}`,
    teamId: team.id,
    name,
    displayName,
    shirtNumber: parseOptionalInt(row.shirtNumber),
    position,
    club: clean(row.club) || undefined,
    age: parseOptionalInt(row.age),
    caps: parseOptionalInt(row.caps),
    goals: parseOptionalInt(row.goals),
    isStar: parseBoolean(row.isStar),
    isCaptain: parseBoolean(row.isCaptain),
    dataStatus,
    sourceLabel: clean(row.sourceLabel) || "Manual squad import",
    sourceUrl
  });
}

const existingById = new Map(existingPlayers.map((player) => [player.id, player]));
for (const player of importedPlayers) {
  const existingSameTeamName = [...existingById.values()].find(
    (item) => item.teamId === player.teamId && normalizeName(item.name) === normalizeName(player.name) && item.id !== player.id
  );
  if (existingSameTeamName) errors.push(`Duplicate existing player "${player.name}" for ${player.teamId}.`);
  existingById.set(player.id, player);
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

const players = [...existingById.values()].sort((a, b) => a.teamId.localeCompare(b.teamId) || a.name.localeCompare(b.name));
const playersByTeam = new Map();
for (const player of players) {
  playersByTeam.set(player.teamId, [...(playersByTeam.get(player.teamId) || []), player]);
}

const nextSquads = squads.map((squad) => {
  const squadPlayers = playersByTeam.get(squad.teamId) || [];
  return {
    ...squad,
    squadStatus: deriveSquadStatus(squadPlayers),
    sourceLabel: squadPlayers.length ? "Manual squad import" : squad.sourceLabel,
    lastCheckedUtc: new Date().toISOString(),
    players: squadPlayers
  };
});

writeJson("data/players.json", players);
writeJson("data/squads.json", nextSquads);
console.log(`Squad import OK: imported ${importedPlayers.length} rows, ${players.length} total players.`);

function deriveSquadStatus(playersForTeam) {
  if (!playersForTeam.length) return "pending";
  if (playersForTeam.every((player) => player.dataStatus === "official")) return "official";
  if (playersForTeam.some((player) => player.dataStatus === "provisional")) return "provisional";
  return "reported";
}

function normalizePosition(value) {
  const normalized = clean(value).toUpperCase();
  if (!normalized) return "Unknown";
  if (["G", "GK", "GOALKEEPER"].includes(normalized)) return "GK";
  if (["D", "DF", "DEF", "DEFENDER"].includes(normalized)) return "DF";
  if (["M", "MF", "MID", "MIDFIELDER"].includes(normalized)) return "MF";
  if (["F", "FW", "FWD", "FORWARD", "STRIKER"].includes(normalized)) return "FW";
  if (normalized === "UNKNOWN") return "Unknown";
  return normalized;
}

function parseOptionalInt(value) {
  const cleaned = clean(value);
  if (!cleaned) return undefined;
  const parsed = Number.parseInt(cleaned, 10);
  return Number.isInteger(parsed) ? parsed : undefined;
}

function parseBoolean(value) {
  const cleaned = clean(value).toLowerCase();
  if (!cleaned) return undefined;
  return ["true", "1", "yes", "y"].includes(cleaned);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(path.join(root, file), `${JSON.stringify(data, null, 2)}\n`);
}

function clean(value) {
  return String(value || "").trim();
}

function normalizeName(value) {
  return clean(value).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");
}

function slugify(value) {
  return normalizeName(value).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function parseCsv(source) {
  const lines = source.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => Object.fromEntries(splitCsvLine(line).map((value, index) => [headers[index], value])));
}

function splitCsvLine(line) {
  const cells = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index + 1] === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(cell);
      cell = "";
    } else {
      cell += char;
    }
  }
  cells.push(cell);
  return cells;
}
