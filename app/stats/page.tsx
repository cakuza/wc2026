import type { Metadata } from "next";
import StatsContent from "@/components/StatsContent";

export const metadata: Metadata = {
  title: "World Cup 2026 Stats — All-Time Records & Tournament Statistics",
  description:
    "World Cup all-time records: most titles, top scorers, fastest goals, most appearances, highest scores, and 2026 live tournament statistics including goals, assists, cards and clean sheets.",
  alternates: { canonical: "https://worldcupmatchday.vercel.app/stats" },
  openGraph: {
    title: "World Cup 2026 Stats — All-Time Records",
    description: "All-time World Cup records and live 2026 tournament statistics.",
    url: "https://worldcupmatchday.vercel.app/stats",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "FIFA World Cup 2026 Statistics",
  description:
    "All-time World Cup records and live FIFA World Cup 2026 tournament statistics.",
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
