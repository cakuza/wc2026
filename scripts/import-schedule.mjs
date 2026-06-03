import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const csvPath = path.join(root, "data/scheduleImportTemplate.csv");
const matchesPath = path.join(root, "data/matches.json");
const metaPath = path.join(root, "data/meta.json");
const teamsPath = path.join(root, "data/teams.json");

if (!fs.existsSync(csvPath)) {
  console.error("Missing data/scheduleImportTemplate.csv");
  process.exit(1);
}

const teams = readJson(teamsPath);
const teamIds = new Set(teams.map((team) => team.id));
const rows = parseCsv(fs.readFileSync(csvPath, "utf8")).filter((row) => row.matchNumber);

if (rows.length !== 72) {
  console.error(`Expected 72 group-stage schedule rows, found ${rows.length}.`);
  process.exit(1);
}

const matches = rows
  .map((row) => {
    const matchNumber = Number(row.matchNumber);
    assert(Number.isInteger(matchNumber) && matchNumber >= 1 && matchNumber <= 72, `Invalid matchNumber ${row.matchNumber}`);
    assert(teamIds.has(row.homeTeamId), `Unknown homeTeamId ${row.homeTeamId} for match ${matchNumber}`);
    assert(teamIds.has(row.awayTeamId), `Unknown awayTeamId ${row.awayTeamId} for match ${matchNumber}`);
    assert(row.homeTeamId !== row.awayTeamId, `Match ${matchNumber} has duplicate teams`);
    assert(row.date && row.localTime && row.timeZone, `Match ${matchNumber} needs date, localTime, and timeZone`);
    assert(row.venue && row.city, `Match ${matchNumber} needs venue and city`);
    assert(row.sourceLabel && row.sourceUrl, `Match ${matchNumber} needs sourceLabel and sourceUrl`);

    const kickoffUtc = zonedLocalToUtc(row.date, row.localTime, row.timeZone).toISOString();

    return {
      id: `m${String(matchNumber).padStart(3, "0")}`,
      date: kickoffUtc,
      stage: "group",
      group: row.group,
      venue: row.venue,
      city: row.city,
      venueStatus: "confirmed",
      homeTeamId: row.homeTeamId,
      awayTeamId: row.awayTeamId,
      status: "scheduled",
      homeScore: null,
      awayScore: null,
      kickoffUtc,
      kickoffStatus: "confirmed",
      dataStatus: "scheduled",
      sourceLabel: row.sourceLabel,
      sourceUrl: row.sourceUrl,
      lastVerifiedUtc: row.lastVerifiedUtc
    };
  })
  .sort((a, b) => a.id.localeCompare(b.id));

const seenPairs = new Set();
const countByTeam = new Map(teams.map((team) => [team.id, 0]));
for (const match of matches) {
  const pairKey = [match.homeTeamId, match.awayTeamId].sort().join(":");
  assert(!seenPairs.has(pairKey), `Duplicate fixture pair ${pairKey}`);
  seenPairs.add(pairKey);
  countByTeam.set(match.homeTeamId, countByTeam.get(match.homeTeamId) + 1);
  countByTeam.set(match.awayTeamId, countByTeam.get(match.awayTeamId) + 1);
}
for (const [teamId, count] of countByTeam) {
  assert(count === 3, `${teamId} has ${count} group matches, expected 3`);
}

writeJson(matchesPath, matches);

const meta = readJson(metaPath);
writeJson(metaPath, {
  ...meta,
  lastUpdatedUtc: "2026-06-01T00:00:00.000Z",
  dataSource: "Static verified FIFA World Cup 2026 group-stage schedule",
  updateMode: "manual-schedule-import",
  note: "Group-stage fixtures use the public FIFA World Cup 2026 match schedule PDF. Squads, lineups, and live stats remain pending until verified sources are imported."
});

console.log("Schedule import OK: 72 group-stage matches now have confirmed kickoffUtc, venue, city, and source fields.");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assert(condition, message) {
  if (!condition) {
    console.error(message);
    process.exit(1);
  }
}

function parseCsv(input) {
  const lines = input.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  const headers = splitCsvLine(lines.shift());
  return lines.map((line) => {
    const values = splitCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
  });
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
  return cells.map((value) => value.trim());
}

function zonedLocalToUtc(date, time, timeZone) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute);
  const offset = timezoneOffsetMs(new Date(utcGuess), timeZone);
  const firstPass = new Date(utcGuess - offset);
  const correctedOffset = timezoneOffsetMs(firstPass, timeZone);
  return new Date(utcGuess - correctedOffset);
}

function timezoneOffsetMs(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const asUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second)
  );
  return asUtc - date.getTime();
}
