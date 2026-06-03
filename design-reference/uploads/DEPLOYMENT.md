# Deployment Guide

## Vercel Deployment Steps

1. Push the repository to GitHub.
2. In Vercel, choose **Add New Project** and import the repo.
3. Keep the default framework preset: **Next.js**.
4. Build command: `npm run build`.
5. Install command: `npm install`.
6. Output directory: leave empty for Next.js.
7. Deploy.

## Environment Variables

Required for production:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SHOW_AD_PLACEHOLDERS=false
```

Optional:

```bash
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
NEXT_PUBLIC_TELEGRAM_URL=
NEXT_PUBLIC_X_URL=
NEXT_PUBLIC_NEWSLETTER_URL=
```

Leave optional values empty at launch unless the channel is ready.

## Domain Connection Steps

1. Buy or choose a domain.
2. Add it in Vercel under **Project Settings > Domains**.
3. Follow Vercel's DNS instructions.
4. Set `NEXT_PUBLIC_SITE_URL` to the production domain.
5. Redeploy after the env var is saved.

## Post-Deploy Checks

Check these URLs:

- `/`
- `/matches`
- `/standings`
- `/leaderboards`
- `/cards`
- `/preview`
- `/sitemap.xml`
- `/robots.txt`
- `/local-time/usa`
- `/teams/brazil-world-cup-schedule`

Then:

- Submit `https://your-domain.com/sitemap.xml` in Google Search Console.
- Inspect the homepage URL in Search Console.
- Confirm canonical URLs use the real domain.
- Confirm ad placeholders are not visible unless intentionally enabled.
- Run a mobile Lighthouse check.
