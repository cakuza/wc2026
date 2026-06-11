"use client";

import Link from "next/link";
import { Flag } from "@/components/Flag";
import { MatchTime } from "@/components/MatchTime";
import { TimezonePicker } from "@/components/TimezoneLabel";
import { useLang } from "@/components/LanguageProvider";
import { matchesByDate, matchSlug } from "@/lib/matches";
import type { ScheduleMatchScore } from "./page";

interface Props {
  liveScores?: Record<number, ScheduleMatchScore>;
}

function ScoreChip({ score, t }: { score: ScheduleMatchScore; t: (k: string) => string }) {
  const { status, homeScore, awayScore } = score;
  const isFinished = status === "FINISHED";
  const isLive = status === "IN_PLAY" || status === "PAUSED";
  const hasScore = homeScore !== null && awayScore !== null;

  if ((isFinished || isLive) && hasScore) {
    return (
      <div className="flex shrink-0 flex-col items-center gap-0.5">
        <span className="font-heading text-sm font-extrabold tabular-nums text-white">
          {homeScore}–{awayScore}
        </span>
        {isFinished && (
          <span className="font-heading text-[10px] font-bold uppercase tracking-wider text-white/40">
            FT
          </span>
        )}
        {isLive && (
          <span className="animate-pulse font-heading text-[10px] font-bold uppercase tracking-wider text-red-400">
            {status === "PAUSED" ? "HT" : "Live"}
          </span>
        )}
      </div>
    );
  }

  if (isLive && !hasScore) {
    return (
      <span className="shrink-0 rounded bg-white/5 px-2 py-1 font-heading text-xs font-bold text-white/40">
        {t("match_syncing")}
      </span>
    );
  }

  return (
    <span className="shrink-0 rounded bg-navy px-2 py-1 font-heading text-xs font-bold uppercase text-white/50">
      {t("vs")}
    </span>
  );
}

export function ScheduleContent({ liveScores }: Props) {
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
                return (
                  <Link
                    key={i}
                    href={`/matches/${matchSlug(m)}`}
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-navyCard px-4 py-3 transition hover:border-white/20 hover:bg-white/5"
                  >
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
                    {score ? (
                      <ScoreChip score={score} t={t} />
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
                      <MatchTime match={m} className="font-semibold text-white/80" />
                      <div>{m.venue ?? formatDate(m.date)}</div>
                    </div>
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
