# WC26 Hub

A low-cost MVP for a World Cup 2026 Fan Hub. Fans can pick a team, see every match in local time, view simple stats, create fan-made cards, and generate captions for Instagram, X, WhatsApp, and Telegram.

## What is included

- Next.js App Router with TypeScript and Tailwind CSS
- Static JSON data in `data/`
- Full 48-team / 12-group static coverage scaffold for launch
- 72 group-stage fixture slots marked `schedulePending` until official kickoff times, venues, and cities are added
- Pending squad containers for every team, without invented official players
- Manual freshness metadata in `data/meta.json`
- Local timezone detection plus quick timezone selector
- Routes for home, matches, standings, leaderboards, teams, team detail pages, cards, and preview copy
- SEO landing pages for match, schedule, standings, player stat, and team schedule searches
- Mock provider adapter with API-Football and Sportmonks placeholders
- Sync placeholders for matches, standings, and player stats
- SEO metadata, sitemap, and robots.txt
- PNG card export using `html-to-image`
- Fan Mode for text-only player-watch, jersey-back, prediction, and matchday cards
- Optional ad and analytics placeholders, disabled by default
- Follow placeholders for Telegram, X/Twitter, and newsletter links

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

On Windows PowerShell with script execution disabled, use:

```bash
npm.cmd install
npm.cmd run dev
```

## Windows quick start

1. Double-click `RUN_DEV.bat`.
2. Wait until the terminal shows `http://localhost:3000`.
3. Double-click `OPEN_LOCALHOST.bat`.
4. Use `/visual-review` for final owner inspection before launch.
5. Run `PRELAUNCH_CHECK.bat` before deploy.

`PRELAUNCH_CHECK.bat` does not start the dev server. Route checks need a running server, so start `RUN_DEV.bat` first and then run `npm.cmd run check:routes` in another terminal when needed.

## Validate before launch

```bash
npm run validate:data
npm run lint
npm run typecheck
npm run build
```

`validate:data` checks exact 48-team coverage, 12 groups, 4 teams per group, 72 group-stage fixture slots, standings coverage, squad containers, duplicate ids, alias conflicts, pending fixture honesty, invalid groups, invalid match team ids, invalid player team ids, invalid squad statuses, and fake/sample player data marked official.

For the full pre-launch gate:

```bash
npm run prelaunch
```

Route checks require a running dev or production server:

```bash
npm run dev
npm run check:routes
```

Use `ROUTE_CHECK_BASE_URL=https://your-domain.example npm run check:routes` to check a deployed site.

## Deploy on Vercel

1. Push this repo to GitHub.
2. Import the repo in Vercel.
3. Keep the default Next.js build settings.
4. Deploy on the free tier.

No database or paid sports API is required for the MVP.

## Environment variables

Copy `.env.example` if you need local overrides.

