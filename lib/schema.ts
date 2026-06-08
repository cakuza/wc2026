import { countryName } from "./i18n";
import { MATCHES } from "./matches";

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

function englishCountryName(key: string) {
  return countryName(key, "en");
}

export function matchSchemas() {
  return MATCHES.map((m) => {
    const home = englishCountryName(m.homeKey);
    const away = englishCountryName(m.awayKey);

    return {
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      name: `${home} vs ${away} - FIFA World Cup 2026`,
      startDate: m.time ? `${m.date}T${m.time}:00` : `${m.date}T00:00:00`,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: m.venue ? { "@type": "Place", name: m.venue } : undefined,
      competitor: [
        { "@type": "SportsTeam", name: home },
        { "@type": "SportsTeam", name: away },
      ],
      superEvent: { "@id": `${BASE_URL}/#tournament` },
      sport: "Football",
    };
  });
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
