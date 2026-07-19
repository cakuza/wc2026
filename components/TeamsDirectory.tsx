"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Flag } from "@/components/Flag";
import { useLang } from "@/components/LanguageProvider";
import { TEAMS, slugFor } from "@/lib/teams";
import { CONFEDERATIONS, CONFEDERATION_BY_TEAM } from "@/lib/confederations";
import type { TeamClassification } from "@/lib/teamTournamentStatus";

type Filter = "ALL" | "FINALISTS" | "ACTIVE_KNOCKOUT" | "ELIMINATED_KNOCKOUT" | "ELIMINATED_GROUP_STAGE";

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: "ALL", label: "All teams" },
  { key: "FINALISTS", label: "Finalists" },
  { key: "ACTIVE_KNOCKOUT", label: "Active" },
  { key: "ELIMINATED_KNOCKOUT", label: "Knockout teams" },
  { key: "ELIMINATED_GROUP_STAGE", label: "Eliminated" },
];

export function TeamsDirectory({
  classifications,
  finalists,
  statusLabels,
}: {
  classifications: Record<string, TeamClassification>;
  finalists: string[];
  statusLabels: Record<string, string>;
}) {
  const { country } = useLang();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [confederation, setConfederation] = useState("ALL");
  const teams = useMemo(() => TEAMS.filter((team) => (
    (filter === "ALL" || (filter === "FINALISTS" ? finalists.includes(team.key) : classifications[team.key] === filter))
    && (confederation === "ALL" || CONFEDERATION_BY_TEAM[team.key] === confederation)
  )), [classifications, confederation, filter, finalists]);

  const explanationCopy = (() => {
    switch (filter) {
      case "FINALISTS":
        return "The two finalist teams competing for the World Cup trophy.";
      case "ACTIVE_KNOCKOUT":
        return "Active teams that still have a match remaining in the tournament.";
      case "ELIMINATED_KNOCKOUT":
        return "Teams that reached the knockout stage but have completed their campaigns.";
      case "ELIMINATED_GROUP_STAGE":
        return "Teams eliminated during the group stage.";
      default:
        return "Teams that still have a match remaining in the tournament.";
    }
  })();

  return <>
    <div className="mb-5 space-y-3 rounded-xl border border-white/10 bg-navyCard p-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ key, label }) => <button key={key} type="button" onClick={() => setFilter(key)} className={`rounded-full px-3 py-1.5 font-heading text-[10px] font-extrabold uppercase tracking-wider ${filter === key ? "bg-accent text-navy" : "bg-white/5 text-white/60 hover:text-white"}`}>{label}</button>)}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setConfederation("ALL")} className={`text-xs ${confederation === "ALL" ? "text-accent" : "text-white/45 hover:text-white"}`}>All confederations</button>
        {CONFEDERATIONS.map((conf) => <button key={conf.code} type="button" onClick={() => setConfederation(conf.code)} className={`text-xs ${confederation === conf.code ? "text-accent" : "text-white/45 hover:text-white"}`}>{conf.name}</button>)}
      </div>
    </div>
    <p className="mb-3 text-xs text-white/45">{explanationCopy}</p>
    <div className="grid gap-2 sm:grid-cols-2">
      {teams.map((team) => {
        const status = classifications[team.key];
        const label = statusLabels[team.key] || (status === "ACTIVE_KNOCKOUT" ? "Active" : status === "ELIMINATED_KNOCKOUT" ? "Knockout" : "Eliminated");
        return <Link key={team.key} href={`/teams/${slugFor(team.key)}`} className="flex items-center gap-3 rounded-lg border border-white/10 bg-navyCard px-4 py-3 transition hover:border-white/30 hover:bg-white/5">
          <Flag code={team.code} alt="" width={28} height={20} />
          <span className="min-w-0 flex-1 truncate font-semibold text-white">{country(team.key)}</span>
          <span className={`font-heading text-[10px] font-bold uppercase tracking-wider ${status === "ACTIVE_KNOCKOUT" ? "text-accent" : "text-white/40"}`}>{label}</span>
        </Link>;
      })}
    </div>
  </>;
}
