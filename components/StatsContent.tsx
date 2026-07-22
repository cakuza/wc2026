"use client";

import Link from "next/link";
import { Flag } from "@/components/Flag";
import { StatsNav } from "./StatsNav";
import { countryName } from "@/lib/i18n";
import { matchSlug, MATCHES } from "@/lib/matches";
import { teamCodeForKey } from "@/lib/teams";
import type { PlayerEventLeaderboards, PlayerRankingRecord, TeamLeaderboard, TeamLeaderboards, TeamStatLeaderboards, TournamentStats } from "@/lib/tournamentStats";
import type { TournamentAward } from "@/lib/tournamentAwards";

type Props = {
  tournamentStats: TournamentStats;
  teamLeaderboards: TeamLeaderboards;
  topScorers: PlayerRankingRecord[];
  playerEventLeaderboards: PlayerEventLeaderboards;
  teamStatLeaderboards: TeamStatLeaderboards;
  hasEventData: boolean;
  awards?: TournamentAward[] | null;
};

function fullTimestamp(iso: string | null) {
  if (!iso) return "Last updated from the current tournament archive";
  const value = new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC", timeZoneName: "short",
  }).format(new Date(iso)).replace(",", "");
  return `Last updated ${value}`;
}

function TeamChip({ leader }: { leader: TeamLeaderboard }) {
  const code = teamCodeForKey(leader.teamKey);
  const name = countryName(leader.teamKey, "en");
  return (
    <Link href={`/teams/${leader.teamKey}`} className="inline-flex items-center gap-2 rounded-full border border-line bg-white/5 px-3 py-2 text-sm font-semibold text-white transition hover:border-accent/70 hover:bg-white/10">
      <Flag code={code} alt="" width={20} height={14} className="shrink-0" />{name}
    </Link>
  );
}

function PlayerLeader({ label, player, value, href, note }: { label: string; player: { playerName: string; teamKey: string | null; teamName: string | null }; value: number; href: string; note?: string }) {
  const teamName = player.teamKey ? countryName(player.teamKey, "en") : player.teamName || "";
  const code = player.teamKey ? teamCodeForKey(player.teamKey) : null;
  return (
    <Link href={href} className="block rounded-xl border border-line bg-surface p-4 transition hover:border-accent/70 sm:p-5">
      <p className="font-heading text-[10px] font-bold uppercase tracking-[0.18em] text-muted">{label}</p>
      <div className="mt-4 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/15 font-heading text-2xl font-black text-accent">{value}</div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">{code ? <Flag code={code} alt="" width={24} height={16} className="shrink-0" /> : null}<p className="truncate text-lg font-bold text-white">{player.playerName}</p></div>
          <p className="mt-1 text-sm text-muted">{teamName}{note ? ` · ${note}` : ""}</p>
        </div>
      </div>
      <span className="mt-4 inline-block font-heading text-[11px] font-bold uppercase tracking-widest text-accent">View full leaderboard →</span>
    </Link>
  );
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
}

