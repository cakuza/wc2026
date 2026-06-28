import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TimezoneSchedulePageContent } from "@/components/TimezoneSchedulePageContent";
import { TIMEZONE_SLUGS, timezoneBySlug } from "@/lib/timezones";
import { MATCHES } from "@/lib/matches";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import type { LiveMatchStatus } from "@/lib/liveMatchData";
import type { GoalScorerEvent } from "@/lib/worldcup26Provider";

const BASE_URL = "https://www.worldcupmatchday.com";

export const dynamicParams = false;
export const dynamic = "force-dynamic";
export const revalidate = 30;

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
  const liveScores: Record<number, { status: LiveMatchStatus; homeScore: number | null; awayScore: number | null }> = {};
  for (const [id, data] of Object.entries(snapshot.liveDataByProviderId)) {
    liveScores[Number(id)] = { status: data.status, homeScore: data.homeScore, awayScore: data.awayScore };
  }
  const scorerLines: Record<string, GoalScorerEvent[]> = {};
  for (const [id, entry] of Object.entries(snapshot.matches)) {
    if (entry.scorers.length > 0) scorerLines[id] = entry.scorers;
  }

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
      a: "Yes — this page now shows all 104 tournament fixtures, including the 32 knockout matches from the Round of 32 through to the Final on 19 July.",
    },
    {
      q: "Where can I see today's matches?",
      a: "The today page shows the current day's fixtures (or the next upcoming matchday) with kickoff times and venues.",
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
      <TimezoneSchedulePageContent zone={z} fixtureCount={fixtureCount} liveScores={liveScores} scorerLines={scorerLines} />
    </>
  );
}
