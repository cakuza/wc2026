"use client";

import Link from "next/link";
import { Flag } from "@/components/Flag";
import { MatchTime } from "@/components/MatchTime";
import { TimezonePicker } from "@/components/TimezoneLabel";
import { useLang } from "@/components/LanguageProvider";
import { matchesByDate, matchSlug } from "@/lib/matches";
import type { GoalScorerEvent } from "@/lib/worldcup26Provider";
import type { ScheduleMatchScore } from "./page";

interface Props {
  liveScores?: Record<number, ScheduleMatchScore>;
  scorerLines?: Record<string, GoalScorerEvent[]>;
}

/** Small status pill shown next to the score — never louder than the score itself. */
function StatusPill({ status }: { status: "FT" | "LIVE" | "HT" }) {
  if (status === "LIVE") {
    return (
      <span className="animate-pulse rounded bg-red-600/20 px-1.5 py-0.5 font-heading text-[9px] font-bold uppercase tracking-wider text-red-400">
        Live
      </span>
    );
  }
  if (status === "HT") {
    return (
      <span className="rounded bg-red-600/15 px-1.5 py-0.5 font-heading text-[9px] font-bold uppercase tracking-wider text-red-400/80">
        HT
      </span>
    );
  }
  return (
    <span className="rounded bg-white/10 px-1.5 py-0.5 font-heading text-[9px] font-bold uppercase tracking-wider text-white/40">
      FT
    </span>
  );
}

/** Score row: "2–0" plus a compact status pill. Used for finished and live matches. */
function ScoreRow({ score }: { score: ScheduleMatchScore }) {
  const { status, homeScore, awayScore } = score;
  const isFinished = status === "FINISHED";
  const isLive = status === "IN_PLAY" || status === "PAUSED";

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <span className="font-heading text-base font-extrabold tabular-nums text-white">
        {homeScore}–{awayScore}
      </span>
      {isFinished && <StatusPill status="FT" />}
      {isLive && <StatusPill status={status === "PAUSED" ? "HT" : "LIVE"} />}
    </div>
  );
}

/** Compact "Goals: 9' J. Quiñones · 67' R. Jiménez" line under a finished match's score. */
function ScorerLine({ events }: { events: GoalScorerEvent[] }) {
  const parts = events.map((e) =>
    e.minute != null ? `${e.minute}' ${e.playerName}` : e.playerName,
  );
  return (
    <p className="mt-1 truncate text-center text-[11px] text-white/40">
      Goals: {parts.join(" · ")}
    </p>
  );
}

export function ScheduleContent({ liveScores, scorerLines }: Props) {
  const { t, country, formatDate, locale } = useLang();
  const days = matchesByDate();

  const longDate = (iso: string) =>
    new Intl.DateTimeFormat(locale, {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(new Date(`${iso}T00:00:00`));

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
                const events = score?.status === "FINISHED" ? scorerLines?.[matchSlug(m)] : undefined;

                return (
                  <Link
                    key={i}
                    href={`/matches/${matchSlug(m)}`}
                    className="block rounded-lg border border-white/10 bg-navyCard px-4 py-3 transition hover:border-white/20 hover:bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-1 items-center justify-end gap-2 text-end">
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
                      ) : isSyncing ? (
                        <span className="shrink-0 rounded bg-white/5 px-2 py-1 font-heading text-xs font-bold text-white/40">
                          {t("match_syncing")}
                        </span>
                      ) : (
                        <span className="shrink-0 rounded bg-navy px-2 py-1 font-heading text-xs font-bold uppercase text-white/50">
                          {t("vs")}
                        </span>
                      )}

                      <div className="flex flex-1 items-center gap-2">
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

                      <div className="ms-2 hidden w-28 shrink-0 text-end text-xs text-white/50 sm:block">
                        {!hasScore && !isSyncing && (
                          <MatchTime match={m} className="font-semibold text-white/80" />
                        )}
                        <div>{m.venue ?? formatDate(m.date)}</div>
                      </div>
                    </div>

                    {/* Goal scorers — only shown when the shared scorer map has real data */}
                    {events && events.length > 0 && <ScorerLine events={events} />}
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
