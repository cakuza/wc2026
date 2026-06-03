import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const groupTeams = {
  A: [
    team("mexico", "Mexico", "MEX", "MX", "Concacaf", "America/Mexico_City", true, ["El Tri"]),
    team("south-africa", "South Africa", "RSA", "ZA", "CAF", "Africa/Johannesburg", false, ["Bafana Bafana"]),
    team("south-korea", "South Korea", "KOR", "KR", "AFC", "Asia/Seoul", false, ["Korea Republic", "Korea"]),
    team("czechia", "Czechia", "CZE", "CZ", "UEFA", "Europe/Prague", false, ["Czech Republic"])
  ],
  B: [
    team("canada", "Canada", "CAN", "CA", "Concacaf", "America/Toronto", true),
    team("bosnia-and-herzegovina", "Bosnia and Herzegovina", "BIH", "BA", "UEFA", "Europe/Sarajevo", false, ["Bosnia"]),
    team("qatar", "Qatar", "QAT", "QA", "AFC", "Asia/Qatar", false),
    team("switzerland", "Switzerland", "SUI", "CH", "UEFA", "Europe/Zurich", false)
  ],
  C: [
    team("brazil", "Brazil", "BRA", "BR", "CONMEBOL", "America/Sao_Paulo", true, ["Selecao"]),
    team("morocco", "Morocco", "MAR", "MA", "CAF", "Africa/Casablanca", true),
    team("haiti", "Haiti", "HAI", "HT", "Concacaf", "America/Port-au-Prince", false),
    team("scotland", "Scotland", "SCO", "GB", "UEFA", "Europe/London", true)
  ],
  D: [
    team("united-states", "United States", "USA", "US", "Concacaf", "America/New_York", true, ["USA", "USMNT", "United States of America"]),
    team("paraguay", "Paraguay", "PAR", "PY", "CONMEBOL", "America/Asuncion", false),
    team("australia", "Australia", "AUS", "AU", "AFC", "Australia/Sydney", false, ["Socceroos"]),
    team("turkey", "Turkey", "TUR", "TR", "UEFA", "Europe/Istanbul", true, ["T\u00fcrkiye", "Turkiye"])
  ],
  E: [
    team("germany", "Germany", "GER", "DE", "UEFA", "Europe/Berlin", true),
    team("curacao", "Cura\u00e7ao", "CUW", "CW", "Concacaf", "America/Curacao", false, ["Curacao"]),
    team("cote-divoire", "C\u00f4te d'Ivoire", "CIV", "CI", "CAF", "Africa/Abidjan", false, ["Cote d'Ivoire", "Ivory Coast"]),
    team("ecuador", "Ecuador", "ECU", "EC", "CONMEBOL", "America/Guayaquil", false)
  ],
  F: [
    team("netherlands", "Netherlands", "NED", "NL", "UEFA", "Europe/Amsterdam", true, ["Holland"]),
    team("japan", "Japan", "JPN", "JP", "AFC", "Asia/Tokyo", true),
    team("sweden", "Sweden", "SWE", "SE", "UEFA", "Europe/Stockholm", false),
    team("tunisia", "Tunisia", "TUN", "TN", "CAF", "Africa/Tunis", false)
  ],
  G: [
    team("belgium", "Belgium", "BEL", "BE", "UEFA", "Europe/Brussels", true),
    team("egypt", "Egypt", "EGY", "EG", "CAF", "Africa/Cairo", true),
    team("iran", "Iran", "IRN", "IR", "AFC", "Asia/Tehran", false),
    team("new-zealand", "New Zealand", "NZL", "NZ", "OFC", "Pacific/Auckland", false)
  ],
  H: [
    team("spain", "Spain", "ESP", "ES", "UEFA", "Europe/Madrid", true),
    team("cape-verde", "Cape Verde", "CPV", "CV", "CAF", "Atlantic/Cape_Verde", false, ["Cabo Verde"]),
    team("saudi-arabia", "Saudi Arabia", "KSA", "SA", "AFC", "Asia/Riyadh", false),
    team("uruguay", "Uruguay", "URU", "UY", "CONMEBOL", "America/Montevideo", true)
  ],
  I: [
    team("france", "France", "FRA", "FR", "UEFA", "Europe/Paris", true),
    team("iraq", "Iraq", "IRQ", "IQ", "AFC", "Asia/Baghdad", false),
    team("norway", "Norway", "NOR", "NO", "UEFA", "Europe/Oslo", false),
    team("senegal", "Senegal", "SEN", "SN", "CAF", "Africa/Dakar", true)
  ],
  J: [
    team("argentina", "Argentina", "ARG", "AR", "CONMEBOL", "America/Argentina/Buenos_Aires", true, ["Albiceleste"]),
    team("algeria", "Algeria", "ALG", "DZ", "CAF", "Africa/Algiers", false),
    team("austria", "Austria", "AUT", "AT", "UEFA", "Europe/Vienna", false),
    team("jordan", "Jordan", "JOR", "JO", "AFC", "Asia/Amman", false)
  ],
  K: [
    team("portugal", "Portugal", "POR", "PT", "UEFA", "Europe/Lisbon", true),
    team("uzbekistan", "Uzbekistan", "UZB", "UZ", "AFC", "Asia/Tashkent", false),
    team("colombia", "Colombia", "COL", "CO", "CONMEBOL", "America/Bogota", true),
    team("dr-congo", "DR Congo", "COD", "CD", "CAF", "Africa/Kinshasa", false, ["Congo DR", "Democratic Republic of the Congo"])
  ],
  L: [
    team("england", "England", "ENG", "GB", "UEFA", "Europe/London", true),
    team("croatia", "Croatia", "CRO", "HR", "UEFA", "Europe/Zagreb", true),
    team("ghana", "Ghana", "GHA", "GH", "CAF", "Africa/Accra", false),
    team("panama", "Panama", "PAN", "PA", "Concacaf", "America/Panama", false)
  ]
};

