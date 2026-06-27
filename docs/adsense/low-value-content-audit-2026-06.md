# AdSense Low-Value Content Audit — June 2026

**Date:** 2026-06-27  
**Branch:** adsense/editorial-value-v1  
**AdSense status:** "Needs attention — Low value content" (flagged 2026-06-24)  
**Sitemap URL count:** 89  
**Production SHA at audit time:** 4adcad5d1b3ec069c952f47d055974cc02f063b8

---

## Executive Summary

The AdSense flag is almost certainly the result of three compounding signals:

1. **Template similarity is high.** 67 of 89 indexed pages (75%) are instances of one of three identical templates: group standings (×12), team profile (×48), and timezone schedule (×7). Google's quality heuristics treat large clusters of structurally similar, data-driven pages as "auto-generated" unless the editorial copy around the data is meaningful and distinct.

2. **Editorial text density is thin.** Most pages have <200 words of original prose. The data tables and live scores carry the page visually, but to a crawler there is very little editorial signal per URL.

3. **Key trust signals are underdeveloped.** The About page is ~120 words across four short paragraphs. Contact is ~80 words. There are no long-form explainer articles, no sourcing/methodology documentation, and no content types that signal an editorially invested publisher.

---

## Page Inventory — By Route Class

### Class A: Static Editorial (non-template)

| Route | Estimated words | Current value | Blocking issues |
|---|---|---|---|
| `/about` | ~120 | LOW-MEDIUM | Too short; no team bio, no editorial voice |
| `/contact` | ~80 | LOW | Minimal; just an email + 2 sentences |
| `/faq` | ~200 | MEDIUM | Good Q&A coverage; answers are 1-sentence |
| `/privacy` | ~350 | MEDIUM | Legal boilerplate; not an editorial signal |
| `/terms` | ~350 | MEDIUM | Legal boilerplate; not an editorial signal |
| `/world-cup-2026-prize-money` | ~300 | HIGH | Original data tables + FAQs; retain |
| `/world-cup-third-place-qualification` | ~400 | HIGH | Step-by-step explanation + live data + FAQs; retain |
| `/world-cup-2026-teams-by-confederation` | ~200 | MEDIUM | Data list + 5 FAQs; thin editorial intro |
| `/world-cup-schedule-local-time` | ~120 | MEDIUM-LOW | Hub page; mostly links; no editorial body |
| `/matchday-hub` | ~80 | LOW | Navigation-only; no editorial content |
| `/quiz` | ~150 | MEDIUM | Interactive; not primarily editorial |

### Class B: Live Data — Programmatic Template (group pages)

12 pages: `/groups/group-a` through `/groups/group-l`

- **Template:** Standings table + fixture list + qualification summary (identical structure across all 12)
- **Unique data per page:** Team names, scores, points, fixtures
- **Editorial copy (unique per page):** ~50 words (qualification summary is template text with team names interpolated)
- **Current value:** MEDIUM-LOW (data is useful; editorial differentiation is near-zero)
- **Risk:** Template similarity cluster — Google may treat these as auto-generated thin pages

### Class C: Live Data — Programmatic Template (team pages)

48 pages: `/teams/{slug}`

- **Template:** Squad table + fixture list + qualification path + standings (identical structure)
- **Unique data per page:** Team name, group, opponents, squad list, match results
- **Editorial copy (unique per page):** ~60–100 words of interpolated copy (FAQ answers are dynamically built from templates in code; the `firstMatchResultSentence` function produces one sentence)
- **Current value:** MEDIUM (squad lists add real value; but 48 near-identical pages without differentiation is a risk)
- **Risk:** Largest template similarity cluster; 48 pages all share the same `<TeamDetail>` component with no variation in prose

### Class D: Timezone Schedule Pages

7 pages: `/schedule/turkey-time` … `/schedule/australia-time`

- **Template:** Fixture table + quick facts + 5 FAQs + timezone context note (1-sentence variation per page)
- **Unique content per page:** Timezone offset applied to UTC times; 1-sentence context note per region
- **Editorial copy (unique per page):** The `tz_context_*` strings differ per page (~15–25 words each); FAQs are the same 5 questions with `{zoneNote}` interpolated
- **Current value:** MEDIUM (high utility; real timezone conversion value) but LOW editorial differentiation
- **Risk:** 7 near-identical pages; the `tz_context_*` differentiation is one sentence

### Class E: Live Tracker Pages (high-value, unique)

| Route | Estimated words | Current value | Notes |
|---|---|---|---|
| `/qualified-eliminated-teams` | ~300 | HIGH | Live tracker + 5-point methodology + related links |
| `/stats` | ~400 | MEDIUM-HIGH | All-time records + tournament stats; depends on live data |
| `/stats/top-scorers` | ~150 | MEDIUM | Live scorers table; thin editorial |
| `/bracket` | ~200 | MEDIUM | Structural overview; currently mostly TBD slots |
| `/today` | ~100 | MEDIUM | Live fixture list; minimal editorial |
| `/schedule` | ~150 | MEDIUM | Schedule overview; minimal editorial |

### Class F: Qualification Sub-pages

2 pages: `/teams/{slug}/qualification` (England, Turkey)

