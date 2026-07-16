"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { countryName } from "@/lib/i18n";
import type { TeamStatLeaderboards, TeamLeaderboard } from "@/lib/tournamentStats";

interface Props {
  teamsList: { key: string; name: string }[];
  teamStatLeaderboards: TeamStatLeaderboards;
}

export const DEFAULT_COMPARE_TEAMS = { team1: "france", team2: "spain" } as const;

export type CompareQueryReader = Pick<URLSearchParams, "get"> | null | undefined;

export function resolveCompareTeams(
  searchParams: CompareQueryReader,
  teamsList: readonly { key: string }[],
): { team1: string; team2: string } {
  const hasTeam = (teamKey: string | null): teamKey is string => (
    typeof teamKey === "string" && teamsList.some((team) => team.key === teamKey)
  );
  const requestedTeam1 = searchParams?.get("team1") ?? null;
  const requestedTeam2 = searchParams?.get("team2") ?? null;
  return {
    team1: hasTeam(requestedTeam1) ? requestedTeam1 : DEFAULT_COMPARE_TEAMS.team1,
    team2: hasTeam(requestedTeam2) ? requestedTeam2 : DEFAULT_COMPARE_TEAMS.team2,
  };
}

export function comparisonColors({
  left,
  right,
  label,
}: {
  left: TeamLeaderboard | undefined;
  right: TeamLeaderboard | undefined;
  label: string;
}): { left: string; right: string } {
  if (
    typeof left?.value !== "number"
    || typeof right?.value !== "number"
    || left.coverageStatus !== "COMPLETE"
    || right.coverageStatus !== "COMPLETE"
    || left.value === right.value
  ) {
    return { left: "text-white", right: "text-white" };
  }

  const reverse = label === "Goals Conceded" || label === "Fouls";
  if (left.value > right.value) {
    return { left: reverse ? "text-red-400" : "text-accent", right: "text-white" };
  }
  return { left: "text-white", right: reverse ? "text-red-400" : "text-accent" };
}

export function comparisonCoverageLabel(row: TeamLeaderboard | undefined): string | null {
  if (row?.coverageStatus !== "PARTIAL") return null;
  return `${row.matchesCovered ?? 0} of ${row.completedMatches ?? 0} matches covered`;
}

