const BASE_URL = "https://www.worldcupmatchday.com";

/**
 * Rendered exactly once, on the canonical homepage only (see app/page.tsx).
 * A WebSite node on every route (the prior root-layout placement) is invalid
 * per schema.org guidance — there is one WebSite, not one per page.
 */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    name: "WorldCupMatchDay",
    alternateName: "World Cup Matchday",
    url: `${BASE_URL}/`,
    description:
      "Complete 2026 FIFA World Cup archive with all 104 results, final standings, teams, bracket, statistics and match reports.",
    inLanguage: "en",
  };
}

/**
 * For substantial, original-editorial pages only (explainer guides), never
 * for thin utility/table pages. datePublished/dateModified must come from
 * real git history, never invented — see callers.
 */
export function articleSchema({
  headline,
  description,
  url,
  datePublished,
  dateModified,
}: {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: `${BASE_URL}/og-default.png`,
    author: { "@type": "Organization", name: "WorldCupMatchDay" },
    publisher: { "@type": "Organization", name: "WorldCupMatchDay" },
    datePublished,
    dateModified,
  };
}
