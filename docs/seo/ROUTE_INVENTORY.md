# Archive SEO V1 — Route & Intent Inventory

Companion to `docs/seo/ARCHIVE_SEO_V1_AUDIT.md`. Covers every generated
route type, grouped as the brief itself groups them (§4). Facts below are
taken directly from source (`app/sitemap.ts`, `app/robots.ts`, each route's
`metadata`/`generateMetadata`), not assumed.

Total generated routes at time of audit: 209 (confirmed by the last clean
`npm run build` — `Generating static pages (209/209)`).

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
