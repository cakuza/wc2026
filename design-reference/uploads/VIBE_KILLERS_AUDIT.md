# Vibe Killers Audit

Date: 2026-06-01

Target emotional reaction:

- "I want to pick my country."
- "I want to make a card."
- "I want to send this to my group."
- "This feels like tournament time."
- "This is more fun than checking Google."

## Vibe Killers Found And Fixed

1. Unsupported card CTAs
   - Where: `src/components/match-intelligence.tsx`
   - Why it kills hype: the user clicks a specific promised card and lands in a generic fallback.
   - Desired reaction: "This opponent report gives me shareable next actions."
   - Exact fix: removed unsupported talking-point, injury-watch, and lineup-watch card CTAs.

2. Dead-button feeling on reminders
   - Where: `src/components/match-intelligence.tsx`, `src/components/team-match-center.tsx`
   - Why it kills hype: a disabled button feels like the product is unfinished.
   - Desired reaction: "Reminders are planned, but the current action is card creation."
   - Exact fix: changed disabled buttons into planned-state labels.

3. Local-time overclaiming
   - Where: `src/components/match-schedule-client.tsx`, `src/components/team-match-center.tsx`
   - Why it kills hype: users lose trust if pending fixture slots sound confirmed.
   - Desired reaction: "The app is honest, and pending data still looks intentional."
   - Exact fix: clarified that confirmed kick-off times convert when available.

4. Team directory sounded like a database
   - Where: `src/app/teams/page.tsx`
   - Why it kills hype: "fixtures, tables, and content hooks" reads operational.
   - Desired reaction: "I want to pick my country."
   - Exact fix: rewrote the page intro around opening a country hub.

5. Team picker headline was useful but not emotional
   - Where: `src/components/team-picker.tsx`
   - Why it kills hype: it did not push the "save your road" behavior.
   - Desired reaction: "I want to save my country's route."
   - Exact fix: changed headline to "Find your country. Save its road."

## Vibe Killers Already Addressed In Prior Pass

1. Card editor showed too much form before value
   - Fix already present: six large templates first, editor below.

2. `/visual-review` was not enough of a visual proof page
   - Fix already present: final owner decision gate with large previews and verdict controls.

3. Pending data could have looked broken
   - Fix already present: reusable data notices and polished pending copy.

4. Squad pending could have felt empty
   - Fix already present: Fan Mode/custom card route remains available.

5. Cards could have felt like tables
   - Fix already present: larger poster frame, bigger headlines, stronger badges, less table-like card rows.

## Remaining Vibe Risks

- Stats and Match Intelligence need real sourced data to become exciting during the tournament.
- Human owner must still inspect card previews and decide whether they are share-worthy.
