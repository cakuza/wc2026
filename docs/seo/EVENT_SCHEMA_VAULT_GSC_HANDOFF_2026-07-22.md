# Google Search Console & SEO Post-Deployment Handoff — 2026-07-22

**Target Audience**: Claude Desktop / SEO Operations Team  
**Repository**: `cakuza/wc2026`  
**Production Site**: `https://www.worldcupmatchday.com`  
**Date**: 2026-07-22  

---

## 1. Executive Summary of Technical Changes

This release completes the post-tournament SEO Wave 2, resolving all truthful `SportsEvent` structured data deficiencies flagged in Google Search Console, establishing "The 2026 World Cup Vault" brand identity, and capturing direct-answer SEO opportunities for `/stats` and `/schedule/eastern-time`.

### Key Improvements:
1. **Factual & Complete `SportsEvent` Schema**:
   - Every match detail page (`/matches/[matchId]`) now renders full, canonical `SportsEvent` JSON-LD schema.
   - Resolves missing `description`, `image`, `location.address` (streetAddress, addressLocality, addressRegion, postalCode, addressCountry), `performer`, `organizer` (FIFA), `homeTeam`, `awayTeam`, `competitor`, and stable `@id` anchors (`#sports-event`, `#team`, `#place`).
2. **Authoritative Host Venue Registry (`lib/venueRegistry.ts`)**:
   - Mapped all 16 official host stadiums (+ 1 match alias) to physical address records verified against municipal and stadium operator records (documented in `docs/seo/EVENT_VENUE_ADDRESS_SOURCES_2026-07-22.md`).
3. **Dynamic Match OpenGraph Images (`app/matches/[matchId]/opengraph-image.tsx`)**:
   - Pre-renders 1200x630 match summary images with team names, final scores, stage, venue, and "2026 World Cup Vault" branding for social sharing and search engines.
4. **"The 2026 World Cup Vault" Rebrand**:
   - Updated root layout metadata, WebSite schema (`alternateName: "World Cup 2026 Vault"`), homepage Hero heading/subtitle, and `/world-cup-2026` hub page.
5. **SEO Opportunities Captured**:
   - `/stats`: Added direct-answer summary block above the fold ("The 2026 World Cup produced 308 goals across 104 matches...") and updated metadata title (`World Cup 2026 Statistics — Goals, Records & Leaders`).
   - `/schedule/eastern-time`: Optimized title (`World Cup 2026 Results in Eastern Time — Complete ET Schedule`), description, and contextual internal links.

---

## 2. Canonical `SportsEvent` JSON-LD Example (Match 104 — Final)

```json
{
  "@context": "https://schema.org",
  "@type": "SportsEvent",
  "@id": "https://www.worldcupmatchday.com/matches/match-104#sports-event",
  "name": "Spain 1–0 Argentina — 2026 FIFA World Cup Final",
  "description": "Spain defeated Argentina 1–0 after extra time in the 2026 FIFA World Cup Final at MetLife Stadium.",
  "url": "https://www.worldcupmatchday.com/matches/match-104",
  "startDate": "2026-07-19T19:00:00.000Z",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "sport": "Soccer",
  "location": {
    "@type": "Place",
    "@id": "https://www.worldcupmatchday.com/venues/metlife-stadium#place",
    "name": "New York New Jersey Stadium (MetLife Stadium)",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "1 MetLife Stadium Dr",
      "addressLocality": "East Rutherford",
      "addressRegion": "NJ",
      "postalCode": "07073",
      "addressCountry": "US"
    }
  },
  "image": [
    "https://www.worldcupmatchday.com/matches/match-104/opengraph-image"
  ],
  "homeTeam": {
    "@type": "SportsTeam",
    "@id": "https://www.worldcupmatchday.com/teams/spain#team",
    "name": "Spain",
    "url": "https://www.worldcupmatchday.com/teams/spain"
  },
  "awayTeam": {
    "@type": "SportsTeam",
    "@id": "https://www.worldcupmatchday.com/teams/argentina#team",
    "name": "Argentina",
    "url": "https://www.worldcupmatchday.com/teams/argentina"
  },
  "competitor": [
    {
      "@type": "SportsTeam",
      "@id": "https://www.worldcupmatchday.com/teams/spain#team",
      "name": "Spain",
      "url": "https://www.worldcupmatchday.com/teams/spain"
    },
    {
      "@type": "SportsTeam",
      "@id": "https://www.worldcupmatchday.com/teams/argentina#team",
      "name": "Argentina",
      "url": "https://www.worldcupmatchday.com/teams/argentina"
    }
  ],
  "performer": [
    {
      "@type": "SportsTeam",
      "@id": "https://www.worldcupmatchday.com/teams/spain#team",
      "name": "Spain",
      "url": "https://www.worldcupmatchday.com/teams/spain"
    },
    {
      "@type": "SportsTeam",
      "@id": "https://www.worldcupmatchday.com/teams/argentina#team",
      "name": "Argentina",
      "url": "https://www.worldcupmatchday.com/teams/argentina"
    }
  ],
  "organizer": {
    "@type": "Organization",
    "name": "FIFA",
    "url": "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/"
  },
  "inLanguage": "en"
}
```

