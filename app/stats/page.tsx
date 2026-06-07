import type { Metadata } from "next";
import StatsContent from "@/components/StatsContent";

export const metadata: Metadata = {
  title: "World Cup 2026 Stats - Records & Tournament Board",
  description:
    "World Cup all-time records plus a tournament-ready stat board for goals, assists, cards and clean sheets once the 2026 matches begin.",
  alternates: { canonical: "https://worldcupmatchday.vercel.app/stats" },
  openGraph: {
    title: "World Cup 2026 Stats - Records & Tournament Board",
    description: "All-time World Cup records and a matchday-ready 2026 tournament stat board.",
    url: "https://worldcupmatchday.vercel.app/stats",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "FIFA World Cup 2026 Statistics",
  description:
    "All-time World Cup records and a tournament stat board for FIFA World Cup 2026.",
  url: "https://worldcupmatchday.vercel.app/stats",
  about: {
    "@type": "SportsEvent",
    name: "FIFA World Cup 2026",
    startDate: "2026-06-11",
    endDate: "2026-07-19",
  },
};

export default function StatsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StatsContent />
    </>
  );
}
