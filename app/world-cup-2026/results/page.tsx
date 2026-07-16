import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbNav, breadcrumbLd } from "@/components/BreadcrumbNav";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { buildKnockoutResolution } from "@/lib/knockoutResolution";
import { getArchiveState } from "@/lib/archiveLifecycle";
import { getParticipantDisplay, matchStageLabel, isKnockoutMatch } from "@/lib/participant-resolution";
import { getMatchPresentation } from "@/lib/matchPresentation";
import { matchSlug, matchUtcDate, MATCHES, ARCHIVE_DEFAULT_DATE, type Match } from "@/lib/matches";

const BASE = "https://www.worldcupmatchday.com";
const now = new Date(ARCHIVE_DEFAULT_DATE);

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const snapshot = await getTournamentLiveSnapshot();
  const resolvedParticipants = buildKnockoutResolution(snapshot.matches);
  const archive = getArchiveState({ matches: MATCHES, liveData: snapshot.liveDataByProviderId, resolvedParticipants, now });

  const title = archive.isComplete
    ? "2026 World Cup Results: Every Score, Match and Knockout Result"
    : "2026 World Cup Results: All Completed Matches So Far";
  const description = archive.isComplete
    ? `Every result from the 2026 FIFA World Cup: all ${MATCHES.length} matches from the group stage through ${archive.champion}'s Final win, with scores, stages, venues and dates.`
    : "Every completed 2026 FIFA World Cup result so far, from the group stage through the knockout rounds, with scores, stages, venues and dates.";

  return {
    title,
    description,
    alternates: { canonical: `${BASE}/world-cup-2026/results` },
    openGraph: { title, description, url: `${BASE}/world-cup-2026/results`, type: "website" },
  };
}

const breadcrumbs = [{ label: "Home", href: "/" }, { label: "2026 World Cup", href: "/world-cup-2026" }, { label: "Results" }];

const STAGE_ORDER: Array<{ key: string; label: string; match: (m: Match) => boolean }> = [
  { key: "final", label: "Final", match: (m) => isKnockoutMatch(m) && m.stage === "F" },
  { key: "third", label: "Third-Place Playoff", match: (m) => isKnockoutMatch(m) && m.stage === "3P" },
  { key: "sf", label: "Semifinals", match: (m) => isKnockoutMatch(m) && m.stage === "SF" },
  { key: "qf", label: "Quarterfinals", match: (m) => isKnockoutMatch(m) && m.stage === "QF" },
  { key: "r16", label: "Round of 16", match: (m) => isKnockoutMatch(m) && m.stage === "R16" },
  { key: "r32", label: "Round of 32", match: (m) => isKnockoutMatch(m) && m.stage === "R32" },
  { key: "group", label: "Group Stage", match: (m) => !isKnockoutMatch(m) },
];

export default async function WorldCup2026ResultsPage() {
  const snapshot = await getTournamentLiveSnapshot();
  const resolvedParticipants = buildKnockoutResolution(snapshot.matches);
  const archive = getArchiveState({ matches: MATCHES, liveData: snapshot.liveDataByProviderId, resolvedParticipants, now });
  const stats = snapshot.tournamentStats;

  const rows = MATCHES.map((match) => {
    const live = match.providerIds?.footballData ? snapshot.liveDataByProviderId[String(match.providerIds.footballData)] : undefined;
    const pres = getMatchPresentation({ match, liveData: live, timeZone: "UTC", now });
    const home = getParticipantDisplay(match, "home", resolvedParticipants, "en");
    const away = getParticipantDisplay(match, "away", resolvedParticipants, "en");
    return { match, pres, home, away };
  });

  const completedCount = rows.filter((r) => r.pres.state === "final").length;

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "2026 World Cup Results",
    description: `All ${MATCHES.length} 2026 FIFA World Cup matches with results.`,
    url: `${BASE}/world-cup-2026/results`,
    numberOfItems: rows.length,
    itemListElement: rows
      .filter((r) => r.pres.state === "final")
      .map((r, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${r.home.label} ${r.pres.homeScore}-${r.pres.awayScore} ${r.away.label}`,
        url: `${BASE}/matches/${matchSlug(r.match)}`,
      })),
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd(breadcrumbs, BASE)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <BreadcrumbNav items={breadcrumbs} />

      <p className="mb-1 font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">2026 World Cup Archive</p>
      <h1 className="mb-2 font-heading text-4xl font-extrabold uppercase tracking-wide text-white sm:text-5xl">Full Results</h1>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-white/60">
        {completedCount} of {MATCHES.length} matches completed · {stats.totalGoals} total goals · {stats.cleanSheets} clean sheets.{" "}
        <Link href="/world-cup-2026" className="underline decoration-white/30 underline-offset-2 hover:text-white">Archive hub</Link>
        {" · "}
        <Link href="/bracket" className="underline decoration-white/30 underline-offset-2 hover:text-white">Bracket</Link>
        {" · "}
        <Link href="/stats" className="underline decoration-white/30 underline-offset-2 hover:text-white">Statistics</Link>
      </p>

      <nav aria-label="Jump to stage" className="mb-8 flex flex-wrap gap-2">
        {STAGE_ORDER.map((stage) => {
          const has = rows.some((r) => stage.match(r.match));
          if (!has) return null;
          return (
            <a key={stage.key} href={`#${stage.key}`} className="rounded-full border border-white/15 bg-navyCard px-3 py-1 text-xs font-bold uppercase tracking-wide text-white/70 hover:border-white/30 hover:text-white">
              {stage.label}
            </a>
          );
        })}
      </nav>

      {STAGE_ORDER.map((stage) => {
        const stageRows = rows.filter((r) => stage.match(r.match)).sort((a, b) => matchUtcDate(a.match).getTime() - matchUtcDate(b.match).getTime());
        if (stageRows.length === 0) return null;
        const isMarquee = stage.key === "final" || stage.key === "third";
        return (
          <section key={stage.key} id={stage.key} className="mb-8 scroll-mt-20">
            <h2 className="mb-3 font-heading text-lg font-bold uppercase tracking-wide text-white">{stage.label}</h2>
            <div className="flex flex-col gap-1.5">
              {stageRows.map(({ match, pres, home, away }) => (
                <Link
                  key={matchSlug(match)}
                  href={`/matches/${matchSlug(match)}`}
                  className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                    isMarquee ? "border-accent/30 bg-accent/5 hover:border-accent/50" : "border-white/10 bg-navyCard hover:border-white/25"
                  }`}
                >
                  <span className="font-semibold text-white">
                    {home.label} {pres.state === "final" ? `${pres.homeScore}–${pres.awayScore}` : "vs"} {away.label}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-white/50">
                    <span>{match.venue}</span>
                    <span>{match.date}</span>
                    <span className={`rounded px-1.5 py-0.5 font-bold uppercase ${pres.state === "final" ? "bg-white/10 text-white/60" : "bg-white/5 text-white/40"}`}>
                      {pres.state === "final" ? "FT" : "Scheduled"}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      {archive.isComplete && (
        <p className="mt-4 text-xs text-white/40">
          Tournament complete: {archive.champion} won the Final {archive.finalResult?.homeScore}–{archive.finalResult?.awayScore} over{" "}
          {archive.runnerUp}; {archive.thirdPlace} finished third.
        </p>
      )}
    </div>
  );
}
