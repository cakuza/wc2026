import type { Metadata } from "next";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { StatsNav } from "@/components/StatsNav";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { countryName } from "@/lib/i18n";
import { LiveDataUnavailableNotice } from "@/components/LiveDataUnavailableNotice";
import { TeamsClient } from "./TeamsClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "World Cup 2026 Team Stats - Attack, Control, Defense",
  description: "Comprehensive team statistics for the 2026 World Cup including most goals, possession, clean sheets, and more.",
  alternates: { canonical: "https://www.worldcupmatchday.com/stats/teams" },
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Stats", href: "/stats" },
  { label: "Teams" },
];

export default async function TeamsStatsPage() {
  const snapshot = await getTournamentLiveSnapshot();
  const { teamLeaderboards, teamStatLeaderboards } = snapshot;
  
  const hasTeamData = teamStatLeaderboards.goalsScored.length > 0;

  const attackLists = [
    { title: "Goals Scored", data: teamStatLeaderboards.goalsScored },
    { title: "Shots", data: teamStatLeaderboards.shots },
    { title: "Shots on Target", data: teamStatLeaderboards.shotsOnTarget },
  ];

  const controlLists = [
    { title: "Average Possession (%)", data: teamStatLeaderboards.possession, isAverage: true },
    { title: "Corners Won", data: teamStatLeaderboards.corners },
    { title: "Offsides", data: teamStatLeaderboards.offsides },
  ];

  const defenseLists = [
    { title: "Clean Sheets", data: teamStatLeaderboards.cleanSheets, showCoverage: true },
    { title: "Goals Conceded", data: teamStatLeaderboards.goalsConceded, showCoverage: true },
    { title: "Saves", data: teamStatLeaderboards.saves },
  ];

  const disciplineLists = [
    { title: "Fouls Committed", data: teamStatLeaderboards.fouls },
    { title: "Substitutions Used", data: teamStatLeaderboards.substitutions },
  ];



  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <BreadcrumbNav items={breadcrumbs} />

      <div className="mb-6 mt-4">
        <p className="font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">
          World Cup 2026
        </p>
        <h1 className="mt-1 font-heading text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">
          Team Stats
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-white/50">
          Analyze team performance across attack, control, defense, and discipline metrics.
        </p>
      </div>

      <StatsNav />

      {snapshot.isFallback ? (
        <div className="mb-8 max-w-5xl">
          <LiveDataUnavailableNotice show />
        </div>
      ) : null}

      {hasTeamData ? (
        <TeamsClient 
          attackLists={attackLists}
          controlLists={controlLists}
          defenseLists={defenseLists}
          disciplineLists={disciplineLists}
        />
      ) : (
        <div className="rounded-xl border border-white/10 bg-navyCard p-6 text-center">
          <p className="font-heading text-xs font-bold uppercase tracking-widest text-white/30">
            Team stats will appear when match data is available.
          </p>
        </div>
      )}
    </div>
  );
}
