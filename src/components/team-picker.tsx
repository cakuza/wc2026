"use client";

import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { TeamFlag } from "@/components/team-flag";
import type { Team } from "@/lib/types";
import { GROUPS } from "@/lib/types";

const featuredTeamIds = ["turkey", "brazil", "argentina", "france", "england", "portugal", "germany", "spain", "united-states", "mexico"];

export function TeamPicker({ teams, hideHeader = false }: { teams: Team[]; squadStatusByTeam?: Record<string, string>; hideHeader?: boolean }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [confederation, setConfederation] = useState("all");
  const confederations = useMemo(() => [...new Set(teams.map((team) => team.confederation))].sort(), [teams]);
  const featured = useMemo(
    () =>
      featuredTeamIds
        .map((id) => teams.find((team) => team.id === id || team.slug === id))
        .filter((team): team is Team => Boolean(team)),
    [teams]
  );
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const featuredIds = new Set(featured.map((team) => team.id));
    const list = teams.filter((team) => {
      const queryMatch = !normalized || [team.name, team.fifaCode, team.group, team.confederation, ...(team.aliases || [])].join(" ").toLowerCase().includes(normalized);
      const groupMatch = group === "all" || team.group === group;
      const confederationMatch = confederation === "all" || team.confederation === confederation;
      return queryMatch && groupMatch && confederationMatch;
    });
    return [
      ...featured.filter((team) => list.some((item) => item.id === team.id)),
      ...list.filter((team) => !featuredIds.has(team.id))
    ];
  }, [confederation, featured, group, query, teams]);

  return (
    <section className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 shadow-[0_16px_40px_rgba(14,12,10,.06)] md:p-5">
      {hideHeader ? null : (
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">Pick your country</p>
            <h2 className="mt-1 text-2xl font-black text-[#0E0C0A]">Follow your country&apos;s World Cup journey.</h2>
            <p className="mt-2 text-sm leading-6 text-[#0E0C0A]/58">Match times, squads, group tables — for all 48 teams.</p>
          </div>
          <Link href="/teams" className="inline-flex items-center gap-2 text-sm font-bold text-[#0E0C0A]/62 hover:text-[#B48A00]">
            All teams <ArrowRight size={15} />
          </Link>
        </div>
      )}
      <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
        <label className="flex items-center gap-2 rounded-md border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] px-3 py-3 text-[#0E0C0A]">
          <Search size={17} className="text-[#B48A00]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search team, code, group, alias, or confederation"
            className="w-full bg-transparent text-sm outline-none placeholder:text-[#0E0C0A]/35"
          />
        </label>
        <select value={group} onChange={(event) => setGroup(event.target.value)} className="focus-ring rounded-md border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] px-3 py-3 text-sm font-bold text-[#0E0C0A]">
          <option value="all">All groups</option>
          {GROUPS.map((item) => (
            <option key={item} value={item}>Group {item}</option>
          ))}
        </select>
        <select value={confederation} onChange={(event) => setConfederation(event.target.value)} className="focus-ring rounded-md border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] px-3 py-3 text-sm font-bold text-[#0E0C0A]">
          <option value="all">All confederations</option>
          {confederations.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.map((team) => (
          <div key={team.id} className="rounded-md border border-[rgba(14,12,10,.10)] bg-white p-3 transition hover:border-[#E7C36B]/70 hover:shadow-[0_10px_24px_rgba(14,12,10,.08)]">
            <Link href={`/teams/${team.slug}-world-cup-schedule`} className="focus-ring block rounded-sm">
              <TeamFlag team={team} width={44} />
              <p className="mt-2 font-black text-[#0E0C0A] hover:text-[#B48A00]">{team.name}</p>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#0E0C0A]/45">Group {team.group}</p>
            </Link>
            <div className="mt-3">
              <Link href={`/teams/${team.slug}-world-cup-schedule`} className="focus-ring block rounded-md bg-[#F6F4F1] px-3 py-2 text-xs font-bold text-[#0E0C0A]/72 hover:text-[#B48A00]">
                Match center
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
