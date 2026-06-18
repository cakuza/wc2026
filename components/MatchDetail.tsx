"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flag } from "@/components/Flag";
import { KickoffDateTime } from "@/components/MatchTime";
import { FreshnessLabel } from "@/components/FreshnessLabel";
import { useLang } from "@/components/LanguageProvider";
import { MATCHES, matchSlug, matchUtcDate, type Match } from "@/lib/matches";
import type { MatchEvents } from "@/lib/matchEvents";
import type { LiveMatchData, LiveMatchEvent } from "@/lib/liveMatchData";
import type { StandingRow } from "@/lib/groupStandings";
import type { ThirdPlaceRow } from "@/lib/thirdPlaceRanking";
import { countryName } from "@/lib/i18n";
import { buildScorerSentence } from "@/lib/resultSummary";
import { missingScorerDetailText, type GoalEventCompleteness } from "@/lib/goalEventCompleteness";
import { type SnapshotMatchStatus } from "@/lib/liveSnapshot";
import { reconcileGoalEvents, isMatchPollingActive, isMatchInReconciliationWindow } from "@/lib/scoreReconciliation";
import type { GoalScorerEvent } from "@/lib/worldcup26Provider";
import { slugFor } from "@/lib/teams";

interface Props {
  match: Match;
  events?: MatchEvents | null;
  live?: LiveMatchData | null;
  status: SnapshotMatchStatus;
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
}

type DisplayStatus = "upcoming" | "live" | "halftime" | "finished" | "syncing";

