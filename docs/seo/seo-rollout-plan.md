# SEO Rollout Plan — WorldCupMatchDay.com

**Branch:** `seo/intent-clusters-freshness-v1`  
**Status:** Preview ready — awaiting user approval before Production merge

## Sprint 1 (This Branch — seo/intent-clusters-freshness-v1)

### Done
- [x] 12 individual group landing pages (`/groups/group-a` through `/groups/group-l`)
- [x] Top scorers page (`/stats/top-scorers`)
- [x] Qualified/eliminated tracker (`/qualified-eliminated-teams`)
- [x] Team qualification pages (England, Turkey)
- [x] Permanent matchday pages (`/matchdays/YYYY-MM-DD`)
- [x] QuickAnswer, LastUpdated, BreadcrumbNav, SourcesAndMethodology, DataAvailabilityNotice components
- [x] Sitemap updated (new routes + lastmod discipline)
- [x] Robots.txt AI-crawler policy documented
- [x] IndexNow dry-run infrastructure
- [x] GSC audit document
- [x] SEO architecture map
- [x] Machine-readable data artifacts

### Blocked / Deferred
- [ ] IndexNow live submissions — requires INDEXNOW_KEY env var + key file served
- [ ] GPTBot model-training policy — requires explicit owner decision
- [ ] `/today` title/CTR optimization — title is already reasonable; larger CTR improvement needs A/B testing data
- [ ] Homepage WebSite/Organization schema — not urgent; can be Sprint 2
- [ ] `/schedule` SportsEvent schema — can be Sprint 2
- [ ] Qualification pages for all 48 teams — risk of 46 thin pages; generate only on demand

## Sprint 2 (Future — after sprint 1 data)

### Recommendations (based on what we expect to learn)
1. Monitor GSC for new group pages ranking — expand to the full group cluster if Turkey/England pages gain traction
2. Add qualification scenarios ("what England needs to qualify") once deterministic rules are available for remaining matches
3. Add SportsEvent schema to `/schedule/[zone]` and `/today`
4. Homepage WebSite + Organization structured data
5. Pagination for matchday pages (if needed for post-tournament archive)
6. Enable IndexNow with dedicated key once key file infrastructure is in place

## IndexNow Activation Checklist (Sprint 2)
1. Generate a key (UUID4 format)
2. Set `INDEXNOW_KEY=<key>` in Vercel Production env (NOT Preview)
3. Create `public/<key>.txt` containing just the key
4. Set `INDEXNOW_ENABLED=true` in Vercel Production env
5. Test dry-run first: `INDEXNOW_ENABLED=false` (default)
6. Monitor Bing Webmaster Tools for submission acceptance
