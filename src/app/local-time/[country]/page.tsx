import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FaqBlock, LastUpdatedBlock, SeoIntroBlock } from "@/components/seo-blocks";
import { PageIntro, PageShell } from "@/components/page-shell";
import { RelatedLinks } from "@/components/related-links";
import { SectionCard } from "@/components/section-card";
import { StructuredData } from "@/components/structured-data";
import { getDataMeta, getMatchesWithTeams } from "@/lib/football";
import { getLocalTimePage, localTimePages } from "@/lib/local-time-pages";
import { defaultFaqs } from "@/lib/seo-content";
import { absoluteUrl } from "@/lib/site";
import { formatKickoff } from "@/lib/timezones";

type Props = {
  params: Promise<{ country: string }>;
};

export function generateStaticParams() {
  return localTimePages.map((page) => ({ country: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country } = await params;
  const page = getLocalTimePage(country);
  if (!page) return { title: "Local Time Not Found" };

  return {
    title: `World Cup Time Conversion for ${page.country}`,
    description: `World Cup 2026 match times converted to ${page.label}.`,
    alternates: {
      canonical: absoluteUrl(`/local-time/${page.slug}`)
    },
    openGraph: {
      title: `World Cup Time Conversion for ${page.country}`,
      description: `World Cup fixture times converted to ${page.label}.`,
      url: absoluteUrl(`/local-time/${page.slug}`)
    }
  };
}

export default async function LocalTimePage({ params }: Props) {
  const { country } = await params;
  const page = getLocalTimePage(country);
  if (!page) notFound();

  const [matches, meta] = await Promise.all([
    getMatchesWithTeams(),
    getDataMeta()
  ]);

  return (
    <PageShell>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
            { "@type": "ListItem", position: 2, name: `${page.country} time conversion`, item: absoluteUrl(`/local-time/${page.slug}`) }
          ]
        }}
      />
      <PageIntro
        kicker="Time conversion"
        title={`World Cup time conversion for ${page.country}`}
        copy={`Browse World Cup 2026 fixtures converted to ${page.label}, then open any match or create a fan card.`}
      />
      <div className="grid gap-6">
        <SeoIntroBlock
          kicker={page.label}
          title={`Kick-off conversion ready for ${page.timeZone}`}
          paragraphs={[
            page.intro,
            "Kick-off timestamps are imported, so each fixture below is shown in the selected local timezone."
          ]}
        />
        <LastUpdatedBlock meta={meta} />
        <SectionCard title={`Fixtures for ${page.label}`}>
          <div className="grid gap-3">
            {matches.slice(0, 10).map((match) => (
              <Link key={match.id} href="/matches" className="rounded-md bg-white/[0.04] p-4 transition hover:bg-white/[0.07]">
                <p className="font-black text-white">{match.homeTeam.name} vs {match.awayTeam.name}</p>
                <p className="mt-1 text-sm text-gold">{formatKickoff(match.kickoffUtc, page.timeZone)}</p>
                <p className="mt-1 text-sm text-white/55">{match.venue === "TBD" || match.city === "TBD" ? "Venue unavailable" : `${match.venue}, ${match.city}`}</p>
              </Link>
            ))}
          </div>
        </SectionCard>
        <RelatedLinks
          links={[
            { href: "/world-cup-matches-today", label: "Today's matches" },
            { href: "/matches", label: "Full schedule" },
            { href: "/cards", label: "Create card" },
            { href: "/teams/brazil-world-cup-schedule", label: "Brazil schedule" },
            { href: "/teams/argentina-world-cup-schedule", label: "Argentina schedule" }
          ]}
        />
        <FaqBlock items={defaultFaqs} />
      </div>
    </PageShell>
  );
}
