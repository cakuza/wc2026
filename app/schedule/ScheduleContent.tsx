"use client";

import Link from "next/link";
import { Flag } from "@/components/Flag";
import { MatchTime } from "@/components/MatchTime";
import { TimezonePicker } from "@/components/TimezoneLabel";
import { useTimezone } from "@/components/TimezoneProvider";
import { useLang } from "@/components/LanguageProvider";
import { matchSlug, MATCHES } from "@/lib/matches";
import { groupMatchesByCalendarDate } from "@/lib/todaySelection";
import type { GoalScorerEvent } from "@/lib/worldcup26Provider";
import type { ScheduleMatchScore } from "./page";

interface Props {
  liveScores?: Record<number, ScheduleMatchScore>;
  scorerLines?: Record<string, GoalScorerEvent[]>;
}

/** Small status pill — sits where the kickoff time used to be, never louder than the score. */
function StatusPill({ status }: { status: "FT" | "LIVE" | "HT" | "SYNCING" }) {
  if (status === "LIVE") {
    return (
      <span className="animate-pulse rounded bg-red-600/20 px-1.5 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wider text-red-400">
        Live
      </span>
    );
  }
  if (status === "HT") {
    return (
      <span className="rounded bg-red-600/15 px-1.5 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wider text-red-400/80">
        HT
      </span>
    );
  }
  if (status === "SYNCING") {
    return (
      <span className="rounded bg-white/5 px-1.5 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wider text-white/40">
        Syncing
      </span>
    );
  }
  return (
    <span className="rounded bg-white/10 px-1.5 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wider text-white/40">
      FT
    </span>
  );
}

/** Just the score — "2–0". The score is always the strongest element on the row. */
function ScoreRow({ score }: { score: ScheduleMatchScore }) {
  const { homeScore, awayScore } = score;
  return (
    <span className="shrink-0 font-heading text-base font-extrabold tabular-nums text-white">
      {homeScore}–{awayScore}
    </span>
  );
}

function shortScorerName(playerName: string) {
  if (playerName.includes(".")) return playerName;
  const parts = playerName.trim().split(/\s+/);
  return parts[parts.length - 1] ?? playerName;
}

/** Compact "9' J. Quiñones · 67' R. Jiménez" scorer text, used below the score cluster. */
function ScorerText({ events }: { events: GoalScorerEvent[] }) {
  const parts = events.map((e) => {
    const minute = e.minuteLabel ?? (e.minute != null ? `${e.minute}'` : "");
    const name = shortScorerName(e.playerName);
    return `${minute ? `${minute} ` : ""}${name}${e.isOwnGoal ? " (OG)" : e.isPenalty || e.type === "PENALTY_GOAL" ? " (P)" : ""}`;
  });
  return <>{parts.join(" · ")}</>;
}

