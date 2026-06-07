import type { Metadata } from "next";
import { ScheduleContent } from "./ScheduleContent";

const BASE_URL = "https://www.worldcupmatchday.com";

export const metadata: Metadata = {
  title: "World Cup 2026 Schedule — Fixtures, Dates & Kickoff Times",
  description:
    "Full FIFA World Cup 2026 match schedule with dates, kickoff times (shown in your timezone), teams, groups and venues.",
  alternates: { canonical: `${BASE_URL}/schedule` },
  openGraph: {
    title: "World Cup 2026 Schedule — Fixtures, Dates & Kickoff Times",
    description:
      "Full World Cup 2026 match schedule with dates, kickoff times, teams, groups and venues.",
    url: `${BASE_URL}/schedule`,
    type: "website",
  },
};

export default function SchedulePage() {
  return <ScheduleContent />;
}
