"use client";

import Link from "next/link";
import { Flag } from "@/components/Flag";
import { StatsNav } from "./StatsNav";
import { countryName } from "@/lib/i18n";
import { matchSlug, MATCHES } from "@/lib/matches";
import { teamCodeForKey } from "@/lib/teams";
import type { PlayerEventLeaderboards, PlayerRankingRecord, TeamLeaderboard, TeamLeaderboards, TeamStatLeaderboards, TournamentStats } from "@/lib/tournamentStats";

type Props = {
  tournamentStats: TournamentStats;
  teamLeaderboards: TeamLeaderboards;
  topScorers: PlayerRankingRecord[];
  playerEventLeaderboards: PlayerEventLeaderboards;
  teamStatLeaderboards: TeamStatLeaderboards;
  hasEventData: boolean;
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
    <Link href={`/teams/${leader.teamKey}`} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition hover:border-accent/70 hover:bg-white/10">
      <Flag code={code} alt="" width={20} height={14} className="shrink-0" />{name}
    </Link>
  );
}

function PlayerLeader({ label, player, value, href, note }: { label: string; player: { playerName: string; teamKey: string | null; teamName: string | null }; value: number; href: string; note?: string }) {
  const teamName = player.teamKey ? countryName(player.teamKey, "en") : player.teamName || "";
  const code = player.teamKey ? teamCodeForKey(player.teamKey) : null;
  return (
    <Link href={href} className="block rounded-xl border border-white/10 bg-navyCard p-4 transition hover:border-accent/70 sm:p-5">
      <p className="font-heading text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">{label}</p>
      <div className="mt-4 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/15 font-heading text-2xl font-black text-accent">{value}</div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">{code ? <Flag code={code} alt="" width={24} height={16} className="shrink-0" /> : null}<p className="truncate text-lg font-bold text-white">{player.playerName}</p></div>
          <p className="mt-1 text-sm text-white/60">{teamName}{note ? ` · ${note}` : ""}</p>
        </div>
      </div>
      <span className="mt-4 inline-block font-heading text-[11px] font-bold uppercase tracking-widest text-accent">View full leaderboard →</span>
    </Link>
  );
}

