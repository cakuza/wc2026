import { readFileSync, writeFileSync } from "node:fs";

// Correct national / primary kit colors per team id.
const COLORS = {
  mexico: "#006847",
  "south-africa": "#007749",
  "south-korea": "#CD2E3A",
  czechia: "#D7141A",
  canada: "#D52B1E",
  "bosnia-and-herzegovina": "#002F6C",
  qatar: "#8A1538",
  switzerland: "#D52B1E",
  brazil: "#009C3B",
  morocco: "#C1272D",
  haiti: "#00209F",
  scotland: "#003478",
  "united-states": "#002868",
  paraguay: "#CE1126",
  australia: "#FFCD00",
  turkey: "#E30A17",
  germany: "#000000",
  curacao: "#002B7F",
  "cote-divoire": "#FF8200",
  ecuador: "#FFDD00",
  netherlands: "#FF6200",
  japan: "#BC002D",
  sweden: "#FFCD00",
  tunisia: "#E70013",
  belgium: "#E30613",
  egypt: "#CE1126",
  iran: "#239F40",
  "new-zealand": "#1B1B1B",
  spain: "#AA151B",
  "cape-verde": "#003893",
  "saudi-arabia": "#006C35",
  uruguay: "#5CBFEB",
  france: "#002395",
  iraq: "#007A3D",
  norway: "#BA0C2F",
  senegal: "#00853F",
  argentina: "#74ACDF",
  algeria: "#006233",
  austria: "#ED2939",
  jordan: "#CE1126",
  portugal: "#C8102E",
  uzbekistan: "#0099B5",
  colombia: "#FCD116",
  "dr-congo": "#007FFF",
  england: "#00247D",
  croatia: "#E4002B",
  ghana: "#006B3F",
  panama: "#D21034"
};

const path = new URL("../data/teams.json", import.meta.url);
const teams = JSON.parse(readFileSync(path, "utf8"));

const missing = [];
for (const team of teams) {
  const color = COLORS[team.id];
  if (!color) {
    missing.push(team.id);
    continue;
  }
  team.primaryColor = color;
}

if (missing.length) {
  console.error("No color provided for:", missing.join(", "));
  process.exit(1);
}

writeFileSync(path, JSON.stringify(teams, null, 2) + "\n");
console.log(`Updated primaryColor for ${teams.length} teams.`);
