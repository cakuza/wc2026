import { readFileSync, writeFileSync } from "node:fs";

// Key player per team (display name). Teams not listed fall back to the team name
// as a "team watch" card in the UI.
const PLAYERS = {
  turkey: "Arda Güler",
  brazil: "Vinicius Jr",
  france: "Mbappé",
  argentina: "Messi",
  england: "Bellingham",
  mexico: "Santiago Giménez",
  japan: "Takefusa Kubo",
  morocco: "Achraf Hakimi",
  portugal: "Cristiano Ronaldo",
  germany: "Jamal Musiala",
  spain: "Lamine Yamal",
  netherlands: "Cody Gakpo",
  "united-states": "Christian Pulisic",
  croatia: "Luka Modrić",
  belgium: "Kevin De Bruyne",
  uruguay: "Federico Valverde",
  colombia: "James Rodríguez",
  norway: "Erling Haaland",
  senegal: "Sadio Mané",
  egypt: "Mohamed Salah",
  switzerland: "Granit Xhaka",
  austria: "David Alaba",
  ecuador: "Moisés Caicedo",
  canada: "Alphonso Davies",
  "south-korea": "Son Heung-min",
  iran: "Mehdi Taremi",
  ghana: "Mohammed Kudus",
  algeria: "Riyad Mahrez",
  "saudi-arabia": "Salem Al-Dawsari",
  australia: "Mathew Ryan"
};

const path = new URL("../data/teams.json", import.meta.url);
const teams = JSON.parse(readFileSync(path, "utf8"));

let count = 0;
for (const team of teams) {
  const player = PLAYERS[team.id];
  if (player) {
    team.featuredPlayer = player;
    count += 1;
  }
}

writeFileSync(path, JSON.stringify(teams, null, 2) + "\n");
console.log(`Added featuredPlayer to ${count}/${teams.length} teams.`);
