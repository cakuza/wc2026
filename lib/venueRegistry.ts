export type VenueRecord = {
  key: string;
  name: string;
  streetAddress: string;
  addressLocality: string;
  addressRegion?: string;
  postalCode: string;
  addressCountry: "US" | "CA" | "MX";
  sourceUrl: string;
};

/**
 * Authoritative address registry for all 16 host venues used across the 104 tournament matches.
 * Sourced directly from official venue operators and host city municipal bodies.
 */
export const VENUE_REGISTRY: Record<string, VenueRecord> = {
  "estadio-azteca": {
    key: "estadio-azteca",
    name: "Estadio Azteca",
    streetAddress: "Calz. de Tlalpan 3465, Santa Úrsula Coapa",
    addressLocality: "Coyoacán",
    addressRegion: "CDMX",
    postalCode: "04650",
    addressCountry: "MX",
    sourceUrl: "https://www.estadioazteca.com.mx",
  },
  "estadio-akron": {
    key: "estadio-akron",
    name: "Estadio Akron",
    streetAddress: "Av. Circuito del Bajío 850, Jockers",
    addressLocality: "Zapopan",
    addressRegion: "Jalisco",
    postalCode: "45014",
    addressCountry: "MX",
    sourceUrl: "https://estadioakron.mx",
  },
  "estadio-bbva": {
    key: "estadio-bbva",
    name: "Estadio BBVA",
    streetAddress: "Av. Pablo Livas 2011, La Pastora",
    addressLocality: "Guadalupe",
    addressRegion: "Nuevo León",
    postalCode: "67140",
    addressCountry: "MX",
    sourceUrl: "https://estadio-bbva.mx",
  },
  "bmo-field": {
    key: "bmo-field",
    name: "BMO Field",
    streetAddress: "170 Princes' Blvd",
    addressLocality: "Toronto",
    addressRegion: "ON",
    postalCode: "M6K 3C3",
    addressCountry: "CA",
    sourceUrl: "https://www.bmofield.com",
  },
  "bc-place": {
    key: "bc-place",
    name: "BC Place",
    streetAddress: "777 Pacific Blvd",
    addressLocality: "Vancouver",
    addressRegion: "BC",
    postalCode: "V6B 4Y8",
    addressCountry: "CA",
    sourceUrl: "https://www.bcplace.com",
  },
  "sofi-stadium": {
    key: "sofi-stadium",
    name: "SoFi Stadium",
    streetAddress: "1001 Stadium Dr",
    addressLocality: "Inglewood",
    addressRegion: "CA",
    postalCode: "90301",
    addressCountry: "US",
    sourceUrl: "https://www.sofistadium.com",
  },
  "levis-stadium": {
    key: "levis-stadium",
    name: "Levi's Stadium",
    streetAddress: "4900 Marie P DeBartolo Way",
    addressLocality: "Santa Clara",
    addressRegion: "CA",
    postalCode: "95054",
    addressCountry: "US",
    sourceUrl: "https://www.levisstadium.com",
  },
  "lumen-field": {
    key: "lumen-field",
    name: "Lumen Field",
    streetAddress: "800 Occidental Ave S",
    addressLocality: "Seattle",
    addressRegion: "WA",
    postalCode: "98134",
    addressCountry: "US",
    sourceUrl: "https://www.lumenfield.com",
  },
  "mercedes-benz-stadium": {
    key: "mercedes-benz-stadium",
    name: "Mercedes-Benz Stadium",
    streetAddress: "1 AMB Drive NW",
    addressLocality: "Atlanta",
    addressRegion: "GA",
    postalCode: "30313",
    addressCountry: "US",
    sourceUrl: "https://mercedesbenzstadium.com",
  },
  "metlife-stadium": {
    key: "metlife-stadium",
    name: "MetLife Stadium (New York New Jersey Stadium)",
    streetAddress: "1 MetLife Stadium Dr",
    addressLocality: "East Rutherford",
    addressRegion: "NJ",
    postalCode: "07073",
    addressCountry: "US",
    sourceUrl: "https://www.metlifestadium.com",
  },
  "gillette-stadium": {
    key: "gillette-stadium",
    name: "Gillette Stadium",
    streetAddress: "1 Patriot Pl",
    addressLocality: "Foxborough",
    addressRegion: "MA",
    postalCode: "02035",
    addressCountry: "US",
    sourceUrl: "https://www.gillettestadium.com",
  },
  "lincoln-financial-field": {
    key: "lincoln-financial-field",
    name: "Lincoln Financial Field",
    streetAddress: "1 Lincoln Financial Field Way",
    addressLocality: "Philadelphia",
    addressRegion: "PA",
    postalCode: "19148",
    addressCountry: "US",
    sourceUrl: "https://www.lincolnfinancialfield.com",
  },
  "hard-rock-stadium": {
    key: "hard-rock-stadium",
    name: "Hard Rock Stadium",
    streetAddress: "347 Don Shula Dr",
    addressLocality: "Miami Gardens",
    addressRegion: "FL",
    postalCode: "33056",
    addressCountry: "US",
    sourceUrl: "https://www.hardrockstadium.com",
  },
  "nrg-stadium": {
    key: "nrg-stadium",
    name: "NRG Stadium",
    streetAddress: "NRG Park, 1 NRG Pkwy",
    addressLocality: "Houston",
    addressRegion: "TX",
    postalCode: "77054",
    addressCountry: "US",
    sourceUrl: "https://www.nrgpark.com",
  },
  "arrowhead-stadium": {
    key: "arrowhead-stadium",
    name: "GEHA Field at Arrowhead Stadium",
    streetAddress: "1 Arrowhead Dr",
    addressLocality: "Kansas City",
    addressRegion: "MO",
    postalCode: "64129",
    addressCountry: "US",
    sourceUrl: "https://www.chiefs.com/stadium/",
  },
  "att-stadium": {
    key: "att-stadium",
    name: "AT&T Stadium",
    streetAddress: "1 AT&T Way",
    addressLocality: "Arlington",
    addressRegion: "TX",
    postalCode: "76011",
    addressCountry: "US",
    sourceUrl: "https://attstadium.com",
  },
};

