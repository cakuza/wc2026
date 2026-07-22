"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Flag } from "@/components/Flag";
import { countryName } from "@/lib/i18n";
import { slugFor, TEAMS } from "@/lib/teams";
import type { RankedPlayerRankingRecord } from "@/lib/topScorersPageData";

const INITIAL_ROW_COUNT = 25;

function teamCodeForKey(teamKey: string | null): string | null {
  return teamKey ? TEAMS.find((team) => team.key === teamKey)?.code ?? null : null;
}

function matchesSearch(row: RankedPlayerRankingRecord, query: string): boolean {
  if (!query) return true;
  const team = row.teamKey ? countryName(row.teamKey, "en") : row.teamName ?? "";
  return `${row.playerName} ${team}`.toLocaleLowerCase().includes(query.toLocaleLowerCase());
}

export function TopScorersTable({ rows }: { rows: RankedPlayerRankingRecord[] }) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const filteredRows = useMemo(() => rows.filter((row) => matchesSearch(row, query.trim())), [query, rows]);
  const visibleRows = showAll || query.trim() ? filteredRows : filteredRows.slice(0, INITIAL_ROW_COUNT);

  return (
    <section className="mb-6" aria-labelledby="golden-boot-heading">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <h2 id="golden-boot-heading" className="font-heading text-lg font-extrabold uppercase tracking-wide text-ink">Golden Boot Standings</h2>
        <div className="w-full sm:w-64">
          <label htmlFor="player-search" className="sr-only">Search players</label>
          <input id="player-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search players" placeholder="Search players or teams" className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none placeholder:text-faint focus:border-accent" />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-line overflow-x-auto">
        <table className="w-full min-w-[320px] table-fixed text-left">
          <colgroup>
            <col className="w-10 sm:w-12" />
            <col />
            <col className="w-14 sm:w-16" />
            <col className="w-14 sm:w-16" />
            <col className="w-16 sm:w-20" />
          </colgroup>
          <thead className="bg-canvas text-[10px] uppercase tracking-wide text-faint">
            <tr>
              <th scope="col" className="px-3 py-2 font-heading font-extrabold">#</th>
              <th scope="col" className="px-2 py-2 font-heading font-extrabold">Player</th>
              <th scope="col" className="px-2 py-2 text-right font-heading font-extrabold">G</th>
              <th scope="col" className="px-2 py-2 text-right font-heading font-extrabold">A</th>
              <th scope="col" className="px-3 py-2 text-right font-heading font-extrabold">Min</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((scorer) => {
              const rank = scorer.rank;
              const teamCode = teamCodeForKey(scorer.teamKey);
              const teamName = scorer.teamKey ? countryName(scorer.teamKey, "en") : scorer.teamName;
              return (
                <tr key={`${scorer.teamKey ?? scorer.teamName ?? "unknown"}:${scorer.playerName}`} className="border-t border-line hover:bg-hover">
                  <td className="px-3 py-3 align-top font-heading text-sm font-extrabold text-faint">{rank}</td>
                  <td className="min-w-0 px-2 py-3">
                    <div className="flex min-w-0 items-center gap-2">
                      {teamCode ? <Flag code={teamCode} width={18} height={13} className="shrink-0" alt="" /> : null}
                      <span className="min-w-0 break-words text-sm font-bold leading-tight text-ink">{scorer.playerName}</span>
                    </div>
                    {scorer.teamKey ? <Link href={`/teams/${slugFor(scorer.teamKey)}`} className="mt-0.5 inline-block text-[10px] font-bold uppercase tracking-wide text-faint transition hover:text-ink">{teamName}</Link> : teamName ? <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-wide text-faint">{teamName}</span> : null}
                  </td>
                  <td className="px-2 py-3 text-right align-top font-heading text-base font-extrabold tabular-nums text-ink">{scorer.goals}</td>
                  <td className="px-2 py-3 text-right align-top font-heading text-base font-bold tabular-nums text-muted">
                    {scorer.assists?.value ?? "-"}
                    {scorer.assists && !scorer.assists.isComplete ? "*" : ""}
                  </td>
                  <td className="px-3 py-3 text-right align-top font-heading text-sm font-medium tabular-nums text-faint">
                    {scorer.minutesPlayed?.value ?? "-"}
                    {scorer.minutesPlayed && !scorer.minutesPlayed.isVerifiedComplete ? "*" : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {visibleRows.length === 0 ? <p className="px-4 py-5 text-sm text-muted">No players match that search.</p> : null}
      </div>
      {!query.trim() && rows.length > INITIAL_ROW_COUNT ? <button type="button" onClick={() => setShowAll((value) => !value)} aria-expanded={showAll} className="mt-3 rounded-lg border border-line bg-surface px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-accent transition hover:border-accent hover:text-ink">{showAll ? "Show top 25" : `Show all ${rows.length} scorers`}</button> : null}
    </section>
  );
}
