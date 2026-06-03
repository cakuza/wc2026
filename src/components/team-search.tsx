"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Team } from "@/lib/types";
import { GROUPS } from "@/lib/types";

export function TeamSearch({ teams }: { teams: Team[]; squadStatusByTeam?: Record<string, string> }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [confederation, setConfederation] = useState("all");
  const confederations = useMemo(() => [...new Set(teams.map((team) => team.confederation))].sort(), [teams]);
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return teams.filter(
      (team) =>
        (group === "all" || team.group === group) &&
        (confederation === "all" || team.confederation === confederation) &&
        (!value ||
          [team.name, team.fifaCode, team.group, team.confederation, ...(team.aliases || [])].join(" ").toLowerCase().includes(value))
    );
  }, [confederation, group, query, teams]);

  return (
    <div className="grid gap-5">
      <div className="grid max-w-4xl gap-3 md:grid-cols-[1fr_auto_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35" size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by team, code, alias, confederation, or group"
            className="focus-ring w-full rounded-md border border-white/10 bg-white/[0.05] px-10 py-3 text-white placeholder:text-white/35"
          />
        </label>
        <select value={group} onChange={(event) => setGroup(event.target.value)} className="focus-ring rounded-md border border-white/10 bg-pitch px-3 py-3 text-sm font-bold text-white">
          <option value="all">All groups</option>
          {GROUPS.map((item) => (
            <option key={item} value={item}>Group {item}</option>
          ))}
        </select>
        <select value={confederation} onChange={(event) => setConfederation(event.target.value)} className="focus-ring rounded-md border border-white/10 bg-pitch px-3 py-3 text-sm font-bold text-white">
          <option value="all">All confederations</option>
          {confederations.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((team) => (
          <Link
            key={team.id}
            href={`/teams/${team.slug}`}
            className="rounded-lg border border-white/10 bg-white/[0.04] p-4 transition hover:border-gold/50 hover:bg-white/[0.07]"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-md bg-gold/12 font-black text-gold">{team.fifaCode}</span>
              <span className="rounded-md border border-white/10 px-2 py-1 text-xs font-bold text-white/55">Group {team.group}</span>
            </div>
            <h2 className="text-xl font-black text-white">{team.name}</h2>
            <p className="mt-2 text-sm text-white/55">{team.confederation}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <p className="inline-flex rounded-full border border-gold/20 bg-gold/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-gold">Road poster ready</p>
              <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-white/50">View schedule</span>
              <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-white/50">Create team card</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
