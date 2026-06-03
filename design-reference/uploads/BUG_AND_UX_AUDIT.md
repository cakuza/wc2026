# Bug And UX Audit

Date: 2026-06-01

## Summary

No critical runtime bug was found in static inspection or validation. The main high-risk UX issue was misleading action routing from Match Intelligence into card templates that do not exist.

## Issues Found And Fixed

1. Unsupported card CTAs in Match Intelligence
   - Severity: high
   - Page/component: `src/components/match-intelligence.tsx`
   - Why it hurts quality: "Create talking point card", "Create injury watch card", and "Create lineup watch card" implied real card types, but `/cards` does not implement those templates. This creates broken expectation and trust loss.
   - Fix applied: removed unsupported CTAs and kept supported routes: prediction, opponent watch, player watch, and match report.

2. Disabled reminder buttons looked like dead actions
   - Severity: medium
   - Page/component: `src/components/match-intelligence.tsx`, `src/components/team-match-center.tsx`
   - Why it hurts quality: disabled buttons can feel broken, especially on mobile.
   - Fix applied: converted disabled buttons to non-interactive planned-state labels with `aria-disabled`.

3. Local-time copy overclaimed pending kickoff data
   - Severity: medium
   - Page/component: `src/components/match-schedule-client.tsx`, `src/components/team-match-center.tsx`
   - Why it hurts quality: "Showing kickoff times" sounds confirmed even when all fixture slots are pending.
   - Fix applied: copy now says confirmed kick-off times convert when available and pending slots remain marked.

4. Team directory copy felt generic
   - Severity: low
   - Page/component: `src/app/teams/page.tsx`
   - Why it hurts quality: it sounded like a structured data page instead of a fan entry point.
   - Fix applied: rewrote page intro around picking your country and opening its World Cup hub.

5. Team picker copy under-sold the action
   - Severity: low
   - Page/component: `src/components/team-picker.tsx`
   - Why it hurts quality: "Every team. Every group. Local time." was clear but less emotionally useful than the homepage promise.
   - Fix applied: changed to "Find your country. Save its road."

## Checks Performed

- Server/client boundary scan: no browser-only API was found in server components without guards. Browser APIs in client components are behind `useEffect` or event handlers.
- Route reliability: verified through `npm.cmd run check:routes`.
- Query-param routing: supported card URLs pass route check; unsupported Match Intelligence template links were removed.
- Pending state scan: no user-facing ugly main-display `TBD` was found; internal data checks still compare against `"TBD"` and render polished copy.
- Mobile scan from code: `/cards` preview appears before advanced controls on mobile; tables are inside overflow containers where needed.
- Trust wording scan: fan-made disclaimer is present in the card studio and card frames; fake live/player stats are not presented as real.

## Remaining Blockers

- Official kick-off times, venues/cities, real squads, player stats, live results, and reviewed match-intelligence sources remain external data blockers.
- Card visual quality still requires human inspection through `/visual-review`; screenshot tooling did not produce usable PNG proof.
