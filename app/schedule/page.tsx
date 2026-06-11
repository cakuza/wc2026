import type { Metadata } from "next";
import { ScheduleContent } from "./ScheduleContent";
import { fetchAllLiveData } from "@/lib/fetchAllLiveData";
import type { LiveMatchStatus } from "@/lib/liveMatchData";

export const revalidate = 60;

const BASE_URL = "https://www.worldcupmatchday.com";

export const metadata: Metadata = {
  title: "World Cup 2026 Schedule — Fixtures, Venues & Local Times",
  description:
    "Check the World Cup 2026 schedule with fixtures, venues, matchdays and kickoff times in your selected timezone.",
  alternates: { canonical: `${BASE_URL}/schedule` },
  openGraph: {
    title: "World Cup 2026 Schedule — Fixtures, Venues & Local Times",
    description:
      "Check the World Cup 2026 schedule with fixtures, venues, matchdays and kickoff times in your selected timezone.",
    url: `${BASE_URL}/schedule`,
    type: "website",
  },
};

export type ScheduleMatchScore = {
  status: LiveMatchStatus;
  homeScore: number | null;
  awayScore: number | null;
};

export default async function SchedulePage() {
  const liveData = await fetchAllLiveData();
  const liveScores: Record<number, ScheduleMatchScore> = {};
  for (const [id, data] of liveData) {
    liveScores[id] = { status: data.status, homeScore: data.homeScore, awayScore: data.awayScore };
  }
  return <ScheduleContent liveScores={liveScores} />;
}
