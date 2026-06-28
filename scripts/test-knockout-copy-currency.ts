/**
 * Content-gate: verifies stale pre-knockout copy has been removed from all
 * localised i18n entries and from the two affected page files.
 *
 * Failure means the build contains copy that contradicts the live knockout draw.
 */

import * as fs from "fs";
import * as path from "path";
import assert from "assert";

const ROOT = path.resolve(__dirname, "..");

function read(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), "utf-8");
}

let passed = 0;
let failed = 0;

function check(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${label}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

// ─── i18n.ts ──────────────────────────────────────────────────────────────────
console.log("\n=== lib/i18n.ts stale phrases ===");
const i18n = read("lib/i18n.ts");

const STALE_PHRASES = [
  "Not yet — this page lists the group-stage fixtures",
  "Knockout matchups are confirmed once the group stage finishes",
  "Knockout matchups are added once the group stage is complete",
  "will be added then",
  // non-English equivalents that were stale
  "Henüz değil — bu sayfa grup aşaması maçlarını listeler",
  "Todavía no — esta página lista los partidos de la fase de grupos",
  "Pas encore — cette page liste les matchs de la phase de groupes",
  "Noch nicht — diese Seite listet die Gruppenspiele",
  "Ainda não — esta página lista os jogos da fase de grupos",
  "ليس بعد — تعرض هذه الصفحة مباريات دور المجموعات",
  "まだです — このページはグループステージの試合を掲載しています",
];

for (const phrase of STALE_PHRASES) {
  check(`i18n.ts does NOT contain: "${phrase.slice(0, 60)}"`, !i18n.includes(phrase));
}

// Fixture label should not say "Group-stage fixtures" any more (English)
check(
  'i18n.ts en: tz_fact_fixtures is "Total fixtures"',
  i18n.includes('tz_fact_fixtures: "Total fixtures"'),
);
check(
  'i18n.ts en: tz_fact_knockout_val is "Included"',
  i18n.includes('tz_fact_knockout_val: "Included"'),
);
check(
  "i18n.ts en: tz_faq_a3 starts with 'Yes'",
  i18n.includes('tz_faq_a3: "Yes — this page now shows all 104'),
);

// ─── app/schedule/[zone]/page.tsx ─────────────────────────────────────────────
console.log("\n=== app/schedule/[zone]/page.tsx JSON-LD ===");
const zonePage = read("app/schedule/[zone]/page.tsx");

check(
  "zone page JSON-LD FAQ does NOT say 'Not yet'",
  !zonePage.includes("Not yet — this page lists the group-stage fixtures"),
);
check(
  "zone page JSON-LD FAQ says 'Yes — this page now shows all 104'",
  zonePage.includes("Yes — this page now shows all 104 tournament fixtures"),
);

// ─── app/world-cup-schedule-local-time/page.tsx ───────────────────────────────
console.log("\n=== app/world-cup-schedule-local-time/page.tsx ===");
const hubPage = read("app/world-cup-schedule-local-time/page.tsx");

check(
  "hub page does NOT say 'group-stage schedule' in description",
  !hubPage.includes("group-stage schedule converted to local time zones"),
);
check(
  "hub page does NOT say 'Knockout matchups are added'",
  !hubPage.includes("Knockout matchups are added once the group stage is complete"),
);
check(
  'hub page label is "Total fixtures"',
  hubPage.includes('"Total fixtures"'),
);
check(
  "hub page description mentions 'all 104 fixtures'",
  hubPage.includes("all 104 fixtures"),
);

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\nResult: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
