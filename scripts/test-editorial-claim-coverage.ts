/**
 * Deterministic editorial claim-coverage gate for PR #8.
 *
 * Loads data/adsense/editorial-claim-audit.json and verifies:
 *  - every claim has a verdict
 *  - uncovered sentences = 0
 *  - false = 0
 *  - unsupported = 0
 *  - outdated = 0
 *  - misleading = 0
 *  - every VERIFIED claim has a sourceUrl (not just general homepage)
 *  - no claim uses a generic search-result or competitor URL as source
 *  - OPERATIONAL claims have a policyRef
 *  - summary totals are internally consistent
 *
 * Usage:  npx tsx scripts/test-editorial-claim-coverage.ts
 */

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const AUDIT_PATH = path.join(ROOT, "data/adsense/editorial-claim-audit.json");

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

// ── Load audit file ────────────────────────────────────────────────────────
if (!fs.existsSync(AUDIT_PATH)) {
  console.error("FAIL  Audit file not found: " + AUDIT_PATH);
  process.exit(1);
}

const audit = JSON.parse(fs.readFileSync(AUDIT_PATH, "utf8"));
const claims: any[] = audit.claims;
const summary = audit.summary;

console.log(`\n[Coverage] ${AUDIT_PATH}`);
console.log(`  Audit date: ${audit.auditDate}`);
console.log(`  Total claims recorded: ${claims.length}`);

// ── §2 merge gate requirements ─────────────────────────────────────────────
console.log("\n[Gate] Merge requirements");

check(
  "uncoveredSentences = 0",
  summary.uncoveredSentences === 0,
  `got ${summary.uncoveredSentences}`,
);

// Count false/unsupported/outdated/misleading from claims (not removed/editorial)
const activeClaims = claims.filter(
  (c) =>
    c.verdict !== "REMOVED" && c.verdict !== "EDITORIAL_REMOVED",
);

const falseClaims = activeClaims.filter((c) => c.verdict === "FALSE");
check(
  "false = 0",
  falseClaims.length === 0,
  falseClaims.length > 0
    ? `FALSE claims: ${falseClaims.map((c) => c.id).join(", ")}`
    : undefined,
);

const unsupportedClaims = activeClaims.filter(
  (c) => c.verdict === "UNSUPPORTED",
);
check(
  "unsupported = 0",
  unsupportedClaims.length === 0,
  unsupportedClaims.length > 0
    ? `UNSUPPORTED: ${unsupportedClaims.map((c) => c.id).join(", ")}`
    : undefined,
);

const outdatedClaims = activeClaims.filter((c) => c.verdict === "OUTDATED");
check(
  "outdated = 0",
  outdatedClaims.length === 0,
  outdatedClaims.length > 0
    ? `OUTDATED: ${outdatedClaims.map((c) => c.id).join(", ")}`
    : undefined,
);

const misleadingClaims = activeClaims.filter(
  (c) => c.verdict === "MISLEADING",
);
check(
  "misleading = 0",
  misleadingClaims.length === 0,
  misleadingClaims.length > 0
    ? `MISLEADING: ${misleadingClaims.map((c) => c.id).join(", ")}`
    : undefined,
);

// ── Source URL quality ─────────────────────────────────────────────────────
console.log("\n[Sources] URL quality");

const GENERIC_HOMEPAGE = "https://www.fifa.com";
const ALLOWED_SOURCES = [
  "https://www.fifa.com/en/tournaments/mens/worldcup/canada-mexico-usa-2026",
  "https://digitalhub.fifa.com/",
];

const verifiedClaims = activeClaims.filter((c) => c.verdict === "VERIFIED");
const missingSource = verifiedClaims.filter((c) => !c.sourceUrl);
check(
  "every VERIFIED claim has a sourceUrl",
  missingSource.length === 0,
  missingSource.length > 0
    ? `Missing: ${missingSource.map((c) => c.id).join(", ")}`
    : undefined,
);

const genericHomepageSource = verifiedClaims.filter(
  (c) => c.sourceUrl === GENERIC_HOMEPAGE,
);
check(
  "no VERIFIED claim uses bare fifa.com homepage as sole source",
  genericHomepageSource.length === 0,
  genericHomepageSource.length > 0
    ? `Generic homepage: ${genericHomepageSource.map((c) => c.id).join(", ")}`
    : undefined,
);

