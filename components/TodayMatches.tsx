"use client";
import { getParticipantDisplay, type ResolvedParticipantLookup } from "@/lib/participant-resolution";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flag } from "@/components/Flag";
import { MatchTime } from "@/components/MatchTime";
import { TimezoneLabel } from "@/components/TimezoneLabel";
import { FreshnessLabel } from "@/components/FreshnessLabel";
import { useLang } from "@/components/LanguageProvider";
import { useTimezone } from "@/components/TimezoneProvider";
import { matchSlug, matchUtcDate, type DisplayMatchday, type Match } from "@/lib/matches";
import { getDisplayMatchdayForTimeZone } from "@/lib/todaySelection";
import type { LiveMatchData } from "@/lib/liveMatchData";
import type { GoalScorerEvent } from "@/lib/worldcup26Provider";
import { reconcileGoalEvents } from "@/lib/scoreReconciliation";
import { mergeResolvedParticipantsFromApiMatches } from "@/lib/resolvedParticipantsFromApi";

import { applyCanonicalMatchResultFallback } from "@/lib/canonicalMatchResults";

export type TodayLiveSnapshot = {
  snapshotId: string;
  generatedAt: string;
  liveDataByProviderId: Record<string, LiveMatchData>;
  scorersByMatchId: Record<string, GoalScorerEvent[]>;
  resolvedParticipants: ResolvedParticipantLookup;
  primaryProviderFetchedAt: string | null;
  primaryProviderOk: boolean;
};

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

function MatchRow({
  m,
  live,
  scorers,
  resolvedParticipants,
}: {
  m: Match;
  live: LiveMatchData | undefined;
  scorers?: GoalScorerEvent[];
  resolvedParticipants?: ResolvedParticipantLookup;
}) {
  const { t, lang } = useLang();
  const home = getParticipantDisplay(m, "home", resolvedParticipants, lang);
  const away = getParticipantDisplay(m, "away", resolvedParticipants, lang);
  const hasScore = live && live.homeScore !== null && live.awayScore !== null;
  const isLive = live?.status === "IN_PLAY" || live?.status === "PAUSED";
  const isFinished = live?.status === "FINISHED";
  const { confirmedEvents, scorerDetailsIncomplete } = reconcileGoalEvents({
    homeScore: live?.homeScore ?? null,
    awayScore: live?.awayScore ?? null,
    homeTeamName: home.label,
    awayTeamName: away.label,
    events: scorers ?? [],
  });
  const goals = scorerText(confirmedEvents);

  return (
    <Link
      href={`/matches/${matchSlug(m)}`}
      prefetch={false}
      className="block rounded-lg border border-white/10 bg-navy px-3 py-2.5 transition hover:border-white/20"
    >
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <span className="min-w-0 truncate text-sm font-bold text-white">{home.label}</span>
          {home.teamCode && <Flag code={home.teamCode} alt="" width={28} height={20} />}
        </div>

        {hasScore ? (
          <span className="shrink-0 px-1 font-heading text-base font-extrabold tabular-nums text-white">
            {live!.homeScore}–{live!.awayScore}
          </span>
        ) : (
          <span className="shrink-0 px-1 font-heading text-[11px] font-bold uppercase text-white/55">{t("vs")}</span>
        )}

        <div className="flex min-w-0 flex-1 items-center gap-2">
          {away.teamCode && <Flag code={away.teamCode} alt="" width={28} height={20} />}
          <span className="min-w-0 truncate text-sm font-bold text-white">{away.label}</span>
        </div>
      </div>

      <div className="mt-1.5 flex items-center justify-center gap-2 text-[11px] text-white/50">
        {isLive && (
          <span className="flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 font-heading text-[10px] font-extrabold uppercase tracking-widest text-white">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            {live!.status === "PAUSED" ? "HT" : "Live"}
          </span>
        )}
        {isFinished && (
          <span className="rounded bg-white/10 px-1.5 py-0.5 font-heading text-[10px] font-extrabold uppercase tracking-widest text-white/60">
            FT
          </span>
        )}
        {!hasScore && !isLive && !isFinished && <MatchTime match={m} className="font-semibold text-white/75" />}
        {m.venue ? <span className="truncate">{m.venue}</span> : null}
      </div>

      {goals ? <p className="mt-1 truncate text-center text-[11px] text-white/40">Goals: {goals}</p> : null}
      {isLive && scorerDetailsIncomplete ? (
        <p className="mt-1 text-center text-[11px] text-white/40">Scorer details are still syncing.</p>
      ) : null}
    </Link>
  );
}

