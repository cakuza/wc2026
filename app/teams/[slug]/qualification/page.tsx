import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Flag } from "@/components/Flag";
import { LiveDataAutoRefresh } from "@/components/LiveDataAutoRefresh";
import { LiveSnapshotDebug } from "@/components/LiveSnapshotDebug";
import { LiveDataUnavailableNotice } from "@/components/LiveDataUnavailableNotice";
import { QuickAnswer } from "@/components/QuickAnswer";
import { LastUpdated } from "@/components/LastUpdated";
import { BreadcrumbNav, breadcrumbLd } from "@/components/BreadcrumbNav";
import { SourcesAndMethodology } from "@/components/SourcesAndMethodology";
import { StandingsTable } from "@/components/StandingsTable";
import { TEAMS, slugFor, teamBySlug, teamsInGroup } from "@/lib/teams";
import { matchesInGroup, matchSlug } from "@/lib/matches";
import { countryName } from "@/lib/i18n";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { getLiveRefreshPolicy } from "@/lib/liveRefreshPolicy";
import { letterToGroupSlug } from "@/lib/groupSlug";

const BASE = "https://www.worldcupmatchday.com";

// Only generate qualification pages for the two highest-demand teams.
// The route architecture is in place to add more later without structural changes.
const QUALIFICATION_PAGE_KEYS = ["england", "turkey"];

export function generateStaticParams() {
  return QUALIFICATION_PAGE_KEYS.map((key) => ({ slug: slugFor(key) }));
}

export const dynamicParams = false;
export const dynamic = "force-dynamic";
export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const team = teamBySlug(slug);
  if (!team || !QUALIFICATION_PAGE_KEYS.includes(team.key)) return {};

  const name = countryName(team.key, "en");
  const url = `${BASE}/teams/${slug}/qualification`;
  const title = `${name} World Cup 2026 Qualification — Group ${team.group} Path`;
  const description = `Track ${name}'s World Cup 2026 qualification path. Current Group ${team.group} standing, remaining fixtures, and what ${name} needs to reach the Round of 32.`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
  };
}

