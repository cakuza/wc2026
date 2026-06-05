"use client";

import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { TeamFlag } from "@/components/team-flag";
import { useTimezone } from "@/components/timezone-provider";
import { formatKickoff } from "@/lib/timezones";
import type { MatchWithTeams } from "@/lib/types";

// Group fixtures split into the three round-robin matchdays. Kickoff times resolve from the
// site-wide timezone selection; date, stadium and city come straight from the fixtures data.
export function GroupFixtures({ matchdays }: { matchdays: MatchWithTeams[][] }) {
  const { timeZone } = useTimezone();

  return (
    <div className="grid gap-6">
      {matchdays.map((matches, index) => (
        <div key={index}>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-[#B48A00]">Matchday {index + 1}</p>
          <div className="grid gap-3 md:grid-cols-2">
            {matches.map((match) => {
              const hasVenue = match.venue !== "TBD" && match.city !== "TBD";
              return (
                <Link
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 shadow-[0_8px_18px_rgba(14,12,10,.05)] transition hover:border-[#E7C36B]/60 hover:shadow-[0_14px_32px_rgba(14,12,10,.09)]"
                >
                  <div className="flex items-center gap-2.5">
                    <TeamFlag team={match.homeTeam} width={30} />
                    <span className="min-w-0 flex-1 truncate text-base font-black uppercase leading-tight text-[#0E0C0A]">{match.homeTeam.name}</span>
                    <span className="shrink-0 rounded bg-[#F6F4F1] px-2 py-1 text-xs font-black uppercase text-[#0E0C0A]/50">vs</span>
                    <span className="min-w-0 flex-1 truncate text-right text-base font-black uppercase leading-tight text-[#0E0C0A]">{match.awayTeam.name}</span>
                    <TeamFlag team={match.awayTeam} width={30} />
                  </div>
                  <div className="mt-3 grid gap-1.5 text-sm font-bold text-[#0E0C0A]/70">
                    <span className="flex items-center gap-2">
                      <CalendarDays size={15} className="text-[#B48A00]" />
                      {match.kickoffUtc ? `${formatKickoff(match.kickoffUtc, timeZone)} · Local time` : "Kickoff time to be confirmed"}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin size={15} className="text-[#B48A00]" />
                      {hasVenue ? `${match.venue}, ${match.city}` : "Venue to be confirmed"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
