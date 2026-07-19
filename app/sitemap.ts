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

// Static-content pages whose meaningful text rarely changes — use a
// stable date so crawlers don't re-fetch them on every snapshot refresh.
const STATIC_DATE = new Date("2026-06-11T00:00:00Z");

// Live-data pages update constantly during the tournament — omit lastModified
// so crawlers aren't misled into thinking content changes on every deploy.

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  assertWorldCupData();

  const snapshot = await getTournamentLiveSnapshot();
  const now = new Date(ARCHIVE_DEFAULT_DATE);

  // Every match gets its own static page (generateStaticParams in
  // app/matches/[matchId]/page.tsx) but none were previously submitted here —
  // see docs/seo/ARCHIVE_SEO_V1_AUDIT.md §6 for why this drove most of the
  // "discovered/crawled — currently not indexed" coverage counts.
  const matchPages: MetadataRoute.Sitemap = MATCHES.map((match) => ({
    url: `${BASE}/matches/${matchSlug(match)}`,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // Only dates whose cumulative snapshot is truthfully resolved get an
  // indexable URL — see lib/archiveLifecycle.ts#isDateFullyResolved.
  const resolvedDates = CANDIDATE_ARCHIVE_DATES.filter((date) =>
    isDateFullyResolved({ date, liveData: snapshot.liveDataByProviderId, now })
  );
  const datePages: MetadataRoute.Sitemap = resolvedDates.map((date) => ({
    url: `${BASE}/world-cup-2026/results/${date}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const timezonePages: MetadataRoute.Sitemap = TIMEZONE_SLUGS.map((slug) => ({
    url: `${BASE}/schedule/${slug}`,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const teamPages: MetadataRoute.Sitemap = TEAMS.map((t) => ({
    url: `${BASE}/teams/${slugFor(t.key)}`,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const teamQualPages: MetadataRoute.Sitemap = ["england", "turkey"].map((key) => ({
    url: `${BASE}/teams/${slugFor(key)}/qualification`,
    changeFrequency: "daily" as const,
    priority: 0.75,
  }));

  const groupPages: MetadataRoute.Sitemap = GROUP_LETTERS.map((g) => ({
    url: `${BASE}/groups/${letterToGroupSlug(g)}`,
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  return [
    // Core live pages — no lastModified (content changes with live data)
    { url: BASE,                    changeFrequency: "hourly",  priority: 1.0 },
    { url: `${BASE}/world-cup-2026`, changeFrequency: "daily",  priority: 0.95 },
    { url: `${BASE}/world-cup-2026/results`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/today`,         changeFrequency: "hourly",  priority: 0.9 },
    { url: `${BASE}/groups`,        changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/schedule`,      changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/stats`,         changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE}/stats/top-scorers`, changeFrequency: "daily", priority: 0.85 },
    { url: `${BASE}/stats/players`, changeFrequency: "daily",   priority: 0.7 },
    { url: `${BASE}/stats/teams`,   changeFrequency: "daily",   priority: 0.7 },
    { url: `${BASE}/stats/compare`, changeFrequency: "daily",   priority: 0.65 },
    { url: `${BASE}/stats/matches`, changeFrequency: "daily",   priority: 0.65 },
    { url: `${BASE}/bracket`,       changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE}/teams`,         changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/world-cup-third-place-qualification`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/qualified-eliminated-teams`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/world-cup-schedule-local-time`, changeFrequency: "daily", priority: 0.75 },
    { url: `${BASE}/matchday-hub`,  changeFrequency: "daily",   priority: 0.7 },

    // Static / evergreen pages — stable date so lastModified is honest
    { url: `${BASE}/faq`,           lastModified: STATIC_DATE, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/world-cup-2026-teams-by-confederation`, lastModified: STATIC_DATE, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/world-cup-2026-prize-money`, lastModified: STATIC_DATE, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/quiz`,          lastModified: STATIC_DATE, changeFrequency: "weekly",  priority: 0.6 },
    { url: `${BASE}/about`,         lastModified: STATIC_DATE, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/contact`,       lastModified: STATIC_DATE, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/privacy`,       lastModified: STATIC_DATE, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/terms`,         lastModified: STATIC_DATE, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/editorial-policy`, lastModified: STATIC_DATE, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/corrections-policy`, lastModified: STATIC_DATE, changeFrequency: "monthly", priority: 0.4 },

    // Cornerstone editorial guides
    { url: `${BASE}/world-cup-2026-format-explained`,           lastModified: STATIC_DATE, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/world-cup-2026-group-tiebreakers`,          lastModified: STATIC_DATE, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/world-cup-2026-knockout-bracket-explained`, lastModified: STATIC_DATE, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/world-cup-2026-data-sources`,               lastModified: STATIC_DATE, changeFrequency: "monthly", priority: 0.5 },

    // Cluster pages
    ...groupPages,
    ...timezonePages,
    ...teamPages,
    ...teamQualPages,
    ...matchPages,
    ...datePages,
  ];
}
