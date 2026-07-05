"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Flag } from "@/components/Flag";
import { MatchTime } from "@/components/MatchTime";
import { applyTodaySnapshotUpdate, type TodayLiveSnapshot } from "@/components/TodayMatches";
import { getParticipantDisplay } from "@/lib/participant-resolution";
import { fetchClientLiveSnapshot } from "@/lib/clientLiveSnapshot";
import { hasCanonicalCompletedResult } from "@/lib/canonicalMatchResults";
import { matchSlug, matchUtcDate, type Match } from "@/lib/matches";
import type { LiveMatchData } from "@/lib/liveMatchData";
import type { GoalScorerEvent } from "@/lib/worldcup26Provider";

function scoreText(live: LiveMatchData) {
  if (live.homeScore === null || live.awayScore === null) return null;
  return `${live.homeScore}-${live.awayScore}`;
}

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
    .join(" · ");
}

function teamLabel(match: Match, side: "home" | "away", snapshot: TodayLiveSnapshot): string {
  return getParticipantDisplay(match, side, snapshot.resolvedParticipants).label;
}

export function getTodayPageLabels(match: Match, snapshot: TodayLiveSnapshot) {
  return {
    home: teamLabel(match, "home", snapshot),
    away: teamLabel(match, "away", snapshot),
  };
}

