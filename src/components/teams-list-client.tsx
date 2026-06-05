"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { TeamFlag } from "@/components/team-flag";
import { GROUPS, type Team } from "@/lib/types";

export function TeamsListClient({ teams }: { teams: Team[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter(
      (team) =>
        team.name.toLowerCase().includes(q) ||
        team.fifaCode.toLowerCase().includes(q) ||
        team.confederation.toLowerCase().includes(q)
    );
  }, [query, teams]);

  return (
    <div className="grid gap-8">
      <label className="grid gap-1 text-xs font-black uppercase tracking-[0.14em] text-[#0E0C0A]/55">
        Find a team
        <span className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#B48A00]" size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search team"
            className="focus-ring w-full rounded-md border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] px-9 py-2 text-sm normal-case tracking-normal text-[#0E0C0A] placeholder:text-[#0E0C0A]/35"
          />
        </span>
      </label>

      {GROUPS.map((group) => {
        const groupTeams = filtered.filter((team) => team.group === group);
        if (!groupTeams.length) return null;
        return (
          <section key={group}>
            <div className="mb-3 flex items-center justify-between gap-3 border-b border-[rgba(14,12,10,.10)] pb-2">
              <h2 className="text-sm font-black uppercase tracking-[0.16em] text-[#0E0C0A]">Group {group}</h2>
              <Link
                href={`/groups/${group.toLowerCase()}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#0E0C0A]/55 transition hover:text-[#B48A00]"
              >
                Group table <ArrowRight size={13} />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {groupTeams.map((team) => (
                <Link
                  key={team.id}
                  href={`/teams/${team.slug}`}
                  className="flex items-center gap-3 rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-3 shadow-[0_8px_18px_rgba(14,12,10,.05)] transition hover:border-[#E7C36B]/60 hover:shadow-[0_14px_32px_rgba(14,12,10,.09)]"
                >
                  <TeamFlag team={team} width={38} />
                  <div className="min-w-0">
                    <p className="truncate font-black text-[#0E0C0A]">{team.name}</p>
                    <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#0E0C0A]/45">{team.confederation}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-6 text-sm font-bold text-[#0E0C0A]/55">
          No teams match &ldquo;{query}&rdquo;. Try a country name, FIFA code, or confederation.
        </p>
      ) : null}
    </div>
  );
}
