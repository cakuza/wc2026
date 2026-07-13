import type { Metadata } from "next";
import { Ticker } from "@/components/Ticker";
import { Hero } from "@/components/Hero";
import { HomeTrivia } from "@/components/HomeTrivia";
import { TeamsByConfederationPreview } from "@/components/TeamsByConfederation";
import { ARCHIVE_DEFAULT_DATE, matchUtcDate, MATCHES } from "@/lib/matches";
import { getDisplayMatchdayForTimeZone } from "@/lib/todaySelection";
import { DEFAULT_TIMEZONE } from "@/lib/timezone";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { selectUpcomingMatches, getHomepageMatchCenterSnapshot, getTournamentPhase } from "@/lib/matchCenterSelection";
import { LiveDataUnavailableNotice } from "@/components/LiveDataUnavailableNotice";
import { buildKnockoutResolution } from "@/lib/knockoutResolution";

const BASE_URL = "https://www.worldcupmatchday.com";

export const metadata: Metadata = {
  title: "WorldCupMatchDay — World Cup 2026 Scores, Schedule & Matchday Guide",
  description:
    "Follow World Cup 2026 matchdays with scores, fixtures, kickoff times, groups, standings, stats and qualification paths.",
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: "WorldCupMatchDay — World Cup 2026 Scores, Schedule & Matchday Guide",
    description:
      "Follow World Cup 2026 matchdays with scores, fixtures, kickoff times, groups, standings, stats and qualification paths.",
    url: BASE_URL,
    type: "website",
  },
};

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

  const upcoming = selectUpcomingMatches({
    matches: MATCHES,
    liveData: snapshot.liveDataByProviderId,
    now
  });
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const sevenDaysLater = new Date(todayStart);
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
  const nextSevenDays = upcoming.filter((m) => {
    const d = new Date(m.date);
    return d >= todayStart && d <= sevenDaysLater;
  });
  const tickerMatches = nextSevenDays.length >= 5 ? nextSevenDays : upcoming.slice(0, 10);

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
      <Hero initialMatchday={initialMatchday} snapshot={snapshot} resolvedParticipants={resolvedParticipants} tournamentPhase={tournamentPhase} countdownTarget={countdownTarget} />
      <HomeTrivia />
      <TeamsByConfederationPreview />
    </>
  );
}
