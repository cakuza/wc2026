// Confederation membership for each canonical team key. This is attribute metadata keyed by the
// existing TEAMS keys — not a separate team list. Pages iterate canonical TEAMS and look up the
// confederation here, so the two stay in sync (a build-time check asserts full coverage).

export type Confederation = {
  code: string;
  name: string;
  region: string;
};

// Display order requested for the by-confederation page.
export const CONFEDERATIONS: Confederation[] = [
  { code: "UEFA", name: "UEFA", region: "Europe" },
  { code: "CONMEBOL", name: "CONMEBOL", region: "South America" },
  { code: "Concacaf", name: "Concacaf", region: "North & Central America and the Caribbean" },
  { code: "AFC", name: "AFC", region: "Asia" },
  { code: "CAF", name: "CAF", region: "Africa" },
  { code: "OFC", name: "OFC", region: "Oceania" },
];

export const CONFEDERATION_BY_TEAM: Record<string, string> = {
  // UEFA (Europe)
  czechia: "UEFA",
  bosnia: "UEFA",
  switzerland: "UEFA",
  scotland: "UEFA",
  turkey: "UEFA",
  germany: "UEFA",
  netherlands: "UEFA",
  sweden: "UEFA",
  belgium: "UEFA",
  spain: "UEFA",
  france: "UEFA",
  norway: "UEFA",
  austria: "UEFA",
  portugal: "UEFA",
  england: "UEFA",
  croatia: "UEFA",
  // CONMEBOL (South America)
  brazil: "CONMEBOL",
  paraguay: "CONMEBOL",
  ecuador: "CONMEBOL",
  uruguay: "CONMEBOL",
  argentina: "CONMEBOL",
  colombia: "CONMEBOL",
  // Concacaf (North & Central America, Caribbean)
  mexico: "Concacaf",
  canada: "Concacaf",
  haiti: "Concacaf",
  unitedStates: "Concacaf",
  curacao: "Concacaf",
  panama: "Concacaf",
  // AFC (Asia)
  southKorea: "AFC",
  qatar: "AFC",
  australia: "AFC",
  japan: "AFC",
  iran: "AFC",
  saudiArabia: "AFC",
  iraq: "AFC",
  jordan: "AFC",
  uzbekistan: "AFC",
  // CAF (Africa)
  southAfrica: "CAF",
  morocco: "CAF",
  ivoryCoast: "CAF",
  tunisia: "CAF",
  egypt: "CAF",
  capeVerde: "CAF",
  senegal: "CAF",
  algeria: "CAF",
  drCongo: "CAF",
  ghana: "CAF",
  // OFC (Oceania)
  newZealand: "OFC",
};
