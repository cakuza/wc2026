const BASE_URL = "https://www.worldcupmatchday.com";

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    name: "WorldCupMatchDay",
    url: BASE_URL,
    description:
      "FIFA World Cup 2026 matchday command center: fixtures, group standings, squads and fan context for all 48 teams.",
    inLanguage: ["en", "tr", "de", "fr", "es", "pt", "ar", "ja"],
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/teams?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
