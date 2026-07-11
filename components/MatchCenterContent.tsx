"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flag } from "@/components/Flag";
import { MatchTime } from "@/components/MatchTime";
import { TimezoneLabel } from "@/components/TimezoneLabel";
import { FreshnessLabel } from "@/components/FreshnessLabel";
import { useLang } from "@/components/LanguageProvider";
import { useTimezone } from "@/components/TimezoneProvider";
import { matchSlug, ARCHIVE_DEFAULT_DATE, MATCHES, type Match } from "@/lib/matches";
import { getMatchCenterSnapshot } from "@/lib/matchCenterSelection";
import { getMatchPresentation } from "@/lib/matchPresentation";
import { getParticipantDisplay, type ResolvedParticipantLookup } from "@/lib/participant-resolution";
import type { LiveMatchData } from "@/lib/liveMatchData";
import type { GoalScorerEvent } from "@/lib/worldcup26Provider";
import { reconcileGoalEvents } from "@/lib/scoreReconciliation";

export type MatchCenterLiveSnapshot = {
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
    .join(" ï¿½ ");
}

function MatchRow({
  m,
  live,
  scorers,
  resolvedParticipants,
  now
}: {
  m: Match;
  live: LiveMatchData | undefined;
  scorers?: GoalScorerEvent[];
  resolvedParticipants?: ResolvedParticipantLookup;
  now: Date;
}) {
  const { t, lang } = useLang();
  const { timeZone } = useTimezone();
  const tz = timeZone || "UTC";

  const home = getParticipantDisplay(m, "home", resolvedParticipants, lang);
  const away = getParticipantDisplay(m, "away", resolvedParticipants, lang);

  const pres = getMatchPresentation({ match: m, liveData: live, timeZone: tz, now });

  const { confirmedEvents, scorerDetailsIncomplete } = reconcileGoalEvents({
    homeScore: pres.homeScore,
    awayScore: pres.awayScore,
    homeTeamName: home.label,
    awayTeamName: away.label,
    events: scorers ?? [],
  });
  const goals = scorerText(confirmedEvents);

  const statusMap: Record<string, string> = {
    scheduled: "Upcoming",
    live: "Live",
    halftime: "HT",
    final: "FT",
    syncing: t("state_syncing") || "Awaiting Update",
    postponed: "Postponed",
    cancelled: "Cancelled",
  };
  const statusLabel = statusMap[pres.state] || "Upcoming";

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

        {pres.showScore ? (
          <span className="shrink-0 px-1 font-heading text-base font-extrabold tabular-nums text-white">
            {pres.homeScore}ï¿½{pres.awayScore}
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
        {pres.showStatus && (
          <span className={`rounded px-1.5 py-0.5 font-heading text-[10px] font-extrabold uppercase tracking-widest ${
            pres.state === 'live' || pres.state === 'halftime'
              ? 'bg-red-600 text-white flex items-center gap-1'
              : 'bg-white/10 text-white/60'
          }`}>
            {pres.state === 'live' && <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />}
            {statusLabel}
          </span>
        )}
        <span className="font-semibold text-white/75" suppressHydrationWarning>
          {pres.displayKickoffDate} ï¿½ {pres.displayKickoffTime}
        </span>
        {m.venue ? <span className="truncate">{m.venue}</span> : null}
      </div>

      {goals ? <p className="mt-1 truncate text-center text-[11px] text-white/40">Goals: {goals}</p> : null}
      {(pres.state === 'live' || pres.state === 'syncing') && scorerDetailsIncomplete ? (
        <p className="mt-1 text-center text-[11px] text-white/40">{t("msg_syncing") || "Match data is updating"}</p>
      ) : null}
    </Link>
  );
}

export function MatchCenterContent({
  liveSnapshot,
}: {
  liveSnapshot: MatchCenterLiveSnapshot;
}) {
  const { t } = useLang();
  const { timeZone } = useTimezone();
  const tz = timeZone || "UTC";

  // Client-side clock state
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
  }, []);

  if (!now) {
    return (
      <div className="rounded-xl border border-white/10 bg-navyCard p-5 shadow-2xl sm:p-6 min-h-[300px]">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-heading text-sm font-extrabold uppercase tracking-[0.2em] text-accent">Match Center</p>
        </div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <TimezoneLabel className="text-[11px] text-white/55" />
          <FreshnessLabel primaryProviderFetchedAt={liveSnapshot.primaryProviderFetchedAt} primaryProviderOk={liveSnapshot.primaryProviderOk} />
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 font-heading text-[11px] font-bold uppercase tracking-widest text-white/40">{t("sec_latestResults") || "Latest Result"}</h3>
            <div className="h-16 w-full rounded-lg bg-white/5 animate-pulse"></div>
          </div>
          <div>
            <h3 className="mb-3 font-heading text-[11px] font-bold uppercase tracking-widest text-white/40">Up Next</h3>
            <div className="flex flex-col gap-2">
              <div className="h-16 w-full rounded-lg bg-white/5 animate-pulse"></div>
              <div className="h-16 w-full rounded-lg bg-white/5 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const snapshot = getMatchCenterSnapshot({
    matches: MATCHES,
    liveData: liveSnapshot.liveDataByProviderId,
    timeZone: tz,
    now: now
  });

  const renderRow = (m: Match) => (
    <MatchRow
      key={matchSlug(m)}
      m={m}
      live={m.providerIds?.footballData ? liveSnapshot.liveDataByProviderId[String(m.providerIds.footballData)] : undefined}
      scorers={liveSnapshot.scorersByMatchId[matchSlug(m)]}
      resolvedParticipants={liveSnapshot.resolvedParticipants}
      now={now}
    />
  );

  return (
    <div className="rounded-xl border border-white/10 bg-navyCard p-5 shadow-2xl sm:p-6">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-heading text-sm font-extrabold uppercase tracking-[0.2em] text-accent">Match Center</p>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <TimezoneLabel className="text-[11px] text-white/55" />
        <FreshnessLabel primaryProviderFetchedAt={liveSnapshot.primaryProviderFetchedAt} primaryProviderOk={liveSnapshot.primaryProviderOk} />
      </div>

      <div className="space-y-6">
        {snapshot.liveNow.length > 0 && (
          <div>
            <h3 className="mb-3 font-heading text-[11px] font-bold uppercase tracking-widest text-red-400">Live Now</h3>
            <div className="flex flex-col gap-2">
              {snapshot.liveNow.map(renderRow)}
            </div>
          </div>
        )}

        {snapshot.syncing && snapshot.syncing.length > 0 && (
          <div>
            <h3 className="mb-3 font-heading text-[11px] font-bold uppercase tracking-widest text-[#f5a623]">{t("sec_awaitingUpdate") || "Awaiting Update"}</h3>
            <div className="flex flex-col gap-2">
              {snapshot.syncing.map(renderRow)}
            </div>
          </div>
        )}

        {snapshot.latestResult && (
          <div>
            <h3 className="mb-3 font-heading text-[11px] font-bold uppercase tracking-widest text-white/40">{t("sec_latestResults") || "Latest Result"}</h3>
            <div className="flex flex-col gap-2">
              {renderRow(snapshot.latestResult)}
            </div>
          </div>
        )}

        {snapshot.upNext.length > 0 && (
          <div>
            <h3 className="mb-3 font-heading text-[11px] font-bold uppercase tracking-widest text-white/40">Up Next</h3>
            <div className="flex flex-col gap-2">
              {snapshot.upNext.map(renderRow)}
            </div>
          </div>
        )}

        {snapshot.upNext.length === 0 && !snapshot.latestResult && snapshot.liveNow.length === 0 && (!snapshot.syncing || snapshot.syncing.length === 0) && (
          <p className="text-sm text-white/50">No matches available.</p>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <Link
            href="/today"
            className="font-heading text-[11px] font-bold uppercase tracking-widest text-accent hover:text-white"
          >
            Open Match Center &rarr;
          </Link>
          <Link
            href="/schedule"
            className="font-heading text-[11px] font-bold uppercase tracking-widest text-white/50 hover:text-white"
          >
            Full Schedule &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
