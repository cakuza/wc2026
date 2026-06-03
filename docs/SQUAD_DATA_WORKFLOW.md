# Squad Data Workflow

The launch build intentionally ships with pending squad containers for all 48 teams. Do not invent squads or player stats.

## Import Steps

1. Open `data/squadImportTemplate.csv`.
2. Add one row per verified, provisional, or manually reported player.
3. Use a valid `teamSlug` from `data/teams.json`.
4. Set `dataStatus` to `reported`, `provisional`, or `official`.
5. Only use `official` when a trustworthy source URL is included.
6. Run `npm run import:squads`.
7. Run `npm run validate:data`.
8. Run `npm run prelaunch` before deployment.

## CSV Columns

- `teamSlug`
- `playerName`
- `displayName`
- `shirtNumber`
- `position`
- `club`
- `age`
- `caps`
- `goals`
- `isStar`
- `isCaptain`
- `dataStatus`
- `sourceLabel`
- `sourceUrl`

## Important Rules

- Empty squads are allowed while the product is pre-launch.
- Fake official squads are not allowed.
- Official rows must include `sourceUrl`.
- Valid squad statuses are `pending`, `reported`, `provisional`, and `official`.
- Valid player statuses are `pending`, `reported`, `provisional`, `sample`, and `official`.
- Valid positions normalize to `GK`, `DF`, `MF`, `FW`, or `Unknown`.
- Player names imported through CSV become available to team pages, `/stats`, and `/cards`.
- If no squad is imported for a team, the UX stays pending and Fan Mode still supports custom player cards.
