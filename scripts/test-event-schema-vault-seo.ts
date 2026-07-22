import { MATCHES, matchSlug } from "../lib/matches";
import { getVenueRecord, VENUE_REGISTRY } from "../lib/venueRegistry";
import { buildMatchSportsEventSchema, buildFactualMatchDescription } from "../lib/sportsEventSchema";
import { websiteSchema } from "../lib/schema";
import { TIMEZONES, timezoneBySlug } from "../lib/timezones";
import { countryName } from "../lib/i18n";
import { isKnockoutMatch, getResolvedHomeTeam, getResolvedAwayTeam, knockoutSlotLabel } from "../lib/participant-resolution";

const ROUND_DISPLAY: Record<string, string> = {
  R32: "Round of 32",
  R16: "Round of 16",
  QF:  "Quarter-final",
  SF:  "Semi-final",
  "3P": "Third-place Match",
  F:   "Final",
};

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

console.log("=== Running Event Schema, Vault Rebrand & SEO Test Suite ===");

// 1. Verify VENUE_REGISTRY completeness
console.log("Checking VENUE_REGISTRY (16 venues + aliases)...");
const venueKeys = Object.keys(VENUE_REGISTRY);
assert(venueKeys.length >= 16, `Expected at least 16 venue records, got ${venueKeys.length}`);

for (const [key, record] of Object.entries(VENUE_REGISTRY)) {
  assert(Boolean(record.key), `Venue ${key} missing key`);
  assert(Boolean(record.name), `Venue ${key} missing name`);
  assert(Boolean(record.streetAddress), `Venue ${key} missing streetAddress`);
  assert(Boolean(record.addressLocality), `Venue ${key} missing addressLocality`);
  assert(Boolean(record.postalCode), `Venue ${key} missing postalCode`);
  assert(Boolean(record.addressCountry), `Venue ${key} missing addressCountry`);
  assert(Boolean(record.sourceUrl), `Venue ${key} missing sourceUrl`);
}
console.log("✔ VENUE_REGISTRY verified (all address fields & source URLs present).");

// 2. Verify all 104 matches produce valid SportsEvent schema
console.log("Checking SportsEvent schema for all 104 matches...");
assert(MATCHES.length === 104, `Expected 104 matches, got ${MATCHES.length}`);

