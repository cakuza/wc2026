import type { Metadata } from "next";
import { Suspense } from "react";
import { LiveSnapshotDebug } from "@/components/LiveSnapshotDebug";
import type { GoalScorerEvent } from "@/lib/worldcup26Provider";
import type { MatchCenterLiveSnapshot } from "@/components/MatchCenterContent";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { buildKnockoutResolution } from "@/lib/knockoutResolution";
import { TodayClientWrapper } from "@/components/TodayClientWrapper";
import { ARCHIVE_DEFAULT_DATE, MATCHES } from "@/lib/matches";
import { getTournamentPhase } from "@/lib/matchCenterSelection";
import { getArchiveState } from "@/lib/archiveLifecycle";

const BASE_URL = "https://www.worldcupmatchday.com";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const snapshot = await getTournamentLiveSnapshot();
  const resolvedParticipants = buildKnockoutResolution(snapshot.matches);
  const archive = getArchiveState({ matches: MATCHES, liveData: snapshot.liveDataByProviderId, resolvedParticipants, now: new Date(ARCHIVE_DEFAULT_DATE) });

  const title = archive.isComplete
    ? "2026 World Cup Complete — Final Result & Champion"
    : "World Cup Match Center — Scores, Fixtures & Kickoff Times";
  const description = archive.isComplete
    ? `The 2026 FIFA World Cup is complete. ${archive.champion} beat ${archive.runnerUp} ${archive.finalResult?.homeScore}-${archive.finalResult?.awayScore} in the Final. See the full archive of results, bracket and stats.`
    : "Follow the World Cup Match Center with live scores, upcoming fixtures, latest results, and goal scorers.";

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/today` },
    openGraph: { title, description, url: `${BASE_URL}/today`, type: "website" },
  };
}

const FAQS: { q: string; a: string }[] = [
  {
    q: "What matches are happening in the World Cup?",
    a: "The 2026 World Cup has concluded. The Match Center lists all completed match results, goal scorers, and brackets.",
  },
  {
    q: "What time did the World Cup matches kick off?",
    a: "Kickoff times are shown in your selected timezone (defaults to your device's timezone, with US Eastern as the fallback, and can be changed using the timezone selector). The tournament's opening match kicked off on 11 June 2026, and the Final concluded on 19 July 2026.",
  },
  {
    q: "Where can I see the full World Cup schedule?",
    a: "The complete fixture list and results are on the schedule page, and the final groups with standings are on the groups page.",
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
  const now = new Date(ARCHIVE_DEFAULT_DATE);
  const tournamentPhase = getTournamentPhase({ matches: MATCHES, liveData, now });
  const archiveState = getArchiveState({ matches: MATCHES, liveData, resolvedParticipants, now });

  return (
    <>
      <LiveSnapshotDebug snapshotId={snapshot.snapshotId} generatedAt={snapshot.generatedAt} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <Suspense fallback={<div className="min-h-screen bg-canvas text-ink flex items-center justify-center font-heading font-bold uppercase tracking-widest text-faint">Preparing the Match Center for your local timezone.</div>}>
        <TodayClientWrapper
          snapshot={matchCenterSnapshot}
          isFallbackSnapshot={isFallbackSnapshot}
          liveDataUnavailableByMatchId={liveDataUnavailableByMatchId}
          tournamentPhase={tournamentPhase}
          archiveState={archiveState}
        />
      </Suspense>

      {/* FAQ */}
      <div className="mx-auto max-w-4xl px-4 pb-8">
        <section className="mt-10">
          <h2 className="mb-3 font-heading text-2xl font-extrabold uppercase tracking-wide text-ink">
            FAQ
          </h2>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <div key={f.q} className="rounded-xl border border-line bg-surface p-4">
                <h3 className="font-heading text-sm font-extrabold uppercase tracking-wide text-ink sm:text-base">
                  {f.q}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
