import type { Metadata } from "next";
import { Suspense } from "react";
import { LiveSnapshotDebug } from "@/components/LiveSnapshotDebug";
import type { GoalScorerEvent } from "@/lib/worldcup26Provider";
import type { MatchCenterLiveSnapshot } from "@/components/MatchCenterContent";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { buildKnockoutResolution } from "@/lib/knockoutResolution";
import { TodayContent } from "@/components/TodayContent";
import { TodayClientWrapper } from "@/components/TodayClientWrapper";
import { DEFAULT_TIMEZONE } from "@/lib/timezone";

const BASE_URL = "https://www.worldcupmatchday.com";

// Static-first containment mode: removed force-dynamic and cookies() to allow
// ISR. The page is revalidated hourly at most. Final scores appear on the next
// ISR revalidation; live polling has been removed to eliminate idle CPU cost.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const hasDateParam = false;
  return {
    title: "World Cup Match Center ï¿½ Scores, Fixtures & Kickoff Times",
    description:
      "Follow the World Cup Match Center with live scores, upcoming fixtures, latest results, and goal scorers.",
    // A single canonical /today regardless of ?date=/?tz= avoids duplicate
    // indexable URLs; dated views are explicitly de-indexed.
    alternates: { canonical: `${BASE_URL}/today` },
    robots: hasDateParam ? { index: false, follow: true } : undefined,
    openGraph: {
      title: "World Cup Match Center ï¿½ Scores, Fixtures & Kickoff Times",
      description:
        "Follow the World Cup Match Center with live scores, upcoming fixtures, latest results, and goal scorers.",
      url: `${BASE_URL}/today`,
      type: "website",
    },
  };
}

const FAQS: { q: string; a: string }[] = [
  {
    q: "What matches are happening in the World Cup?",
    a: "When games are scheduled, the Match Center lists upcoming matches with their kickoff times, groups and venues.",
  },
  {
    q: "What time are the World Cup matches?",
    a: "Kickoff times are shown in your selected timezone (defaults to your device's timezone, with US Eastern as the fallback, and can be changed using the timezone selector). The tournament's opening match kicked off at 3:00 PM ET / 1:00 PM Mexico City time on 11 June 2026.",
  },
  {
    q: "Where can I see the full World Cup schedule?",
    a: "The complete fixture list is on the schedule page, and the 12 groups with standings are on the groups page.",
  },
  {
    q: "Is WorldCupMatchDay affiliated with FIFA?",
    a: "No. WorldCupMatchDay is an independent fan resource for following the 2026 World Cup and is not affiliated with FIFA.",
  },
];

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default async function TodayPage() {
  const snapshot = await getTournamentLiveSnapshot();
  const resolvedParticipants = buildKnockoutResolution(snapshot.matches);
  const isFallbackSnapshot = snapshot.isFallback === true;
  const liveData = snapshot.liveDataByProviderId;
  const scorerLines: Record<string, GoalScorerEvent[]> = {};
  for (const [id, entry] of Object.entries(snapshot.matches)) {
    if (entry.scorers.length > 0) scorerLines[id] = entry.scorers;
  }
  const matchCenterSnapshot: MatchCenterLiveSnapshot = {
    snapshotId: snapshot.snapshotId,
    generatedAt: snapshot.generatedAt,
    liveDataByProviderId: liveData,
    scorersByMatchId: scorerLines,
    resolvedParticipants,
    primaryProviderFetchedAt: snapshot.primaryProviderFetchedAt,
    primaryProviderOk: snapshot.primaryProviderOk,
  };
  const liveDataUnavailableByMatchId = Object.fromEntries(
    Object.entries(snapshot.matches).map(([id, entry]) => [id, Boolean(entry.liveDataUnavailable)]),
  );

  return (
    <>
      <LiveSnapshotDebug snapshotId={snapshot.snapshotId} generatedAt={snapshot.generatedAt} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <Suspense fallback={
        <TodayContent
          snapshot={matchCenterSnapshot}
          isFallbackSnapshot={isFallbackSnapshot}
          liveDataUnavailableByMatchId={liveDataUnavailableByMatchId}
          dateParam={undefined}
          selectedTimeZone={DEFAULT_TIMEZONE}
        />
      }>
        <TodayClientWrapper
          snapshot={matchCenterSnapshot}
          isFallbackSnapshot={isFallbackSnapshot}
          liveDataUnavailableByMatchId={liveDataUnavailableByMatchId}
        />
      </Suspense>

      {/* FAQ */}
      <div className="mx-auto max-w-4xl px-4 pb-8">
        <section className="mt-10">
          <h2 className="mb-3 font-heading text-2xl font-extrabold uppercase tracking-wide text-white">
            FAQ
          </h2>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <div key={f.q} className="rounded-xl border border-white/10 bg-navyCard p-4">
                <h3 className="font-heading text-sm font-extrabold uppercase tracking-wide text-white sm:text-base">
                  {f.q}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