for (const match of MATCHES) {
  const matchId = matchSlug(match);
  const venueRecord = getVenueRecord(match.venue ?? "");
  assert(Boolean(venueRecord), `Failed venue lookup for match ${matchId}: "${match.venue}"`);

  let homeName = "TBD";
  let awayName = "TBD";
  let homeKey: string | null | undefined;
  let awayKey: string | null | undefined;

  if (!isKnockoutMatch(match)) {
    homeKey = match.homeKey;
    awayKey = match.awayKey;
    homeName = countryName(match.homeKey, "en");
    awayName = countryName(match.awayKey, "en");
  } else {
    homeKey = getResolvedHomeTeam(match);
    awayKey = getResolvedAwayTeam(match);
    homeName = homeKey ? countryName(homeKey, "en") : knockoutSlotLabel(match.homeSlot);
    awayName = awayKey ? countryName(awayKey, "en") : knockoutSlotLabel(match.awaySlot);
  }

  const stageLabel = isKnockoutMatch(match) ? ROUND_DISPLAY[match.stage] : undefined;

  // Mock completed state for schema verification
  const schema = buildMatchSportsEventSchema({
    match,
    matchId,
    homeName,
    awayName,
    homeKey,
    awayKey,
    status: "FINISHED",
    homeScore: 2,
    awayScore: 1,
    scoreDuration: "REGULAR",
    stageLabel,
  }) as any;

  assert(schema["@context"] === "https://schema.org", `${matchId}: Invalid @context`);
  assert(schema["@type"] === "SportsEvent", `${matchId}: Invalid @type`);
  assert(schema["@id"] === `https://www.worldcupmatchday.com/matches/${matchId}#sports-event`, `${matchId}: Invalid @id`);
  assert(typeof schema.description === "string" && schema.description.length > 25, `${matchId}: Short or missing description`);
  assert(schema.url === `https://www.worldcupmatchday.com/matches/${matchId}`, `${matchId}: Invalid URL`);
  assert(Boolean(schema.startDate), `${matchId}: Missing startDate`);
  assert(schema.eventStatus === "https://schema.org/EventScheduled", `${matchId}: Invalid eventStatus`);
  assert(schema.eventAttendanceMode === "https://schema.org/OfflineEventAttendanceMode", `${matchId}: Invalid eventAttendanceMode`);
  assert(schema.sport === "Soccer", `${matchId}: Invalid sport`);
  assert(schema.inLanguage === "en", `${matchId}: Missing inLanguage`);

  // Location checks
  const loc = schema.location;
  assert(loc["@type"] === "Place", `${matchId}: Location @type must be Place`);
  assert(Boolean(loc["@id"]), `${matchId}: Location missing @id`);
  assert(Boolean(loc.name), `${matchId}: Location missing name`);
  assert(loc.address["@type"] === "PostalAddress", `${matchId}: Address @type must be PostalAddress`);
  assert(Boolean(loc.address.streetAddress), `${matchId}: Address missing streetAddress`);
  assert(Boolean(loc.address.addressLocality), `${matchId}: Address missing addressLocality`);
  assert(Boolean(loc.address.postalCode), `${matchId}: Address missing postalCode`);
  assert(Boolean(loc.address.addressCountry), `${matchId}: Address missing addressCountry`);

  // Image & Team checks
  assert(Array.isArray(schema.image) && schema.image[0] === `https://www.worldcupmatchday.com/matches/${matchId}/opengraph-image`, `${matchId}: Invalid image array`);
  assert(schema.homeTeam["@type"] === "SportsTeam" && Boolean(schema.homeTeam["@id"]), `${matchId}: Invalid homeTeam`);
  assert(schema.awayTeam["@type"] === "SportsTeam" && Boolean(schema.awayTeam["@id"]), `${matchId}: Invalid awayTeam`);
  assert(Array.isArray(schema.competitor) && schema.competitor.length === 2, `${matchId}: Invalid competitor array`);
  assert(Array.isArray(schema.performer) && schema.performer.length === 2, `${matchId}: Invalid performer array`);

  // Organizer checks
  assert(schema.organizer["@type"] === "Organization", `${matchId}: Organizer @type must be Organization`);
  assert(schema.organizer.name === "FIFA", `${matchId}: Organizer name must be FIFA`);
  assert(schema.organizer.url === "https://www.fifa.com/en/tournaments/mens/worldcup/canada-mexico-usa-2026", `${matchId}: Organizer url invalid`);
}
console.log("✔ All 104 match SportsEvent schemas verified.");

// 3. Verify WebSite schema & Vault rebrand
console.log("Checking WebSite schema & Vault rebrand...");
const siteSchema = websiteSchema();
assert(siteSchema.alternateName === "World Cup 2026 Vault", `WebSite schema alternateName must be "World Cup 2026 Vault", got "${siteSchema.alternateName}"`);
assert(siteSchema.description.includes("2026 FIFA World Cup Vault"), "WebSite description must include Vault phrasing");
console.log("✔ WebSite schema alternateName and description verified.");

// 4. Verify SEO Opportunity 2 (Eastern Time)
console.log("Checking /schedule/eastern-time config...");
const etZone = timezoneBySlug("eastern-time");
assert(Boolean(etZone), "eastern-time zone config missing");
assert(Boolean(etZone && etZone.title === "World Cup 2026 Results in Eastern Time — Complete ET Schedule"), `ET title unexpected: "${etZone?.title}"`);
assert(Boolean(etZone && etZone.description.includes("104 completed 2026 World Cup matches")), `ET description unexpected: "${etZone?.description}"`);
console.log("✔ Eastern Time schedule metadata verified.");

console.log("\n=== ALL TESTS PASSED SUCCESSFULLY! ===");
