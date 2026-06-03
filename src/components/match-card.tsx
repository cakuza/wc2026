import Link from "next/link";
import { CalendarDays, Eye, MapPin, PenLine } from "lucide-react";
import { DataStatusNotice } from "@/components/data-status-notice";
import { StatusBadge } from "@/components/status-badge";
import type { MatchWithTeams } from "@/lib/types";
import { formatKickoff } from "@/lib/timezones";

export function MatchCard({ match, timeZone = "Europe/Istanbul" }: { match: MatchWithTeams; timeZone?: string }) {
  return (
    <article className="relative overflow-hidden rounded-lg bg-[linear-gradient(135deg,#fff7d1,rgba(255,255,255,.94)_42%,#b8f1d7)] p-4 text-pitch shadow-[0_22px_70px_rgba(0,0,0,.24)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[repeating-linear-gradient(90deg,rgba(5,30,22,.14)_0_1px,transparent_1px_28px)]" />
      <div className="relative">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <StatusBadge label={match.dataStatus === "schedulePending" ? "Fixture slot" : match.status === "scheduled" ? "Pre-match" : match.status} variant="prelaunch" />
        <StatusBadge label={match.kickoffUtc ? "Local time ready" : "Time unavailable"} variant="local" />
        {match.group ? <StatusBadge label={`Group ${match.group}`} variant="sample" /> : null}
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
        <TeamBlock flag={match.homeTeam.flagEmoji} code={match.homeTeam.fifaCode} name={match.homeTeam.name} slug={match.homeTeam.slug} align="left" />
        <div className="rounded-md bg-pitch px-3 py-2 text-sm font-black text-white">VS</div>
        <TeamBlock flag={match.awayTeam.flagEmoji} code={match.awayTeam.fifaCode} name={match.awayTeam.name} slug={match.awayTeam.slug} align="right" />
      </div>
      <div className="mt-4 grid gap-2 text-sm font-bold text-pitch/72">
        <span className="flex items-center gap-2">
          <CalendarDays size={15} className="text-gold" />
          <span>{formatKickoff(match.kickoffUtc, timeZone)}</span>
          {match.kickoffUtc ? <span className="text-pitch/45">({timeZone})</span> : <span className="text-pitch/45">Local time unavailable</span>}
        </span>
        <span className="flex items-center gap-2">
          <MapPin size={15} className="text-gold" />
          {match.venue === "TBD" || match.city === "TBD" ? "Venue unavailable" : `${match.venue}, ${match.city}`}
        </span>
      </div>
      {match.dataStatus === "schedulePending" ? (
        <details className="mt-4 rounded-lg border border-white/10 bg-white/[0.035] p-3">
          <summary className="cursor-pointer text-sm font-black text-pitch">Data status</summary>
          <DataStatusNotice variant="schedulePending" compact className="mt-3" />
        </details>
      ) : null}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Link href={`/matches/${match.id}`} className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-pitch/14 px-3 py-2 text-sm font-bold text-pitch">
          <Eye size={15} />
          Opponent watch
        </Link>
        <Link href="/preview" className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-pitch/14 px-3 py-2 text-sm font-bold text-pitch">
          <PenLine size={15} />
          Preview post
        </Link>
      </div>
      </div>
    </article>
  );
}

function TeamBlock({
  code,
  flag,
  name,
  slug,
  align
}: {
  code: string;
  flag?: string;
  name: string;
  slug: string;
  align: "left" | "right";
}) {
  return (
    <Link href={`/teams/${slug}`} className={align === "right" ? "text-right" : ""}>
      <span className="mb-1 inline-grid h-10 w-10 place-items-center rounded-md border border-gold/30 bg-gold/10 text-sm font-black text-gold">
        {flag || code}
      </span>
      <h3 className="text-sm font-black text-pitch sm:text-base md:text-lg">{name}</h3>
      <p className="text-xs font-bold text-pitch/45">{code}</p>
    </Link>
  );
}
