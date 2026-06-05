"use client";

import Link from "next/link";
import { TeamFlag } from "@/components/team-flag";
import { useTimezone } from "@/components/timezone-provider";
import type { MatchWithTeams } from "@/lib/types";
import { formatKickoff } from "@/lib/timezones";

// Schedule-only matchday board (no scores yet). Local kickoff time is resolved from the
// site-wide timezone selection; date, stadium and city come from the fixtures data.
export function TodayMatches({ matches }: { matches: MatchWithTeams[] }) {
  const { timeZone } = useTimezone();

  if (!matches.length) {
    return <p className="text-sm font-bold text-[#0E0C0A]/56">No matches scheduled yet.</p>;
  }

  return (
    <div className="grid gap-3">
      {matches.map((match) => {
        const hasVenue = match.venue !== "TBD" && match.city !== "TBD";
        return (
          <Link
            key={match.id}
            href={`/cards?template=prediction&match=${match.id}`}
            className="rounded-md border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] p-4 transition hover:bg-white hover:shadow-[0_10px_24px_rgba(14,12,10,.08)]"
          >
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <div className="flex min-w-0 items-center justify-end gap-2 text-right">
                <span className="truncate text-base font-black leading-tight text-[#0E0C0A]">{match.homeTeam.name}</span>
                <TeamFlag team={match.homeTeam} width={28} />
              </div>
              <span className="shrink-0 rounded bg-[#0E0C0A]/[0.06] px-2 py-1 text-xs font-black uppercase text-[#0E0C0A]/45">vs</span>
              <div className="flex min-w-0 items-center gap-2">
                <TeamFlag team={match.awayTeam} width={28} />
                <span className="truncate text-base font-black leading-tight text-[#0E0C0A]">{match.awayTeam.name}</span>
              </div>
            </div>
            <p className="mt-3 text-sm font-black text-[#B48A00]">
              {match.kickoffUtc ? `${formatKickoff(match.kickoffUtc, timeZone)} · Local time` : "Local time not added yet"}
            </p>
            <p className="mt-1 text-sm font-bold text-[#0E0C0A]/56">
              {hasVenue ? `${match.venue}, ${match.city}` : "Venue to be confirmed"}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
