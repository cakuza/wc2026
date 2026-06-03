# UI / Hype / Monetization Audit

Fresh audit date: 2026-06-01

This audit is reset after the real schedule import and poster-system repair. The product is no longer a fake local-time shell: group-stage fixtures now have `kickoffUtc`, venues, cities, source labels, source URLs, and verification dates.

## What Changed

- Imported 72 group-stage matches from the public FIFA World Cup 2026 schedule PDF, with venue-local times converted to UTC.
- Added `data/scheduleImportTemplate.csv`, `scripts/import-schedule.mjs`, and `docs/SCHEDULE_IMPORT_WORKFLOW.md`.
- Tightened validation so scheduled matches require kickoff UTC, venue, city, source URL, and `lastVerifiedUtc`.
- Changed homepage proof from pending utility to real fixtures, local-time conversion, country roads, and fan cards.
- Reworked match cards away from dark dashboard panels toward brighter poster-style fixture blocks.
- Updated team pages to show real local match times, venues, copyable road text, and a schedule-ready data notice.
- Updated `/matches`, local-time pages, SEO FAQs, and preview copy so local-time conversion is treated as active.
- Updated `/cards` so team-road, matchday menu, prediction, player-watch, Golden Boot, and group chaos templates behave more like social posters and less like app panels.
- Removed schedule-facing "time pending" copy from major user surfaces. Squad, stat, and opponent-note gaps remain explicit.

## Honest Scores After Reset

- Real schedule usefulness: 9.2
- Local time usefulness: 9.1
- Tournament vibe: 8.4
- Card visual quality: 8.1
- Would I share a card: 7.9
- Homepage clickability: 8.8
- `/cards` functionality: 9.2
- Team page usefulness: 9.0
- `/matches` usefulness: 9.1
- Pending-data honesty: 9.0
- Monetization readiness: 8.3

## Remaining Weaknesses

- Card designs are much better, but still generated with CSS components rather than a dedicated visual template library. I would not honestly call them 9/10 social creative yet.
- Browser screenshot verification was not available in this tool session, so the visual score is intentionally conservative.
- Squads, player stats, lineups, and reviewed opponent notes are still pending.
- Some pages still use utility cards and dense sections; the visual system is improved but not a full art-directed product.
- PNG export depends on the browser and `html-to-image`; route checks prove pages load, not that every browser export succeeds.

## Launch Truth

The local-time utility now works because all 72 group-stage matches have `kickoffUtc`. The product is materially more useful. The remaining risk is visual polish: if the owner still would not share the cards after inspecting `/cards` and `/visual-review`, the project needs a real designer or a paid template library before claiming premium social-card quality.
