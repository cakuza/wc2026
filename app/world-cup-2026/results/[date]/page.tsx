import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BreadcrumbNav, breadcrumbLd } from "@/components/BreadcrumbNav";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { buildKnockoutResolution } from "@/lib/knockoutResolution";
import { getParticipantDisplay, matchStageLabel } from "@/lib/participant-resolution";
import { getMatchPresentation } from "@/lib/matchPresentation";
import { matchSlug, ARCHIVE_DEFAULT_DATE, MATCHES } from "@/lib/matches";
import { CANDIDATE_ARCHIVE_DATES } from "@/lib/archiveDates";
import { matchesOnDate, getStatsAsOfDate, liveDataAsOfDate, isDateFullyResolved } from "@/lib/archiveLifecycle";
import { computeTopScorers } from "@/lib/tournamentStats";

const BASE = "https://www.worldcupmatchday.com";
const now = new Date(ARCHIVE_DEFAULT_DATE);

export const dynamicParams = false;

/** Only dates whose full cumulative snapshot is truthfully resolvable get a page — see docs/seo/ROUTE_INVENTORY.md. */
export async function generateStaticParams() {
  const snapshot = await getTournamentLiveSnapshot();
  return CANDIDATE_ARCHIVE_DATES.filter((date) => isDateFullyResolved({ date, liveData: snapshot.liveDataByProviderId, now })).map((date) => ({ date }));
}

