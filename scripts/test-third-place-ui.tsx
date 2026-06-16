import React from "react";
import { renderToString } from "react-dom/server";
import assert from "assert";
import { ThirdPlaceTable } from "../components/ThirdPlaceTable";
import { type ThirdPlaceRow } from "../lib/thirdPlaceRanking";
import { LanguageProvider } from "../components/LanguageProvider";

function runTests() {
  console.log("=== Running Third Place UI Tests ===\n");
  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void) {
    try {
      fn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (e: any) {
      console.error(`❌ ${name}`);
      console.error(e.message || e);
      failed++;
    }
  }

  // Create mock rows matching production types
  const mockRows: ThirdPlaceRow[] = [
    { teamKey: "mexico", group: "A", rank: 1, points: 3, goalDifference: 2, goalsFor: 2, goalsAgainst: 0, played: 1, wins: 1, draws: 0, losses: 0, status: "qualifying", rankLabel: "1", tieUnresolved: false },
    { teamKey: "south-africa", group: "B", rank: 2, points: 3, goalDifference: 1, goalsFor: 2, goalsAgainst: 0, played: 1, wins: 1, draws: 0, losses: 0, status: "qualifying", rankLabel: "2", tieUnresolved: false },
    { teamKey: "south-korea", group: "C", rank: 3, points: 1, goalDifference: 0, goalsFor: 1, goalsAgainst: 0, played: 1, wins: 0, draws: 1, losses: 0, status: "qualifying", rankLabel: "3", tieUnresolved: false },
    { teamKey: "czechia", group: "D", rank: 4, points: 1, goalDifference: 0, goalsFor: 0, goalsAgainst: 0, played: 1, wins: 0, draws: 1, losses: 0, status: "qualifying", rankLabel: "4", tieUnresolved: false },
    { teamKey: "brazil", group: "E", rank: 5, points: 0, goalDifference: -1, goalsFor: 0, goalsAgainst: 0, played: 1, wins: 0, draws: 0, losses: 1, status: "qualifying", rankLabel: "5", tieUnresolved: false },
    { teamKey: "italy", group: "F", rank: 6, points: 0, goalDifference: -1, goalsFor: 0, goalsAgainst: 0, played: 1, wins: 0, draws: 0, losses: 1, status: "qualifying", rankLabel: "6", tieUnresolved: false },
    { teamKey: "spain", group: "G", rank: 7, points: 0, goalDifference: -2, goalsFor: 0, goalsAgainst: 0, played: 1, wins: 0, draws: 0, losses: 1, status: "qualifying", rankLabel: "7", tieUnresolved: false },
    { teamKey: "argentina", group: "H", rank: 8, points: 0, goalDifference: -2, goalsFor: 0, goalsAgainst: 0, played: 1, wins: 0, draws: 0, losses: 1, status: "qualifying", rankLabel: "8", tieUnresolved: false },
    { teamKey: "france", group: "I", rank: 9, points: 0, goalDifference: -3, goalsFor: 0, goalsAgainst: 0, played: 1, wins: 0, draws: 0, losses: 1, status: "outside", rankLabel: "9", tieUnresolved: false },
    { teamKey: "germany", group: "J", rank: 10, points: 0, goalDifference: 0, goalsFor: 0, goalsAgainst: 0, played: 0, wins: 0, draws: 0, losses: 0, status: "not_started", rankLabel: "10", tieUnresolved: false }, // P=0
    { teamKey: "england", group: "K", rank: 11, points: 0, goalDifference: 0, goalsFor: 0, goalsAgainst: 0, played: 0, wins: 0, draws: 0, losses: 0, status: "not_started", rankLabel: "11", tieUnresolved: false }, // P=0
    { teamKey: "portugal", group: "L", rank: 12, points: 0, goalDifference: 0, goalsFor: 0, goalsAgainst: 0, played: 0, wins: 0, draws: 0, losses: 0, status: "not_started", rankLabel: "12", tieUnresolved: false }, // P=0
  ];

  test("1. P=0 rows render cleanly without rank artifacts or cut lines", () => {
    const html = renderToString(
      React.createElement(LanguageProvider, null,
        React.createElement(ThirdPlaceTable, { rows: mockRows })
      )
    );

    // "Not started" should be visible 3 times (for Germany, England, Portugal)
    const notStartedMatches = html.match(/Not started/g);
    assert.strictEqual(notStartedMatches?.length, 3, "Should show 'Not started' for all 3 P=0 rows");

    // "Tied at cut line" must NOT be present anywhere
    assert.strictEqual(html.includes("Tied at cut line"), false, "Tied at cut line should not be visible for P=0");

    // The "=" marker for shared ranks should not be present for the unstarted rows.
    // The rank column renders a `div` containing the rank string.
    assert.strictEqual(html.includes("10="), false);
    assert.strictEqual(html.includes("11="), false);
    assert.strictEqual(html.includes("12="), false);

    // The cut-line divider class "border-b-2" is only applied when i===7 AND status !== "not_started"
    // Since Argentina is at index 7 and is "qualifying", it SHOULD have the divider.
    const cutlineMatches = html.match(/border-b-2/g);
    assert.ok(cutlineMatches && cutlineMatches.length > 0, "Cut line should be applied to Argentina");
  });

  test("2. Played rows retain correct qualifying/outside states", () => {
    const html = renderToString(
      React.createElement(LanguageProvider, null,
        React.createElement(ThirdPlaceTable, { rows: mockRows })
      )
    );
    assert.strictEqual(html.includes("Inside top 8"), true);
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}

runTests();
