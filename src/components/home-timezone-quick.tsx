"use client";

import { TimezoneSelect } from "@/components/timezone-select";
import { useTimezone } from "@/components/timezone-provider";
import type { MatchWithTeams } from "@/lib/types";
import { formatKickoff } from "@/lib/timezones";

export function HomeTimezoneQuick({ match }: { match?: MatchWithTeams }) {
  const { timeZone } = useTimezone();

  return (
    <div className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4">
      <label className="grid gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#0E0C0A]/55">
        Timezone
        <TimezoneSelect variant="light" className="!py-3" />
      </label>
      {match ? (
        <div className="mt-4 rounded-md bg-[#F6F4F1] p-3">
          <p className="font-black text-[#0E0C0A]">{match.homeTeam.name} vs {match.awayTeam.name}</p>
          <p className="mt-1 text-sm text-[#B48A00]">{match.kickoffUtc ? `${formatKickoff(match.kickoffUtc, timeZone)} · Local time` : "Local time unavailable"}</p>
        </div>
      ) : null}
    </div>
  );
}
