import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const outDir = path.join(process.cwd(), "out");

let passCount = 0;
let assertCount = 0;

function check(label: string, condition: boolean, details?: string) {
  assertCount++;
  if (condition) {
    console.log(`  PASS  ${label}`);
    passCount++;
  } else {
    console.error(`  FAIL  ${label}${details ? ` — ${details}` : ""}`);
    throw new Error(`Test failed: ${label}`);
  }
}

function readPageHtml(route: string): string {
  const normalized = route === "/" ? "" : route.replace(/^\//, "");
  const fileCandidates = normalized
    ? [path.join(outDir, `${normalized}.html`), path.join(outDir, normalized, "index.html")]
    : [path.join(outDir, "index.html")];
  const file = fileCandidates.find(fs.existsSync);
  if (!file) {
    throw new Error(`Route file not found for: ${route}`);
  }
  return fs.readFileSync(file, "utf8");
}

console.log("=== Running Archive Server Parity Hotfix Regression Suite ===");

// 1. Archive Hub Page /world-cup-2026
const hubHtml = readPageHtml("/world-cup-2026");
check("Hub page does not render 'Final Weekend'", !hubHtml.includes("Final Weekend"));
check("Hub page does not render upcoming-final or remaining-to-be-played texts", !hubHtml.includes("Third-place playoff and Final remain to be played"));
check("Hub page does not mention '103 matches'", !hubHtml.includes("103 matches"));
check("Hub page does not mention '307 goals'", !hubHtml.includes("307 goals"));
check("Hub page shows completed state and permanent archive note", hubHtml.includes("The tournament is complete. This page is the permanent archive"));
check("Hub page lists Spain as Champion", hubHtml.includes("Champion") && hubHtml.includes("Spain"));
check("Hub page lists Argentina as Runner-up", hubHtml.includes("Runner-up") && hubHtml.includes("Argentina"));
check("Hub page lists England as Third place", hubHtml.includes("Third") && hubHtml.includes("England"));
check("Hub page lists France as Fourth place", hubHtml.includes("Fourth") && hubHtml.includes("France"));
check("Hub page has 104 matches played stat", hubHtml.includes("104"));
check("Hub page has 308 total goals stat", hubHtml.includes("308"));
check("Hub page lists Golden Boot winner", hubHtml.includes("Golden Boot winner"));
check("Hub page includes final match report link", hubHtml.includes("Full Final match report"));

// 2. Team detail pages for Spain and Argentina
const spainHtml = readPageHtml("/teams/spain");
check("Spain status is Champion", spainHtml.includes("Champion"));
check("Spain next match is None (campaign completed)", spainHtml.includes("None (campaign completed)"));
check("Spain record GF is 14", spainHtml.includes("GF <!-- -->14"));
check("Spain record GA is 1", spainHtml.includes("GA <!-- -->1"));
check("Spain record CS is 7", spainHtml.includes("CS <!-- -->7"));

const argentinaHtml = readPageHtml("/teams/argentina");
check("Argentina status is Runner-up", argentinaHtml.includes("Runner-up"));
check("Argentina next match is None (campaign completed)", argentinaHtml.includes("None (campaign completed)"));
check("Argentina record GF is 19", argentinaHtml.includes("GF <!-- -->19"));
check("Argentina record GA is 8", argentinaHtml.includes("GA <!-- -->8"));
check("Argentina record CS is 2", argentinaHtml.includes("CS <!-- -->2"));

// 3. Stats compare page /stats/compare
const compareHtml = readPageHtml("/stats/compare");
check("Compare page SSR is neutral (no France vs Spain heading)", !compareHtml.includes("France vs Spain") && !compareHtml.includes("France <!-- --> vs <!-- --> Spain"));
check("Compare page SSR is neutral (no Spain vs Argentina heading)", !compareHtml.includes("Spain vs Argentina") && !compareHtml.includes("Spain <!-- --> vs <!-- --> Argentina"));
check("Compare page SSR contains select teams prompt", compareHtml.includes("Select two teams to view head-to-head"));

// 4. Stats matches page /stats/matches
const statsMatchesHtml = readPageHtml("/stats/matches");
check("Stats matches has 55 clean sheets", statsMatchesHtml.includes("🧤") && statsMatchesHtml.includes("55"));
check("Stats matches has 104 matches", statsMatchesHtml.includes("104"));

// 5. Teams directory page /teams
const teamsHtml = readPageHtml("/teams");
check("Teams page does not contain remaining-teams active prompt", !teamsHtml.includes("Follow the remaining teams first"));
check("Teams page contains archive-appropriate prompt", teamsHtml.includes("Explore every World Cup side by final tournament standing"));

// 6. Today page /today
const todayHtml = readPageHtml("/today");
check("Today page FAQ has concluded / results archive wording", todayHtml.includes("The 2026 World Cup has concluded"));
check("Today page FAQ details concluded final date", todayHtml.includes("Final concluded on 19 July 2026"));

// 7. Contact page /contact
const contactHtml = readPageHtml("/contact");
check("Contact page disclaims concluded tournament response times", contactHtml.includes("Since the tournament has concluded, we review messages"));

// 8. Editorial policy page /editorial-policy
const editorialHtml = readPageHtml("/editorial-policy");
check("Editorial policy references documented sports-data providers", editorialHtml.includes("documented sports-data providers"));

// 8b. Data Sources & FAQ Trust Copy Agreement
const dataSourcesHtml = readPageHtml("/world-cup-2026-data-sources");
const faqHtml = readPageHtml("/faq");
const trustPhrase = "WorldCupMatchDay primarily uses documented sports-data providers. When provider coverage is incomplete or contradictory, verified reconciliation and canonical corrections may be applied with recorded provenance.";
check("Data Sources page contains truthful provider copy", dataSourcesHtml.includes(trustPhrase));
check("Main FAQ page contains truthful provider copy", faqHtml.includes(trustPhrase));
check("Data Sources page FAQ and main FAQ agree", dataSourcesHtml.includes(trustPhrase) && faqHtml.includes(trustPhrase));

// 9. Bookings stoppage time minutage (Enzo Fernández 90+3')
const match104Html = readPageHtml("/matches/match-104");
check("Match 104 bookings render Enzo Fernández second yellow at 90+3'", match104Html.includes("90+3&#x27;") && match104Html.includes("Enzo Fernández") && match104Html.includes("Second yellow card"));
check("Match 104 bookings render Romero yellow at 90+2'", match104Html.includes("90+2&#x27;") && match104Html.includes("Cristian Romero"));

// 10. Consistent venue naming "New York New Jersey Stadium (MetLife Stadium)"
check("Match 104 detail page lists full final venue", match104Html.includes("New York New Jersey Stadium (MetLife Stadium)"));
check("Schedule page lists full final venue for Match 104", readPageHtml("/schedule").includes("New York New Jersey Stadium (MetLife Stadium)"));

console.log(`\n------------------------------------------------------------`);
console.log(`Parity and hotfix verification finished: ${passCount} of ${assertCount} assertions passed.`);
console.log("------------------------------------------------------------\n");
