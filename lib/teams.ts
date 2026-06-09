export type Team = {
  key: string; // i18n country key
  code: string; // flagcdn country code
  group: string; // group letter A-L
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  squadValue?: number; // estimated total squad value, EUR millions
  coach?: string;
  featuredPlayer?: string;
};

export const GROUP_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"] as const;
export type GroupLetter = (typeof GROUP_LETTERS)[number];

// Canonical World Cup 2026 group source. Public team lists, group pages, team
// routes and sitemap entries derive from this ordering.
export const GROUPS: Record<GroupLetter, string[]> = {
  A: ["mexico", "southAfrica", "southKorea", "czechia"],
  B: ["canada", "bosnia", "qatar", "switzerland"],
  C: ["brazil", "morocco", "haiti", "scotland"],
  D: ["unitedStates", "paraguay", "australia", "turkey"],
  E: ["germany", "curacao", "ivoryCoast", "ecuador"],
  F: ["netherlands", "japan", "sweden", "tunisia"],
  G: ["belgium", "egypt", "iran", "newZealand"],
  H: ["spain", "capeVerde", "saudiArabia", "uruguay"],
  I: ["france", "senegal", "iraq", "norway"],
  J: ["argentina", "algeria", "austria", "jordan"],
  K: ["portugal", "drCongo", "uzbekistan", "colombia"],
  L: ["england", "croatia", "ghana", "panama"],
};

