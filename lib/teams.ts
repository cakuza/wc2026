export type Team = {
  key: string; // i18n country key
  code: string; // flagcdn country code
  group: string; // group letter A-L
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  squadValue?: number; // total squad market value, € millions
  coach?: string;
  featuredPlayer?: string;
};

// 48 teams. Colours, squad value, coach and featured player ported from the wc2026-wine
// data/teams.json (42 teams); the 6 fill teams use hand-set national colours.
export const TEAMS: Team[] = [
  { key: "mexico", code: "mx", group: "A", primaryColor: "#006847", secondaryColor: "#ffffff", accentColor: "#d71920", squadValue: 194, coach: "TBD", featuredPlayer: "Santiago Giménez" },
  { key: "southAfrica", code: "za", group: "A", primaryColor: "#007749", secondaryColor: "#063d1f", accentColor: "#ffffff", squadValue: 45, coach: "TBD" },
  { key: "southKorea", code: "kr", group: "A", primaryColor: "#CD2E3A", secondaryColor: "#ffffff", accentColor: "#d71920", squadValue: 138, coach: "TBD", featuredPlayer: "Son Heung-min" },
  { key: "czechia", code: "cz", group: "A", primaryColor: "#D7141A", secondaryColor: "#f2c94c", accentColor: "#ffffff", squadValue: 188, coach: "TBD" },
  { key: "morocco", code: "ma", group: "B", primaryColor: "#C1272D", secondaryColor: "#f2c94c", accentColor: "#ffffff", squadValue: 490, coach: "TBD", featuredPlayer: "Achraf Hakimi" },
  { key: "canada", code: "ca", group: "B", primaryColor: "#D52B1E", secondaryColor: "#063d1f", accentColor: "#ffffff", squadValue: 198, coach: "TBD", featuredPlayer: "Alphonso Davies" },
  { key: "bosnia", code: "ba", group: "B", primaryColor: "#002F6C", secondaryColor: "#ffffff", accentColor: "#d71920", squadValue: 151, coach: "TBD" },
  { key: "switzerland", code: "ch", group: "B", primaryColor: "#D52B1E", secondaryColor: "#ffffff", accentColor: "#0033a0", squadValue: 333, coach: "TBD", featuredPlayer: "Granit Xhaka" },
  { key: "brazil", code: "br", group: "C", primaryColor: "#009C3B", secondaryColor: "#ffffff", accentColor: "#d71920", squadValue: 943, coach: "TBD", featuredPlayer: "Vinicius Jr" },
  { key: "uruguay", code: "uy", group: "C", primaryColor: "#5CBFEB", secondaryColor: "#ffffff", accentColor: "#d71920", squadValue: 392, coach: "TBD", featuredPlayer: "Federico Valverde" },
  { key: "colombia", code: "co", group: "C", primaryColor: "#FCD116", secondaryColor: "#ffffff", accentColor: "#0033a0", squadValue: 298, coach: "TBD", featuredPlayer: "James Rodríguez" },
  { key: "serbia", code: "rs", group: "C", primaryColor: "#C6363C", secondaryColor: "#ffffff", accentColor: "#1C3F95" },
  { key: "turkey", code: "tr", group: "D", primaryColor: "#E30A17", secondaryColor: "#ffffff", accentColor: "#ef3340", squadValue: 474, coach: "TBD", featuredPlayer: "Arda Güler" },
  { key: "unitedStates", code: "us", group: "D", primaryColor: "#002868", secondaryColor: "#f2c94c", accentColor: "#ffffff", squadValue: 386, coach: "TBD", featuredPlayer: "Christian Pulisic" },
  { key: "australia", code: "au", group: "D", primaryColor: "#FFCD00", secondaryColor: "#f2c94c", accentColor: "#e11d48", squadValue: 78, coach: "TBD", featuredPlayer: "Mathew Ryan" },
  { key: "paraguay", code: "py", group: "D", primaryColor: "#CE1126", secondaryColor: "#ffffff", accentColor: "#0033a0", squadValue: 154, coach: "TBD" },
  { key: "germany", code: "de", group: "E", primaryColor: "#000000", secondaryColor: "#ffffff", accentColor: "#0033a0", squadValue: 982, coach: "TBD", featuredPlayer: "Jamal Musiala" },
  { key: "curacao", code: "cw", group: "E", primaryColor: "#002B7F", secondaryColor: "#f2c94c", accentColor: "#e11d48", squadValue: 26, coach: "TBD" },
  { key: "belgium", code: "be", group: "E", primaryColor: "#E30613", secondaryColor: "#ffffff", accentColor: "#ef3340", squadValue: 551, coach: "TBD", featuredPlayer: "Kevin De Bruyne" },
  { key: "denmark", code: "dk", group: "E", primaryColor: "#C8102E", secondaryColor: "#ffffff", accentColor: "#C8102E" },
  { key: "netherlands", code: "nl", group: "F", primaryColor: "#FF6200", secondaryColor: "#f2c94c", accentColor: "#e11d48", squadValue: 814, coach: "TBD", featuredPlayer: "Cody Gakpo" },
  { key: "scotland", code: "gb-sct", group: "F", primaryColor: "#003478", secondaryColor: "#f2c94c", accentColor: "#e11d48", squadValue: 170, coach: "TBD" },
  { key: "norway", code: "no", group: "F", primaryColor: "#BA0C2F", secondaryColor: "#ffffff", accentColor: "#d71920", squadValue: 592, coach: "TBD", featuredPlayer: "Erling Haaland" },
  { key: "egypt", code: "eg", group: "F", primaryColor: "#CE1126", secondaryColor: "#ffffff", accentColor: "#c1272d", squadValue: 116, coach: "TBD", featuredPlayer: "Mohamed Salah" },
  { key: "japan", code: "jp", group: "G", primaryColor: "#BC002D", secondaryColor: "#ffffff", accentColor: "#ef3340", squadValue: 281, coach: "TBD", featuredPlayer: "Takefusa Kubo" },
  { key: "cameroon", code: "cm", group: "G", primaryColor: "#007A5E", secondaryColor: "#FCD116", accentColor: "#CE1126" },
  { key: "nigeria", code: "ng", group: "G", primaryColor: "#008751", secondaryColor: "#ffffff", accentColor: "#008751" },
  { key: "ecuador", code: "ec", group: "G", primaryColor: "#FFDD00", secondaryColor: "#ffffff", accentColor: "#c1272d", squadValue: 369, coach: "TBD", featuredPlayer: "Moisés Caicedo" },
  { key: "spain", code: "es", group: "H", primaryColor: "#AA151B", secondaryColor: "#ffffff", accentColor: "#c1272d", squadValue: 1220, coach: "TBD", featuredPlayer: "Lamine Yamal" },
  { key: "capeVerde", code: "cv", group: "H", primaryColor: "#003893", secondaryColor: "#ffffff", accentColor: "#d71920", squadValue: 56, coach: "TBD" },
  { key: "ivoryCoast", code: "ci", group: "H", primaryColor: "#FF8200", secondaryColor: "#ffffff", accentColor: "#ef3340", squadValue: 522, coach: "TBD" },
  { key: "iran", code: "ir", group: "H", primaryColor: "#239F40", secondaryColor: "#ffffff", accentColor: "#d71920", squadValue: 32, coach: "TBD", featuredPlayer: "Mehdi Taremi" },
  { key: "france", code: "fr", group: "I", primaryColor: "#002395", secondaryColor: "#ffffff", accentColor: "#d71920", squadValue: 1550, coach: "TBD", featuredPlayer: "Mbappé" },
  { key: "senegal", code: "sn", group: "I", primaryColor: "#00853F", secondaryColor: "#f2c94c", accentColor: "#ffffff", squadValue: 478, coach: "TBD", featuredPlayer: "Sadio Mané" },
  { key: "saudiArabia", code: "sa", group: "I", primaryColor: "#006C35", secondaryColor: "#063d1f", accentColor: "#ffffff", squadValue: 41, coach: "TBD", featuredPlayer: "Salem Al-Dawsari" },
  { key: "qatar", code: "qa", group: "I", primaryColor: "#8A1538", secondaryColor: "#f2c94c", accentColor: "#ffffff", squadValue: 20, coach: "TBD" },
  { key: "argentina", code: "ar", group: "J", primaryColor: "#74ACDF", secondaryColor: "#063d1f", accentColor: "#ffffff", squadValue: 800, coach: "TBD", featuredPlayer: "Messi" },
  { key: "algeria", code: "dz", group: "J", primaryColor: "#006233", secondaryColor: "#ffffff", accentColor: "#d71920", squadValue: 257, coach: "TBD", featuredPlayer: "Riyad Mahrez" },
  { key: "uzbekistan", code: "uz", group: "J", primaryColor: "#0099B5", secondaryColor: "#f2c94c", accentColor: "#ffffff", squadValue: 85, coach: "TBD" },
  { key: "newZealand", code: "nz", group: "J", primaryColor: "#1B1B1B", secondaryColor: "#063d1f", accentColor: "#ffffff", squadValue: 34, coach: "TBD" },
  { key: "portugal", code: "pt", group: "K", primaryColor: "#C8102E", secondaryColor: "#ffffff", accentColor: "#d71920", squadValue: 1010, coach: "TBD", featuredPlayer: "Cristiano Ronaldo" },
  { key: "drCongo", code: "cd", group: "K", primaryColor: "#007FFF", secondaryColor: "#f2c94c", accentColor: "#e11d48", squadValue: 144, coach: "TBD" },
  { key: "panama", code: "pa", group: "K", primaryColor: "#D21034", secondaryColor: "#ffffff", accentColor: "#ef3340", squadValue: 35, coach: "TBD" },
  { key: "jamaica", code: "jm", group: "K", primaryColor: "#009B3A", secondaryColor: "#FED100", accentColor: "#000000" },
  { key: "england", code: "gb-eng", group: "L", primaryColor: "#00247D", secondaryColor: "#f2c94c", accentColor: "#ffffff", squadValue: 1370, coach: "TBD", featuredPlayer: "Bellingham" },
  { key: "croatia", code: "hr", group: "L", primaryColor: "#E4002B", secondaryColor: "#ffffff", accentColor: "#0033a0", squadValue: 388, coach: "TBD", featuredPlayer: "Luka Modrić" },
  { key: "tunisia", code: "tn", group: "L", primaryColor: "#E70013", secondaryColor: "#ffffff", accentColor: "#d71920", squadValue: 70, coach: "TBD" },
  { key: "ukraine", code: "ua", group: "L", primaryColor: "#005BBB", secondaryColor: "#FFD500", accentColor: "#FFD500" }
];

export const GROUP_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export function teamsInGroup(letter: string): Team[] {
  return TEAMS.filter((t) => t.group === letter);
}

export function teamByKey(key: string): Team | undefined {
  return TEAMS.find((t) => t.key === key);
}

// camelCase i18n key -> kebab-case URL slug (e.g. "unitedStates" -> "united-states").
export function slugFor(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

export function teamBySlug(slug: string): Team | undefined {
  return TEAMS.find((t) => slugFor(t.key) === slug);
}

export const STRIP_GROUPS = ["A", "B", "D", "E"];
