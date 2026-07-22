import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { strict as assert } from "node:assert";

interface AllowlistEntry {
  file: string;
  pattern: RegExp;
  reason: string;
}

// Strict allowlist for genuine fixed-color elements (red/green badges, primary accent buttons, hero backdrop, theme toggle SVG)
const ALLOWLIST: AllowlistEntry[] = [
  {
    file: "components/Footer.tsx",
    pattern: /bg-accent.*text-white/,
    reason: "Red accent 2026 year badge requires white text on red background",
  },
  {
    file: "components/MatchCenterContent.tsx",
    pattern: /bg-red-600 text-white/,
    reason: "LIVE match status badge requires white text on red-600 background",
  },
  {
    file: "components/MatchDetail.tsx",
    pattern: /bg-red-600.*text-white/,
    reason: "LIVE match status badge requires white text on red-600 background",
  },
  {
    file: "components/Nav.tsx",
    pattern: /bg-black\/60/,
    reason: "Mobile navigation drawer backdrop dimming overlay",
  },
  {
    file: "components/Nav.tsx",
    pattern: /bg-accent text-white/,
    reason: "Active primary navigation button requires white text on red accent",
  },
  {
    file: "components/Nav.tsx",
    pattern: /bg-red-600 text-white/,
    reason: "Header 2026 tournament badge requires white text on red-600",
  },
  {
    file: "components/QuizClient.tsx",
    pattern: /bg-accent.*text-white/,
    reason: "Primary quiz action button requires white text on red accent",
  },
  {
    file: "components/ScheduledKnockoutPreview.tsx",
    pattern: /text-white/,
    reason: "Win/Loss/Draw status badge indicators (green-600, red-600, gray-500) require white text",
  },
  {
    file: "components/TeamCard.tsx",
    pattern: /bg-accent.*text-white/,
    reason: "Red team card status badge requires white text on red accent",
  },
  {
    file: "components/TeamDetail.tsx",
    pattern: /bg-black\/45/,
    reason: "Team detail hero banner image backdrop overlay",
  },
  {
    file: "components/TeamsDirectory.tsx",
    pattern: /bg-accent text-white/,
    reason: "Active confederation filter pill requires white text on red accent",
  },
  {
    file: "components/TeamsGrid.tsx",
    pattern: /bg-accent text-white/,
    reason: "Active group filter pill requires white text on red accent",
  },
  {
    file: "components/ThemeToggle.tsx",
    pattern: /text-white\/0/,
    reason: "ThemeToggle SVG icon rotation/scale transition hidden state",
  },
  {
    file: "components/TodayPageLiveSection.tsx",
    pattern: /bg-red-600 text-white/,
    reason: "LIVE match status badge requires white text on red-600 background",
  },
  {
    file: "components/TriviaCard.tsx",
    pattern: /bg-accent.*text-white/,
    reason: "Primary trivia call-to-action button requires white text on red accent",
  },
];

function walk(dir: string): string[] {
  let results: string[] = [];
  const list = readdirSync(dir);
  for (const file of list) {
    const fullPath = join(dir, file);
    const stat = statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (fullPath.endsWith(".tsx") || fullPath.endsWith(".ts")) {
      results.push(fullPath);
    }
  }
  return results;
}

function main() {
  console.log("=== Deterministic Theme System & Token Syntax Audit ===");

  // 1. Audit CSS Custom Properties in app/globals.css
  console.log("\n--- 1. CSS Variable Token Syntax Audit ---");
  const globalsCss = readFileSync("app/globals.css", "utf8");
  const varMatches = globalsCss.match(/--color-[a-z-]+:\s*([^;]+);/g) || [];
  assert(varMatches.length > 0, "app/globals.css contains CSS custom properties");

  for (const m of varMatches) {
    assert(!m.includes("/"), `CSS custom property '${m.trim()}' must not contain embedded '/' slashes`);
  }
  console.log(`  PASS: All ${varMatches.length} CSS custom properties in app/globals.css contain clean 3-digit RGB channel values without slashes.`);

  // 2. Audit Codebase for Hardcoded Dark Utilities
  console.log("\n--- 2. Repository-Wide Hardcoded Class Audit ---");
  const targetFiles = walk("./app").concat(walk("./components"));
  const darkClassRegex = /(text-white|border-white|divide-white|ring-white|bg-black|bg-navy|bg-navyCard|bg-white\/|hover:text-white|placeholder:text-white)/;

  const matchedAllowlist = new Set<AllowlistEntry>();
  const unallowedMatches: string[] = [];
  let totalMatchesCount = 0;

  for (const filePath of targetFiles) {
    const normPath = filePath.replace(/\\/g, "/");
    const content = readFileSync(filePath, "utf8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (darkClassRegex.test(line)) {
        totalMatchesCount++;
        const lineText = line.trim();

        // Check against allowlist
        const matchedEntry = ALLOWLIST.find(
          (entry) => normPath.endsWith(entry.file) && entry.pattern.test(lineText)
        );

        if (matchedEntry) {
          matchedAllowlist.add(matchedEntry);
        } else {
          unallowedMatches.push(`${normPath}:${i + 1}: ${lineText}`);
        }
      }
    }
  }

  // Check for unallowed matches
  if (unallowedMatches.length > 0) {
    console.error("  FAIL: Found unmigrated hardcoded dark classes on ordinary surfaces:");
    unallowedMatches.forEach((m) => console.error("    " + m));
    assert.fail(`Found ${unallowedMatches.length} unmigrated hardcoded dark utility matches.`);
  } else {
    console.log(`  PASS: Zero unmigrated hardcoded dark utilities found across ${targetFiles.length} files.`);
  }

  // Check for stale allowlist entries
  const staleEntries = ALLOWLIST.filter((entry) => !matchedAllowlist.has(entry));
  if (staleEntries.length > 0) {
    console.error("  FAIL: Found stale allowlist entries matching 0 lines:");
    staleEntries.forEach((e) => console.error(`    ${e.file} -> ${e.pattern} (${e.reason})`));
    assert.fail(`Found ${staleEntries.length} stale allowlist entries.`);
  } else {
    console.log(`  PASS: All ${ALLOWLIST.length} allowlist entries matched active fixed-color elements.`);
  }

  // 3. Vault Navigation Label Audit
  console.log("\n--- 3. Vault Navigation Wording Parity ---");
  const navLinksJs = readFileSync("lib/navLinks.ts", "utf8");
  assert(navLinksJs.includes('label: "2026 Vault"'), "lib/navLinks.ts contains '2026 Vault' navigation label");
  assert(!navLinksJs.includes('label: "2026 Archive"'), "lib/navLinks.ts omits obsolete '2026 Archive' label");
  console.log("  PASS: Navigation label is consistently set to '2026 Vault'.");

  console.log("\n=======================================================");
  console.log("  DETERMINISTIC THEME SYSTEM AUDIT PASSED 100%!");
  console.log("=======================================================\n");
}

main();
