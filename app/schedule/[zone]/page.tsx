import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TimezoneSchedulePageContent } from "@/components/TimezoneSchedulePageContent";
import { TIMEZONE_SLUGS, timezoneBySlug } from "@/lib/timezones";
import { MATCHES } from "@/lib/matches";

const BASE_URL = "https://www.worldcupmatchday.com";

export const dynamicParams = false;

export function generateStaticParams() {
  return TIMEZONE_SLUGS.map((zone) => ({ zone }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ zone: string }>;
}): Promise<Metadata> {
  const { zone } = await params;
  const z = timezoneBySlug(zone);
  if (!z) return {};
  return {
    title: z.title,
    description: z.description,
    alternates: { canonical: `${BASE_URL}/schedule/${z.slug}` },
    openGraph: {
      title: z.title,
      description: z.description,
      url: `${BASE_URL}/schedule/${z.slug}`,
      type: "website",
    },
  };
}

export default async function TimezoneSchedulePage({
  params,
}: {
  params: Promise<{ zone: string }>;
}) {
  const { zone } = await params;
  const z = timezoneBySlug(zone);
  if (!z) notFound();

  const fixtureCount = MATCHES.length;

  // FAQ structured data is kept in English for SEO (independent of the visible, localized FAQ).
  const faqs = [
    {
      q: "What time zone is this schedule shown in?",
      a: `Every kickoff on this page is shown in ${z.zoneNote}.`,
    },
    {
      q: "When does the 2026 World Cup start?",
      a: "The tournament begins on 11 June 2026 with Mexico vs South Africa at Estadio Azteca.",
    },
    {
      q: "Are knockout matches included?",
      a: "Not yet — this page lists the group-stage fixtures. Knockout matchups are confirmed once the group stage finishes and will be added then.",
    },
    {
      q: "Where can I see today's matches?",
      a: "The today page shows the current day's fixtures (or the next upcoming matchday) with kickoff times and venues.",
    },
    {
      q: "Is this an official FIFA site?",
      a: "No. WorldCupMatchDay is an independent, fan-made resource and is not affiliated with FIFA.",
    },
  ];

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <TimezoneSchedulePageContent zone={z} fixtureCount={fixtureCount} />
    </>
  );
}