export function TeamCompareShell({
  t1,
  t2,
  onSelect,
  teamsList,
  teamStatLeaderboards,
}: Props & { t1: string; t2: string; onSelect: (which: 1 | 2, val: string) => void }) {
  const getRow = (list: TeamLeaderboard[], team: string) => {
    return list.find((r) => r.teamKey === team);
  };

  const metrics = [
    { label: "Goals Scored", list: teamStatLeaderboards.goalsScored },
    { label: "Goals Conceded", list: teamStatLeaderboards.goalsConceded },
    { label: "Clean Sheets", list: teamStatLeaderboards.cleanSheets },
    { label: "Shots", list: teamStatLeaderboards.shots },
    { label: "Shots on Target", list: teamStatLeaderboards.shotsOnTarget },
    { label: "Possession (%)", list: teamStatLeaderboards.possession },
    { label: "Corners", list: teamStatLeaderboards.corners },
    { label: "Offsides", list: teamStatLeaderboards.offsides },
    { label: "Saves", list: teamStatLeaderboards.saves },
    { label: "Fouls", list: teamStatLeaderboards.fouls },
    { label: "Substitutions", list: teamStatLeaderboards.substitutions },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Team 1</label>
          <select
            className="w-full rounded-lg bg-navyCard border border-white/10 px-4 py-3 text-white focus:border-accent outline-none"
            value={t1}
            onChange={(e) => onSelect(1, e.target.value)}
          >
            <option value="">Select Team...</option>
            {teamsList.map((t) => (
              <option key={t.key} value={t.key}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Team 2</label>
          <select
            className="w-full rounded-lg bg-navyCard border border-white/10 px-4 py-3 text-white focus:border-accent outline-none"
            value={t2}
            onChange={(e) => onSelect(2, e.target.value)}
          >
            <option value="">Select Team...</option>
            {teamsList.map((t) => (
              <option key={t.key} value={t.key}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {t1 && t2 ? (
        <div className="rounded-xl border border-white/10 bg-navyCard overflow-hidden">
          <div className="grid grid-cols-3 border-b border-white/10 bg-navy/50 px-4 py-3 text-center items-center">
            <p className="font-heading text-sm font-bold text-white truncate px-2">{countryName(t1, "en") || t1}</p>
            <p className="font-heading text-[10px] font-extrabold uppercase tracking-widest text-white/30">VS</p>
            <p className="font-heading text-sm font-bold text-white truncate px-2">{countryName(t2, "en") || t2}</p>
          </div>
          <ul className="divide-y divide-white/5">
            {metrics.map((m) => {
              const r1 = getRow(m.list, t1);
              const r2 = getRow(m.list, t2);

              const val1 = r1 ? r1.value : "—";
              const val2 = r2 ? r2.value : "—";

              const isNum1 = typeof val1 === "number";
              const isNum2 = typeof val2 === "number";
              const colors = comparisonColors({ left: r1, right: r2, label: m.label });

              const isPartial1 = r1?.coverageStatus === "PARTIAL";
              const isPartial2 = r2?.coverageStatus === "PARTIAL";

              return (
                <li key={m.label} className="flex flex-col px-4 py-4 hover:bg-white/5">
                  <div className="grid grid-cols-3 text-center items-center">
                    <span className={`font-heading text-base font-extrabold ${colors.left}`}>
                      {val1}
                    </span>
                    <span className="font-heading text-[10px] font-bold uppercase tracking-widest text-white/50">
                      {m.label}
                    </span>
                    <span className={`font-heading text-base font-extrabold ${colors.right}`}>
                      {val2}
                    </span>
                  </div>
                  {(isPartial1 || isPartial2) && (
                    <div className="grid grid-cols-3 text-center items-center mt-1">
                      <span className="text-[10px] text-yellow-500/80">
                        {isPartial1 ? comparisonCoverageLabel(r1) : (isNum1 ? "COMPLETE" : "")}
                      </span>
                      <span></span>
                      <span className="text-[10px] text-yellow-500/80">
                        {isPartial2 ? comparisonCoverageLabel(r2) : (isNum2 ? "COMPLETE" : "")}
                      </span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/20 p-12 text-center text-white/30 text-sm">
          Select two teams to view head-to-head tournament statistics.
        </div>
      )}
    </div>
  );
}

function TeamCompareInner({ teamsList, teamStatLeaderboards }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [t1, setT1] = useState<string>(DEFAULT_COMPARE_TEAMS.team1);
  const [t2, setT2] = useState<string>(DEFAULT_COMPARE_TEAMS.team2);

  useEffect(() => {
    const nextTeams = resolveCompareTeams(searchParams, teamsList);
    setT1((current) => current === nextTeams.team1 ? current : nextTeams.team1);
    setT2((current) => current === nextTeams.team2 ? current : nextTeams.team2);
  }, [searchParams, teamsList]);

  const handleSelect = (which: 1 | 2, val: string) => {
    if (which === 1) setT1(val);
    else setT2(val);

    const url = new URL(window.location.href);
    if (which === 1 && val) url.searchParams.set("team1", val);
    else if (which === 1) url.searchParams.delete("team1");

    if (which === 2 && val) url.searchParams.set("team2", val);
    else if (which === 2) url.searchParams.delete("team2");

    router.replace(url.pathname + url.search);
  };

  return (
    <TeamCompareShell
      teamsList={teamsList}
      teamStatLeaderboards={teamStatLeaderboards}
      t1={t1}
      t2={t2}
      onSelect={handleSelect}
    />
  );
}

export function TeamCompareClient({ teamsList, teamStatLeaderboards }: Props) {
  return (
    <Suspense fallback={<TeamCompareShell teamsList={teamsList} teamStatLeaderboards={teamStatLeaderboards} t1={DEFAULT_COMPARE_TEAMS.team1} t2={DEFAULT_COMPARE_TEAMS.team2} onSelect={() => {}} />}>
      <TeamCompareInner teamsList={teamsList} teamStatLeaderboards={teamStatLeaderboards} />
    </Suspense>
  );
}
