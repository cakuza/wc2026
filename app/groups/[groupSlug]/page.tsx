import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LiveDataAutoRefresh } from "@/components/LiveDataAutoRefresh";
import { LiveSnapshotDebug } from "@/components/LiveSnapshotDebug";
import { LiveDataUnavailableNotice } from "@/components/LiveDataUnavailableNotice";
import { StandingsTable } from "@/components/StandingsTable";
import { QuickAnswer } from "@/components/QuickAnswer";
import { LastUpdated } from "@/components/LastUpdated";
import { BreadcrumbNav, breadcrumbLd } from "@/components/BreadcrumbNav";
import { SourcesAndMethodology } from "@/components/SourcesAndMethodology";
import { Flag } from "@/components/Flag";
import { groupSlugToLetter, generateGroupStaticParams, letterToGroupSlug } from "@/lib/groupSlug";
import { teamsInGroup, GROUP_LETTERS, slugFor } from "@/lib/teams";
import { matchesInGroup, matchSlug, matchUtcDate } from "@/lib/matches";
import { countryName } from "@/lib/i18n";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { getLiveRefreshPolicy } from "@/lib/liveRefreshPolicy";

const BASE = "https://www.worldcupmatchday.com";

export const dynamicParams = false;
export const dynamic = "force-dynamic";
export const revalidate = 30;

export function generateStaticParams() {
  return generateGroupStaticParams();
}

function teamNamesInGroup(letter: string): string[] {
  return teamsInGroup(letter).map((t) => countryName(t.key, "en"));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ groupSlug: string }>;
}): Promise<Metadata> {
  const { groupSlug } = await params;
  const letter = groupSlugToLetter(groupSlug);
  if (!letter) return {};

  const teamNames = teamNamesInGroup(letter);
  const teamsStr = teamNames.join(", ");
  const url = `${BASE}/groups/${groupSlug}`;

  const title = `World Cup 2026 Group ${letter} Standings — ${teamsStr}`;
  const description = `Live Group ${letter} standings, fixtures and results for the 2026 FIFA World Cup. Group ${letter} teams: ${teamsStr}. Track qualification, scores and goal scorers.`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
  };
}

