# Archive SEO V1 — Route & Intent Inventory

Companion to `docs/seo/ARCHIVE_SEO_V1_AUDIT.md`. Covers every generated
route type, grouped as the brief itself groups them (§4). Facts below are
taken directly from source (`app/sitemap.ts`, `app/robots.ts`, each route's
`metadata`/`generateMetadata`), not assumed.

**Note on the table below:** it documents the state *found by the initial
audit*, before any fixes in this branch. The "Structured data" column for
`/teams/[slug]` originally read "none found" — that was an audit error;
`app/teams/[slug]/page.tsx` already emits `SportsOrganization` and `FAQPage`
schema. See the "Verified post-fix state" section at the end of this
document for the exact, current, test-proven counts and corrections.

Total generated routes at time of the initial audit: 209 (confirmed by the
build's `Generating static pages (209/209)`).

## Route-type table

| Route(s) | Count | Canonical present | Sitemap included | Structured data | Current decision |
|---|---|---|---|---|---|
| `/` | 1 | Yes | Yes (priority 1.0, hourly) | WebSite | **Improve** — archive-mode lifecycle (§ homepage) |
| `/today` (+ `?date=`) | 1 route, N param views | Yes (base); dated views intentionally `noindex,follow` | Yes (base only) | none found | **Improve** — state-aware completion transition; keep indexable |
| `/schedule` | 1 | Yes | Yes | none found | **Keep** — no redirect/noindex per brief's explicit prohibition |
| `/schedule/[zone]` | 7 (timezone slugs) | Yes, per-zone | Yes | none found | **Keep** |
| `/bracket` | 1 | Yes | Yes | none found | **Improve** — weakest-ranking cluster (avg pos 85.73); add post-completion copy |
| `/groups` | 1 | Yes | Yes | none found | **Keep** |
| `/groups/[groupSlug]` | 12 | Yes, per-group | Yes | none found | **Improve** — final-standings framing |
| `/teams` | 1 | Yes | Yes | none found | **Keep** |
| `/teams/[slug]` | 48 | Yes, per-team | Yes | none found | **Improve** — permanent archive framing, esp. Turkey/England/Brazil/France/Spain/Argentina |
| `/teams/[slug]/qualification` | 2 (england, turkey only) | Yes | Yes | none found | **Keep** — narrow, intentional scope |
| `/matches/[matchId]` | 104 | Yes, per-match | **No — 0 of 104 in sitemap** | none found | **Fix** — add to sitemap (§ Technical indexation) |
| `/stats` | 1 | Yes | Yes | none found | **Improve** — above-the-fold answers, worst-ranking high-volume cluster |
| `/stats/top-scorers` | 1 | Yes | Yes | ItemList, BreadcrumbList | **Keep**, minor metadata polish |
| `/stats/players` | 1 | Yes | **No — missing from sitemap** | none found | **Fix** — add to sitemap |
| `/stats/teams` | 1 | Yes | **No — missing from sitemap** | none found | **Fix** — add to sitemap |
| `/stats/compare` | 1 | Yes | **No — missing from sitemap** | none found | **Fix** — add to sitemap |
| `/stats/matches` | 1 | Yes | **No — missing from sitemap** | none found | **Fix** — add to sitemap |
| `/world-cup-third-place-qualification` | 1 | Yes | Yes | check per-page | **Keep** — already converts (1.62% CTR) |
| `/world-cup-2026-teams-by-confederation` | 1 | Yes | Yes | check per-page | **Keep** — best small-cluster performer |
| `/world-cup-2026-prize-money` | 1 | Yes | Yes | check per-page | **Improve** — good position (10.38), zero clicks; metadata rewrite |
| `/world-cup-2026-knockout-bracket-explained` | 1 | Yes | Yes | check per-page | **Keep** |
| `/world-cup-2026-format-explained` | 1 | Yes | Yes | check per-page | **Keep** |
| `/world-cup-2026-group-tiebreakers` | 1 | Yes | Yes | check per-page | **Keep** |
| `/world-cup-2026-data-sources` | 1 | Yes | Yes | check per-page | **Keep** |
| `/world-cup-schedule-local-time` | 1 | Yes | Yes | none found | **Keep** |
| `/qualified-eliminated-teams` | 1 | Yes | Yes | none found | **Keep** — good position, no clicks; metadata candidate |
| `/matchday-hub` | 1 | Yes | Yes | none found | **Keep** |
| `/faq`, `/about`, `/contact`, `/privacy`, `/terms`, `/quiz` | 6 | Yes | Yes | FAQ (faq only) | **Keep** — `/about` copy needs freshness-language audit (§9) |
| `sitemap.xml` | 1 | n/a | n/a | n/a | **Fix** — missing 108 URLs (104 matches + 4 stats sub-pages) |
| `robots.txt` | 1 | n/a | n/a | n/a | **No change** — `allow: "/"` for all agents, correctly points at sitemap |
| 404 handling | 1 (`app/not-found`-style) | n/a | n/a | n/a | Verified: hitting a nonexistent route returns a real 404 status (confirmed during prior PR #30 production QA), not a soft-404. No fix needed. |
| Redirects | 0 found | — | — | — | No `redirects()` entries in `next.config.js`; the 3 "Page with redirect" and 4 "Alternative page with proper canonical tag" coverage rows could not be attributed to a specific route from static code alone — classified **unresolved**, needs interactive Search Console URL inspection (owner action). |

## New routes this branch adds

| Route | Type | Sitemap | Structured data | Notes |
|---|---|---|---|---|
| `/world-cup-2026` | Archive hub | Yes | WebSite/CollectionPage + BreadcrumbList | Lifecycle-aware; see `lib/archiveLifecycle.ts` |
| `/world-cup-2026/results` | Results archive | Yes | ItemList + BreadcrumbList | Links every match; no client JS required for content |
| `/world-cup-2026/results/[date]` | Selected date archives | Yes, only for evidenced dates | ItemList + BreadcrumbList | See §6 of the audit + selection rationale below |

## Date-page selection rationale

GSC-evidenced dates (§5 of the audit): July 3, 4, 5, 6, 7, 8, 9, 10, 11, 12.
Plus structurally distinctive tournament dates the brief explicitly
requires regardless of current query volume (opener, quarterfinal day(s),
semifinal days, third-place day, final day): June 11 (opener), July 9–11
(quarterfinals, already covered by GSC dates above), July 14 and 15
(semifinals), July 18 (third-place), July 19 (final).

**Selected for this PR: June 11, July 3–12, July 14, July 15, July 18, July
19** — every date with either explicit GSC query evidence or genuine
tournament-structure distinctiveness. Every other calendar date in the
tournament window is deliberately **not** built as an indexable page in this
PR: the brief is explicit ("do not mass-generate thin daily pages merely to
increase URL count"), and non-selected dates have neither query evidence nor
structural distinctiveness. July 18 and July 19 pages are only populated
(and only added to the sitemap) once Match 103 / Match 104 are canonically
final — otherwise the derived "as of date" snapshot cannot be truthfully
computed yet, per the brief's explicit prohibition on showing final totals
on an undeserved snapshot.

## Verified post-fix state (exact counts, `test-seo-technical-audit.ts` run against a fresh build)

| Metric | Count |
|---|---|
| Next.js-reported generated pages | 224 |
| `.html` documents in `out/` | 217 |
| Sitemap (`sitemap.xml`) URLs | 216 |
| Routes intentionally excluded from sitemap | 1 — `/404.html` (error page; never included in a content sitemap) |
| Non-`.html` generated infrastructure files (not routes) | 7 — `robots.txt`, `sitemap.xml`, `favicon.ico`, `icon.png`, `apple-icon.png`, `og-default.png`, `ads.txt` |
| `/matches/[matchId]` pages in sitemap | 104 of 104 (exact match against `MATCHES.length`) |
| `/stats`, `/stats/top-scorers`, `/stats/players`, `/stats/teams`, `/stats/compare` in sitemap | 5 of 5 |
| Archive hub + full results in sitemap | 2 of 2 (`/world-cup-2026`, `/world-cup-2026/results`) |
| Date archive pages in sitemap | 13 of 15 candidates (see below) |

Reconciliation: 224 (Next's count) = 217 `.html` documents + 7 non-`.html`
infrastructure files. 217 `.html` documents = 216 sitemap URLs + 1
intentionally excluded (`/404`). No route is silently dropped or
unaccounted for. All 34 checks (technical-audit run before this table) and
the additional exact-count assertions below pass.

**Correction to the table above:** `/teams/[slug]` already emits
`SportsOrganization` and `FAQPage` JSON-LD (found via exhaustive `"@type"`
grep across the entire codebase and the generated `out/` HTML — every
`@type` value that exists anywhere in this repository is: `WebSite`,
`BreadcrumbList`, `ListItem`, `SearchAction`, `EntryPoint`, `FAQPage`,
`Question`, `Answer`, `WebPage`, `SportsEvent`, `Place`, `SportsTeam`,
`SportsOrganization`, `ItemList`, `CollectionPage`. **No `Product` schema
exists anywhere in source or generated output.** GSC's reported "Product
snippets" search appearance (§3 of the audit doc) does not correspond to
any current markup this repository emits — most plausibly a stale
classification from an earlier crawl. No code fix is possible for a schema
type that isn't emitted; flagged for GSC monitoring only.

## Date archive pages — exact per-date data (2026-07-16 canonical snapshot)

15 candidate dates (`lib/archiveDates.ts`); **13 built and sitemapped**, 2
gated. A date is only built once `isDateFullyResolved` confirms every match
up to and including it has a final result (see `lib/archiveLifecycle.ts`).

| Date | Selection reason | Matches that day | Cumulative matches | Cumulative goals | Cumulative clean sheets | Top scorer as of that date |
|---|---|---|---|---|---|---|
| 2026-06-11 | Opening-day policy | 2 | 2 | 5 | 1 | Julián Quiñones (1) |
| 2026-07-03 | GSC query demand | 3 | 88 | 257 | 47 | Lionel Messi (7) |
| 2026-07-04 | GSC query demand | 2 | 90 | 261 | 49 | Lionel Messi (7) |
| 2026-07-05 | GSC query demand | 2 | 92 | 269 | 49 | Erling Haaland (7) |
| 2026-07-06 | GSC query demand | 2 | 94 | 275 | 50 | Erling Haaland (7) |
| 2026-07-07 | GSC query demand | 2 | 96 | 280 | 52 | Lionel Messi (8) |
| 2026-07-08 | GSC query demand | 0 (rest day) | 96 | 280 | 52 | Lionel Messi (8) |
| 2026-07-09 | Quarterfinal-day policy + GSC demand | 1 | 97 | 282 | 53 | Lionel Messi (8) |
| 2026-07-10 | Quarterfinal-day policy + GSC demand | 1 | 98 | 285 | 53 | Lionel Messi (8) |
| 2026-07-11 | Quarterfinal-day policy + GSC demand | 2 | 100 | 292 | 53 | Lionel Messi (8) |
| 2026-07-12 | GSC query demand (rest day between QF and SF) | 0 (rest day) | 100 | 292 | 53 | Lionel Messi (8) |
| 2026-07-14 | Semifinal-day policy | 1 | 101 | 294 | 54 | Lionel Messi (8) |
| 2026-07-15 | Semifinal-day policy | 1 | 102 | 297 | 54 | Lionel Messi (8) |
| 2026-07-18 *(gated)* | Third-place-day policy | — | — | — | — | not yet resolved |
| 2026-07-19 *(gated)* | Final-day policy | — | — | — | — | not yet resolved |

July 15's cumulative totals (102 matches, 297 goals, 54 clean sheets) match
the canonical tournament totals verified independently elsewhere in this
repository's test suite — confirming the as-of-date aggregator is correct,
not just internally consistent.

**The two gated dates, explained:** 2026-07-18 (Third-place playoff) and
2026-07-19 (Final) are excluded from both `generateStaticParams` (so the
page literally does not exist yet) and the sitemap, because
`isDateFullyResolved` requires every match up to and including that date to
be canonically final — Match 103 and Match 104 are still scheduled as of
this snapshot. Once either match completes, the next build will
automatically generate and sitemap that date's page with a truthful
cumulative snapshot — no code change required, and no risk of showing
final-tournament totals on a page dated before the tournament actually
reached that point.

**Correcting the earlier report's "13 of 15" ambiguity:** 13 of the 15
*candidate* dates are currently built, sitemapped, and indexable; the
remaining 2 are not missing or broken — they are deliberately not yet
generated, gated on real match completion, exactly as designed.

Every built date page links to the full results archive, and to its
immediate chronological neighbor(s) among *other built* date pages (prev/next
navigation skips gated dates entirely, so no link ever points at a
non-existent page) — see the "previous/next tournament date" links rendered
in `app/world-cup-2026/results/[date]/page.tsx`. `/world-cup-2026/results`
itself now includes a "Browse by Date" section linking every built date page
(added in this follow-up — the initial PR left date pages reachable only via
sitemap discovery or prev/next chaining *after* already landing on one,
which meant they had no entry point from the results archive at all; see
`test-seo-date-archive.ts` for the permanent no-orphan-page test).

## Internal-link check (static-HTML reachability)

- Homepage → archive hub: added (§ homepage archive mode).
- Archive hub → results, stats, bracket, teams, groups: added.
- Results archive → every match page: added (104 links, one per match).
- Match page → team pages, stage, and (where applicable) date page: existing
  team links preserved; date-page links added only for matches on a
  selected date.
- Team page → its matches, group, stats: existing links preserved and
  extended per §7.
- No orphan date/archive page: every new route is linked from at least the
  archive hub and the results archive.
