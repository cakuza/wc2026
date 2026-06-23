import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Flag } from "@/components/Flag";
import { LiveDataAutoRefresh } from "@/components/LiveDataAutoRefresh";
import { LiveSnapshotDebug } from "@/components/LiveSnapshotDebug";
import { QuickAnswer } from "@/components/QuickAnswer";
import { LastUpdated } from "@/components/LastUpdated";
import { BreadcrumbNav, breadcrumbLd } from "@/components/BreadcrumbNav";
import { SourcesAndMethodology } from "@/components/SourcesAndMethodology";
import {
  allMatchdayDates,
  matchesOnDate,
  isValidMatchdayDate,
  prevMatchdayDate,
  nextMatchdayDate,
  formatMatchdayDate,
} from "@/lib/matchdays";
import { matchSlug, matchUtcDate } from "@/lib/matches";
import { countryName } from "@/lib/i18n";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { getLiveRefreshPolicy } from "@/lib/liveRefreshPolicy";

const BASE = "https://www.worldcupmatchday.com";

export const dynamicParams = false;
export const dynamic = "force-dynamic";
export const revalidate = 30;

export function generateStaticParams() {
  return allMatchdayDates().map((date) => ({ date }));
}

function isValidDateFormat(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>;
}): Promise<Metadata> {
  const { date } = await params;
  if (!isValidDateFormat(date) || !isValidMatchdayDate(date)) return {};

  const matches = matchesOnDate(date);
  const dateLabel = formatMatchdayDate(date);
  const teams = [
    ...new Set(matches.flatMap((m) => [countryName(m.homeKey, "en"), countryName(m.awayKey, "en")])),
  ]
    .slice(0, 6)
    .join(", ");

  const url = `${BASE}/matchdays/${date}`;
  const title = `World Cup 2026 Matches — ${dateLabel}`;
  const description = `All ${matches.length} World Cup 2026 match${matches.length !== 1 ? "es" : ""} on ${dateLabel}: ${teams}. Scores, scorers and kickoff times.`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
  };
}

function fmtKickoffUtc(m: Parameters<typeof matchUtcDate>[0]): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(matchUtcDate(m));
}

