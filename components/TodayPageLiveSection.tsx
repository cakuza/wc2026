"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Flag } from "@/components/Flag";
import { MatchTime } from "@/components/MatchTime";
import { type MatchCenterLiveSnapshot } from "@/components/MatchCenterContent";
import { getParticipantDisplay } from "@/lib/participant-resolution";
import { matchSlug, ARCHIVE_DEFAULT_DATE, type Match } from "@/lib/matches";
import type { LiveMatchData } from "@/lib/liveMatchData";
import type { GoalScorerEvent } from "@/lib/worldcup26Provider";
import { getMatchPresentation } from "@/lib/matchPresentation";
import { reconcileGoalEvents } from "@/lib/scoreReconciliation";
import { useTimezone } from "@/components/TimezoneProvider";

function shortScorerName(playerName: string) {
  if (playerName.includes(".")) return playerName;
  const parts = playerName.trim().split(/\s+/);
  return parts[parts.length - 1] ?? playerName;
}

function scorerText(events: GoalScorerEvent[] | undefined) {
  if (!events || events.length === 0) return null;
  return events
    .map((e) => {
      const minute = e.minuteLabel ?? (e.minute != null ? `${e.minute}'` : "");
      const name = shortScorerName(e.playerName);
      return `${minute ? `${minute} ` : ""}${name}${e.isOwnGoal ? " (OG)" : e.isPenalty || e.type === "PENALTY_GOAL" ? " (P)" : ""}`;
    })
    .join(" • ");
}

function TodaySummary({
  matches,
  snapshot,
}: {
  matches: Match[];
  snapshot: MatchCenterLiveSnapshot;
}) {
  const [now, setNow] = useState(new Date(ARCHIVE_DEFAULT_DATE));
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setNow(new Date());
    setHydrated(true);
  }, []);
  const tz = useTimezone().timeZone || "UTC";

  let next: Match | null = null;
  const liveMatches: Match[] = [];

  for (const m of matches) {
    const live = m.providerIds?.footballData ? snapshot.liveDataByProviderId[String(m.providerIds.footballData)] : undefined;
    const pres = getMatchPresentation({ match: m, liveData: live, timeZone: tz, now: hydrated ? now : new Date(ARCHIVE_DEFAULT_DATE) });
    if (pres.state === "live" || pres.state === "halftime") {
      liveMatches.push(m);
    } else if (pres.state === "scheduled") {
      if (!next) next = m;
    }
  }

  if (liveMatches.length === 0 && !next) return null;

  return (
    <section className="mb-8 rounded-xl border border-white/10 bg-navyCard px-5 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {liveMatches.length > 0 && (
          <div>
            <p className="font-heading text-[11px] font-bold uppercase tracking-widest text-red-400">
              <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
              Live Now
            </p>
            <div className="mt-1 space-y-1">
              {liveMatches.map((match) => {
                const homeDisplay = getParticipantDisplay(match, "home", snapshot.resolvedParticipants);
                const awayDisplay = getParticipantDisplay(match, "away", snapshot.resolvedParticipants);
                const live = match.providerIds?.footballData ? snapshot.liveDataByProviderId[String(match.providerIds.footballData)] : undefined;
                const pres = getMatchPresentation({ match, liveData: live, timeZone: tz, now: hydrated ? now : new Date(ARCHIVE_DEFAULT_DATE) });
                return (
                  <p key={matchSlug(match)}>
                    <Link href={`/matches/${matchSlug(match)}`} className="font-semibold text-white hover:text-accent">
                      {homeDisplay.label} vs {awayDisplay.label} - {pres.showScore ? `${pres.homeScore}-${pres.awayScore}` : "score syncing"}
                    </Link>
                  </p>
                );
              })}
            </div>
          </div>
        )}

        {next && (
          <div>
            <p className="font-heading text-[11px] font-bold uppercase tracking-widest text-white/35">
              Next kickoff
            </p>
            <p className="mt-1">
              <Link href={`/matches/${matchSlug(next)}`} className="font-semibold text-white hover:text-accent">
                {getParticipantDisplay(next, "home", snapshot.resolvedParticipants).label} vs {getParticipantDisplay(next, "away", snapshot.resolvedParticipants).label}
              </Link>{" "}
              - <span className="font-semibold text-white/80" suppressHydrationWarning>
                {getMatchPresentation({ match: next, liveData: next.providerIds?.footballData ? snapshot.liveDataByProviderId[String(next.providerIds.footballData)] : undefined, timeZone: tz, now: hydrated ? now : new Date(ARCHIVE_DEFAULT_DATE) }).displayKickoffTime}
              </span>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function MatchRow({
  m,
  snapshot,
  liveDataUnavailable,
}: {
  m: Match;
  snapshot: MatchCenterLiveSnapshot;
  liveDataUnavailable?: boolean;
}) {
  const { timeZone } = useTimezone();
  const tz = timeZone || "UTC";

  const [now, setNow] = useState(new Date(ARCHIVE_DEFAULT_DATE));
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setNow(new Date());
    setHydrated(true);
  }, []);

  const live = m.providerIds?.footballData ? snapshot.liveDataByProviderId[String(m.providerIds.footballData)] : undefined;
  const homeDisplay = getParticipantDisplay(m, "home", snapshot.resolvedParticipants);
  const awayDisplay = getParticipantDisplay(m, "away", snapshot.resolvedParticipants);

  const pres = getMatchPresentation({
    match: m,
    liveData: liveDataUnavailable ? undefined : live,
    timeZone: tz,
    now: hydrated ? now : new Date(ARCHIVE_DEFAULT_DATE)
  });

  const { confirmedEvents, scorerDetailsIncomplete } = reconcileGoalEvents({
    homeScore: pres.homeScore,
    awayScore: pres.awayScore,
    homeTeamName: homeDisplay.label,
    awayTeamName: awayDisplay.label,
    events: snapshot.scorersByMatchId[matchSlug(m)] ?? [],
  });
  const goals = liveDataUnavailable ? null : scorerText(confirmedEvents);

  const isUnresolved = !homeDisplay.isResolved || !awayDisplay.isResolved;

  if (isUnresolved) {
    const stageName =
      m.stage === "F"
        ? "Final"
        : m.stage === "3P"
        ? "Third-place playoff"
        : "Match";
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-white/10 bg-navyCard px-4 py-3 text-center transition hover:border-white/20 hover:bg-white/5">
        <p className="text-sm font-semibold text-white/70">{stageName} — teams to be decided</p>
        <p className="text-xs text-white/40">Participants will be confirmed once previous matches conclude.</p>
      </div>
    );
  }

  const statusMap: Record<string, string> = {
    scheduled: "Scheduled",
    live: "Live",
    halftime: "HT",
    final: "FT",
    syncing: "Syncing",
    postponed: "Postponed",
    cancelled: "Cancelled",
  };

  return (
    <Link
      href={`/matches/${matchSlug(m)}`}
      className="flex flex-col gap-2 rounded-lg border border-white/10 bg-navyCard px-4 py-3 transition hover:border-white/20 hover:bg-white/5"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div data-today-score-cluster className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-end">
              <span className="truncate font-semibold text-white">{homeDisplay.label}</span>
              {homeDisplay.teamCode ? <Flag code={homeDisplay.teamCode} alt="" width={30} height={22} /> : null}
            </div>
            {pres.showScore ? (
              <span className="shrink-0 font-heading text-sm font-extrabold tabular-nums text-white">
                {pres.homeScore}-{pres.awayScore}
              </span>
            ) : (
              <span className="shrink-0 rounded bg-navy px-2 py-1 font-heading text-xs font-bold uppercase text-white/50">
                vs
              </span>
            )}
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {awayDisplay.teamCode ? <Flag code={awayDisplay.teamCode} alt="" width={30} height={22} /> : null}
              <span className="truncate font-semibold text-white">{awayDisplay.label}</span>
            </div>
          </div>
          {goals ? <p className="mt-1.5 truncate text-center text-[11px] text-white/40">Goals: {goals}</p> : null}
          {scorerDetailsIncomplete && (pres.state === "live" || pres.state === "syncing") ? (
            <p className="mt-1.5 text-center text-[11px] text-white/40">Scorer details are still syncing.</p>
          ) : null}
        </div>
        <div data-today-right-meta className="flex shrink-0 items-center justify-between gap-3 text-xs text-white/50 sm:w-36 sm:flex-col sm:items-end sm:text-end">
          <div className="flex items-center gap-2 sm:justify-end">
            {pres.showStatus === false && !liveDataUnavailable ? (
              <span className="font-semibold text-white/80" suppressHydrationWarning>
                {pres.displayKickoffTime}
              </span>
            ) : null}
            {liveDataUnavailable && (
              <span className="rounded bg-amber-400/15 px-1.5 py-0.5 font-heading text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
                Live data unavailable
              </span>
            )}
            {pres.showStatus && !liveDataUnavailable && (
              <span className={`rounded px-1.5 py-0.5 font-heading text-[10px] font-extrabold uppercase tracking-widest ${
                pres.state === "live" || pres.state === "halftime"
                  ? "bg-red-600 text-white"
                  : pres.state === "final"
                  ? "bg-white/10 text-white/60"
                  : "bg-white/5 text-white/30"
              }`}>
                {statusMap[pres.state]}
              </span>
            )}
          </div>
          <div>
            {m.group ? `Group ${m.group}` : ""}
            {m.group && m.venue ? " • " : ""}
            {m.venue ?? ""}
          </div>
        </div>
      </div>
    </Link>
  );
}

