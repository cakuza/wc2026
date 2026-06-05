import type { MetadataRoute } from "next";
import { getMatchesWithTeams, getTeams } from "@/lib/football";
import { matchSlug } from "@/lib/matches";
import { localTimePages } from "@/lib/local-time-pages";
import { requestedTeamScheduleSlugs, seoLandingPages } from "@/lib/seo-content";
import { getSiteUrl } from "@/lib/site";
import { GROUPS } from "@/lib/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const teams = await getTeams();
  const matches = await getMatchesWithTeams();
  const baseUrl = getSiteUrl();
  const staticRoutes = ["", "/matches", "/standings", "/stats", "/leaderboards", "/teams", "/groups", "/world-cup-2026-format", "/world-cup-2026-tiebreakers", "/cards", "/launch-checklist", "/operations"];

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date()
    })),
    ...GROUPS.map((group) => ({
      url: `${baseUrl}/groups/${group.toLowerCase()}`,
      lastModified: new Date()
    })),
    ...seoLandingPages.map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: new Date()
    })),
    ...localTimePages.map((page) => ({
      url: `${baseUrl}/local-time/${page.slug}`,
      lastModified: new Date()
    })),
    ...teams.map((team) => ({
      url: `${baseUrl}/teams/${team.slug}`,
      lastModified: new Date()
    })),
    ...teams.map((team) => ({
      url: `${baseUrl}/teams/${team.slug}-world-cup-schedule`,
      lastModified: new Date()
    })),
    ...matches.map((match) => ({
      url: `${baseUrl}/matches/${matchSlug(match)}`,
      lastModified: new Date()
    })),
    ...requestedTeamScheduleSlugs.map((slug) => ({
      url: `${baseUrl}/teams/${slug}`,
      lastModified: new Date()
    }))
  ];
}
