import Link from "next/link";
import { CalendarDays, ImageIcon, MapPin } from "lucide-react";
import { AddToCalendarButton } from "@/components/add-to-calendar-button";
import { DataStatusNotice } from "@/components/data-status-notice";
import { StatusBadge } from "@/components/status-badge";
import { TeamFlag } from "@/components/team-flag";
import type { MatchWithTeams, Team } from "@/lib/types";
import { formatKickoff } from "@/lib/timezones";

export function MatchCard({ match, timeZone = "Europe/Istanbul" }: { match: MatchWithTeams; timeZone?: string }) {
  return (
    <article className="relative overflow-hidden rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 text-[#0E0C0A] shadow-[0_10px_24px_rgba(14,12,10,.06)]">
      <div className="relative">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <StatusBadge label={match.dataStatus === "schedulePending" ? "Fixture slot" : match.status === "scheduled" ? "Pre-match" : match.status} variant="prelaunch" />
        {match.group ? <StatusBadge label={`Group ${match.group}`} variant="sample" /> : null}
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
        <TeamBlock team={match.homeTeam} align="left" />
        <div className="rounded-md bg-pitch px-3 py-2 text-sm font-black text-white">VS</div>
        <TeamBlock team={match.awayTeam} align="right" />
      </div>
      <div className="mt-4 grid gap-2 text-sm font-bold text-pitch/72">
        <span className="flex items-center gap-2">
          <CalendarDays size={15} className="text-gold" />
          <span>{formatKickoff(match.kickoffUtc, timeZone)}</span>
          {match.kickoffUtc ? <span className="text-pitch/45">Local time</span> : <span className="text-pitch/45">Local time unavailable</span>}
        </span>
        <span className="flex items-center gap-2">
          <MapPin size={15} className="text-gold" />
          {match.venue === "TBD" || match.city === "TBD" ? "Venue unavailable" : `${match.venue}, ${match.city}`}
        </span>
      </div>
      {match.dataStatus === "schedulePending" ? (
        <details className="mt-4 rounded-lg border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] p-3">
          <summary className="cursor-pointer text-sm font-black text-[#0E0C0A]">Data status</summary>
          <DataStatusNotice variant="schedulePending" compact className="mt-3" />
        </details>
      ) : null}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Link
          href={`/cards?template=prediction&match=${match.id}`}
          className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-pitch px-3 py-2 text-sm font-black text-white"
        >
          <ImageIcon size={15} />
          Create match card
        </Link>
        <AddToCalendarButton match={match} />
      </div>
      </div>
    </article>
  );
}

function TeamBlock({ team, align }: { team: Team; align: "left" | "right" }) {
  return (
    <Link href={`/teams/${team.slug}`} className={align === "right" ? "grid justify-items-end text-right" : "grid justify-items-start"}>
      <TeamFlag team={team} width={40} className="mb-1" />
      <h3 className="text-sm font-black text-pitch sm:text-base md:text-lg">{team.name}</h3>
      <p className="text-xs font-bold text-pitch/45">{team.fifaCode}</p>
    </Link>
  );
}