export function statusRank(live: LiveMatchData | undefined): number {
  if (live?.status === "IN_PLAY" || live?.status === "PAUSED") return 0; // live first
  if (!live || live.status === "SCHEDULED" || live.status === "TIMED") return 1; // then upcoming
  return 2; // then finished
}

/** Live-first, then upcoming by kickoff asc, then finished newest-first. */
export function orderMatches(matches: Match[], liveDataByProviderId: Record<string, LiveMatchData>): Match[] {
  return [...matches].sort((a, b) => {
    const liveA = a.providerIds?.footballData ? liveDataByProviderId[String(a.providerIds.footballData)] : undefined;
    const liveB = b.providerIds?.footballData ? liveDataByProviderId[String(b.providerIds.footballData)] : undefined;
    const rankA = statusRank(liveA);
    const rankB = statusRank(liveB);
    if (rankA !== rankB) return rankA - rankB;

    const timeA = matchUtcDate(a).getTime();
    const timeB = matchUtcDate(b).getTime();
    return rankA === 2 ? timeB - timeA : timeA - timeB; // finished: newest first
  });
}



import { getTodayHref } from "@/lib/todaySelection";

export function TodayMatches({
  initialMatchday,
  liveSnapshot,
}: {
  initialMatchday: DisplayMatchday;
  liveSnapshot: TodayLiveSnapshot;
}) {
  const { t, formatDate } = useLang();
  const { timeZone } = useTimezone();
  const tz = timeZone || "UTC";
  const todayHref = getTodayHref(tz);

  // Computed in an effect so the chosen matchday always reflects the *client's* current date
  // (avoids any server/client date drift), while the initial value keeps SSR stable.
  const [md, setMd] = useState(initialMatchday);
  useEffect(() => {
    setMd(
      getDisplayMatchdayForTimeZone({
        timeZone,
        resolvedParticipants: liveSnapshot.resolvedParticipants,
        liveDataByProviderId: liveSnapshot.liveDataByProviderId,
      })
    );
  }, [timeZone, liveSnapshot]);

  const dateLabel = md.days
    ? `${formatDate(md.days[0].date)} – ${formatDate(md.days[md.days.length - 1].date)}`
    : formatDate(md.date);

  const renderMatches = (matches: Match[]) =>
    orderMatches(matches, liveSnapshot.liveDataByProviderId).map((m, i) => (
      <MatchRow
        key={`${matchSlug(m)}-${i}`}
        m={m}
        live={m.providerIds?.footballData ? liveSnapshot.liveDataByProviderId[String(m.providerIds.footballData)] : undefined}
        scorers={liveSnapshot.scorersByMatchId[matchSlug(m)]}
        resolvedParticipants={liveSnapshot.resolvedParticipants}
      />
    ));

  return (
    <div className="rounded-xl border border-white/10 bg-navyCard p-5 shadow-2xl sm:p-6">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-heading text-sm font-extrabold uppercase tracking-[0.2em] text-accent">{t(md.labelKey)}</p>
        <span className="font-heading text-xs font-bold uppercase tracking-wide text-white/50">{dateLabel}</span>
      </div>
      <p className="mb-1 text-[11px] leading-snug text-white/55">{t("today_intro")}</p>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <TimezoneLabel className="text-[11px] text-white/55" />
        <FreshnessLabel
          primaryProviderFetchedAt={liveSnapshot.primaryProviderFetchedAt}
          primaryProviderOk={liveSnapshot.primaryProviderOk}
        />
      </div>

      {/* Multi-day mode: group matches under date subheaders — fully expanded, no scroll */}
      {md.days ? (
        <div className="space-y-4">
          {md.days.map(({ date, matches }) => (
            <div key={date}>
              <p className="mb-2 font-heading text-[11px] font-bold uppercase tracking-widest text-white/55">
                {formatDate(date)}
              </p>
              <div className="space-y-2">{renderMatches(matches)}</div>
            </div>
          ))}
        </div>
      ) : (
        /* Single-day mode */
        <div className="space-y-2">{renderMatches(md.matches)}</div>
      )}

      <Link
        href={todayHref}
        className="mt-4 block text-center font-heading text-xs font-bold uppercase tracking-wide text-accent transition hover:text-white"
      >
        See today&apos;s matches →
      </Link>
    </div>
  );
}