export function ScheduleContent({ liveScores, scorerLines }: Props) {
  const { t, country, formatDate, locale } = useLang();
  const { timeZone } = useTimezone();
  const days = groupMatchesByCalendarDate(MATCHES, timeZone);

  const longDate = (iso: string) =>
    new Intl.DateTimeFormat(locale, {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone,
    }).format(new Date(`${iso}T12:00:00Z`));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 font-heading text-4xl font-extrabold uppercase tracking-wide text-white">
        {t("sched_title")}
      </h1>
      <p className="mb-2 max-w-3xl text-sm text-white/50">
        {t("sched_intro")}{" "}
        <Link href="/today" className="font-semibold text-accent underline underline-offset-2 hover:text-white">
          {t("nav_today")} →
        </Link>
      </p>
      <p className="mb-6 text-sm">
        <Link href="/world-cup-schedule-local-time" className="font-semibold text-accent underline underline-offset-2 hover:text-white">
          {t("sched_viewByZone")} →
        </Link>
        <span className="text-white/30"> · </span>
        <Link href="/groups" className="font-semibold text-accent underline underline-offset-2 hover:text-white">
          {t("nav_groups")} →
        </Link>
        <span className="text-white/30"> · </span>
        <Link href="/stats" className="font-semibold text-accent underline underline-offset-2 hover:text-white">
          Stats →
        </Link>
        <span className="text-white/30"> · </span>
        <Link href="/world-cup-third-place-qualification" className="font-semibold text-accent underline underline-offset-2 hover:text-white">
          Third-place ranking →
        </Link>
      </p>
      <TimezonePicker className="mb-6 flex flex-wrap items-center gap-2 text-[11px] text-white/55" />

      <div className="space-y-8">
        {days.map(({ date, matches }) => (
          <section key={date}>
            <h2 className="mb-3 border-b-2 border-accent pb-2 font-heading text-xl font-extrabold uppercase tracking-wide text-white">
              {longDate(date)}
            </h2>
            <div className="space-y-2">
              {matches.map((m, i) => {
                const pid = m.providerIds?.footballData;
                const score = pid ? liveScores?.[pid] : undefined;
                const hasScore = !!score && score.homeScore !== null && score.awayScore !== null;
                const isFinishedOrLive =
                  !!score && (score.status === "FINISHED" || score.status === "IN_PLAY" || score.status === "PAUSED");
                const isSyncing = !!score && isFinishedOrLive && !hasScore;
                const isFinished = score?.status === "FINISHED";
                const isLive = score?.status === "IN_PLAY" || score?.status === "PAUSED";
                const events = scorerLines?.[matchSlug(m)];
                const hasGoals = !!events && events.length > 0;

                // Status pill that replaces the kickoff time on the right once a match
                // has started — never sits on the score line or in the scorer text.
                let statusPill: React.ReactNode = null;
                if (hasScore && isFinished) {
                  statusPill = <StatusPill status="FT" />;
                } else if (hasScore && isLive) {
                  statusPill = <StatusPill status={score!.status === "PAUSED" ? "HT" : "LIVE"} />;
                } else if (isSyncing) {
                  statusPill = <StatusPill status="SYNCING" />;
                }

                return (
                  <Link
                    key={i}
                    href={`/matches/${matchSlug(m)}`}
                    className="block rounded-lg border border-white/10 bg-navyCard px-4 py-3 transition hover:border-white/20 hover:bg-white/5"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                      <div data-schedule-score-cluster className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-end">
                            <span className="truncate font-semibold text-white">
                              {country(m.homeKey)}
                            </span>
                            <Flag
                              code={m.homeCode}
                              alt=""
                              width={30}
                              height={22}
                              className="rounded-sm"
                            />
                          </div>

                          {hasScore && score ? (
                            <ScoreRow score={score} />
                          ) : (
                            <span className="shrink-0 rounded bg-navy px-2 py-1 font-heading text-xs font-bold uppercase text-white/50">
                              {t("vs")}
                            </span>
                          )}

                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <Flag
                              code={m.awayCode}
                              alt=""
                              width={30}
                              height={22}
                              className="rounded-sm"
                            />
                            <span className="truncate font-semibold text-white">
                              {country(m.awayKey)}
                            </span>
                          </div>
                        </div>

                        {hasGoals && (
                          <p data-schedule-scorer-line className="mt-1.5 truncate text-center text-[11px] text-white/40">
                            Goals: <ScorerText events={events!} />
                          </p>
                        )}
                      </div>

                      <div data-schedule-right-meta className="hidden w-28 shrink-0 text-end text-xs text-white/50 sm:block">
                        {statusPill ? (
                          <div className="flex justify-end">{statusPill}</div>
                        ) : (
                          <MatchTime match={m} className="font-semibold text-white/80" />
                        )}
                        <div>{m.venue ?? formatDate(m.date)}</div>
                      </div>
                    </div>
                    {/* Mobile-only status pill (right-side column is hidden below sm) */}
                    {statusPill && (
                      <div className="mt-1.5 flex items-center gap-1.5 sm:hidden">
                        {statusPill}
                        <span className="truncate text-[11px] text-white/40">{m.venue}</span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
