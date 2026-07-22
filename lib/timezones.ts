// Time-zone schedule landing pages. Each entry drives a /schedule/<slug> page that renders the
// canonical MATCHES in the given IANA timezone. No fixture data is hardcoded here.

export type TimezoneConfig = {
  slug: string;
  /** Short label used in H1 / titles, e.g. "Turkey Time". */
  label: string;
  /** IANA timezone passed to Intl.DateTimeFormat. */
  iana: string;
  /** Human note about the zone, e.g. "UTC+3 · Europe/Istanbul". */
  zoneNote: string;
  /** One short, factual local-context sentence. */
  context: string;
  title: string;
  description: string;
};

export const TIMEZONES: TimezoneConfig[] = [
  {
    slug: "turkey-time",
    label: "Turkey Time",
    iana: "Europe/Istanbul",
    zoneNote: "Turkey Time · UTC+3 · Europe/Istanbul",
    context: "Turkey finished in Group D with the United States, Paraguay and Australia.",
    title: "World Cup 2026 Results in Turkey Time",
    description:
      "Complete 2026 World Cup results archive in Turkey Time, with all 104 scores, localized kickoff dates, venues and match reports.",
  },
  {
    slug: "uk-time",
    label: "UK Time",
    iana: "Europe/London",
    zoneNote: "UK Time · BST during the tournament · Europe/London",
    context: "England and Scotland fixtures are included in this schedule.",
    title: "World Cup 2026 Results in UK Time",
    description:
      "Complete 2026 World Cup results archive in UK Time, with all 104 scores, localized kickoff dates, venues and match reports.",
  },
  {
    slug: "eastern-time",
    label: "Eastern Time",
    iana: "America/New_York",
    zoneNote: "Eastern Time (EDT, UTC−4) · America/New_York",
    context: "ET is shown for fans following the tournament from the US East Coast and other Eastern Time locations.",
    title: "World Cup 2026 Results in Eastern Time — Complete ET Schedule",
    description:
      "View all 104 completed 2026 World Cup matches in Eastern Time, with final scores and kickoff times converted to ET.",
  },
  {
    slug: "india-time",
    label: "India Time",
    iana: "Asia/Kolkata",
    zoneNote: "India Standard Time · IST · Asia/Kolkata",
    context: "This page helps fans in India browse every completed match in India Standard Time.",
    title: "World Cup 2026 Results in India Time",
    description:
      "Complete 2026 World Cup results archive in India Time (IST), with all 104 scores, localized kickoff dates, venues and match reports.",
  },
  {
    slug: "japan-time",
    label: "Japan Time",
    iana: "Asia/Tokyo",
    zoneNote: "Japan Standard Time · JST · Asia/Tokyo",
    context: "Japan finished in Group F with the Netherlands, Sweden and Tunisia.",
    title: "World Cup 2026 Results in Japan Time",
    description:
      "Complete 2026 World Cup results archive in Japan Time (JST), with all 104 scores, localized kickoff dates, venues and match reports.",
  },
  {
    slug: "brazil-time",
    label: "Brazil Time",
    iana: "America/Sao_Paulo",
    zoneNote: "Brasília Time · BRT · America/Sao_Paulo",
    context: "Brazil finished in Group C with Morocco, Haiti and Scotland.",
    title: "World Cup 2026 Results in Brazil Time",
    description:
      "Complete 2026 World Cup results archive in Brazil Time (BRT), with all 104 scores, localized kickoff dates, venues and match reports.",
  },
  {
    slug: "australia-time",
    label: "Australia Time",
    iana: "Australia/Sydney",
    zoneNote: "Sydney Time · AEST · Australia/Sydney",
    context: "Australia finished in Group D with the United States, Paraguay and Turkey.",
    title: "World Cup 2026 Results in Australia Time",
    description:
      "Complete 2026 World Cup results archive in Australia Time (AEST), with all 104 scores, localized kickoff dates, venues and match reports.",
  },
];

export const TIMEZONE_SLUGS = TIMEZONES.map((z) => z.slug);

export function timezoneBySlug(slug: string): TimezoneConfig | undefined {
  return TIMEZONES.find((z) => z.slug === slug);
}
