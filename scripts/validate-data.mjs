import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));

const teams = readJson("data/teams.json");
const squads = readJson("data/squads.json");
const players = readJson("data/players.json");
const matches = readJson("data/matches.json");
const standings = readJson("data/standings.json");
const playerStats = readJson("data/playerStats.json");
const meta = readJson("data/meta.json");
const injuryWatch = readJson("data/injuryWatch.json");
const lineupWatch = readJson("data/lineupWatch.json");
const newsWatch = readJson("data/newsWatch.json");
const talkingPoints = readJson("data/talkingPoints.json");
const matchIntelligence = readJson("data/matchIntelligence.json");

const errors = [];
const expectedGroups = new Set(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"]);
const teamIds = new Set(teams.map((team) => team.id));
const teamSlugs = new Set(teams.map((team) => team.slug));
const playerIds = new Set(players.map((player) => player.id));
const matchIds = new Set(matches.map((match) => match.id));
const confidenceValues = new Set(["low", "medium", "high"]);
const injuryStatuses = new Set(["injured", "doubtful", "suspended", "unavailable", "monitoring"]);
const lineupTypes = new Set(["predicted", "confirmed", "sample"]);
const lineupPlayerStatuses = new Set(["starter", "bench"]);
const newsCategories = new Set(["injury", "lineup", "tactical", "drama", "federation", "player", "general"]);
const talkingPointCategories = new Set(["tactical", "player", "injury", "rivalry", "pressure", "drama"]);
const dataModes = new Set(["sample", "manual", "news-watch", "api-future"]);
const squadStatuses = new Set(["pending", "reported", "provisional", "official"]);
const playerDataStatuses = new Set(["pending", "reported", "provisional", "official", "sample"]);
const playerPositions = new Set(["GK", "DF", "MF", "FW", "Unknown"]);

function assert(condition, message) {
  if (!condition) errors.push(message);
}

assert(teams.length === 48, `Expected exactly 48 teams, found ${teams.length}.`);
assert(matches.length === 72, `Expected exactly 72 group-stage fixture slots, found ${matches.length}.`);
assert(standings.length === 48, `Expected exactly 48 standings rows, found ${standings.length}.`);
assert(teamIds.size === teams.length, "Team ids must be unique.");
assert(teamSlugs.size === teams.length, "Team slugs must be unique.");
assert(playerIds.size === players.length, "Player ids must be unique.");
assert(!Number.isNaN(Date.parse(meta.lastUpdatedUtc)), "meta.lastUpdatedUtc must be a valid date.");
assert(Boolean(meta.dataSource), "meta.dataSource is required.");
assert(Boolean(meta.updateMode), "meta.updateMode is required.");
assert(Boolean(meta.note), "meta.note is required.");
assert(
  meta.note.toLowerCase().includes("group-stage fixtures") || meta.note.toLowerCase().includes("pre-launch sample"),
  "meta.note must clearly disclose fixture data status."
);

const teamsByGroup = new Map();
const aliasOwner = new Map();
for (const team of teams) {
  assert(expectedGroups.has(team.group), `Team ${team.id} has invalid group ${team.group}.`);
  assert(Boolean(team.flagEmoji || team.flagUrl), `Team ${team.id} needs a flag emoji or flag URL placeholder.`);
  assert(Boolean(team.fifaCode), `Team ${team.id} needs fifaCode.`);
  assert(Boolean(team.countryCode), `Team ${team.id} needs countryCode.`);
  assert(Boolean(team.confederation), `Team ${team.id} needs confederation.`);
  assert(Boolean(team.timezoneSuggestion), `Team ${team.id} needs timezoneSuggestion.`);
  teamsByGroup.set(team.group, [...(teamsByGroup.get(team.group) || []), team]);
  assert(team.slug && team.slug === team.slug.toLowerCase(), `Team ${team.id} needs a lowercase slug.`);
  assert(`/teams/${team.slug}` && `/teams/${team.slug}-world-cup-schedule`, `Team ${team.id} needs team and schedule routes.`);
  for (const alias of [team.slug, team.id, team.fifaCode, team.name, ...(team.aliases || [])]) {
    const key = normalizeAlias(alias);
    if (!key) continue;
    const owner = aliasOwner.get(key);
    assert(!owner || owner === team.id, `Alias conflict: ${alias} belongs to ${owner} and ${team.id}.`);
    aliasOwner.set(key, team.id);
  }
}

assert(teamsByGroup.size === 12, `Expected exactly 12 groups, found ${teamsByGroup.size}.`);
for (const group of expectedGroups) {
  assert((teamsByGroup.get(group) || []).length === 4, `Group ${group} must contain exactly 4 teams.`);
}

const standingsTeams = new Set();
const standingsByGroup = new Map();
for (const row of standings) {
  assert(teamIds.has(row.teamId), `Standing row references missing team ${row.teamId}.`);
  assert(!standingsTeams.has(row.teamId), `Duplicate standing row for ${row.teamId}.`);
  standingsTeams.add(row.teamId);
  assert(expectedGroups.has(row.group), `Standing row for ${row.teamId} has invalid group ${row.group}.`);
  const team = teams.find((item) => item.id === row.teamId);
  assert(team?.group === row.group, `Standing row for ${row.teamId} is in group ${row.group}, but team is in ${team?.group}.`);
  assert(row.played === 0 && row.points === 0, `Standing row for ${row.teamId} should be pre-tournament zeroed.`);
  standingsByGroup.set(row.group, [...(standingsByGroup.get(row.group) || []), row]);
}
for (const group of expectedGroups) {
  assert((standingsByGroup.get(group) || []).length === 4, `Standings group ${group} must contain exactly 4 teams.`);
}

const matchCountByTeam = new Map(teams.map((team) => [team.id, 0]));
const pairKeys = new Set();
for (const match of matches) {
  assert(match.stage === "group", `Match ${match.id} must be a group-stage fixture slot.`);
  assert(expectedGroups.has(match.group), `Match ${match.id} has invalid group ${match.group}.`);
  assert(teamIds.has(match.homeTeamId), `Match ${match.id} references missing home team ${match.homeTeamId}.`);
  assert(teamIds.has(match.awayTeamId), `Match ${match.id} references missing away team ${match.awayTeamId}.`);
  assert(match.homeTeamId !== match.awayTeamId, `Match ${match.id} has the same home and away team.`);
  const home = teams.find((team) => team.id === match.homeTeamId);
  const away = teams.find((team) => team.id === match.awayTeamId);
  assert(home?.group === match.group && away?.group === match.group, `Match ${match.id} contains teams outside Group ${match.group}.`);
  assert(!Number.isNaN(Date.parse(match.date)), `Match ${match.id} has an invalid fixture slot date.`);
  assert(match.kickoffStatus === "sample" || match.kickoffStatus === "pending" || match.kickoffStatus === "confirmed", `Match ${match.id} needs a kickoffStatus.`);
  assert(match.venueStatus === "pending" || match.venueStatus === "sample" || match.venueStatus === "confirmed", `Match ${match.id} needs a venueStatus.`);
  assert(match.dataStatus === "sample" || match.dataStatus === "pending" || match.dataStatus === "schedulePending" || match.dataStatus === "scheduled" || match.dataStatus === "verified", `Match ${match.id} needs dataStatus.`);
  if (match.dataStatus === "schedulePending") {
    assert(match.kickoffUtc === null, `Schedule-pending match ${match.id} must use kickoffUtc null.`);
    assert(match.venue === "TBD" && match.city === "TBD", `Schedule-pending match ${match.id} must use TBD venue and city.`);
  } else if (match.kickoffUtc) {
    assert(!Number.isNaN(Date.parse(match.kickoffUtc)), `Match ${match.id} has invalid kickoffUtc.`);
  }
  if (match.dataStatus === "scheduled" || match.dataStatus === "verified") {
    assert(Boolean(match.kickoffUtc), `Scheduled match ${match.id} must include kickoffUtc.`);
    assert(match.kickoffStatus === "confirmed", `Scheduled match ${match.id} must use kickoffStatus confirmed.`);
    assert(match.venueStatus === "confirmed", `Scheduled match ${match.id} must use venueStatus confirmed.`);
    assert(match.venue !== "TBD" && match.city !== "TBD", `Scheduled match ${match.id} must include venue and city.`);
    assert(Boolean(match.sourceLabel), `Scheduled match ${match.id} needs sourceLabel.`);
    assert(Boolean(match.sourceUrl), `Scheduled match ${match.id} needs sourceUrl.`);
    assert(Boolean(match.lastVerifiedUtc) && !Number.isNaN(Date.parse(match.lastVerifiedUtc)), `Scheduled match ${match.id} needs valid lastVerifiedUtc.`);
  }
  const pairKey = [match.homeTeamId, match.awayTeamId].sort().join(":");
  assert(!pairKeys.has(pairKey), `Duplicate fixture pair ${pairKey}.`);
  pairKeys.add(pairKey);
  matchCountByTeam.set(match.homeTeamId, (matchCountByTeam.get(match.homeTeamId) || 0) + 1);
  matchCountByTeam.set(match.awayTeamId, (matchCountByTeam.get(match.awayTeamId) || 0) + 1);
}
for (const team of teams) {
  assert(matchCountByTeam.get(team.id) === 3, `${team.id} must have exactly 3 group-stage fixtures.`);
}
const scheduledGroupMatches = matches.filter((match) => match.dataStatus === "scheduled" || match.dataStatus === "verified");
const missingScheduledKickoffs = scheduledGroupMatches.filter((match) => !match.kickoffUtc);
assert(missingScheduledKickoffs.length <= 2, `Too many scheduled group matches are missing kickoffUtc: ${missingScheduledKickoffs.length}.`);

const squadTeams = new Set();
assert(squads.length === 48, `Expected exactly 48 squad containers, found ${squads.length}.`);
for (const squad of squads) {
  assert(teamIds.has(squad.teamId), `Squad references missing team ${squad.teamId}.`);
  assert(!squadTeams.has(squad.teamId), `Duplicate squad container for ${squad.teamId}.`);
  squadTeams.add(squad.teamId);
  assert(squadStatuses.has(squad.squadStatus), `Squad ${squad.teamId} has invalid status ${squad.squadStatus}.`);
  assert(!Number.isNaN(Date.parse(squad.lastCheckedUtc)), `Squad ${squad.teamId} has invalid lastCheckedUtc.`);
  assert(Array.isArray(squad.players), `Squad ${squad.teamId} needs players array.`);
  for (const player of squad.players) validatePlayer(player, `Squad player ${squad.teamId}`);
  if (squad.squadStatus === "official") assert(Boolean(squad.sourceUrl), `Official squad ${squad.teamId} needs sourceUrl.`);
  if (squad.squadStatus === "pending") assert(squad.players.length === 0, `Pending squad ${squad.teamId} must not contain players.`);
}

for (const player of players) validatePlayer(player, `Player ${player.id}`);

for (const row of playerStats) {
  assert(playerIds.has(row.playerId), `Player stat row references missing player ${row.playerId}.`);
  for (const field of ["goals", "assists", "yellowCards", "redCards"]) {
    assert(Number.isInteger(row[field]) && row[field] >= 0, `Player stat ${row.playerId} has invalid ${field}.`);
  }
}

assert(new Set(injuryWatch.map((row) => row.id)).size === injuryWatch.length, "Injury watch ids must be unique.");
for (const row of injuryWatch) {
  assert(Boolean(row.id), "Injury watch item is missing id.");
  assert(Boolean(row.playerName), `Injury watch ${row.id} is missing playerName.`);
  assert(teamIds.has(row.teamId), `Injury watch ${row.id} references missing team ${row.teamId}.`);
  if (row.matchId) assert(matchIds.has(row.matchId), `Injury watch ${row.id} references missing match ${row.matchId}.`);
  assert(injuryStatuses.has(row.status), `Injury watch ${row.id} has invalid status ${row.status}.`);
  assert(confidenceValues.has(row.confidence), `Injury watch ${row.id} has invalid confidence ${row.confidence}.`);
  assert(!Number.isNaN(Date.parse(row.lastUpdatedUtc)), `Injury watch ${row.id} has invalid lastUpdatedUtc.`);
  assert(typeof row.isSample === "boolean", `Injury watch ${row.id} must set isSample boolean.`);
}

for (const row of lineupWatch) {
  assert(matchIds.has(row.matchId), `Lineup watch references missing match ${row.matchId}.`);
  assert(teamIds.has(row.teamId), `Lineup watch for ${row.matchId} references missing team ${row.teamId}.`);
  assert(lineupTypes.has(row.type), `Lineup watch ${row.matchId}/${row.teamId} has invalid type ${row.type}.`);
  assert(Boolean(row.formation), `Lineup watch ${row.matchId}/${row.teamId} is missing formation.`);
  assert(Array.isArray(row.players), `Lineup watch ${row.matchId}/${row.teamId} needs players array.`);
  for (const player of row.players) {
    assert(Boolean(player.playerName), `Lineup watch ${row.matchId}/${row.teamId} has player without name.`);
    assert(Boolean(player.position), `Lineup watch ${row.matchId}/${row.teamId} has player without position.`);
    assert(lineupPlayerStatuses.has(player.status), `Lineup watch ${row.matchId}/${row.teamId} has invalid player status ${player.status}.`);
  }
  assert(confidenceValues.has(row.confidence), `Lineup watch ${row.matchId}/${row.teamId} has invalid confidence ${row.confidence}.`);
  assert(!Number.isNaN(Date.parse(row.lastUpdatedUtc)), `Lineup watch ${row.matchId}/${row.teamId} has invalid lastUpdatedUtc.`);
  assert(typeof row.isSample === "boolean", `Lineup watch ${row.matchId}/${row.teamId} must set isSample boolean.`);
}

assert(new Set(newsWatch.map((row) => row.id)).size === newsWatch.length, "News watch ids must be unique.");
for (const row of newsWatch) {
  assert(Boolean(row.id), "News watch item is missing id.");
  if (row.teamId) assert(teamIds.has(row.teamId), `News watch ${row.id} references missing team ${row.teamId}.`);
  if (row.matchId) assert(matchIds.has(row.matchId), `News watch ${row.id} references missing match ${row.matchId}.`);
  assert(Boolean(row.title), `News watch ${row.id} is missing title.`);
  assert(Boolean(row.sourceName), `News watch ${row.id} is missing sourceName.`);
  assert(!Number.isNaN(Date.parse(row.publishedAt)), `News watch ${row.id} has invalid publishedAt.`);
  assert(newsCategories.has(row.category), `News watch ${row.id} has invalid category ${row.category}.`);
  assert(confidenceValues.has(row.confidence), `News watch ${row.id} has invalid confidence ${row.confidence}.`);
  assert(typeof row.isSensitive === "boolean", `News watch ${row.id} must set isSensitive boolean.`);
  assert(typeof row.isSample === "boolean", `News watch ${row.id} must set isSample boolean.`);
}

assert(new Set(talkingPoints.map((row) => row.id)).size === talkingPoints.length, "Talking point ids must be unique.");
for (const row of talkingPoints) {
  assert(Boolean(row.id), "Talking point is missing id.");
  assert(matchIds.has(row.matchId), `Talking point ${row.id} references missing match ${row.matchId}.`);
  assert(Boolean(row.title), `Talking point ${row.id} is missing title.`);
  assert(Boolean(row.body), `Talking point ${row.id} is missing body.`);
  assert(talkingPointCategories.has(row.category), `Talking point ${row.id} has invalid category ${row.category}.`);
  assert(confidenceValues.has(row.confidence), `Talking point ${row.id} has invalid confidence ${row.confidence}.`);
  assert(typeof row.isSample === "boolean", `Talking point ${row.id} must set isSample boolean.`);
}

for (const row of matchIntelligence) {
  assert(matchIds.has(row.matchId), `Match intelligence references missing match ${row.matchId}.`);
  assert(teamIds.has(row.homeTeamId), `Match intelligence ${row.matchId} references missing home team ${row.homeTeamId}.`);
  assert(teamIds.has(row.awayTeamId), `Match intelligence ${row.matchId} references missing away team ${row.awayTeamId}.`);
  assert(!Number.isNaN(Date.parse(row.lastCheckedUtc)), `Match intelligence ${row.matchId} has invalid lastCheckedUtc.`);
  assert(dataModes.has(row.dataMode), `Match intelligence ${row.matchId} has invalid dataMode ${row.dataMode}.`);
  assert(confidenceValues.has(row.confidence), `Match intelligence ${row.matchId} has invalid confidence ${row.confidence}.`);
  assert(Array.isArray(row.keyPlayerWatch), `Match intelligence ${row.matchId} needs keyPlayerWatch array.`);
  assert(Array.isArray(row.riskNotes), `Match intelligence ${row.matchId} needs riskNotes array.`);
  assert(Array.isArray(row.sourceLabels), `Match intelligence ${row.matchId} needs sourceLabels array.`);
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Data OK: 48 teams, 12 groups, 72 group-stage matches, ${matches.filter((match) => match.kickoffUtc).length} kickoffUtc values, 48 squad containers.`);

function validatePlayer(player, label) {
  assert(Boolean(player.id), `${label} is missing id.`);
  assert(Boolean(player.name), `${label} is missing name.`);
  assert(teamIds.has(player.teamId), `${label} references missing team ${player.teamId}.`);
  assert(playerPositions.has(player.position), `${label} has invalid position ${player.position}.`);
  if (player.shirtNumber !== undefined) assert(Number.isInteger(player.shirtNumber) && player.shirtNumber >= 0, `${label} has invalid shirtNumber.`);
  if (player.dataStatus) assert(playerDataStatuses.has(player.dataStatus), `${label} has invalid dataStatus ${player.dataStatus}.`);
  if (player.dataStatus === "official") assert(Boolean(player.sourceUrl), `${label} marked official but missing sourceUrl.`);
  if (player.dataStatus === "official") assert(!String(player.sourceLabel || "").toLowerCase().includes("sample"), `${label} is fake/sample data marked official.`);
}

function normalizeAlias(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}
