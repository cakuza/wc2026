"use client";

import Link from "next/link";
import { Flag } from "@/components/Flag";
import { MatchTime } from "@/components/MatchTime";
import { useLang } from "@/components/LanguageProvider";
import { useTimezone } from "@/components/TimezoneProvider";
import {
  matchSlug,
  MATCHES,
  type Match,
  ARCHIVE_DEFAULT_DATE,
} from "@/lib/matches";
import { groupMatchesByCalendarDate } from "@/lib/todaySelection";
import type { LiveMatchData } from "@/lib/liveMatchData";
import {
  type ResolvedParticipantLookup,
  getParticipantDisplay,
} from "@/lib/participant-resolution";
import type { GoalScorerEvent } from "@/lib/worldcup26Provider";
import { getMatchPresentation } from "@/lib/matchPresentation";
import { formatGoalEventDisplay } from "@/lib/canonicalArchiveEvents";

const STAGE_LABELS: Record<string, string> = {
  R32: "Round of 32",
  R16: "Round of 16",
  QF: "Quarter-final",
  SF: "Semi-final",
  "3P": "Third-place playoff",
  F: "Final",
};

import type { SerializableSnapshotMatch } from "@/lib/liveSnapshot";

interface Props {
  matchesProjection?: Record<string, SerializableSnapshotMatch>;
  liveScores?: Record<string | number, Pick<LiveMatchData, "status" | "homeScore" | "awayScore" | "scoreDuration" | "penaltyShootoutScore">>;
  scorerLines?: Record<string, GoalScorerEvent[]>;
  resolvedParticipants?: ResolvedParticipantLookup;
  /** Route-owned timezone for static timezone schedule pages. */
  timeZone?: string;
}

function StatusPill({ status, label }: { status: "FT" | "LIVE" | "HT" | "SYNCING" | "AET" | "PEN"; label?: string }) {
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
      <span className="rounded bg-white/5 px-1.5 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wider text-[#f5a623]">
        {label || "Awaiting update"}
      </span>
    );
  }
  if (status === "AET" || status === "PEN") {
    return (
      <span className="rounded bg-white/10 px-1.5 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wider text-white/60">
        {label ?? status}
      </span>
    );
  }
  return (
    <span className="rounded bg-white/10 px-1.5 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wider text-white/40">
      FT
    </span>
  );
}

function ScorerText({ events }: { events: GoalScorerEvent[] }) {
  return <>{events.map(formatGoalEventDisplay).join(" • ")}</>;
}

