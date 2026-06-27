import type { Metadata } from "next";
import Link from "next/link";
import { Flag } from "@/components/Flag";
import { LiveDataAutoRefresh } from "@/components/LiveDataAutoRefresh";
import { LiveSnapshotDebug } from "@/components/LiveSnapshotDebug";
import { LiveDataUnavailableNotice } from "@/components/LiveDataUnavailableNotice";
import { QuickAnswer } from "@/components/QuickAnswer";
import { LastUpdated } from "@/components/LastUpdated";
import { BreadcrumbNav, breadcrumbLd } from "@/components/BreadcrumbNav";
import { SourcesAndMethodology } from "@/components/SourcesAndMethodology";
import { DataAvailabilityNotice } from "@/components/DataAvailabilityNotice";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { getLiveRefreshPolicy } from "@/lib/liveRefreshPolicy";
import { TEAMS, slugFor } from "@/lib/teams";
import { countryName } from "@/lib/i18n";

const BASE = "https://www.worldcupmatchday.com";

export const dynamic = "force-dynamic";
export const revalidate = 30;

export const metadata: Metadata = {
  title: "World Cup 2026 Top Scorers — Golden Boot Standings",
  description:
    "Live World Cup 2026 Golden Boot standings. Track leading scorers, goals, penalties and team by team in the 2026 FIFA World Cup.",
  alternates: { canonical: `${BASE}/stats/top-scorers` },
  openGraph: {
    title: "World Cup 2026 Top Scorers — Golden Boot Standings",
    description:
      "Live World Cup 2026 Golden Boot standings. Track leading scorers, goals, penalties and team.",
    url: `${BASE}/stats/top-scorers`,
    type: "website",
  },
};

function teamKeyFromName(teamName: string | null): string | null {
  if (!teamName) return null;
  return TEAMS.find((t) => countryName(t.key, "en") === teamName)?.key ?? null;
}

function teamCodeForKey(key: string): string {
  return TEAMS.find((t) => t.key === key)?.code ?? "un";
}

function teamSlugForKey(key: string): string {
  return slugFor(key);
}

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Stats", href: "/stats" },
  { label: "Top Scorers" },
];

