"use client";

import Link from "next/link";
import { Flag } from "@/components/Flag";
import { MatchTime } from "@/components/MatchTime";
import { TimezoneLabel } from "@/components/TimezoneLabel";
import { FreshnessLabel } from "@/components/FreshnessLabel";
import { useLang } from "@/components/LanguageProvider";
import { useTimezone } from "@/components/TimezoneProvider";
import { matchSlug, ARCHIVE_DEFAULT_DATE, MATCHES, type Match } from "@/lib/matches";
import { getHomepageMatchCenterSnapshot, getMatchCenterSnapshot, type TournamentPhase } from "@/lib/matchCenterSelection";
import { getMatchPresentation, getMatchStatusLabel } from "@/lib/matchPresentation";
import { getParticipantDisplay, type ResolvedParticipantLookup } from "@/lib/participant-resolution";
import type { LiveMatchData } from "@/lib/liveMatchData";
import type { GoalScorerEvent } from "@/lib/worldcup26Provider";
import { reconcileGoalEvents } from "@/lib/scoreReconciliation";
import { formatGoalEventDisplay } from "@/lib/canonicalArchiveEvents";
import { CountdownClient } from "@/components/CountdownClient";

export type MatchCenterLiveSnapshot = {
  snapshotId: string;
  generatedAt: string;
  liveDataByProviderId: Record<string, LiveMatchData>;
  scorersByMatchId: Record<string, GoalScorerEvent[]>;
  resolvedParticipants: ResolvedParticipantLookup;
  primaryProviderFetchedAt: string | null;
  primaryProviderOk: boolean;
};

function scorerText(events: GoalScorerEvent[] | undefined) {
  if (!events || events.length === 0) return null;
  return events.map(formatGoalEventDisplay).join(" • ");
}

function venueCity(venue: string | undefined) {
  if (venue === "MetLife Stadium") return "East Rutherford, New Jersey";
  if (venue === "Hard Rock Stadium") return "Miami Gardens, Florida";
  return null;
}

