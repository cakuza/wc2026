## WorldCupMatchDay — PR #39: Final Correction Round for Schedule Lifecycle, Timezone Copy, Metadata and Test Integrity

### Summary of Changes

1. **Schedule Archive Lifecycle Ownership (`getArchiveState`)**:
   - `app/schedule/page.tsx` and `app/schedule/[zone]/page.tsx` now compute `archiveState = getArchiveState(...)` on the server and pass `isTournamentComplete={archiveState.isComplete}` as an explicit prop.
   - `ScheduleContent` enforces a defensive invariant check (`isTournamentComplete === true` -> `live=0`, `syncing=0`, `upcoming=0`, `completed=104`).
   - `ScheduleContent` renders the Completed Results notice header only when complete, and completely suppresses the Upcoming tab and section when `isTournamentComplete` is true.

2. **Visible Timezone i18n Copy**:
   - Updated `tz_intro`, `tz_faq_q2`, `tz_faq_a2`, `tz_faq_q3`, `tz_faq_a3`, `tz_faq_q4`, and `tz_faq_a4` across all 8 supported languages (`en`, `tr`, `es`, `fr`, `de`, `pt`, `ar`, `ja`) in `lib/i18n.ts` to completed archive copy.

3. **Timezone Route & Schedule Metadata**:
   - Updated `lib/timezones.ts` titles and descriptions for all 7 timezone landing pages (`turkey-time`, `uk-time`, `eastern-time`, `india-time`, `japan-time`, `brazil-time`, `australia-time`) to archive mode.
   - Updated `/schedule` page metadata to `"World Cup 2026 Results Archive — Scores & Local Kickoff Times"`.

4. **Truthful Sitemap Dates (`app/sitemap.ts`)**:
   - Created a typed `SITEMAP_DATES` registry matching actual material edit dates per section (`2026-07-20` for archive data; `2026-07-21` for server-parity and PR39 SEO closeout; `2026-07-19` for Privacy; `2026-06-01` for Terms; `2026-06-11` for evergreen guides).

5. **Clean Type Definitions & Removal of Dead Legacy Props**:
   - Removed unused legacy props (`liveScores`, `scorerLines`) from `TimezoneSchedulePageContent` and `ScheduleContent`.
   - Removed unused type imports from `app/schedule/page.tsx` and `app/schedule/[zone]/page.tsx`.

6. **Test Suite Enhancements & Hardened Assertions**:
   - Added card-scoped raw HTML score assertions for Match 104 (Spain 1–0 Argentina AET) and Match 103 (France 4–6 England FT).
   - Added cross-date boundary heading assertions for Match 104 in Japan/Australia (20 July) vs UK/Turkey/US (19 July).
   - Hardened pre-confirmation canonical fallback tests (`preConfirm === undefined`, `postConfirm === FINISHED`).
   - Fixed active window polling tests with explicit match window timestamp (`2026-07-19T21:00:00Z`).
   - Verified 100% pass across deterministic tests, server-crawler parity, and Playwright browser QA (1017 assertions).

### Verification
- `npm run build`: Success (228 static pages)
- `npx tsx scripts/test-final-schedule-archive-closeout.ts`: 87/87 assertions PASS
- `npx tsx scripts/test-server-crawler-parity.ts`: PASS
- `npx tsx scripts/test-final-browser-qa.ts`: 1017/1017 assertions PASS
- `npm run verify`: PASS
