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

export function tournamentSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "@id": `${BASE_URL}/#tournament`,
    name: "FIFA World Cup 2026",
    alternateName: ["WC2026", "World Cup 2026", "FIFA WC 2026"],
    description:
      "The 23rd FIFA World Cup, hosted by the United States, Canada and Mexico, featuring 48 teams and 104 matches.",
    startDate: "2026-06-11",
    endDate: "2026-07-19",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: [
      { "@type": "Country", name: "United States" },
      { "@type": "Country", name: "Canada" },
      { "@type": "Country", name: "Mexico" },
    ],
    organizer: { "@type": "SportsOrganization", name: "FIFA", url: "https://www.fifa.com" },
    sport: "Football",
    url: BASE_URL,
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
