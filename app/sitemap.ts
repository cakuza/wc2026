import type { MetadataRoute } from "next";
import { TEAMS, slugFor } from "@/lib/teams";

const BASE = "https://www.worldcupmatchday.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const teamPages: MetadataRoute.Sitemap = TEAMS.map((t) => ({
    url: `${BASE}/teams/${slugFor(t.key)}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8
  }));

  return [
    { url: BASE,                    lastModified: new Date(), changeFrequency: "hourly",  priority: 1.0 },
    { url: `${BASE}/groups`,        lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/schedule`,      lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/bracket`,       lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE}/stats`,         lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE}/teams`,         lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/quiz`,          lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/about`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/contact`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/privacy`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/terms`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    ...teamPages
  ];
}
