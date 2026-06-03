# Design Parity Report

Source of truth:
- `design-reference/World Cup Fan Hub - Prototype.html`
- `design-reference/World Cup - Final Direction.html`
- `design-reference/wc-cards2.jsx`
- `design-reference/wc-fx.jsx`
- `design-reference/wc-studio.jsx`
- `design-reference/wc-screens.jsx`
- `design-reference/wc-gallery.jsx`

Direction: Fan-Page Poster energy on a Festival spine.

| Area | Match level | What differs | Why it differs | Fix applied |
| --- | --- | --- | --- | --- |
| Homepage | close | Next.js keeps production data modules, SEO sections, TeamPicker, and update signup around the reference hero system. | The reference is a static prototype; the app must preserve existing routes, data, and Fan Hub logic. | Ported white Festival shell, bold hero, featured 16:9 poster, two secondary posters, trending flag rail, and CTAs. Removed the old dark dashboard feel. |
| `/cards` | close | Studio controls are production-form compatible rather than the exact mobile prototype stack. | Existing query params, caption kit, copy/export, and template state had to remain intact. | Money templates render as full poster previews first. Ratio and theme controls now use Claude-style segmented controls. |
| Poster engine | close | Uses app data and CSS/Tailwind components instead of direct browser-global prototype objects. | Next.js needs typed Team/Match/Player data and no external prototype globals. | Extracted shared `PosterFrame`, `PosterEffects`, ratio layouts, template renderers, and watermark/pro state into `src/components/poster-engine.tsx`. |
| 9:16 ratio | close | Typography is slightly more conservative for long live team names. | Production names can be longer than the prototype sample set. | Story layout uses vertical composition and safer headline/name wrapping without arbitrary word splits. |
| 1:1 ratio | close | Square layout shares some story spacing primitives. | Keeps one renderer while still reflowing content by ratio. | Square uses independent aspect ratio dimensions and centered poster composition, not cropped Story output. |
| 16:9 ratio | close | Some row text is smaller than prototype in stress cases. | Group Chaos and long names needed room in production preview widths. | 16:9 switches to landscape split layouts for Road, Prediction, Player, Chaos, Menu, Boot, Upset, and Custom. |
| Festival theme | close | Team colors are generated from app team names rather than Claude's fixed color table. | Existing data model does not store the Claude reference color table. | Preserved white chrome, black/team-color posters, contrast-aware pop colors, streamers, floodlights, halftone, grain, and vignette. |
| Night/Gold theme | close | Night/Gold is UI-gated preview only; no payment is wired. | Requirement says no real payment implementation. | Added Night/Gold poster theme, gold inset treatment, Pro lock overlay, Go Pro teaser, and premium pack preview. |
| Watermark/pro behavior | close | Export is still browser-canvas dependent and may report failure when unsupported. | The existing app uses client-side export behavior. | Free previews show `wc26.app`; Pro preview hides it. Copy/download actions keep status reporting. |
| Team page | close | Includes existing data honesty and player/opponent modules below the hero. | Product logic and schedule/squad status must remain visible. | Added white chrome, full-bleed team-color hero, huge flag, country name, group path, three matchups, and poster CTAs. |
| `/visual-review` | close | It is an implementation QA page, not an exact Claude gallery screen. | It must document production stress tests and route checks. | Added homepage/cards previews, 4x3 ratio matrix, Night/Gold pack, watermark compare, Group Chaos 16:9 stress, long-name stress, and `Claude parity check`. |

Text and layout stress fixes:
- Replaced unsafe arbitrary word-breaking in posters and team page with normal word boundaries.
- Germany, Japan, South Africa, Bosnia and Herzegovina, Cote d'Ivoire, DR Congo, United States, and Saudi Arabia should wrap at spaces instead of splitting mid-word.
- Removed dashboard-style panels inside poster cards; poster interiors stay full-bleed with texture/effects layers.
- Replaced corrupted encoded separators and fallback glyphs in critical poster/card files.

Remaining visual risks:
- The app does not yet use Claude's exact fixed country color table, so some team-color posters will not be pixel-identical.
- The Next.js poster engine uses live app data, which can create denser layouts than the prototype fixtures.
- CSS/HTML export fidelity depends on browser support for the current PNG capture path.
