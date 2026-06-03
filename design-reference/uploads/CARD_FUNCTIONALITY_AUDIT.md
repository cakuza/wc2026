# Card Functionality Audit

Audit date: 2026-06-01

## Bugs Found And Fixed

1. Match selection could leave stale poster text.
   - Cause: the match dropdown updated `matchId` only.
   - Fix: `applyMatch()` now refreshes the poster headline, team hook, subtitle, time helper, footer, and selected team.

2. Category selection could change the card type without loading matching poster copy.
   - Cause: the category select only set `cardType`.
   - Fix: category selection now loads the first matching preset through `applyCardTypeFromSelect()`.

3. Query-prefilled cards overexposed missing time copy.
   - Cause: prefill state used time-helper text as normal poster text.
   - Fix: card templates now keep missing-time language in small footer/helper positions only.

4. Card previews felt like UI panels.
   - Cause: all templates shared one generic `CardFrame`.
   - Fix: replaced the frame with purpose-built poster layouts for country road, matchday menu, prediction battle, Golden Boot debate, player watch, group chaos, upset watch, and custom fan cards.

5. `/cards` first screen was not focused enough.
   - Cause: the country picker appeared before the poster template gallery.
   - Fix: `/cards` now opens directly with large one-click templates and preview-first workflow.

## Query Params Covered

- `/cards?template=team-schedule&team=turkey`
- `/cards?template=team-schedule&team=japan`
- `/cards?template=prediction&match=m026`
- `/cards?template=golden-boot`
- `/cards?template=player-watch&player=custom&name=Mbappe`
- `/cards?template=opponent-watch&match=m026`

Expected behavior: correct template selected, correct team/match/player context loaded, poster preview visible, no raw `TBD` or `undefined`, and official time uncertainty shown only as helper/footer copy.

## Remaining Limitations

- Match times are not actually active because official kickoff data is not present.
- PNG export depends on browser support for `html-to-image`; blocked browsers show a clear message.
- Final card visual quality still needs owner review through `/visual-review` and `/cards`.
