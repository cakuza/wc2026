import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LiveSnapshotDebug } from "@/components/LiveSnapshotDebug";
import { LiveDataUnavailableNotice } from "@/components/LiveDataUnavailableNotice";
import { MatchDetail } from "@/components/MatchDetail";
import { countryName } from "@/lib/i18n";
import { getGoalEventCompleteness } from "@/lib/goalEventCompleteness";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { matchBySlug } from "@/lib/matches";
import {
  getResolvedHomeTeam,
  getResolvedAwayTeam,
  isKnockoutMatch,
  knockoutSlotLabel,
} from "@/lib/participant-resolution";

export const revalidate = 30;
export const dynamic = "force-dynamic";

// ── Stage string tables ──────────────────────────────────────────────────────

// HTML <title> segment — appended by root layout template as "%s | WorldCupMatchDay"
// Keep short and non-redundant: the template already adds branding.
const TITLE_SEGMENTS: Record<string, string> = {
  QF: "Quarter-final",
  SF: "Semi-final",
  "3P": "Third-place Match",
  F:   "World Cup Final",
};

// OG/Twitter titles — not auto-templated; include explicit tournament context.
const OG_STAGE_LABELS: Record<string, string> = {
  QF: "Quarter-final – FIFA World Cup 2026",
  SF: "Semi-final – FIFA World Cup 2026",
  "3P": "Third-place Match – FIFA World Cup 2026",
  F:   "FIFA World Cup 2026 Final",
};

// FAQ reference phrases — human-readable with year for Q&A legibility.
const FAQ_STAGE_REFS: Record<string, string> = {
  QF: "World Cup 2026 Quarter-final",
  SF: "World Cup 2026 Semi-final",
  "3P": "World Cup 2026 Third-place Match",
  F:   "World Cup 2026 Final",
};

// Round display names for description text.
const ROUND_DISPLAY: Record<string, string> = {
  R32: "Round of 32",
  R16: "Round of 16",
  QF:  "Quarter-final",
  SF:  "Semi-final",
  "3P": "Third-place Match",
  F:   "Final",
};

// Placeholders produced by knockoutSlotLabel for deep unresolved rounds.
const STAGE_PLACEHOLDERS = new Set([
  "Round of 16 winner",
  "Quarter-final winner",
  "Semi-final winner",
  "Semi-final runner-up",
]);

// ── Participant helpers ──────────────────────────────────────────────────────

type AnyMatch = ReturnType<typeof matchBySlug>;

function resolvedTeamName(match: AnyMatch, side: "home" | "away"): string {
  if (!match) return "TBD";
  if (!isKnockoutMatch(match)) {
    return countryName(side === "home" ? match.homeKey : match.awayKey, "en");
  }
  const key = side === "home" ? getResolvedHomeTeam(match) : getResolvedAwayTeam(match);
  if (key) return countryName(key, "en");
  const slot = side === "home" ? match.homeSlot : match.awaySlot;
  return knockoutSlotLabel(slot);
}

/** Is this a stage-level match where both participants are still generic placeholders? */
function isStageLevel(match: NonNullable<AnyMatch>): boolean {
  return (
    isKnockoutMatch(match) &&
    match.stage in TITLE_SEGMENTS &&
    STAGE_PLACEHOLDERS.has(resolvedTeamName(match, "home"))
  );
}

/**
 * Page-specific title segment — goes through root layout template as:
 *   "%s | WorldCupMatchDay"
 * Must NOT include "| WorldCupMatchDay" or "FIFA World Cup 2026" to avoid
 * doubling.  Stage-level matches use the short stage name only; resolved
 * matches use "Team A vs Team B".
 */
function matchTitleSegment(match: NonNullable<AnyMatch>): string {
  if (isStageLevel(match)) return TITLE_SEGMENTS[match.stage as string] ?? resolvedTeamName(match, "home");
  return `${resolvedTeamName(match, "home")} vs ${resolvedTeamName(match, "away")}`;
}

/**
 * Explicit title for OG/Twitter — NOT templated, so includes full context.
 */
function matchOgTitle(match: NonNullable<AnyMatch>): string {
  if (isStageLevel(match)) {
    return OG_STAGE_LABELS[match.stage as string] ?? `${TITLE_SEGMENTS[match.stage as string]} – FIFA World Cup 2026`;
  }
  return `${resolvedTeamName(match, "home")} vs ${resolvedTeamName(match, "away")} – FIFA World Cup 2026`;
}

/**
 * Reference phrase used in FAQ JSON-LD questions and answers.
 * For deep rounds uses the full "World Cup 2026 Quarter-final" form.
 */
function matchFaqRef(match: NonNullable<AnyMatch>): string {
  if (isStageLevel(match)) return FAQ_STAGE_REFS[match.stage as string] ?? matchTitleSegment(match);
  return `${resolvedTeamName(match, "home")} vs ${resolvedTeamName(match, "away")}`;
}

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ matchId: string }>;
}): Promise<Metadata> {
  const { matchId } = await params;
  const match = matchBySlug(matchId);
  if (!match) return {};

  const titleSeg = matchTitleSegment(match);
  const ogTitle  = matchOgTitle(match);
  const BASE     = "https://www.worldcupmatchday.com";

  const roundLabel = isKnockoutMatch(match)
    ? (ROUND_DISPLAY[match.stage] ?? match.stage)
    : match.group ? `Group ${match.group}` : "";

  const venueStr = match.venue ?? "";
  const desc = [
    ogTitle,
    roundLabel && !isStageLevel(match) ? `${roundLabel} – FIFA World Cup 2026` : "",
    match.date,
    venueStr,
    "WorldCupMatchDay",
  ]
    .filter(Boolean)
    .join(" – ")
    .replace(/ – FIFA World Cup 2026 – FIFA World Cup 2026/g, " – FIFA World Cup 2026");

  return {
    title: titleSeg,          // template: "%s | WorldCupMatchDay" appends branding
    description: desc,
    alternates: { canonical: `${BASE}/matches/${matchId}` },
    openGraph: {
      title: ogTitle,
      description: [roundLabel, match.date, venueStr].filter(Boolean).join(" – "),
      url: `${BASE}/matches/${matchId}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: [roundLabel, match.date, venueStr].filter(Boolean).join(" – "),
    },
  };
}

// ── Page component ────────────────────────────────────────────────────────────

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
  const live = snap?.live ?? null;
  const goalEventCompleteness =
    snap?.goalEventCompleteness ??
    getGoalEventCompleteness({
      homeScore: null,
      awayScore: null,
      goals: undefined,
      eventDataAvailable: false,
    });

  const faqRef  = matchFaqRef(match);
  const dateStr = longDate(match.date);
  const venueStr = match.venue ?? "venue TBC";
  const timeStr = match.time
    ? `, kickoff ${match.time} venue local time (${venueStr})`
    : "";

  const stageLabel = isKnockoutMatch(match) ? ROUND_DISPLAY[match.stage] : undefined;
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
        name: `When is ${faqRef}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${faqRef} is on ${dateStr}${timeStr}.`,
        },
      },
      {
        "@type": "Question",
        name: `Where is ${faqRef} played?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The match is played at ${venueStr}.`,
        },
      },
      {
        "@type": "Question",
        name: `What stage is ${faqRef}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${groupOrStage ? `${groupOrStage} – ` : ""}${faqRef} at the 2026 FIFA World Cup.`,
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
        events={null}
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