function TodaySummary({
  matches,
  snapshot,
}: {
  matches: Match[];
  snapshot: TodayLiveSnapshot;
}) {
  const rows = matches
    .map((match) => {
      const live = match.providerIds?.footballData
        ? snapshot.liveDataByProviderId[String(match.providerIds.footballData)]
        : undefined;
      return { match, live };
    })
    .filter(({ live }) => !!live);

  const finished = rows.filter(
    ({ live }) => live?.status === "FINISHED" && live.homeScore !== null && live.awayScore !== null,
  );
  const syncing = rows.filter(
    ({ live }) =>
      (live?.status === "IN_PLAY" || live?.status === "PAUSED") &&
      (live.homeScore === null || live.awayScore === null),
  );
  const inProgress = rows.filter(
    ({ live }) =>
      (live?.status === "IN_PLAY" || live?.status === "PAUSED") &&
      live.homeScore !== null &&
      live.awayScore !== null,
  );
  const upcoming = matches
    .filter((match) => {
      const live = match.providerIds?.footballData
        ? snapshot.liveDataByProviderId[String(match.providerIds.footballData)]
        : undefined;
      return !live || live.status === "SCHEDULED" || live.status === "TIMED";
    })
    .sort((a, b) => matchUtcDate(a).getTime() - matchUtcDate(b).getTime());

  if (finished.length === 0 && syncing.length === 0 && inProgress.length === 0 && upcoming.length === 0) {
    return null;
  }

  const next = upcoming[0];

  return (
    <section className="mb-6 rounded-xl border border-white/10 bg-navyCard px-4 py-4">
      <h2 className="font-heading text-sm font-extrabold uppercase tracking-wide text-white">
        Today&apos;s matchday summary
      </h2>
      <div className="mt-3 space-y-3 text-sm text-white/70">
        {finished.length > 0 && (
          <div>
            <p className="font-heading text-[11px] font-bold uppercase tracking-widest text-white/35">
              Finished
            </p>
            <div className="mt-1 space-y-1">
              {finished.map(({ match, live }) => {
                const goals = scorerText(snapshot.scorersByMatchId[matchSlug(match)]);
                return (
                  <p key={matchSlug(match)}>
                    <Link href={`/matches/${matchSlug(match)}`} className="font-semibold text-white hover:text-accent">
                      {teamLabel(match, "home", snapshot)} {scoreText(live!)} {teamLabel(match, "away", snapshot)}
                    </Link>
                    {goals ? <span className="text-white/45"> · Goals: {goals}</span> : null}
                  </p>
                );
              })}
            </div>
          </div>
        )}

        {(inProgress.length > 0 || syncing.length > 0) && (
          <div>
            <p className="font-heading text-[11px] font-bold uppercase tracking-widest text-white/35">
              Score syncing
            </p>
            <div className="mt-1 space-y-1">
              {inProgress.map(({ match, live }) => (
                <p key={matchSlug(match)}>
                  <Link href={`/matches/${matchSlug(match)}`} className="font-semibold text-white hover:text-accent">
                    {teamLabel(match, "home", snapshot)} {scoreText(live!)} {teamLabel(match, "away", snapshot)} - LIVE
                  </Link>
                </p>
              ))}
              {syncing.map(({ match }) => (
                <p key={matchSlug(match)}>
                  <Link href={`/matches/${matchSlug(match)}`} className="font-semibold text-white hover:text-accent">
                    {teamLabel(match, "home", snapshot)} vs {teamLabel(match, "away", snapshot)} - score syncing
                  </Link>
                </p>
              ))}
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
                {teamLabel(next, "home", snapshot)} vs {teamLabel(next, "away", snapshot)}
              </Link>{" "}
              - <MatchTime match={next} withZone className="font-semibold text-white/80" />
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
  snapshot: TodayLiveSnapshot;
  liveDataUnavailable?: boolean;
}) {
  const live = m.providerIds?.footballData ? snapshot.liveDataByProviderId[String(m.providerIds.footballData)] : undefined;
  const home = teamLabel(m, "home", snapshot);
  const away = teamLabel(m, "away", snapshot);
  const homeDisplay = getParticipantDisplay(m, "home", snapshot.resolvedParticipants);
  const awayDisplay = getParticipantDisplay(m, "away", snapshot.resolvedParticipants);
  const hasScore = !liveDataUnavailable && live && live.homeScore !== null && live.awayScore !== null;
  const isLive = !liveDataUnavailable && (live?.status === "IN_PLAY" || live?.status === "PAUSED");
  const isFinished = !liveDataUnavailable && live?.status === "FINISHED";
  const goals = liveDataUnavailable ? null : scorerText(snapshot.scorersByMatchId[matchSlug(m)]);

  return (
    <Link
      href={`/matches/${matchSlug(m)}`}
      className="flex flex-col gap-2 rounded-lg border border-white/10 bg-navyCard px-4 py-3 transition hover:border-white/20 hover:bg-white/5"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div data-today-score-cluster className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-end">
              <span className="truncate font-semibold text-white">{home}</span>
              {homeDisplay.teamCode ? <Flag code={homeDisplay.teamCode} alt="" width={30} height={22} /> : null}
            </div>
            {hasScore ? (
              <span className="shrink-0 font-heading text-sm font-extrabold tabular-nums text-white">
                {live!.homeScore}-{live!.awayScore}
              </span>
            ) : (
              <span className="shrink-0 rounded bg-navy px-2 py-1 font-heading text-xs font-bold uppercase text-white/50">
                vs
              </span>
            )}
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {awayDisplay.teamCode ? <Flag code={awayDisplay.teamCode} alt="" width={30} height={22} /> : null}
              <span className="truncate font-semibold text-white">{away}</span>
            </div>
          </div>
          {goals ? <p className="mt-1.5 truncate text-center text-[11px] text-white/40">Goals: {goals}</p> : null}
        </div>
        <div data-today-right-meta className="flex shrink-0 items-center justify-between gap-3 text-xs text-white/50 sm:w-36 sm:flex-col sm:items-end sm:text-end">
          <div className="flex items-center gap-2 sm:justify-end">
            {!hasScore && !isLive && !isFinished && !liveDataUnavailable ? (
              <MatchTime match={m} withZone className="font-semibold text-white/80" />
            ) : null}
            {liveDataUnavailable && (
              <span className="rounded bg-amber-400/15 px-1.5 py-0.5 font-heading text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
                Live data unavailable
              </span>
            )}
            {isLive && hasScore && (
              <span className="rounded bg-red-600 px-1.5 py-0.5 font-heading text-[10px] font-extrabold uppercase tracking-widest text-white">
                {live?.status === "PAUSED" ? "HT" : "Live"}
              </span>
            )}
            {isLive && !hasScore && (
              <span className="rounded bg-white/5 px-1.5 py-0.5 font-heading text-[10px] font-extrabold uppercase tracking-widest text-white/30">
                Syncing
              </span>
            )}
            {isFinished && (
              <span className="rounded bg-white/10 px-1.5 py-0.5 font-heading text-[10px] font-extrabold uppercase tracking-widest text-white/60">
                FT
              </span>
            )}
            {!hasScore && !isLive && !isFinished && !liveDataUnavailable && (
              <span className="rounded bg-white/5 px-1.5 py-0.5 font-heading text-[10px] font-extrabold uppercase tracking-widest text-white/30">
                Scheduled
              </span>
            )}
          </div>
          <div>
            {m.group ? `Group ${m.group}` : ""}
            {m.group && m.venue ? " · " : ""}
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
  initialSnapshot: TodayLiveSnapshot;
  initialLiveDataUnavailableByMatchId: Record<string, boolean>;
  longDate: Record<string, string>;
}) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [liveDataUnavailableByMatchId, setLiveDataUnavailableByMatchId] = useState(initialLiveDataUnavailableByMatchId);
  const allMatches = useMemo(() => {
    const map = new Map<string, Match>();
    for (const match of [...summaryMatches, ...days.flatMap((day) => day.matches)]) {
      map.set(matchSlug(match), match);
    }
    return [...map.values()];
  }, [days, summaryMatches]);

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      const data = await fetchClientLiveSnapshot();
      if (!cancelled && data?.matches) {
        setSnapshot((prev) => applyTodaySnapshotUpdate(prev, data, allMatches));
        const canonicalAvailability = Object.fromEntries(
          allMatches
            .filter((match) => hasCanonicalCompletedResult(match))
            .map((match) => [matchSlug(match), false]),
        );
        setLiveDataUnavailableByMatchId((prev) => ({
          ...prev,
          ...Object.fromEntries(
            Object.entries(data.matches).map(([id, match]: [string, any]) => [id, Boolean(match.liveDataUnavailable)]),
          ),
          ...canonicalAvailability,
        }));
      }
    }
    refresh();
    return () => {
      cancelled = true;
    };
  }, [allMatches]);

  return (
    <>
      {isToday && summaryMatches.length > 0 && (
        <TodaySummary matches={summaryMatches} snapshot={snapshot} />
      )}

      <div className="space-y-8">
        {days.map(({ date, matches }) => (
          <section key={date}>
            <h2 className="mb-3 border-b-2 border-accent pb-2 font-heading text-xl font-extrabold uppercase tracking-wide text-white">
              {showUpcomingFallback ? "Next" : isToday ? "Today" : "Matches"} · {longDate[date]}
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