---

## 3. Host Venue Physical Address Ledger

| Venue Key | Name in Match Data | Street Address | City / Locality | Region | Postal Code | Country |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `estadio-azteca` | Estadio Azteca | Calz. de Tlalpan 3465 | Santa Úrsula Coapa | CDMX | 04650 | MX |
| `estadio-akron` | Estadio Akron | Av. Circuito JVC 2800, El Bajío | Zapopan | Jalisco | 45019 | MX |
| `estadio-bbva` | Estadio BBVA | Av. Pablo Livas 2011 | Guadalupe | Nuevo León | 67140 | MX |
| `bmo-field` | BMO Field | 170 Princes' Blvd | Toronto | ON | M6K 3C3 | CA |
| `bc-place` | BC Place | 777 Pacific Blvd | Vancouver | BC | V6B 4Y8 | CA |
| `sofi-stadium` | SoFi Stadium | 1001 Stadium Dr | Inglewood | CA | 90301 | US |
| `levis-stadium` | Levi's Stadium | 4900 Marie P DeBartolo Way | Santa Clara | CA | 95054 | US |
| `lumen-field` | Lumen Field | 800 Occidental Ave S | Seattle | WA | 98134 | US |
| `mercedes-benz-stadium` | Mercedes-Benz Stadium | 1 AMB Drive NW | Atlanta | GA | 30313 | US |
| `metlife-stadium` | MetLife Stadium | 1 MetLife Stadium Dr | East Rutherford | NJ | 07073 | US |
| `gillette-stadium` | Gillette Stadium | 1 Patriot Pl | Foxborough | MA | 02035 | US |
| `lincoln-financial-field` | Lincoln Financial Field | 1 Lincoln Financial Field Way | Philadelphia | PA | 19148 | US |
| `hard-rock-stadium` | Hard Rock Stadium | 347 Don Shula Dr | Miami Gardens | FL | 33056 | US |
| `nrg-stadium` | NRG Stadium | 1 NRG Pkwy | Houston | TX | 77054 | US |
| `arrowhead-stadium` | Arrowhead Stadium | 1 Arrowhead Dr | Kansas City | MO | 64129 | US |
| `att-stadium` | AT&T Stadium | 1 AT&T Way | Arlington | TX | 76011 | US |

---

## 4. Recommended GSC Action Sequence for Claude Desktop

Once the pull request is merged to `main` and Vercel finishes the production deployment:

### Step 1: Trigger GSC Structured Data Re-validation
1. Log into Google Search Console for `https://www.worldcupmatchday.com`.
2. Navigate to **Enhancements** → **Event** (or **SportsEvent**).
3. Open the issue report detailing the previous warnings/errors.
4. Click **Validate Fix**.

### Step 2: Request High-Priority URL Re-Indexing
Perform URL Inspection and click **Request Indexing** for the following key pages:
1. `https://www.worldcupmatchday.com/` (WebSite schema & Vault Hero)
2. `https://www.worldcupmatchday.com/world-cup-2026` (Vault Hub & CollectionPage schema)
3. `https://www.worldcupmatchday.com/stats` (Direct-answer summary & Statistics title)
4. `https://www.worldcupmatchday.com/schedule/eastern-time` (ET Schedule title & internal links)
5. `https://www.worldcupmatchday.com/matches/match-104` (Final SportsEvent schema & OG image)
6. `https://www.worldcupmatchday.com/matches/match-103` (Third-place SportsEvent schema & OG image)

### Step 3: Verify Rich Results Test
Use Google's [Rich Results Test](https://search.google.com/test/rich-results) on `https://www.worldcupmatchday.com/matches/match-104` to verify zero errors and green checkmarks for `SportsEvent`.