function fmtMatchDate(m: { date: string; time?: string }): string {
  const d = new Date(`${m.date}T${m.time ?? "00:00"}:00`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(matchUtcDate(m as Parameters<typeof matchUtcDate>[0]));
}


export default async function GroupPage({
  params,
}: {
  params: Promise<{ groupSlug: string }>;
}) {
  const { groupSlug } = await params;
  const letter = groupSlugToLetter(groupSlug);
  if (!letter) notFound();

  const teams = teamsInGroup(letter);
  const matches = matchesInGroup(letter);
  const snapshot = await getTournamentLiveSnapshot();
  const standingsRows = snapshot.standingsByGroup[letter] ?? [];
  const refreshPolicy = getLiveRefreshPolicy(Object.values(snapshot.matches));
  const teamNames = teams.map((t) => countryName(t.key, "en"));
  const teamNamesStr = teamNames.join(", ");

  const anyPlayed = standingsRows.some((r) => r.played > 0);
  const allGroupMatchesFinished = matches.every(
    (m) => snapshot.matches[matchSlug(m)]?.status === "FINISHED",
  );

  // Leader(s) — for quick answer
  const leader = standingsRows[0];
  const leaderName = leader ? countryName(leader.teamKey, "en") : null;

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Groups", href: "/groups" },
    { label: `Group ${letter}` },
  ];

  // Structured data
  const breadcrumbSchema = breadcrumbLd(breadcrumbs, BASE);
  const url = `${BASE}/groups/${groupSlug}`;
  const webPageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `World Cup 2026 Group ${letter} Standings`,
    description: `Live Group ${letter} standings, fixtures and results for the 2026 FIFA World Cup.`,
    url,
    breadcrumb: breadcrumbSchema,
  };

  // Previous / next group nav
  const idx = GROUP_LETTERS.indexOf(letter);
  const prevGroup = idx > 0 ? GROUP_LETTERS[idx - 1] : null;
  const nextGroup = idx < GROUP_LETTERS.length - 1 ? GROUP_LETTERS[idx + 1] : null;

  return (
    <>
      <LiveDataAutoRefresh intervalMs={refreshPolicy.intervalMs} />
      <LiveSnapshotDebug snapshotId={snapshot.snapshotId} generatedAt={snapshot.generatedAt} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }}
      />

      <div className="mx-auto max-w-3xl px-4 py-8">
        <BreadcrumbNav items={breadcrumbs} />

        <p className="mb-1 font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">
          World Cup 2026
        </p>
        <h1 className="mb-1 font-heading text-3xl font-extrabold uppercase tracking-wide text-white sm:text-4xl">
          Group {letter} Standings
        </h1>
        <p className="mb-4 text-sm text-white/50">{teamNamesStr}</p>


        {snapshot.isFallback && (
          <div className="mb-4">
            <LiveDataUnavailableNotice show />
          </div>
        )}

        {/* Quick answer */}
        {anyPlayed && leaderName && (
          <QuickAnswer label={`Group ${letter} current leader`}>
            {leaderName} leads Group {letter} with {leader.points} point
            {leader.points !== 1 ? "s" : ""}.{" "}
            {allGroupMatchesFinished
              ? "All group matches are complete."
              : "Group play is ongoing — standings update as results are synced."}
          </QuickAnswer>
        )}

        {/* Standings */}
        <section className="mb-6">
          <h2 className="mb-2 font-heading text-lg font-extrabold uppercase tracking-wide text-white">
            Group {letter} Table
          </h2>
          {anyPlayed ? (
            <>
              <StandingsTable teams={teams} rows={standingsRows} showQualInfo />
              <LastUpdated isoTimestamp={snapshot.updatedAt} label="Standings last synced" />
            </>
          ) : (
            <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-white/60">
              Group {letter} matches have not yet kicked off. Standings will appear here once play
              begins.
            </div>
          )}
        </section>

        {/* Qualification info */}
        <section className="mb-6 rounded-xl border border-white/10 bg-navyCard px-4 py-4">
          <h2 className="mb-2 font-heading text-sm font-extrabold uppercase tracking-wide text-white">
            Qualification from Group {letter}
          </h2>
          <ul className="space-y-1 text-xs leading-relaxed text-white/60">
            <li>
              <span className="font-bold text-green-400">1st &amp; 2nd</span> — advance
              automatically to the Round of 32.
            </li>
            <li>
              <span className="font-bold text-amber-400">3rd</span> — eligible to advance as one
              of the 8 best third-placed teams.
            </li>
            <li>
              <span className="font-bold text-red-400">4th</span> — eliminated.
            </li>
          </ul>
          <p className="mt-3 text-xs text-white/40">
            Third-place qualification is determined across all 12 groups — see{" "}
            <Link
              href="/world-cup-third-place-qualification"
              className="text-accent underline-offset-2 hover:underline"
            >
              Best Third-Place Teams table
            </Link>
            .{" "}
            <Link
              href="/world-cup-2026-group-tiebreakers"
              className="text-accent underline-offset-2 hover:underline"
            >
              How tiebreakers work →
            </Link>
          </p>
        </section>

        {/* Fixtures / Results */}
        <section className="mb-6">
          <h2 className="mb-2 font-heading text-lg font-extrabold uppercase tracking-wide text-white">
            Group {letter} Fixtures &amp; Results
          </h2>
          <div className="space-y-2">
            {matches.map((m) => {
              const snap = snapshot.matches[matchSlug(m)];
              const status = snap?.status ?? "SCHEDULED";
              const finished = status === "FINISHED";
              const live = status === "LIVE" || status === "HALFTIME";
              const homeScore = snap?.homeScore ?? null;
              const awayScore = snap?.awayScore ?? null;
              const homeName = countryName(m.homeKey, "en");
              const awayName = countryName(m.awayKey, "en");
              return (
                <Link
                  key={matchSlug(m)}
                  href={`/matches/${matchSlug(m)}`}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-navyCard px-4 py-3 transition hover:border-white/25"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Flag code={m.homeCode} width={28} height={20} />
                    <span className="truncate text-sm font-bold text-white">{homeName}</span>
                  </div>
                  <div className="mx-3 shrink-0 text-center">
                    {finished || live ? (
                      <span
                        className={`font-heading text-base font-extrabold ${live ? "text-accent" : "text-white"}`}
                      >
                        {homeScore} – {awayScore}
                      </span>
                    ) : (
                      <span className="font-heading text-xs font-bold uppercase text-white/40">
                        {fmtMatchDate(m)}
                      </span>
                    )}
                    {live && (
                      <span className="mt-0.5 block font-heading text-[9px] font-extrabold uppercase tracking-widest text-accent">
                        Live
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 min-w-0 justify-end">
                    <span className="truncate text-sm font-bold text-white">{awayName}</span>
                    <Flag code={m.awayCode} width={28} height={20} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Teams in this group */}
        <section className="mb-6">
          <h2 className="mb-2 font-heading text-sm font-extrabold uppercase tracking-wide text-white">
            Teams in Group {letter}
          </h2>
          <div className="flex flex-wrap gap-2">
            {teams.map((t) => (
              <Link
                key={t.key}
                href={`/teams/${slugFor(t.key)}`}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-navyCard px-3 py-2 text-xs font-bold text-white/70 transition hover:border-white/30 hover:text-white"
              >
                <Flag code={t.code} width={22} height={16} />
                {countryName(t.key, "en")}
              </Link>
            ))}
          </div>
        </section>

        {/* Prev / next group nav */}
        <div className="mb-6 flex items-center justify-between">
          {prevGroup ? (
            <Link
              href={`/groups/${letterToGroupSlug(prevGroup)}`}
              className="rounded-lg border border-white/15 bg-navyCard px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-white/70 transition hover:border-white/30 hover:text-white"
            >
              ← Group {prevGroup}
            </Link>
          ) : (
            <span />
          )}
          {nextGroup ? (
            <Link
              href={`/groups/${letterToGroupSlug(nextGroup)}`}
              className="rounded-lg border border-white/15 bg-navyCard px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-white/70 transition hover:border-white/30 hover:text-white"
            >
              Group {nextGroup} →
            </Link>
          ) : (
            <span />
          )}
        </div>

        {/* Related links */}
        <div className="flex flex-wrap gap-3">
          {[
            { href: "/groups", label: "All Groups" },
            { href: "/world-cup-third-place-qualification", label: "Third-Place Table" },
            { href: "/qualified-eliminated-teams", label: "Qualified Teams" },
            { href: "/stats/top-scorers", label: "Top Scorers" },
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
            Scores and match status are sourced from the primary data provider and updated every 12
            seconds during live matches. Standings are computed from completed, synced results.
          </p>
          <p>
            WorldCupMatchDay is not affiliated with FIFA. Data may be subject to a brief delay.
          </p>
        </SourcesAndMethodology>
      </div>
    </>
  );
}
