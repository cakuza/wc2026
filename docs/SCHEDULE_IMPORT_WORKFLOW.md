# Schedule Import Workflow

The group-stage schedule is imported from `data/scheduleImportTemplate.csv` with:

```bash
npm run import:schedule
```

The current CSV is manually filled from the public FIFA World Cup 2026 match schedule PDF:

https://digitalhub.fifa.com/asset/4b5d4417-3343-4732-9cdf-14b6662af407/FWC26-Match-Schedule_English.pdf

Venue-local times were cross-checked against the public schedule page at:

https://worldcuply.com/schedule.html

Rules:

- Do not invent kickoff times, venues, cities, or teams.
- Keep `matchNumber` aligned to the public match number, so `m026` means Match 26.
- Use the venue's IANA timezone in `timeZone`; the importer computes `kickoffUtc`.
- Keep `sourceLabel`, `sourceUrl`, and `lastVerifiedUtc` on every row.
- Run `npm run validate:data` after every import.
- If a future row becomes unknown, leave only that row out of scheduled import mode and document why before shipping.
