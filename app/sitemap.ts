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

// Truthful closeout dates per section — explicit, category-based dates
const ARCHIVE_CLOSEOUT_DATE = new Date("2026-07-20T00:00:00Z");
const SERVER_PARITY_CLOSEOUT_DATE = new Date("2026-07-21T00:00:00Z");
const SCHEDULE_SEO_CLOSEOUT_DATE = new Date("2026-07-21T00:00:00Z");
const EVERGREEN_GUIDE_DATE = new Date("2026-06-11T00:00:00Z");

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  assertWorldCupData();

  const snapshot = await getTournamentLiveSnapshot();
  const now = new Date(ARCHIVE_DEFAULT_DATE);

  const matchPages: MetadataRoute.Sitemap = MATCHES.map((match) => ({
    url: `${BASE}/matches/${matchSlug(match)}`,
    lastModified: ARCHIVE_CLOSEOUT_DATE,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const resolvedDates = CANDIDATE_ARCHIVE_DATES.filter((date) =>
    isDateFullyResolved({ date, liveData: snapshot.liveDataByProviderId, now })
  );
  const datePages: MetadataRoute.Sitemap = resolvedDates.map((date) => ({
    url: `${BASE}/world-cup-2026/results/${date}`,
    lastModified: ARCHIVE_CLOSEOUT_DATE,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const timezonePages: MetadataRoute.Sitemap = TIMEZONE_SLUGS.map((slug) => ({
    url: `${BASE}/schedule/${slug}`,
    lastModified: SCHEDULE_SEO_CLOSEOUT_DATE,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const teamPages: MetadataRoute.Sitemap = TEAMS.map((t) => ({
    url: `${BASE}/teams/${slugFor(t.key)}`,
    lastModified: ARCHIVE_CLOSEOUT_DATE,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const teamQualPages: MetadataRoute.Sitemap = ["england", "turkey"].map((key) => ({
    url: `${BASE}/teams/${slugFor(key)}/qualification`,
    lastModified: SCHEDULE_SEO_CLOSEOUT_DATE,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const groupPages: MetadataRoute.Sitemap = GROUP_LETTERS.map((g) => ({
    url: `${BASE}/groups/${letterToGroupSlug(g)}`,
    lastModified: ARCHIVE_CLOSEOUT_DATE,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  return [
    // Core archive pages — weekly or monthly frequencies with explicit lastModified
    { url: BASE,                                     lastModified: SCHEDULE_SEO_CLOSEOUT_DATE, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/world-cup-2026`,                  lastModified: ARCHIVE_CLOSEOUT_DATE,    changeFrequency: "weekly",  priority: 0.95 },
    { url: `${BASE}/world-cup-2026/results`,          lastModified: ARCHIVE_CLOSEOUT_DATE,    changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/stats`,                          lastModified: ARCHIVE_CLOSEOUT_DATE,    changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE}/today`,                          lastModified: ARCHIVE_CLOSEOUT_DATE,    changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/groups`,                         lastModified: ARCHIVE_CLOSEOUT_DATE,    changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/schedule`,                       lastModified: SCHEDULE_SEO_CLOSEOUT_DATE, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/stats/top-scorers`,              lastModified: ARCHIVE_CLOSEOUT_DATE,    changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/stats/players`,                  lastModified: ARCHIVE_CLOSEOUT_DATE,    changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/stats/teams`,                    lastModified: ARCHIVE_CLOSEOUT_DATE,    changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/stats/compare`,                  lastModified: ARCHIVE_CLOSEOUT_DATE,    changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE}/stats/matches`,                  lastModified: ARCHIVE_CLOSEOUT_DATE,    changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE}/bracket`,                        lastModified: ARCHIVE_CLOSEOUT_DATE,    changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/teams`,                          lastModified: ARCHIVE_CLOSEOUT_DATE,    changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/world-cup-third-place-qualification`, lastModified: ARCHIVE_CLOSEOUT_DATE, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/qualified-eliminated-teams`,    lastModified: ARCHIVE_CLOSEOUT_DATE,    changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/world-cup-schedule-local-time`, lastModified: SCHEDULE_SEO_CLOSEOUT_DATE, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/matchday-hub`,                   lastModified: ARCHIVE_CLOSEOUT_DATE,    changeFrequency: "monthly", priority: 0.7 },

    // Policy and info pages — actual material edit dates
    { url: `${BASE}/corrections-policy`,             lastModified: SERVER_PARITY_CLOSEOUT_DATE, changeFrequency: "weekly", priority: 0.4 },
    { url: `${BASE}/editorial-policy`,               lastModified: SERVER_PARITY_CLOSEOUT_DATE, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/faq`,                            lastModified: SCHEDULE_SEO_CLOSEOUT_DATE,  changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/about`,                          lastModified: SERVER_PARITY_CLOSEOUT_DATE, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/contact`,                        lastModified: SERVER_PARITY_CLOSEOUT_DATE, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/privacy`,                        lastModified: SERVER_PARITY_CLOSEOUT_DATE, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/terms`,                          lastModified: SERVER_PARITY_CLOSEOUT_DATE, changeFrequency: "monthly", priority: 0.3 },

    // Static / evergreen guides — stable earlier date
    { url: `${BASE}/world-cup-2026-teams-by-confederation`, lastModified: EVERGREEN_GUIDE_DATE, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/world-cup-2026-prize-money`,             lastModified: EVERGREEN_GUIDE_DATE, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/quiz`,                                  lastModified: EVERGREEN_GUIDE_DATE, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/world-cup-2026-format-explained`,           lastModified: EVERGREEN_GUIDE_DATE, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/world-cup-2026-group-tiebreakers`,          lastModified: EVERGREEN_GUIDE_DATE, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/world-cup-2026-knockout-bracket-explained`, lastModified: EVERGREEN_GUIDE_DATE, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/world-cup-2026-data-sources`,               lastModified: SERVER_PARITY_CLOSEOUT_DATE, changeFrequency: "monthly", priority: 0.5 },

    // Cluster pages
    ...groupPages,
    ...timezonePages,
    ...teamPages,
    ...teamQualPages,
    ...matchPages,
    ...datePages,
  ];
}
