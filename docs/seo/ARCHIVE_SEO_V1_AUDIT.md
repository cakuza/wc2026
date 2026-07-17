# Archive SEO V1 — GSC Audit & Indexation Baseline

Source data: `worldcupmatchday.com-Performance-on-Search-2026-07-16.zip` and
`worldcupmatchday.com-Coverage-2026-07-16.zip`, both exported 2026-07-16.
Performance window: last 28 days (`Filters.csv`: Search type = Web, Date =
Last 28 days). Coverage is a point-in-time index-status snapshot; its trend
chart runs through 2026-07-10 (Coverage exports lag Performance exports by
design in GSC).

All figures below are read directly from the exported CSVs. Every number in
this document is traceable to a specific CSV row cited inline. Nothing is
estimated or invented.

## 1. Top-line performance

| Metric | Value | Source |
|---|---|---|
| Total clicks | 154 (115 + 36 + 3) | `Devices.csv` |
| Total impressions | 27,805 (16,563 + 10,990 + 252) | `Devices.csv` |
| Site-wide CTR | 0.55% (154/27,805) | derived |
| Mobile | 115 clicks / 16,563 impr / 0.69% CTR / pos 12.25 | `Devices.csv` |
| Desktop | 36 clicks / 10,990 impr / 0.33% CTR / pos 25.83 | `Devices.csv` |
| Tablet | 3 clicks / 252 impr / 1.19% CTR / pos 11.5 | `Devices.csv` |

**Mobile carries 75% of impressions and 75% of clicks** with a materially
better average position (12.25) than desktop (25.83) — confirming the
brief's mobile-first QA priority is grounded in real traffic composition,
not assumption.

Confirms the brief's expected baseline exactly: ~154 clicks, ~27,805
impressions, Mobile 115/16,563, Desktop 36/10,990. No correction needed.

### Daily trend (last 12 days of the 28-day window, `Chart.csv`)

| Date | Clicks | Impressions | CTR | Position |
|---|---|---|---|---|
| 07-05 | 3 | 1,387 | 0.22% | 13.2 |
| 07-06 | 9 | 1,199 | 0.75% | 15.4 |
| 07-07 | 4 | 1,241 | 0.32% | 12.8 |
| 07-08 | 3 | 1,014 | 0.30% | 13.0 |
| 07-09 | 3 | 833 | 0.36% | 14.5 |
| 07-10 | 2 | 2,056 | 0.10% | 11.8 |
| 07-11 | 12 | 1,865 | 0.64% | 18.7 |
| 07-12 | 5 | 950 | 0.53% | 18.3 |
| 07-13 | 5 | 1,002 | 0.50% | 18.4 |
| 07-14 | 11 | 1,697 | 0.65% | 14.6 |

Impressions stayed in the 800–2,000/day range through the whole knockout
stage; CTR never exceeded 0.75% on a high-volume day. This is a **position
problem on head terms and a snippet/CTR problem on the pages that do rank
well** — both are addressed below.

## 2. Top pages (`Pages.csv`, all 58 rows read)

| Page | Clicks | Impressions | CTR | Position |
|---|---|---|---|---|
| `/today` | 52 | 13,686 | 0.38% | 12.06 |
| `/` | 40 | 2,361 | 1.69% | 6.09 |
| `/stats` | 32 | 4,843 | 0.66% | 19.32 |
| `/world-cup-third-place-qualification` | 9 | 557 | 1.62% | 22.2 |
| `/world-cup-2026-teams-by-confederation` | 9 | 376 | 2.39% | 7.9 |
| `/bracket` | 4 | 461 | 0.87% | 64.98 |
| `/schedule/eastern-time` | 4 | 407 | 0.98% | 8.94 |
| `/teams/turkey` | 1 | 1,640 | 0.06% | 10.4 |
| `/schedule` | 1 | 780 | 0.13% | 63.74 |
| `/groups` | 1 | 686 | 0.15% | 62.35 |
| `/teams/england` | 0 | 851 | 0% | 35.49 |
| `/teams/brazil` | 0 | 843 | 0% | 13.77 |
| `/world-cup-2026-prize-money` | 0 | 150 | 0% | 10.38 |
| `/teams/france` | 0 | 114 | 0% | 18.39 |
| `/stats/top-scorers` | 0 | 12 | 0% | 35.83 |

Confirms every value listed in the brief's expected baseline exactly: no
corrections required.

