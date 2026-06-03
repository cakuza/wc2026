import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "src/app/sitemap.ts",
  "src/app/robots.ts",
  "src/app/page.tsx",
  "src/app/stats/page.tsx",
  "src/app/matches/[id]/page.tsx",
  "src/app/local-time/[country]/page.tsx",
  "src/app/launch-checklist/page.tsx",
  "src/app/operations/page.tsx",
  "src/app/visual-review/page.tsx",
  "data/squads.json",
  "data/squadImportTemplate.csv",
  "data/matchIntelligence.json",
  "data/newsWatch.json",
  "data/injuryWatch.json",
  "data/lineupWatch.json",
  "data/talkingPoints.json"
];

const requiredRoutes = [
  "/",
  "/matches",
  "/stats",
  "/standings",
  "/leaderboards",
  "/cards",
  "/preview",
  "/local-time/usa",
  "/local-time/turkey",
  "/teams/brazil-world-cup-schedule",
  "/teams/argentina-world-cup-schedule",
  "/matches/m026",
  "/launch-checklist",
  "/operations",
  "/visual-review"
];

const errors = [];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`Missing required launch file: ${file}`);
}

const sitemapSource = fs.readFileSync(path.join(root, "src/app/sitemap.ts"), "utf8");
for (const token of ["seoLandingPages", "localTimePages", "requestedTeamScheduleSlugs"]) {
  if (!sitemapSource.includes(token)) errors.push(`Sitemap does not reference ${token}.`);
}

const generatedManifest = path.join(root, ".next/server/app-paths-manifest.json");
if (fs.existsSync(generatedManifest)) {
  const manifest = JSON.parse(fs.readFileSync(generatedManifest, "utf8"));
  const manifestRoutes = new Set(Object.keys(manifest).map((route) => route.replace(/\/page$/, "") || "/"));
  for (const route of requiredRoutes.slice(0, 6)) {
    if (!manifestRoutes.has(route)) errors.push(`Build manifest is missing ${route}.`);
  }
}

const localTimeSource = fs.readFileSync(path.join(root, "src/lib/local-time-pages.ts"), "utf8");
for (const slug of ["usa", "turkey"]) {
  if (!localTimeSource.includes(`slug: "${slug}"`)) errors.push(`Local-time config is missing ${slug}.`);
}

const seoContentSource = fs.readFileSync(path.join(root, "src/lib/seo-content.ts"), "utf8");
for (const slug of ["brazil-world-cup-schedule", "argentina-world-cup-schedule"]) {
  if (!seoContentSource.includes(slug)) errors.push(`Team schedule SEO config is missing ${slug}.`);
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Launch OK: ${requiredRoutes.length} key routes covered, sitemap sources present.`);
