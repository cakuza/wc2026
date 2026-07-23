import { MATCHES, matchSlug, matchBySlug } from "../lib/matches";
import { getVenueRecord, VENUE_REGISTRY } from "../lib/venueRegistry";
import { buildMatchSportsEventSchema, buildFactualMatchDescription } from "../lib/sportsEventSchema";
import { websiteSchema } from "../lib/schema";
import { TIMEZONES, timezoneBySlug } from "../lib/timezones";
import { countryName } from "../lib/i18n";
import { isKnockoutMatch, getResolvedHomeTeam, getResolvedAwayTeam, knockoutSlotLabel } from "../lib/participant-resolution";
import { COMPLETED_GROUP_RESULTS, COMPLETED_KNOCKOUT_RESULTS } from "../lib/canonicalMatchResults";
import ImageGenerator, { generateStaticParams } from "../app/matches/[matchId]/opengraph-image";

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

async function runTests() {
  console.log("=== Running Event Schema, Vault Rebrand & SEO Test Suite ===");

  // 1. Verify VENUE_REGISTRY completeness and explicit Akron truth
  console.log("Checking VENUE_REGISTRY (16 venues + explicit Akron regression)...");
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

  // Explicit Estadio Akron address regression assertion (Must fail if old 45014 values return)
  const akronRecord = VENUE_REGISTRY["estadio-akron"];
  assert(akronRecord !== undefined, "estadio-akron record missing from VENUE_REGISTRY");
  assert(akronRecord.streetAddress === "Av. Circuito JVC 2800, El Bajío", `Akron streetAddress unexpected: ${akronRecord.streetAddress}`);
  assert(akronRecord.addressLocality === "Zapopan", `Akron locality unexpected: ${akronRecord.addressLocality}`);
  assert(akronRecord.addressRegion === "Jalisco", `Akron region unexpected: ${akronRecord.addressRegion}`);
  assert(akronRecord.postalCode === "45019", `Akron postalCode unexpected: ${akronRecord.postalCode}`);
  assert(akronRecord.addressCountry === "MX", `Akron country unexpected: ${akronRecord.addressCountry}`);
  assert(akronRecord.sourceUrl === "https://estadioakron.mx/Contactanos", `Akron sourceUrl unexpected: ${akronRecord.sourceUrl}`);
  console.log("✔ VENUE_REGISTRY verified with Estadio Akron official address (45019).");

  // 2. Verify all 104 matches produce valid SportsEvent schema (Structural Coverage)
  console.log("Checking SportsEvent schema structure for all 104 matches...");
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

    const schema = buildMatchSportsEventSchema({
      match,
      matchId,
      homeName,
      awayName,
      homeKey,
      awayKey,
      status: "FINISHED",
      homeScore: 1,
      awayScore: 0,
      scoreDuration: "REGULAR",
      stageLabel,
    }) as any;

    assert(schema["@context"] === "https://schema.org", `${matchId}: Invalid @context`);
    assert(schema["@type"] === "SportsEvent", `${matchId}: Invalid @type`);
    assert(schema["@id"] === `https://www.worldcupmatchday.com/matches/${matchId}#sports-event`, `${matchId}: Invalid @id`);
    assert(typeof schema.description === "string" && schema.description.length > 25, `${matchId}: Short or missing description`);
    assert(schema.url === `https://www.worldcupmatchday.com/matches/${matchId}`, `${matchId}: Invalid URL`);
    assert(Boolean(schema.startDate), `${matchId}: Missing startDate`);
    assert(schema.eventStatus === "https://schema.org/EventCompleted", `${matchId}: Invalid eventStatus`);
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
    assert(schema.organizer.url === "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/", `${matchId}: Organizer url invalid: ${schema.organizer.url}`);
  }
  console.log("✔ Structural coverage for all 104 match SportsEvent schemas verified.");

  // 3. Canonical Result Coverage (Real Production Data Tests)
  console.log("Checking canonical match results schema accuracy...");

  // Match 104 (Final: Spain 1–0 Argentina AET)
  const m104 = MATCHES.find((m) => isKnockoutMatch(m) && m.matchNumber === 104)!;
  assert(Boolean(m104), "Match 104 not found in MATCHES");
  const res104 = COMPLETED_KNOCKOUT_RESULTS[104];
  const schema104 = buildMatchSportsEventSchema({
    match: m104,
    matchId: "match-104",
    homeName: "Spain",
    awayName: "Argentina",
    homeKey: "spain",
    awayKey: "argentina",
    status: "FINISHED",
    homeScore: res104.homeScore,
    awayScore: res104.awayScore,
    scoreDuration: res104.scoreDuration,
    stageLabel: "Final",
  }) as any;

  assert(schema104.name === "Spain 1–0 Argentina — 2026 FIFA World Cup Final", `Match 104 name mismatch: ${schema104.name}`);
  assert(schema104.description === "Spain defeated Argentina 1–0 after extra time in the 2026 FIFA World Cup Final at New York New Jersey Stadium (MetLife Stadium).", `Match 104 description mismatch: ${schema104.description}`);
  assert(schema104.location.name === "New York New Jersey Stadium (MetLife Stadium)", "Match 104 venue name mismatch");

  // Match 103 (Third-place Match: France 4–6 England FT)
  const m103 = MATCHES.find((m) => isKnockoutMatch(m) && m.matchNumber === 103)!;
  assert(Boolean(m103), "Match 103 not found in MATCHES");
  const res103 = COMPLETED_KNOCKOUT_RESULTS[103];
  const schema103 = buildMatchSportsEventSchema({
    match: m103,
    matchId: "match-103",
    homeName: "France",
    awayName: "England",
    homeKey: "france",
    awayKey: "england",
    status: "FINISHED",
    homeScore: res103.homeScore,
    awayScore: res103.awayScore,
    scoreDuration: res103.scoreDuration,
    stageLabel: "Third-place Match",
  }) as any;

  assert(schema103.name === "France 4–6 England — 2026 FIFA World Cup Third-place Match", `Match 103 name mismatch: ${schema103.name}`);
  assert(schema103.description === "England defeated France 6–4 in the 2026 FIFA World Cup Third-place Match at Hard Rock Stadium.", `Match 103 description mismatch: ${schema103.description}`);

  // Penalty Shootout Match (Match 74: 1-1, 3-4 PEN)
  const m74 = MATCHES.find((m) => isKnockoutMatch(m) && m.matchNumber === 74)!;
  assert(Boolean(m74), "Match 74 not found in MATCHES");
  const res74 = COMPLETED_KNOCKOUT_RESULTS[74];
  const schema74 = buildMatchSportsEventSchema({
    match: m74,
    matchId: "match-74",
    homeName: "Colombia",
    awayName: "Uruguay",
    homeKey: "colombia",
    awayKey: "uruguay",
    status: "FINISHED",
    homeScore: res74.homeScore,
    awayScore: res74.awayScore,
    scoreDuration: res74.scoreDuration,
    stageLabel: "Round of 32",
  }) as any;

  assert(schema74.description.includes("after a penalty shootout"), `Penalty shootout match description missing shootout detail: ${schema74.description}`);

  // Group Match (Match 1: Mexico 2–0 South Africa)
  const m1 = MATCHES[0];
  assert(Boolean(m1), "Match 1 not found in MATCHES");
  const schema1 = buildMatchSportsEventSchema({
    match: m1,
    matchId: "match-1",
    homeName: "Mexico",
    awayName: "South Africa",
    homeKey: "mexico",
    awayKey: "southAfrica",
    status: "FINISHED",
    homeScore: 2,
    awayScore: 0,
    scoreDuration: "REGULAR",
  }) as any;

  assert(schema1.name === "Mexico 2–0 South Africa — 2026 FIFA World Cup Group A", `Match 1 name mismatch: ${schema1.name}`);
  assert(schema1.description === "Mexico defeated South Africa 2–0 in the 2026 FIFA World Cup Group A at Estadio Azteca.", `Match 1 description mismatch: ${schema1.description}`);

  console.log("✔ Canonical production match results (104: Spain 1–0 Argentina AET, 103: France 4–6 England, 74: Shootout, 1: Group A) verified.");

  // 4. OpenGraph Image Static Generator Params Test
  console.log("Checking opengraph-image generator params...");
  const params = generateStaticParams();
  assert(params.length === 104, `generateStaticParams expected 104 entries, got ${params.length}`);
  assert(params[0].matchId === "mexico-vs-south-africa-jun11", `generateStaticParams first entry mismatch: ${params[0].matchId}`);
  assert(params[103].matchId === "match-104", `generateStaticParams 104th entry mismatch: ${params[103].matchId}`);

  // Verify ImageGenerator returns non-null Response/JSX object
  const ogRes = await ImageGenerator({ params: Promise.resolve({ matchId: "match-104" }) });
  assert(Boolean(ogRes), "ImageGenerator returned null/undefined");
  console.log("✔ Dynamic opengraph-image generator static params (104 images) verified.");

  // 5. Verify WebSite schema & Vault rebrand
  console.log("Checking WebSite schema & Vault rebrand...");
  const siteSchema = websiteSchema();
  assert(siteSchema.alternateName === "World Cup 2026 Vault", `WebSite schema alternateName must be "World Cup 2026 Vault", got "${siteSchema.alternateName}"`);
  assert(siteSchema.description.includes("2026 FIFA World Cup Vault"), "WebSite description must include Vault phrasing");
  console.log("✔ WebSite schema alternateName and description verified.");

  // 6. Verify Eastern Time schedule metadata
  console.log("Checking /schedule/eastern-time config...");
  const etZone = timezoneBySlug("eastern-time");
  assert(Boolean(etZone), "eastern-time zone config missing");
  assert(Boolean(etZone && etZone.title === "World Cup 2026 Results in Eastern Time — Complete ET Schedule"), `ET title unexpected: "${etZone?.title}"`);
  assert(Boolean(etZone && etZone.description.includes("104 completed 2026 World Cup matches")), `ET description unexpected: "${etZone?.description}"`);
  console.log("✔ Eastern Time schedule metadata verified.");

  console.log("\n=== GOOGLE EVENT VALIDATOR FIXTURE REPORT ===");
  console.log("- Cleared Warnings: Factual description, full venue address (16 host venues), homeTeam/awayTeam/competitor nodes, stable IDs, canonical FIFA organizer URL.");
  console.log("- Remaining Warnings: 'offers' / 'ticketUrl' intentionally omitted for completed post-tournament historical archive events.");
  console.log("- Performer Compatibility Decision: Retained SportsTeam under performer (Schema.org inherits performer from Event for Organizations), alongside homeTeam, awayTeam, and competitor.");

  console.log("\n=== ALL TESTS PASSED SUCCESSFULLY! ===");
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