function formatDateLong(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00Z`).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }): Promise<Metadata> {
  const { date } = await params;
  const snapshot = await getTournamentLiveSnapshot();
  const stats = getStatsAsOfDate({ liveData: snapshot.liveDataByProviderId, cutoffDateStr: date });
  const long = formatDateLong(date);
  const title = `2026 World Cup Results: ${long} — Total Goals & Scores`;
  const description = `2026 FIFA World Cup results and cumulative totals as of ${long}: ${stats.matchesPlayed} matches played, ${stats.totalGoals} total goals scored.`;

  return {
    title,
    description,
    alternates: { canonical: `${BASE}/world-cup-2026/results/${date}` },
    openGraph: { title, description, url: `${BASE}/world-cup-2026/results/${date}`, type: "website" },
  };
}

export default async function ResultsByDatePage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!CANDIDATE_ARCHIVE_DATES.includes(date)) notFound();

  const snapshot = await getTournamentLiveSnapshot();
  const resolvedParticipants = buildKnockoutResolution(snapshot.matches);

  if (!isDateFullyResolved({ date, liveData: snapshot.liveDataByProviderId, now })) notFound();

  const resolvedDates = CANDIDATE_ARCHIVE_DATES.filter((d) => isDateFullyResolved({ date: d, liveData: snapshot.liveDataByProviderId, now }));
  const idx = resolvedDates.indexOf(date);
  const prevDate = idx > 0 ? resolvedDates[idx - 1] : null;
  const nextDate = idx < resolvedDates.length - 1 ? resolvedDates[idx + 1] : null;

  const todaysMatches = matchesOnDate(date).map((match) => {
    const live = match.providerIds?.footballData ? snapshot.liveDataByProviderId[String(match.providerIds.footballData)] : undefined;
    const pres = getMatchPresentation({ match, liveData: live, timeZone: "UTC", now });
    const home = getParticipantDisplay(match, "home", resolvedParticipants, "en");
    const away = getParticipantDisplay(match, "away", resolvedParticipants, "en");
    return { match, pres, home, away };
  });

  const goalsToday = todaysMatches.reduce((sum, r) => sum + (r.pres.homeScore ?? 0) + (r.pres.awayScore ?? 0), 0);
  const cleanSheetsToday = todaysMatches.reduce((sum, r) => sum + (r.pres.homeScore === 0 ? 1 : 0) + (r.pres.awayScore === 0 ? 1 : 0), 0);

  const cumulativeStats = getStatsAsOfDate({ liveData: snapshot.liveDataByProviderId, cutoffDateStr: date });
  const cumulativeScorers = computeTopScorers(liveDataAsOfDate({ liveData: snapshot.liveDataByProviderId, cutoffDateStr: date }))
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 5);

  const long = formatDateLong(date);
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "2026 World Cup", href: "/world-cup-2026" },
    { label: "Results", href: "/world-cup-2026/results" },
    { label: long },
  ];

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `2026 World Cup Results — ${long}`,
    url: `${BASE}/world-cup-2026/results/${date}`,
    numberOfItems: todaysMatches.length,
    itemListElement: todaysMatches.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${r.home.label} ${r.pres.homeScore}-${r.pres.awayScore} ${r.away.label}`,
      url: `${BASE}/matches/${matchSlug(r.match)}`,
    })),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd(breadcrumbs, BASE)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <BreadcrumbNav items={breadcrumbs} />

      <p className="mb-1 font-heading text-sm font-bold uppercase tracking-[0.3em] text-accentText">2026 World Cup Results</p>
      <h1 className="mb-4 font-heading text-3xl font-extrabold uppercase tracking-wide text-ink sm:text-4xl">{long}</h1>

      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted">
        {todaysMatches.length > 0
          ? `${todaysMatches.length} match${todaysMatches.length !== 1 ? "es" : ""} played on ${long}, producing ${goalsToday} goal${goalsToday !== 1 ? "s" : ""}${cleanSheetsToday > 0 ? ` and ${cleanSheetsToday} clean sheet${cleanSheetsToday !== 1 ? "s" : ""}` : ""}.`
          : `No matches were scheduled on ${long} — a rest day between rounds.`}{" "}
        As of the end of this date, the tournament stood at {cumulativeStats.matchesPlayed} matches played and {cumulativeStats.totalGoals} total goals
        ({cumulativeStats.averageGoalsPerMatch} per match).
      </p>

      {todaysMatches.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 font-heading text-lg font-bold uppercase tracking-wide text-ink">Matches on {long}</h2>
          <div className="flex flex-col gap-1.5">
            {todaysMatches.map(({ match, pres, home, away }) => (
              <Link
                key={matchSlug(match)}
                href={`/matches/${matchSlug(match)}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm transition hover:border-lineStrong"
              >
                <span className="font-semibold text-ink">
                  {home.label} {pres.state === "final" ? `${pres.homeScore}–${pres.awayScore}` : "vs"} {away.label}
                  {pres.state === "final" && pres.scoreDuration === "EXTRA_TIME" && " (after extra time)"}
                  {pres.state === "final" && pres.scoreDuration === "PENALTY_SHOOTOUT" && pres.penaltyHome !== null && pres.penaltyAway !== null && ` (after extra time, ${pres.penaltyHome}–${pres.penaltyAway} on penalties)`}
                </span>
                <span className="text-xs text-faint">{matchStageLabel(match)} · {match.venue}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: "Matches played", value: cumulativeStats.matchesPlayed },
          { label: "Total goals", value: cumulativeStats.totalGoals },
          { label: "Clean sheets", value: cumulativeStats.cleanSheets },
        ].map((tile) => (
          <div key={tile.label} className="rounded-lg border border-line bg-canvas px-4 py-3 text-center">
            <p className="font-heading text-2xl font-extrabold text-ink">{tile.value}</p>
            <p className="mt-1 text-[11px] uppercase tracking-widest text-faint">{tile.label} as of {long}</p>
          </div>
        ))}
      </section>

      {cumulativeScorers.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 font-heading text-lg font-bold uppercase tracking-wide text-ink">Top scorers as of {long}</h2>
          <ol className="flex flex-col gap-1 text-sm text-muted">
            {cumulativeScorers.map((s, i) => (
              <li key={s.playerName + s.teamKey} className="flex justify-between rounded border border-line bg-canvas/60 px-3 py-1.5">
                <span>{i + 1}. {s.playerName}{s.teamName ? ` (${s.teamName})` : ""}</span>
                <span className="font-bold text-ink">{s.goals} goal{s.goals !== 1 ? "s" : ""}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <nav aria-label="Adjacent tournament dates" className="flex items-center justify-between border-t border-line pt-4 text-sm">
        {prevDate ? (
          <Link href={`/world-cup-2026/results/${prevDate}`} className="text-muted underline decoration-lineStrong underline-offset-2 hover:text-ink">
            ← {formatDateLong(prevDate)}
          </Link>
        ) : <span />}
        <Link href="/world-cup-2026/results" className="text-faint hover:text-muted">All results</Link>
        {nextDate ? (
          <Link href={`/world-cup-2026/results/${nextDate}`} className="text-muted underline decoration-lineStrong underline-offset-2 hover:text-ink">
            {formatDateLong(nextDate)} →
          </Link>
        ) : <span />}
      </nav>
    </div>
  );
}
