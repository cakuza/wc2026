# Why This Might Fail

Date: 2026-06-01

Brutal premise: users do not owe this product attention. They already have Google, live-score apps, group chats, fan pages, and Canva.

## Failure Reasons

1. Normal fans may not click
   - Severity: high
   - Affected page/component: homepage hero
   - Why it matters: "World Cup hub" is broad; users need an immediate personal reason.
   - Exact fix: homepage says "Pick your country. See every match. Create fan cards.", shows 48 teams, no signup, local time, and fan-card CTAs.
   - Status: fixed now.

2. Users may bounce in 5 seconds
   - Severity: high
   - Affected page/component: homepage, `/cards`
   - Why it matters: if the page reads like an info directory, it loses to Google.
   - Exact fix: hero CTAs, visual cards, TeamPicker, and six large `/cards` templates are above long controls.
   - Status: fixed now, owner visual review still required.

3. Users may choose Google/SofaScore/FotMob instead
   - Severity: high
   - Affected page/component: schedules, stats, matches
   - Why it matters: competitors own live data and habit.
   - Exact fix: wedge is not live score; it is country-first local schedule plus shareable fan cards and captions.
   - Status: reduced; live data remains external blocker.

4. Users may not create a card
   - Severity: high
   - Affected page/component: `/cards`
   - Why it matters: the card studio is the main differentiated action.
   - Exact fix: six large one-click templates first, preview/actions before advanced controls on mobile.
   - Status: fixed now.

5. Users may not share a card
   - Severity: high
   - Affected page/component: card visuals, `/visual-review`
   - Why it matters: sharing is the growth loop.
   - Exact fix: stronger poster styling, larger headlines, platform-specific review sections, owner verdict controls.
   - Status: reduced; final visual score still needs human inspection.

6. Fan pages may ignore this
   - Severity: medium
   - Affected page/component: `/cards`, `/visual-review`
   - Why it matters: fan pages can use Canva or their own templates.
   - Exact fix: fan-page toolkit and premium-template concepts are visible in review, but not spammy in product.
   - Status: reduced; real fan-page demand remains unproven.

7. It may fail to make money
   - Severity: high
   - Affected page/component: monetization placeholders, `/cards`
   - Why it matters: traffic and payment intent are hard.
   - Exact fix: realistic first path is premium templates after export/share proof; ads and affiliates remain delayed.
   - Status: still a traction blocker.

8. 48-team coverage may not be enough
   - Severity: medium
   - Affected page/component: `/teams`, team pages
   - Why it matters: coverage without emotional utility is just a directory.
   - Exact fix: every team has schedule, match center, card CTA, pending squad handling, and smaller-country examples in `/visual-review`.
   - Status: fixed structurally.

9. Pending kickoff/squad data may hurt trust
   - Severity: high
   - Affected page/component: match cards, team pages, card studio
   - Why it matters: pending data can look broken or fake.
   - Exact fix: polished pending copy, DataStatusNotice variants, "confirmed times convert when available", Fan Mode fallback.
   - Status: fixed as much as possible before official data.

10. Card visuals may fail to feel premium
   - Severity: high
   - Affected page/component: `/cards`, `/visual-review`
   - Why it matters: if cards look amateur, sharing dies.
   - Exact fix: stronger poster frame, bigger headlines, more contrast, less table feeling, final owner review page.
   - Status: reduced; human visual inspection remains required.

11. Mobile users may quit
   - Severity: high
   - Affected page/component: `/cards`, tables, filters
   - Why it matters: social-card creation is mobile-heavy.
   - Exact fix: preview/actions before editor, advanced text collapsed, buttons are large enough, route checks pass.
   - Status: fixed from code inspection; human mobile visual review still needed.

12. Stats may not feel better than Google
   - Severity: medium
   - Affected page/component: `/stats`
   - Why it matters: Google has instant stats once real data exists.
   - Exact fix: stats page is framed around fan debates, copy/share actions, and card creation rather than raw lookup.
   - Status: reduced; real stats remain external blocker.

13. Match Intelligence may feel fake or empty
   - Severity: medium
   - Affected page/component: `src/components/match-intelligence.tsx`
   - Why it matters: vague opponent notes can damage trust.
   - Exact fix: honest news-watch pending notice and unsupported card CTAs removed.
   - Status: reduced; sourced notes are still required.

14. Monetization may be unrealistic
   - Severity: high
   - Affected page/component: monetization components, `/cards`
   - Why it matters: no traffic means no revenue.
   - Exact fix: premium templates ranked first; other paths delayed until traction.
   - Status: traction blocker remains.

15. It may look like a developer demo
   - Severity: high
   - Affected page/component: homepage, `/cards`, `/visual-review`, team pages
   - Why it matters: users bounce from generic dashboards.
   - Exact fix: country-first copy, stadium/pitch visual language, fan-card studio first screen, owner review gate.
   - Status: fixed enough for owner visual review.
