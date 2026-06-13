import type { Metadata } from "next";
import { Ticker } from "@/components/Ticker";
import { Hero } from "@/components/Hero";
import { HomeTrivia } from "@/components/HomeTrivia";
import { TeamsByConfederationPreview } from "@/components/TeamsByConfederation";
import { OpeningMatchBanner } from "@/components/OpeningMatchBanner";
import { getTickerMatches } from "@/lib/matches";
import { getDisplayMatchdayForTimeZone, resolveSelectedTimeZone } from "@/lib/todaySelection";

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

// ISR: revalidate periodically so date-dependent countdowns/banners (e.g. "opening
// match today" vs "opening match complete") don't stay frozen on stale static HTML.
export const revalidate = 60;

export default async function TodayPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const selectedTimeZone = resolveSelectedTimeZone(params.tz);
  const now = new Date();
  const tickerMatches = getTickerMatches(now);
  const initialMatchday = getDisplayMatchdayForTimeZone({ now, timeZone: selectedTimeZone });

  return (
    <>
      <Ticker items={tickerMatches} />
      <OpeningMatchBanner />
      <Hero initialMatchday={initialMatchday} />
      <HomeTrivia />
      <TeamsByConfederationPreview />
    </>
  );
}
