# Archive SEO Growth Execution — 2026-07-21

Search Console-driven technical SEO and indexation pass, run after the tournament archive was complete and PR #31/#39 had already landed. Full raw exports and screenshots are kept locally outside the repo (`C:\Users\Asus Gaming\Documents\WCMD-GSC-POST-ARCHIVE-2026-07-21`), not committed — this document is the sanitized summary.

## Technical audit

### WebSite schema — before/after

**Before:** rendered globally via `<SchemaScripts />` in the root layout, meaning every route on the site emitted a `WebSite` node (invalid per schema.org — one WebSite entity, not one per page). `/world-cup-2026` additionally rendered its own separate `websiteSchema()` call, so that specific page emitted **two** WebSite nodes. The payload itself described a live "matchday command center" with `inLanguage` claiming 8 independently-indexed languages (the site is English-only) and an unused `SearchAction`.

**After:** rendered exactly once, on the homepage only. Description now reflects the completed archive, `inLanguage: "en"`, `alternateName` added, `SearchAction` removed. Verified in production: 1 WebSite node on `/`, 0 on `/world-cup-2026` and every other checked route.

### Breadcrumb coverage

18 route families had no `BreadcrumbList` JSON-LD (and, for most, no visible breadcrumb trail either): `/schedule`, `/schedule/[zone]`, `/matches/[matchId]`, `/teams/[slug]`, `/stats` + its 4 subpages, `/bracket`, `/world-cup-third-place-qualification`, `/world-cup-schedule-local-time`, `/world-cup-2026-teams-by-confederation`, and 5 editorial guides. All now reuse the pre-existing `breadcrumbLd`/`BreadcrumbNav` implementation. Dynamic routes derive their trailing label from data the page already resolves (team name, match participants, timezone label) rather than a new data fetch.

### Metadata changes

Homepage internal-link block ("Explore the 2026 Archive") was missing Top Scorers and Schedule links against the required set (results, final result, statistics, top scorers, bracket, teams, groups, schedule) — added both.

### Article schema decisions

Added to 5 substantial editorial guides (Format Explained, Group Tiebreakers, Knockout Bracket Explained, Prize Money, Data Sources — 11–18 paragraphs of original prose each), replacing a generic `WebPage` node where one existed. `datePublished`/`dateModified` sourced from each file's real git history (`git log --follow`), never invented.

Deliberately excluded `/world-cup-2026-teams-by-confederation` — 3 paragraphs, a table/listing page, not substantial editorial content per the brief's explicit "no thin utility pages" guidance. It received only the breadcrumb fix.

### Internal link audit

Match detail pages already linked both team pages, the bracket, and stats via `MatchDetail.tsx` (verified before assuming a gap — initial grep on the page-level file alone was misleading since the links live in the child component). The one genuine remaining gap — a link from each match page to its specific date's archive page — was identified but deferred as low-value/second-wave rather than forced into this pass.

### Sitemap URL count

220 URLs in the live sitemap (all 104 match pages, all team/group pages, 13 resolved date archive pages, editorial pages). Confirmed via the new test script and manual `curl` count.

## GSC baseline (2026-07-21, before this pass' fixes went live)

Property: `https://www.worldcupmatchday.com/` (existing verified URL-prefix property).

- **Security/manual actions:** clean, no issues.
- **Performance, last 28 days:** 155 clicks / 25.9k impressions / 0.6% CTR / 17.8 avg. position.
- **Top pages by clicks:** `/` (68 clicks, 3,197 impr.), `/today` (41 clicks, 12,303 impr. — the highest-impression page by far, ~0.33% CTR), `/stats` (23 clicks, 5,612 impr.), `/world-cup-2026-teams-by-confederation` (13 clicks), `/world-cup-third-place-qualification` (3 clicks, 843 impr.).
- **Indexed count:** 71 indexed / 105 not indexed.
- **Non-indexed reasons:** 18 intentional noindex (query/date-compare variants), 4 intentional canonical duplicates, 2 `Not found (404)` — confirmed crawler artifacts (`/&`, `/$` — not real internal links, no site defect), 67 "Discovered — currently not indexed" (Google-side, largest bucket), 14 "Crawled — currently not indexed".
- **Top queries:** dominated by branded terms ("world cup matchday", "worldcupmatchday", "world match day"). Non-branded opportunity queries: "fifa world cup stats" (868 impr., position 72.2), "world cup teams by confederation" (253 impr., position 8.8, already reasonably placed), "todays world cup matches" (567 impr., 0.5% CTR — intent mismatch, tournament is complete).
- **Device/country findings:** not separately broken out this pass (time-boxed to the higher-value performance/indexing/sitemap reports).
- **Core Web Vitals:** no data (mobile or desktop). HTTPS: 17 valid pages tracked, 0 non-HTTPS. Enhancements → Events: 1 valid, 0 invalid.