- Not fully audited in this pass; likely thin template pages targeting specific qualification scenarios.

---

## Template Similarity Analysis

### Cluster 1 — Group standings pages (12 pages)
- **Shared structure:** BreadcrumbNav + H1 + StandingsTable + qualification box + fixture list + team links + prev/next nav + related links + SourcesAndMethodology
- **Variance:** Only team names, scores, and group letter differ
- **Editorial differentiation:** None beyond interpolated team names
- **Risk level:** HIGH — identical template × 12

### Cluster 2 — Team profile pages (48 pages)
- **Shared structure:** JSON-LD SportsOrganization + FAQPage + LiveDataUnavailableNotice + TeamDetail component
- **Variance:** Team-specific data (squad, fixtures, group)
- **Editorial differentiation:** 3 FAQ answers built from templates; 1-sentence first-match preview
- **Risk level:** HIGH — identical template × 48 (the largest cluster)

### Cluster 3 — Timezone schedule pages (7 pages)
- **Shared structure:** Quick facts grid + H2 + timezone links + related links; each contains a 1-sentence context note
- **Variance:** UTC offset applied to times; 1-sentence context note per region
- **Editorial differentiation:** 1 sentence; FAQs use same 5 questions with interpolated timezone name
- **Risk level:** MEDIUM-HIGH — identical template × 7

---

## Root Cause Diagnosis

| Signal | Severity | Evidence |
|---|---|---|
| Template similarity ratio | CRITICAL | 75% of pages (67/89) share one of three templates |
| Thin editorial text density | HIGH | Most pages <200 words of original prose |
| About page length | HIGH | ~120 words; no author attribution |
| No cornerstone editorial content | HIGH | Zero long-form explainer articles |
| Navigation-only hub pages | MEDIUM | `/matchday-hub` is <100 words; `/world-cup-schedule-local-time` <120 |
| Legal pages (privacy/terms) | LOW | Boilerplate; adds little editorial value |
| Thin contact page | MEDIUM | ~80 words; no physical address, no team bio |
| No data sourcing page | MEDIUM | Sources mentioned in footers but no dedicated page |

---

## Pages to Preserve (Do Not Degrade)

The following pages are already strong and should be used as quality benchmarks:

1. `/world-cup-third-place-qualification` — live data + editorial steps + FAQs + methodology. Best current page.
2. `/world-cup-2026-prize-money` — specific factual tables + sourced data + FAQs.
3. `/faq` — FAQPage JSON-LD, 10 Q&A pairs; good structure.
4. `/qualified-eliminated-teams` — live tracker + methodology box.
5. `/stats` — all-time records section provides genuine editorial depth.

---

## Planned Remediation (Phases 4–8)

### Phase 4 — Cornerstone editorial pages (new)
Priority pages to create:

1. `/world-cup-2026-format-explained` — How the 48-team format works; group stage → Round of 32 → knockouts; historical context vs 32-team format
2. `/world-cup-2026-group-tiebreakers` — Tiebreaker rules in full detail; examples; common misunderstandings
3. `/world-cup-2026-knockout-bracket-explained` — How Round of 32 → Final bracket works; seeding logic; when fixtures are confirmed
4. `/world-cup-2026-data-sources` — Sourcing, data flow, update frequency, correction process, independence disclaimer

Optional (Phase 4B if time allows):
5. `/world-cup-2026-stadiums` — 16 venues with capacity, city, group-stage matches hosted

### Phase 5 — Programmatic page enrichment
- Group pages: add 2–3 sentences of group-specific editorial per page (group strengths, key fixture, historical note)
- Team pages: add a 1-paragraph team bio to each `TeamDetail` component call (sourced from static data file)
- Timezone schedule pages: expand `tz_context_*` to 3–5 sentences per region; add region-specific FAQ

### Phase 6 — Publisher trust improvements
- About page: expand to 300+ words; add site history, editorial approach, update frequency
- Contact page: add structured response-time commitment; expand to 150+ words
- FAQ page: expand from 10 to 20+ Q&A pairs; add tournament-format and bracket questions

### Phase 7 — Internal link improvements
- `/stats` → add `<a href="/stats/top-scorers">` in visible body text
- Group pages → link to `/world-cup-2026-group-tiebreakers`
- Team pages → link to `/world-cup-2026-format-explained`
- Third-place page → link to `/world-cup-2026-knockout-bracket-explained`
- Homepage / matchday-hub → link to all cornerstone pages

### Phase 8 — Low-value surface safeguards
- Empty sections (e.g., standings not yet started) must have substantive explanation, not blank space
- Fallback schema for all dynamic pages when live data is unavailable
- Bracket page: add editorial copy explaining the format while TBD slots remain

---

## Acceptance Criteria for AdSense Re-review

To pass re-review, the site should demonstrate:

1. At least 4 new cornerstone articles with ≥400 words each
2. About page ≥300 words
3. All group pages with ≥1 unique editorial paragraph (not interpolated template)
4. All timezone pages with ≥3 unique editorial sentences per region
5. `/stats` page has direct link to `/stats/top-scorers` in body text
6. All internal links in remediation-manifest are implemented
7. No page in sitemap returns <80 words of editorial text (excluding data-only tables)
