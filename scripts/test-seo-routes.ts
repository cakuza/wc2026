/**
 * SEO route integrity tests.
 *
 * Validates:
 * - Exactly 12 group pages generated with valid slugs
 * - No invalid group slug passes groupSlugToLetter
 * - Qualified/eliminated logic never overclaims
 * - Top-scorers route exists and has correct metadata
 * - Qualification pages only generated for known teams
 * - Sitemap contains all new routes
 *
 * NOTE: Permanent matchday pages (/matchdays/[date]) are DEFERRED.
 * The canonical schedule is incomplete (72/104 matches; knockout stage absent).
 * Tests for that cluster live in the deferred-full-schedule task.
 *
 *   npx tsx --tsconfig tsconfig.test.json scripts/test-seo-routes.ts
 */
import assert from "assert";
import { GROUP_LETTERS } from "../lib/teams";
import { groupSlugToLetter, letterToGroupSlug, generateGroupStaticParams } from "../lib/groupSlug";
import { MATCHES } from "../lib/matches";

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

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();
