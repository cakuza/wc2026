"use client";

import { useEffect, useState } from "react";
import type { MatchWithTeams } from "@/lib/types";
import { QUICK_TIMEZONES, formatKickoff, getBrowserTimezone } from "@/lib/timezones";

export function HomeTimezoneQuick({ match }: { match?: MatchWithTeams }) {
  const [timeZone, setTimeZone] = useState("Europe/Istanbul");

  useEffect(() => {
    setTimeZone(getBrowserTimezone());
  }, []);

  return (
    <div className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4">
      <label className="grid gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#0E0C0A]/55">
        Timezone
        <select
          value={timeZone}
          onChange={(event) => setTimeZone(event.target.value)}
          className="focus-ring rounded-md border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] px-3 py-3 text-sm normal-case tracking-normal text-[#0E0C0A]"
        >
          {!QUICK_TIMEZONES.includes(timeZone) ? <option value={timeZone}>Your timezone</option> : null}
          {QUICK_TIMEZONES.map((zone) => (
            <option key={zone} value={zone}>{zone}</option>
          ))}
        </select>
      </label>
      {match ? (
        <div className="mt-4 rounded-md bg-[#F6F4F1] p-3">
          <p className="font-black text-[#0E0C0A]">{match.homeTeam.name} vs {match.awayTeam.name}</p>
          <p className="mt-1 text-sm text-[#B48A00]">{match.kickoffUtc ? formatKickoff(match.kickoffUtc, timeZone) : "Local time unavailable"}</p>
        </div>
      ) : null}
    </div>
  );
}
