# P0 lifecycle contract

## Ownership

`getTournamentPhase` owns the broader football phase. `getArchiveState` owns archive completion. UI must never infer completion from a phase label or a missing countdown target. Completion requires a trustworthy Match 104 final result and a complete resolved fixture inventory. The homepage countdown targets the first unresolved deciding match. Existing kickoff-window policy remains the sole owner of polling eligibility.

| Phase | Hero/countdown | `/today` | Match 103 / 104 | Final Weekend | Archive | Schedule and static output | Polling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Pre-tournament | Opening-match countdown | Normal Match Center | Contextually hidden; routes remain generated | No | No | Full schedule/routes generated | Existing policy |
| Group stage | Next fixture countdown | Normal Match Center | Contextually hidden | No | No | Full schedule/routes generated | Existing policy |
| Knockout before Final Weekend | Next fixture countdown | Normal Match Center | Contextually hidden | No | No | Full schedule/routes generated | Existing policy |
| Final Weekend before 103 | Countdown to 103 | Final Weekend notice and deciding cards | Both visible; 103 then 104 | Yes | No | Both schedule entries and routes visible/generated | Existing policy |
| Between 103 and 104 | Countdown to 104 | Final Weekend notice and deciding cards | 103 result and 104 fixture visible | Yes | No | Both schedule entries and routes visible/generated | Existing policy |
| 104 final but inventory incomplete or untrusted | No completion claim | Results still syncing / Final Weekend state | Both visible with truthful individual state | Yes | No | Both visible/generated | Existing policy |
| Trustworthy 104 final and complete inventory | Completion state, no countdown | Archive-oriented results | Both visible as results | Replaced | Yes | Both visible/generated | Existing policy |
| Fully archived/post-release | Archive headline and navigation | Archive-oriented results | Both visible as historical results | Replaced | Yes | Both visible/generated | Polling policy may stop only under its existing rules |

## Regression ownership

`scripts/test-final-stage-lifecycle.ts` owns placement-match phase transitions. `scripts/test-completion-boundary-scenarios.ts` owns completion and countdown wiring. `scripts/test-archive-lifecycle.ts` owns trustworthy archive-result derivation. Fresh-output parity and browser QA must assert this table rather than a semifinal-only snapshot.

## Reproducible QA

Use Node 24 and npm 11 or compatible locked tooling. Run `npm ci`, then `npm run browser:install` to install Chromium, then `npm run verify`. The canonical browser viewports are 1440x900, 390x844, and 360x800. Static overflow checks are not hydrated browser QA.
