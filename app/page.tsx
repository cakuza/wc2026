import type { Metadata } from "next";
import Link from "next/link";
import { Ticker } from "@/components/Ticker";
import { Hero } from "@/components/Hero";
import { HomeTrivia } from "@/components/HomeTrivia";
import { TeamsByConfederationPreview } from "@/components/TeamsByConfederation";
import { ARCHIVE_DEFAULT_DATE, matchUtcDate, MATCHES } from "@/lib/matches";
import { getDisplayMatchdayForTimeZone } from "@/lib/todaySelection";
import { DEFAULT_TIMEZONE } from "@/lib/timezone";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { selectHomepageTickerMatches, getHomepageMatchCenterSnapshot, getTournamentPhase } from "@/lib/matchCenterSelection";
import { LiveDataUnavailableNotice } from "@/components/LiveDataUnavailableNotice";
import { buildKnockoutResolution } from "@/lib/knockoutResolution";
import { getArchiveState } from "@/lib/archiveLifecycle";

const BASE_URL = "https://www.worldcupmatchday.com";

export async function generateMetadata(): Promise<Metadata> {
  const snapshot = await getTournamentLiveSnapshot();
  const resolvedParticipants = buildKnockoutResolution(snapshot.matches);
  const archive = getArchiveState({ matches: MATCHES, liveData: snapshot.liveDataByProviderId, resolvedParticipants, now: new Date(ARCHIVE_DEFAULT_DATE) });

  const title = archive.isComplete
    ? `WorldCupMatchDay — ${archive.champion} Win the 2026 World Cup`
    : "WorldCupMatchDay — World Cup 2026 Scores, Schedule & Matchday Guide";
  const description = archive.isComplete
    ? `${archive.champion} won the 2026 FIFA World Cup, beating ${archive.runnerUp} ${archive.finalResult?.homeScore}-${archive.finalResult?.awayScore} in the Final. Full results, bracket, stats and teams archive.`
    : "Follow World Cup 2026 matchdays with scores, fixtures, kickoff times, groups, standings, stats and qualification paths.";

  return {
    title,
    description,
    alternates: { canonical: BASE_URL },
    openGraph: { title, description, url: BASE_URL, type: "website" },
  };
}

// Static-first containment mode: no runtime cookies() call, no force-dynamic.
// The page is now ISR with a long revalidation window. The client-side
// TimezoneProvider handles timezone selection after hydration at zero cost.
export const revalidate = 3600; // revalidate at most once per hour

export default async function TodayPage() {
  // Static fallback: serve the default timezone. The TimezoneProvider client
  // component reads the user's real timezone after hydration (no server cost).
  const selectedTimeZone = DEFAULT_TIMEZONE;
  const now = new Date(ARCHIVE_DEFAULT_DATE);
  const snapshot = await getTournamentLiveSnapshot();
  const resolvedParticipants = buildKnockoutResolution(snapshot.matches);
  const archiveState = getArchiveState({ matches: MATCHES, liveData: snapshot.liveDataByProviderId, resolvedParticipants, now });

  const tickerMatches = selectHomepageTickerMatches({
    matches: MATCHES,
    liveData: snapshot.liveDataByProviderId,
    now,
    resolvedParticipants,
  });

  const initialMatchday = getDisplayMatchdayForTimeZone({
    now,
    timeZone: selectedTimeZone,
    resolvedParticipants,
    liveDataByProviderId: snapshot.liveDataByProviderId,
  });

  const tournamentPhase = getTournamentPhase({
    matches: MATCHES,
    liveData: snapshot.liveDataByProviderId,
    now,
  });
  const homepageMatches = getHomepageMatchCenterSnapshot({
    matches: MATCHES,
    liveData: snapshot.liveDataByProviderId,
    now,
    phase: tournamentPhase,
  });
  const countdownTarget = homepageMatches.upcomingCurrentRound[0]
    ? matchUtcDate(homepageMatches.upcomingCurrentRound[0]).toISOString()
    : null;

  return (
    <>
      <Ticker items={tickerMatches} resolvedParticipants={resolvedParticipants} />
      {snapshot.isFallback ? (
        <div className="mx-auto max-w-7xl px-4 pt-6">
          <LiveDataUnavailableNotice show />
        </div>
      ) : null}
      <Hero initialMatchday={initialMatchday} snapshot={snapshot} resolvedParticipants={resolvedParticipants} tournamentPhase={tournamentPhase} countdownTarget={countdownTarget} archiveState={archiveState} />
      {archiveState.isComplete && (
        <div className="mx-auto max-w-7xl px-4 py-8">
          <h2 className="mb-3 font-heading text-lg font-bold uppercase tracking-wide text-white">Explore the 2026 Archive</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { href: "/world-cup-2026/results", label: "Full Results" },
              { href: "/bracket", label: "Bracket" },
              { href: "/stats", label: "Statistics" },
              { href: "/teams", label: "Teams" },
              { href: "/groups", label: "Groups" },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="rounded-lg border border-white/10 bg-navyCard px-4 py-3 text-center font-heading text-xs font-bold uppercase tracking-wide text-white/70 transition hover:border-white/25 hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
      <HomeTrivia />
      <TeamsByConfederationPreview />
    </>
  );
}