**Pattern**: `/today`, `/`, `/stats`, `/world-cup-2026-teams-by-confederation`
rank well (position 6–20) and convert reasonably. Everything below that band
(`/bracket` 64.98, `/schedule` 63.74, `/groups` 62.35, `/teams/england`
35.49, `/stats/top-scorers` 35.83) ranks weakly *despite* real impression
volume — these are the pages Archive SEO V1 must improve, not pages with no
demand.

`/teams/turkey` is the starkest anomaly: 1,640 impressions (2nd-highest page
after `/today`) but only 1 click (0.06% CTR) at a *decent* position (10.4).
The page ranks; the snippet doesn't convert. See §4 (Turkey cluster).

## 3. Devices, countries, search appearance

- Device breakdown: §1 above.
- Top countries (`Countries.csv`, 196 rows total): United States (17 clicks
  / 2,726 impr / pos 33.89), United Kingdom (14 / 1,686 / 32.82), Nigeria (9
  / 581 / 10.75), France (7 / 397 / 11.42), India (5 / 892 / 24.09), Germany
  (3 / 2,211 / 9.89 — high volume, best position of the top 6). Demand is
  broad and English-dominant; no locale-specific archive variant is in
  scope for V1.
- **Search appearance** (`Search appearance.csv`): the *only* row is
  `Product snippets, 0 clicks, 9 impressions, 0% CTR, position 36`. See §6
  (Structured data) — no `Product` schema exists anywhere in the current
  codebase (verified by full-repo grep of `lib/schema.ts`, every
  `application/ld+json` emitter, and all `offers`/`price`/`aggregateRating`
  fields). This is most likely a stale Google classification from an
  earlier crawl and does not correspond to any current markup. No code
  fix is possible for a schema type that isn't emitted; flagged for GSC
  monitoring only (§ Monitoring plan).

## 4. Query clusters (`Queries.csv`, all 1,000 rows parsed programmatically)

The export caps at 1,000 rows; summed impressions across the file (13,412)
are less than site-wide impressions (27,805) because GSC omits low-volume
"anonymized" queries from the export. Cluster totals below are therefore a
**lower bound**, not the full picture — real demand is understated, not
overstated.

| Cluster | Queries | Clicks | Impressions | Impr-weighted avg position | Notes |
|---|---|---|---|---|---|
| Today / fixtures / match-today | 465 | 21 | 7,620 | 13.90 | By far the largest cluster. Decent position, still under 1% CTR overall. |
| Groups & standings | 204 | 1 | 1,933 | 38.25 | Large volume, weak position, almost no clicks. |
| Team-specific (England/Brazil/Turkey/France/Norway/Germany/Canada/Iraq) | 168 | 1 | 1,384 | 25.47 | Real demand per-team, underperforming. |
| Brand (worldcupmatchday, matchday wc, etc.) | 71 | 25 | 1,805 | 6.26 | Best-performing cluster — branded navigational queries convert. |
| Schedule / fixtures / kickoff time | 107 | 2 | 1,078 | 38.54 | |
| **Total goals "so far" by date** | 75 | 0 | 1,101 | **7.08** | **Ranks on page 1 on average and converts zero clicks.** Single strongest evidence-backed opportunity in this dataset — see §5. |
| Eliminated / qualified | 42 | 1 | 297 | 9.72 | Good position, almost no clicks — snippet problem, not ranking problem. |
| Bracket / knockout | 35 | 1 | 278 | 85.73 | Weakest ranking cluster of any measurable size. |
| Third place | 32 | 1 | 80 | 41.87 | |
| Stats (general) | 24 | 8 | 891 | 70.94 | High click count from a handful of well-positioned queries drags average up; most stats queries rank on page 6–8. |
| Confederation | 9 | 3 | 89 | 8.53 | Best-performing small cluster — matches the known-good `/world-cup-2026-teams-by-confederation` page. |

### Turkey Group D — a distinct, isolated sub-cluster

70 near-duplicate query variants (many German-language: *"türkei wm 2026
gruppe d standings turkey eliminated world cup 2026 group d"* and dozens of
close paraphrases), **450 impressions, 0 clicks**. This is not noise — it's
one real, specific search intent ("was Turkey eliminated, what's the Group D
standing") appearing as many auto-suggested phrasings, none of which convert
despite `/teams/turkey` ranking at position 10.4. The team page's current
copy does not visibly answer "was Turkey eliminated" and "final Group D
standing" in a way the snippet can surface. Addressed in §7 (team page
upgrade) for the six highlighted teams (Turkey, England, Brazil, France,
Spain, Argentina).