- `NEXT_PUBLIC_SITE_URL`: canonical production URL used by metadata, sitemap, and robots.
- `NEXT_PUBLIC_SHOW_AD_PLACEHOLDERS`: keep `false` at launch unless you want visible ad placeholders.
- `NEXT_PUBLIC_GA_ID`: optional Google Analytics id. Empty means disabled.
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`: optional Plausible domain. Empty means disabled.
- `NEXT_PUBLIC_TELEGRAM_URL`: optional Telegram follow link. Empty shows Coming soon.
- `NEXT_PUBLIC_X_URL`: optional X/Twitter follow link. Empty shows Coming soon.
- `NEXT_PUBLIC_NEWSLETTER_URL`: optional newsletter link. Empty shows Coming soon.
- `NEXT_PUBLIC_SHOW_AFFILIATE_PLACEHOLDERS`: keep `false`; future affiliate blocks are placeholders only.

Analytics and ad placeholders are opt-in. No third-party tracking or ad scripts run unless env vars are set.

## IP and brand safety

WC26 Hub is a fan-made card studio and schedule tool. It may use player names as text in editorial, factual, prediction, or debate contexts. It does not use FIFA logos, official World Cup logos, team crests, player photos, realistic player likenesses, official kits, sponsor logos, or copied sports-media visual identities. Cards use text, country names, flag emojis, shirt numbers, original jersey-back silhouettes, pitch-inspired patterns, gradients, and generic football visuals.

Use the subtle disclaimer where appropriate:

```text
Fan-made. Not affiliated with FIFA or any official tournament organizer.
```

See `docs/IP_SAFETY.md` before adding any logos, player images, crests, branded artwork, or licensed assets.

## Replace mock data with a real API later

The active provider is `src/lib/providers/mockProvider.ts`, exported through `src/lib/providers/index.ts`.

When traffic justifies API cost:

1. Add API credentials to Vercel environment variables.
2. Implement either `src/lib/providers/apiFootballProvider.ts` or `src/lib/providers/sportmonksProvider.ts`.
3. Normalize API responses into the internal types in `src/lib/types.ts`.
4. Switch `footballProvider` in `src/lib/providers/index.ts`.
5. Use the placeholder sync files in `src/lib/sync/` for scheduled jobs or cron-backed refreshes.
6. Add Supabase or another low-cost store only when API response caching and historical data become necessary.

## Low-cost upgrade plan

### Phase 1: Static/mock launch

Launch with static JSON, SEO pages, cards, and deterministic content templates. Focus on indexing and social sharing before adding paid services.

### Phase 2: Manual JSON updates

Update fixtures, standings, and player stats manually in `data/` as needed. For official fixture updates, replace `kickoffUtc: null`, `venue: "TBD"`, `city: "TBD"`, and `dataStatus: "schedulePending"` with sourced values and update `sourceLabel`.

### Phase 3: Cheap API integration with caching

Connect only the highest-demand routes first, likely matches and standings. Cache responses aggressively and keep the mock provider as a fallback.

### Phase 4: Supabase + cron sync if traction exists

Add Supabase and scheduled sync only when historical data, update frequency, or API limits make static JSON awkward.

### Phase 5: Ads and affiliate expansion

Enable ad placeholders only after pages have content depth and measurable traffic. Add affiliate or newsletter placements carefully so the UX stays fast.

## Manual data update workflow

1. Edit the JSON files in `data/`.
2. Update `data/meta.json` with the new UTC timestamp, source, update mode, and note.
3. Run `npm run validate:data`.
4. Run `npm run lint`.
5. Run `npm run typecheck`.
6. Run `npm run build`.
7. Deploy.

Shortcut:

```bash
npm run prelaunch
```

The current data includes exactly 48 teams, 12 groups, 72 group-stage fixture slots, and 48 pending squad containers. Fixture slots are schedule-pending, with `kickoffUtc: null` and `TBD` venue/city values. Player squads are intentionally empty until official, provisional, or reported data is imported. It is clearly labeled as pre-launch sample data, not live or official tournament data.

## Squad import workflow

1. Add verified, provisional, or manually reported rows to `data/squadImportTemplate.csv`.
2. Run `npm run import:squads`.
3. Run `npm run validate:data`.
4. Run `npm run prelaunch`.

Do not invent official squads. Official player rows must include a source URL. The CSV columns are `teamSlug,playerName,displayName,shirtNumber,position,club,age,caps,goals,isStar,isCaptain,dataStatus,sourceLabel,sourceUrl`. See `docs/SQUAD_DATA_WORKFLOW.md`.

## Free match intelligence workflow

1. Search Google News RSS, GDELT, or trusted RSS feeds manually.
2. Review the source before adding anything.
3. Add only title, source name, date, link, category, confidence, and a very short summary in our own words to the intelligence JSON files.
4. Mark `sourceLabel`, `sourceUrl`, `confidence`, and `isSample`.
5. Avoid full article copying and avoid unsupported definitive claims.
6. Run `npm run validate:data`.
7. Run `npm run prelaunch`.
8. Deploy.

Match Intelligence data lives in:

- `data/matchIntelligence.json`
- `data/newsWatch.json`
- `data/injuryWatch.json`
- `data/lineupWatch.json`
- `data/talkingPoints.json`

## Suggested low-cost launch plan

- Launch with static fixture pages and SEO-friendly team URLs.
- Publish daily social cards manually from `/cards`.
- Use `/preview` to draft posts for X, Telegram, Instagram, and match pages.
- Track traffic and search queries before adding paid data.
- Add a real API only for the routes that prove demand first, likely matches and standings.

## Data files

- `data/teams.json`
- `data/players.json`
- `data/squads.json`
- `data/matches.json`
- `data/standings.json`
- `data/playerStats.json`

The mock data is intentionally simple so it is cheap to edit, validate, and replace. Squad and player data can stay pending until a manual import or future cached API integration is justified.
