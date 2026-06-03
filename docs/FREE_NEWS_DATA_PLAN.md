# Free News Data Plan

The MVP does not scrape production sites, copy articles, or require paid APIs. Match Intelligence is updated manually from reviewed sources, with source labels and confidence levels.

## Google News RSS Strategy

Use Google News RSS only as a discovery layer. Review each item manually before adding it to JSON.

English queries:
- `[team] injury World Cup`
- `[team] predicted lineup`
- `[player] injury`
- `[team] suspension`
- `[team] controversy`
- `[team] training update`

Turkish queries:
- `[takim] sakat Dunya Kupasi`
- `[oyuncu] sakatlik`
- `[takim] muhtemel 11`
- `[takim] cezali oyuncu`
- `[takim] kamp haberleri`

Spanish queries:
- `[equipo] lesion Mundial`
- `[jugador] lesion`
- `[equipo] once probable`
- `[equipo] sancionado`

Portuguese queries:
- `[time] lesao Copa do Mundo`
- `[jogador] lesao`
- `[time] escalacao provavel`

French queries:
- `[equipe] blessure Coupe du Monde`
- `[joueur] blessure`
- `[equipe] composition probable`

## GDELT Strategy

Use GDELT as a free exploration source for headline discovery and multilingual coverage. Treat it as a lead generator, not a final truth source. Add only reviewed title/source/date/link/short summary to JSON.

## Manual Review Workflow

1. Search Google News RSS, GDELT, or trusted RSS feeds.
2. Open the source and verify the claim.
3. Add title, source name, date, link, category, and a very short summary in our own words.
4. Mark confidence: low, medium, or high.
5. Avoid definitive wording unless the source is strong.
6. Run `npm run validate:data`.
7. Deploy.

## Attribution Rules

- Show title, source, date, and link.
- Do not copy full article text.
- Summaries must be short and written in our own words.
- Use `Reported`, `Expected`, `Predicted`, `Doubtful`, `Monitoring`, or `Needs confirmation`.
- Use `Confirmed` only when source quality and confidence justify it.

## Rate Limiting

- Manual checks only at launch.
- If automated later, cache responses and limit polling by team/match priority.
- Do not hit sources aggressively.

## Defamation And Rumor Safety

- Avoid unsupported claims about scandals, criminal allegations, dressing-room crises, bans, or tournament-ending injuries.
- Prefer "media attention", "reported issue", "needs confirmation", or "monitoring".
- Sensitive items require stronger source quality and conservative wording.