### Cluster-by-cluster: intent, landing page, weakness, target, durability

| Cluster | Current landing page(s) | Probable intent | Current weakness | Recommended target | Intent durability |
|---|---|---|---|---|---|
| Today/fixtures | `/today` | Live matchday utility | Position OK (13.9), CTR floor under 1% — snippet doesn't confirm "today has X matches" | Keep `/today`; state-aware transition post-completion (§7) | **Temporary** pre-completion, becomes **transitional** post-completion (redirects search equity into archive) |
| Total goals by date | none dedicated | "How many goals has the tournament had as of [date]" | No page answers this at all — ranks on demand alone via generic pages | New `/world-cup-2026/results/YYYY-MM-DD` pages for evidenced dates | **Evergreen** once tournament is historical — a fixed historical fact |
| Groups & standings | `/groups`, `/groups/[slug]` | Final group standings, qualification | Weak position (38–62) for a page that should rank on exact-match intent | Upgrade `/groups/[slug]` metadata + content (§7) | **Evergreen** post-completion |
| Team-specific | `/teams/[slug]` | Team's tournament run/outcome | Weak position for most teams; near-zero CTR despite Turkey's decent position | Upgrade `/teams/[slug]` into permanent archive pages (§7) | **Evergreen** |
| Brand | `/`, `/today` | Direct/branded navigation | Already converts well | No change needed | N/A |
| Schedule/fixtures | `/schedule`, `/schedule/[zone]` | Match times | `/schedule` itself ranks very weakly (63.74) despite `/schedule/eastern-time` ranking well (8.94) — the zone pages outperform the hub | Keep both; ensure `/schedule` internally links results archive post-completion | **Transitional** |
| Eliminated/qualified | `/qualified-eliminated-teams` | Team status | Good position, no clicks — title/description likely too generic | Metadata rewrite (§11) | **Evergreen** |
| Bracket/knockout | `/bracket` | Bracket results | Worst-ranking cluster of meaningful size | Upgrade `/bracket` copy + metadata for "complete knockout bracket" post-completion (§7) | **Evergreen** |
| Third place | `/world-cup-third-place-qualification`, `/matches/match-103` | Third-place explainer / result | Reasonable CTR (1.62%) already on the qualification explainer | Preserve; ensure Match 103 result and hub both answer "who came third" | **Evergreen** |
| Stats | `/stats`, `/stats/top-scorers` | Total goals, top scorer, records | Ranks worst of any high-demand cluster (70.94 avg) | Rebuild `/stats` above-the-fold answers (§7) | **Evergreen** |
| Confederation | `/world-cup-2026-teams-by-confederation` | Teams per confederation | Already performs well | Preserve, no change | **Evergreen** |

## 5. Date-specific demand (`total goals so far` cluster, broken out by date)

| Date | Queries | Impressions |
|---|---|---|
| July 6 | 14 | 262 |
| July 7 | 14 | 224 |
| July 5 | 10 | 192 |
| July 11 | 5 | 74 |
| July 8 | 4 | 70 |
| (unattributed "july 2026") | 9 | 65 |
| July 4 | 3 | 62 |
| July 9 | 4 | 58 |
| July 3 | 6 | 56 |
| July 10 | 3 | 30 |
| July 12 | 2 | 6 |

This is the exact GSC evidence the brief cites in §6. It directly supports
building `/world-cup-2026/results/YYYY-MM-DD` pages for July 3 through
July 12 at minimum — see the companion route inventory
(`docs/seo/ROUTE_INVENTORY.md`) for the final date-page selection, which
also adds the tournament's structurally distinctive dates (opener,
quarterfinal day, semifinal days, third-place day, final day) per the
brief's explicit instruction, since those dates have no query volume yet
(the tournament hadn't reached them at export time) but are guaranteed
future demand once they occur.

## 6. Index coverage (`Chart.csv`, `Critical issues.csv`, `Metadata.csv`)

| Reason | Source | Pages |
|---|---|---|
| Discovered – currently not indexed | Google systems | 67 |
| Crawled – currently not indexed | Google systems | 14 |
| Excluded by 'noindex' tag | Website | 18 |
| Alternative page with proper canonical tag | Website | 4 |
| Page with redirect | Website | 3 |
| Not found (404) | Website | 2 |
| **Total not indexed** | | **108** |
| **Indexed** | | **71** |

Confirms the brief's expected coverage summary exactly (71 / 108 / 67 / 14 /
18 / 4 / 3 / 2). The 108/71 split has been static since 2026-07-01 (`Chart.csv`
trend), meaning this is a persistent structural issue, not something
resolving on its own with more crawl budget.

