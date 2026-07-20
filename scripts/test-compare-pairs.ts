import assert from "node:assert/strict";
import { resolveCompareTeams } from "../app/stats/compare/TeamCompareClient";

function runTests() {
  console.log("=== Running Compare Valid/Invalid Pairs Tests ===");
  const teamsList = [{ key: "spain" }, { key: "argentina" }];

  // 1. Valid pair
  {
    const { team1, team2 } = resolveCompareTeams(new URLSearchParams("?team1=spain&team2=argentina"), teamsList);
    assert.equal(team1, "spain");
    assert.equal(team2, "argentina");
    console.log("  PASS  Valid pair (spain, argentina)");
  }

  // 2. Invalid team
  {
    const { team1, team2 } = resolveCompareTeams(new URLSearchParams("?team1=spain&team2=fake"), teamsList);
    assert.equal(team1, "spain");
    assert.equal(team2, "");
    console.log("  PASS  Invalid team 2 (spain, fake -> spain, empty)");
  }

  // 3. Same team
  {
    const { team1, team2 } = resolveCompareTeams(new URLSearchParams("?team1=spain&team2=spain"), teamsList);
    assert.equal(team1, "spain");
    assert.equal(team2, "");
    console.log("  PASS  Same team (spain, spain -> spain, empty)");
  }

  // 4. Both invalid
  {
    const { team1, team2 } = resolveCompareTeams(new URLSearchParams("?team1=not&team2=real"), teamsList);
    assert.equal(team1, "");
    assert.equal(team2, "");
    console.log("  PASS  Both invalid (not, real -> empty, empty)");
  }

  // 5. Empty query
  {
    const { team1, team2 } = resolveCompareTeams(new URLSearchParams(""), teamsList);
    assert.equal(team1, "");
    assert.equal(team2, "");
    console.log("  PASS  Empty query -> empty, empty");
  }

  console.log("All compare pairs tests passed.\n");
}

runTests();
