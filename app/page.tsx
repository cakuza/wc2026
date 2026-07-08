import type { Metadata } from "next";
import { Ticker } from "@/components/Ticker";
import { Hero } from "@/components/Hero";
import { HomeTrivia } from "@/components/HomeTrivia";
import { TeamsByConfederationPreview } from "@/components/TeamsByConfederation";
import { getTickerMatches } from "@/lib/matches";
import { getDisplayMatchdayForTimeZone } from "@/lib/todaySelection";
import { DEFAULT_TIMEZONE } from "@/lib/timezone";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
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
  const now = new Date();
  const tickerMatches = getTickerMatches(now);
  const initialMatchday = getDisplayMatchdayForTimeZone({ now, timeZone: selectedTimeZone });
  const snapshot = await getTournamentLiveSnapshot();
  const resolvedParticipants = buildKnockoutResolution(snapshot.matches);

  return (
    <>
      <Ticker items={tickerMatches} resolvedParticipants={resolvedParticipants} />
      {snapshot.isFallback ? (
        <div className="mx-auto max-w-7xl px-4 pt-6">
          <LiveDataUnavailableNotice show />
        </div>
      ) : null}
      <Hero initialMatchday={initialMatchday} snapshot={snapshot} resolvedParticipants={resolvedParticipants} />
      <HomeTrivia />
      <TeamsByConfederationPreview />
    </>
  );
}
