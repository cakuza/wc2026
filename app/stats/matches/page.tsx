import type { Metadata } from "next";
import Link from "next/link";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { StatsNav } from "@/components/StatsNav";
import { BreadcrumbNav, breadcrumbLd } from "@/components/BreadcrumbNav";
import { countryName } from "@/lib/i18n";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "World Cup 2026 Match Records",
  description: "Highest scoring match, biggest win, and other match records from the 2026 World Cup.",
  alternates: { canonical: "https://www.worldcupmatchday.com/stats/matches" },
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Stats", href: "/stats" },
  { label: "Matches" },
];

export default async function MatchesStatsPage() {
  const snapshot = await getTournamentLiveSnapshot();
  const { highestScoringMatch, biggestWin, cleanSheets, matchesPlayed } = snapshot.tournamentStats;
  
  const hasData = matchesPlayed > 0;

  function fmtResult(r: { homeKey: string; awayKey: string; homeScore: number; awayScore: number }) {
    return `${countryName(r.homeKey, "en")} ${r.homeScore}–${r.awayScore} ${countryName(r.awayKey, "en")}`;
  }



  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd(breadcrumbs, "https://www.worldcupmatchday.com")) }}
      />
      <BreadcrumbNav items={breadcrumbs} />

      <div className="mb-6 mt-4">
        <p className="font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">
          World Cup 2026
        </p>
        <h1 className="mt-1 font-heading text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">
          Match Records
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-faint">
          Match extremes from the 2026 tournament.
        </p>
      </div>

      <StatsNav />

      <section className="mb-12">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-heading text-lg font-extrabold uppercase tracking-widest text-white">
            2026 Tournament Records
          </h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {hasData ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex gap-4 rounded-xl border border-line bg-surface p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-2xl">
                🔥
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <p className="font-heading text-xs font-bold uppercase tracking-widest text-faint">
                  Highest Scoring Match
                </p>
                <p className="mt-1 font-heading text-lg font-extrabold leading-snug text-white">
                  {highestScoringMatch ? (
                    highestScoringMatch.matchId ? (
                      <Link href={`/matches/${highestScoringMatch.matchId}`} className="hover:underline">
                        {fmtResult(highestScoringMatch)}
                      </Link>
                    ) : fmtResult(highestScoringMatch)
                  ) : "—"}
                </p>
                {highestScoringMatch && (
                  <p className="text-xs text-faint mt-1">{highestScoringMatch.totalGoals} total goals</p>
                )}
              </div>
            </div>
            <div className="flex gap-4 rounded-xl border border-line bg-surface p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-2xl">
                📊
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <p className="font-heading text-xs font-bold uppercase tracking-widest text-faint">
                  Biggest Win
                </p>
                <p className="mt-1 font-heading text-lg font-extrabold leading-snug text-white">
                  {biggestWin ? (
                    biggestWin.matchId ? (
                      <Link href={`/matches/${biggestWin.matchId}`} className="hover:underline">
                        {fmtResult(biggestWin)}
                      </Link>
                    ) : fmtResult(biggestWin)
                  ) : "—"}
                </p>
                {biggestWin && (
                  <p className="text-xs text-faint mt-1">{biggestWin.margin}-goal margin</p>
                )}
              </div>
            </div>
            <div className="flex gap-4 rounded-xl border border-line bg-surface p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-2xl">
                🧤
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <p className="font-heading text-xs font-bold uppercase tracking-widest text-faint">
                  Clean Sheets
                </p>
                <p className="mt-1 font-heading text-lg font-extrabold leading-snug text-white">
                  {cleanSheets}
                </p>
                <p className="text-xs text-faint mt-1">across all {matchesPlayed} matches</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="rounded-xl border border-line bg-surface p-5 text-sm text-faint">
            Tournament records will update after completed matches are synced.
          </p>
        )}
      </section>


    </div>
  );
}
