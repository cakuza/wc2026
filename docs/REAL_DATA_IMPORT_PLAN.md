# Real Data Import Plan

## 1. Official Schedule Import Workflow

Keep every group-stage slot as `dataStatus: "schedulePending"` until a trusted official schedule source is available. When released, update the matching `data/matches.json` row with `kickoffUtc`, `venue`, `city`, `kickoffStatus: "confirmed"`, `venueStatus: "confirmed"`, `dataStatus: "verified"`, and a clear `sourceLabel`.

## 2. Venue, City, And Kickoff Updates

Update only fields that are confirmed. If kickoff is known but venue is not, keep venue/city copy pending in the UI and preserve source labels. Never add plausible-looking times or host cities without a source.

## 3. Squad Import Workflow

Use `data/squadImportTemplate.csv` and `npm run import:squads`. Official rows require `sourceUrl`; reported and provisional rows require a useful `sourceLabel`. Empty squads stay pending and Fan Mode remains available.

## 4. Player Stats Import Workflow

After squads exist, update `data/playerStats.json` with sourced goals, assists, cards, minutes, and penalties. Keep missing stats absent or zero only when the source confirms zero. Do not create sample leaderboard players.

## 5. Manual Match Intelligence Workflow

Add reviewed items to `data/matchIntelligence.json`, `data/newsWatch.json`, `data/injuryWatch.json`, `data/lineupWatch.json`, and `data/talkingPoints.json`. Keep summaries short, original, source-labeled, and confidence-scored.

## 6. Free News, RSS, And GDELT Workflow

Use RSS and GDELT as discovery inputs, not final truth. Review sources manually, store titles/source/date/link plus short original summaries, and avoid unsupported injury, lineup, or disciplinary claims.

## 7. Paid Sports API Upgrade Trigger

Upgrade only when traffic proves demand through team-page visits, card exports, reminder clicks, search impressions, or repeated manual update burden. Prioritize matches and standings before player/event detail.

## 8. Caching Before Paid API

Cache provider responses before paying for higher tiers. Refresh high-demand routes first, store normalized JSON, and keep the static provider as a fallback for build reliability.

## 9. Data Status Transitions

- `schedulePending` -> `scheduled` or `verified` after official kickoff, venue, and city are added.
- `squadPending` -> `reported`, `provisional`, or `official` after CSV import.
- `preTournament` -> `manual`, `live`, or `api` after matches begin and standings are sourced.

Every transition must preserve source labels, source URLs when available, and validation coverage.
