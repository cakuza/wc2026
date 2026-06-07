import type { Metadata } from "next";
import { MatchdayHubContent } from "@/components/MatchdayHubContent";

const BASE_URL = "https://www.worldcupmatchday.com";

export const metadata: Metadata = {
  title: "Matchday Hub — World Cup 2026 Tools & Schedules",
  description:
    "World Cup 2026 matchday tools: local-time schedules, teams by confederation, third-place qualification and prize money explainers.",
  alternates: { canonical: `${BASE_URL}/matchday-hub` },
  openGraph: {
    title: "Matchday Hub — World Cup 2026 Tools & Schedules",
    description:
      "Local-time schedules, team lists, qualification explainers and prize money for the 2026 World Cup.",
    url: `${BASE_URL}/matchday-hub`,
    type: "website",
  },
};

export default function MatchdayHubPage() {
  return <MatchdayHubContent />;
}
