import type { Metadata } from "next";
import { ScheduleContent } from "./ScheduleContent";

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

export default function SchedulePage() {
  return <ScheduleContent />;
}
