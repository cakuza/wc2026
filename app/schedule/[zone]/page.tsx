import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TimezoneSchedulePageContent } from "@/components/TimezoneSchedulePageContent";
import { TIMEZONE_SLUGS, timezoneBySlug } from "@/lib/timezones";
import { MATCHES, ARCHIVE_DEFAULT_DATE } from "@/lib/matches";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { buildKnockoutResolution } from "@/lib/knockoutResolution";
import { getArchiveState } from "@/lib/archiveLifecycle";

const BASE_URL = "https://www.worldcupmatchday.com";

export const dynamicParams = false;
export const revalidate = 60;

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
  const snapshot = await getTournamentLiveSnapshot();
  const evalNow = new Date(ARCHIVE_DEFAULT_DATE);
  const resolvedParticipants = buildKnockoutResolution(snapshot.matches);

  const archiveState = getArchiveState({
    matches: MATCHES,
    liveData: snapshot.liveDataByProviderId,
    resolvedParticipants,
    now: evalNow,
  });

  // FAQ structured data is kept in English for SEO (independent of the visible, localized FAQ).
  const faqs = [
    {
      q: "What time zone is this schedule shown in?",
      a: `Every kickoff on this page is shown in ${z.zoneNote}.`,
    },
    {
      q: "Are all completed tournament results archived here?",
      a: `Yes — all 104 completed matches, scores, scorers and knockout results are archived with kickoff times converted to ${z.zoneNote}.`,
    },
    {
      q: "Are there any remaining fixtures?",
      a: "No — the 2026 World Cup has concluded. All 104 matches from the opening game on 11 June through to the Final on 19 July are final.",
    },
    {
      q: "Where can I view match statistics and reports?",
      a: "Click on any completed match to view full match details, goal scorers, cards, lineups and statistics.",
    },
    {
      q: "Is WorldCupMatchDay affiliated with FIFA?",
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
      <TimezoneSchedulePageContent
        zone={z}
        fixtureCount={fixtureCount}
        matchesProjection={snapshot.matches}
        resolvedParticipants={resolvedParticipants}
        isTournamentComplete={archiveState.isComplete}
      />
    </>
  );
}
