"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { MatchCard } from "@/components/match-card";
import { TimezoneSelect } from "@/components/timezone-select";
import { useTimezone } from "@/components/timezone-provider";
import { GROUPS, type MatchWithTeams } from "@/lib/types";
import { formatDateKey } from "@/lib/timezones";

export function MatchScheduleClient({ matches }: { matches: MatchWithTeams[] }) {
  const { timeZone } = useTimezone();
  const [team, setTeam] = useState("");
  const [date, setDate] = useState("all");
  const [group, setGroup] = useState("all");

  const dates = useMemo(
    () => Array.from(new Set(matches.map((match) => formatDateKey(match.date, timeZone)))),
    [matches, timeZone]
  );

  const filtered = useMemo(() => {
    const query = team.trim().toLowerCase();
    return matches.filter((match) => {
      const localDate = formatDateKey(match.date, timeZone);
      const teamMatch =
        !query ||
        match.homeTeam.name.toLowerCase().includes(query) ||
        match.awayTeam.name.toLowerCase().includes(query) ||
        match.homeTeam.fifaCode.toLowerCase().includes(query) ||
        match.awayTeam.fifaCode.toLowerCase().includes(query);
      return teamMatch && (date === "all" || localDate === date) && (group === "all" || match.group === group);
    });
  }, [date, group, matches, team, timeZone]);

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.14em] text-white/55">
          Team
          <span className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35" size={16} />
            <input
              value={team}
              onChange={(event) => setTeam(event.target.value)}
              placeholder="Search team"
              className="focus-ring w-full rounded-md border border-white/10 bg-pitch px-9 py-3 text-sm normal-case tracking-normal text-white placeholder:text-white/35"
            />
          </span>
        </label>
        <Select label="Date" value={date} onChange={setDate}>
          <option value="all">All dates</option>
          {dates.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select label="Group" value={group} onChange={setGroup}>
          <option value="all">All groups</option>
          {GROUPS.map((item) => (
            <option key={item} value={item}>
              Group {item}
            </option>
          ))}
        </Select>
        <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.14em] text-white/55">
          Timezone
          <TimezoneSelect variant="dark" />
        </label>
      </div>
      <p className="text-sm text-white/58">Kickoffs show in your local time. Pick a different timezone above and every page updates to match.</p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((match) => (
          <MatchCard key={match.id} match={match} timeZone={timeZone} />
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/18 p-8 text-center">
          <h2 className="text-xl font-black text-white">No matches found</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/60">
            Try clearing the team, date, or group filters. You can also jump to today&apos;s matches or create a schedule card from the full fixture list.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => {
                setTeam("");
                setDate("all");
                setGroup("all");
              }}
              className="focus-ring rounded-md bg-gold px-4 py-2 text-sm font-black text-pitch"
            >
              Clear filters
            </button>
            <a href="/world-cup-matches-today" className="focus-ring rounded-md border border-white/12 px-4 py-2 text-sm font-bold text-white">
              Today&apos;s matches
            </a>
            <a href="/cards" className="focus-ring rounded-md border border-white/12 px-4 py-2 text-sm font-bold text-white">
              Create card
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  children
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.14em] text-white/55">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring w-full rounded-md border border-white/10 bg-pitch px-3 py-3 text-sm normal-case tracking-normal text-white"
      >
        {children}
      </select>
    </label>
  );
}
