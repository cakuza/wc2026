# Zero-Cost Data Strategy

## 1. Static Schedule Data

Launch with static JSON for teams, matches, standings, and pending squad containers. This keeps hosting cheap and pages fast.

The launch scaffold must remain exact:

- 48 teams
- 12 groups
- 4 teams per group
- 72 group-stage fixture slots marked `schedulePending` while kickoff, venue, and city data is unknown
- 48 squad containers

Player squads can remain pending until real data is manually imported. Fixture slots can remain pending too, but they must use `kickoffUtc: null`, `venue: "TBD"`, and `city: "TBD"` rather than invented official-looking times.

## 2. Manual JSON Updates

Update JSON files manually for high-value pages first: team schedules, match intelligence, standings, and top player stats.

For squads, use `data/squadImportTemplate.csv` and `npm run import:squads`. Do not hand-type fake official player lists.

For fixtures, add official kickoff times, venues, cities, source labels, and source URLs only when locally available from a trusted source. Keep pending placeholders when data is not verified.

## 3. Free News/RSS Monitoring

Use Google News RSS, selected RSS feeds, and manual review to discover injury, lineup, training, and opponent-watch items. Store only reviewed metadata and short summaries.

## 4. GDELT Exploration

Use GDELT as a free multilingual discovery source if manual news review becomes too slow. Treat results as leads, not verified claims.

## 5. Optional Free-Tier Sports API

Only test a free-tier sports API if static/manual updates become a bottleneck. Keep it cached and non-critical.

## 6. Cache Before Paid Plans

Before paying for any provider, add caching and only update high-demand routes. Avoid fetching live data for pages that do not get traffic.

## 7. Paid API Upgrade Trigger

Upgrade to a paid sports API only if traffic validates the project through team-page visits, card downloads, reminder clicks, or search impressions.

## Launch Rule

The Fan Hub should remain useful without live data by focusing on local-time schedules, fan cards, prediction prompts, and manually reviewed opponent watch.

If squad data is missing, show pending states and custom fan-card options instead of fake players.