const TEAM_META: Record<string, Omit<Team, "key" | "group">> = {
  mexico: { code: "mx", primaryColor: "#006847", secondaryColor: "#ffffff", accentColor: "#d71920", squadValue: 194, coach: "TBD", featuredPlayer: "Santiago Gimenez" },
  southAfrica: { code: "za", primaryColor: "#007749", secondaryColor: "#063d1f", accentColor: "#ffffff", squadValue: 45, coach: "TBD" },
  southKorea: { code: "kr", primaryColor: "#CD2E3A", secondaryColor: "#ffffff", accentColor: "#d71920", squadValue: 138, coach: "TBD", featuredPlayer: "Son Heung-min" },
  czechia: { code: "cz", primaryColor: "#D7141A", secondaryColor: "#f2c94c", accentColor: "#ffffff", squadValue: 188, coach: "TBD" },
  canada: { code: "ca", primaryColor: "#D52B1E", secondaryColor: "#063d1f", accentColor: "#ffffff", squadValue: 198, coach: "TBD", featuredPlayer: "Alphonso Davies" },
  bosnia: { code: "ba", primaryColor: "#002F6C", secondaryColor: "#ffffff", accentColor: "#d71920", squadValue: 151, coach: "TBD" },
  qatar: { code: "qa", primaryColor: "#8A1538", secondaryColor: "#ffffff", accentColor: "#f2c94c", squadValue: 20, coach: "TBD" },
  switzerland: { code: "ch", primaryColor: "#D52B1E", secondaryColor: "#ffffff", accentColor: "#0033a0", squadValue: 333, coach: "TBD", featuredPlayer: "Granit Xhaka" },
  brazil: { code: "br", primaryColor: "#009C3B", secondaryColor: "#ffffff", accentColor: "#f2c94c", squadValue: 943, coach: "TBD", featuredPlayer: "Vinicius Jr" },
  morocco: { code: "ma", primaryColor: "#C1272D", secondaryColor: "#f2c94c", accentColor: "#ffffff", squadValue: 490, coach: "TBD", featuredPlayer: "Achraf Hakimi" },
  haiti: { code: "ht", primaryColor: "#00209F", secondaryColor: "#ffffff", accentColor: "#D21034", coach: "TBD" },
  scotland: { code: "gb-sct", primaryColor: "#003478", secondaryColor: "#f2c94c", accentColor: "#ffffff", squadValue: 170, coach: "TBD" },
  unitedStates: { code: "us", primaryColor: "#002868", secondaryColor: "#ffffff", accentColor: "#BF0A30", squadValue: 386, coach: "TBD", featuredPlayer: "Christian Pulisic" },
  paraguay: { code: "py", primaryColor: "#CE1126", secondaryColor: "#ffffff", accentColor: "#0033a0", squadValue: 154, coach: "TBD" },
  australia: { code: "au", primaryColor: "#FFCD00", secondaryColor: "#063d1f", accentColor: "#00843D", squadValue: 78, coach: "TBD", featuredPlayer: "Mathew Ryan" },
  turkey: { code: "tr", primaryColor: "#E30A17", secondaryColor: "#ffffff", accentColor: "#ef3340", squadValue: 474, coach: "TBD", featuredPlayer: "Arda Guler" },
  germany: { code: "de", primaryColor: "#000000", secondaryColor: "#ffffff", accentColor: "#DD0000", squadValue: 982, coach: "TBD", featuredPlayer: "Jamal Musiala" },
  curacao: { code: "cw", primaryColor: "#002B7F", secondaryColor: "#f2c94c", accentColor: "#e11d48", squadValue: 26, coach: "TBD" },
  ivoryCoast: { code: "ci", primaryColor: "#FF8200", secondaryColor: "#ffffff", accentColor: "#009A44", squadValue: 522, coach: "TBD" },
  ecuador: { code: "ec", primaryColor: "#FFDD00", secondaryColor: "#ffffff", accentColor: "#c1272d", squadValue: 369, coach: "TBD", featuredPlayer: "Moises Caicedo" },
  netherlands: { code: "nl", primaryColor: "#FF6200", secondaryColor: "#ffffff", accentColor: "#21468B", squadValue: 814, coach: "TBD", featuredPlayer: "Cody Gakpo" },
  japan: { code: "jp", primaryColor: "#BC002D", secondaryColor: "#ffffff", accentColor: "#ef3340", squadValue: 281, coach: "TBD", featuredPlayer: "Takefusa Kubo" },
  sweden: { code: "se", primaryColor: "#006AA7", secondaryColor: "#FECC00", accentColor: "#ffffff", coach: "TBD" },
  tunisia: { code: "tn", primaryColor: "#E70013", secondaryColor: "#ffffff", accentColor: "#d71920", squadValue: 70, coach: "TBD" },
  belgium: { code: "be", primaryColor: "#E30613", secondaryColor: "#ffffff", accentColor: "#f2c94c", squadValue: 551, coach: "TBD", featuredPlayer: "Kevin De Bruyne" },
  egypt: { code: "eg", primaryColor: "#CE1126", secondaryColor: "#ffffff", accentColor: "#c1272d", squadValue: 116, coach: "TBD", featuredPlayer: "Mohamed Salah" },
  iran: { code: "ir", primaryColor: "#239F40", secondaryColor: "#ffffff", accentColor: "#d71920", squadValue: 32, coach: "TBD", featuredPlayer: "Mehdi Taremi" },
  newZealand: { code: "nz", primaryColor: "#1B1B1B", secondaryColor: "#ffffff", accentColor: "#C8102E", squadValue: 34, coach: "TBD" },
  spain: { code: "es", primaryColor: "#AA151B", secondaryColor: "#ffffff", accentColor: "#f2c94c", squadValue: 1220, coach: "TBD", featuredPlayer: "Lamine Yamal" },
  capeVerde: { code: "cv", primaryColor: "#003893", secondaryColor: "#ffffff", accentColor: "#d71920", squadValue: 56, coach: "TBD" },
  saudiArabia: { code: "sa", primaryColor: "#006C35", secondaryColor: "#063d1f", accentColor: "#ffffff", squadValue: 41, coach: "TBD", featuredPlayer: "Salem Al-Dawsari" },
  uruguay: { code: "uy", primaryColor: "#5CBFEB", secondaryColor: "#ffffff", accentColor: "#d71920", squadValue: 392, coach: "TBD", featuredPlayer: "Federico Valverde" },
  france: { code: "fr", primaryColor: "#002395", secondaryColor: "#ffffff", accentColor: "#d71920", squadValue: 1550, coach: "TBD", featuredPlayer: "Mbappe" },
  senegal: { code: "sn", primaryColor: "#00853F", secondaryColor: "#f2c94c", accentColor: "#ffffff", squadValue: 478, coach: "TBD", featuredPlayer: "Sadio Mane" },
  iraq: { code: "iq", primaryColor: "#CE1126", secondaryColor: "#ffffff", accentColor: "#007A3D", coach: "TBD" },
  norway: { code: "no", primaryColor: "#BA0C2F", secondaryColor: "#ffffff", accentColor: "#00205B", squadValue: 592, coach: "TBD", featuredPlayer: "Erling Haaland" },
  argentina: { code: "ar", primaryColor: "#74ACDF", secondaryColor: "#ffffff", accentColor: "#F6B40E", squadValue: 800, coach: "TBD", featuredPlayer: "Messi" },
  algeria: { code: "dz", primaryColor: "#006233", secondaryColor: "#ffffff", accentColor: "#d71920", squadValue: 257, coach: "TBD", featuredPlayer: "Riyad Mahrez" },
  austria: { code: "at", primaryColor: "#ED2939", secondaryColor: "#ffffff", accentColor: "#C8102E", coach: "TBD" },
  jordan: { code: "jo", primaryColor: "#007A3D", secondaryColor: "#ffffff", accentColor: "#CE1126", coach: "TBD" },
  portugal: { code: "pt", primaryColor: "#C8102E", secondaryColor: "#ffffff", accentColor: "#d71920", squadValue: 1010, coach: "TBD", featuredPlayer: "Cristiano Ronaldo" },
  drCongo: { code: "cd", primaryColor: "#007FFF", secondaryColor: "#f2c94c", accentColor: "#e11d48", squadValue: 144, coach: "TBD" },
  uzbekistan: { code: "uz", primaryColor: "#0099B5", secondaryColor: "#f2c94c", accentColor: "#ffffff", squadValue: 85, coach: "TBD" },
  colombia: { code: "co", primaryColor: "#FCD116", secondaryColor: "#ffffff", accentColor: "#0033a0", squadValue: 298, coach: "TBD", featuredPlayer: "James Rodriguez" },
  england: { code: "gb-eng", primaryColor: "#00247D", secondaryColor: "#ffffff", accentColor: "#C8102E", squadValue: 1370, coach: "TBD", featuredPlayer: "Bellingham" },
  croatia: { code: "hr", primaryColor: "#E4002B", secondaryColor: "#ffffff", accentColor: "#0033a0", squadValue: 388, coach: "TBD", featuredPlayer: "Luka Modric" },
  ghana: { code: "gh", primaryColor: "#006B3F", secondaryColor: "#FCD116", accentColor: "#CE1126", coach: "TBD" },
  panama: { code: "pa", primaryColor: "#D21034", secondaryColor: "#ffffff", accentColor: "#005293", squadValue: 35, coach: "TBD" },
};

export const TEAMS: Team[] = GROUP_LETTERS.flatMap((group) =>
  GROUPS[group].map((key) => ({
    key,
    group,
    ...TEAM_META[key],
  }))
);

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

// English nations that read with a definite article ("the United States play…").
// Keyed on the English display name only, so localized names (e.g. "Vereinigte
// Staaten", "Pays-Bas") pass through untouched — those languages handle their own
// grammar. "Czech Republic" is included for completeness even though the current
// data labels the team "Czechia" (which takes no article).
const EN_DEFINITE_ARTICLE_NAMES = new Set([
  "United States",
  "Netherlands",
  "Czech Republic",
]);

/**
 * Prefix a country's English display name with the definite article when it needs
 * one ("the United States"). Returns the name unchanged for every other nation and
 * for any non-English (localized) name. Pass `capitalize` for sentence-initial use
 * ("The United States are in Group D…").
 */
export function withArticle(name: string, capitalize = false): string {
  if (EN_DEFINITE_ARTICLE_NAMES.has(name)) {
    return `${capitalize ? "The" : "the"} ${name}`;
  }
  return name;
}
