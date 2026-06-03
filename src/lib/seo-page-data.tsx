import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/seo-landing-page";
import { getMatchesWithTeams, getPlayersWithStats, getTeams } from "@/lib/football";
import { footballProvider } from "@/lib/providers";
import { seoLandingPages, type SeoLandingSlug } from "@/lib/seo-content";
import { absoluteUrl } from "@/lib/site";

export function getSeoLandingConfig(slug: SeoLandingSlug) {
  const config = seoLandingPages.find((page) => page.slug === slug);
  if (!config) {
    throw new Error(`Missing SEO landing config for ${slug}`);
  }
  return config;
}

export function getSeoLandingMetadata(slug: SeoLandingSlug): Metadata {
  const config = getSeoLandingConfig(slug);
  return {
    title: config.title,
    description: config.description,
    alternates: {
      canonical: absoluteUrl(`/${slug}`)
    },
    openGraph: {
      title: config.title,
      description: config.description,
      url: absoluteUrl(`/${slug}`)
    }
  };
}

export async function SeoLandingRoute({ slug }: { slug: SeoLandingSlug }) {
  const [matches, teams, standings, players, meta] = await Promise.all([
    getMatchesWithTeams(),
    getTeams(),
    footballProvider.getStandings(),
    getPlayersWithStats(),
    footballProvider.getMeta()
  ]);

  return <SeoLandingPage config={getSeoLandingConfig(slug)} matches={matches} teams={teams} standings={standings} players={players} meta={meta} />;
}
