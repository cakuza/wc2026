"use client";

import { useState } from "react";
import { countryName } from "@/lib/i18n";

export interface StatRow {
  teamKey: string;
  value: number;
  matchesCovered?: number;
}

interface StatList {
  title: string;
  data: StatRow[];
  showCoverage?: boolean;
  isAverage?: boolean; // If the original data is ALREADY an average (e.g. Possession)
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
    // Top 10 only to keep HTML size down if we were doing SSR, but here we just slice 10.
    const raw = list.data;
    if (mode === "total" || list.isAverage) {
      // If it's already an average, "total" mode just shows the average.
      // And perMatch mode also just shows the average.
      return raw.slice(0, 10);
    } else {
      // mode === "perMatch" and it's NOT an average yet.
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
        <h2 className="font-heading text-lg font-extrabold uppercase tracking-widest text-white">
          {title}
        </h2>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {lists.map((list) => {
          const processed = processList(list);
          return (
            <div key={list.title} className="rounded-xl border border-white/10 bg-navyCard overflow-hidden flex flex-col">
              <div className="border-b border-white/10 bg-navy/50 px-4 py-3">
                <p className="font-heading text-[10px] font-extrabold uppercase tracking-widest text-white/60">
                  {list.title}
                </p>
              </div>
              {processed.length > 0 ? (
                <ul className="divide-y divide-white/5 flex-1">
                  {processed.map((stat, i) => (
                    <li key={stat.teamKey + i} className="flex items-center gap-3 px-4 py-3">
                      <span className="w-5 shrink-0 font-heading text-xs font-bold text-white/30">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-semibold text-white text-sm">{countryName(stat.teamKey, "en")}</p>
                        {stat.matchesCovered && stat.matchesCovered > 0 ? (
                          <p className="text-xs text-white/40">in {stat.matchesCovered} matches</p>
                        ) : null}
                      </div>
                      <span className="font-heading text-base font-extrabold tabular-nums text-white">
                        {String('displayValue' in stat ? stat.displayValue : stat.value)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-xs text-white/40 flex-1 flex items-center justify-center">No data available</div>
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
        <div className="inline-flex rounded-lg border border-white/10 bg-navy p-1">
          <button
            onClick={() => setMode("total")}
            className={`rounded-md px-6 py-2 font-heading text-xs font-bold uppercase tracking-widest transition ${
              mode === "total" ? "bg-accent text-navy" : "text-white/50 hover:text-white"
            }`}
          >
            Total
          </button>
          <button
            onClick={() => setMode("perMatch")}
            className={`rounded-md px-6 py-2 font-heading text-xs font-bold uppercase tracking-widest transition ${
              mode === "perMatch" ? "bg-accent text-navy" : "text-white/50 hover:text-white"
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
