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
import { fetchClientLiveSnapshot } from "@/lib/clientLiveSnapshot";
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

type ApiSnapshotMatchUpdate = {
  status: "SCHEDULED" | "LIVE" | "HALFTIME" | "SYNCING" | "FINISHED";
  homeScore: number | null;
  awayScore: number | null;
  winner?: LiveMatchData["winner"];
  scorers?: GoalScorerEvent[];
  resolvedHomeParticipant?: { teamKey: string; teamCode: string } | null;
  resolvedAwayParticipant?: { teamKey: string; teamCode: string } | null;
};

type ApiTodayLiveSnapshot = {
  snapshotId: string;
  generatedAt: string;
  updatedAt?: string;
  primaryProviderFetchedAt: string | null;
  primaryProviderOk: boolean;
  matches: Record<string, ApiSnapshotMatchUpdate>;
};

function apiStatusToLiveStatus(status: ApiSnapshotMatchUpdate["status"]): LiveMatchData["status"] {
  if (status === "LIVE") return "IN_PLAY";
  if (status === "HALFTIME") return "PAUSED";
  if (status === "FINISHED") return "FINISHED";
  if (status === "SYNCING") return "IN_PLAY";
  return "SCHEDULED";
}

export function applyTodaySnapshotUpdate(
  prev: TodayLiveSnapshot,
  data: ApiTodayLiveSnapshot,
  allMatches: Match[],
): TodayLiveSnapshot {
  const liveDataByProviderId: Record<string, LiveMatchData> = { ...prev.liveDataByProviderId };

  for (const match of allMatches) {
    const providerId = match.providerIds?.footballData;
    if (!providerId) continue;
    const update = data.matches[matchSlug(match)];
    if (!update) continue;
    const key = String(providerId);
    const previous = liveDataByProviderId[key];
    liveDataByProviderId[key] = {
      ...(previous ?? {
        provider: "football-data.org",
        providerMatchId: providerId,
        status: "SCHEDULED",
        homeScore: null,
        awayScore: null,
        winner: null,
        lastSyncedAt: data.updatedAt ?? data.generatedAt,
        eventDataAvailable: false,
      }),
      status: apiStatusToLiveStatus(update.status),
      homeScore: update.homeScore,
      awayScore: update.awayScore,
      winner: update.winner ?? previous?.winner ?? null,
      lastSyncedAt: data.updatedAt ?? data.generatedAt,
    };
  }

  for (const match of allMatches) {
    const providerId = match.providerIds?.footballData;
    if (!providerId) continue;
    const key = String(providerId);
    const normalized = applyCanonicalMatchResultFallback(match, liveDataByProviderId[key], data.updatedAt ?? data.generatedAt);
    if (normalized) liveDataByProviderId[key] = normalized;
  }

  return {
    snapshotId: data.snapshotId,
    generatedAt: data.generatedAt,
    resolvedParticipants: mergeResolvedParticipantsFromApiMatches(prev.resolvedParticipants, data.matches),
    primaryProviderFetchedAt: data.primaryProviderFetchedAt,
    primaryProviderOk: data.primaryProviderOk,
    liveDataByProviderId,
    scorersByMatchId: Object.fromEntries(
      Object.entries(data.matches).map(([id, match]) => [id, match.scorers ?? []]),
    ),
  };
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

/**
 * True while any match is currently live, or within 15 minutes of kickoff
 * (before or after) — the window in which the client should be polling
 * `/api/live-snapshot`. Must be evaluated against the *current* snapshot
 * state and clock, not a one-time initial value, so it reflects:
 *  - a match that starts live within the window,
 *  - a poll response that flips a match to IN_PLAY,
 *  - the clock advancing past kickoff + 15 minutes (stop polling).
 */
export function isLiveOrImminent(
  matches: Match[],
  liveDataByProviderId: Record<string, LiveMatchData>,
  now: number,
): boolean {
  return matches.some((m) => {
    const live = m.providerIds?.footballData ? liveDataByProviderId[String(m.providerIds.footballData)] : undefined;
    if (live?.status === "IN_PLAY" || live?.status === "PAUSED") return true;
    const kickoffMs = matchUtcDate(m).getTime();
    return Math.abs(kickoffMs - now) <= 15 * 60 * 1000;
  });
}

export function TodayMatches({
  initialMatchday,
  liveSnapshot,
}: {
  initialMatchday: DisplayMatchday;
  liveSnapshot: TodayLiveSnapshot;
}) {
  const { t, formatDate } = useLang();
  const { timeZone } = useTimezone();
  // Computed in an effect so the chosen matchday always reflects the *client's* current date
  // (avoids any server/client date drift), while the initial value keeps SSR stable.
  const [md, setMd] = useState(initialMatchday);
  useEffect(() => {
    setMd(getDisplayMatchdayForTimeZone({ timeZone }));
  }, [timeZone]);

  const [snapshot, setSnapshot] = useState(liveSnapshot);

  // Ticks periodically so hasLiveOrImminent re-evaluates as kickoff approaches
  // or passes, even while no poll-driven re-render has happened yet.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const allMatches = md.days ? md.days.flatMap((d) => d.matches) : md.matches;
  // Uses the live React state (snapshot), not the initial liveSnapshot prop, so
  // a poll that flips a match to IN_PLAY (or FINISHED) is reflected immediately.
  const hasLiveOrImminent = isLiveOrImminent(allMatches, snapshot.liveDataByProviderId, now);

  // Poll the lightweight internal live-snapshot endpoint while a match is live
  // or starting soon — reads the shared server snapshot, never the upstream
  // provider directly, so request volume stays bounded regardless of visitor count.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let inFlight = false;

    async function poll(shouldContinue: boolean = hasLiveOrImminent) {
      if (cancelled || inFlight) {
        if (shouldContinue && !document.hidden) schedule();
        return;
      }
      inFlight = true;
      try {
        const data = shouldContinue
          ? await fetch("/api/live-snapshot").then((res) => (res.ok ? res.json() : null))
          : await fetchClientLiveSnapshot();
        if (data) {
          if (!cancelled) {
            setSnapshot((prev) => applyTodaySnapshotUpdate(prev, data, allMatches));
          }
        }
      } catch {
        // keep last known snapshot; retry on next tick
      } finally {
        inFlight = false;
        if (shouldContinue && !document.hidden) schedule();
      }
    }

    function schedule() {
      if (cancelled || document.hidden) return;
      const jitter = Math.floor(Math.random() * 5_000);
      timer = setTimeout(() => poll(hasLiveOrImminent), 30_000 + jitter);
    }

    function handleVisibilityChange() {
      if (!document.hidden) {
        if (timer) clearTimeout(timer);
        poll(hasLiveOrImminent);
      } else {
        if (timer) clearTimeout(timer);
      }
    }

    // Always fetch once on mount to ensure we have the latest data,
    // regardless of whether there is a live match.
    poll(hasLiveOrImminent);
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasLiveOrImminent]);

  const dateLabel = md.days
    ? `${formatDate(md.days[0].date)} – ${formatDate(md.days[md.days.length - 1].date)}`
    : formatDate(md.date);

  const renderMatches = (matches: Match[]) =>
    orderMatches(matches, snapshot.liveDataByProviderId).map((m, i) => (
      <MatchRow
        key={`${matchSlug(m)}-${i}`}
        m={m}
        live={m.providerIds?.footballData ? snapshot.liveDataByProviderId[String(m.providerIds.footballData)] : undefined}
        scorers={snapshot.scorersByMatchId[matchSlug(m)]}
        resolvedParticipants={snapshot.resolvedParticipants}
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
          primaryProviderFetchedAt={snapshot.primaryProviderFetchedAt}
          primaryProviderOk={snapshot.primaryProviderOk}
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
        href="/today"
        className="mt-4 block text-center font-heading text-xs font-bold uppercase tracking-wide text-accent transition hover:text-white"
      >
        See today&apos;s matches →
      </Link>
    </div>
  );
}
