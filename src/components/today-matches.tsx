"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TeamFlag } from "@/components/team-flag";
import type { MatchWithTeams } from "@/lib/types";
import { formatKickoff, getBrowserTimezone } from "@/lib/timezones";

// Schedule-only matchday board (no scores yet). Local kickoff time is resolved on the
// client from the visitor's timezone; date, stadium and city come from the fixtures data.
export function TodayMatches({ matches }: { matches: MatchWithTeams[] }) {
  const [timeZone, setTimeZone] = useState("Europe/Istanbul");

  useEffect(() => {
    setTimeZone(getBrowserTimezone());
  }, []);

  if (!matches.length) {
    return <p className="text-sm font-bold text-[#0E0C0A]/56">No matches scheduled yet.</p>;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {matches.map((match) => {
        const hasVenue = match.venue !== "TBD" && match.city !== "TBD";
        return (
          <Link
            key={match.id}
            href={`/cards?template=prediction&match=${match.id}`}
            className="rounded-md border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] p-4 transition hover:bg-white hover:shadow-[0_10px_24px_rgba(14,12,10,.08)]"
          >
            <div className="flex items-center gap-2">
              <TeamFlag team={match.homeTeam} width={32} />
              <span className="min-w-0 truncate text-lg font-black uppercase leading-none text-[#0E0C0A] [font-family:Impact,Arial_Black,sans-serif]">{match.homeTeam.name}</span>
              <span className="shrink-0 text-base font-black uppercase text-[#0E0C0A]/45 [font-family:Impact,Arial_Black,sans-serif]">vs</span>
              <span className="min-w-0 truncate text-lg font-black uppercase leading-none text-[#0E0C0A] [font-family:Impact,Arial_Black,sans-serif]">{match.awayTeam.name}</span>
              <TeamFlag team={match.awayTeam} width={32} />
            </div>
            <p className="mt-3 text-sm font-black text-[#B48A00]">
              {match.kickoffUtc ? formatKickoff(match.kickoffUtc, timeZone) : "Local time not added yet"}
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