export default async function TeamQualificationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const team = teamBySlug(slug);
  if (!team || !QUALIFICATION_PAGE_KEYS.includes(team.key)) notFound();

  const name = countryName(team.key, "en");
  const group = team.group;
  const groupMatches = matchesInGroup(group);
  const groupTeams = teamsInGroup(group);
  const snapshot = await getTournamentLiveSnapshot();
  const standingsRows = snapshot.standingsByGroup[group] ?? [];
  const refreshPolicy = getLiveRefreshPolicy(Object.values(snapshot.matches));

  const teamRow = standingsRows.find((r) => r.teamKey === team.key);
  const teamRank = teamRow ? standingsRows.indexOf(teamRow) + 1 : null;
  const teamMatchesPlayed = teamRow?.played ?? 0;
  const teamPoints = teamRow?.points ?? 0;
  const gamesLeft = 3 - teamMatchesPlayed;
  const maxAchievable = teamPoints + gamesLeft * 3;

  const secondPlacePoints = standingsRows[1]?.points ?? 0;
  const secondPlaceTeam = standingsRows[1] ? countryName(standingsRows[1].teamKey, "en") : null;

  // Team's remaining matches
  const remainingMatches = groupMatches.filter((m) => {
    const snap = snapshot.matches[matchSlug(m)];
    const isTeamMatch = m.homeKey === team.key || m.awayKey === team.key;
    return isTeamMatch && snap?.status !== "FINISHED";
  });

  // Team's completed matches
  const completedMatches = groupMatches.filter((m) => {
    const snap = snapshot.matches[matchSlug(m)];
    const isTeamMatch = m.homeKey === team.key || m.awayKey === team.key;
    return isTeamMatch && snap?.status === "FINISHED";
  });

  // Derive qualification state — only assert mathematically proven facts
  type QualState = "qualified" | "eliminated" | "alive_auto" | "alive_third" | "unknown";
  let qualState: QualState = "unknown";
  let qualText = "";

  if (!snapshot.isFallback && teamRow) {
    if (teamMatchesPlayed === 3 && teamRank !== null) {
      if (teamRank <= 2) {
        qualState = "qualified";
        qualText = `${name} have qualified for the Round of 32 by finishing ${teamRank === 1 ? "1st" : "2nd"} in Group ${group}.`;
      } else if (teamRank === 4) {
        qualState = "eliminated";
        qualText = `${name} have been eliminated after finishing 4th in Group ${group}.`;
      } else {
        // 3rd — need full third-place ranking
        qualState = "alive_third";
        qualText = `${name} finished 3rd in Group ${group} and are in contention as one of the best third-placed teams. Final status depends on the full third-place ranking once all groups complete.`;
      }
    } else if (teamMatchesPlayed > 0) {
      if (maxAchievable < secondPlacePoints) {
        qualState = "eliminated";
        qualText = `${name} cannot mathematically finish in the top two of Group ${group} (max achievable: ${maxAchievable} pts; ${secondPlaceTeam ?? "2nd place"} already on ${secondPlacePoints} pts).`;
      } else if (teamRank !== null && teamRank <= 2 && gamesLeft > 0) {
        qualState = "alive_auto";
        qualText = `${name} are currently ${teamRank === 1 ? "1st" : "2nd"} in Group ${group} with ${gamesLeft} match${gamesLeft !== 1 ? "es" : ""} remaining.`;
      } else {
        qualState = "alive_auto";
        qualText = `${name} are in Group ${group} with ${gamesLeft} match${gamesLeft !== 1 ? "es" : ""} remaining.`;
      }
    }
  }

  const stateColor =
    qualState === "qualified"
      ? "text-green-400"
      : qualState === "eliminated"
        ? "text-red-400"
        : "text-amber-400";

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Teams", href: "/teams" },
    { label: name, href: `/teams/${slug}` },
    { label: "Qualification" },
  ];

  const breadcrumbSchema = breadcrumbLd(breadcrumbs, BASE);

  return (
    <>
      <LiveDataAutoRefresh intervalMs={refreshPolicy.intervalMs} />
      <LiveSnapshotDebug snapshotId={snapshot.snapshotId} generatedAt={snapshot.generatedAt} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="mx-auto max-w-3xl px-4 py-8">
        <BreadcrumbNav items={breadcrumbs} />

        <div className="mb-4 flex items-center gap-3">
          <Flag code={team.code} width={56} height={40} />
          <div>
            <p className="font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">
              World Cup 2026
            </p>
            <h1 className="font-heading text-3xl font-extrabold uppercase tracking-wide text-white sm:text-4xl">
              {name} Qualification
            </h1>
          </div>
        </div>
        <p className="mb-4 text-sm text-white/50">
          Group {group} path to the Round of 32.
        </p>

        {snapshot.isFallback && (
          <div className="mb-4">
            <LiveDataUnavailableNotice show />
          </div>
        )}

        {qualText && (
          <QuickAnswer label="Qualification status">
            <span className={stateColor}>{qualText}</span>
          </QuickAnswer>
        )}

        {/* Current standing */}
        <section className="mb-6">
          <h2 className="mb-2 font-heading text-lg font-extrabold uppercase tracking-wide text-white">
            Group {group} Standings
          </h2>
          {standingsRows.length > 0 ? (
            <>
              <StandingsTable teams={groupTeams} rows={standingsRows} currentTeamKey={team.key} showQualInfo />
              <LastUpdated isoTimestamp={snapshot.updatedAt} label="Standings last synced" />
            </>
          ) : (
            <p className="text-sm text-white/50">Standings not yet available.</p>
          )}
        </section>

        {/* Remaining fixtures */}
        {remainingMatches.length > 0 && (
          <section className="mb-6">
            <h2 className="mb-2 font-heading text-lg font-extrabold uppercase tracking-wide text-white">
              Remaining Fixtures
            </h2>
            <div className="space-y-2">
              {remainingMatches.map((m) => {
                const opponent = m.homeKey === team.key ? m.awayKey : m.homeKey;
                const opponentCode = m.homeKey === team.key ? m.awayCode : m.homeCode;
                const opponentName = countryName(opponent, "en");
                const isHome = m.homeKey === team.key;
                return (
                  <Link
                    key={matchSlug(m)}
                    href={`/matches/${matchSlug(m)}`}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-navyCard px-4 py-3 hover:border-white/25 transition"
                  >
                    <div className="flex items-center gap-2">
                      <Flag code={isHome ? team.code : opponentCode} width={28} height={20} />
                      <span className="text-sm font-bold text-white">
                        {isHome ? name : opponentName}
                      </span>
                    </div>
                    <span className="font-heading text-xs font-bold text-white/40 uppercase">
                      vs
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {isHome ? opponentName : name}
                      </span>
                      <Flag code={isHome ? opponentCode : team.code} width={28} height={20} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Completed results */}
        {completedMatches.length > 0 && (
          <section className="mb-6">
            <h2 className="mb-2 font-heading text-lg font-extrabold uppercase tracking-wide text-white">
              Results
            </h2>
            <div className="space-y-2">
              {completedMatches.map((m) => {
                const snap = snapshot.matches[matchSlug(m)];
                const homeName = countryName(m.homeKey, "en");
                const awayName = countryName(m.awayKey, "en");
                return (
                  <Link
                    key={matchSlug(m)}
                    href={`/matches/${matchSlug(m)}`}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-navyCard px-4 py-3 hover:border-white/25 transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Flag code={m.homeCode} width={26} height={18} />
                      <span className="truncate text-sm font-bold text-white">{homeName}</span>
                    </div>
                    <span className="mx-3 font-heading text-base font-extrabold text-white shrink-0">
                      {snap?.homeScore ?? "–"} – {snap?.awayScore ?? "–"}
                    </span>
                    <div className="flex items-center gap-2 min-w-0 justify-end">
                      <span className="truncate text-sm font-bold text-white">{awayName}</span>
                      <Flag code={m.awayCode} width={26} height={18} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Qualification routes */}
        <section className="mb-6 rounded-xl border border-white/10 bg-navyCard px-4 py-4">
          <h2 className="mb-3 font-heading text-sm font-extrabold uppercase tracking-wide text-white">
            Routes to the Round of 32
          </h2>
          <ul className="space-y-2 text-xs leading-relaxed text-white/60">
            <li>
              <span className="font-bold text-green-400">Automatic (1st or 2nd):</span> Finish in the
              top two of Group {group} — guaranteed place in the Round of 32.
            </li>
            <li>
              <span className="font-bold text-amber-400">Third-place route:</span> Finish 3rd in
              Group {group} and rank among the 8 best third-placed teams across all 12 groups. See the{" "}
              <Link
                href="/world-cup-third-place-qualification"
                className="text-accent hover:underline"
              >
                third-place table
              </Link>
              .
            </li>
            <li>
              <span className="font-bold text-red-400">Eliminated:</span> Finish 4th in the group,
              or cannot mathematically reach the top two.
            </li>
          </ul>
        </section>

        {/* Related links */}
        <div className="flex flex-wrap gap-3">
          {[
            { href: `/teams/${slug}`, label: `${name} Team Page` },
            { href: `/groups/${letterToGroupSlug(group)}`, label: `Group ${group} Standings` },
            { href: "/world-cup-third-place-qualification", label: "Third-Place Table" },
            { href: "/qualified-eliminated-teams", label: "All Qualified Teams" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg border border-white/15 bg-navyCard px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-white/70 transition hover:border-white/30 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <SourcesAndMethodology>
          <p>
            Qualification status is only stated when mathematically certain from available
            standings data. Third-place qualification status is not asserted until the full
            third-place ranking is resolved.
          </p>
          <p>WorldCupMatchDay is not affiliated with FIFA.</p>
        </SourcesAndMethodology>
      </div>
    </>
  );
}
