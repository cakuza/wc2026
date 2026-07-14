"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Flag } from "@/components/Flag";
import { countryName } from "@/lib/i18n";
import { slugFor, TEAMS } from "@/lib/teams";
import type { PlayerGoalStat } from "@/lib/tournamentStats";

const INITIAL_ROW_COUNT = 25;

function teamCodeForKey(teamKey: string | null): string | null {
  return teamKey ? TEAMS.find((team) => team.key === teamKey)?.code ?? null : null;
}

function matchesSearch(row: PlayerGoalStat, query: string): boolean {
  if (!query) return true;
  const team = row.teamKey ? countryName(row.teamKey, "en") : row.teamName ?? "";
  return `${row.playerName} ${team}`.toLocaleLowerCase().includes(query.toLocaleLowerCase());
}

export function TopScorersTable({ rows }: { rows: PlayerGoalStat[] }) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const filteredRows = useMemo(() => rows.filter((row) => matchesSearch(row, query.trim())), [query, rows]);
  const visibleRows = showAll || query.trim() ? filteredRows : filteredRows.slice(0, INITIAL_ROW_COUNT);

  return (
    <section className="mb-6" aria-labelledby="golden-boot-heading">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <h2 id="golden-boot-heading" className="font-heading text-lg font-extrabold uppercase tracking-wide text-white">Golden Boot Standings</h2>
        <label className="w-full sm:w-64">
          <span className="sr-only">Search players or teams</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search players or teams" className="w-full rounded-lg border border-white/15 bg-navy px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-accent" />
        </label>
      </div>
      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full table-fixed text-left">
          <colgroup><col className="w-10 sm:w-12" /><col /><col className="w-14 sm:w-16" /></colgroup>
          <thead className="bg-navy text-[10px] uppercase tracking-wide text-white/40"><tr><th scope="col" className="px-3 py-2 font-heading font-extrabold">#</th><th scope="col" className="px-2 py-2 font-heading font-extrabold">Player</th><th scope="col" className="px-3 py-2 text-right font-heading font-extrabold">Goals</th></tr></thead>
          <tbody>
            {visibleRows.map((scorer) => {
              const rank = rows.findIndex((row) => row.goals === scorer.goals) + 1;
              const teamCode = teamCodeForKey(scorer.teamKey);
              const teamName = scorer.teamKey ? countryName(scorer.teamKey, "en") : scorer.teamName;
              return <tr key={`${scorer.teamKey ?? scorer.teamName ?? "unknown"}:${scorer.playerName}`} className="border-t border-white/5 hover:bg-white/3"><td className="px-3 py-3 align-top font-heading text-sm font-extrabold text-white/40">{rank}</td><td className="min-w-0 px-2 py-3"><div className="flex min-w-0 items-center gap-2">{teamCode ? <Flag code={teamCode} width={18} height={13} className="shrink-0" alt="" /> : null}<span className="min-w-0 break-words text-sm font-bold leading-tight text-white">{scorer.playerName}</span></div>{scorer.teamKey ? <Link href={`/teams/${slugFor(scorer.teamKey)}`} className="mt-0.5 inline-block text-[10px] font-bold uppercase tracking-wide text-white/45 transition hover:text-white">{teamName}</Link> : teamName ? <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-wide text-white/45">{teamName}</span> : null}</td><td className="px-3 py-3 text-right align-top font-heading text-base font-extrabold tabular-nums text-white">{scorer.goals}</td></tr>;
            })}
          </tbody>
        </table>
        {visibleRows.length === 0 ? <p className="px-4 py-5 text-sm text-white/55">No players match that search.</p> : null}
      </div>
      {!query.trim() && rows.length > INITIAL_ROW_COUNT ? <button type="button" onClick={() => setShowAll((value) => !value)} aria-expanded={showAll} className="mt-3 rounded-lg border border-white/15 bg-navyCard px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-accent transition hover:border-accent hover:text-white">{showAll ? "Show top 25" : `Show all ${rows.length} scorers`}</button> : null}
    </section>
  );
}
