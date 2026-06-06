import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const baseUrl = (process.env.ROUTE_CHECK_BASE_URL || process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const teams = readJson("data/teams.json");
const matches = readJson("data/matches.json");

const mainRoutes = ["/", "/teams", "/matches", "/world-cup-quiz", "/groups"];
const teamRoutes = teams.flatMap((team) => [`/teams/${team.slug}`, `/teams/${team.slug}-world-cup-schedule`]);
const sampleMatchRoutes = matches.slice(0, 12).map((match) => `/matches/${match.slug ?? match.id}`);

const routes = [...mainRoutes, ...teamRoutes, ...sampleMatchRoutes];
const failures = [];

for (const route of routes) {
  const url = `${baseUrl}${route}`;
  try {
    const response = await fetch(url, { redirect: "manual" });
    const ok = response.status === 200;
    console.log(`${ok ? "OK" : "FAIL"} ${response.status} ${route}`);
    if (!ok) failures.push(`${route} => ${response.status}`);
  } catch (error) {
    console.log(`FAIL ERR ${route}`);
    failures.push(`${route} => ${error.message}`);
  }
}

if (failures.length) {
  console.error("\nRoute check failed:");
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`\nRoute check OK: ${routes.length} routes returned 200 from ${baseUrl}.`);

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}
