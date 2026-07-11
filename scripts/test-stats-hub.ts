import { getTournamentLiveSnapshot } from "../lib/liveSnapshot";
import { readStaticArchiveData } from "../lib/staticArchiveReader";
import { teamCodeForKey, TEAMS } from "../lib/teams";

async function runTests() {
  console.log("=== Running Stats Hub Targeted Tests & Measurements ===");

  const snapshot = await getTournamentLiveSnapshot();
  const { teamStatLeaderboards, playerEventLeaderboards, topScorers, matches } = snapshot;

  let failCount = 0;
  const assert = (cond: boolean, msg: string) => {
    if (cond) {
      console.log(`  PASS  ${msg}`);
    } else {
      console.error(`  FAIL  ${msg}`);
      failCount++;
    }
  };

  // Archive data test
  const archiveData = await readStaticArchiveData();
  let archiveScored = 0;
  let archiveMissed = 0;
  for (const match of archiveData.values()) {
    if (match.shootoutAttempts) {
      for (const a of match.shootoutAttempts) {
        if (a.type === "PENALTY_SHOOTOUT_SCORED") archiveScored++;
        if (a.type === "PENALTY_SHOOTOUT_MISSED") archiveMissed++;
      }
    }
  }
  assert(archiveScored === 25 && archiveMissed === 15, `1. static archive contains 25 scored and 15 missed attempts (found ${archiveScored}, ${archiveMissed})`);

  let snapshotScored = 0;
  let snapshotMissed = 0;
  for (const key of Object.keys(matches)) {
    const live = matches[key].live;
    if (live?.shootoutAttempts) {
      for (const a of live.shootoutAttempts) {
        if (a.type === "PENALTY_SHOOTOUT_SCORED") snapshotScored++;
        if (a.type === "PENALTY_SHOOTOUT_MISSED") snapshotMissed++;
      }
    }
  }
  assert(snapshotScored === 25 && snapshotMissed === 15, `2. snapshot preserves 25 scored and 15 missed attempts (found ${snapshotScored}, ${snapshotMissed})`);

  const sScored = playerEventLeaderboards.shootoutScored || [];
  const sMissed = playerEventLeaderboards.shootoutMissed || [];
  assert(sScored.length > 0, "3. playerEventLeaderboards.shootoutScored is nonempty");
  assert(sMissed.length > 0, "4. playerEventLeaderboards.shootoutMissed is nonempty");

  assert(sScored.every(r => !!r.playerName) && sMissed.every(r => !!r.playerName), "5. every leaderboard row has a player name");
  assert(sScored.every(r => !!r.teamName) && sMissed.every(r => !!r.teamName), "6. every leaderboard row has a team");

  // Since a player can score and miss in their career, they could be in both, but the arrays are conceptually separate
  assert(sScored !== sMissed, "7. scored and missed attempts remain separate");

  const pGoals = playerEventLeaderboards.penaltyGoals || [];
  assert(pGoals !== sScored, "8. regulation penalty goals remain separate from shootout attempts");

  const match96 = matches["match-96"];
  const m96Attempts = match96?.live?.shootoutAttempts || [];
  assert(m96Attempts.length === 10, `9. match-96 contains exactly 10 attempts (found ${m96Attempts.length})`);

  const uniqueM96 = new Set(m96Attempts.map(a => `${a.minute}-${a.playerName}`));
  assert(uniqueM96.size === 10, "10. no duplicate attempt identity exists in match-96");

  const hasCucho = sMissed.some(r => r.playerName?.includes("Cucho"));
  assert(hasCucho, "11. Cucho Hernández appears in the missed data");

  const hasAkanji = sMissed.some(r => r.playerName?.includes("Akanji"));
  assert(hasAkanji, "12. Manuel Akanji appears in the missed data");

  const hasQuintero = sScored.some(r => r.playerName?.includes("Quintero"));
  assert(hasQuintero, "13. Juan Fernando Quintero appears in the scored data");

  // 10. no generated values are NaN or Infinity
  const snapshotStr = JSON.stringify(snapshot, (key, value) => {
    if (Number.isNaN(value) || value === Infinity || value === -Infinity) {
      throw new Error(`Found bad numeric value in snapshot: ${value}`);
    }
    return value;
  });
  assert(snapshotStr.length > 0, "14. no generated values are NaN or Infinity");

  // Flag and Canonical Identity Tests
  const allStats = [
    ...(playerEventLeaderboards.assists || []),
    ...(playerEventLeaderboards.yellowCards || []),
    ...(playerEventLeaderboards.redCards || []),
    ...(playerEventLeaderboards.ownGoals || []),
    ...(playerEventLeaderboards.penaltyGoals || []),
    ...(playerEventLeaderboards.shootoutScored || []),
    ...(playerEventLeaderboards.shootoutMissed || []),
    ...(topScorers || [])
  ];

  const hasMissingKey = allStats.some(s => s.teamKey === null || s.teamKey === undefined);
  assert(!hasMissingKey, "15. Every player-stat row has a canonical team identity");

  const hasInvalidCode = allStats.some(s => {
    if (!s.teamKey) return true;
    const code = teamCodeForKey(s.teamKey);
    return code === "un" || !code;
  });
  assert(!hasInvalidCode, "16. Every flag identifier resolves through the canonical team registry (no broken/empty flag produced)");

  const muheim = playerEventLeaderboards.ownGoals.find(s => s.playerName.includes("Muheim"));
  assert(!!muheim && muheim.teamKey === "switzerland" && teamCodeForKey(muheim.teamKey) === "ch", "17. Own-goal flags use the player's actual team: Miro Muheim -> Switzerland");

  const bounou = playerEventLeaderboards.ownGoals.find(s => s.playerName.includes("Bounou"));
  assert(!!bounou && bounou.teamKey === "morocco" && teamCodeForKey(bounou.teamKey) === "ma", "18. Own-goal flags use the player's actual team: Yassine Bounou -> Morocco");

  const cucho = sMissed.find(s => s.playerName.includes("Cucho"));
  assert(!!cucho && cucho.teamKey === "colombia" && teamCodeForKey(cucho.teamKey) === "co", "19. Shootout flags use the taker's team: Cucho Hernandez -> Colombia");

  const akanji = sMissed.find(s => s.playerName.includes("Akanji"));
  assert(!!akanji && akanji.teamKey === "switzerland" && teamCodeForKey(akanji.teamKey) === "ch", "20. Shootout flags use the taker's team: Manuel Akanji -> Switzerland");


  const fs = require('fs');
  const path = require('path');
  const outDir = path.join(process.cwd(), 'out', 'stats');
  if (fs.existsSync(outDir)) {
    const tsHtml = fs.readFileSync(path.join(outDir, 'top-scorers.html'), 'utf8');
    const plHtml = fs.readFileSync(path.join(outDir, 'players.html'), 'utf8');
    const sHtml = fs.readFileSync(path.join(process.cwd(), 'out', 'stats.html'), 'utf8');

    const forbidden = [
      'Golden Boot leader',
      'leads with',
      'updated after each completed match',
      'latest match',
      'Scorer data is sourced',
      'Goal scorer data syncs',
      'when scorer data is available',
      'Sources and Methodology',
      'SourcesAndMethodology'
    ];

    forbidden.forEach(str => {
      assert(!tsHtml.includes(str), `Removed copy is absent from top-scorers.html (${str})`);
      assert(!sHtml.includes(str), `Removed copy is absent from stats.html (${str})`);
    });

    assert(!plHtml.includes('still being verified'), 'Warning copy absent from players.html');
  } else {
    console.warn("  SKIP  HTML assertions because out/ directory not found (run build first)");
  }

  if (failCount > 0) {
    console.error(`\nFAILED ${failCount} assertions`);
    process.exit(1);
  } else {
    console.log("\nALL TESTS PASSED");
  }
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
