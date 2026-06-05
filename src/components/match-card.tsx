import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { AddToCalendarButton } from "@/components/add-to-calendar-button";
import { DataStatusNotice } from "@/components/data-status-notice";
import { StatusBadge } from "@/components/status-badge";
import { TeamFlag } from "@/components/team-flag";
import type { MatchWithTeams, Team } from "@/lib/types";
import { formatKickoff } from "@/lib/timezones";

export function MatchCard({ match, timeZone = "Europe/Istanbul" }: { match: MatchWithTeams; timeZone?: string }) {
  return (
    <article className="relative overflow-hidden rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 text-[#0E0C0A] shadow-[0_10px_24px_rgba(14,12,10,.06)]">
      <div className="absolute right-3 top-3 z-10">
        <AddToCalendarButton match={match} iconOnly />
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2 pr-10">
        <StatusBadge label={match.dataStatus === "schedulePending" ? "Fixture slot" : match.status === "scheduled" ? "Pre-match" : match.status} variant="prelaunch" />
        {match.group ? <StatusBadge label={`Group ${match.group}`} variant="sample" /> : null}
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
        <TeamBlock team={match.homeTeam} align="left" />
        <div className="rounded-md bg-[#F6F4F1] px-3 py-2 text-sm font-black text-[#0E0C0A]/55">VS</div>
        <TeamBlock team={match.awayTeam} align="right" />
      </div>
      <div className="mt-4 grid gap-2 text-sm font-bold text-[#0E0C0A]/70">
        <span className="flex items-center gap-2">
          <CalendarDays size={15} className="text-[#B48A00]" />
          <span>{formatKickoff(match.kickoffUtc, timeZone)}</span>
          {match.kickoffUtc ? <span className="text-[#0E0C0A]/45">Local time</span> : <span className="text-[#0E0C0A]/45">Local time unavailable</span>}
        </span>
        <span className="flex items-center gap-2">
          <MapPin size={15} className="text-[#B48A00]" />
          {match.venue === "TBD" || match.city === "TBD" ? "Venue unavailable" : `${match.venue}, ${match.city}`}
        </span>
      </div>
      {match.dataStatus === "schedulePending" ? (
        <details className="mt-4 rounded-lg border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] p-3">
          <summary className="cursor-pointer text-sm font-black text-[#0E0C0A]">Data status</summary>
          <DataStatusNotice variant="schedulePending" compact className="mt-3" />
        </details>
      ) : null}
    </article>
  );
}

function TeamBlock({ team, align }: { team: Team; align: "left" | "right" }) {
  return (
    <Link href={`/teams/${team.slug}`} className={align === "right" ? "grid justify-items-end text-right" : "grid justify-items-start"}>
      <TeamFlag team={team} width={40} className="mb-1" />
      <h3 className="text-sm font-black text-[#0E0C0A] sm:text-base md:text-lg">{team.name}</h3>
      <p className="text-xs font-bold text-[#0E0C0A]/45">{team.fifaCode}</p>
    </Link>
  );
}
