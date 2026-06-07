import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MATCHES, matchSlug, matchBySlug } from "@/lib/matches";
import { MatchDetail } from "@/components/MatchDetail";
import { countryName } from "@/lib/i18n";

// ISR: revalidate every 30 s so live scores update quickly once data arrives.
export const revalidate = 30;

export function generateStaticParams() {
  return MATCHES.map((m) => ({ matchId: matchSlug(m) }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: { matchId: string };
}): Promise<Metadata> {
  const match = matchBySlug(params.matchId);
  if (!match) return {};

  const home = countryName(match.homeKey, "en");
  const away = countryName(match.awayKey, "en");
  const BASE = "https://worldcupmatchday.vercel.app";

  return {
    title: `${home} vs ${away} — FIFA World Cup 2026`,
    description: `${home} vs ${away} · Group ${match.group} · ${match.date}${match.venue ? ` · ${match.venue}` : ""} · WorldCupMatchDay`,
    alternates: { canonical: `${BASE}/matches/${params.matchId}` },
    openGraph: {
      title: `${home} vs ${away} — FIFA World Cup 2026`,
      description: `Group ${match.group} · ${match.date} · WorldCupMatchDay`,
      url: `${BASE}/matches/${params.matchId}`,
      type: "website",
    },
  };
}

function longDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(`${iso}T00:00:00`));
}

export default function MatchPage({
  params,
}: {
  params: { matchId: string };
}) {
  const match = matchBySlug(params.matchId);
  if (!match) notFound();

  // events: null until football-data.org match IDs are mapped.
  // Once the tournament starts, call fetchMatchEvents(fdMatchId) here.
  const events = null;

  const home = countryName(match.homeKey, "en");
  const away = countryName(match.awayKey, "en");
  const dateStr = longDate(match.date);
  const timeStr = match.time ? ` at ${match.time} local time` : "";
  const venueStr = match.venue ?? "venue TBC";

  // ── FAQPage JSON-LD ──────────────────────────────────────────────────────
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `When is ${home} vs ${away}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${home} vs ${away} is on ${dateStr}${timeStr}.`,
        },
      },
      {
        "@type": "Question",
        name: `Where is ${home} vs ${away} played?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The match is played at ${venueStr}.`,
        },
      },
      {
        "@type": "Question",
        name: `What group is ${home} vs ${away} in?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Group ${match.group ?? "TBC"} — ${home} vs ${away} at the 2026 FIFA World Cup.`,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <MatchDetail match={match} events={events} />
    </>
  );
}