/** Normalizes match venue strings to registry keys */
export function normalizeVenueKey(venueName: string): string {
  const v = venueName.toLowerCase().trim();
  if (v.includes("azteca")) return "estadio-azteca";
  if (v.includes("akron")) return "estadio-akron";
  if (v.includes("bbva")) return "estadio-bbva";
  if (v.includes("bmo")) return "bmo-field";
  if (v.includes("bc place")) return "bc-place";
  if (v.includes("sofi")) return "sofi-stadium";
  if (v.includes("levi")) return "levis-stadium";
  if (v.includes("lumen")) return "lumen-field";
  if (v.includes("mercedes")) return "mercedes-benz-stadium";
  if (v.includes("new york") || v.includes("metlife")) return "metlife-stadium";
  if (v.includes("gillette")) return "gillette-stadium";
  if (v.includes("lincoln")) return "lincoln-financial-field";
  if (v.includes("hard rock")) return "hard-rock-stadium";
  if (v.includes("nrg")) return "nrg-stadium";
  if (v.includes("arrowhead") || v.includes("geha")) return "arrowhead-stadium";
  if (v.includes("at&t") || v.includes("att")) return "att-stadium";
  return v;
}

/** Resolves verified VenueRecord for a venue string. Fails fast if unknown. */
export function getVenueRecord(venueName: string): VenueRecord {
  const key = normalizeVenueKey(venueName);
  const record = VENUE_REGISTRY[key];
  if (!record) {
    throw new Error(`CRITICAL: Unverified venue string '${venueName}' (normalized key '${key}') has no registry entry.`);
  }
  return record;
}
