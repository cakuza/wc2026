import type { Metadata } from "next";
import Link from "next/link";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { StatsNav } from "@/components/StatsNav";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { countryName } from "@/lib/i18n";
import { LiveDataUnavailableNotice } from "@/components/LiveDataUnavailableNotice";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "World Cup 2026 Player Stats - Goals, Assists, Cards",
  description: "Comprehensive player statistics for the 2026 World Cup including top scorers, assists, yellow cards, red cards, and more.",
  alternates: { canonical: "https://www.worldcupmatchday.com/stats/players" },
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Stats", href: "/stats" },
  { label: "Players" },
];

export default async function PlayersStatsPage() {
  const snapshot = await getTournamentLiveSnapshot();
  const { playerEventLeaderboards, topScorers } = snapshot;
  
  const hasEventData = topScorers.length > 0;

  const lists = [
    { title: "Goals (Golden Boot)", data: topScorers.slice(0, 50).map(s => ({ ...s, value: s.goals })), link: "/stats/top-scorers" },
    { title: "Assists", data: playerEventLeaderboards.assists },
    { title: "Yellow Cards", data: playerEventLeaderboards.yellowCards },
    { title: "Red Cards", data: playerEventLeaderboards.redCards },
    { title: "Penalty Goals", data: playerEventLeaderboards.penaltyGoals },
    { title: "Own Goals", data: playerEventLeaderboards.ownGoals },
    { title: "Shootout Scored", data: playerEventLeaderboards.shootoutScored },
    { title: "Shootout Missed", data: playerEventLeaderboards.shootoutMissed },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <BreadcrumbNav items={breadcrumbs} />

      <div className="mb-6 mt-4">
        <p className="font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">
          World Cup 2026
        </p>
        <h1 className="mt-1 font-heading text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">
          Player Stats
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-white/50">
          Comprehensive player statistics across the tournament.
        </p>
      </div>

      <StatsNav />

      {snapshot.isFallback ? (
        <div className="mb-8 max-w-5xl">
          <LiveDataUnavailableNotice show />
        </div>
      ) : null}

      {!snapshot.tournamentStats.scorerTotalsComplete && (
        <div className="mb-8 rounded-lg bg-white/5 px-4 py-3 border border-white/10 max-w-5xl">
          <p className="text-sm text-white/70">
            Some player details are still being verified. Totals include confirmed events only.
          </p>
        </div>
      )}

      {hasEventData ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <div key={list.title} className="rounded-xl border border-white/10 bg-navyCard overflow-hidden">
              <div className="border-b border-white/10 bg-navy/50 px-4 py-3 flex items-center justify-between">
                <p className="font-heading text-[10px] font-extrabold uppercase tracking-widest text-white/60">
                  {list.title}
                </p>
                {list.link && (
                  <Link href={list.link} className="font-heading text-[10px] font-bold uppercase tracking-widest text-accent hover:text-white transition">
                    View Full →
                  </Link>
                )}
              </div>
              {list.data.length > 0 ? (
                <ul className="divide-y divide-white/5">
                  {list.data.slice(0, 10).map((stat, i) => (
                    <li key={stat.playerName + i} className="flex items-center gap-3 px-4 py-3">
                      <span className="w-5 shrink-0 font-heading text-xs font-bold text-white/30">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-semibold text-white text-sm">{stat.playerName}</p>
                        {stat.teamName && (
                          <p className="text-xs text-white/40">{countryName(stat.teamName, "en") || stat.teamName}</p>
                        )}
                      </div>
                      <span className="font-heading text-base font-extrabold tabular-nums text-white">
                        {stat.value}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-xs text-white/40">No data available</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-navyCard p-6 text-center">
          <p className="font-heading text-xs font-bold uppercase tracking-widest text-white/30">
            Player stats will appear when event data is available from the match sync.
          </p>
        </div>
      )}
    </div>
  );
}
