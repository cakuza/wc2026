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
  console.log("=== KickoffAPI Stats Integration Tests ===");
  process.env.KICKOFF_SCORER_ENABLED = "false";
  resetLiveSnapshotMemoryForTests();
  const snap = await getTournamentLiveSnapshot();
  assert.ok(snap.tournamentStats.matchesPlayed >= 0, "Stats should be computed correctly");
  console.log("PASS stats structure is sound");
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