const colors = [
  ["#0b6b43", "#ffffff", "#c1272d"],
  ["#123c8c", "#ffffff", "#d71920"],
  ["#f2c94c", "#063d1f", "#ffffff"],
  ["#0b3b75", "#ffffff", "#d71920"],
  ["#101820", "#f2c94c", "#ffffff"],
  ["#c8102e", "#ffffff", "#0033a0"],
  ["#111827", "#f2c94c", "#e11d48"],
  ["#005bbb", "#ffffff", "#ef3340"]
];

const teams = Object.entries(groupTeams).flatMap(([group, rows]) =>
  rows.map((row, index) => {
    const palette = colors[(index + group.charCodeAt(0)) % colors.length];
    return {
      ...row,
      group,
      shortName: row.fifaCode,
      countryCode: row.fifaCode,
      coach: "TBD",
      primaryColor: palette[0],
      secondaryColor: palette[1],
      accentColor: palette[2],
      dataStatus: "sample",
      sourceLabel: "Pre-launch sample team slot"
    };
  })
);

const standings = teams.map((row, index) => ({
  teamId: row.id,
  group: row.group,
  rank: (index % 4) + 1,
  played: 0,
  won: 0,
  drawn: 0,
  lost: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
  points: 0,
  dataStatus: "preTournament",
  isPreTournament: true
}));

const fixtures = [];
const pairings = [
  [0, 1],
  [2, 3],
  [0, 2],
  [1, 3],
  [0, 3],
  [1, 2]
];
const start = Date.UTC(2026, 5, 11, 16, 0, 0);
const hours = [16, 19, 22, 1];

for (const [group, rows] of Object.entries(groupTeams)) {
  for (const pair of pairings) {
    const index = fixtures.length;
    const day = Math.floor(index / 4);
    const hour = hours[index % hours.length];
    const date = new Date(start + day * 24 * 60 * 60 * 1000);
    date.setUTCHours(hour, 0, 0, 0);
    const home = rows[pair[0]];
    const away = rows[pair[1]];
    fixtures.push({
      id: `m${String(index + 1).padStart(3, "0")}`,
      date: date.toISOString(),
      stage: "group",
      group,
      venue: "TBD",
      city: "TBD",
      venueStatus: "pending",
      homeTeamId: home.id,
      awayTeamId: away.id,
      status: "scheduled",
      homeScore: null,
      awayScore: null,
      kickoffUtc: null,
      kickoffStatus: "pending",
      dataStatus: "schedulePending",
      sourceLabel: "Generated group-stage fixture slot; official kickoff time and venue pending"
    });
  }
}

const squads = teams.map((row) => ({
  teamId: row.id,
  squadStatus: "pending",
  sourceLabel: "Squad pending",
  sourceUrl: "",
  lastCheckedUtc: "2026-06-01T00:00:00.000Z",
  note: "Squad data pending. Add official squad data to enable player cards. Create custom fan card in Fan Mode.",
  players: []
}));

const matchIntelligence = fixtures.slice(0, 12).map((match) => ({
  matchId: match.id,
  homeTeamId: match.homeTeamId,
  awayTeamId: match.awayTeamId,
  lastCheckedUtc: "2026-06-01T00:00:00.000Z",
  dataMode: "sample",
  confidence: "low",
  keyPlayerWatch: [],
  opponentSummary: "No opponent notes added yet. Manual news-watch data can be added before kickoff.",
  riskNotes: ["Create prediction card", "Create opponent watch card", "Set reminder, coming soon"],
  sourceLabels: ["Manual news-watch pending"]
}));

write("data/teams.json", teams);
write("data/standings.json", standings);
write("data/matches.json", fixtures);
write("data/squads.json", squads);
write("data/players.json", []);
write("data/playerStats.json", []);
write("data/matchIntelligence.json", matchIntelligence);
write("data/injuryWatch.json", []);
write("data/lineupWatch.json", []);
write("data/newsWatch.json", []);
write("data/talkingPoints.json", []);
write("data/meta.json", {
  lastUpdatedUtc: "2026-06-01T00:00:00.000Z",
  dataSource: "Static pre-launch sample data",
  updateMode: "manual-json",
  note: "Pre-launch sample data. The app has full 48-team structure, 12 groups, pending fixture slots, and no fake official squads."
});

function team(id, name, fifaCode, iso2, confederation, timezoneSuggestion, featured = false, aliases = []) {
  return {
    id,
    slug: id,
    name,
    fifaCode,
    flagEmoji: flag(iso2),
    confederation,
    timezoneSuggestion,
    featured,
    aliases: [name, fifaCode, ...aliases]
  };
}

function flag(iso2) {
  return iso2
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

function write(file, data) {
  fs.writeFileSync(path.join(root, file), `${JSON.stringify(data, null, 2)}\n`);
}
