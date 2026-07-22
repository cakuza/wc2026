"use client";

import { useState } from "react";
import { countryName } from "@/lib/i18n";
import type { TeamLeaderboard } from "@/lib/tournamentStats";

interface StatList {
  title: string;
  data: TeamLeaderboard[];
  showCoverage?: boolean;
  isAverage?: boolean;
}

interface Props {
  attackLists: StatList[];
  controlLists: StatList[];
  defenseLists: StatList[];
  disciplineLists: StatList[];
}

export function TeamsClient({ attackLists, controlLists, defenseLists, disciplineLists }: Props) {
  const [mode, setMode] = useState<"total" | "perMatch">("total");

  const processList = (list: StatList) => {
    const raw = list.data;
    if (mode === "total" || list.isAverage) {
      return raw.slice(0, 10).map(row => ({
        ...row,
        displayValue: String(row.value)
      }));
    } else {
      return [...raw]
        .map(row => {
          const denominator = row.matchesCovered || 1;
          const perMatchVal = row.value / denominator;
          return {
            ...row,
            displayValue: (Math.round(perMatchVal * 10) / 10).toFixed(1),
            sortValue: perMatchVal
          };
        })
        .sort((a, b) => b.sortValue - a.sortValue)
        .slice(0, 10);
    }
  };

  const renderSection = (title: string, lists: StatList[]) => (
    <section className="mb-12">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="font-heading text-lg font-extrabold uppercase tracking-widest text-ink">
          {title}
        </h2>
        <div className="h-px flex-1 bg-line" />
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {lists.map((list) => {
          const processed = processList(list);
          return (
            <div key={list.title} className="rounded-xl border border-line bg-surface overflow-hidden flex flex-col">
              <div className="border-b border-line bg-canvas/50 px-4 py-3">
                <p className="font-heading text-[10px] font-extrabold uppercase tracking-widest text-muted">
                  {list.title}
                </p>
              </div>
              {processed.length > 0 ? (
                <ul className="divide-y divide-line flex-1">
                  {processed.map((stat, i) => {
                    const { coverageStatus, matchesCovered, completedMatches } = stat;
                    const isPartial = coverageStatus === "PARTIAL";

                    return (
                      <li key={stat.teamKey + i} className="flex items-center gap-3 px-4 py-3">
                        <span className="w-5 shrink-0 font-heading text-xs font-bold text-faint">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-semibold text-ink text-sm">{countryName(stat.teamKey, "en")}</p>
                          {isPartial ? (
                            <p className="text-[11px] text-faint">
                              <span className="text-yellow-500/80 mr-1">PARTIAL:</span>
                              {matchesCovered} of {completedMatches} completed matches covered
                            </p>
                          ) : coverageStatus === "COMPLETE" ? (
                            <p className="text-[11px] text-faint">
                              {matchesCovered} completed matches covered
                            </p>
                          ) : null}
                        </div>
                        <span className="font-heading text-base font-extrabold tabular-nums text-ink">
                          {stat.displayValue}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-6 text-center text-xs text-faint flex-1 flex items-center justify-center">No data available</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );

  return (
    <>
      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-lg border border-line bg-canvas p-1">
          <button
            onClick={() => setMode("total")}
            className={`rounded-md px-6 py-2 font-heading text-xs font-bold uppercase tracking-widest transition ${
              mode === "total" ? "bg-accent text-onAccent" : "text-faint hover:text-ink"
            }`}
          >
            Total
          </button>
          <button
            onClick={() => setMode("perMatch")}
            className={`rounded-md px-6 py-2 font-heading text-xs font-bold uppercase tracking-widest transition ${
              mode === "perMatch" ? "bg-accent text-onAccent" : "text-faint hover:text-ink"
            }`}
          >
            Per Match
          </button>
        </div>
      </div>

      {renderSection("Attack", attackLists)}
      {renderSection("Control", controlLists)}
      {renderSection("Defense", defenseLists)}
      {renderSection("Discipline & Tactics", disciplineLists)}
    </>
  );
}
