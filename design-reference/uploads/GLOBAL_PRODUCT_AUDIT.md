# Global Product Audit

## Coverage Reality

- Team count: 48
- Group count: 12
- Teams per group: 4
- Group-stage fixture slots: 72
- Squad containers: 48
- Real squads imported: No
- Player stats imported: No
- Fixture status: `schedulePending` with `kickoffUtc: null`, `venue: "TBD"`, and `city: "TBD"`

Every team has `/teams/[slug]` and `/teams/[slug]-world-cup-schedule` coverage through the dynamic team route. The product does not invent official squads, players, kickoff times, venues, or live stats.

## Scores

| Category | Score | Honest read |
|---|---:|---|
| Full 48-team coverage | 10.0 | `data/teams.json` contains exactly 48 teams. |
| Full 12-group coverage | 10.0 | Groups A-L exist with exactly 4 teams each. |
| Full group-stage fixture coverage | 9.4 | 72 fixture slots exist and each team has 3 matches; official schedule details remain pending. |
| All-team picker usefulness | 9.6 | Search, group filter, confederation filter, featured teams, squad status, schedule links, and card links are present. |
| Any-country team page usefulness | 9.3 | Every team page has hero, flag, group, timezone badge, timeline, group table, squad pending UX, card CTAs, Match Intelligence fallback, reminders, sharing, WhatsApp copy, and related links. |
| Squad/player architecture readiness | 9.3 | 48 squad containers, CSV import, player schema, source fields, statuses, and validation are in place. |
| Pending squad UX | 9.5 | Pending teams clearly say squad data is pending and route fans to custom Fan Mode cards. |
| Global card coverage | 9.6 | `/cards` supports every team, team schedule cards, custom fan cards, prediction links, and query-prefill for team/player/match/template. |
| Global stats coverage | 9.1 | `/stats` filters all 48 teams and groups A-L, labels pending data, and avoids fake live stats. |
| Match intelligence fallback quality | 9.3 | Every next match can show safe fallback opponent notes, prediction/opponent-watch CTAs, and reminder placeholder. |
| Would a fan from any team click? | 9.2 | All countries have useful schedule/card entry points, but official schedule details would increase confidence. |
| Would a fan from any team share? | 9.1 | Team cards and custom Fan Mode work globally; imported real squads would improve player-card sharing. |
| Schedule pending UX | 9.3 | Pending kickoff and venue data now appears as polished pre-tournament fixture copy instead of raw TBD UI. |
| Squad pending UX | 9.5 | Squad status is framed as card readiness, with clear Fan Mode fallback for custom player cards. |
| Data honesty | 9.7 | Schedule, squad, stats, standings, and intelligence states are explicit and avoid fake official data. |
| 48-team route reliability | 10.0 | Route checker covers main pages, 48 team pages, 48 schedule pages, sample matches, and card prefill URLs. |
| Card prefill usefulness | 9.2 | Team, match, opponent-watch, golden-boot, and custom player-name query params set useful card defaults. |
| Visual-review usefulness | 9.4 | Review page now shows coverage, honesty, diverse countries, pending examples, and 12 share-card checks. |
| Real data import readiness | 9.3 | Real data import plan covers schedule, venues, squads, stats, intelligence, free discovery, paid API, and caching. |
| Launch readiness before official data | 9.2 | Product feels intentional with pending data, but public launch still benefits from official schedule import. |

## Manual Route Check Set

Mexico, South Africa, South Korea, Czechia, Canada, Bosnia and Herzegovina, Qatar, Switzerland, Brazil, Morocco, Haiti, Scotland, United States, Paraguay, Australia, Turkey, Germany, Curaçao, Côte d'Ivoire, Ecuador, Netherlands, Japan, Sweden, Tunisia, Belgium, Egypt, Iran, New Zealand, Spain, Cape Verde, Saudi Arabia, Uruguay, France, Iraq, Norway, Senegal, Argentina, Algeria, Austria, Jordan, Portugal, Uzbekistan, Colombia, DR Congo, England, Croatia, Ghana, Panama.

## Remaining Real-Data Gaps

- Official kickoff times
- Official venues and cities
- Official, reported, or provisional squads
- Live standings
- Real scorers, assists, cards, clean sheets, caps, and minutes
- Reviewed lineups, injuries, suspensions, headlines, and tactical notes

## Launch Rule

Public copy must keep saying pre-launch sample or schedule pending until official fixtures, venues, squads, and stats are imported with source labels and source URLs.