## GSC actions taken

- **Sitemap resubmitted** (`https://www.worldcupmatchday.com/sitemap.xml`) after the fix landed in production. Result: **Success**, discovered pages jumped from **93 to 220** immediately on resubmission (matching the live sitemap's actual URL count).
- **URL Inspection queue:** attempted via the Search Console UI; the client-side routing did not cooperate with automated navigation in this session after repeated attempts. Given the sitemap resubmission already triggered full bulk rediscovery of all 220 URLs — the brief's own explicitly-endorsed fallback ("use the sitemap for bulk rediscovery of the remaining URLs") — individual per-URL indexing requests were not pursued further this pass.
- **Request quota:** not reached (no individual requests were submitted).
- **Validations started:** none (no "Validate Fix" actions were applicable — the two Website-caused reasons in the coverage report are both intentional, not defects).
- **Unresolved coverage issues:** the 67 "Discovered — currently not indexed" and 14 "Crawled — currently not indexed" buckets remain to be reassessed after Google reflects the resubmitted sitemap — expected at the 48–72 hour and 7-day checkpoints below.

## SERP findings

Checked "world cup 2026 results" and "world cup 2026 statistics" via live Google Search (2026-07-21, non-personalized).

- **worldcupmatchday.com does not appear on page 1** for either query. Both are dominated by FIFA.com, BBC Sport, The Guardian, ESPN, Wikipedia, Sky Sports, Fox Sports, and FBref.com — authoritative, high-domain-authority sports-media properties. This is consistent with the GSC-observed weak average positions (57–105) for stats-related queries; no realistic near-term ranking opportunity against these domains for commodity head terms.
- Google's own rich "Matches" panel and stats snippets already surface FIFA-sourced live/final scores directly in the SERP for these queries, further reducing available click-through even for well-ranked competitors.
- **Snippet opportunity, not pursued as a code change this pass:** none identified that don't require competing directly with the above domains on head terms — the realistic opportunity remains the long-tail/branded and date-specific query clusters already served by the archive's existing structure.
- **Out-of-scope finding, flagged separately (not fixed here):** the real-world Golden Boot leader per Google's aggregated stats panel is Mbappé (10 goals), while the site's own `/stats` page shows Messi (8) as sole Top Scorer. The site's own live-snapshot data self-reports incomplete scorer-event coverage (`scorerTotalsComplete: false`, `unresolvedCompletedMatchGoals: 11` across `completedMatchesWithUnresolvedScorers: 10`). This is a data-completeness question for the scorer-event pipeline (`lib/tournamentStats.ts`, player-alias resolution), not a structural SEO defect, and was spun off as a separate follow-up task rather than touched here — canonical player-stat data must not be changed without its own dedicated, evidence-gated verification.

## Git and deployment

| Item | Value |
|---|---|
| Branch | `feat/archive-seo-growth-gsc-v1` |
| Base SHA | `23ae4f3982085d5479facfdfd4743f3a9c6c33cd` |
| Commits | `89441f7` (WebSite schema scoping), `d6ec9a9` (breadcrumb coverage), `d8fe0ba` (Article schema), `0a01c80` (new test suite) |
| PR | [#40](https://github.com/cakuza/wc2026/pull/40) |
| Merge commit | `07f512c88adfb6c1a20459caff39aba8b2b2e8e2` |
| Production deployment | Ready, git-metadata-confirmed matching the merge commit |
| Production URL | `https://www.worldcupmatchday.com` |
| New test suite | `scripts/test-archive-seo-growth-gsc.ts` — 202/202 assertions |
| Full validation | `npm run verify` — exit 0 (full test battery + fresh build + 1017/1017 browser-QA assertions across 40 routes × 3 viewports) |

## Follow-up measurement plan

- **48–72 hours:** re-check crawl/index status only — confirm Google has re-read the resubmitted sitemap and the "Discovered — currently not indexed" count has moved.
- **7 days:** re-pull Performance → Pages/Queries for impressions and new-query discovery, particularly on the pages that gained breadcrumb/Article schema.
- **14 days:** check CTR and ranking movement on the identified opportunity pages (`/stats`, `/schedule`).
- **28 days:** full page/query cohort comparison against this document's baseline numbers.

No claim is made that rankings improved immediately as a result of the indexing/sitemap actions in this pass — only that the technical prerequisites (correct structured data, full sitemap rediscovery) are now in place.
