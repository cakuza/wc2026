# Money-Making Plan

This project should monetize only after the free fan workflow proves demand: country page visits, card template clicks, PNG exports, copied captions, and return visits around matchdays.

## Ranked Paths

1. Premium fan-card template packs
   - Most realistic first paid layer because `/cards` is already the conversion page.
   - Sell extra visual styles, country packs, prediction packs, and story layouts.
   - Keep core templates free so sharing keeps growing.

2. Display sponsorship for matchday and team pages
   - Realistic after route traffic exists across `/teams/[slug]`, schedule pages, and `/matches`.
   - Use one rights-safe sponsor slot per page family, with disclosure.
   - Avoid intrusive ad density on mobile.

3. Affiliate blocks
   - Realistic for travel, tickets, streaming guides, VPN, fan gear, and watch-party supplies.
   - Requires country-specific disclosure, legal review, and brand-safety checks.
   - Do not imply official tournament affiliation.

4. Reminder subscriptions
   - Useful if users prove they follow teams and copy/save schedules.
   - Could be email, Telegram, or WhatsApp reminders.
   - Needs opt-in compliance and infrastructure, so it is later than templates.

5. B2B content tools for fan pages
   - Offer bulk template exports, watermark removal, caption packs, and scheduled post kits.
   - More revenue per customer, but harder to sell than self-serve templates.

## Current Implementation

- `MonetizationSlot`, `PremiumTemplatesTeaser`, and `AffiliateBlock` exist in `src/components/monetization.tsx`.
- Placeholders are disabled by default.
- Set `NEXT_PUBLIC_SHOW_MONETIZATION_PLACEHOLDERS=true` to show subtle internal placeholders.
- Current placements: homepage, cards page, and stats page.

## Guardrails

- No official logos, crests, photos, kit copies, sponsor marks, or affiliation claims.
- Paid templates should remain original, nation-inspired graphics.
- Ads and affiliates need clear disclosure before public activation.
- Monetization should not hide the free card workflow or damage mobile usability.

## Metrics To Track Before Charging

- Team picker clicks.
- `/cards` visits from homepage/team pages.
- Template preset clicks.
- PNG export success/failure.
- Caption copy clicks.
- Schedule link copy clicks.
- Return visits by team page.
- Mobile bounce rate on `/cards`.
