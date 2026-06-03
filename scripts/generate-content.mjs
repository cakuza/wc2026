import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "content", "generated");
fs.mkdirSync(outDir, { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const teams = readJson("data/teams.json");
const matches = readJson("data/matches.json");
const players = readJson("data/players.json");
const stats = readJson("data/playerStats.json");
const standings = readJson("data/standings.json");
const meta = readJson("data/meta.json");

const teamById = new Map(teams.map((team) => [team.id, team]));
const playerById = new Map(players.map((player) => [player.id, player]));
const formatDate = (date) => new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Istanbul",
  timeZoneName: "short"
}).format(new Date(date));

function write(file, body) {
  fs.writeFileSync(path.join(outDir, file), `${body.trim()}\n`);
}

const matchRows = matches.slice(0, 8).map((match) => {
  const home = teamById.get(match.homeTeamId);
  const away = teamById.get(match.awayTeamId);
  return `- ${home?.name} vs ${away?.name} — ${formatDate(match.date)} at ${match.venue}`;
});

write("todays-matches.md", `
# Today's World Cup Matches

${meta.note}

${matchRows.join("\n")}

CTA: View the full local-time schedule on /matches and create a shareable card on /cards.
`);

const statRows = stats
  .map((row) => ({ ...row, player: playerById.get(row.playerId) }))
  .filter((row) => row.player)
  .sort((a, b) => b.goals - a.goals)
  .slice(0, 10)
  .map((row, index) => {
    const team = teamById.get(row.player.teamId);
    return `${index + 1}. ${row.player.name}, ${team?.name} — ${row.goals} goals`;
  });

write("top-scorers.md", `
# World Cup Top Scorers Update

${meta.note}

${statRows.join("\n")}

CTA: Create a top scorers card on /cards.
`);

const brazil = teams.find((team) => team.slug === "brazil") || teams[0];
const brazilMatches = matches
  .filter((match) => match.homeTeamId === brazil.id || match.awayTeamId === brazil.id)
  .map((match) => {
    const opponentId = match.homeTeamId === brazil.id ? match.awayTeamId : match.homeTeamId;
    const opponent = teamById.get(opponentId);
    return `- ${brazil.name} vs ${opponent?.name} — ${formatDate(match.date)}`;
  });

write("team-schedule-brazil.md", `
# ${brazil.name} World Cup Schedule

${meta.note}

${brazilMatches.join("\n") || "- Fixtures will be added when available."}

CTA: Share the team schedule page: /teams/${brazil.slug}-world-cup-schedule
`);

const groupA = standings
  .filter((row) => row.group === "A")
  .map((row) => {
    const team = teamById.get(row.teamId);
    return `- ${team?.name}: ${row.points} points, GD ${row.goalsFor - row.goalsAgainst}`;
  });

write("group-standings.md", `
# Group Standings Update

${meta.note}

${groupA.join("\n")}

CTA: View all standings on /standings or create a standings card on /cards.
`);

console.log(`Generated markdown content in ${path.relative(root, outDir)}.`);
