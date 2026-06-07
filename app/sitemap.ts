import type { MetadataRoute } from "next";
import { TEAMS, slugFor } from "@/lib/teams";
import { TIMEZONE_SLUGS } from "@/lib/timezones";
import { assertWorldCupData } from "@/lib/dataIntegrity";

const BASE = "https://www.worldcupmatchday.com";

export default function sitemap(): MetadataRoute.Sitemap {
  // Build-time guard: fails `next build` if team/group/match data is invalid or contains a
  // denylisted team. The sitemap only ever emits the 48 valid team URLs (derived from TEAMS).
  assertWorldCupData();

  const timezonePages: MetadataRoute.Sitemap = TIMEZONE_SLUGS.map((slug) => ({
    url: `${BASE}/schedule/${slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const teamPages: MetadataRoute.Sitemap = TEAMS.map((t) => ({
    url: `${BASE}/teams/${slugFor(t.key)}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8
  }));

  return [
    { url: BASE,                    lastModified: new Date(), changeFrequency: "hourly",  priority: 1.0 },
    { url: `${BASE}/groups`,        lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/today`,         lastModified: new Date(), changeFrequency: "hourly",  priority: 0.9 },
    { url: `${BASE}/schedule`,      lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/world-cup-schedule-local-time`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/bracket`,       lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE}/stats`,         lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE}/teams`,         lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/faq`,           lastModified: new Date(), changeFrequency: "weekly",  priority: 0.6 },
    { url: `${BASE}/world-cup-2026-teams-by-confederation`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/world-cup-third-place-qualification`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/world-cup-2026-prize-money`,             lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/quiz`,          lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/about`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/contact`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/privacy`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/terms`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    ...timezonePages,
    ...teamPages
  ];
}