type DayGroup = { date: string; matches: Match[] };

export function TodayPageLiveSection({
  days,
  summaryMatches,
  isToday,
  showUpcomingFallback,
  initialSnapshot,
  initialLiveDataUnavailableByMatchId,
  longDate,
}: {
  days: DayGroup[];
  summaryMatches: Match[];
  isToday: boolean;
  showUpcomingFallback: boolean;
  initialSnapshot: MatchCenterLiveSnapshot;
  initialLiveDataUnavailableByMatchId: Record<string, boolean>;
  longDate: Record<string, string>;
}) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [liveDataUnavailableByMatchId, setLiveDataUnavailableByMatchId] = useState(initialLiveDataUnavailableByMatchId);

  // Containment mode: client-side fetch loop removed. Snapshot is served from
  // server props only. Scores update on ISR revalidation (hourly), not polling.

  return (
    <>
      {isToday && summaryMatches.length > 0 && (
        <TodaySummary matches={summaryMatches} snapshot={snapshot} />
      )}

      <div className="space-y-8">
        {days.map(({ date, matches }) => (
          <section key={date}>
            <h2 className="mb-3 border-b-2 border-accent pb-2 font-heading text-xl font-extrabold uppercase tracking-wide text-white">
              {showUpcomingFallback ? "Next" : isToday ? "Today" : "Matches"} — {longDate[date]}
            </h2>
            <div className="space-y-2">
              {matches.map((m, i) => (
                <MatchRow
                  key={`${date}-${i}`}
                  m={m}
                  snapshot={snapshot}
                  liveDataUnavailable={liveDataUnavailableByMatchId[matchSlug(m)]}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
