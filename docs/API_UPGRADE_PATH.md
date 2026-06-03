# API Upgrade Path

## Phase A: Static JSON

Cost: near zero  
Complexity: low  

Use the current `data/*.json` files and mock provider. Best for indexing, pre-launch validation, and testing audience demand.

## Phase B: Manual JSON Updates

Cost: near zero  
Complexity: low  

Edit JSON files manually, update `data/meta.json`, run `npm run prelaunch`, and deploy. This works until update frequency becomes painful.

## Phase C: API-Football Integration

Cost: low to medium depending on plan  
Complexity: medium  

Implement `src/lib/providers/apiFootballProvider.ts`. Start with fixtures only, cache aggressively, and keep mock data as fallback.

## Phase D: Sportmonks Integration

Cost: medium  
Complexity: medium to high  

Use if coverage, reliability, or commercial terms are better than API-Football. Map Sportmonks responses into the existing internal types.

## Phase E: Supabase + Cron Sync

Cost: low initially, grows with traffic  
Complexity: medium  

Add Supabase only when the site needs cached API responses, history, or scheduled sync. Use cron jobs for matches, standings, and player stats.

## Rule of Thumb

Do not pay for live data until search impressions, social shares, or direct traffic prove that users care.
