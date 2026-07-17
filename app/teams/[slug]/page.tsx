import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TeamDetail } from "@/components/TeamDetail";
import { LiveDataUnavailableNotice } from "@/components/LiveDataUnavailableNotice";
import { TEAMS, slugFor, teamBySlug, teamsInGroup, withArticle } from "@/lib/teams";
import { MATCHES, matchesInGroup, ARCHIVE_DEFAULT_DATE } from "@/lib/matches";
import { squadFor } from "@/lib/squads";
import { countryName } from "@/lib/i18n";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { matchSlug } from "@/lib/matches";
import { firstMatchResultSentence } from "@/lib/teamCopy";
import matchEventsData from "@/data/archive/match-events.json";
import { buildKnockoutResolution } from "@/lib/knockoutResolution";
import { getResolvedAwayTeam, getResolvedHomeTeam } from "@/lib/participant-resolution";
import { getTeamTournamentStatus } from "@/lib/teamTournamentStatus";
import { getArchiveState } from "@/lib/archiveLifecycle";

export function generateStaticParams() {
  return TEAMS.map((t) => ({ slug: slugFor(t.key) }));
}

export const dynamicParams = false;
// export const dynamic = "force-dynamic"; // removed for ISR
export const revalidate = 60;

// ── helpers ────────────────────────────────────────────────────────────────

function longDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${iso}T00:00:00`));
}

// ── generateMetadata ───────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const team = teamBySlug(slug);
  if (!team) return {};

  const name = countryName(team.key, "en");
  const snapshot = await getTournamentLiveSnapshot();
  const resolvedParticipants = buildKnockoutResolution(snapshot.matches);
  const tournamentStatus = getTeamTournamentStatus({
    teamKey: team.key,
    matches: MATCHES,
    snapshotMatches: snapshot.matches,
    resolvedParticipants,
  });
  const squad = squadFor(team.key);
  const playerCount = squad?.length ?? 0;
  const BASE = "https://www.worldcupmatchday.com";
  const url = `${BASE}/teams/${slug}`;
  const flagUrl = `https://flagcdn.com/w320/${team.code}.png`;

  // Opponents for richer description
  const opponents = teamsInGroup(team.group)
    .filter((t) => t.key !== team.key)
    .map((t) => countryName(t.key, "en"));
  const opponentStr = opponents.join(", ");

  const getParticipantName = (m: any, side: "home" | "away") => {
    const key = side === "home" ? getResolvedHomeTeam(m, resolvedParticipants) : getResolvedAwayTeam(m, resolvedParticipants);
    if (key) return countryName(key, "en");
    if (!("matchNumber" in m)) return countryName(side === "home" ? m.homeKey : m.awayKey, "en");
    return m[side === "home" ? "homeSlot" : "awaySlot"] ? m[side === "home" ? "homeSlot" : "awaySlot"].kind === "group" ? `Runner-up Group ${m[side === "home" ? "homeSlot" : "awaySlot"].group}` : `Winner Match ${m[side === "home" ? "homeSlot" : "awaySlot"].matchNumber}` : "TBD";
  };

  const nextMatch = tournamentStatus.nextMatch;
  const nextFixture = nextMatch
    ? `${getParticipantName(nextMatch, "home")} vs ${getParticipantName(nextMatch, "away")}`
    : null;

  // Eliminated-at-group-stage pages previously used generic "fixtures/squad"
  // titles that didn't answer the actual query intent: GSC shows a large,
  // near-zero-CTR cluster searching "was [team] eliminated" / "[team] Group
  // [X] standings" — see docs/seo/ARCHIVE_SEO_V1_AUDIT.md §4 (Turkey Group D:
  // 70 query variants, 450 impressions, 0 clicks despite position ~10).
  const groupRank = snapshot.standingsByGroup[team.group]?.find((r) => r.teamKey === team.key)?.rank;
  const isEliminatedGroupStage = tournamentStatus.classification === "ELIMINATED_GROUP_STAGE";
  const groupRankLabel = groupRank ? `${groupRank}${groupRank === 1 ? "st" : groupRank === 2 ? "nd" : groupRank === 3 ? "rd" : "th"}` : null;

  const title = tournamentStatus.hasKnockoutJourney && tournamentStatus.currentStageLabel
    ? `${name} · ${tournamentStatus.currentStageLabel} | World Cup 2026 Tournament Run`
    : isEliminatedGroupStage
      ? `${name} Eliminated: World Cup 2026 Group ${team.group}${groupRankLabel ? ` — Finished ${groupRankLabel}` : " Standings"}`
      : `${name} World Cup 2026 — Schedule, Squad & Group ${team.group}`;
  const description = tournamentStatus.hasKnockoutJourney && tournamentStatus.currentStageLabel
    ? `${name} are ${tournamentStatus.currentStageLabel} at the 2026 World Cup.${nextFixture ? ` Next: ${nextFixture}.` : ""} Group ${team.group} results and squad remain available as tournament history.`
    : isEliminatedGroupStage
      ? `${name} were eliminated in the group stage of the 2026 FIFA World Cup${groupRankLabel ? `, finishing ${groupRankLabel} in Group ${team.group}` : ` in Group ${team.group}`}. Full group results, fixtures and squad.`
      : `${name} World Cup 2026: Group ${team.group} fixtures vs ${opponentStr}. ` +
        (playerCount > 0 ? `Squad of ${playerCount} players. ` : "") +
        `Qualification scenarios and group standings.`;

  return {
    title,
    description,
    keywords: [
      name,
      "FIFA World Cup 2026",
      `${name} World Cup 2026`,
      `${name} squad`,
      `${name} fixtures`,
      `Group ${team.group} World Cup 2026`,
      "World Cup schedule",
    ],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [{ url: flagUrl, width: 320, height: 213, alt: `${name} flag` }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [flagUrl],
    },
  };
}

