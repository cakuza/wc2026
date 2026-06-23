# WorldCupMatchDay.com — SEO/AEO/GEO Audit, June 2026

**Date:** 2026-06-23  
**Branch:** `seo/intent-clusters-freshness-v1`  
**Production SHA:** `152a8db71a29d500441a1fc8a010e0961b5a2f64`

---

## 1. GSC Data Availability

**Available export:** `audit-inputs/worldcupmatchday.com-Performance-on-Search-2026-06-16.zip`  
**Coverage:** 2026-06-14 to 2026-06-15 (approximately 2 days).  
**Note:** The June 22 export referenced in the task brief (`worldcupmatchday.com-Performance-on-Search-2026-06-22(2).zip`) was **not found** on the local filesystem. Only the June 16 export was available. All comparisons below use the 2-day window from that file.

Longer-period comparison data (7-day, 28-day) is **not available** from the local export.

---

## 2. GSC Findings (June 14–15, 2026)

### Overall Performance
- **Total clicks:** 9 across ~2,000 impressions
- **Top CTR positions:** Morocco (#1 country by CTR at 3.45%), Uzbekistan (25%), Morocco team page
- **Device split:** Mobile 1,395 impressions (69%), Desktop 533 (27%), Tablet 36 (1.8%)
- **Key geography:** US (242 imp), UK (137 imp), Canada (106 imp), Ghana (83 imp), Netherlands (74 imp)

### Top Pages by Impressions
| Page | Impressions | Clicks | CTR | Avg Position |
|------|------------|--------|-----|-------------|
| `/today` | 1,077 | 2 | 0.19% | 11.0 |
| `/teams/turkey` | 216 | 0 | 0% | 10.25 |
| `/world-cup-2026-teams-by-confederation` | 110 | 1 | 0.91% | 9.38 |
| `/teams/brazil` | 115 | 0 | 0% | 12.1 |
| `/world-cup-third-place-qualification` | 72 | 3 | 4.17% | 9.29 |
| `/stats` | 65 | 1 | 1.54% | 38.8 |
| `/` | 62 | 1 | 1.61% | 5.37 |
| `/teams/england` | 43 | 0 | 0% | 15.53 |
| `/groups` | 48 | 0 | 0% | 51.19 |

### Top Queries
| Query | Impressions | Position | Opportunity |
|-------|------------|----------|-------------|
| to day world cup match | 40 | 9.43 | High — `/today` CTR fix |
| world cup teams by confederation | 35 | 9.66 | Medium — existing page |
| today world cup match | 34 | 12.79 | High — intent matches `/today` |
| world cup matches today | 28 | 11.14 | High |
| turkey group world cup | 11 | 12.82 | High — `/teams/turkey` |
| world cup 2026 turkey group | 10 | 14.4 | High — group page needed |
| best third-place teams | (low, position ~65) | — | High niche opportunity |

### Key Findings
1. **`/today` has highest volume (1,077 imp) but worst CTR (0.19%)** — title/description doesn't match user intent well enough
2. **`/teams/turkey` is 2nd highest (216 imp) with zero clicks** — page needs stronger title and intent ownership
3. **`/groups` is buried at position 51** — missing group-specific pages causes entire cluster to underperform
4. **Group-specific pages don't exist** — "turkey group world cup", "world cup 2026 turkey group", "group l standings" etc. have no dedicated landing page
5. **`/world-cup-third-place-qualification` performing best** (4.17% CTR, position 9.29) — validates the niche content strategy

### Penalty Assessment
**No evidence of a manual or algorithmic penalty.** The site was indexed from June 11 (tournament start); the June 14–15 data represents only 3–4 days of indexing. The position band of 9–15 for key pages is consistent with a new site in a competitive niche. No sudden ranking drop was observable within the available 2-day window.

The comparison figures mentioned (clicks 8→2, impressions 1,745→267) cannot be reproduced from the single available export. The June 22 file would be needed to confirm inter-period comparisons.

---

## 3. Intent Cluster Map

### Current Pages → Intent
| Page | Current Intent | Issue |
|------|---------------|-------|
| `/today` | Today's matches | Broad; low CTR suggests title mismatch |
| `/groups` | All 12 groups | Position 51; no link to group-specific pages |
| `/stats` | General stats | Position 38.8; too generic |
| `/teams/turkey` | Turkey fixtures | 216 imp, 0 clicks; intent mismatch |
| `/world-cup-third-place-qualification` | Best 3rd place | Best performer; good niche ownership |
| `/schedule/eastern-time` | ET schedule | Under-linked; good niche |

### Missing Pages (Now Created)
| New Route | Target Intent |
|-----------|--------------|
| `/groups/group-[a-l]` (×12) | Group-specific standings and fixtures |
| `/stats/top-scorers` | Golden Boot standings |
| `/qualified-eliminated-teams` | Team qualification tracker |
| `/teams/england/qualification` | England WC 2026 qualification |
| `/teams/turkey/qualification` | Turkey WC 2026 qualification |
| `/matchdays/YYYY-MM-DD` (×all dates) | Permanent dated matchday pages |

### Cannibalization Map
| Query set | Competing pages |
|-----------|----------------|
| "today's world cup match" | `/today`, `/` (homepage shows today) | → Canonical `/today` |
| "world cup groups" | `/groups`, `/groups/group-*` | → `/groups` is hub; each group page owns specific group queries |
| "world cup stats" | `/stats`, `/stats/top-scorers` | → Parent/child; no direct cannibalization |
| "turkey world cup" | `/teams/turkey`, `/teams/turkey/qualification` | → Team page is canonical; qual page handles intent subset |

---

## 4. Bot and Freshness Audit

### Fallback State Safety
- `isFallback=true` triggers `LiveDataUnavailableNotice` on all data pages — honest.
- Fallback snapshot never stored in validated Data Cache (acceptance gate throws).
- No structured data (SportsEvent, ItemList) is emitted during fallback — safe.

### Crawl Safety
- `?date=` param on `/today` → `robots: { index: false }` — correct.
- `/api/*` routes are force-dynamic server-only — no client leakage.
- No raw provider fields exposed in HTML.

### Bot Access
| Crawler | robots.txt | Verified Access |
|---------|-----------|----------------|
| Googlebot | Allow / | ✅ |
| Bingbot | Allow / | ✅ |
| OAI-SearchBot | Allow / | ✅ (search index allowed) |
| GPTBot | Allow / | Default allow (model training — user decision required) |

**Note:** GPTBot policy is a user decision. The current default-allow is preserved unchanged. To block model training while keeping search visibility, add a GPTBot-specific disallow rule.

---

## 5. Structured Data Audit

### Existing
- `/world-cup-third-place-qualification` — `FAQPage` ✅
- `/teams/[slug]` — `SportsOrganization` + `FAQPage` ✅
- `/stats` — `WebPage` ✅

### Added in This Branch
- `/groups/group-[a-l]` — `WebPage` + `BreadcrumbList`
- `/stats/top-scorers` — `ItemList` + `BreadcrumbList`
- `/qualified-eliminated-teams` — `BreadcrumbList`
- `/matchdays/[date]` — `ItemList` + `SportsEvent` (per finished match) + `BreadcrumbList`
- `/teams/[slug]/qualification` — `BreadcrumbList`

### Known Gaps
- `/today` and `/schedule`: no SportsEvent schema (would be valuable for rich results, future work)
- Homepage: WebSite/Organization schema could be added

---

## 6. Sitemap and lastmod Discipline

### Before
- Every URL used `lastModified: new Date()` — changed on every build/deploy
- Static pages (about, privacy, faq) reported as "just changed" on every snapshot refresh

### After
- Live data pages: `lastModified` **omitted** (correct — crawlers should use response headers)
- Static/evergreen pages: `lastModified: 2026-06-11` (tournament start, stable)
- New cluster pages added: 12 group pages, top-scorers, qualified/eliminated, matchday pages, qualification canary pages

---

## 7. IndexNow Implementation

**Status:** Infrastructure ready, dry-run by default.

- `lib/indexnow/indexnow.ts` — submission helper
- `urlsForMatchChange()` — builds the set of affected URLs per match result
- **Real submissions disabled** unless `INDEXNOW_ENABLED=true` + `INDEXNOW_KEY` are set
- Key verification file must be served at `/[key].txt` before enabling
- Rate limited by construction (submit only on meaningful content changes, not every snapshot)

---

## 8. Keyword/Intent Opportunity Table

| Query | Monthly Est. Intent | Current Position | Page | Opportunity |
|-------|-------------------|-----------------|------|-------------|
| world cup matches today | High (tournament season) | ~11 | `/today` | CTR fix (currently 0.19%) |
| turkey group world cup | Medium | ~12–14 | No dedicated page → now `/groups/group-d` | New |
| england world cup group | Medium | ~15–35 | No dedicated page → now `/groups/group-l` | New |
| best third placed teams | Medium | ~65 | `/world-cup-third-place-qualification` | Already ranking — improve |
| world cup top scorers | Medium | Not ranked | New `/stats/top-scorers` | New |
| teams qualified for round of 32 | Medium | Not ranked | New `/qualified-eliminated-teams` | New |
| world cup schedule eastern time | Medium | ~11 | `/schedule/eastern-time` | Under-linked |
| world cup matches june 23 | Medium | Not ranked | New `/matchdays/2026-06-23` | New |
| england world cup qualification | Medium | Not ranked | New `/teams/england/qualification` | New |
| turkey world cup qualification | High (GSC shows demand) | Not ranked | New `/teams/turkey/qualification` | New |

---

## 9. Implementation Summary

### Files Changed
- `app/robots.ts` — documented AI-crawler policy (no behavioral change)
- `app/sitemap.ts` — added new routes, fixed lastmod discipline
- `app/groups/GroupsContent.tsx` — added "Full standings →" links to each group card
- `app/groups/[groupSlug]/page.tsx` — NEW: 12 individual group pages
- `app/stats/top-scorers/page.tsx` — NEW: Golden Boot standings page
- `app/qualified-eliminated-teams/page.tsx` — NEW: qualification tracker
- `app/teams/[slug]/qualification/page.tsx` — NEW: England/Turkey qualification pages
- `app/matchdays/[date]/page.tsx` — NEW: permanent matchday pages (all tournament dates)
- `lib/groupSlug.ts` — NEW: group ↔ slug utilities
- `lib/matchdays.ts` — NEW: matchday date utilities
- `lib/indexnow/indexnow.ts` — NEW: IndexNow dry-run infrastructure
- `components/QuickAnswer.tsx` — NEW: AEO answer-first component
- `components/LastUpdated.tsx` — NEW: last-updated display
- `components/BreadcrumbNav.tsx` — NEW: breadcrumb navigation + JSON-LD helper
- `components/SourcesAndMethodology.tsx` — NEW: sources block
- `components/DataAvailabilityNotice.tsx` — NEW: data availability notice
- `docs/seo/worldcup-seo-audit-2026-06.md` — NEW: this document
- `docs/seo/seo-architecture-v1.md` — NEW: architecture map
- `docs/seo/seo-rollout-plan.md` — NEW: rollout plan
- `data/seo/page-inventory.json` — NEW: machine-readable page inventory
- `data/seo/query-opportunities.json` — NEW: query opportunity map
- `data/seo/cannibalization-map.json` — NEW: cannibalization analysis
- `data/seo/implementation-manifest.json` — NEW: implementation manifest
- `data/seo/internal-link-graph.json` — NEW: internal link graph
- `data/seo/indexnow-dry-run.json` — NEW: IndexNow dry-run output
