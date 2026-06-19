import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Ticker } from "@/components/Ticker";
import { Hero } from "@/components/Hero";
import { HomeTrivia } from "@/components/HomeTrivia";
import { TeamsByConfederationPreview } from "@/components/TeamsByConfederation";
import { getTickerMatches } from "@/lib/matches";
import { getDisplayMatchdayForTimeZone, resolveSelectedTimeZone } from "@/lib/todaySelection";
import { TZ_COOKIE } from "@/lib/timezone";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { LiveDataUnavailableNotice } from "@/components/LiveDataUnavailableNotice";

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

// Renders dynamically (cookies() makes this opt out of ISR automatically) so the
// homepage Today card stays in sync with the shared live snapshot — a 60s page
// cache must not hide a 25-30s snapshot refresh.
export const revalidate = 30;
export const dynamic = "force-dynamic";

export default async function TodayPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const cookieTz = (await cookies()).get(TZ_COOKIE)?.value;
  const selectedTimeZone = resolveSelectedTimeZone(params.tz, cookieTz);
  const now = new Date();
  const tickerMatches = getTickerMatches(now);
  const initialMatchday = getDisplayMatchdayForTimeZone({ now, timeZone: selectedTimeZone });
  const snapshot = await getTournamentLiveSnapshot();

  return (
    <>
      <Ticker items={tickerMatches} />
      {snapshot.isFallback ? (
        <div className="mx-auto max-w-7xl px-4 pt-6">
          <LiveDataUnavailableNotice show />
        </div>
      ) : null}
      <Hero initialMatchday={initialMatchday} snapshot={snapshot} />
      <HomeTrivia />
      <TeamsByConfederationPreview />
    </>
  );
}