export default async function TopScorersPage() {
  const snapshot = await getTournamentLiveSnapshot();
  const topScorers = snapshot.topScorers;
  const refreshPolicy = getLiveRefreshPolicy(Object.values(snapshot.matches));

  const hasData = topScorers.length > 0 && !snapshot.isFallback;
  const leader = hasData ? topScorers[0] : null;

  const breadcrumbSchema = breadcrumbLd(breadcrumbs, BASE);
  const itemListLd = hasData
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "World Cup 2026 Top Scorers",
        description: "Leading goal scorers at the 2026 FIFA World Cup.",
        url: `${BASE}/stats/top-scorers`,
        numberOfItems: topScorers.length,
        itemListElement: topScorers.slice(0, 10).map((s, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: s.playerName,
          description: `${s.goals} goal${s.goals !== 1 ? "s" : ""}${s.teamName ? ` — ${s.teamName}` : ""}`,
        })),
      }
    : null;

  return (
    <>
      <LiveDataAutoRefresh intervalMs={refreshPolicy.intervalMs} />
      <LiveSnapshotDebug snapshotId={snapshot.snapshotId} generatedAt={snapshot.generatedAt} />
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      {itemListLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
        />
      )}

      <div className="mx-auto max-w-3xl px-4 py-8">
        <BreadcrumbNav items={breadcrumbs} />

        <p className="mb-1 font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">
          World Cup 2026
        </p>
        <h1 className="mb-1 font-heading text-3xl font-extrabold uppercase tracking-wide text-white sm:text-4xl">
          Top Scorers
        </h1>
        <p className="mb-2 text-sm text-white/50">
          Golden Boot standings — updated after each completed match.
        </p>
        <p className="mb-4 text-sm leading-relaxed text-white/60">
          The FIFA World Cup Golden Boot is awarded to the tournament&apos;s leading goal scorer.
          At the 2026 World Cup, all 104 matches count — from the group stage through to the final on
          19 July. If players are level on goals, tiebreakers include assists, then disciplinary record.
          Goal scorer data syncs after each completed match from our data provider.
        </p>

        {snapshot.isFallback && (
          <div className="mb-4">
            <LiveDataUnavailableNotice show />
          </div>
        )}

        <DataAvailabilityNotice
          show={!hasData && !snapshot.isFallback}
          message="Scorer data becomes available once matches with enriched goal events are synced. Check back during or after matches."
        />

        {hasData && leader && (
          <QuickAnswer label="Golden Boot leader">
            {leader.playerName}{leader.teamName ? ` (${leader.teamName})` : ""} leads with {leader.goals}{" "}
            goal{leader.goals !== 1 ? "s" : ""}. Scorer data is sourced from completed,
            synced matches and may not yet include the latest match.
          </QuickAnswer>
        )}

        {hasData ? (
          <section className="mb-6">
            <h2 className="mb-3 font-heading text-lg font-extrabold uppercase tracking-wide text-white">
              Golden Boot Standings
            </h2>
            <div className="overflow-hidden rounded-xl border border-white/10">
              {/* Header */}
              <div className="grid grid-cols-[2.5rem_1fr_auto_auto] gap-2 border-b border-white/10 bg-navy px-4 py-2">
                <span className="font-heading text-[10px] font-extrabold uppercase tracking-wide text-white/30">
                  #
                </span>
                <span className="font-heading text-[10px] font-extrabold uppercase tracking-wide text-white/30">
                  Player
                </span>
                <span className="font-heading text-[10px] font-extrabold uppercase tracking-wide text-white/30 text-right">
                  Goals
                </span>
                <span className="font-heading text-[10px] font-extrabold uppercase tracking-wide text-white/30 text-right w-10">
                  Pen
                </span>
              </div>

              {topScorers.map((scorer, i) => {
                const prevGoals = i > 0 ? topScorers[i - 1].goals : null;
                const sameRank = prevGoals !== null && scorer.goals === prevGoals;
                const rank = sameRank
                  ? (topScorers.slice(0, i).find((s) => s.goals === scorer.goals)
                      ? topScorers.findIndex((s) => s.goals === scorer.goals) + 1
                      : i + 1)
                  : i + 1;
                const teamKey = teamKeyFromName(scorer.teamName);
                const teamCode = teamKey ? teamCodeForKey(teamKey) : "un";
                const teamSlug = teamKey ? teamSlugForKey(teamKey) : null;
                const displayName = scorer.teamName ?? "";

                return (
                  <div
                    key={`${scorer.playerName}-${scorer.teamName ?? ""}`}
                    className="grid grid-cols-[2.5rem_1fr_auto_auto] gap-2 border-b border-white/5 px-4 py-3 last:border-0 hover:bg-white/3"
                  >
                    <span className="font-heading text-sm font-extrabold text-white/40 self-center">
                      {rank}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{scorer.playerName}</p>
                      {teamSlug ? (
                        <Link
                          href={`/teams/${teamSlug}`}
                          className="flex items-center gap-1.5 mt-0.5"
                        >
                          <Flag code={teamCode} width={20} height={14} />
                          <span className="font-heading text-[10px] font-bold uppercase tracking-wide text-white/40 hover:text-white/70 transition-colors">
                            {displayName}
                          </span>
                        </Link>
                      ) : displayName ? (
                        <span className="flex items-center gap-1.5 mt-0.5 font-heading text-[10px] font-bold uppercase tracking-wide text-white/40">
                          {displayName}
                        </span>
                      ) : null}
                    </div>
                    <span className="font-heading text-base font-extrabold text-white self-center text-right">
                      {scorer.goals}
                    </span>
                    <span className="font-heading text-sm font-bold text-white/30 self-center text-right w-10">
                      —
                    </span>
                  </div>
                );
              })}
            </div>

            <LastUpdated isoTimestamp={snapshot.updatedAt} label="Scorer data last synced" />

            <p className="mt-2 text-xs text-white/35">
              Own goals are not counted. Penalties are shown in brackets where available.
              Scorer data is sourced from completed, synced matches — new goals appear after
              the provider confirms them.
            </p>
          </section>
        ) : (
          !snapshot.isFallback && (
            <div className="mb-6 rounded-xl border border-white/10 bg-navyCard px-4 py-4 text-sm text-white/50">
              No scorer data available yet. This table populates once enriched goal events from
              completed matches are synced.
            </div>
          )
        )}

        {/* Related links */}
        <div className="flex flex-wrap gap-3">
          {[
            { href: "/stats", label: "All Stats" },
            { href: "/groups", label: "Group Standings" },
            { href: "/world-cup-third-place-qualification", label: "Third-Place Table" },
            { href: "/qualified-eliminated-teams", label: "Qualified Teams" },
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
            Scorer data is enriched from secondary match reports and synced after each completed
            match. Goals scored in extra time or on penalties may be attributed differently across
            sources.
          </p>
          <p>
            Own goals are excluded from the Golden Boot calculation. Penalty goals are identified
            where available and displayed in brackets.
          </p>
          <p>WorldCupMatchDay is not affiliated with FIFA.</p>
        </SourcesAndMethodology>
      </div>
    </>
  );
}
