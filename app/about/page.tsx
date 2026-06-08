import type { Metadata } from "next";
import { AboutContent } from "@/components/AboutContent";

const BASE_URL = "https://www.worldcupmatchday.com";

export const metadata: Metadata = {
  title: "About — Independent World Cup 2026 Fan Guide",
  description:
    "WorldCupMatchDay is an independent, fan-made World Cup 2026 matchday guide covering fixtures, groups, teams and kickoff times. Not affiliated with FIFA.",
  alternates: { canonical: `${BASE_URL}/about` },
  openGraph: {
    title: "About — Independent World Cup 2026 Fan Guide",
    description:
      "An independent, fan-made World Cup 2026 matchday guide. Not affiliated with FIFA.",
    url: `${BASE_URL}/about`,
    type: "website",
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
