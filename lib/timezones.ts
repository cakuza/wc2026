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
    context: "Turkey are in Group D with the United States, Paraguay and Australia.",
    title: "World Cup 2026 Schedule in Turkey Time",
    description:
      "World Cup 2026 group-stage schedule in Turkey Time (UTC+3): every listed fixture with dates, kickoff times, groups and venues.",
  },
  {
    slug: "uk-time",
    label: "UK Time",
    iana: "Europe/London",
    zoneNote: "UK Time · BST during the tournament · Europe/London",
    context: "England and Scotland fixtures are included in this schedule.",
    title: "World Cup 2026 Schedule in UK Time",
    description:
      "World Cup 2026 group-stage schedule in UK Time (BST): every listed fixture with dates, kickoff times, groups and venues.",
  },
  {
    slug: "eastern-time",
    label: "Eastern Time",
    iana: "America/New_York",
    zoneNote: "Eastern Time (EDT, UTC−4) · America/New_York",
    context: "ET is shown for fans following the tournament from the US East Coast and other Eastern Time locations. The United States (Group D) play their group-stage matches across multiple US venues.",
    title: "World Cup 2026 Schedule in Eastern Time (ET)",
    description:
      "See World Cup 2026 fixtures converted to Eastern Time (EDT, UTC−4), with kickoff times, matchdays, venues and group-stage context.",
  },
  {
    slug: "india-time",
    label: "India Time",
    iana: "Asia/Kolkata",
    zoneNote: "India Standard Time · IST · Asia/Kolkata",
    context: "This page helps fans in India follow every listed match in India Standard Time.",
    title: "World Cup 2026 Schedule in India Time (IST)",
    description:
      "World Cup 2026 group-stage schedule in India Standard Time (IST): every listed fixture with dates, kickoff times, groups and venues.",
  },
  {
    slug: "japan-time",
    label: "Japan Time",
    iana: "Asia/Tokyo",
    zoneNote: "Japan Standard Time · JST · Asia/Tokyo",
    context: "Japan are in Group F with the Netherlands, Sweden and Tunisia.",
    title: "World Cup 2026 Schedule in Japan Time (JST)",
    description:
      "World Cup 2026 group-stage schedule in Japan Standard Time (JST): every listed fixture with dates, kickoff times, groups and venues.",
  },
  {
    slug: "brazil-time",
    label: "Brazil Time",
    iana: "America/Sao_Paulo",
    zoneNote: "Brasília Time · BRT · America/Sao_Paulo",
    context: "Brazil are in Group C with Morocco, Haiti and Scotland.",
    title: "World Cup 2026 Schedule in Brazil Time (BRT)",
    description:
      "World Cup 2026 group-stage schedule in Brasília Time (BRT): every listed fixture with dates, kickoff times, groups and venues.",
  },
  {
    slug: "australia-time",
    label: "Australia Time",
    iana: "Australia/Sydney",
    zoneNote: "Sydney Time · AEST · Australia/Sydney",
    context: "Australia are in Group D with the United States, Paraguay and Turkey.",
    title: "World Cup 2026 Schedule in Australia Time (AEST)",
    description:
      "World Cup 2026 group-stage schedule in Sydney Time (AEST): every listed fixture with dates, kickoff times, groups and venues.",
  },
];

export const TIMEZONE_SLUGS = TIMEZONES.map((z) => z.slug);

export function timezoneBySlug(slug: string): TimezoneConfig | undefined {
  return TIMEZONES.find((z) => z.slug === slug);
}
