# Product Audit

## Pivot: World Cup Fan Hub

The product is no longer positioned as a generic schedule or stats site. The core promise is:

Pick your team, see every match in your local time, create fan cards, and share matchday content in seconds.

## Final Pivot Scores

| Category | Score | Honest read |
|---|---:|---|
| Would I click? | 9.6 | The homepage now leads with team identity, fan cards, local-time utility, and reminders instead of generic stats. |
| Would I pick my team? | 9.6 | A prominent homepage team picker makes the first action obvious and useful. |
| Would I create a fan card? | 9.6 | `/cards` now feels like a football poster studio with player-watch, jersey-back, prediction, schedule, and debate templates. |
| Would I download/share? | 9.2 | PNG export, copy buttons, WhatsApp copy, X posts, Telegram posts, and hashtags are directly attached to the card workflow. |
| Player-name-driven hype | 9.5 | Player names can now drive cards like MBAPPE WATCH, ARDA GULER PLAYER TO WATCH, VINICIUS JR. BIG GAME ENERGY, and BELLINGHAM TONIGHT. |
| Back-of-jersey concept strength | 9.2 | Generic jersey-back visuals create strong football identity without faces, crests, sponsors, or official kit copies. |
| Fan Mode usefulness | 9.6 | Fan Mode supports player name, country/team, shirt number, jersey-back name, headline, subtitle, score prediction, match time, footer, caption, and hashtags. |
| Works before live API | 9.2 | Team schedules, local-time cards, player-watch posts, debate prompts, and predictions are valuable before live data exists. |
| Monetization potential | 9 | The product has clearer paths into reminders, creator exports, affiliates, ads, premium templates, and team/fan-page tools. |
| IP risk control | 8.8 | Moderate risk is accepted for player names as text, but obvious infringement is avoided: no FIFA marks, official logos, crests, sponsors, player photos, likenesses, or real kit copies. |
| Team Match Center usefulness | 9.6 | Team pages now combine local-time fixtures, venues, group/stage, table, players, share actions, card CTAs, and reminder options. |
| Stats usefulness vs Google | 9.1 | `/stats` is easier to scan than search results because it groups top-5 visual blocks with copy and card actions. |
| Local-time usefulness | 9.6 | Team pages and match cards foreground the detected timezone and local kickoff times. |
| Team picker usefulness | 9.6 | Searchable TeamPicker now shows featured teams first, all teams after, group labels, match-center links, and create-card actions. |
| Reminder concept strength | 9.2 | Reminder options are concrete: 24h, 3h, 1h, kickoff, result, with Telegram plan documented. |
| Card integration from stats/team pages | 9.2 | Team pages and stats now link into schedule, player-watch, prediction, and Golden Boot card flows with query params. |
| Match intelligence usefulness | 9.1 | Team pages now answer what to know about the next opponent: injuries, lineup watch, headlines, talking points, sources, and confidence. |
| Opponent research usefulness | 9.1 | `/matches/[id]` and team pages surface opponent context faster than a manual Google search, while avoiding overclaims. |
| Zero-cost intelligence usefulness | 8.8 | Manual JSON plus free-news placeholders are useful and cheap, but still depend on disciplined manual review. |
| Manual update practicality | 9.2 | Intelligence files have simple shapes, validation, README workflow, and source/confidence fields. |
| Injury/lineup feature potential | 9.1 | Injury Watch and Lineup Watch are ready for manual, RSS, GDELT, or API-backed data later. |
| News/talking point usefulness | 9.1 | Headlines and talking points are card-friendly, source-labeled, and intentionally short. |
| Telegram reminder potential | 9.2 | Bot plan now includes lineup, injury, opponent watch, kickoff, result, and next-match-card reminders. |
| Defamation/rumor safety | 9.2 | UI and data use reported/expected/predicted/monitoring/sample language, confidence labels, and sensitive-item flags. |
| Free-data strategy strength | 9.1 | Free News Data Plan and Zero-Cost Data Strategy define Google News RSS, GDELT, manual review, caching, and paid-upgrade triggers. |
| Global team selection usefulness | 9.6 | TeamPicker searches every team, keeps featured shortcuts, and links every team to a local-time match center plus create-card action. |
| Any-country team page usefulness | 9.2 | Every team and every `-world-cup-schedule` route now uses the same Match Center, highlighted table, players, sharing, reminders, and Opponent Watch fallback. |
| Local-time global usefulness | 9.6 | Team pages show detected timezone, a quick timezone selector, local kickoff times, copy actions, and local-time badges. |
| Fan card global usefulness | 9.6 | Card examples now cover Argentina, Portugal, Morocco, Japan, USA, Mexico, Germany, Spain, France, Brazil, Turkey, and fully custom Fan Mode. |
| Stats global usefulness | 9.1 | `/stats` supports all teams and adds team/group filters so fans can quickly scan useful stat cards by market. |
| Match intelligence global usefulness | 9.1 | Teams without manual intelligence rows still get a useful sample Opponent Watch fallback instead of an empty thin section. |
| Mobile global UX | 9.1 | Team picker, match centers, stats, and card CTAs remain card-based and mobile-first instead of table-heavy. |
| Would a fan from any major country click? | 9.2 | The product now leads with team selection and global card examples rather than Turkey/Brazil-specific value. |
| Would a fan from any major country share? | 9.1 | Team schedule cards, player-watch cards, prediction cards, and local-time copy work for every team in the data. |
| Full 48-team coverage | 9.7 | Validation now enforces exactly 48 teams, 12 groups, 4 teams per group, 48 standings rows, and 72 group-stage fixture slots. |
| Squad/player credibility | 8.8 | Fake squad players were removed and every team has a pending squad container; this cannot reach 9+ until verified squads are imported. |
| Squad import workflow | 9.3 | CSV import, validation, and docs are in place without adding a database or paid service. |
| Visual review diversity | 9.3 | `/visual-review` checks country/team spread across confederations and links directly to team pages and cards. |
| Schedule pending UX | 9.3 | Pending schedule details now show polished pre-tournament copy, disabled local-time messaging, and import guidance. |
| Squad pending UX | 9.5 | Pending squads feel intentional and route users to custom Fan Mode instead of empty player rows. |
| Data honesty | 9.7 | The UI avoids fake kickoff times, venues, squads, live standings, and player stats while still giving fans useful actions. |
| 48-team route reliability | 10.0 | `scripts/check-routes.mjs` verifies main routes, all team pages, all team schedule pages, sample match pages, and card prefill URLs. |
| Card prefill usefulness | 9.2 | Query params now preselect template, team, match, custom player name, and pending-time card copy. |
| Visual-review usefulness | 9.4 | `/visual-review` now shows coverage metrics, honesty notices, 12 card examples, diverse countries, and shareability notes. |
| Real data import readiness | 9.3 | `docs/REAL_DATA_IMPORT_PLAN.md` defines schedule, venue, squad, stats, intelligence, free-source, paid API, caching, and status-transition workflows. |
| Launch readiness before official data | 9.2 | The product is usable before official details because pending states are polished and card workflows still work globally. |

