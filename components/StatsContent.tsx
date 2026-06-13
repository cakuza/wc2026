"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import type { TournamentStats, TeamLeaderboards, PlayerGoalStat } from "@/lib/tournamentStats";
import type { StandingRow } from "@/lib/groupStandings";

interface Props {
  tournamentStats: TournamentStats;
  teamLeaderboards: TeamLeaderboards;
  standings: Record<string, StandingRow[]>;
  topScorers: PlayerGoalStat[];
  hasEventData: boolean;
}

export default function StatsContent({ tournamentStats, teamLeaderboards, standings, topScorers, hasEventData }: Props) {
  const { t, country } = useLang();

  const ALL_TIME_RECORDS = [
    { key: "stats_most_titles",      value: "5",                                    detail: country("brazil"),             sub: "1958, 1962, 1970, 1994, 2002",  icon: "🏆" },
    { key: "stats_top_scorer",       value: `16 ${t("stats_unit_goals")}`,          detail: "Miroslav Klose",              sub: t("stats_detail_klose"),          icon: "⚽" },
    { key: "stats_fastest_goal",     value: `11 ${t("stats_unit_sec")}`,            detail: "Hakan Şükür",                 sub: t("stats_detail_sukur"),          icon: "⚡" },
    { key: "stats_most_appearances", value: `26 ${t("stats_unit_matches")}`,        detail: "Lionel Messi",                sub: t("stats_detail_messi"),          icon: "👤" },
    { key: "stats_biggest_win",      value: "10–1",                                 detail: t("stats_detail_biggest_win"), sub: t("stats_sub_biggest_win"),       icon: "📊" },
    { key: "stats_most_finals",      value: "8",                                    detail: t("stats_detail_most_finals"), sub: t("stats_sub_most_finals"),       icon: "🥈" },
    { key: "stats_youngest_scorer",  value: `17 ${t("stats_unit_years")}`,          detail: "Pelé",                        sub: t("stats_detail_pele"),           icon: "🌟" },
    { key: "stats_host_nations",     value: "6",                                    detail: t("stats_detail_hosts_1"),     sub: t("stats_sub_hosts"),             icon: "🏟️" },
    { key: "stats_format",           value: `48 ${t("stats_unit_teams")}`,          detail: t("stats_detail_format"),      sub: t("stats_sub_format"),            icon: "🆕" },
  ];

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

  const hasTeamData = teamLeaderboards.mostPoints.length > 0;
  const groupStats = Object.entries(standings)
    .map(([group, rows]) => {
      const played = rows.reduce((sum, row) => sum + row.played, 0) / 2;
      const goals = rows.reduce((sum, row) => sum + row.goalsFor, 0);
      const topRank = rows.find((row) => row.played > 0)?.rank;
      const leaders = topRank ? rows.filter((row) => row.rank === topRank && row.played > 0) : [];
      return { group, played, goals, leaders };
    })
    .filter((row) => row.played > 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* ── Page header ── */}
      <div className="mb-8">
        <p className="font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">
          World Cup 2026
        </p>
        <h1 className="mt-1 font-heading text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">
          {t("stats_page_title")}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-white/50">{t("stats_intro")}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          {[
            { href: "/schedule", label: "Schedule" },
            { href: "/groups", label: "Groups" },
            { href: "/world-cup-third-place-qualification", label: "Third-place ranking" },
            { href: "/today", label: "Today" },
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
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION A — 2026 Tournament Stats
      ══════════════════════════════════════════════════════════════════ */}
      <section className="mb-12">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-heading text-lg font-extrabold uppercase tracking-widest text-white">
            2026 Tournament Snapshot
          </h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {hasData && liveStats ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {liveStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex gap-4 rounded-xl border border-white/10 bg-navyCard p-5"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-2xl">
                    {stat.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-heading text-xs font-bold uppercase tracking-widest text-white/50">
                      {stat.label}
                    </p>
                    <p className="mt-1 font-heading text-lg font-extrabold leading-snug text-white">
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {lastSyncedAt && (
              <p className="mt-3 font-heading text-[11px] font-bold uppercase tracking-widest text-white/30">
                Last synced {fmtSynced(lastSyncedAt)}
              </p>
            )}
          </>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "Matches Played", icon: "🏟️" },
                { label: "Total Goals",    icon: "⚽" },
                { label: "Avg Goals / Match", icon: "📈" },
                { label: "Clean Sheets",     icon: "🧤" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="relative overflow-hidden rounded-xl border border-white/10 bg-navyCard p-5"
                >
                  <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/8 px-2.5 py-1 font-heading text-[10px] font-extrabold uppercase tracking-widest text-white/40">
                    <span className="text-[10px] leading-none">🗓</span>
                    {t("stats_available_from")}
                  </span>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-2xl opacity-30">{stat.icon}</span>
                    <p className="font-heading text-sm font-bold uppercase tracking-wide text-white/30">
                      {stat.label}
                    </p>
                  </div>
                  <div className="mt-4 space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded bg-white/5 px-3 py-2"
                      >
                        <div className="h-2.5 w-24 rounded bg-white/10" />
                        <div className="h-2.5 w-8 rounded bg-white/10" />
                      </div>
                    ))}
                  </div>
                  <div
                    className="pointer-events-none absolute inset-0 rounded-xl"
                    style={{
                      background:
                        "repeating-linear-gradient(135deg,transparent,transparent 8px,rgba(255,255,255,0.015) 8px,rgba(255,255,255,0.015) 9px)",
                    }}
                  />
                </div>
              ))}
            </div>

            <p className="mt-4 font-heading text-xs font-bold uppercase tracking-widest text-white/30">
              2026 tournament totals update after completed matches are synced.
            </p>
          </>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION B — 2026 Team Stats
      ══════════════════════════════════════════════════════════════════ */}
      {hasTeamData && (
        <section className="mb-12">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="font-heading text-lg font-extrabold uppercase tracking-widest text-white">
              2026 Team Stats
            </h2>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {/* Most Points */}
            <div className="rounded-xl border border-white/10 bg-navyCard overflow-hidden">
              <div className="border-b border-white/10 bg-navy/50 px-4 py-3">
                <p className="font-heading text-xs font-extrabold uppercase tracking-widest text-white/60">
                  Most Points
                </p>
              </div>
              <ul className="divide-y divide-white/5">
                {teamLeaderboards.mostPoints.map((row, i) => (
                  <li key={row.teamKey} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="w-5 shrink-0 font-heading text-xs font-bold text-white/30">
                      {i + 1}
                    </span>
                    <span className="flex-1 truncate font-semibold text-white text-sm">
                      {country(row.teamKey)}
                    </span>
                    <span className="font-heading text-sm font-extrabold tabular-nums text-accent">
                      {row.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Most Goals */}
            <div className="rounded-xl border border-white/10 bg-navyCard overflow-hidden">
              <div className="border-b border-white/10 bg-navy/50 px-4 py-3">
                <p className="font-heading text-xs font-extrabold uppercase tracking-widest text-white/60">
                  Most Goals Scored
                </p>
              </div>
              <ul className="divide-y divide-white/5">
                {teamLeaderboards.topScoringTeams.map((row, i) => (
                  <li key={row.teamKey} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="w-5 shrink-0 font-heading text-xs font-bold text-white/30">
                      {i + 1}
                    </span>
                    <span className="flex-1 truncate font-semibold text-white text-sm">
                      {country(row.teamKey)}
                    </span>
                    <span className="font-heading text-sm font-extrabold tabular-nums text-white">
                      {row.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Most Wins */}
            <div className="rounded-xl border border-white/10 bg-navyCard overflow-hidden">
              <div className="border-b border-white/10 bg-navy/50 px-4 py-3">
                <p className="font-heading text-xs font-extrabold uppercase tracking-widest text-white/60">
                  Most Wins
                </p>
              </div>
              <ul className="divide-y divide-white/5">
                {teamLeaderboards.mostWins.map((row, i) => (
                  <li key={row.teamKey} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="w-5 shrink-0 font-heading text-xs font-bold text-white/30">
                      {i + 1}
                    </span>
                    <span className="flex-1 truncate font-semibold text-white text-sm">
                      {country(row.teamKey)}
                    </span>
                    <span className="font-heading text-sm font-extrabold tabular-nums text-white">
                      {row.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          SECTION C — 2026 Player Stats
      ══════════════════════════════════════════════════════════════════ */}
      <section className="mb-12">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-heading text-lg font-extrabold uppercase tracking-widest text-white">
            2026 Player Stats
          </h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {hasEventData && topScorers.length > 0 ? (
          <div className="rounded-xl border border-white/10 bg-navyCard overflow-hidden">
            <div className="border-b border-white/10 bg-navy/50 px-4 py-3">
              <p className="font-heading text-xs font-extrabold uppercase tracking-widest text-white/60">
                Top Scorers
              </p>
            </div>
            <ul className="divide-y divide-white/5">
              {topScorers.map((scorer, i) => (
                <li key={scorer.playerName} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-5 shrink-0 font-heading text-xs font-bold text-white/30">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold text-white text-sm">{scorer.playerName}</p>
                    {scorer.teamName && (
                      <p className="text-xs text-white/40">{scorer.teamName}</p>
                    )}
                  </div>
                  <span className="font-heading text-sm font-extrabold tabular-nums text-accent">
                    {scorer.goals} {scorer.goals === 1 ? t("stats_unit_goals").replace(/s$/, "") : t("stats_unit_goals")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-navyCard p-6 text-center">
            <p className="font-heading text-xs font-bold uppercase tracking-widest text-white/30">
              Player stats will appear when goal scorer data is available from the match sync.
            </p>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION D — 2026 Match Records
      ══════════════════════════════════════════════════════════════════ */}
      <section className="mb-12">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-heading text-lg font-extrabold uppercase tracking-widest text-white">
            2026 Match Records
          </h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {hasData ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex gap-4 rounded-xl border border-white/10 bg-navyCard p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-2xl">
                🔥
              </div>
              <div className="min-w-0">
                <p className="font-heading text-xs font-bold uppercase tracking-widest text-white/50">
                  Highest Scoring Match
                </p>
                <p className="mt-1 font-heading text-lg font-extrabold leading-snug text-white">
                  {highestScoringMatch ? fmtResult(highestScoringMatch) : "—"}
                </p>
              </div>
            </div>
            <div className="flex gap-4 rounded-xl border border-white/10 bg-navyCard p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-2xl">
                📊
              </div>
              <div className="min-w-0">
                <p className="font-heading text-xs font-bold uppercase tracking-widest text-white/50">
                  Biggest Win
                </p>
                <p className="mt-1 font-heading text-lg font-extrabold leading-snug text-white">
                  {biggestWin ? fmtResult(biggestWin) : "—"}
                </p>
              </div>
            </div>
            <div className="flex gap-4 rounded-xl border border-white/10 bg-navyCard p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-2xl">
                🧤
              </div>
              <div className="min-w-0">
                <p className="font-heading text-xs font-bold uppercase tracking-widest text-white/50">
                  Clean Sheets
                </p>
                <p className="mt-1 font-heading text-lg font-extrabold leading-snug text-white">
                  {cleanSheets}
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

      {/* ══════════════════════════════════════════════════════════════════
          SECTION E — 2026 Group Stats
      ══════════════════════════════════════════════════════════════════ */}
      <section className="mb-12">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-heading text-lg font-extrabold uppercase tracking-widest text-white">
            2026 Group Stats
          </h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {groupStats.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groupStats.map((group) => (
              <div key={group.group} className="rounded-xl border border-white/10 bg-navyCard p-5">
                <p className="font-heading text-xs font-bold uppercase tracking-widest text-white/50">
                  Group {group.group}
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="font-heading text-lg font-extrabold text-white">{group.played}</p>
                    <p className="font-heading text-[10px] font-bold uppercase tracking-widest text-white/35">
                      Matches
                    </p>
                  </div>
                  <div>
                    <p className="font-heading text-lg font-extrabold text-white">{group.goals}</p>
                    <p className="font-heading text-[10px] font-bold uppercase tracking-widest text-white/35">
                      Goals
                    </p>
                  </div>
                  <div>
                    <p className="truncate font-heading text-lg font-extrabold text-white">
                      {group.leaders.length > 1
                        ? group.leaders.map((row) => country(row.teamKey)).join(", ")
                        : group.leaders[0] ? country(group.leaders[0].teamKey) : "—"}
                    </p>
                    <p className="font-heading text-[10px] font-bold uppercase tracking-widest text-white/35">
                      {group.leaders.length > 1 ? "Provisional leaders" : "Leader"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-white/10 bg-navyCard p-5 text-sm text-white/50">
            Group stats update from completed synced group matches.
          </p>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION F — World Cup All-Time Records
      ══════════════════════════════════════════════════════════════════ */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-heading text-lg font-extrabold uppercase tracking-widest text-white">
            {t("stats_all_time_header")}
          </h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_TIME_RECORDS.map((rec) => (
            <div
              key={rec.key}
              className="flex gap-4 rounded-xl border border-white/10 bg-navyCard p-5"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-2xl">
                {rec.icon}
              </div>
              <div className="min-w-0">
                <p className="font-heading text-xs font-bold uppercase tracking-widest text-white/50">
                  {t(rec.key)}
                </p>
                <p className="mt-0.5 font-heading text-2xl font-extrabold leading-none text-accent">
                  {rec.value}
                </p>
                <p className="mt-1 font-heading text-sm font-bold text-white">
                  {rec.detail}
                </p>
                <p className="mt-0.5 font-heading text-xs text-white/50">
                  {rec.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