function DecidingMatchCard({ m, live, resolvedParticipants, primary }: {
  m: Match;
  live: LiveMatchData | undefined;
  resolvedParticipants: ResolvedParticipantLookup;
  primary: boolean;
}) {
  const { lang } = useLang();
  const { timeZone } = useTimezone();
  const home = getParticipantDisplay(m, "home", resolvedParticipants, lang);
  const away = getParticipantDisplay(m, "away", resolvedParticipants, lang);
  const presentation = getMatchPresentation({ match: m, liveData: live, timeZone: timeZone || "UTC", now: new Date(ARCHIVE_DEFAULT_DATE) });
  const isFinal = "stage" in m && m.stage === "F";
  const stage = isFinal ? "2026 World Cup Final" : "Third-place playoff";
  const city = venueCity(m.venue);

  return (
    <Link href={`/matches/${matchSlug(m)}`} prefetch={false} aria-label={`View ${stage}: ${home.label} vs ${away.label}`}
      className={`block rounded-xl border transition hover:border-accent/80 ${primary ? "border-accent/70 bg-gradient-to-br from-accent/20 via-navyCard to-navyCard p-5 shadow-[0_18px_50px_rgba(232,0,28,0.18)] sm:p-6" : "border-white/15 bg-navyCard p-4 sm:p-5"}`}>
      <div className="flex items-center justify-between gap-3"><span className={`font-heading font-extrabold uppercase tracking-[0.18em] ${primary ? "text-sm text-accent" : "text-[11px] text-white/60"}`}>{isFinal ? "FINAL" : "THIRD-PLACE PLAYOFF"}</span><span className="text-[11px] font-semibold uppercase tracking-wider text-white/50">{stage}</span></div>
      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3"><div className="min-w-0 text-right"><p className={`font-heading font-extrabold uppercase leading-tight text-white ${primary ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"}`}>{home.label}</p>{home.teamCode ? <Flag code={home.teamCode} alt="" width={primary ? 36 : 28} height={primary ? 26 : 20} className="ml-auto mt-2 shadow-sm" /> : null}</div><span className={`font-heading font-black text-white/45 ${primary ? "text-xl" : "text-sm"}`}>VS</span><div className="min-w-0"><p className={`font-heading font-extrabold uppercase leading-tight text-white ${primary ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"}`}>{away.label}</p>{away.teamCode ? <Flag code={away.teamCode} alt="" width={primary ? 36 : 28} height={primary ? 26 : 20} className="mt-2 shadow-sm" /> : null}</div></div>
      <div className="mt-5 border-t border-white/10 pt-3 text-center text-sm text-white/70"><span className="font-semibold">{presentation.displayKickoffDate} · {presentation.displayKickoffTime}</span>{m.venue ? <span> · {m.venue}</span> : null}{city ? <span> · {city}</span> : null}</div>
      <span className="mt-4 inline-flex font-heading text-xs font-bold uppercase tracking-widest text-accent">View the {isFinal ? "Final" : "Third-place playoff"} →</span>
    </Link>
  );
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
    final: getMatchStatusLabel(pres) ?? "FT",
    syncing: t("state_syncing") || "Awaiting update",
    postponed: "Postponed",
    cancelled: "Cancelled",
  };
  const statusLabel = statusMap[pres.state] || "Upcoming";

  return (
    <Link
      href={`/matches/${matchSlug(m)}`}
      prefetch={false}
      className="block rounded-lg border border-white/10 bg-navy px-3 py-1.5 transition hover:border-white/20"
    >
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-2">
          <span className="min-w-0 text-sm font-bold text-white text-right leading-tight break-words">{home.label}</span>
          {home.teamCode && <Flag code={home.teamCode} alt="" width={28} height={20} className="shrink-0 shadow-sm" />}
        </div>

        {pres.showScore ? (
          <span className="shrink-0 px-1 font-heading text-base font-extrabold tabular-nums text-white">
            {pres.homeScore} - {pres.awayScore}
          </span>
        ) : (
          <span className="shrink-0 px-1 font-heading text-[11px] font-bold uppercase text-white/55">{t("vs")}</span>
        )}

        <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
          {away.teamCode && <Flag code={away.teamCode} alt="" width={28} height={20} className="shrink-0 shadow-sm" />}
          <span className="min-w-0 text-sm font-bold text-white text-left leading-tight break-words">{away.label}</span>
        </div>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2 text-[11px] text-white/50">
        {pres.showStatus && (
          <span className={`rounded px-1.5 py-0.5 font-heading text-[10px] font-extrabold uppercase tracking-widest ${
            pres.state === 'live' || pres.state === 'halftime'
              ? 'bg-red-600 text-white flex items-center gap-1'
              : pres.state === 'syncing'
                ? 'bg-white/5 text-[#f5a623]'
                : 'bg-white/10 text-white/60'
          }`}>
            {pres.state === 'live' && <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />}
            {statusLabel}
          </span>
        )}
        <span className="font-semibold text-white/75" suppressHydrationWarning>
          {pres.displayKickoffDate} • {pres.displayKickoffTime}
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
  mode = "standard",
  tournamentPhase,
  countdownTarget,
  isTournamentComplete = false,
}: {
  liveSnapshot: MatchCenterLiveSnapshot;
  mode?: "standard" | "homepage" | "current";
  tournamentPhase?: TournamentPhase;
  countdownTarget?: string | null;
  /** Owned by getArchiveState; never infer completion from a missing countdown. */
  isTournamentComplete?: boolean;
}) {
  const { t, lang } = useLang();
  const { timeZone } = useTimezone();
  const tz = timeZone || "UTC";

  // Archive-backed pages must use the same instant in static HTML and after
  // hydration. Live refresh replaces the snapshot rather than changing the
  // selector clock underneath an unchanged snapshot.
  const now = new Date(ARCHIVE_DEFAULT_DATE);

  const snapshot = getMatchCenterSnapshot({
    matches: MATCHES,
    liveData: liveSnapshot.liveDataByProviderId,
    timeZone: tz,
    now: now
  });
  const phaseSnapshot = (mode === "homepage" || mode === "current") && tournamentPhase
    ? getHomepageMatchCenterSnapshot({
        matches: MATCHES,
        liveData: liveSnapshot.liveDataByProviderId,
        now,
        phase: tournamentPhase,
      })
    : null;

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

  if (phaseSnapshot) {
    const archivedDestinations = phaseSnapshot.destinations ?? [];
    const decidingMatches = [...archivedDestinations].sort((a, b) => {
      const aIsFinal = "stage" in a && a.stage === "F";
      const bIsFinal = "stage" in b && b.stage === "F";
      return Number(bIsFinal) - Number(aIsFinal);
    });
    const finalMatch = decidingMatches.find((m) => "stage" in m && m.stage === "F");
    const thirdPlaceMatch = decidingMatches.find((m) => "stage" in m && m.stage === "3P");
    return (
      <div className="rounded-xl border border-white/10 bg-navyCard p-4 shadow-2xl sm:p-6">
        <div className="space-y-4 sm:space-y-6">
          {false && tournamentPhase === "tournament_complete" && archivedDestinations.length > 0 && (
            <section>
              <h2 className="mb-3 font-heading text-[11px] font-bold uppercase tracking-widest text-white/40">Tournament Final</h2>
              <div className="flex flex-col gap-1">
                {archivedDestinations.map(m => (
                  <div key={matchSlug(m)}>
                    {renderRow(m)}
                  </div>
                ))}
              </div>
            </section>
          )}

          {(finalMatch || thirdPlaceMatch) && <section aria-labelledby="deciding-matches-heading">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="deciding-matches-heading" className="font-heading text-sm font-extrabold uppercase tracking-[0.18em] text-accent">
                {isTournamentComplete ? "Tournament Complete" : "Final Weekend"}
              </h2>
              <Link href="/bracket" className="text-xs font-bold uppercase tracking-wider text-white/55 hover:text-white">Complete bracket →</Link>
            </div>
            <div className="space-y-3">
              {finalMatch ? <DecidingMatchCard m={finalMatch} live={finalMatch.providerIds?.footballData ? liveSnapshot.liveDataByProviderId[String(finalMatch.providerIds.footballData)] : undefined} resolvedParticipants={liveSnapshot.resolvedParticipants} primary /> : null}
              {thirdPlaceMatch ? <DecidingMatchCard m={thirdPlaceMatch} live={thirdPlaceMatch.providerIds?.footballData ? liveSnapshot.liveDataByProviderId[String(thirdPlaceMatch.providerIds.footballData)] : undefined} resolvedParticipants={liveSnapshot.resolvedParticipants} primary={false} /> : null}
            </div>
          </section>}

          {mode === "homepage" && <section className="rounded-xl border border-white/10 bg-navy/40 px-4 py-3" aria-label="Countdown to the next deciding match">
            <p className="font-heading text-[11px] font-bold uppercase tracking-widest text-white/50">
              {isTournamentComplete ? "Tournament complete" : "Next deciding match"}
            </p>
            <CountdownClient tournamentPhase={tournamentPhase ?? "pre_tournament"} target={countdownTarget ?? null} isComplete={isTournamentComplete} />
          </section>}

          <section>
            <h2 className="mb-3 font-heading text-[11px] font-bold uppercase tracking-widest text-white/40">Semifinal results</h2>
            <div className="flex flex-col gap-1">
              {phaseSnapshot.completedCurrentRound.map(renderRow)}
              {phaseSnapshot.upcomingCurrentRound.map(renderRow)}
            </div>
          </section>

          {/* Legacy placement output intentionally suppressed: Final Weekend above is the public deciding-match hierarchy.
            const stageLabel = (m: Match) => ("stage" in m && m.stage === "3P" ? "Match 103 — Third-place playoff" : "Match 104 — Final");
            const { completed, upcoming } = splitDestinationsByCompletion({
              destinations: phaseSnapshot.destinations,
              liveData: liveSnapshot.liveDataByProviderId,
              now,
            });

            return (
              <>
                {completed.length > 0 && (
                  <section className="rounded-lg border border-white/10 bg-navy/30 p-4">
                    <h2 className="mb-3 font-heading text-[11px] font-bold uppercase tracking-widest text-white/40">Placement Results</h2>
                    <div className="flex flex-col gap-3">
                      {completed.map(m => (
                        <div key={matchSlug(m)}>
                          <p className="mb-1 text-xs font-bold text-white/60">{stageLabel(m)}</p>
                          {renderRow(m)}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                {upcoming.length > 0 && (
                  <section className="rounded-lg border border-white/10 bg-navy/30 p-4">
                    <h2 className="mb-3 font-heading text-[11px] font-bold uppercase tracking-widest text-white/40">Destinations</h2>
                    <div className="flex flex-col gap-3">
                      {upcoming.map(m => (
                        <div key={matchSlug(m)}>
                          <p className="mb-1 text-xs font-bold text-white/60">{stageLabel(m)}</p>
                          {renderRow(m)}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            );
          })()}
          {false && tournamentPhase !== "tournament_complete" && archivedDestinations.length > 0 && (
            <section className="rounded-lg border border-white/10 bg-navy/30 p-4">
              <h2 className="mb-3 font-heading text-[11px] font-bold uppercase tracking-widest text-white/40">Destinations</h2>
              <div className="flex flex-col gap-3">
                {archivedDestinations.map(m => (
                  <div key={matchSlug(m)}>
                    <p className="mb-1 text-xs font-bold text-white/60">
                      {"stage" in m && m.stage === "3P" ? "Match 103 — Third-place playoff" : "Match 104 — Final"}
                    </p>
                    {renderRow(m)}
                  </div>
                ))}
              </div>
            </section>
          )}
          */}

          <section>
            <h2 className="mb-3 font-heading text-[11px] font-bold uppercase tracking-widest text-white/40">Quarterfinal Results</h2>
            <div className="flex flex-col gap-1">
              {phaseSnapshot.completedPreviousRound.map(renderRow)}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-navyCard p-2 shadow-2xl sm:p-6">
      <div className="mb-0 flex items-center justify-between">
        <p className="font-heading text-sm font-extrabold uppercase tracking-[0.2em] text-accent">Match Center</p>
      </div>

      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <TimezoneLabel className="text-[11px] text-white/55" />
        <FreshnessLabel primaryProviderFetchedAt={liveSnapshot.primaryProviderFetchedAt} primaryProviderOk={liveSnapshot.primaryProviderOk} />
      </div>

      <div className="space-y-2 sm:space-y-6">
        {snapshot.liveNow.length > 0 && (
          <div>
            <h3 className="mb-3 font-heading text-[11px] font-bold uppercase tracking-widest text-red-400">Live Now</h3>
            <div className="flex flex-col gap-1">
              {snapshot.liveNow.map(renderRow)}
            </div>
          </div>
        )}

        {snapshot.syncing && snapshot.syncing.length > 0 && (
          <div>
            <h3 className="mb-3 font-heading text-[11px] font-bold uppercase tracking-widest text-[#f5a623]">{t("sec_awaitingUpdate") || "Awaiting update"}</h3>
            <div className="flex flex-col gap-1">
              {snapshot.syncing.map(renderRow)}
            </div>
          </div>
        )}

        {snapshot.latestResult && (
          <div>
            <h3 className="mb-1 font-heading text-[11px] font-bold uppercase tracking-widest text-white/40">{t("sec_latestResults") || "Latest Result"}</h3>
            <div className="flex flex-col gap-1">
              {renderRow(snapshot.latestResult)}
            </div>
          </div>
        )}

        {snapshot.upNext.length > 0 && (
          <div>
            <h3 className="mb-1 font-heading text-[11px] font-bold uppercase tracking-widest text-white/40">Up Next</h3>
            <div className="flex flex-col gap-1">
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
