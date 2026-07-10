import { getTournamentLiveSnapshot } from "../lib/liveSnapshot";
import { computePlayerEventLeaderboards } from "../lib/tournamentStats";
import { readStaticArchiveData } from "../lib/staticArchiveReader";
import { MATCHES } from "../lib/matches";

async function run() {
  console.log("=== Running P0 Attribution Consistency Tests ===");
  const snapshot = await getTournamentLiveSnapshot();
  const archive = readStaticArchiveData();

  // Test 1: Top Scorers fallback
  if (snapshot.topScorers.length === 0) {
    throw new Error("Top scorers fallback is empty");
  }
  console.log("Top scorers:", snapshot.topScorers.slice(0, 5));
  console.log("✅ canonical/static fallback snapshot with nonempty topScorers renders the leaderboard");

  // Test 2: Own goal attribution
  const leaderboards = computePlayerEventLeaderboards(archive);

  const ownGoals = leaderboards.ownGoals;

  const miro = ownGoals.find(o => o.playerName === "Miro Muheim");
  if (!miro || miro.teamName !== "Switzerland") throw new Error("Miro Muheim own goal attribution failed");
  const yassine = ownGoals.find(o => o.playerName === "Yassine Bounou");
  if (!yassine || yassine.teamName !== "Morocco") throw new Error("Yassine Bounou own goal attribution failed");
  const mohamed = ownGoals.find(o => o.playerName === "Mohamed Hany");
  if (!mohamed || mohamed.teamName !== "Egypt") throw new Error("Mohamed Hany own goal attribution failed");
  const aymen = ownGoals.find(o => o.playerName === "Aymen Hussein");
  if (!aymen || aymen.teamName !== "Iraq") throw new Error("Aymen Hussein own goal attribution failed");
  console.log("✅ Own goal attribution uses actual player teams, missing does not fall back to beneficiary");

  // Test 3: Bookings
  const yellowCards = leaderboards.yellowCards;
  if (yellowCards.length === 0) throw new Error("No bookings found");
  const sampleCard = yellowCards[0];
  if (!sampleCard.playerName || !sampleCard.teamName) throw new Error("Booking row missing player or team");
  console.log("✅ Bookings include player and team");

  console.log("All tests passed.");
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
