import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MATCHES, matchSlug, matchBySlug } from "@/lib/matches";
import { MatchDetail } from "@/components/MatchDetail";
import { countryName } from "@/lib/i18n";
import { getCachedLiveData } from "@/lib/liveDataCache";
import { getScorerEventsByInternalMatchId } from "@/lib/worldcup26Provider";

// ISR: revalidate every 30 s so live scores update quickly once data arrives.
export const revalidate = 30;

export function generateStaticParams() {
  return MATCHES.map((m) => ({ matchId: matchSlug(m) }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ matchId: string }>;
}): Promise<Metadata> {
  const { matchId } = await params;
  const match = matchBySlug(matchId);
  if (!match) return {};

  const home = countryName(match.homeKey, "en");
  const away = countryName(match.awayKey, "en");
  const BASE = "https://www.worldcupmatchday.com";

  return {
    title: `${home} vs ${away} — FIFA World Cup 2026`,
    description: `${home} vs ${away} · Group ${match.group} · ${match.date}${match.venue ? ` · ${match.venue}` : ""} · WorldCupMatchDay`,
    alternates: { canonical: `${BASE}/matches/${matchId}` },
    openGraph: {
      title: `${home} vs ${away} — FIFA World Cup 2026`,
      description: `Group ${match.group} · ${match.date} · WorldCupMatchDay`,
      url: `${BASE}/matches/${matchId}`,
      type: "website",
    },
  };
}

function longDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(`${iso}T00:00:00`));
}

export default async function MatchPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const match = matchBySlug(matchId);
  if (!match) notFound();

  const events = null;

  // Bulk fetch shared across all match pages — no per-match API calls during build.
  // Next.js fetch cache deduplicates the HTTP request across 72 static page renders.
  const liveData = await getCachedLiveData();
  let live = match.providerIds?.footballData
    ? (liveData.get(match.providerIds.footballData) ?? null)
    : null;

  // Enrich with worldcup26.ir scorer data when football-data doesn't provide events.
  // Only applied for FINISHED matches — never invent scores or standings from this source.
  // Uses the same shared map as /stats so the two pages never disagree.
  if (live && live.status === "FINISHED" && !live.eventDataAvailable) {
    const scorerMap = await getScorerEventsByInternalMatchId();
    const events = scorerMap.get(matchSlug(match));
    if (events && events.length > 0) {
      const allGoals = events.map((g) => ({
        type: g.type as "GOAL",
        minute: g.minute,
        teamName: g.teamName,
        playerName: g.playerName,
      }));
      live = { ...live, eventDataAvailable: true, goals: allGoals };
    }
  }

  const home = countryName(match.homeKey, "en");
  const away = countryName(match.awayKey, "en");
  const dateStr = longDate(match.date);
  const venueStr = match.venue ?? "venue TBC";
  const timeStr = match.time ? `, kickoff ${match.time} venue local time (${venueStr})` : "";

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
      <MatchDetail match={match} events={events} live={live} />
    </>
  );
}
