/**
 * Deterministic test: editorial venue list and knockout date correctness.
 *
 * Verifies that PR-8 editorial pages:
 *  - Do NOT contain Las Vegas or Allegiant Stadium as a WC2026 venue
 *  - DO contain all 16 official host city names
 *  - Use correct knockout round date ranges per official FIFA schedule
 *  - Use "New York New Jersey Stadium" as primary final venue name
 *  - Do NOT contain "approx." in round date fields
 *
 * Usage:  npx tsx scripts/test-editorial-venue-dates.ts
 */

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");

function readPage(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

let pass = 0;
let fail = 0;

function check(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  PASS  ${label}`);
    pass++;
  } else {
    console.error(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
    fail++;
  }
}

// ── 1. FAQ page: venue list ────────────────────────────────────────────────
console.log("\n[FAQ] Venue list correctness");
const faq = readPage("app/faq/page.tsx");

// Must NOT contain false venues
check("Las Vegas absent from FAQ", !faq.includes("Las Vegas"));
check("Allegiant absent from FAQ", !faq.includes("Allegiant"));
check("Rose Bowl absent from FAQ", !faq.includes("Rose Bowl"));

// All 16 official host cities must appear
const OFFICIAL_HOST_CITIES = [
  "Atlanta",
  "Boston",
  "Dallas",
  "Guadalajara",
  "Houston",
  "Kansas City",
  "Los Angeles",
  "Mexico City",
  "Miami",
  "Monterrey",
  "New York",        // covers "New York New Jersey"
  "Philadelphia",
  "San Francisco Bay Area",
  "Seattle",
  "Toronto",
  "Vancouver",
];

for (const city of OFFICIAL_HOST_CITIES) {
  check(`FAQ contains host city: ${city}`, faq.includes(city));
}

// Lumen Field (Seattle) must be present
check("Lumen Field (Seattle) present in FAQ", faq.includes("Lumen Field"));

// NNJ Stadium as primary name
check(
  "New York New Jersey Stadium in FAQ",
  faq.includes("New York New Jersey Stadium"),
);

// ── 2. Knockout bracket page: date ranges ──────────────────────────────────
console.log("\n[Knockout] Official date ranges");
const knockout = readPage(
  "app/world-cup-2026-knockout-bracket-explained/page.tsx",
);

check(
  "R32 dates: 28 June – 3 July 2026",
  knockout.includes("28 June – 3 July 2026"),
);
check("R16 dates: 4–7 July 2026", knockout.includes("4–7 July 2026"));
check(
  "QF dates: 9–11 July 2026",
  knockout.includes("9–11 July 2026"),
);
check(
  "SF dates: 14–15 July 2026",
  knockout.includes("14–15 July 2026"),
);
check(
  "Bronze final: 18 July 2026",
  knockout.includes("18 July 2026"),
);
check("Final: 19 July 2026", knockout.includes("19 July 2026"));

// Must NOT contain old wrong dates or "approx."
check("No old '– 1 July' R32 end date in knockout", !knockout.includes("– 1 July 2026"));
check("No '5 July' R16 in knockout", !knockout.includes("4–5 July"));
check("No '(approx.)' in knockout", !knockout.includes("(approx.)"));
check("No 'four days' in knockout", !knockout.includes("over four days"));
check(
  "No '10–11 July' QF in knockout",
  !knockout.includes("10–11 July"),
);

// Venue names
check(
  "New York New Jersey Stadium in knockout",
  knockout.includes("New York New Jersey Stadium"),
);
check(
  "No standalone 'MetLife Stadium' as primary final name",
  knockout.indexOf('"Final venue", v: "MetLife Stadium"') === -1,
);
check(
  "Prize-money 'different bands' claim absent",
  !knockout.includes("different bands"),
);

// ── 3. Format-explained page: venue and date ───────────────────────────────
console.log("\n[Format] Venue names and dates");
const format = readPage("app/world-cup-2026-format-explained/page.tsx");

check(
  "New York New Jersey Stadium in format page",
  format.includes("New York New Jersey Stadium"),
);
check(
  "No 'MetLife Stadium' without qualifier in format page",
  !format.includes('"MetLife Stadium"'),
);
check(
  "Group stage ends 27 June in format page",
  format.includes("27 June 2026"),
);
check(
  "R32 starts 28 June in format page",
  format.includes("28 June 2026"),
);

// ── 4. Tiebreaker page: no 'drawing of lots' ──────────────────────────────
console.log("\n[Tiebreakers] Criterion 7 correctness");
const tiebreakers = readPage(
  "app/world-cup-2026-group-tiebreakers/page.tsx",
);

check(
  "No 'drawing of lots' in tiebreakers",
  !tiebreakers.includes("drawing of lots"),
);
check(
  "FIFA/Coca-Cola ranking in tiebreakers as step 7",
  tiebreakers.includes("FIFA/Coca-Cola"),
);

// ── 5. Official source links present ──────────────────────────────────────
console.log("\n[Sources] Official FIFA links visible");
const EXPECTED_LINKS = [
  "https://www.fifa.com/en/tournaments/mens/worldcup/canada-mexico-usa-2026",
  "https://www.fifa.com/en/tournaments/mens/worldcup/canada-mexico-usa-2026/matches",
  "https://www.fifa.com/en/tournaments/mens/worldcup/canada-mexico-usa-2026/host-cities",
];

for (const link of EXPECTED_LINKS) {
  const inKnockout = knockout.includes(link);
  const inFormat = format.includes(link);
  const inTiebreakers = tiebreakers.includes(link);
  const dataSources = readPage("app/world-cup-2026-data-sources/page.tsx");
  const inData = dataSources.includes(link);
  check(
    `Official link present: ${link.split("/").slice(-1)[0] || "root"}`,
    inKnockout || inFormat || inTiebreakers || inData,
    `knockout=${inKnockout} format=${inFormat} tiebreakers=${inTiebreakers} data=${inData}`,
  );
}

// ── 6. No false venue names in i18n ───────────────────────────────────────
console.log("\n[i18n] No false venue names");
const i18n = readPage("lib/i18n.ts");
check("No 'Las Vegas' in i18n", !i18n.includes("Las Vegas"));
check("No 'Allegiant' in i18n", !i18n.includes("Allegiant"));
check(
  "New York New Jersey Stadium in i18n (eastern-time blurb)",
  i18n.includes("New York New Jersey Stadium"),
);

// ── Summary ───────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(60)}`);
console.log(`Result: ${pass} passed, ${fail} failed`);
if (fail > 0) {
  process.exit(1);
}