export function ScheduleContent({ matchesProjection, liveScores, scorerLines, resolvedParticipants, timeZone: fixedTimeZone }: Props) {
  const { t, country, formatDate, locale, lang } = useLang();
  const { timeZone } = useTimezone();
  const tz = fixedTimeZone ?? timeZone ?? "UTC";

  // Keep static markup and hydrated content on the same archive snapshot.
  // A refreshed snapshot, not the visitor's wall clock, advances this view.
  const evalNow = new Date(ARCHIVE_DEFAULT_DATE);

  const getMatchData = (m: Match) => {
    const slug = matchSlug(m);
    const snap = matchesProjection?.[slug];
    if (snap) {
      const snapLive = snap.live as LiveMatchData | null;
      const liveData: LiveMatchData = snapLive ?? {
        provider: "football-data.org",
        providerMatchId: m.providerIds?.footballData ?? 0,
        status: snap.status === "FINISHED" ? "FINISHED" : snap.status === "LIVE" ? "IN_PLAY" : snap.status === "HALFTIME" ? "PAUSED" : "SCHEDULED",
        homeScore: snap.homeScore,
        awayScore: snap.awayScore,
        winner: null,
        eventDataAvailable: true,
        scoreDuration: null,
        penaltyShootoutScore: undefined,
        lastSyncedAt: snap.providerUpdatedAt ?? evalNow.toISOString(),
      };
      const pres = getMatchPresentation({ match: m, liveData, timeZone: tz, now: evalNow });
      const events = snap.scorers && snap.scorers.length > 0 ? snap.scorers : scorerLines?.[slug];
      const penaltyShootoutScore = snapLive?.penaltyShootoutScore ?? undefined;
      return { pres, events, penaltyShootoutScore };
    }

    const pid = m.providerIds?.footballData;
    const score = pid ? liveScores?.[pid] : undefined;
    const pres = getMatchPresentation({ match: m, liveData: score as LiveMatchData, timeZone: tz, now: evalNow });
    const events = scorerLines?.[slug];
    const penaltyShootoutScore = score?.penaltyShootoutScore ?? undefined;
    return { pres, events, penaltyShootoutScore };
  };

  const live = MATCHES.filter((m) => {
    const { pres } = getMatchData(m);
    return pres.state === "live" || pres.state === "halftime";
  });
  const syncing = MATCHES.filter((m) => {
    const { pres } = getMatchData(m);
    return pres.state === "syncing";
  });
  const completed = MATCHES.filter((m) => {
    const { pres } = getMatchData(m);
    return pres.state === "final";
  });
  const upcoming = MATCHES.filter((m) => {
    const { pres } = getMatchData(m);
    return pres.state === "scheduled" || pres.state === "postponed" || pres.state === "cancelled";
  });

  const liveDays = groupMatchesByCalendarDate(live, tz);
  const syncingDays = groupMatchesByCalendarDate(syncing, tz);
  const completedDays = groupMatchesByCalendarDate(completed, tz).reverse();
  completedDays.forEach(day => day.matches.reverse());
  const upcomingDays = groupMatchesByCalendarDate(upcoming, tz);

  const isTournamentComplete = upcoming.length === 0;

  const longDate = (iso: string) =>
    new Intl.DateTimeFormat(locale, {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone: tz,
    }).format(new Date(`${iso}T12:00:00Z`));

  const renderMatches = (matches: Match[]) => (
    <div className="space-y-2">
      {matches.map((m, i) => {
        const { pres, events, penaltyShootoutScore } = getMatchData(m);
        const homeDisplay = getParticipantDisplay(m, "home", resolvedParticipants, lang);
        const awayDisplay = getParticipantDisplay(m, "away", resolvedParticipants, lang);

        const hasGoals = !!events && events.length > 0;

        let statusPill: React.ReactNode = null;
        if (pres.state === "final") {
          statusPill = <StatusPill
            status={pres.scoreDuration === "EXTRA_TIME" ? "AET" : pres.scoreDuration === "PENALTY_SHOOTOUT" ? "PEN" : "FT"}
            label={pres.scoreDuration === "EXTRA_TIME" ? t("match_status_aet") : pres.scoreDuration === "PENALTY_SHOOTOUT" ? t("match_status_pen") : undefined}
          />;
        } else if (pres.state === "live" || pres.state === "halftime") {
          statusPill = <StatusPill status={pres.state === "halftime" ? "HT" : "LIVE"} />;
        } else if (pres.state === "syncing") {
          statusPill = <StatusPill status="SYNCING" label={t("state_syncing") || "Awaiting update"} />;
        }

        return (
          <Link
            key={i}
            href={`/matches/${matchSlug(m)}`}
            prefetch={false}
            className="block rounded-lg border border-white/10 bg-navyCard px-4 py-3 transition hover:border-white/20 hover:bg-white/5"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
              <div data-schedule-score-cluster className="min-w-0 flex-1">
                {"matchNumber" in m && (
                  <div className="mb-2 text-center">
                    <span className="font-heading text-[10px] font-bold uppercase tracking-wider text-white/50">
                      Match {m.matchNumber} &bull; {STAGE_LABELS[m.stage] ?? m.stage}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-end">
                    <span className="truncate font-semibold text-white">
                      {homeDisplay.label}
                    </span>
                    {homeDisplay.teamCode && (
                      <Flag
                        code={homeDisplay.teamCode}
                        alt=""
                        width={30}
                        height={22}
                        className="rounded-sm"
                      />
                    )}
                  </div>

                  {pres.showScore ? (
                    <span className="shrink-0 font-heading text-base font-extrabold tabular-nums text-white">
                      {pres.homeScore} - {pres.awayScore}
                    </span>
                  ) : (
                    <span className="shrink-0 rounded bg-navy px-2 py-1 font-heading text-xs font-bold uppercase text-white/50">
                      {t("vs")}
                    </span>
                  )}

                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    {awayDisplay.teamCode && (
                      <Flag
                        code={awayDisplay.teamCode}
                        alt=""
                        width={30}
                        height={22}
                        className="rounded-sm"
                      />
                    )}
                    <span className="truncate font-semibold text-white">
                      {awayDisplay.label}
                    </span>
                  </div>
                </div>

                {hasGoals && (
                  <p data-schedule-scorer-line className="mt-1.5 truncate text-center text-[11px] text-white/40">
                    Goals: <ScorerText events={events!} />
                  </p>
                )}
                {penaltyShootoutScore && (
                  <p className="mt-1 text-center text-[10px] text-white/40">
                    Penalties: {penaltyShootoutScore.home}-{penaltyShootoutScore.away}
                  </p>
                )}
              </div>

              <div data-schedule-meta className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/50 sm:w-32 sm:shrink-0 sm:flex-col sm:items-end sm:gap-1.5 sm:text-end">
                <span className="font-semibold text-white/80" suppressHydrationWarning>
                  {pres.displayKickoffTime}
                </span>
                {statusPill}
                <span className="min-w-0 truncate sm:max-w-full">{m.venue ?? formatDate(m.date)}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Archive Header Notice */}
      <div className="mb-6 rounded-xl border border-white/10 bg-navyCard p-4">
        <h2 className="font-heading text-lg font-bold text-accent uppercase tracking-wide">
          Completed Results
        </h2>
        <p className="mt-1 text-sm text-white/70">
          Browse all 104 completed matches with kickoff times converted to your selected timezone.
        </p>
      </div>

      {/* TABS */}
      <div className="mb-6 flex gap-4 border-b border-white/10">
        <a href="#completed" className="border-b-2 border-accent pb-2 font-heading text-sm font-bold uppercase tracking-wide text-white transition hover:text-accent">
          Completed Results
        </a>
        {!isTournamentComplete && (
          <a href="#upcoming" className="border-b-2 border-transparent pb-2 font-heading text-sm font-bold uppercase tracking-wide text-white/50 transition hover:border-white/30">
            Upcoming Matches
          </a>
        )}
      </div>

      <div className="space-y-12">
        {liveDays.length > 0 && (
          <section id="live" className="scroll-mt-24">
            <h2 className="mb-6 font-heading text-xl font-extrabold uppercase tracking-widest text-red-400">
              Live Now
            </h2>
            <div className="space-y-8">
              {liveDays.map((group) => (
                <div key={group.date}>
                  <h3 className="mb-3 border-b border-white/10 pb-2 font-heading text-lg font-bold uppercase tracking-wide text-accent">
                    {longDate(group.date)}
                  </h3>
                  {renderMatches(group.matches)}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SYNCING */}
        {syncingDays.length > 0 && (
          <section id="syncing" className="scroll-mt-24">
            <h2 className="mb-6 font-heading text-xl font-extrabold uppercase tracking-widest text-[#f5a623]">
              {t("state_syncing") || "Awaiting update"}
            </h2>
            <div className="space-y-8">
              {syncingDays.map((group) => (
                <div key={group.date}>
                  <h3 className="mb-3 border-b border-white/10 pb-2 font-heading text-lg font-bold uppercase tracking-wide text-accent">
                    {longDate(group.date)}
                  </h3>
                  {renderMatches(group.matches)}
                </div>
              ))}
            </div>
          </section>
        )}

        <section id="completed" className="scroll-mt-24">
          <h2 className="mb-6 font-heading text-xl font-extrabold uppercase tracking-widest text-white/60">
            Completed Results
          </h2>
          {completedDays.length > 0 ? (
            <div className="space-y-8">
              {completedDays.map((group) => (
                <div key={group.date}>
                  <h3 className="mb-3 border-b border-white/10 pb-2 font-heading text-lg font-bold uppercase tracking-wide text-white/60">
                    {longDate(group.date)}
                  </h3>
                  {renderMatches(group.matches)}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-navyCard p-8 text-center text-white/60">
              <p>No matches have finished yet.</p>
            </div>
          )}
        </section>

        {!isTournamentComplete && (
          <section id="upcoming" className="scroll-mt-24">
            <h2 className="mb-6 font-heading text-xl font-extrabold uppercase tracking-widest text-white/40">
              Upcoming Matches
            </h2>
            {upcomingDays.length > 0 ? (
              <div className="space-y-8">
                {upcomingDays.map((group) => (
                  <div key={group.date}>
                    <h3 className="mb-3 border-b border-white/10 pb-2 font-heading text-lg font-bold uppercase tracking-wide text-accent">
                      {longDate(group.date)}
                    </h3>
                    {renderMatches(group.matches)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-navyCard p-8 text-center text-white/60">
                <p>No upcoming matches — the tournament is complete.</p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
