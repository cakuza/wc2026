"use client";
import { getResolvedHomeTeam, getResolvedAwayTeam, getParticipantDisplayLabel, isKnockoutMatch, knockoutSlotLabel, getResolvedHomeCode, getResolvedAwayCode, matchStageLabel, type ResolvedParticipantLookup } from "@/lib/participant-resolution";

import { useState } from "react";
import Link from "next/link";
import { Flag } from "@/components/Flag";
import { KickoffDateTime } from "@/components/MatchTime";
import { FreshnessLabel } from "@/components/FreshnessLabel";
import { useLang } from "@/components/LanguageProvider";
import { useTimezone } from "@/components/TimezoneProvider";
import { MATCHES, matchSlug, matchUtcDate, type Match } from "@/lib/matches";
import { getTodayHref } from "@/lib/todaySelection";
import type { MatchEvents } from "@/lib/matchEvents";
import type { LiveMatchData, LiveMatchEvent } from "@/lib/liveMatchData";
import type { StandingRow } from "@/lib/groupStandings";
import type { ThirdPlaceRow } from "@/lib/thirdPlaceRanking";
import { countryName } from "@/lib/i18n";
import { buildScorerSentence } from "@/lib/resultSummary";
import { missingScorerDetailText, type GoalEventCompleteness } from "@/lib/goalEventCompleteness";
import { type SnapshotMatchStatus } from "@/lib/liveSnapshot";
import { reconcileGoalEvents, isMatchInReconciliationWindow } from "@/lib/scoreReconciliation";
import matchEventsData from "@/data/archive/match-events.json";
import { isCanonicalComplete } from "@/lib/liveRefreshPolicy";
import type { GoalScorerEvent } from "@/lib/worldcup26Provider";
import { slugFor } from "@/lib/teams";

interface Props {
  match: Match;
  events?: MatchEvents | null;
  live?: LiveMatchData | null;
  status: SnapshotMatchStatus;
  /** Cold-start fallback: kickoff has passed but the result is unknown (not SCHEDULED). */
  liveDataUnavailable?: boolean;
  homeScore: number | null;
  awayScore: number | null;
  scorers: GoalScorerEvent[];
  goalEventCompleteness: GoalEventCompleteness;
  primaryProviderFetchedAt: string | null;
  primaryProviderOk: boolean;
  secondaryProviderFetchedAt: string | null;
  secondaryProviderOk: boolean;
  groupStandings?: StandingRow[];
  thirdPlaceRows?: ThirdPlaceRow[];
  resolvedParticipants?: ResolvedParticipantLookup;
}

type DisplayStatus = "upcoming" | "live" | "halftime" | "finished" | "syncing";

function toLiveGoalEvent(event: any): LiveMatchEvent {
  return {
    type: event.isOwnGoal ? "OWN_GOAL" : event.isPenalty || event.type === "PENALTY_GOAL" ? "PENALTY_GOAL" : "GOAL",
    minute: event.minute,
    stoppageTime: event.stoppageTime,
    minuteLabel: event.minuteLabel,
    teamName: event.teamName,
    playerTeamName: event.playerTeamName,
    playerName: event.playerName,
    isOwnGoal: event.isOwnGoal,
    assistName: event.assistName,
  };
}

/** SnapshotMatchStatus maps 1:1 onto our display states. */
export function snapshotStatusToDisplay(status: SnapshotMatchStatus): DisplayStatus {
  switch (status) {
    case "SCHEDULED":
      return "upcoming";
    case "LIVE":
      return "live";
    case "HALFTIME":
      return "halftime";
    case "FINISHED":
      return "finished";
    case "SYNCING":
      return "syncing";
  }
}

function StatusBadge({ status, t }: { status: DisplayStatus; t: (k: string) => string }) {
  if (status === "live") {
    return (
      <span className="inline-flex animate-pulse items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 font-heading text-xs font-extrabold uppercase tracking-widest text-white">
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
        {t("match_live")}
      </span>
    );
  }
  if (status === "halftime") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600/70 px-3 py-1 font-heading text-xs font-extrabold uppercase tracking-widest text-white">
        {t("match_halftime")}
      </span>
    );
  }
  if (status === "finished") {
    return (
      <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 font-heading text-xs font-extrabold uppercase tracking-widest text-white/60">
        {t("match_final")}
      </span>
    );
  }
  if (status === "syncing") {
    return (
      <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 font-heading text-xs font-extrabold uppercase tracking-widest text-white/40">
        {t("match_syncing")}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-accent/20 px-3 py-1 font-heading text-xs font-extrabold uppercase tracking-widest text-accent">
      {t("match_upcoming")}
    </span>
  );
}

function EventSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-navyCard">
      <div className="flex items-center gap-2 border-b border-white/10 bg-navy/50 px-4 py-3">
        <span className="text-base leading-none">{icon}</span>
        <span className="font-heading text-sm font-extrabold uppercase tracking-wide text-white">
          {title}
        </span>
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}

function EmptyEvents({ note }: { note: string }) {
  return <p className="text-sm text-white/40">{note}</p>;
}

function pointText(points: number) {
  return `${points} ${points === 1 ? "point" : "points"}`;
}

function ordinal(n: number) {
  const suffix = n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th";
  return `${n}${suffix}`;
}

export function MatchDetail({
  match,
  events,
  live,
  status: initialStatus,
  liveDataUnavailable: initialLiveDataUnavailable = false,
  homeScore: initialHomeScore,
  awayScore: initialAwayScore,
  scorers: initialScorers,
  goalEventCompleteness: initialCompleteness,
  primaryProviderFetchedAt: initialPrimaryProviderFetchedAt,
  primaryProviderOk: initialPrimaryProviderOk,
  secondaryProviderFetchedAt: initialSecondaryProviderFetchedAt,
  secondaryProviderOk: initialSecondaryProviderOk,
  groupStandings,
  thirdPlaceRows,
  resolvedParticipants,
}: Props) {
  const { t, country, formatDate } = useLang();
  const { timeZone } = useTimezone();
  const tz = timeZone || "UTC";
  const todayHref = getTodayHref(tz);
  void events;

  const liveState = {
    status: initialStatus,
    homeScore: initialHomeScore,
    awayScore: initialAwayScore,
    scorers: initialScorers,
    goalEventCompleteness: initialCompleteness,
    liveDataUnavailable: initialLiveDataUnavailable,
    primaryProviderFetchedAt: initialPrimaryProviderFetchedAt,
    primaryProviderOk: initialPrimaryProviderOk,
    secondaryProviderFetchedAt: initialSecondaryProviderFetchedAt,
    secondaryProviderOk: initialSecondaryProviderOk,
    penaltyShootoutScore: live?.penaltyShootoutScore ?? null,
    winner: live?.winner ?? null,
    scoreDuration: live?.scoreDuration ?? null,
  };

  // Containment mode: clock tick and polling removed. Match page displays
  // server-rendered ISR state only; no client fetch is triggered.
  const now = Date.now();
  const isComplete = isCanonicalComplete(
    {
      match,
      status: liveState.status,
      live: {
        provider: "football-data.org",
        providerMatchId: 0,
        status: liveState.status === "FINISHED" ? "FINISHED" : "IN_PLAY",
        winner: liveState.winner,
        scoreDuration: liveState.scoreDuration,
        lastSyncedAt: "",
        eventDataAvailable: true,
        penaltyShootoutScore: liveState.penaltyShootoutScore,
        homeScore: liveState.homeScore,
        awayScore: liveState.awayScore,
      },
      homeScore: liveState.homeScore,
      awayScore: liveState.awayScore,
      goalEventCompleteness: liveState.goalEventCompleteness,
    },
    resolvedParticipants ?? {}
  );

  const homeScore = liveState.homeScore;
  const awayScore = liveState.awayScore;
  const hasScore = homeScore !== null && awayScore !== null;
  const status: DisplayStatus = snapshotStatusToDisplay(liveState.status);
  const stageLabel = matchStageLabel(match);
  const isGroupStage = !isKnockoutMatch(match);

  const isConfirmedFinished = liveState.status === "FINISHED" && hasScore;
  const homeKey = getResolvedHomeTeam(match, resolvedParticipants);
  const homeName = homeKey ? country(homeKey) : (isKnockoutMatch(match) ? knockoutSlotLabel(match.homeSlot) : match.homeKey);
  const awayKey = getResolvedAwayTeam(match, resolvedParticipants);
  const awayName = awayKey ? country(awayKey) : (isKnockoutMatch(match) ? knockoutSlotLabel(match.awaySlot) : match.awayKey);
  const homeStanding = groupStandings?.find((row) => row.teamKey === match.homeKey);
  const awayStanding = groupStandings?.find((row) => row.teamKey === match.awayKey);
  const homeRank = groupStandings?.findIndex((row) => row.teamKey === match.homeKey);
  const awayRank = groupStandings?.findIndex((row) => row.teamKey === match.awayKey);
  const matchTime = matchUtcDate(match).getTime();
  const teamKeysForNext = [homeKey, awayKey].filter((k): k is string => k !== null && k !== "tbd");
  const nextMatches = teamKeysForNext
    .map((teamKey) => {
      const next = MATCHES
        .filter((m) => (m.homeKey === teamKey || m.awayKey === teamKey) && matchUtcDate(m).getTime() > matchTime)
        .sort((a, b) => matchUtcDate(a).getTime() - matchUtcDate(b).getTime())[0];
      return next ? { teamKey, match: next } : null;
    })
    .filter(Boolean) as { teamKey: string; match: Match }[];
  const groupThirdPlace = thirdPlaceRows?.find((row) => row.group === match.group);
  const shootout = liveState.penaltyShootoutScore;
  const hasShootout = shootout?.home !== null && shootout?.home !== undefined && shootout?.away !== null && shootout?.away !== undefined;
  const shootoutWinnerName =
    live?.winner === "HOME_TEAM" ? homeName :
    live?.winner === "AWAY_TEAM" ? awayName :
    hasShootout && shootout!.home! > shootout!.away! ? homeName :
    hasShootout && shootout!.away! > shootout!.home! ? awayName :
    null;
  const shootoutText = hasShootout
    ? `${shootoutWinnerName ?? "Winner"} advanced ${shootout!.home}-${shootout!.away} on penalties`
    : null;
  const winnerText =
    shootoutText && hasScore
      ? `${homeName} and ${awayName} drew ${homeScore}-${awayScore}; ${shootoutText}`
      : hasScore && homeScore! > awayScore!
      ? `${homeName} beat ${awayName} ${homeScore}–${awayScore}`
      : hasScore && awayScore! > homeScore!
        ? `${awayName} beat ${homeName} ${awayScore}–${homeScore}`
        : hasScore
          ? `${homeName} and ${awayName} drew ${homeScore}–${awayScore}`
          : "";
  const goalCompleteness = liveState.goalEventCompleteness;
  const nowMs = Date.now();
  const isOldCompletedMatch = !isMatchInReconciliationWindow(liveState.status, matchTime, nowMs);
  const missingGoalText = missingScorerDetailText(goalCompleteness.missingGoalEventCount, isOldCompletedMatch);

  const homeEnglish = homeKey ? countryName(homeKey, "en") : homeName;
  const awayEnglish = awayKey ? countryName(awayKey, "en") : awayName;

  const allStaticEvents = (matchEventsData as any[]).filter(e => e.matchId === matchSlug(match));

  const staticGoalEvents: LiveMatchEvent[] = allStaticEvents
    .filter(e => e.eventType === 'goal' || e.eventType === 'own_goal' || e.eventType === 'penalty_goal')
    .map(e => ({
      type: e.eventType === 'own_goal' ? 'OWN_GOAL' : e.eventType === 'penalty_goal' ? 'PENALTY_GOAL' : 'GOAL',
      minute: e.minute,
      stoppageTime: e.stoppageMinute || null,
      minuteLabel: `${e.minute}${e.stoppageMinute ? `+${e.stoppageMinute}` : ""}'`,
      teamName: e.teamKey,
      playerName: e.playerName,
      assistName: e.assistPlayerName,
      isOwnGoal: e.eventType === 'own_goal',
    }));
  const goalEventsSource = staticGoalEvents.length > 0
    ? staticGoalEvents
    : (live?.goals && live.goals.length > 0 ? live.goals : liveState.scorers);

  // Scorer events carry English provider team names regardless of UI
  // language, so match against English names rather than the localized
  // display names used elsewhere on the page.
  const { confirmedEvents: confirmedGoals } = reconcileGoalEvents({
    homeScore,
    awayScore,
    homeTeamName: homeEnglish,
    awayTeamName: awayEnglish,
    events: goalEventsSource as any[],
  });
  const scorers = buildScorerSentence(confirmedGoals.map(toLiveGoalEvent), homeName, awayName, goalCompleteness);

  const staticCards = allStaticEvents
    .filter(e => e.eventType === 'yellow_card' || e.eventType === 'red_card' || e.eventType === 'second_yellow')
    .map(e => ({
      minute: e.minute,
      type: e.eventType === 'yellow_card' ? 'YELLOW_CARD' : 'RED_CARD',
      playerName: e.playerName,
      teamName: e.teamKey,
    }));
  const cardsSource = staticCards.length > 0 ? staticCards : (live?.bookings || []);

  const staticSubs = allStaticEvents
    .filter(e => e.eventType === 'substitution')
    .map(e => ({
      minute: e.minute,
      playerName: e.playerName,
      detail: e.relatedPlayerName,
      teamName: e.teamKey,
    }));
  const subsSource = staticSubs.length > 0 ? staticSubs : (live?.substitutions || []);

  const staticShootouts = allStaticEvents
    .filter(e => e.eventType === 'penalty_shootout_scored' || e.eventType === 'penalty_shootout_missed')
    .map(e => ({
      type: e.eventType === 'penalty_shootout_scored' ? 'PENALTY_SHOOTOUT_SCORED' : 'PENALTY_SHOOTOUT_MISSED',
      minute: null,
      teamName: e.teamKey,
      playerName: e.playerName,
    }));
  const shootoutsSource = staticShootouts;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Back link */}
      <Link
        href="/schedule"
        className="font-heading text-sm font-bold uppercase tracking-wide text-white/50 transition hover:text-accent"
      >
        ← {t("match_backSched")}
      </Link>

      {/* ── MATCH HERO ───────────────────────────────────────────────────── */}
      <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/10 bg-navyCard">
        {/* Background: team colors as a split gradient */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            background:
              "linear-gradient(to right, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)",
          }}
          aria-hidden="true"
        />

        <div className="relative px-6 py-8 sm:px-10">
          {/* Group + matchday badge */}
          <div className="mb-6 flex justify-center">
            <span className="rounded-full bg-accent/20 px-3 py-1 font-heading text-xs font-extrabold uppercase tracking-widest text-accent">
              {stageLabel}
            </span>
          </div>

          {/* Teams row */}
          <div className="flex items-center justify-between gap-4">
            {/* Home team */}
            <Link href={`/teams/${slugFor(homeKey ?? match.homeKey)}`} prefetch={false} className="group flex flex-1 flex-col items-center gap-3 text-center transition-opacity hover:opacity-80">
              <Flag
                code={homeKey ? (getResolvedHomeCode(match, resolvedParticipants) ?? match.homeCode) : ""}
                name={homeName}
                width={80}
                height={56}
                className="rounded-lg shadow-2xl ring-1 ring-white/15 transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-heading text-lg font-extrabold uppercase leading-tight text-white transition-colors duration-300 group-hover:text-accent sm:text-xl">
                {homeName}
              </span>
            </Link>

            {/* Score / VS */}
            <div className="flex shrink-0 flex-col items-center gap-2">
              {hasScore ? (
                <>
                <div className="flex items-center gap-3">
                  <span className="font-heading text-5xl font-black tabular-nums text-white sm:text-6xl">
                    {homeScore}
                  </span>
                  <span className="font-heading text-2xl font-bold text-white/30">–</span>
                  <span className="font-heading text-5xl font-black tabular-nums text-white sm:text-6xl">
                    {awayScore}
                  </span>
                </div>
                {liveState.scoreDuration === "EXTRA_TIME" && (
                  <span className="mt-1 rounded bg-white/10 px-2 py-1 font-heading text-[10px] font-extrabold uppercase tracking-widest text-white/70">AET</span>
                )}
                {hasShootout && (
                  <span className="font-heading text-[10px] font-bold uppercase tracking-widest text-white/45">
                    Pens {shootout!.home}-{shootout!.away}
                  </span>
                )}
                </>
              ) : (
                <span className="font-heading text-base font-extrabold uppercase tracking-widest text-white/30">
                  {t("vs")}
                </span>
              )}
            </div>

            {/* Away team */}
            <Link href={`/teams/${slugFor(awayKey ?? match.awayKey)}`} prefetch={false} className="group flex flex-1 flex-col items-center gap-3 text-center transition-opacity hover:opacity-80">
              <Flag
                code={awayKey ? (getResolvedAwayCode(match, resolvedParticipants) ?? match.awayCode) : ""}
                name={awayName}
                width={80}
                height={56}
                className="rounded-lg shadow-2xl ring-1 ring-white/15 transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-heading text-lg font-extrabold uppercase leading-tight text-white transition-colors duration-300 group-hover:text-accent sm:text-xl">
                {awayName}
              </span>
            </Link>
          </div>

          {/* Status badge — in the cold-start fallback a started match's result
              is unknown, so show an honest unavailable state rather than a stale
              "scheduled"/score. Clears automatically once polling returns a
              validated snapshot. */}
          <div className="mt-4 flex justify-center">
            {liveState.liveDataUnavailable ? (
              <span className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/15 px-3 py-1 font-heading text-xs font-extrabold uppercase tracking-widest text-amber-300">
                Live data unavailable
              </span>
            ) : (
              <StatusBadge status={status} t={t} />
            )}
          </div>

          {/* Goal Scorers / Match Events in Hero */}
          {status !== "upcoming" && (
            <div className="mt-5 w-full border-t border-white/5 pt-4 text-center">
              {confirmedGoals.length > 0 ? (
                <ul className="mx-auto flex max-w-sm flex-col items-center gap-1.5">
                  {confirmedGoals.map((g, i) => (
                    <li key={i} className="flex items-center justify-center gap-2 text-[13px]">
                      <span className="font-heading font-bold tabular-nums text-white/50">
                        {g.minuteLabel ?? (g.minute != null ? `${g.minute}'` : "—")}
                      </span>
                      <span className="font-semibold text-white/90">{g.playerName ?? "Scorer pending"}</span>
                      {g.teamName && (
                        <span className="text-white/60 mx-1">— {country(g.teamName)}</span>
                      )}
                      {g.assistName && (
                        <span className="text-[11px] text-white/40">(ast: {g.assistName})</span>
                      )}
                      {g.isOwnGoal && (
                        <span className="text-[11px] font-bold text-red-400">(OG)</span>
                      )}
                      {(g.isPenalty || g.type === "PENALTY_GOAL") && (
                        <span className="text-[11px] font-bold text-yellow-400">(P)</span>
                      )}
                    </li>
                  ))}
                  {missingGoalText && <li className="mt-1 text-[11px] text-white/40">{missingGoalText}</li>}
                </ul>
              ) : missingGoalText ? (
                <p className="text-[13px] text-white/50">{missingGoalText}</p>
              ) : (
                <p className="text-[13px] text-white/50">Match events unavailable</p>
              )}
            </div>
          )}

          {/* Date / time / venue */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-white/50">
            {match.time ? (
              <KickoffDateTime match={match} className="font-semibold text-white/80" />
            ) : (
              <span className="font-semibold text-white/80">{formatDate(match.date)}</span>
            )}
            {match.venue && (
              <>
                <span>·</span>
                <span>{match.venue}</span>
              </>
            )}
          </div>

          {/* Sync note — score/status freshness from the primary provider only;
              a secondary-provider outage does not imply the score is stale. */}
          {liveState.status !== "SCHEDULED" && (
            <p className="mt-2 text-center text-xs text-white/30">
              <FreshnessLabel
                primaryProviderFetchedAt={liveState.primaryProviderFetchedAt}
                primaryProviderOk={liveState.primaryProviderOk}
                className="text-white/30"
              />
            </p>
          )}
        </div>
      </div>

      {/* ── QUICK ANSWERS ────────────────────────────────────────────────── */}
      <section className="mt-4" aria-label="Quick answers about this match">
        <p className="mb-2 font-heading text-[10px] font-extrabold uppercase tracking-[0.25em] text-white/30">
          {t("match_quickAnswers")}
        </p>
        <div className="space-y-1.5">
          <div className="rounded-lg border border-white/8 bg-navyCard/60 px-4 py-3">
            <p className="font-heading text-[11px] font-extrabold uppercase tracking-wide text-white/40">
              {t("match_qa_when")}
            </p>
            <p className="mt-1 text-sm text-white/80">
              {match.time ? (
                <KickoffDateTime match={match} className="font-semibold text-white" />
              ) : (
                <span className="font-semibold text-white">{formatDate(match.date)}</span>
              )}
            </p>
          </div>
          {match.venue && (
            <div className="rounded-lg border border-white/8 bg-navyCard/60 px-4 py-3">
              <p className="font-heading text-[11px] font-extrabold uppercase tracking-wide text-white/40">
                {t("match_qa_where")}
              </p>
              <p className="mt-1 text-sm font-semibold text-white">{match.venue}</p>
            </div>
          )}
          <div className="rounded-lg border border-white/8 bg-navyCard/60 px-4 py-3">
            <p className="font-heading text-[11px] font-extrabold uppercase tracking-wide text-white/40">
              {isGroupStage ? t("match_qa_group") : "Stage"}
            </p>
            <p className="mt-1 text-sm text-white/80">
              <span className="font-semibold text-white">
                {stageLabel}
              </span>{" "}
              — {homeName} {t("vs")} {awayName}
            </p>
          </div>
        </div>
      </section>

      {/* ── EVENTS (live / finished) or PREVIEW (upcoming) ──────────────── */}
      <div className="mt-6 space-y-4">
        {status === "upcoming" ? (
          /* Pre-match preview */
          <EventSection title={t("match_preview")} icon="🔭">
            <p className="text-sm text-white/50">{t("match_previewNote")}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-navy/60 p-3 text-center">
                <Flag
                  code={homeKey ? (getResolvedHomeCode(match, resolvedParticipants) ?? match.homeCode) : ""}
                  name={homeName}
                  width={40}
                  height={28}
                  className="mx-auto rounded-sm"
                />
                <p className="mt-2 font-heading text-xs font-extrabold uppercase tracking-wide text-white">
                  {homeName}
                </p>
                <p className="mt-0.5 text-xs text-white/40">{stageLabel}</p>
              </div>
              <div className="rounded-lg bg-navy/60 p-3 text-center">
                <Flag
                  code={awayKey ? (getResolvedAwayCode(match, resolvedParticipants) ?? match.awayCode) : ""}
                  name={awayName}
                  width={40}
                  height={28}
                  className="mx-auto rounded-sm"
                />
                <p className="mt-2 font-heading text-xs font-extrabold uppercase tracking-wide text-white">
                  {awayName}
                </p>
                <p className="mt-0.5 text-xs text-white/40">{stageLabel}</p>
              </div>
            </div>
          </EventSection>
        ) : (
          <>


            {/* Cards */}
            <EventSection title={t("match_bookings")} icon="🟨">
              {cardsSource.length > 0 ? (
                <ul className="space-y-2">
                  {cardsSource.map((b, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <span className="w-8 shrink-0 text-right font-heading font-bold tabular-nums text-white/50">
                        {b.minute != null ? `${b.minute}'` : "—"}
                      </span>
                      {b.teamName && (
                        <span className="text-white/60 mr-1">{country(b.teamName)} — </span>
                      )}
                      <span
                        className={`h-4 w-3 shrink-0 rounded-sm ${
                          b.type === "RED_CARD" ? "bg-red-500" : "bg-yellow-400"
                        }`}
                        aria-label={b.type}
                      />
                      <span className="font-semibold text-white">{b.playerName ?? "—"}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyEvents note={t("match_noEvents")} />
              )}
            </EventSection>

            {/* Substitutions */}
            <EventSection title={t("match_subs")} icon="🔄">
              {subsSource.length > 0 ? (
                <ul className="space-y-2">
                  {subsSource.map((s, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <span className="w-8 shrink-0 text-right font-heading font-bold tabular-nums text-white/50">
                        {s.minute != null ? `${s.minute}'` : "—"}
                      </span>
                      {s.teamName && (
                        <span className="text-white/60 mr-1">{country(s.teamName)} — </span>
                      )}
                      <span className="text-green-400">↑</span>
                      <span className="font-semibold text-white">{s.playerName ?? "—"}</span>
                      <span className="text-white/30">/</span>
                      <span className="text-red-400">↓</span>
                      <span className="text-white/60">{s.detail ?? "—"}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyEvents note={t("match_noEvents")} />
              )}
            </EventSection>

            {/* Penalty Shootout */}
            {shootoutsSource.length > 0 && (
              <EventSection title="Penalty shootout" icon="🥅">
                <ul className="space-y-2">
                  {shootoutsSource.map((s, i) => (
                    <li key={i} className="flex items-center text-[13px]">
                      <span className="font-bold text-white w-8 shrink-0">{i + 1}</span>
                      <span className="text-white mx-2 shrink-0">{s.playerName}</span>
                      {s.teamName && (
                        <span className="font-normal text-white/60 ml-1 truncate">
                          — {country(s.teamName)}
                        </span>
                      )}
                      <span className={`ml-auto font-medium ${s.type === 'PENALTY_SHOOTOUT_SCORED' ? 'text-green-400' : 'text-red-400'}`}>
                        {s.type === 'PENALTY_SHOOTOUT_SCORED' ? 'Scored' : 'Missed'}
                      </span>
                    </li>
                  ))}
                </ul>
              </EventSection>
            )}

            {/* Team Stats */}
            {live?.teamStats && (
              <EventSection title="Team stats" icon="📊">
                <div className="flex flex-col gap-3 text-sm">
                  {[
                    { label: "Possession", home: `${live.teamStats.possession.home}%`, away: `${live.teamStats.possession.away}%` },
                    { label: "Shots", home: live.teamStats.shots.home, away: live.teamStats.shots.away },
                    { label: "Shots on target", home: live.teamStats.shotsOnTarget.home, away: live.teamStats.shotsOnTarget.away },
                    { label: "Corners", home: live.teamStats.corners.home, away: live.teamStats.corners.away },
                    { label: "Fouls", home: live.teamStats.fouls.home, away: live.teamStats.fouls.away },
                    { label: "Yellow cards", home: live.teamStats.yellowCards.home, away: live.teamStats.yellowCards.away },
                    { label: "Red cards", home: live.teamStats.redCards.home, away: live.teamStats.redCards.away },
                    { label: "Saves", home: live.teamStats.saves.home, away: live.teamStats.saves.away },
                    { label: "Offsides", home: live.teamStats.offsides.home, away: live.teamStats.offsides.away },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
                      <span className="w-12 text-center font-heading font-bold tabular-nums text-white">{stat.home}</span>
                      <span className="flex-1 text-center text-xs font-semibold uppercase tracking-wider text-white/50">{stat.label}</span>
                      <span className="w-12 text-center font-heading font-bold tabular-nums text-white">{stat.away}</span>
                    </div>
                  ))}
                </div>
              </EventSection>
            )}
          </>
        )}
      </div>

      {isConfirmedFinished && (
        <section className="mt-6 space-y-4">
          <EventSection title="Result summary" icon="⚽">
            <p className="text-sm leading-relaxed text-white/70">
              {winnerText} in the {stageLabel}.{scorers ? ` ${scorers}` : ""}
            </p>
          </EventSection>

          {isGroupStage && (homeStanding || awayStanding) && (
            <EventSection title="What this result means" icon="📊">
              <div className="space-y-2 text-sm leading-relaxed text-white/70">
                {homeStanding && (
                  <p>
                    {homeName} are on {pointText(homeStanding.points)} in Group {match.group}
                    {typeof homeRank === "number" && homeRank >= 0 ? ` and currently ${ordinal(homeRank + 1)} in the group` : ""}.
                  </p>
                )}
                {awayStanding && (
                  <p>
                    {awayName} are on {pointText(awayStanding.points)} in Group {match.group}
                    {typeof awayRank === "number" && awayRank >= 0 ? ` and currently ${ordinal(awayRank + 1)} in the group` : ""}.
                  </p>
                )}
                {groupThirdPlace && (
                  <p>
                    Group {match.group}&apos;s third-place position is reflected in the third-place ranking table.
                  </p>
                )}
              </div>
            </EventSection>
          )}

          {nextMatches.length > 0 && (
            <EventSection title="Next matches" icon="🗓">
              <div className="space-y-2">
                {nextMatches.map(({ teamKey, match: next }) => (
                  <Link
                    key={`${teamKey}-${matchSlug(next)}`}
                    href={`/matches/${matchSlug(next)}`}
                    prefetch={false}
                    className="block rounded-lg border border-white/10 bg-navy/50 px-3 py-2 text-sm text-white/70 transition hover:border-white/20 hover:text-white"
                  >
                    <span className="font-semibold text-white">{country(teamKey)}</span>
                    {" — "}
                    {country(next.homeKey)} {t("vs")} {country(next.awayKey)}
                    {" · "}
                    <KickoffDateTime match={next} className="font-semibold text-white/80" />
                  </Link>
                ))}
              </div>
            </EventSection>
          )}

          <div className="flex flex-wrap gap-3 text-sm">
            {[
              ...(isGroupStage ? [
                { href: "/groups", label: `View Group ${match.group} standings` },
                { href: "/world-cup-third-place-qualification", label: "See third-place ranking" },
              ] : [
                { href: "/bracket", label: "View knockout bracket" },
              ]),
              { href: todayHref, label: "View Match Center" },
              { href: "/stats", label: "See tournament stats" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg border border-white/15 bg-navyCard px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-white/70 transition hover:border-white/30 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