export default async function MatchdayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!isValidDateFormat(date) || !isValidMatchdayDate(date)) notFound();

  const matches = matchesOnDate(date);
  const snapshot = await getTournamentLiveSnapshot();
  const refreshPolicy = getLiveRefreshPolicy(Object.values(snapshot.matches));

  const dateLabel = formatMatchdayDate(date);
  const prevDate = prevMatchdayDate(date);
  const nextDate = nextMatchdayDate(date);

  // Compute summary stats
  const finishedMatches = matches.filter(
    (m) => snapshot.matches[matchSlug(m)]?.status === "FINISHED",
  );
  const liveMatches = matches.filter((m) => {
    const s = snapshot.matches[matchSlug(m)]?.status;
    return s === "LIVE" || s === "HALFTIME";
  });
  const totalGoals = finishedMatches.reduce((sum, m) => {
    const snap = snapshot.matches[matchSlug(m)];
    return sum + (snap?.homeScore ?? 0) + (snap?.awayScore ?? 0);
  }, 0);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Matchdays", href: "/schedule" },
    { label: dateLabel },
  ];

  const breadcrumbSchema = breadcrumbLd(breadcrumbs, BASE);

  // Build ItemList schema for the day's matches
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `World Cup 2026 matches on ${dateLabel}`,
    url: `${BASE}/matchdays/${date}`,
    numberOfItems: matches.length,
    itemListElement: matches.map((m, i) => {
      const snap = snapshot.matches[matchSlug(m)];
      const finished = snap?.status === "FINISHED";
      const homeName = countryName(m.homeKey, "en");
      const awayName = countryName(m.awayKey, "en");
      const result = finished
        ? `${snap.homeScore}–${snap.awayScore}`
        : fmtKickoffUtc(m);
      return {
        "@type": "ListItem",
        position: i + 1,
        name: `${homeName} vs ${awayName}`,
        description: result,
        url: `${BASE}/matches/${matchSlug(m)}`,
      };
    }),
  };

  // SportsEvents for each finished match
  const sportsEvents = finishedMatches.map((m) => {
    const snap = snapshot.matches[matchSlug(m)];
    const utc = matchUtcDate(m).toISOString();
    return {
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      name: `${countryName(m.homeKey, "en")} vs ${countryName(m.awayKey, "en")}`,
      startDate: utc,
      location: m.venue ? { "@type": "Place", name: m.venue } : undefined,
      homeTeam: { "@type": "SportsTeam", name: countryName(m.homeKey, "en") },
      awayTeam: { "@type": "SportsTeam", name: countryName(m.awayKey, "en") },
      url: `${BASE}/matches/${matchSlug(m)}`,
      eventStatus: "https://schema.org/EventCompleted",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      ...(snap?.homeScore !== null && snap?.awayScore !== null
        ? {
            description: `Final score: ${snap.homeScore}–${snap.awayScore}`,
          }
        : {}),
    };
  });

  return (
    <>
      <LiveDataAutoRefresh intervalMs={refreshPolicy.intervalMs} />
      <LiveSnapshotDebug snapshotId={snapshot.snapshotId} generatedAt={snapshot.generatedAt} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      {sportsEvents.map((event, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(event) }}
        />
      ))}

      <div className="mx-auto max-w-3xl px-4 py-8">
        <BreadcrumbNav items={breadcrumbs} />

        <p className="mb-1 font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">
          World Cup 2026
        </p>
        <h1 className="mb-1 font-heading text-2xl font-extrabold uppercase tracking-wide text-white sm:text-3xl">
          Matches — {dateLabel}
        </h1>
        <p className="mb-4 text-sm text-white/50">
          {matches.length} match{matches.length !== 1 ? "es" : ""} scheduled
          {liveMatches.length > 0 ? ` · ${liveMatches.length} live` : ""}
          {finishedMatches.length > 0
            ? ` · ${finishedMatches.length} complete · ${totalGoals} goal${totalGoals !== 1 ? "s" : ""}`
            : ""}
        </p>

        {finishedMatches.length === matches.length && matches.length > 0 && (
          <QuickAnswer label={`${dateLabel} summary`}>
            All {matches.length} match{matches.length !== 1 ? "es" : ""} on {dateLabel} are
            complete. {totalGoals} goal{totalGoals !== 1 ? "s" : ""} scored across this matchday.
          </QuickAnswer>
        )}

        {/* Match list */}
        <section className="mb-6">
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
              const scorers = snap?.scorers ?? [];

              return (
                <Link
                  key={matchSlug(m)}
                  href={`/matches/${matchSlug(m)}`}
                  className="block rounded-xl border border-white/10 bg-navyCard px-4 py-3 transition hover:border-white/25"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <Flag code={m.homeCode} width={28} height={20} />
                      <span className="truncate text-sm font-bold text-white">{homeName}</span>
                    </div>
                    <div className="mx-3 shrink-0 text-center">
                      {finished || live ? (
                        <>
                          <span
                            className={`font-heading text-base font-extrabold ${live ? "text-accent" : "text-white"}`}
                          >
                            {homeScore} – {awayScore}
                          </span>
                          {live && (
                            <p className="font-heading text-[9px] font-extrabold uppercase tracking-widest text-accent">
                              Live
                            </p>
                          )}
                        </>
                      ) : (
                        <span className="font-heading text-xs font-bold uppercase text-white/40">
                          {fmtKickoffUtc(m)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 min-w-0 justify-end">
                      <span className="truncate text-sm font-bold text-white">{awayName}</span>
                      <Flag code={m.awayCode} width={28} height={20} />
                    </div>
                  </div>

                  {/* Venue + group */}
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {m.venue && (
                      <span className="font-heading text-[10px] text-white/30">{m.venue}</span>
                    )}
                    {m.group && (
                      <span className="font-heading text-[10px] font-bold uppercase tracking-wide text-accent/60">
                        Group {m.group}
                      </span>
                    )}
                  </div>

                  {/* Scorers (finished only) */}
                  {finished && scorers.length > 0 && (
                    <p className="mt-1 text-[11px] text-white/40 truncate">
                      ⚽{" "}
                      {scorers
                        .map((s) => `${s.playerName}${s.minute ? ` ${s.minute}'` : ""}`)
                        .join(", ")}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        <LastUpdated isoTimestamp={snapshot.updatedAt} label="Scores last synced" />

        {/* Prev / next matchday nav */}
        <div className="mb-6 mt-4 flex items-center justify-between">
          {prevDate ? (
            <Link
              href={`/matchdays/${prevDate}`}
              className="rounded-lg border border-white/15 bg-navyCard px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-white/70 transition hover:border-white/30 hover:text-white"
            >
              ← {formatMatchdayDate(prevDate).split(",")[0]}
            </Link>
          ) : (
            <span />
          )}
          {nextDate ? (
            <Link
              href={`/matchdays/${nextDate}`}
              className="rounded-lg border border-white/15 bg-navyCard px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-white/70 transition hover:border-white/30 hover:text-white"
            >
              {formatMatchdayDate(nextDate).split(",")[0]} →
            </Link>
          ) : (
            <span />
          )}
        </div>

        {/* Related links */}
        <div className="flex flex-wrap gap-3">
          {[
            { href: "/today", label: "Today's Matches" },
            { href: "/schedule", label: "Full Schedule" },
            { href: "/groups", label: "Group Standings" },
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
            Match times shown in UTC. Scores and match status update every 12 seconds during live
            play. Scorer data enriched from secondary match reports after completion.
          </p>
          <p>WorldCupMatchDay is not affiliated with FIFA.</p>
        </SourcesAndMethodology>
      </div>
    </>
  );
}
