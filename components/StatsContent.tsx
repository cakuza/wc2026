"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import type { TournamentStats, TeamLeaderboards, PlayerGoalStat, PlayerEventLeaderboards, TeamStatLeaderboards } from "@/lib/tournamentStats";
import { StatsNav } from "./StatsNav";
import { countryName } from "@/lib/i18n";

interface Props {
  tournamentStats: TournamentStats;
  teamLeaderboards: TeamLeaderboards;
  topScorers: PlayerGoalStat[];
  playerEventLeaderboards: PlayerEventLeaderboards;
  teamStatLeaderboards: TeamStatLeaderboards;
  hasEventData: boolean;
}

export default function StatsContent({ tournamentStats, teamLeaderboards, topScorers, playerEventLeaderboards, teamStatLeaderboards, hasEventData }: Props) {
  const { t, country } = useLang();

  const { matchesPlayed, totalGoals, averageGoalsPerMatch,
          highestScoringMatch, biggestWin, cleanSheets, lastSyncedAt } = tournamentStats;

  const hasData = matchesPlayed > 0;

  function fmtResult(r: { homeKey: string; awayKey: string; homeScore: number; awayScore: number }) {
    return `${country(r.homeKey)} ${r.homeScore}–${r.awayScore} ${country(r.awayKey)}`;
  }

  function fmtSynced(iso: string): string {
    const d = new Date(iso);
    const hh = String(d.getUTCHours()).padStart(2, "0");
    const mm = String(d.getUTCMinutes()).padStart(2, "0");
    return `${hh}:${mm} UTC`;
  }

  const liveStats = hasData
    ? [
        { label: "Matches Played",    value: String(matchesPlayed),                             icon: "🏟️" },
        { label: "Total Goals",       value: String(totalGoals),                                icon: "⚽" },
        { label: "Avg Goals / Match", value: averageGoalsPerMatch.toFixed(1),                   icon: "📈" },
        { label: "Clean Sheets",      value: String(cleanSheets),                               icon: "🧤" },
      ]
    : null;

  const hasTeamData = teamLeaderboards.groupStagePoints.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6">
        <p className="font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">
          World Cup 2026
        </p>
        <h1 className="mt-1 font-heading text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">
          {t("stats_page_title")}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-white/50">{t("stats_intro")}</p>
      </div>

      <StatsNav />

      {/* SECTION A — Tournament Snapshot */}
      <section className="mb-12">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-heading text-lg font-extrabold uppercase tracking-widest text-white">
            Tournament Snapshot
          </h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {hasData && liveStats ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {liveStats.map((stat) => (
                <div key={stat.label} className="flex gap-4 rounded-xl border border-white/10 bg-navyCard p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-2xl">
                    {stat.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-heading text-[10px] font-bold uppercase tracking-widest text-white/50">
                      {stat.label}
                    </p>
                    <p className="mt-1 font-heading text-xl font-extrabold leading-snug text-white">
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {lastSyncedAt && (
              <p className="mt-3 font-heading text-[10px] font-bold uppercase tracking-widest text-white/30 text-right">
                Last synced {fmtSynced(lastSyncedAt)}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-white/50">Match data will appear here once the tournament begins.</p>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-2 mb-12">
        {/* SECTION B — Player Leaders Preview */}
        <section>
          <div className="mb-4 flex items-center gap-3">
            <h2 className="font-heading text-lg font-extrabold uppercase tracking-widest text-white">
              Player Leaders
            </h2>
            <div className="h-px flex-1 bg-white/10" />
            <Link href="/stats/players" className="shrink-0 font-heading text-[10px] font-bold uppercase tracking-widest text-accent hover:text-white transition">
              View All →
            </Link>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-navyCard overflow-hidden">
              <div className="border-b border-white/10 bg-navy/50 px-4 py-2">
                <p className="font-heading text-[10px] font-extrabold uppercase tracking-widest text-white/60">
                  Golden Boot Leader
                </p>
              </div>
              {hasEventData && topScorers.length > 0 ? (
                <div className="p-4 flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent font-heading text-2xl font-black">
                    {topScorers[0].goals}
                  </div>
                  <div>
                    <p className="font-bold text-white">{topScorers[0].playerName}</p>
                    <p className="text-sm text-white/50">{topScorers[0].teamName ? country(topScorers[0].teamName) : ""}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-xs text-white/40">Data unavailable</div>
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-navyCard overflow-hidden">
              <div className="border-b border-white/10 bg-navy/50 px-4 py-2">
                <p className="font-heading text-[10px] font-extrabold uppercase tracking-widest text-white/60">
                  Most Assists
                </p>
              </div>
              {hasEventData && playerEventLeaderboards.assists.length > 0 ? (
                <div className="p-4 flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/10 text-white font-heading text-2xl font-black">
                    {playerEventLeaderboards.assists[0].value}
                  </div>
                  <div>
                    <p className="font-bold text-white">{playerEventLeaderboards.assists[0].playerName}</p>
                    <p className="text-sm text-white/50">{playerEventLeaderboards.assists[0].teamName ? country(playerEventLeaderboards.assists[0].teamName) : ""}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-xs text-white/40">Data unavailable</div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION C — Team Leaders Preview */}
        <section>
          <div className="mb-4 flex items-center gap-3">
            <h2 className="font-heading text-lg font-extrabold uppercase tracking-widest text-white">
              Team Leaders
            </h2>
            <div className="h-px flex-1 bg-white/10" />
            <Link href="/stats/teams" className="shrink-0 font-heading text-[10px] font-bold uppercase tracking-widest text-accent hover:text-white transition">
              View All →
            </Link>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-navyCard overflow-hidden">
              <div className="border-b border-white/10 bg-navy/50 px-4 py-2">
                <p className="font-heading text-[10px] font-extrabold uppercase tracking-widest text-white/60">
                  Most Goals Scored
                </p>
              </div>
              {hasTeamData && teamLeaderboards.topScoringTeams.length > 0 ? (
                <div className="p-4 flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent font-heading text-2xl font-black">
                    {teamLeaderboards.topScoringTeams[0].value}
                  </div>
                  <div>
                    <p className="font-bold text-white">{countryName(teamLeaderboards.topScoringTeams[0].teamKey, "en")}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-xs text-white/40">Data unavailable</div>
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-navyCard overflow-hidden">
              <div className="border-b border-white/10 bg-navy/50 px-4 py-2">
                <p className="font-heading text-[10px] font-extrabold uppercase tracking-widest text-white/60">
                  Most Clean Sheets
                </p>
              </div>
              {hasTeamData && teamStatLeaderboards.cleanSheets.length > 0 ? (
                <div className="p-4 flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white font-heading text-2xl font-black">
                    {teamStatLeaderboards.cleanSheets[0].value}
                  </div>
                  <div>
                    <p className="font-bold text-white">{countryName(teamStatLeaderboards.cleanSheets[0].teamKey, "en")}</p>
                    {teamStatLeaderboards.cleanSheets[0].matchesCovered && (
                      <p className="text-xs text-white/50">in {teamStatLeaderboards.cleanSheets[0].matchesCovered} matches</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 text-xs text-white/40">Data unavailable</div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* SECTION D — Match Records Preview */}
      <section className="mb-12">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-heading text-lg font-extrabold uppercase tracking-widest text-white">
            Match Records
          </h2>
          <div className="h-px flex-1 bg-white/10" />
          <Link href="/stats/matches" className="shrink-0 font-heading text-[10px] font-bold uppercase tracking-widest text-accent hover:text-white transition">
            All Records →
          </Link>
        </div>

        {hasData ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex gap-4 rounded-xl border border-white/10 bg-navyCard p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-2xl">
                🔥
              </div>
              <div className="min-w-0">
                <p className="font-heading text-[10px] font-bold uppercase tracking-widest text-white/50">
                  Highest Scoring Match
                </p>
                <p className="mt-1 font-heading text-xl font-extrabold leading-snug text-white truncate">
                  {highestScoringMatch ? fmtResult(highestScoringMatch) : "—"}
                </p>
              </div>
            </div>
            <div className="flex gap-4 rounded-xl border border-white/10 bg-navyCard p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-2xl">
                📊
              </div>
              <div className="min-w-0">
                <p className="font-heading text-[10px] font-bold uppercase tracking-widest text-white/50">
                  Biggest Win
                </p>
                <p className="mt-1 font-heading text-xl font-extrabold leading-snug text-white truncate">
                  {biggestWin ? fmtResult(biggestWin) : "—"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="rounded-xl border border-white/10 bg-navyCard p-5 text-sm text-white/50">
            Match records update after completed matches are synced.
          </p>
        )}
      </section>

      <section>
        <div className="rounded-xl border border-white/10 bg-navyCard p-6 text-center">
          <p className="font-heading text-sm font-bold uppercase tracking-widest text-white/50 mb-2">
            Detailed Standings
          </p>
          <Link href="/groups" className="inline-block rounded-full bg-accent px-6 py-2.5 font-heading text-xs font-bold uppercase tracking-widest text-navy transition hover:bg-white">
            View All Groups
          </Link>
        </div>
      </section>

      {/* SECTION E — Methodology & Coverage */}
      <section className="mt-12 rounded-xl border border-white/10 bg-navyCard/50 p-6 text-sm text-white/60">
        <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-white mb-3">Data Coverage & Methodology</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <ul className="space-y-1">
              <li>• <strong className="text-white">Completed Matches:</strong> {tournamentStats.matchesPlayed} / 104</li>
              <li>• <strong className="text-white">Player Event Coverage:</strong> {tournamentStats.matchesPlayed} matches</li>
              <li>• <strong className="text-white">Team Stat Coverage:</strong> {tournamentStats.matchesPlayed} matches</li>
            </ul>
          </div>
          <div>
            <p className="mb-1"><strong>Known Limitations:</strong></p>
            <ul className="space-y-1 text-xs">
              <li>• No xG or algorithmic ratings.</li>
              <li>• Incomplete metrics are omitted rather than fabricated.</li>
              <li>• Assists may rely on source-single archive data.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
