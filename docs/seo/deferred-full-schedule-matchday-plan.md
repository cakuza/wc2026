# Deferred: Full Schedule Permanent Matchday Pages

**Status:** BLOCKED — canonical knockout schedule incomplete  
**Deferred from:** `seo/intent-clusters-freshness-v1` (PR #7)  
**Blocking fact:** `lib/matches.ts` contains 72 group-stage matches (IDs 1–72). The full tournament requires 104 matches. The 32 knockout-stage matches are absent.

---

## What must be acquired before this task begins

### 1. Official fixture data — 32 knockout matches

All data must originate from the official FIFA 2026 source and be independently represented as atomic schedule facts. Do not scrape or closely copy editorial text.

Required for each match (IDs 73–104):

| Field | Example | Notes |
|---|---|---|
| `id` | 73 | Sequential, continues from group stage |
| `stage` | `"R32"` | One of: R32, R16, QF, SF, 3P, F |
| `date` | `"2026-06-29"` | UTC date YYYY-MM-DD |
| `time` | `"18:00"` | UTC kickoff HH:MM |
| `venue` | `"MetLife Stadium"` | Verified venue name |
| `homeKey` | `"winner-match-49"` | Placeholder or resolved key |
| `awayKey` | `"winner-match-50"` | Placeholder or resolved key |
| `homeCode` | TBD | ISO flag code when teams are known |
| `awayCode` | TBD | ISO flag code when teams are known |

### 2. Stage breakdown

| Stage | Matches | IDs | Dates (approx.) |
|---|---|---|---|
| Round of 32 | 16 | 73–88 | Jun 29 – Jul 2 |
| Round of 16 | 8 | 89–96 | Jul 4–5 |
| Quarterfinals | 4 | 97–100 | Jul 7–9 |
| Semifinals | 2 | 101–102 | Jul 12–13 |
| Third place | 1 | 103 | Jul 16 |
| Final | 1 | 104 | Jul 19 |

### 3. Placeholder participant-slot semantics

The knockout bracket uses advancement edges, not fixed team keys at schedule time. The data model must support:

- `homeKey: "winner-match-73"` — slot filled once match 73 concludes
- `awayKey: "runner-up-group-a"` — slot filled once group A concludes
- Resolved keys must update via live snapshot, not re-emit the placeholder in structured data

The current `Match` type in `lib/matches.ts` requires `homeKey`, `homeCode`, `awayKey`, `awayCode` as non-nullable strings. **The type must be extended** before knockout matches can be added. Options:

1. Add optional `homeKeyPlaceholder?: string` alongside required `homeKey` (set once resolved)
2. Create a separate `KnockoutMatch` type that extends `Match` with placeholder support
3. Allow `homeKey` / `awayKey` to be `string | null` and guard downstream consumers

### 4. Bracket advancement edges

Each knockout match must record where its winner/loser advances:

```ts
type BracketEdge = {
  matchId: number;
  winnerAdvancesTo: number | "champion";
  loserAdvancesTo: number | "eliminated" | "third-place-match";
}
```

This is needed to:
- Populate the `/bracket` page with correct paths
- Resolve placeholder participant slots once results are known
- Generate accurate `/matchdays/[date]` pages (who plays whom on each day)

---

## What must be implemented

### `lib/matches.ts` changes

1. Extend `Match` type to support placeholder participants
2. Add 32 knockout matches (IDs 73–104) to the `MATCHES` array with verified dates, times, venues
3. Update `TOURNAMENT_FINAL_DATE` from the string `"19 July 2026"` to an actual `Match` entry

### `lib/matchdays.ts` (to be recreated)

This file was removed from PR #7. It will be re-created when the schedule is complete:

```ts
export function allMatchdayDates(): string[]     // derives from MATCHES (all 104)
export function matchesOnDate(date: string): Match[]
export function isValidMatchdayDate(date: string): boolean
export function prevMatchdayDate(date: string): string | null
export function nextMatchdayDate(date: string): string | null
export function formatMatchdayDate(date: string): string  // "Thursday, 19 July 2026"
```

### `app/matchdays/[date]/page.tsx` (to be recreated)

Permanent SEO pages for each of the 31 matchday dates (Jun 11 – Jul 19):

- `dynamicParams = false` + `generateStaticParams()` from `allMatchdayDates()`
- Unique title: `World Cup 2026 Matches — Thursday, 19 July 2026`
- Unique H1: same
- Canonical: `https://www.worldcupmatchday.com/matchdays/YYYY-MM-DD`
- JSON-LD: `ItemList` of matches; `SportsEvent` for each finished match
  - Finished matches: `eventStatus: "EventCompleted"` (not `EventScheduled`)
  - Scheduled matches: `eventStatus: "EventScheduled"`
- No `onClick` on Server Component elements (previous bug)
- No BreadcrumbList double-emit

### `app/sitemap.ts` changes

Re-add `matchdayPages` spread once route is implemented.

### `lib/indexnow/indexnow.ts` changes

Re-add `matchdayDate` parameter to `urlsForMatchChange()` once route exists.

---

## Tests required before shipping

### Unit / deterministic

- `scripts/test-matchday-schedule-completeness.ts` — assert total = 104, all 31 dates present, no duplicates, covers Jun 11 – Jul 19
- `scripts/test-seo-routes.ts` — restore matchday section: `allMatchdayDates`, `matchesOnDate`, `isValidMatchdayDate`, prev/next nav
- `scripts/test-seo-metadata.ts` — restore matchday title uniqueness, canonical format, noindex assertions
- `scripts/test-seo-rendered.ts` — restore: `/matchdays/2026-07-09` returns 200, `/matchdays/2026-07-19` returns 200, ItemList, SportsEvent (EventCompleted), BreadcrumbList, canonical

### HTTP / rendered

- `/matchdays/2026-06-29` → 200 (first knockout day)
- `/matchdays/2026-07-09` → 200 (QF day — previously failed as example)
- `/matchdays/2026-07-19` → 200 (Final day — was 404)
- `/matchdays/2026-01-01` → 404 (invalid date remains blocked)
- Sitemap includes all 31 matchday URLs

### Provider reconciliation

- Knockout matches must participate in `scoreReconciliation` — ensure `SCHEDULED→LIVE→FINISHED` transitions work
- Placeholder participants must not appear in structured data as `"winner-match-73"`; show `"TBD"` or omit until resolved
- `test-live-snapshot-consistency.ts` must pass with 104-match scope

---

## Acceptance criteria

- [ ] `MATCHES.length === 104`
- [ ] `allMatchdayDates().length === 31` (Jun 11 – Jul 19, 31 distinct dates)
- [ ] `/matchdays/2026-07-09` → HTTP 200
- [ ] `/matchdays/2026-07-19` → HTTP 200
- [ ] Sitemap includes all 31 matchday URLs
- [ ] No SportsEvent block emits `eventStatus: "EventScheduled"` for a FINISHED match
- [ ] No placeholder participant key leaks into structured data
- [ ] `tsc --noEmit` CLEAN
- [ ] All test suites pass
- [ ] Do not scrape or closely copy editorial text; atomic fixture data sourced from official FIFA material

---

## What NOT to do in this task

- Do not add speculative or unverified dates/venues
- Do not use editorial match descriptions from third-party sites without transformation
- Do not re-enable IndexNow submissions in Preview
- Do not merge until all acceptance criteria pass against real external Preview