export default function StatsContent({ tournamentStats, teamLeaderboards: _teamLeaderboards, topScorers, playerEventLeaderboards, teamStatLeaderboards, hasEventData }: Props) {
  const { matchesPlayed, totalGoals, averageGoalsPerMatch, highestScoringMatch, biggestWin, cleanSheets, lastSyncedAt } = tournamentStats;
  const topScorer = hasEventData ? topScorers[0] : null;
  const assistLeader = hasEventData ? playerEventLeaderboards.assists[0] : null;
  const goalLeaders = teamStatLeaderboards.goalsScored.filter((leader) => leader.value === teamStatLeaderboards.goalsScored[0]?.value);
  const cleanSheetLeaders = teamStatLeaderboards.cleanSheets.filter((leader) => leader.value === teamStatLeaderboards.cleanSheets[0]?.value);
  const recordHref = (record: { homeKey: string; awayKey: string }) => {
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:py-9">
      <header className="mb-5 max-w-4xl">
        <p className="font-heading text-xs font-bold uppercase tracking-[0.28em] text-accent">2026 World Cup</p>
        <h1 className="mt-2 font-heading text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">2026 World Cup Statistics</h1>
        <p className="mt-2 text-sm leading-relaxed text-white/60">Tournament totals, Golden Boot leaders, provider-recorded assists, team records, clean sheets and match records.</p>
        <p className="mt-3 text-xs font-semibold text-white/45">{fullTimestamp(lastSyncedAt)}</p>
      </header>
      <StatsNav />

      <section aria-labelledby="tournament-glance" className="mb-7">
        <div className="mb-3 flex items-center gap-3"><h2 id="tournament-glance" className="font-heading text-base font-extrabold uppercase tracking-widest text-white">Tournament at a glance</h2><div className="h-px flex-1 bg-white/10" /></div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{glance.map((item) => <div key={item.label} className="rounded-xl border border-white/10 bg-navyCard px-4 py-3"><p className="font-heading text-[10px] font-bold uppercase tracking-widest text-white/50">{item.label}</p><p className="mt-1 font-heading text-2xl font-black text-white">{item.value}</p></div>)}</div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="player-leaders-heading">
          <div className="mb-3 flex items-center justify-between gap-3"><h2 id="player-leaders-heading" className="font-heading text-base font-extrabold uppercase tracking-widest text-white">Player leaders</h2><Link href="/stats/players" className="font-heading text-[11px] font-bold uppercase tracking-widest text-accent">View full leaderboard →</Link></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {topScorer ? <PlayerLeader label="Golden Boot leader" player={topScorer} value={topScorer.goals} href="/stats/top-scorers" /> : <p className="rounded-xl border border-white/10 p-4 text-sm text-white/50">Scorer data unavailable.</p>}
            {assistLeader ? <PlayerLeader label="Most assists" player={assistLeader} value={assistLeader.value} href="/stats/players" note="provider-recorded assists" /> : <p className="rounded-xl border border-white/10 p-4 text-sm text-white/50">Assist data unavailable.</p>}
          </div>
        </section>
        <section aria-labelledby="team-leaders-heading">
          <div className="mb-3 flex items-center justify-between gap-3"><h2 id="team-leaders-heading" className="font-heading text-base font-extrabold uppercase tracking-widest text-white">Team leaders</h2><Link href="/stats/teams" className="font-heading text-[11px] font-bold uppercase tracking-widest text-accent">View full leaderboard →</Link></div>
          <div className="space-y-3">
            <div className="rounded-xl border border-white/10 bg-navyCard p-4"><p className="font-heading text-[10px] font-bold uppercase tracking-widest text-white/50">Joint leaders · {goalLeaders[0]?.value ?? 0} goals</p><div className="mt-3 flex flex-wrap gap-2">{goalLeaders.map((leader) => <TeamChip key={leader.teamKey} leader={leader} />)}</div></div>
            <div className="rounded-xl border border-white/10 bg-navyCard p-4"><p className="font-heading text-[10px] font-bold uppercase tracking-widest text-white/50">Joint leaders · {cleanSheetLeaders[0]?.value ?? 0} clean sheets</p><div className="mt-3 flex flex-wrap gap-2">{cleanSheetLeaders.map((leader) => <TeamChip key={leader.teamKey} leader={leader} />)}</div></div>
          </div>
        </section>
      </div>

      <section aria-labelledby="match-records-heading" className="mt-7">
        <div className="mb-3 flex items-center justify-between gap-3"><h2 id="match-records-heading" className="font-heading text-base font-extrabold uppercase tracking-widest text-white">Match records</h2><Link href="/stats/matches" className="font-heading text-[11px] font-bold uppercase tracking-widest text-accent">View all records →</Link></div>
        <div className="grid gap-3 sm:grid-cols-2"><Link href={highestScoringMatch ? recordHref(highestScoringMatch) : "/stats/matches"} className="rounded-xl border border-white/10 bg-navyCard p-4 transition hover:border-accent/70"><p className="font-heading text-[10px] font-bold uppercase tracking-widest text-white/50">Highest-scoring match</p><p className="mt-2 font-semibold text-white">{result(highestScoringMatch)}</p></Link><Link href={biggestWin ? recordHref(biggestWin) : "/stats/matches"} className="rounded-xl border border-white/10 bg-navyCard p-4 transition hover:border-accent/70"><p className="font-heading text-[10px] font-bold uppercase tracking-widest text-white/50">Biggest win</p><p className="mt-2 font-semibold text-white">{result(biggestWin)}</p></Link></div>
      </section>
    </div>
  );
}
