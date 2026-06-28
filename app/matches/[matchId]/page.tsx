import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LiveSnapshotDebug } from "@/components/LiveSnapshotDebug";
import { LiveDataUnavailableNotice } from "@/components/LiveDataUnavailableNotice";
import { MatchDetail } from "@/components/MatchDetail";
import { countryName } from "@/lib/i18n";
import { getGoalEventCompleteness } from "@/lib/goalEventCompleteness";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { matchBySlug } from "@/lib/matches";
import { getResolvedHomeTeam, getResolvedAwayTeam, getParticipantDisplayLabel, isKnockoutMatch } from "@/lib/participant-resolution";

export const revalidate = 30;
export const dynamic = "force-dynamic";

function resolvedTeamName(match: ReturnType<typeof matchBySlug>, side: "home" | "away"): string {
  if (!match) return "TBD";
  if (!isKnockoutMatch(match)) {
    return countryName(side === "home" ? match.homeKey : match.awayKey, "en");
  }
  const resolvedKey = side === "home" ? getResolvedHomeTeam(match) : getResolvedAwayTeam(match);
  if (resolvedKey) return countryName(resolvedKey, "en");
  const slot = side === "home" ? match.homeSlot : match.awaySlot;
  return getParticipantDisplayLabel(slot);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ matchId: string }>;
}): Promise<Metadata> {
  const { matchId } = await params;
  const match = matchBySlug(matchId);
  if (!match) return {};

  const home = resolvedTeamName(match, "home");
  const away = resolvedTeamName(match, "away");
  const BASE = "https://www.worldcupmatchday.com";
  const groupLabel = match.group ? ` - Group ${match.group}` : "";

  return {
    title: `${home} vs ${away} - FIFA World Cup 2026`,
    description: `${home} vs ${away}${groupLabel} - ${match.date}${match.venue ? ` - ${match.venue}` : ""} - WorldCupMatchDay`,
    alternates: { canonical: `${BASE}/matches/${matchId}` },
    openGraph: {
      title: `${home} vs ${away} - FIFA World Cup 2026`,
      description: `${match.group ? `Group ${match.group}` : (isKnockoutMatch(match) ? match.stage : "")} - ${match.date} - WorldCupMatchDay`,
      url: `${BASE}/matches/${matchId}`,
      type: "website",
    },
  };
}

function longDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
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

  const snapshot = await getTournamentLiveSnapshot();
  const snap = snapshot.matches[matchId];
  const events = null;
  const live = snap?.live ?? null;
  const goalEventCompleteness =
    snap?.goalEventCompleteness ??
    getGoalEventCompleteness({ homeScore: null, awayScore: null, goals: undefined, eventDataAvailable: false });

  const home = resolvedTeamName(match, "home");
  const away = resolvedTeamName(match, "away");
  const dateStr = longDate(match.date);
  const venueStr = match.venue ?? "venue TBC";
  const timeStr = match.time ? `, kickoff ${match.time} venue local time (${venueStr})` : "";

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
          text: `Group ${match.group ?? "TBC"} - ${home} vs ${away} at the 2026 FIFA World Cup.`,
        },
      },
    ],
  };

  return (
    <>
      <LiveSnapshotDebug snapshotId={snapshot.snapshotId} generatedAt={snapshot.generatedAt} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      {snapshot.isFallback ? (
        <div className="mx-auto max-w-4xl px-4 pt-6">
          <LiveDataUnavailableNotice show />
        </div>
      ) : null}
      <MatchDetail
        match={match}
        events={events}
        live={live}
        status={snap?.status ?? "SCHEDULED"}
        liveDataUnavailable={snap?.liveDataUnavailable ?? false}
        homeScore={snap?.homeScore ?? null}
        awayScore={snap?.awayScore ?? null}
        scorers={snap?.scorers ?? []}
        goalEventCompleteness={goalEventCompleteness}
        primaryProviderFetchedAt={snapshot.primaryProviderFetchedAt}
        primaryProviderOk={snapshot.primaryProviderOk}
        secondaryProviderFetchedAt={snapshot.secondaryProviderFetchedAt}
        secondaryProviderOk={snapshot.secondaryProviderOk}
        groupStandings={match.group ? snapshot.standingsByGroup[match.group] : undefined}
        thirdPlaceRows={snapshot.thirdPlaceRanking}
      />
    </>
  );
}
