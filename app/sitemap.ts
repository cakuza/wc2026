import type { MetadataRoute } from "next";
import { TEAMS, slugFor, GROUP_LETTERS } from "@/lib/teams";
import { TIMEZONE_SLUGS } from "@/lib/timezones";
import { assertWorldCupData } from "@/lib/dataIntegrity";
import { letterToGroupSlug } from "@/lib/groupSlug";
import { MATCHES, matchSlug, ARCHIVE_DEFAULT_DATE } from "@/lib/matches";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { isDateFullyResolved } from "@/lib/archiveLifecycle";
import { CANDIDATE_ARCHIVE_DATES } from "@/lib/archiveDates";

const BASE = "https://www.worldcupmatchday.com";

// Truthful closeout dates per section — explicit, category-based date registry
const SITEMAP_DATES = {
  ARCHIVE_DATA_CLOSEOUT: new Date("2026-07-20T00:00:00Z"),
  SERVER_PARITY_CLOSEOUT: new Date("2026-07-21T00:00:00Z"),
  PR39_SCHEDULE_SEO_CLOSEOUT: new Date("2026-07-21T00:00:00Z"),
  PRIVACY_EFFECTIVE_DATE: new Date("2026-07-19T00:00:00Z"),
  TERMS_EFFECTIVE_DATE: new Date("2026-06-01T00:00:00Z"),
  EVERGREEN_GUIDE_DATE: new Date("2026-06-11T00:00:00Z"),
} as const;

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  assertWorldCupData();

  const snapshot = await getTournamentLiveSnapshot();
  const now = new Date(ARCHIVE_DEFAULT_DATE);

  const matchPages: MetadataRoute.Sitemap = MATCHES.map((match) => ({
    url: `${BASE}/matches/${matchSlug(match)}`,
    lastModified: SITEMAP_DATES.ARCHIVE_DATA_CLOSEOUT,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const resolvedDates = CANDIDATE_ARCHIVE_DATES.filter((date) =>
    isDateFullyResolved({ date, liveData: snapshot.liveDataByProviderId, now })
  );
  const datePages: MetadataRoute.Sitemap = resolvedDates.map((date) => ({
    url: `${BASE}/world-cup-2026/results/${date}`,
    lastModified: SITEMAP_DATES.ARCHIVE_DATA_CLOSEOUT,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const timezonePages: MetadataRoute.Sitemap = TIMEZONE_SLUGS.map((slug) => ({
    url: `${BASE}/schedule/${slug}`,
    lastModified: SITEMAP_DATES.PR39_SCHEDULE_SEO_CLOSEOUT,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const teamPages: MetadataRoute.Sitemap = TEAMS.map((t) => ({
    url: `${BASE}/teams/${slugFor(t.key)}`,
    lastModified: SITEMAP_DATES.ARCHIVE_DATA_CLOSEOUT,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const teamQualPages: MetadataRoute.Sitemap = ["england", "turkey"].map((key) => ({
    url: `${BASE}/teams/${slugFor(key)}/qualification`,
    lastModified: SITEMAP_DATES.PR39_SCHEDULE_SEO_CLOSEOUT,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const groupPages: MetadataRoute.Sitemap = GROUP_LETTERS.map((g) => ({
    url: `${BASE}/groups/${letterToGroupSlug(g)}`,
    lastModified: SITEMAP_DATES.ARCHIVE_DATA_CLOSEOUT,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  return [
    // Core archive pages — weekly or monthly frequencies with explicit lastModified
    { url: BASE,                                     lastModified: SITEMAP_DATES.PR39_SCHEDULE_SEO_CLOSEOUT, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/world-cup-2026`,                  lastModified: SITEMAP_DATES.SERVER_PARITY_CLOSEOUT,     changeFrequency: "weekly",  priority: 0.95 },
    { url: `${BASE}/world-cup-2026/results`,          lastModified: SITEMAP_DATES.ARCHIVE_DATA_CLOSEOUT,     changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/stats`,                          lastModified: SITEMAP_DATES.ARCHIVE_DATA_CLOSEOUT,     changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE}/today`,                          lastModified: SITEMAP_DATES.ARCHIVE_DATA_CLOSEOUT,     changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/groups`,                         lastModified: SITEMAP_DATES.ARCHIVE_DATA_CLOSEOUT,     changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/schedule`,                       lastModified: SITEMAP_DATES.PR39_SCHEDULE_SEO_CLOSEOUT, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/stats/top-scorers`,              lastModified: SITEMAP_DATES.ARCHIVE_DATA_CLOSEOUT,     changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/stats/players`,                  lastModified: SITEMAP_DATES.ARCHIVE_DATA_CLOSEOUT,     changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/stats/teams`,                    lastModified: SITEMAP_DATES.SERVER_PARITY_CLOSEOUT,     changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/stats/compare`,                  lastModified: SITEMAP_DATES.ARCHIVE_DATA_CLOSEOUT,     changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE}/stats/matches`,                  lastModified: SITEMAP_DATES.SERVER_PARITY_CLOSEOUT,     changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE}/bracket`,                        lastModified: SITEMAP_DATES.ARCHIVE_DATA_CLOSEOUT,     changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/teams`,                          lastModified: SITEMAP_DATES.ARCHIVE_DATA_CLOSEOUT,     changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/world-cup-third-place-qualification`, lastModified: SITEMAP_DATES.ARCHIVE_DATA_CLOSEOUT, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/qualified-eliminated-teams`,    lastModified: SITEMAP_DATES.ARCHIVE_DATA_CLOSEOUT,     changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/world-cup-schedule-local-time`, lastModified: SITEMAP_DATES.PR39_SCHEDULE_SEO_CLOSEOUT, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/matchday-hub`,                   lastModified: SITEMAP_DATES.ARCHIVE_DATA_CLOSEOUT,     changeFrequency: "monthly", priority: 0.7 },

    // Policy and info pages — actual material edit dates
    { url: `${BASE}/corrections-policy`,             lastModified: SITEMAP_DATES.SERVER_PARITY_CLOSEOUT, changeFrequency: "weekly",  priority: 0.4 },
    { url: `${BASE}/editorial-policy`,               lastModified: SITEMAP_DATES.SERVER_PARITY_CLOSEOUT, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/faq`,                            lastModified: SITEMAP_DATES.SERVER_PARITY_CLOSEOUT, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/about`,                          lastModified: SITEMAP_DATES.SERVER_PARITY_CLOSEOUT, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/contact`,                        lastModified: SITEMAP_DATES.SERVER_PARITY_CLOSEOUT, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/privacy`,                        lastModified: SITEMAP_DATES.PRIVACY_EFFECTIVE_DATE, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/terms`,                          lastModified: SITEMAP_DATES.TERMS_EFFECTIVE_DATE,   changeFrequency: "monthly", priority: 0.3 },

    // Static / evergreen guides — stable earlier date
    { url: `${BASE}/world-cup-2026-teams-by-confederation`, lastModified: SITEMAP_DATES.EVERGREEN_GUIDE_DATE, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/world-cup-2026-prize-money`,             lastModified: SITEMAP_DATES.EVERGREEN_GUIDE_DATE, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/quiz`,                                  lastModified: SITEMAP_DATES.EVERGREEN_GUIDE_DATE, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/world-cup-2026-format-explained`,           lastModified: SITEMAP_DATES.EVERGREEN_GUIDE_DATE, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/world-cup-2026-group-tiebreakers`,          lastModified: SITEMAP_DATES.EVERGREEN_GUIDE_DATE, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/world-cup-2026-knockout-bracket-explained`, lastModified: SITEMAP_DATES.EVERGREEN_GUIDE_DATE, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/world-cup-2026-data-sources`,               lastModified: SITEMAP_DATES.SERVER_PARITY_CLOSEOUT, changeFrequency: "monthly", priority: 0.5 },

    // Cluster pages
    ...groupPages,
    ...timezonePages,
    ...teamPages,
    ...teamQualPages,
    ...matchPages,
    ...datePages,
  ];
}
