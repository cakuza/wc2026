"use client";

import Link from "next/link";
import { MatchCenterContent, type MatchCenterLiveSnapshot } from "@/components/MatchCenterContent";
import type { DisplayMatchday } from "@/lib/matches";
import type { TournamentLiveSnapshot } from "@/lib/liveSnapshot";
import type { ResolvedParticipantLookup } from "@/lib/participant-resolution";
import type { TournamentPhase } from "@/lib/matchCenterSelection";
import type { ArchiveState } from "@/lib/archiveLifecycle";

function toMatchCenterLiveSnapshot(snapshot: TournamentLiveSnapshot, resolvedParticipants: ResolvedParticipantLookup): MatchCenterLiveSnapshot {
  const scorersByMatchId: Record<string, MatchCenterLiveSnapshot["scorersByMatchId"][string]> = {};
  for (const [id, entry] of Object.entries(snapshot.matches)) {
    if (entry.scorers.length > 0) scorersByMatchId[id] = entry.scorers;
  }
  return {
    snapshotId: snapshot.snapshotId,
    generatedAt: snapshot.generatedAt,
    liveDataByProviderId: snapshot.liveDataByProviderId,
    scorersByMatchId,
    resolvedParticipants,
    primaryProviderFetchedAt: snapshot.primaryProviderFetchedAt,
    primaryProviderOk: snapshot.primaryProviderOk,
  };
}

export function Hero({
  initialMatchday: _initialMatchday,
  snapshot,
  resolvedParticipants,
  tournamentPhase,
  countdownTarget,
  archiveState,
}: {
  initialMatchday: DisplayMatchday;
  snapshot: TournamentLiveSnapshot;
  resolvedParticipants: ResolvedParticipantLookup;
  tournamentPhase: TournamentPhase;
  countdownTarget: string | null;
  archiveState: ArchiveState;
}) {
  const isComplete = archiveState.isComplete;

  return (
    <section className="relative overflow-hidden border-b border-line bg-canvas">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ backgroundImage: "radial-gradient(60% 70% at 20% 0%, rgba(232,0,28,0.22), transparent 60%), radial-gradient(50% 60% at 90% 100%, rgba(232,0,28,0.14), transparent 60%)" }}
      />
      <div className="relative mx-auto max-w-7xl px-4 py-4 sm:px-8 sm:py-8">
        <header className="mb-3 max-w-4xl sm:mb-6">
          <p className="font-heading text-[10px] font-bold uppercase tracking-[0.24em] text-accent sm:text-xs sm:tracking-[0.3em]">
            {isComplete ? "The 2026 World Cup Vault" : "2026 World Cup · Final Weekend"}
          </p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold uppercase leading-[0.9] tracking-tight text-ink sm:mt-3 sm:text-5xl lg:text-6xl">
            {isComplete ? "THE 2026 WORLD CUP VAULT" : "World Cup 2026 Final Weekend"}
          </h1>
          {isComplete ? (
            <>
              <p className="mt-2 text-base font-semibold text-accent sm:text-lg">
                Every result. Every scorer. Every defining moment.
              </p>
              {archiveState.finalResult ? (
                <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
                  <span className="font-bold text-ink">{archiveState.champion}</span> won the Final {archiveState.finalResult.homeScore}–{archiveState.finalResult.awayScore} over {archiveState.runnerUp}. Explore the complete 2026 FIFA World Cup archive — all 104 results, final standings, the full bracket, statistics and match reports.
                </p>
              ) : (
                <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
                  Explore the complete 2026 FIFA World Cup archive — all 104 results, final standings, the full bracket, statistics and match reports.
                </p>
              )}
            </>
          ) : null}
          {!isComplete ? (
            <div className="mt-3 flex flex-wrap gap-2 sm:mt-5 sm:gap-3">
              <Link href="/matches/match-104" className="rounded-lg bg-accent px-3 py-2.5 font-heading text-[10px] font-bold uppercase tracking-widest text-navy transition hover:bg-white sm:px-4 sm:text-xs">
                View the Final
              </Link>
              <Link href="/schedule" className="rounded-lg border border-lineStrong bg-surface px-3 py-2.5 font-heading text-[10px] font-bold uppercase tracking-widest text-ink transition hover:border-lineStrong sm:px-4 sm:text-xs">
                Kickoff times
              </Link>
              <Link href="/bracket" className="hidden rounded-lg border border-line px-4 py-3 font-heading text-xs font-bold uppercase tracking-widest text-muted transition hover:text-ink sm:block">
                Complete bracket
              </Link>
            </div>
          ) : null}
        </header>
        <MatchCenterContent
          liveSnapshot={toMatchCenterLiveSnapshot(snapshot, resolvedParticipants)}
          mode="homepage"
          tournamentPhase={tournamentPhase}
          countdownTarget={countdownTarget}
          isTournamentComplete={archiveState.isComplete}
        />
      </div>
    </section>
  );
}