function toLiveGoalEvent(event: GoalScorerEvent): LiveMatchEvent {
  return {
    type: event.isOwnGoal ? "OWN_GOAL" : event.isPenalty || event.type === "PENALTY_GOAL" ? "PENALTY_GOAL" : "GOAL",
    minute: event.minute,
    stoppageTime: event.stoppageTime,
    minuteLabel: event.minuteLabel,
    teamName: event.teamName,
    playerTeamName: event.playerTeamName,
    playerName: event.playerName,
    isOwnGoal: event.isOwnGoal,
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
}: Props) {
  const { t, country, formatDate } = useLang();
  void events;

  const [liveState, setLiveState] = useState({
    status: initialStatus,
    homeScore: initialHomeScore,
    awayScore: initialAwayScore,
    scorers: initialScorers,
    goalEventCompleteness: initialCompleteness,
    primaryProviderFetchedAt: initialPrimaryProviderFetchedAt,
    primaryProviderOk: initialPrimaryProviderOk,
    secondaryProviderFetchedAt: initialSecondaryProviderFetchedAt,
    secondaryProviderOk: initialSecondaryProviderOk,
  });

  const internalId = matchSlug(match);
  const kickoffMs = matchUtcDate(match).getTime();

  // Ticks periodically so pollingActive re-evaluates as kickoff approaches or
  // passes, even while no poll-driven re-render has happened yet.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const pollingActive = isMatchPollingActive(liveState.status, kickoffMs, now);

  // Poll the lightweight internal live-snapshot endpoint while the match is
  // live or starting soon — reads the shared server snapshot, never the
  // upstream providers directly, and uses the current snapshot state (not
  // just the initial server props) for all subsequent live-status decisions.
  useEffect(() => {
    if (!pollingActive) return;

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
          const update = data.matches?.[internalId];
          if (!cancelled && update) {
            setLiveState((prev) => {
              const status = (prev.status === "FINISHED" && update.status !== "FINISHED")
                ? prev.status
                : update.status;
              const homeScore = update.homeScore === null && prev.homeScore !== null ? prev.homeScore : update.homeScore;
              const awayScore = update.awayScore === null && prev.awayScore !== null ? prev.awayScore : update.awayScore;
              const scorers = update.scorers.length === 0 && prev.scorers.length > 0 ? prev.scorers : update.scorers;
              const goalEventCompleteness = update.goalEventCompleteness.missingGoalEventCount > 0 && prev.goalEventCompleteness.missingGoalEventCount === 0
                ? prev.goalEventCompleteness
                : update.goalEventCompleteness;

              return {
                status,
                homeScore,
                awayScore,
                scorers,
                goalEventCompleteness,
                primaryProviderFetchedAt: data.primaryProviderFetchedAt,
                primaryProviderOk: data.primaryProviderOk,
                secondaryProviderFetchedAt: data.secondaryProviderFetchedAt,
                secondaryProviderOk: data.secondaryProviderOk,
              };
            });
          }
        }
      } catch {
        // keep last known state; retry on next tick
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
  }, [pollingActive, internalId]);

  const homeScore = liveState.homeScore;
  const awayScore = liveState.awayScore;
  const hasScore = homeScore !== null && awayScore !== null;
  const status: DisplayStatus = snapshotStatusToDisplay(liveState.status);

  const isConfirmedFinished = liveState.status === "FINISHED" && hasScore;
  const homeName = country(match.homeKey);
  const awayName = country(match.awayKey);
  const homeStanding = groupStandings?.find((row) => row.teamKey === match.homeKey);
  const awayStanding = groupStandings?.find((row) => row.teamKey === match.awayKey);
  const homeRank = groupStandings?.findIndex((row) => row.teamKey === match.homeKey);
  const awayRank = groupStandings?.findIndex((row) => row.teamKey === match.awayKey);
  const matchTime = matchUtcDate(match).getTime();
  const nextMatches = [match.homeKey, match.awayKey]
    .map((teamKey) => {
      const next = MATCHES
        .filter((m) => (m.homeKey === teamKey || m.awayKey === teamKey) && matchUtcDate(m).getTime() > matchTime)
        .sort((a, b) => matchUtcDate(a).getTime() - matchUtcDate(b).getTime())[0];
      return next ? { teamKey, match: next } : null;
    })
    .filter(Boolean) as { teamKey: string; match: Match }[];
  const groupThirdPlace = thirdPlaceRows?.find((row) => row.group === match.group);
  const winnerText =
    hasScore && homeScore! > awayScore!
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
  // Scorer events carry English provider team names regardless of UI
  // language, so match against English names rather than the localized
  // display names used elsewhere on the page.
  const { confirmedEvents: confirmedGoals } = reconcileGoalEvents({
    homeScore,
    awayScore,
    homeTeamName: countryName(match.homeKey, "en"),
    awayTeamName: countryName(match.awayKey, "en"),
    events: liveState.scorers,
  });
  const scorers = buildScorerSentence(confirmedGoals.map(toLiveGoalEvent), homeName, awayName, goalCompleteness);

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
              {t("lbl_group")} {match.group}
            </span>
          </div>

          {/* Teams row */}
          <div className="flex items-center justify-between gap-4">
            {/* Home team */}
            <Link href={`/teams/${slugFor(match.homeKey)}`} className="group flex flex-1 flex-col items-center gap-3 text-center transition-opacity hover:opacity-80">
              <Flag
                code={match.homeCode}
                name={country(match.homeKey)}
                width={80}
                height={56}
                className="rounded-lg shadow-2xl ring-1 ring-white/15 transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-heading text-lg font-extrabold uppercase leading-tight text-white transition-colors duration-300 group-hover:text-accent sm:text-xl">
                {country(match.homeKey)}
              </span>
            </Link>

            {/* Score / VS */}
            <div className="flex shrink-0 flex-col items-center gap-2">
              {hasScore ? (
                <div className="flex items-center gap-3">
                  <span className="font-heading text-5xl font-black tabular-nums text-white sm:text-6xl">
                    {homeScore}
                  </span>
                  <span className="font-heading text-2xl font-bold text-white/30">–</span>
                  <span className="font-heading text-5xl font-black tabular-nums text-white sm:text-6xl">
                    {awayScore}
                  </span>
                </div>
              ) : (
                <span className="font-heading text-base font-extrabold uppercase tracking-widest text-white/30">
                  {t("vs")}
                </span>
              )}
            </div>

            {/* Away team */}
            <Link href={`/teams/${slugFor(match.awayKey)}`} className="group flex flex-1 flex-col items-center gap-3 text-center transition-opacity hover:opacity-80">
              <Flag
                code={match.awayCode}
                name={country(match.awayKey)}
                width={80}
                height={56}
                className="rounded-lg shadow-2xl ring-1 ring-white/15 transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-heading text-lg font-extrabold uppercase leading-tight text-white transition-colors duration-300 group-hover:text-accent sm:text-xl">
                {country(match.awayKey)}
              </span>
            </Link>
          </div>

          {/* Status badge */}
          <div className="mt-4 flex justify-center">
            <StatusBadge status={status} t={t} />
          </div>

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
              {t("match_qa_group")}
            </p>
            <p className="mt-1 text-sm text-white/80">
              <span className="font-semibold text-white">
                {t("lbl_group")} {match.group}
              </span>{" "}
              — {country(match.homeKey)} {t("vs")} {country(match.awayKey)}
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
                  code={match.homeCode}
                  name={country(match.homeKey)}
                  width={40}
                  height={28}
                  className="mx-auto rounded-sm"
                />
                <p className="mt-2 font-heading text-xs font-extrabold uppercase tracking-wide text-white">
                  {country(match.homeKey)}
                </p>
                <p className="mt-0.5 text-xs text-white/40">{t("lbl_group")} {match.group}</p>
              </div>
              <div className="rounded-lg bg-navy/60 p-3 text-center">
                <Flag
                  code={match.awayCode}
                  name={country(match.awayKey)}
                  width={40}
                  height={28}
                  className="mx-auto rounded-sm"
                />
                <p className="mt-2 font-heading text-xs font-extrabold uppercase tracking-wide text-white">
                  {country(match.awayKey)}
                </p>
                <p className="mt-0.5 text-xs text-white/40">{t("lbl_group")} {match.group}</p>
              </div>
            </div>
          </EventSection>
        ) : (
          <>
            {/* Goals */}
            <EventSection title={t("match_goals")} icon="⚽">
              {confirmedGoals.length > 0 ? (
                <ul className="space-y-2">
                  {confirmedGoals.map((g, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <span className="w-8 shrink-0 text-right font-heading font-bold tabular-nums text-white/50">
                        {g.minuteLabel ?? (g.minute != null ? `${g.minute}'` : "—")}
                      </span>
                      <span className="font-semibold text-white">{g.playerName ?? "Scorer pending"}</span>
                      {g.isOwnGoal && (
                        <span className="text-xs text-red-400">(OG)</span>
                      )}
                      {(g.isPenalty || g.type === "PENALTY_GOAL") && (
                        <span className="text-xs text-yellow-400">(P)</span>
                      )}
                    </li>
                  ))}
                  {missingGoalText ? (
                    <li className="pt-1 text-sm text-white/45">{missingGoalText}</li>
                  ) : null}
                </ul>
              ) : missingGoalText ? (
                <EmptyEvents note={missingGoalText} />
              ) : (
                <EmptyEvents note={t("match_noEvents")} />
              )}
            </EventSection>

            {/* Cards — only shown when the provider actually returned booking data */}
            {live?.eventDataAvailable && live.bookings && live.bookings.length > 0 && (
              <EventSection title={t("match_bookings")} icon="🟨">
                <ul className="space-y-2">
                  {live.bookings.map((b, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <span className="w-8 shrink-0 text-right font-heading font-bold tabular-nums text-white/50">
                        {b.minute != null ? `${b.minute}'` : "—"}
                      </span>
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
              </EventSection>
            )}

            {/* Substitutions — only shown when the provider actually returned substitution data */}
            {live?.eventDataAvailable && live.substitutions && live.substitutions.length > 0 && (
              <EventSection title={t("match_subs")} icon="🔄">
                <ul className="space-y-2">
                  {live.substitutions.map((s, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <span className="w-8 shrink-0 text-right font-heading font-bold tabular-nums text-white/50">
                        {s.minute != null ? `${s.minute}'` : "—"}
                      </span>
                      <span className="text-green-400">↑</span>
                      <span className="font-semibold text-white">{s.playerName ?? "—"}</span>
                      <span className="text-white/30">/</span>
                      <span className="text-red-400">↓</span>
                      <span className="text-white/60">{s.detail ?? "—"}</span>
                    </li>
                  ))}
                </ul>
              </EventSection>
            )}
          </>
        )}
      </div>

      {isConfirmedFinished && (
        <section className="mt-6 space-y-4">
          <EventSection title="Result summary" icon="⚽">
            <p className="text-sm leading-relaxed text-white/70">
              {winnerText} in Group {match.group}.{scorers ? ` ${scorers}` : ""}
            </p>
          </EventSection>

          {(homeStanding || awayStanding) && (
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
              { href: "/groups", label: `View Group ${match.group} standings` },
              { href: "/today", label: "See today's matches" },
              { href: "/stats", label: "See tournament stats" },
              { href: "/world-cup-third-place-qualification", label: "See third-place ranking" },
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

