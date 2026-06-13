"use client";

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

export type TodayLiveSnapshot = {
  snapshotId: string;
  generatedAt: string;
  liveDataByProviderId: Record<string, LiveMatchData>;
  scorersByMatchId: Record<string, GoalScorerEvent[]>;
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

function liveMinuteLabel(live: LiveMatchData): string | null {
  // football-data.org doesn't expose a clock directly here; fall back to a
  // generic LIVE/HT badge when we don't have a reliable elapsed minute.
  if (live.status === "PAUSED") return "HT";
  const lastGoalMinute = live.goals?.[live.goals.length - 1]?.minute;
  return lastGoalMinute != null ? `${lastGoalMinute}'+` : null;
}

function MatchRow({
  m,
  live,
  scorers,
}: {
  m: Match;
  live: LiveMatchData | undefined;
  scorers?: GoalScorerEvent[];
}) {
  const { t, country } = useLang();
  const hasScore = live && live.homeScore !== null && live.awayScore !== null;
  const isLive = live?.status === "IN_PLAY" || live?.status === "PAUSED";
  const isFinished = live?.status === "FINISHED";
  const goals = scorerText(scorers);
  const minute = isLive ? liveMinuteLabel(live!) : null;

  return (
    <Link
      href={`/matches/${matchSlug(m)}`}
      className="block rounded-lg border border-white/10 bg-navy px-3 py-2.5 transition hover:border-white/20"
    >
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <span className="min-w-0 truncate text-sm font-bold text-white">{country(m.homeKey)}</span>
          <Flag code={m.homeCode} alt="" width={28} height={20} />
        </div>

        {hasScore ? (
          <span className="shrink-0 px-1 font-heading text-base font-extrabold tabular-nums text-white">
            {live!.homeScore}–{live!.awayScore}
          </span>
        ) : (
          <span className="shrink-0 px-1 font-heading text-[11px] font-bold uppercase text-white/55">{t("vs")}</span>
        )}

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Flag code={m.awayCode} alt="" width={28} height={20} />
          <span className="min-w-0 truncate text-sm font-bold text-white">{country(m.awayKey)}</span>
        </div>
      </div>

      <div className="mt-1.5 flex items-center justify-center gap-2 text-[11px] text-white/50">
        {isLive && (
          <span className="flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 font-heading text-[10px] font-extrabold uppercase tracking-widest text-white">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            {minute ?? (live!.status === "PAUSED" ? "HT" : "Live")}
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
      {isLive && !hasScore ? (
        <p className="mt-1 text-center text-[11px] text-white/40">Scorer detail is still syncing.</p>
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

  const allMatches = md.days ? md.days.flatMap((d) => d.matches) : md.matches;
  const hasLiveOrImminent = allMatches.some((m) => {
    const live = m.providerIds?.footballData ? liveSnapshot.liveDataByProviderId[String(m.providerIds.footballData)] : undefined;
    if (live?.status === "IN_PLAY" || live?.status === "PAUSED") return true;
    const kickoffMs = matchUtcDate(m).getTime();
    return Math.abs(kickoffMs - Date.now()) <= 15 * 60 * 1000;
  });

  // Poll the lightweight internal live-snapshot endpoint while a match is live
  // or starting soon — reads the shared server snapshot, never the upstream
  // provider directly, so request volume stays bounded regardless of visitor count.
  useEffect(() => {
    if (!hasLiveOrImminent) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let inFlight = false;

    async function poll() {
      if (cancelled || document.hidden || inFlight) {
        schedule();
        return;
      }
      inFlight = true;
      try {
        const res = await fetch("/api/live-snapshot", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setSnapshot((prev) => ({
              snapshotId: data.snapshotId,
              generatedAt: data.generatedAt,
              liveDataByProviderId: Object.fromEntries(
                Object.entries(prev.liveDataByProviderId).map(([pid, live]) => {
                  const m = allMatches.find((match) => String(match.providerIds?.footballData) === pid);
                  const update = m ? data.matches[matchSlug(m)] : undefined;
                  return [pid, update ? { ...live, status: update.status, homeScore: update.homeScore, awayScore: update.awayScore } : live];
                }),
              ),
              scorersByMatchId: Object.fromEntries(
                Object.entries(data.matches as Record<string, { scorers: GoalScorerEvent[] }>).map(([id, m]) => [id, m.scorers]),
              ),
            }));
          }
        }
      } catch {
        // keep last known snapshot; retry on next tick
      } finally {
        inFlight = false;
        schedule();
      }
    }

    function schedule() {
      if (cancelled) return;
      const jitter = Math.floor(Math.random() * 5_000);
      timer = setTimeout(poll, 25_000 + jitter);
    }

    function handleVisibilityChange() {
      if (!document.hidden) poll();
    }

    schedule();
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
        <FreshnessLabel generatedAt={snapshot.generatedAt} />
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
