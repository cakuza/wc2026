# Pre-Flight Fix Plan

Date: 2026-06-01

Scope: bug scan, vibe killer scan, usefulness analysis. No backend/data features, no new product scope, no final visual-polish expansion.

## Top 10 Bugs / UX Issues

1. Unsupported Match Intelligence card CTAs
   - Pages/components: `src/components/match-intelligence.tsx`
   - Risk: buttons promised talking-point, injury-watch, and lineup-watch cards that the card studio does not actually support.
   - Fix: removed unsupported card links and kept real card routes only.

2. Disabled reminder buttons felt clickable
   - Pages/components: `src/components/match-intelligence.tsx`, `src/components/team-match-center.tsx`
   - Risk: disabled CTAs can read as dead buttons.
   - Fix: converted to non-interactive planned-state labels with `aria-disabled`.

3. Local-time copy overclaimed pending slots
   - Pages/components: `src/components/match-schedule-client.tsx`, `src/components/team-match-center.tsx`
   - Risk: "showing kickoff times" sounded like confirmed times exist.
   - Fix: copy now says confirmed kick-off times convert when available; pending slots stay marked.

4. Team directory headline felt operational
   - Page: `src/app/teams/page.tsx`
   - Risk: country-picking flow felt like a data directory, not a fan entry point.
   - Fix: changed copy to "Pick your country and open its World Cup hub."

5. Team picker copy under-sold country pride
   - Component: `src/components/team-picker.tsx`
   - Risk: less emotional than the homepage promise.
   - Fix: changed copy to "Find your country. Save its road."

6. Card editor first screen could feel form-heavy
   - Component: `src/components/card-generator.tsx`
   - Risk: user saw settings before value.
   - Fix already applied in final visual gate: six large one-click templates first, editor below.

7. Visual review could not prove card quality through screenshots
   - Page: `src/app/visual-review/page.tsx`
   - Risk: inflated visual-quality claims.
   - Fix already applied: large human-review gate with owner verdict controls.

8. Pending squad state could feel empty without Fan Mode
   - Pages/components: team pages, card studio
   - Risk: no player data feels broken.
   - Fix already present: squad pending notices and custom Fan Mode links.

9. Stats hub has low value until real player data arrives
   - Component: `src/components/stats-hub.tsx`
   - Risk: users may expect live leaderboards.
   - Fix: honest pre-tournament state and card CTAs; blocker is external real stats.

10. Match intelligence has low value until sourced notes arrive
   - Component: `src/components/match-intelligence.tsx`
   - Risk: fallback could feel thin.
   - Fix: honest news-watch pending notice and supported card CTAs only; blocker is reviewed sources.

## Top 10 Vibe Killers

1. Unsupported CTAs promising cards that do not exist.
2. Disabled reminder buttons that looked like broken actions.
3. "Showing kickoff times" copy while kick-off is pending.
4. Team directory copy that sounded like admin data.
5. Team picker copy that did not push "save your road."
6. Long card editor before emotional poster value.
7. Too much pending/sample language without clear utility.
8. Stats hub usefulness depends on future squads.
9. Match intelligence depends on reviewed sources.
10. Visual quality could not be proven by screenshot tooling.

## Top 10 Usefulness Gaps

1. Match Intelligence card actions needed to map only to real templates.
2. Pending schedule utility needed clearer "confirmed when available" copy.
3. Team picking needed stronger fan entry copy.
4. Cards page needed instant template value.
5. Visual review needed owner verdict controls.
6. Stats needs real squads/player stats.
7. Opponent Watch needs reviewed manual notes.
8. Reminder CTA needs future implementation before being an action.
9. Smaller-country pages need the same card route as favorites.
10. Monetization should remain disabled until traffic proves demand.

## Top 10 Highest-ROI Fixes Applied

1. Removed unsupported Match Intelligence card links.
2. Converted disabled reminder buttons to planned-state labels.
3. Clarified local-time pending copy.
4. Rewrote teams page intro around country choice.
5. Rewrote TeamPicker copy around saving a country's road.
6. Kept `/cards` large one-click templates first.
7. Kept `/visual-review` as final owner decision page.
8. Kept pending data notices visible and non-ugly.
9. Kept Fan Mode as the squad-pending fallback.
10. Preserved monetization as disabled/subtle until proven.
