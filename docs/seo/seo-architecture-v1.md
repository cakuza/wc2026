# SEO Architecture v1 — WorldCupMatchDay.com

**Last updated:** 2026-06-23  
**Branch:** `seo/intent-clusters-freshness-v1`

## Intent Clusters

### 1. Live Matchday Cluster
Primary intent: "What matches are on today / right now?"

```
/ (homepage)
└── /today ← canonical "today's matches"
    ├── /matchdays/2026-06-11 … /matchdays/2026-07-19 (permanent dated pages)
    └── /schedule (full schedule hub)
        └── /schedule/[zone] (timezone variants)
```

### 2. Group Standings Cluster
Primary intent: "Group standings / which teams are in Group X?"

```
/groups (hub — all 12 groups)
├── /groups/group-a … /groups/group-l (12 dedicated group pages) ← NEW
└── /world-cup-third-place-qualification
    └── /qualified-eliminated-teams ← NEW
```

### 3. Statistics Cluster
Primary intent: "World Cup 2026 stats / top scorers"

```
/stats (hub)
└── /stats/top-scorers (Golden Boot) ← NEW
```

### 4. Team Cluster
Primary intent: "Team fixtures / squad / group / qualification"

```
/teams (hub)
└── /teams/[slug] (48 team pages)
    └── /teams/[slug]/qualification (england, turkey) ← NEW
```

### 5. Match Detail Cluster
Primary intent: "Match result / scorers / lineups"

```
/matches/[matchId] (72 match detail pages)
```

### 6. Timezone Schedule Cluster
Primary intent: "World Cup schedule in my timezone"

```
/world-cup-schedule-local-time (explainer hub)
└── /schedule/[zone] (direct timezone schedules)
```

## Canonical Rules

| Pattern | Canonical | Notes |
|---------|-----------|-------|
| `/today` | `/today` | `?date=` and `?tz=` params → noindex |
| `/groups/group-a` | `/groups/group-a` | Not `/groups#group-a` |
| `/stats/top-scorers` | `/stats/top-scorers` | Not `/stats#top-scorers` |
| `/matchdays/YYYY-MM-DD` | `/matchdays/YYYY-MM-DD` | UTC date; not locale-specific |
| `/today?date=2026-06-23` | `/matchdays/2026-06-23` | Dated `/today` views are UX state, not SEO pages |

## Internal Link Rules

1. Every new indexable page must have ≥1 parent link.
2. Group pages linked from `/groups` hub (via "Full standings →").
3. Top scorers linked from `/stats` hub.
4. Qualified/eliminated linked from `/world-cup-third-place-qualification` and `/groups`.
5. Qualification pages linked from team pages and group pages.
6. Matchday pages linked from each other (prev/next nav) and from `/schedule`.

## Breadcrumb Hierarchy

```
Home > Groups > Group A
Home > Stats > Top Scorers
Home > Qualified & Eliminated Teams
Home > Teams > England > Qualification
Home > Matchdays > Tuesday, 17 June 2026
```

## noindex Rules

| URL pattern | robots |
|------------|--------|
| `/today?date=*` | `noindex, follow` |
| `/today?tz=*` | `noindex, follow` |
| All other indexed routes | Default (index) |

No query-param URLs are in the sitemap.