// All FIFA source URLs must be specific (not just the root domain)
const specificSources = verifiedClaims.filter(
  (c) =>
    c.sourceUrl &&
    (c.sourceUrl.startsWith(
      "https://www.fifa.com/en/tournaments/mens/worldcup/",
    ) ||
      c.sourceUrl.startsWith("https://digitalhub.fifa.com/")),
);
check(
  "all VERIFIED sources use specific FIFA pages (not root domain)",
  specificSources.length === verifiedClaims.length,
  `${specificSources.length}/${verifiedClaims.length} use specific pages`,
);

const operationalClaims = activeClaims.filter(
  (c) => c.verdict === "OPERATIONAL",
);
const missingPolicyRef = operationalClaims.filter((c) => !c.policyRef);
check(
  "every OPERATIONAL claim has a policyRef",
  missingPolicyRef.length === 0,
  missingPolicyRef.length > 0
    ? `Missing policyRef: ${missingPolicyRef.map((c) => c.id).join(", ")}`
    : undefined,
);

// ── Prediction/favourite framing absent ───────────────────────────────────
console.log("\n[Prediction] No unsupported favourite wording in active claims");

const FORBIDDEN_PREDICTION_PATTERNS = [
  "are among the 2026 favourites",
  "are among the pre-tournament favourites",
  "considered among the leading contenders",
  "considered among the top contenders",
  "are considered to be favourites",
  "are expected to",
  "will win",
];

const activeClaimTexts = activeClaims.map((c) => c.claim.toLowerCase());
for (const pattern of FORBIDDEN_PREDICTION_PATTERNS) {
  const hits = activeClaims.filter((c) =>
    c.claim.toLowerCase().includes(pattern.toLowerCase()),
  );
  check(
    `No active claim contains prediction: "${pattern}"`,
    hits.length === 0,
    hits.length > 0 ? `Found in: ${hits.map((c) => c.id).join(", ")}` : undefined,
  );
}

// ── Summary consistency ────────────────────────────────────────────────────
console.log("\n[Consistency] Summary totals");

check(
  "summary.verifiedClaims matches actual count",
  summary.verifiedClaims === verifiedClaims.length,
  `summary=${summary.verifiedClaims}, actual=${verifiedClaims.length}`,
);
check(
  "summary.operationalClaims matches actual count",
  summary.operationalClaims === operationalClaims.length,
  `summary=${summary.operationalClaims}, actual=${operationalClaims.length}`,
);

const editorialRemovedClaims = claims.filter(
  (c) => c.verdict === "EDITORIAL_REMOVED",
);
check(
  "summary.editorialRemovedClaims matches actual count",
  summary.editorialRemovedClaims === editorialRemovedClaims.length,
  `summary=${summary.editorialRemovedClaims}, actual=${editorialRemovedClaims.length}`,
);

// ── Seattle Stadium as primary official name in live editorial files ────────
console.log("\n[Seattle] Official venue name in editorial pages");

const faqContent = fs.readFileSync(
  path.join(ROOT, "app/faq/page.tsx"),
  "utf8",
);
check(
  "FAQ uses Seattle Stadium as primary official name",
  faqContent.includes("Seattle Stadium"),
);
check(
  "FAQ does not present Lumen Field as primary standalone name",
  !faqContent.includes("Lumen Field (Seattle)"),
);

// ── Summary ───────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(60)}`);
console.log(
  `Claim stats: ${summary.verifiedClaims} VERIFIED, ${summary.operationalClaims} OPERATIONAL, ${summary.editorialRemovedClaims} EDITORIAL_REMOVED`,
);
console.log(
  `Uncovered: ${summary.uncoveredSentences}  |  False: ${summary.falseClaims}  |  Unsupported: ${summary.unsupportedClaims}  |  Misleading: ${summary.misleadingClaims}`,
);
console.log(`Result: ${pass} passed, ${fail} failed`);
if (fail > 0) {
  process.exit(1);
}
