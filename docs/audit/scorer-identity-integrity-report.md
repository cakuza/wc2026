# Scorer Identity Integrity Audit

**Date:** 2026-06-28
**Branch:** `fix/scorer-identity-integrity-v1`
**Scope:** PR #9 scorer identity follow-up after adversarial audit acceptance.

## Verdict

The four accepted blockers are addressed in the working tree:

1. Alias resolution is context-constrained and fails closed.
2. The three remaining score/event-count mismatches have full verified event corrections.
3. Top Scorers JSON-LD coverage is deterministic for healthy and fallback states.
4. Exact-SHA Preview verification is required after the final correction commit is pushed.

## Alias Resolution Contract

The active resolver is:

```ts
resolvePlayerAlias({
  provider,
  matchId,
  eventMinute,
  stoppageMinute,
  scoringTeam,
  playerTeam,
  rawName,
  providerPlayerId,
  providerAthleteId,
})
```

Resolution order:

1. Provider player or athlete ID.
2. Exact provider, match, and event identity.
3. Exact provider, match, scoring team, and raw value.
4. Verified team-constrained canonical roster match.
5. Unresolved/raw value.

Fail-closed rules covered by deterministic tests:

- wrong provider is rejected;
- wrong match is rejected;
- wrong team is rejected;
- missing match context is rejected for contextual aliases;
- event minute and stoppage time are enforced when an alias declares them;
- malformed provider strings never resolve through a global replacement table.

## Resolved Score/Event Mismatches

| Match | Final Score | Verified Events |
|---|---:|---|
| `czechia-vs-south-africa-jun18` | 1-1 | 54' Michal Sadílek, 83' Teboho Mokoena penalty |
| `switzerland-vs-bosnia-jun18` | 4-1 | 17' Breel Embolo penalty, 23' Rubén Vargas, 32' Johan Manzambi, 57' Ermin Mahmić, 90+6' Granit Xhaka penalty |
| `austria-vs-jordan-jun16` | 3-1 | 10' Marko Arnautović, 34' Christoph Baumgartner, 76' Yazan Al-Arab own goal, 87' Ali Olwan |

The invariant is:

```text
non-shootout goal events = home score + away score
```

for every finished match in the recomputed inventory.

## Inventory

The inventory was recomputed from the current provider payload through final repository code plus verified event corrections.

| Metric | Count |
|---|---:|
| Provider games | 80 |
| Finished matches | 66 |
| Non-shootout goals | 196 |
| Goal events | 196 |
| Resolved canonical identities | 196 |
| Deliberately unresolved identities | 0 |
| Own goals | 7 |
| Penalties | 7 |
| Corrupted identities corrected | 52 |
| Team-membership violations | 0 |
| Score/event mismatches | 0 |
| Duplicate-event mismatches | 0 |
| Unsupported corrections | 0 |

## Turkey vs United States

Expected rendered scorer list:

- 3' Auston Trusty - United States
- 10' Arda Güler - Turkey
- 31' Barış Alper Yılmaz - Turkey
- 49' Sebastian Berhalter - United States
- 90+8' Kaan Ayhan - Turkey

The malformed provider strings `Baris Alpr Ailmaz` and `Kan Aihan` are only accepted in the Turkey-USA match context at their verified event positions.

## Top Scorers JSON-LD

Healthy trusted snapshots emit an `ItemList` whose items match the visible ranking. Fallback or unavailable scorer data does not emit authoritative ranking schema and instead renders an honest availability state. Own goals and unresolved scorer placeholders are excluded from named Top Scorers aggregation.

## Remaining Requirement

After the final correction commit is pushed, wait for the Vercel Preview built from the exact final SHA and run the sparse sequential scorer crawl against that deployment. Main, Production, and AdSense remain untouched.
