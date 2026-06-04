"use client";

import Link from "next/link";
import { TeamFlag } from "@/components/team-flag";
import { useTimezone } from "@/components/timezone-provider";
import { formatKickoff, formatShortDate } from "@/lib/timezones";
import type { MatchWithTeams } from "@/lib/types";

// Tournament-first hero panel: a featured "Next match" card plus a short list of upcoming
// fixtures. Kickoff times use the site-wide timezone selection (resolved on the client).
export function NextMatchPanel({
  featured,
  upcoming
}: {
  featured?: MatchWithTeams;
  upcoming: MatchWithTeams[];
}) {
  const { timeZone } = useTimezone();

  if (!featured) {
    return null;
  }

  const venue = featured.venue !== "TBD" && featured.city !== "TBD" ? `${featured.venue}, ${featured.city}` : "Venue to be confirmed";

  return (
    <div className="grid gap-3">
      <Link
        href={`/matches/${featured.id}`}
        className="group relative overflow-hidden rounded-[22px] border border-[rgba(14,12,10,.10)] bg-[#0E0C0A] p-5 text-white shadow-[0_18px_50px_rgba(14,12,10,.18)] md:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_85%_10%,rgba(31,169,246,.22),transparent_70%)]" />
        <div className="relative">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#E7C36B]">Next match</p>
          <div className="mt-4 flex items-center justify-center gap-4 md:gap-6">
            <div className="grid justify-items-center gap-2 text-center">
              <TeamFlag team={featured.homeTeam} width={64} />
              <span className="max-w-[110px] text-sm font-black uppercase leading-tight">{featured.homeTeam.name}</span>
            </div>
            <span className="text-2xl font-black uppercase text-white/45 [font-family:Impact,Arial_Black,sans-serif]">vs</span>
            <div className="grid justify-items-center gap-2 text-center">
              <TeamFlag team={featured.awayTeam} width={64} />
              <span className="max-w-[110px] text-sm font-black uppercase leading-tight">{featured.awayTeam.name}</span>
            </div>
          </div>
          <div className="mt-5 grid gap-1 text-center">
            <p className="text-sm font-black text-white">
              {featured.kickoffUtc ? `${formatKickoff(featured.kickoffUtc, timeZone)} · Local time` : "Kickoff time to be confirmed"}
            </p>
            <p className="text-xs font-bold text-white/60">{venue}</p>
          </div>
        </div>
      </Link>

      {upcoming.length ? (
        <div className="rounded-[22px] border border-[rgba(14,12,10,.10)] bg-white p-3 shadow-[0_12px_30px_rgba(14,12,10,.06)] md:p-4">
          <p className="px-1 pb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#B48A00]">Upcoming matches</p>
          <ul className="grid gap-1.5">
            {upcoming.map((match) => (
              <li key={match.id}>
                <Link
                  href={`/matches/${match.id}`}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-md px-2 py-2 transition hover:bg-[#F6F4F1]"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <TeamFlag team={match.homeTeam} width={26} />
                    <span className="truncate text-sm font-black uppercase text-[#0E0C0A]">{match.homeTeam.fifaCode}</span>
                    <span className="text-xs font-black text-[#0E0C0A]/35">v</span>
                    <span className="truncate text-sm font-black uppercase text-[#0E0C0A]">{match.awayTeam.fifaCode}</span>
                    <TeamFlag team={match.awayTeam} width={26} />
                  </span>
                  <span className="shrink-0 text-xs font-bold text-[#0E0C0A]/55">
                    {match.kickoffUtc ? formatKickoff(match.kickoffUtc, timeZone) : formatShortDate(match.date, timeZone)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
