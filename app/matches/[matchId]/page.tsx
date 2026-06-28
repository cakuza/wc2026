import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LiveSnapshotDebug } from "@/components/LiveSnapshotDebug";
import { LiveDataUnavailableNotice } from "@/components/LiveDataUnavailableNotice";
import { MatchDetail } from "@/components/MatchDetail";
import { countryName } from "@/lib/i18n";
import { getGoalEventCompleteness } from "@/lib/goalEventCompleteness";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { matchBySlug } from "@/lib/matches";
import { getResolvedHomeTeam, getResolvedAwayTeam, isKnockoutMatch, knockoutSlotLabel } from "@/lib/participant-resolution";

export const revalidate = 30;
export const dynamic = "force-dynamic";

// Stage labels for QF/SF/3P/F — used when participants are not yet resolved
const STAGE_LABELS: Record<string, string> = {
  QF: "Quarter-final",
  SF: "Semi-final",
  "3P": "Third-place Match",
  F: "Final",
};

// Stage-aware placeholders — when a slot resolves to one of these the match
// should use a match-level title rather than the "X vs Y" pattern.
const STAGE_PLACEHOLDERS = new Set([
  "Round of 16 winner",
  "Quarter-final winner",
  "Semi-final winner",
  "Semi-final runner-up",
]);

function resolvedTeamName(match: ReturnType<typeof matchBySlug>, side: "home" | "away"): string {
  if (!match) return "TBD";
  if (!isKnockoutMatch(match)) {
    return countryName(side === "home" ? match.homeKey : match.awayKey, "en");
  }
  const resolvedKey = side === "home" ? getResolvedHomeTeam(match) : getResolvedAwayTeam(match);
  if (resolvedKey) return countryName(resolvedKey, "en");
  const slot = side === "home" ? match.homeSlot : match.awaySlot;
  return knockoutSlotLabel(slot);
}

/**
 * Returns the best public display title for a match:
 * - Resolved / R16 with known R32 sources: "Germany/Paraguay Winner vs France/Sweden Winner"
 * - QF/SF/3P/F with stage placeholders: "World Cup 2026 Quarter-final"
 * - Group and R32 (resolved): "South Africa vs Canada"
 */
function matchDisplayTitle(match: NonNullable<ReturnType<typeof matchBySlug>>): string {
  const home = resolvedTeamName(match, "home");
  const stageLabel = isKnockoutMatch(match) ? STAGE_LABELS[match.stage] : undefined;
  if (stageLabel && STAGE_PLACEHOLDERS.has(home)) {
    return `World Cup 2026 ${stageLabel}`;
  }
  return `${home} vs ${resolvedTeamName(match, "away")}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ matchId: string }>;
}): Promise<Metadata> {
  const { matchId } = await params;
  const match = matchBySlug(matchId);
  if (!match) return {};

  const titleDisplay = matchDisplayTitle(match);
  const BASE = "https://www.worldcupmatchday.com";
  const groupLabel = match.group ? ` - Group ${match.group}` : "";
  const stageDesc = isKnockoutMatch(match) && match.stage in STAGE_LABELS
    ? ` - ${STAGE_LABELS[match.stage]}`
    : groupLabel;

  return {
    title: `${titleDisplay} - FIFA World Cup 2026`,
    description: `${titleDisplay}${stageDesc} - ${match.date}${match.venue ? ` - ${match.venue}` : ""} - WorldCupMatchDay`,
    alternates: { canonical: `${BASE}/matches/${matchId}` },
    openGraph: {
      title: `${titleDisplay} - FIFA World Cup 2026`,
      description: `${match.group ? `Group ${match.group}` : (isKnockoutMatch(match) ? (STAGE_LABELS[match.stage] ?? match.stage) : "")} - ${match.date} - WorldCupMatchDay`,
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

  const titleDisplay = matchDisplayTitle(match);
  const home = resolvedTeamName(match, "home");
  const away = resolvedTeamName(match, "away");
  const dateStr = longDate(match.date);
  const venueStr = match.venue ?? "venue TBC";
  const timeStr = match.time ? `, kickoff ${match.time} venue local time (${venueStr})` : "";

  // FAQ phrasing: use stage-aware subject for deep-round unresolved matches
  const isStageTitle = titleDisplay.startsWith("World Cup 2026 ");
  const matchRef = isStageTitle ? titleDisplay : `${home} vs ${away}`;

  const stageLabel = isKnockoutMatch(match) ? STAGE_LABELS[match.stage] : undefined;
  const groupOrStage = match.group
    ? `Group ${match.group}`
    : stageLabel
      ? `2026 World Cup ${stageLabel}`
      : "";

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `When is ${matchRef}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${matchRef} is on ${dateStr}${timeStr}.`,
        },
      },
      {
        "@type": "Question",
        name: `Where is ${matchRef} played?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The match is played at ${venueStr}.`,
        },
      },
      {
        "@type": "Question",
        name: `What group is ${matchRef} in?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${groupOrStage ? `${groupOrStage} - ` : ""}${matchRef} at the 2026 FIFA World Cup.`,
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
