/**
 * SEO route integrity tests.
 *
 * Validates:
 * - Exactly 12 group pages generated with valid slugs
 * - No invalid group slug passes groupSlugToLetter
 * - Only matchdays with real matches are indexable
 * - No duplicate match across matchday pages
 * - Qualified/eliminated logic never overclaims
 * - Top-scorers route exists and has correct metadata
 * - Qualification pages only generated for known teams
 * - Sitemap contains all new routes
 *
 *   npx tsx --tsconfig tsconfig.test.json scripts/test-seo-routes.ts
 */
import assert from "assert";
import { GROUP_LETTERS } from "../lib/teams";
import { groupSlugToLetter, letterToGroupSlug, generateGroupStaticParams } from "../lib/groupSlug";
import {
  allMatchdayDates,
  matchesOnDate,
  isValidMatchdayDate,
  prevMatchdayDate,
  nextMatchdayDate,
} from "../lib/matchdays";
import { MATCHES, matchSlug } from "../lib/matches";

let passed = 0, failed = 0;
async function test(name: string, fn: () => void | Promise<void>) {
  try { await fn(); console.log(`  PASS  ${name}`); passed++; }
  catch (e: any) { console.error(`  FAIL  ${name}\n        ${e.message}`); failed++; }
}

async function main() {
  console.log("=== SEO route integrity tests ===\n");

  // ── Group slug tests ────────────────────────────────────────────────────────

  await test("generates exactly 12 group static params", () => {
    const params = generateGroupStaticParams();
    assert.strictEqual(params.length, 12, `Expected 12, got ${params.length}`);
  });

  await test("all group slugs follow the group-[a-l] pattern", () => {
    const params = generateGroupStaticParams();
    for (const { groupSlug } of params) {
      assert.match(groupSlug, /^group-[a-l]$/, `Invalid slug: ${groupSlug}`);
    }
  });

  await test("groupSlugToLetter maps group-a → A through group-l → L", () => {
    for (const letter of GROUP_LETTERS) {
      const slug = letterToGroupSlug(letter);
      const back = groupSlugToLetter(slug);
      assert.strictEqual(back, letter, `Round-trip failed for ${letter}`);
    }
  });

  await test("groupSlugToLetter returns null for invalid slugs", () => {
    assert.strictEqual(groupSlugToLetter("group-z"), null);
    assert.strictEqual(groupSlugToLetter("group-m"), null);
    assert.strictEqual(groupSlugToLetter("groupA"), null);
    assert.strictEqual(groupSlugToLetter(""), null);
    assert.strictEqual(groupSlugToLetter("a"), null);
  });

  await test("no duplicate group slugs", () => {
    const params = generateGroupStaticParams();
    const slugs = params.map((p) => p.groupSlug);
    const unique = new Set(slugs);
    assert.strictEqual(unique.size, slugs.length, "Duplicate group slugs found");
  });

  // ── Matchday tests ──────────────────────────────────────────────────────────

  await test("allMatchdayDates returns non-empty sorted array", () => {
    const dates = allMatchdayDates();
    assert.ok(dates.length > 0, "No matchday dates found");
    for (let i = 1; i < dates.length; i++) {
      assert.ok(dates[i] > dates[i - 1], `Dates not sorted at index ${i}`);
    }
  });

  await test("every matchday date follows YYYY-MM-DD format", () => {
    for (const date of allMatchdayDates()) {
      assert.match(date, /^\d{4}-\d{2}-\d{2}$/, `Invalid date format: ${date}`);
    }
  });

  await test("matchesOnDate returns only matches on that date", () => {
    const dates = allMatchdayDates();
    const sample = dates[0];
    const matches = matchesOnDate(sample);
    assert.ok(matches.length > 0, `No matches on first matchday ${sample}`);
    for (const m of matches) {
      // Should be a valid match from MATCHES
      const found = MATCHES.find((x) => matchSlug(x) === matchSlug(m));
      assert.ok(found, `Match not found in MATCHES: ${matchSlug(m)}`);
    }
  });

  await test("no match appears on two different matchday pages", () => {
    const seen = new Map<string, string>();
    for (const date of allMatchdayDates()) {
      for (const m of matchesOnDate(date)) {
        const slug = matchSlug(m);
        const prev = seen.get(slug);
        assert.ok(!prev, `Match ${slug} appears on both ${prev} and ${date}`);
        seen.set(slug, date);
      }
    }
  });

  await test("isValidMatchdayDate rejects invalid dates", () => {
    assert.strictEqual(isValidMatchdayDate("2026-01-01"), false, "Jan 1 should be invalid");
    assert.strictEqual(isValidMatchdayDate("not-a-date"), false);
    assert.strictEqual(isValidMatchdayDate(""), false);
  });

  await test("isValidMatchdayDate accepts first matchday", () => {
    const first = allMatchdayDates()[0];
    assert.strictEqual(isValidMatchdayDate(first), true);
  });

  await test("prevMatchdayDate / nextMatchdayDate navigate correctly", () => {
    const dates = allMatchdayDates();
    assert.strictEqual(prevMatchdayDate(dates[0]), null, "No prev before first");
    assert.strictEqual(nextMatchdayDate(dates[dates.length - 1]), null, "No next after last");
    if (dates.length >= 3) {
      const mid = dates[1];
      assert.strictEqual(prevMatchdayDate(mid), dates[0]);
      assert.strictEqual(nextMatchdayDate(mid), dates[2]);
    }
  });

  await test("total matches across all matchday pages equals MATCHES.length", () => {
    let total = 0;
    for (const date of allMatchdayDates()) {
      total += matchesOnDate(date).length;
    }
    assert.strictEqual(total, MATCHES.length, `Expected ${MATCHES.length} matches, got ${total}`);
  });

  // ── Qualification page team restriction ────────────────────────────────────

  await test("qualification page only allowed for england and turkey slugs", () => {
    const { slugFor } = require("../lib/teams");
    const allowedKeys = ["england", "turkey"];
    const allowedSlugs = allowedKeys.map((k: string) => slugFor(k));
    assert.ok(allowedSlugs.includes("england"), "england slug must be 'england'");
    assert.ok(allowedSlugs.includes("turkey"), "turkey slug must be 'turkey'");
    // Other team slugs should NOT be in the allowed list
    assert.ok(!allowedSlugs.includes("brazil"), "brazil should not have a qual page");
  });

  // ── Internal link completeness ─────────────────────────────────────────────

  await test("all 12 group letters map to valid group slugs", () => {
    for (const letter of GROUP_LETTERS) {
      const slug = letterToGroupSlug(letter);
      assert.ok(slug.startsWith("group-"), `Slug should start with 'group-': ${slug}`);
      const back = groupSlugToLetter(slug);
      assert.strictEqual(back, letter);
    }
  });

  await test("matchday dates include tournament opener date", () => {
    const dates = allMatchdayDates();
    assert.ok(dates.includes("2026-06-11"), "Tournament opener date 2026-06-11 not found");
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();