// ── page ───────────────────────────────────────────────────────────────────

export default async function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const team = teamBySlug(slug);
  if (!team) notFound();

  const groupTeams = teamsInGroup(team.group);
  const groupMatches = matchesInGroup(team.group);
  const snapshot = await getTournamentLiveSnapshot();
  const resolvedParticipants = buildKnockoutResolution(snapshot.matches);
  const now = new Date(ARCHIVE_DEFAULT_DATE);
  const tournamentStatus = getTeamTournamentStatus({
    teamKey: team.key,
    matches: MATCHES,
    snapshotMatches: snapshot.matches,
    resolvedParticipants,
    now,
  });
  const archiveState = getArchiveState({ matches: MATCHES, liveData: snapshot.liveDataByProviderId, resolvedParticipants, now });
  const teamMatches = tournamentStatus.listedMatches;
  const hasReachedKnockoutStage = tournamentStatus.hasKnockoutJourney;
  const name = countryName(team.key, "en");

  // Team's first match (sorted ascending → first entry)
  const teamFirstMatch = groupMatches
    .filter((m) => m.homeKey === team.key || m.awayKey === team.key)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const firstOpponentKey = teamFirstMatch
    ? teamFirstMatch.homeKey === team.key
      ? teamFirstMatch.awayKey
      : teamFirstMatch.homeKey
    : null;

  const teammates = groupTeams
    .filter((t) => t.key !== team.key)
    .map((t) => countryName(t.key, "en"));

  // ── JSON-LD: SportsOrganization ──────────────────────────────────────────
  const sportsOrgLd = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: `${name} national football team`,
    sport: "Association football",
    url: `https://www.worldcupmatchday.com/teams/${slugFor(team.key)}`,
    logo: `https://flagcdn.com/w160/${team.code}.png`,
  };

  // ── JSON-LD: FAQPage ─────────────────────────────────────────────────────
  const faqEntities: object[] = [];

  if (teamFirstMatch && firstOpponentKey) {
    const opponentName = countryName(firstOpponentKey, "en");
    const snapshotFirstMatch = snapshot.matches[matchSlug(teamFirstMatch)];
    const dateStr = longDate(teamFirstMatch.date);
    const venueStr = teamFirstMatch.venue ? ` at ${teamFirstMatch.venue}` : "";
    const timeStr = teamFirstMatch.time ? `, kickoff ${teamFirstMatch.time} venue local time` : "";
    const played =
      snapshotFirstMatch?.status === "FINISHED" &&
      snapshotFirstMatch.homeScore !== null &&
      snapshotFirstMatch.awayScore !== null;
    const resultText = played
      ? firstMatchResultSentence({
          teamName: name,
          opponentName,
          date: dateStr,
          homeScore: snapshotFirstMatch.homeScore ?? 0,
          awayScore: snapshotFirstMatch.awayScore ?? 0,
        })
      : `${withArticle(name, true)} play ${opponentName} on ${dateStr}${venueStr}${timeStr}.`;
    faqEntities.push({
      "@type": "Question",
      name: `When do ${withArticle(name)} play their first match at the 2026 FIFA World Cup?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: resultText,
      },
    });
  }

  faqEntities.push({
    "@type": "Question",
    name: `What group are ${withArticle(name)} in at the 2026 World Cup?`,
    acceptedAnswer: {
      "@type": "Answer",
      text: `${withArticle(name, true)} are in Group ${team.group} with ${teammates.join(", ")}.`,
    },
  });

  if (!hasReachedKnockoutStage) {
    faqEntities.push({
      "@type": "Question",
      name: `How can ${withArticle(name)} qualify for the knockout stage at World Cup 2026?`,
      acceptedAnswer: {
        "@type": "Answer",
        text:
          `${withArticle(name, true)} qualify automatically by finishing 1st or 2nd in Group ${team.group}. ` +
          `They may also advance as one of the 8 best third-placed teams across all groups.`,
      },
    });
  }

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqEntities,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsOrgLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      {snapshot.isFallback ? (
        <div className="mx-auto max-w-4xl px-4 pt-6">
          <LiveDataUnavailableNotice show />
        </div>
      ) : null}
      <TeamDetail
        team={team}
        groupTeams={groupTeams}
        groupMatches={groupMatches}
        teamMatches={teamMatches}
        standingsRows={snapshot.standingsByGroup[team.group]}
        snapshotMatches={snapshot.matches}
        eventsArchive={matchEventsData}
        resolvedParticipants={resolvedParticipants}
        isTournamentComplete={archiveState.isComplete}
      />
    </>
  );
}