## What Changed

- Homepage now sells the Fan Hub promise: team match times, fan cards, and reminders.
- The first homepage action is now "Pick your team"; the second is "Create a fan card."
- A featured team picker highlights Turkey, Brazil, Argentina, France, England, Portugal, Germany, Spain, USA, and Mexico.
- Hero visuals now show the actual product direction: Team Schedule, Player Watch, and Matchday Menu cards.
- `/cards` now has 10 categories: Player Watch, Back-of-Jersey Star, Team Schedule / Road to Glory, Matchday Menu, Golden Boot Debate, Prediction Battle, Group of Chaos, Upset Watch, Last Dance / Legacy Debate, and Custom Fan Card.
- Fan Mode is now central instead of secondary.
- Generic jersey-back visuals add football identity without relying on official assets.
- Team pages became Team Match Centers with fixture timelines, highlighted group table, player-watch cards, sharing, and reminder placeholders.
- `/stats` was added as the fan-friendly stats hub above the existing `/leaderboards`.
- Match Intelligence/Opponent Watch was added with static JSON, confidence labels, source labels, safe wording, and a match detail route.
- All team schedule slugs are now generated, not only the originally requested high-intent country pages.
- Global card examples were expanded across major fan markets and less-obvious teams.
- `/stats` gained team and group filters.
- The static data model now covers exactly 48 teams across Groups A-L.
- Fake sample players were removed from the active data files.
- Every team has a pending squad container in `data/squads.json`.
- A CSV squad import workflow now exists for verified, provisional, or manually reported players.

## Legal And Risk Handling

- Player names are allowed as text for editorial, factual, stat, prediction, and debate use.
- Generic jersey backs, shirt numbers, country names, flag emojis, nation-inspired colors, pitch lines, glow, and original poster layouts are allowed.
- FIFA logos, official World Cup logos, trophy images, mascots, official slogans, official typefaces, crests, federation logos, sponsor logos, brand logos, real kit copies, player photos, and realistic player likenesses remain disallowed.
- The UI stays confident and fan-native; legal copy is subtle and practical.
- The standard disclaimer remains: "Fan-made. Not affiliated with FIFA or any official tournament organizer."

## Remaining Blockers

- Real match reminders are still a placeholder until a reminder service and subscription flow exist.
- Real data freshness still matters for standings, scorers, cards, and tournament events once matches begin.
- Player-name use is a moderate risk area; the current implementation controls that risk by avoiding faces, official kits, crests, sponsors, and logos.
- PNG export still depends on browser support for `html-to-image`.
- The product is now shareable before an API, but a 10/10 launch will require current fixtures, real results, and live tournament moments.
- Card query params now prefill the core studio context for team schedules, predictions, opponent watch, golden-boot debate, and custom player-name cards.
- Free news/RSS/GDELT providers are placeholders only; intelligence updates require manual review at launch.
- Some less-obvious teams still rely on sample/manual fallback intelligence until real reviewed source notes are added.
- Player-specific stats and squad cards stay limited until verified squad data is imported.
- Official times and venues are still not present; current fixture slots are explicitly sample/pending.

## Founder Verdict

Would I click?

Yes. "Pick your team" plus fan-card previews is much stronger than a generic schedule pitch.

Would I pick my team?

Yes. That is now the cleanest first action on the homepage.

Would I create a fan card?

Yes. Player Watch and Back-of-Jersey Star are the strongest reasons to open `/cards`.

Would a WhatsApp group admin share this?

Yes. Team schedule, prediction battle, and local-time matchday menu cards are built for group sharing.
