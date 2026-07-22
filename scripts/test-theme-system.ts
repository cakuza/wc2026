import fs from "fs";
import path from "path";
import {
  isTheme,
  THEME_STORAGE_KEY,
  DARK_THEME_COLOR,
  LIGHT_THEME_COLOR,
} from "../lib/theme";
import { ARCHIVE_DESKTOP_LINKS, ARCHIVE_PRIMARY_LINKS } from "../lib/navLinks";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  PASS ${message}`);
}

async function runTests() {
  console.log("=== Running Deterministic Day/Night Theme & Vault Test Suite ===");

  // 1. Theme Helper Function Verification
  console.log("\n--- 1. Theme Helper Logic ---");
  assert(isTheme("light") === true, "isTheme('light') returns true");
  assert(isTheme("dark") === true, "isTheme('dark') returns true");
  assert(isTheme("blue") === false, "isTheme('blue') returns false");
  assert(isTheme(null) === false, "isTheme(null) returns false");
  assert(THEME_STORAGE_KEY === "wcmd-theme", "Storage key is 'wcmd-theme'");
  assert(DARK_THEME_COLOR === "#0a1628", "DARK_THEME_COLOR is #0a1628");
  assert(LIGHT_THEME_COLOR === "#f5f4f0", "LIGHT_THEME_COLOR is #f5f4f0");

  // 2. CSS & Tailwind Token Architecture Verification
  console.log("\n--- 2. CSS & Tailwind Token Architecture ---");
  const globalsCss = fs.readFileSync(path.join(process.cwd(), "app/globals.css"), "utf-8");
  assert(globalsCss.includes('[data-theme="dark"]'), "globals.css contains [data-theme=\"dark\"] selector");
  assert(globalsCss.includes('[data-theme="light"]'), "globals.css contains [data-theme=\"light\"] selector");
  assert(globalsCss.includes("--color-canvas:"), "globals.css defines --color-canvas");
  assert(globalsCss.includes("--color-surface:"), "globals.css defines --color-surface");
  assert(globalsCss.includes("--color-header:"), "globals.css defines --color-header");
  assert(globalsCss.includes("--color-ink:"), "globals.css defines --color-ink");
  assert(globalsCss.includes("--color-muted:"), "globals.css defines --color-muted");
  assert(globalsCss.includes("--color-line:"), "globals.css defines --color-line");
  assert(globalsCss.includes("@keyframes theme-wipe-down"), "globals.css defines @keyframes theme-wipe-down");
  assert(globalsCss.includes("::view-transition-new(root)"), "globals.css defines ::view-transition-new(root)");

  const tailwindConfig = fs.readFileSync(path.join(process.cwd(), "tailwind.config.ts"), "utf-8");
  assert(tailwindConfig.includes("canvas: \"rgb(var(--color-canvas) / <alpha-value>)\""), "tailwind.config.ts defines canvas color token");
  assert(tailwindConfig.includes("surface: \"rgb(var(--color-surface) / <alpha-value>)\""), "tailwind.config.ts defines surface color token");
  assert(tailwindConfig.includes("ink: \"rgb(var(--color-ink) / <alpha-value>)\""), "tailwind.config.ts defines ink color token");

  // 3. Repository-Wide Semantic Token Scan
  console.log("\n--- 3. Repository-Wide Token Scan ---");
  function walkDir(dir: string, fileList: string[] = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        walkDir(filePath, fileList);
      } else if (filePath.endsWith(".tsx") || filePath.endsWith(".ts")) {
        fileList.push(filePath);
      }
    }
    return fileList;
  }

  const sourceFiles = [...walkDir("app"), ...walkDir("components")];
  let unmigratedCount = 0;
  for (const file of sourceFiles) {
    if (file.endsWith("theme.ts") || file.endsWith("ThemeProvider.tsx") || file.endsWith("ThemeToggle.tsx")) {
      continue;
    }
    const content = fs.readFileSync(file, "utf-8");
    const hardcodedNavy = content.match(/\b(bg-navy|bg-navyCard|bg-\[#0a1628\]|bg-\[#111d2e\])\b/g);
    if (hardcodedNavy) {
      console.error(`Unmigrated file found: ${file}`, hardcodedNavy);
      unmigratedCount++;
    }
  }
  assert(unmigratedCount === 0, "Zero unmigrated bg-navy / bg-navyCard classes remain in app/ and components/");

  // 4. Layout Inline Script & Metadata Verification
  console.log("\n--- 4. Root Layout & Pre-Hydration Initialization ---");
  const layoutTsx = fs.readFileSync(path.join(process.cwd(), "app/layout.tsx"), "utf-8");
  assert(layoutTsx.includes("suppressHydrationWarning"), "app/layout.tsx sets suppressHydrationWarning on <html>");
  assert(layoutTsx.includes("themeScript"), "app/layout.tsx defines themeScript");
  assert(layoutTsx.includes("ThemeProvider"), "app/layout.tsx wraps children in ThemeProvider");
  assert(layoutTsx.includes("bg-canvas text-ink"), "app/layout.tsx body uses bg-canvas text-ink");
  assert(layoutTsx.includes("<meta name=\"theme-color\" content=\"#0a1628\" />"), "app/layout.tsx includes static theme-color meta tag");

  // 5. Vault Navigation Wording Consistency
  console.log("\n--- 5. Vault Navigation Wording ---");
  assert(ARCHIVE_DESKTOP_LINKS[0].label === "2026 Vault", "ARCHIVE_DESKTOP_LINKS label is '2026 Vault'");
  assert(ARCHIVE_PRIMARY_LINKS[0].label === "2026 Vault", "ARCHIVE_PRIMARY_LINKS label is '2026 Vault'");

  console.log("\n===========================================================");
  console.log("  ALL DETERMINISTIC THEME & VAULT TESTS PASSED CLEANLY!");
  console.log("===========================================================\n");
}

runTests().catch((err) => {
  console.error("Unhandled test error:", err);
  process.exit(1);
});
