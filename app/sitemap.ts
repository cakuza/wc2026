import type { MetadataRoute } from "next";
import { TEAMS, slugFor, GROUP_LETTERS } from "@/lib/teams";
import { TIMEZONE_SLUGS } from "@/lib/timezones";
import { assertWorldCupData } from "@/lib/dataIntegrity";
import { letterToGroupSlug } from "@/lib/groupSlug";

const BASE = "https://www.worldcupmatchday.com";

// Static-content pages whose meaningful text rarely changes — use a
// stable date so crawlers don't re-fetch them on every snapshot refresh.
const STATIC_DATE = new Date("2026-06-11T00:00:00Z");

// Live-data pages update constantly during the tournament — omit lastModified
// so crawlers aren't misled into thinking content changes on every deploy.

export default function sitemap(): MetadataRoute.Sitemap {
  assertWorldCupData();

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
    { url: `${BASE}/today`,         changeFrequency: "hourly",  priority: 0.9 },
    { url: `${BASE}/groups`,        changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/schedule`,      changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/stats`,         changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE}/stats/top-scorers`, changeFrequency: "daily", priority: 0.85 },
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

    // Cluster pages
    ...groupPages,
    ...timezonePages,
    ...teamPages,
    ...teamQualPages,
  ];
}
