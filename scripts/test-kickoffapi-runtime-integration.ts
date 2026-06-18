import fs from "fs";
const env = fs.readFileSync(".env", "utf8");
env.split("\n").forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
});
import assert from "node:assert";
import "./mock-server-only";
import { getTournamentLiveSnapshot, resetLiveSnapshotMemoryForTests } from "../lib/liveSnapshot";

async function run() {
  console.log("=== KickoffAPI Runtime Integration Tests ===");
  process.env.KICKOFF_SCORER_ENABLED = "false";
  resetLiveSnapshotMemoryForTests();
  const snap = await getTournamentLiveSnapshot();
  const hasKickoff = Object.values(snap.matches).some(m => m.scorers.some(s => s.provider === "kickoffapi"));
  assert.strictEqual(hasKickoff, false, "Should have no kickoffapi goals when disabled");
  console.log("PASS feature disabled preserves existing output");
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
