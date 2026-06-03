# Performance Notes

## Current Posture

- The app is mostly statically rendered.
- Client components are limited to filters, timezone selector, cards, team search, and preview editing.
- No database, auth, paid API, or server-side polling is used.
- Analytics and ads are disabled unless env vars are set.

## Improvements Made

- Removed per-card SportsEvent JSON-LD from `MatchCard` to avoid bloating fixture-heavy pages.
- Kept `html-to-image` as a dynamic import inside the PNG export click path.
- Kept ad placeholders server-rendered and disabled by default.
- Used static generation for local-time and team schedule pages.

## Performance Risks

- `/matches` renders 48 cards. This is acceptable now, but pagination or date grouping may help if the dataset grows.
- `/cards` is the largest interactive bundle because it handles preview/export controls.
- Lucide icons are convenient but should not be expanded heavily across client components.
- FAQ JSON-LD on many pages is fine, but avoid adding huge FAQ lists.

## Recommended Checks Before Launch

- Run `npm run prelaunch`.
- Run Lighthouse on mobile for `/`, `/matches`, and `/cards`.
- Keep ad placeholders off until Core Web Vitals are understood.
- Avoid adding third-party widgets before Google indexing starts.

## Future Optimizations

- Add date grouping to `/matches`.
- Move card export to server-side Satori/resvg if browser PNG export becomes unreliable.
- Add lightweight route-level loading states only if real API data is introduced.
- Consider replacing icon-heavy buttons with CSS/text if bundle pressure matters.
