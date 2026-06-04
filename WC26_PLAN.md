# WC26 Hub — Pivot & Monetization Plan

> **Strategy summary:** Cards were the main product — now they're just a sharing tool. The real product = team tracking hub. Our edge over competitors (worldcupmatchtime, kickoffclock, etc.): **real squad data (1,246 players) + live results infrastructure**. Goal: SEO + AdSense approval + Google AI visibility.

---

## HOW TO USE THIS FILE

Give this file to Claude Code (Desktop or terminal `claude2`). Execute tasks **one by one, in order**. Start each task like this:

> "Read CLAUDE.md and this plan. Apply TASK 1 only. Stop when done, show me the result, and ask before deploying."

Do not move to the next task until the current one is complete and verified on the live site.

---

## TASK 1 — Fill out team pages ⭐ HIGHEST PRIORITY

**Why:** This is both the SEO backbone and the requirement for AdSense approval. Prevents "thin content" rejection.

Each team page (`/teams/[country]-world-cup-schedule`) must include:
- 3 group stage matches in local time (timezone selector must work)
- **Full squad list** (from our 1,246-player dataset — competitors don't have this)
- "Players to watch" section — 2-3 standout names per team
- Group table (pre-tournament mode)
- 2-3 sentences of original team summary (e.g. "Turkey faces Australia, Paraguay and the USA in Group D...")
- "Share schedule" card link at the bottom of each page

**Acceptance criteria:** All 48 pages contain original text + squad + match times. Zero empty or placeholder sections.

---

## TASK 2 — Schema.org + FAQ (for Google AI)

**Why:** Google AI Overviews favors structured, concise data. This is how we show up in AI answers.

- Add `SportsEvent` schema to every team page (for each match)
- Add `FAQPage` schema to homepage and all team pages
- Expand FAQ with real search queries: "What time is Turkey's first match?", "Who is in X team's squad?", "Who qualifies from Group D?" etc.
- Keep answers SHORT and DIRECT (AI will extract these)

**Acceptance criteria:** Schema passes Google Rich Results Test. At least 4 FAQs per page.

---

## TASK 3 — Rewrite homepage messaging

**Why:** The site currently leads with "make a card." The product is now a tracking hub.

- Old hero: "Pick your country. Build the hype. Share the road."
- New hero: **"Follow your country's World Cup path in your local time."**
- Subline: "Match times, squads, group tables, qualification scenarios — and shareable fan cards."
- Primary CTA button: "Pick your country" (not "Create a fan card")
- Cards move to a secondary button

**Acceptance criteria:** Homepage drives users to team pages first. Cards are clearly secondary.

---

## TASK 4 — Apply for AdSense

**Why:** This is the revenue source. BUT do not apply until Tasks 1–3 are done — thin content = instant rejection.

- Apply AFTER Tasks 1, 2, and 3 are complete
- Add `ads.txt` file
- Add Privacy Policy + Cookie Notice pages (AdSense requirement)
- Prepare ad placements but don't go aggressive before approval

**Acceptance criteria:** Site has full content, legal pages exist, application submitted.

---

## TASK 5 — Activate live results + standings (explodes when tournament starts)

**Why:** `sync-results.mjs` infrastructure is already built but idle. Once the tournament begins, searches for "match result" and "group standings" spike — fresh content ranks FAST on Google, even faster than older competitors.

- Test `sync-results.mjs` and the GitHub Action before June 11
- Connect group standings page to live data
- Update "Today's matches" page with real results automatically
- After each match: auto score update + updated table

**Acceptance criteria:** System tested with mock data. Fully operational before tournament kickoff.

---

## TASK 6 — Simplify cards (low priority)

**Why:** Don't delete them, but don't center them either.

- Keep only 2-3 high-value card types: "team schedule", "qualification scenario", "match prediction"
- Remove weak or redundant templates
- Cards = sharing / backlink tool, not a traffic source

**Acceptance criteria:** Fewer but better cards, each containing genuinely useful data.

---

## DO NOT BUILD — Out of scope (aligned with CLAUDE.md)

- Telegram bot
- Payments / premium / checkout
- User accounts / auth
- Pouring all effort into "local time" SEO — that space is saturated. Squad data + live results is our differentiator.

---

## PRIORITY SUMMARY

| # | Task | Expected return |
|---|------|----------------|
| 1 | Fill team pages | SEO + AdSense (highest) |
| 2 | Schema + FAQ | Google AI visibility |
| 3 | Homepage rewrite | Conversion + clarity |
| 4 | AdSense application | Revenue |
| 5 | Live results system | Tournament traffic spike |
| 6 | Simplify cards | Sharing / backlinks |