export default function StatsContent({ tournamentStats, teamLeaderboards: _teamLeaderboards, topScorers, playerEventLeaderboards, teamStatLeaderboards, hasEventData, awards }: Props) {
  const { matchesPlayed, totalGoals, averageGoalsPerMatch, highestScoringMatch, biggestWin, cleanSheets, lastSyncedAt } = tournamentStats;
  const topScorer = hasEventData ? topScorers[0] : null;
  const assistLeader = hasEventData ? playerEventLeaderboards.assists[0] : null;
  const goalLeaders = teamStatLeaderboards.goalsScored.filter((leader) => leader.value === teamStatLeaderboards.goalsScored[0]?.value);
  const cleanSheetLeaders = teamStatLeaderboards.cleanSheets.filter((leader) => leader.value === teamStatLeaderboards.cleanSheets[0]?.value);
  const recordHref = (record: { homeKey: string; awayKey: string; matchId?: string }) => {
    if (record.matchId) {
      return `/matches/${record.matchId}`;
    }
    const match = MATCHES.find((candidate) => candidate.homeKey === record.homeKey && candidate.awayKey === record.awayKey);
    return match ? `/matches/${matchSlug(match)}` : "/stats/matches";
  };
  const result = (record: { homeKey: string; awayKey: string; homeScore: number; awayScore: number } | null) => record ? `${countryName(record.homeKey, "en")} ${record.homeScore}–${record.awayScore} ${countryName(record.awayKey, "en")}` : "No completed record";
  const glance = [
    { label: "Matches completed", value: `${matchesPlayed} / 104` },
    { label: "Total goals", value: String(totalGoals) },
    { label: "Goals per match", value: averageGoalsPerMatch.toFixed(1) },
    { label: "Clean sheets", value: String(cleanSheets) },
  ];

  const showGoalsCaption = goalLeaders.length > 0 && (
    (goalLeaders[0].matchesCovered ?? 0) > 0 &&
    goalLeaders.every((l) => l.matchesCovered === goalLeaders[0].matchesCovered && l.completedMatches === goalLeaders[0].completedMatches && l.coverageStatus === goalLeaders[0].coverageStatus)
  );

  const showCleanSheetsCaption = cleanSheetLeaders.length > 0 && (
    (cleanSheetLeaders[0].matchesCovered ?? 0) > 0 &&
    cleanSheetLeaders.every((l) => l.matchesCovered === cleanSheetLeaders[0].matchesCovered && l.completedMatches === cleanSheetLeaders[0].completedMatches && l.coverageStatus === cleanSheetLeaders[0].coverageStatus)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:py-9">
      <header className="mb-5 max-w-4xl">
        <p className="font-heading text-xs font-bold uppercase tracking-[0.28em] text-accent">2026 World Cup</p>
        <h1 className="mt-2 font-heading text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">2026 World Cup Statistics</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">Tournament totals, {matchesPlayed === 104 ? "Golden Boot winner" : "Golden Boot leaders"}, provider-recorded assists, team records, clean sheets and match records.</p>
        <p className="mt-3 text-xs font-semibold text-faint">{fullTimestamp(lastSyncedAt)}</p>
      </header>

      {/* Direct-Answer Summary Block */}
      <div className="mb-6 rounded-xl border border-accent/40 bg-accent/10 p-4 sm:p-5">
        <p className="text-sm font-medium leading-relaxed text-white sm:text-base">
          The 2026 World Cup produced <span className="font-extrabold text-accent">{totalGoals}</span> goals across <span className="font-extrabold text-white">{matchesPlayed}</span> matches. {topScorer ? <><span className="font-extrabold text-white">{topScorer.playerName}</span> won the Golden Boot with <span className="font-extrabold text-accent">{topScorer.goals}</span> goals, and the</> : "The"} tournament recorded <span className="font-extrabold text-white">{cleanSheets}</span> clean sheets.
        </p>
      </div>

      <StatsNav />

      <section aria-labelledby="tournament-glance" className="mb-7">
        <div className="mb-3 flex items-center gap-3"><h2 id="tournament-glance" className="font-heading text-base font-extrabold uppercase tracking-widest text-white">Tournament at a glance</h2><div className="h-px flex-1 bg-white/10" /></div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{glance.map((item) => <div key={item.label} className="rounded-xl border border-line bg-surface px-4 py-3"><p className="font-heading text-[10px] font-bold uppercase tracking-widest text-faint">{item.label}</p><p className="mt-1 font-heading text-2xl font-black text-white">{item.value}</p></div>)}</div>
      </section>

      {awards && awards.length > 0 ? (
        <section aria-labelledby="official-awards-heading" className="mb-7">
          <div className="mb-3 flex items-center gap-3">
            <h2 id="official-awards-heading" className="font-heading text-base font-extrabold uppercase tracking-widest text-white">Official Tournament Awards</h2>
            <div className="h-px flex-1 bg-white/10" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {awards.map((award) => {
              const code = teamCodeForKey(award.teamKey);
              return (
                <div key={award.awardId} className="rounded-xl border border-line bg-surface p-4">
                  <p className="font-heading text-[10px] font-bold uppercase tracking-widest text-faint">{award.displayName}</p>
                  <p className="mt-2 text-lg font-bold text-white">{award.winnerName}</p>
                  <div className="mt-1 flex items-center gap-2">
                    {code && <Flag code={code} alt="" width={16} height={11} className="shrink-0" />}
                    <span className="text-xs text-muted">{countryName(award.teamKey, "en")}</span>
                    {award.metric && <span className="text-xs text-faint">· {award.metric}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="player-leaders-heading">
          <div className="mb-3 flex items-center justify-between gap-3"><h2 id="player-leaders-heading" className="font-heading text-base font-extrabold uppercase tracking-widest text-white">Player leaders</h2><Link href="/stats/players" className="font-heading text-[11px] font-bold uppercase tracking-widest text-accent">View full leaderboard →</Link></div>
          <div className="grid gap-3 sm:grid-cols-2">
             {topScorer ? <PlayerLeader label={matchesPlayed === 104 ? "Golden Boot winner" : "Golden Boot leader"} player={topScorer} value={topScorer.goals} href="/stats/top-scorers" /> : <p className="rounded-xl border border-line p-4 text-sm text-faint">Scorer data unavailable.</p>}
            {assistLeader ? <PlayerLeader label="Most assists" player={assistLeader} value={assistLeader.value} href="/stats/players" note="provider-recorded assists" /> : <p className="rounded-xl border border-line p-4 text-sm text-faint">Assist data unavailable.</p>}
          </div>
        </section>
        <section aria-labelledby="team-leaders-heading">
          <div className="mb-3 flex items-center justify-between gap-3"><h2 id="team-leaders-heading" className="font-heading text-base font-extrabold uppercase tracking-widest text-white">Team leaders</h2><Link href="/stats/teams" className="font-heading text-[11px] font-bold uppercase tracking-widest text-accent">View full leaderboard →</Link></div>
          <div className="space-y-3">
            <div className="rounded-xl border border-line bg-surface p-4">
              <p className="font-heading text-[10px] font-bold uppercase tracking-widest text-faint">
                {goalLeaders.length > 1 ? "Joint leaders" : "Leader"} · {goalLeaders[0]?.value ?? 0} goals
              </p>
              <div className="mt-2 text-lg font-bold text-white">
                {joinNames(goalLeaders.map(l => countryName(l.teamKey, "en")))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {goalLeaders.map((leader) => <TeamChip key={leader.teamKey} leader={leader} />)}
              </div>
              {showGoalsCaption && (
                <p className="mt-2 text-xs text-faint">
                  {goalLeaders[0].coverageStatus === "PARTIAL" ? (
                    <>
                      <span className="text-yellow-500/80 mr-1">PARTIAL:</span>
                      {goalLeaders[0].matchesCovered} of {goalLeaders[0].completedMatches} matches
                    </>
                  ) : (
                    `in ${goalLeaders[0].matchesCovered} matches`
                  )}
                </p>
              )}
            </div>
            <div className="rounded-xl border border-line bg-surface p-4">
              <p className="font-heading text-[10px] font-bold uppercase tracking-widest text-faint">
                {cleanSheetLeaders.length > 1 ? "Joint leaders" : "Leader"} · {cleanSheetLeaders[0]?.value ?? 0} clean sheets
              </p>
              <div className="mt-2 text-lg font-bold text-white">
                {joinNames(cleanSheetLeaders.map(l => countryName(l.teamKey, "en")))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {cleanSheetLeaders.map((leader) => <TeamChip key={leader.teamKey} leader={leader} />)}
              </div>
              {showCleanSheetsCaption && (
                <p className="mt-2 text-xs text-faint">
                  {cleanSheetLeaders[0].coverageStatus === "PARTIAL" ? (
                    <>
                      <span className="text-yellow-500/80 mr-1">PARTIAL:</span>
                      {cleanSheetLeaders[0].matchesCovered} of {cleanSheetLeaders[0].completedMatches} matches
                    </>
                  ) : (
                    `in ${cleanSheetLeaders[0].matchesCovered} matches`
                  )}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      <section aria-labelledby="match-records-heading" className="mt-7">
        <div className="mb-3 flex items-center justify-between gap-3"><h2 id="match-records-heading" className="font-heading text-base font-extrabold uppercase tracking-widest text-white">Match records</h2><Link href="/stats/matches" className="font-heading text-[11px] font-bold uppercase tracking-widest text-accent">View all records →</Link></div>
        <div className="grid gap-3 sm:grid-cols-2"><Link href={highestScoringMatch ? recordHref(highestScoringMatch) : "/stats/matches"} className="rounded-xl border border-line bg-surface p-4 transition hover:border-accent/70"><p className="font-heading text-[10px] font-bold uppercase tracking-widest text-faint">Highest-scoring match</p><p className="mt-2 font-semibold text-white">{result(highestScoringMatch)}</p></Link><Link href={biggestWin ? recordHref(biggestWin) : "/stats/matches"} className="rounded-xl border border-line bg-surface p-4 transition hover:border-accent/70"><p className="font-heading text-[10px] font-bold uppercase tracking-widest text-faint">Biggest win</p><p className="mt-2 font-semibold text-white">{result(biggestWin)}</p></Link></div>
      </section>
    </div>
  );
}