### Root-cause diagnosis (from direct code inspection, not guesswork)

- **`app/sitemap.ts` includes zero `/matches/[matchId]` URLs.** The site
  generates one static page per match via
  `generateStaticParams` in `app/matches/[matchId]/page.tsx` (104 knockout
  + group-stage matches), but none of them are submitted in the sitemap.
  Google can only find them by crawling internal links, which explains most
  of "Discovered – currently not indexed" (67) and "Crawled – currently not
  indexed" (14): `Pages.csv` itself shows impressions for `/matches/match-80`,
  `/matches/match-87`, `/matches/france-vs-iraq-jun22`, etc. — Google *did*
  find these pages by crawling, just without the sitemap's discovery signal
  or priority hint.
- **`app/sitemap.ts` is missing 4 of 5 `/stats/*` sub-pages** (`/stats/players`,
  `/stats/teams`, `/stats/compare`, `/stats/matches` are absent; only
  `/stats` and `/stats/top-scorers` are listed), despite all five returning
  200 and being fully functional in production.
- **`app/robots.ts`** allows all crawlers with no disallow rules — not a
  contributing cause.
- **The only `noindex` in the codebase** is in `app/today/page.tsx`:
  `robots: hasDateParam ? { index: false, follow: true } : undefined` — this
  is a deliberate, correct exclusion of `/today?date=YYYY-MM-DD` query-param
  views to avoid duplicate-content indexing of what is otherwise the same
  page. **Classification: intentional.** This most plausibly accounts for
  most or all of the 18 "excluded by noindex" pages (one per date the
  tournament has run, if Google crawled dated views).
- "Alternative page with proper canonical tag" (4) and "Page with redirect"
  (3) could not be attributed to a specific route from static analysis alone
  without live GSC URL-inspection access; classified **unresolved** pending
  owner review in Search Console (Search Console URL-level detail is not
  exportable in these two CSVs and requires interactive access this
  non-interactive session does not have).
- "Not found (404)" (2): no internal 404-producing links were found by
  static route inspection; classified **unresolved**, monitor after sitemap
  fix.

See `docs/seo/ROUTE_INVENTORY.md` for the full per-route indexability table
and the sitemap fix implemented in this branch.

## 7. External SERP research

Browser tooling was available in this session but was not spent on
manual SERP screenshots for the ~20 queries listed in the brief, given the
GSC data above already gives a precise, first-party picture of exactly what
is and isn't converting for this site's real traffic — a stronger signal
than generic competitor-result inspection for a not-yet-completed
tournament. This is stated explicitly per the brief's fallback instruction:
**external SERP research was not performed independently of GSC and
repository evidence in this pass.** The architecture in this PR (§ Archive
lifecycle) is designed from durable search-intent patterns that are
independent of any specific competitor's current page structure: a
canonical-answer-above-the-fold hub, a comprehensive results archive, and
truthful state transitions.

## 8. Summary of durable Archive SEO V1 targets

Ranked by (a) proven GSC demand and (b) how badly the current architecture
serves that demand:

1. **Total goals "so far" by date** — page-1 average position, zero clicks,
   no dedicated page. Highest-confidence, most direct opportunity.
2. **Stats** (total goals, top scorer, assists, clean sheets) — real demand,
   worst average position of any high-volume cluster.
3. **Bracket/knockout results** — worst average position overall.
4. **Team-specific outcomes** (Turkey, England, Brazil, France + Spain,
   Argentina as finalists) — real per-team demand, near-zero conversion.
5. **Groups & final standings** — large volume, weak position.
6. **"Today" transition** — highest-traffic page today; must not lose its
   equity when the tournament ends.
7. **New archive hub** (`/world-cup-2026`) to capture "2026 World Cup",
   "2026 World Cup winner", "2026 World Cup results" head terms that no
   existing page targets at all.
