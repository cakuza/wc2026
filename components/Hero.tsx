"use client";

import { Flag } from "@/components/Flag";
import { CountdownClient } from "@/components/CountdownClient";
import { MatchCenterContent, type MatchCenterLiveSnapshot } from "@/components/MatchCenterContent";
import { useLang } from "@/components/LanguageProvider";
import { type DisplayMatchday } from "@/lib/matches";
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
  initialMatchday,
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
  const { t } = useLang();
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-navy">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(60% 70% at 20% 0%, rgba(232,0,28,0.22), transparent 60%), radial-gradient(50% 60% at 90% 100%, rgba(232,0,28,0.14), transparent 60%)",
        }}
      />
      <div className="relative mx-auto flex flex-col lg:flex-row max-w-7xl gap-0 px-4 py-0 lg:items-start lg:gap-12 lg:py-20 lg:px-8">
        {/* Left Column: Hero Text & Countdown */}
        <div className="contents lg:flex lg:flex-col lg:w-[55%] lg:min-w-0 pt-0">
          <div className="order-1 lg:order-none min-w-0">
            <p className="font-heading text-xs font-bold uppercase tracking-[0.3em] text-accent">
              FIFA World Cup 2026
            </p>

            {/*
             * STATIC — always in SSR HTML, indexed by Google.
             * CountdownClient (below) renders the live countdown on top of this
             * once JS is loaded.           * no-JS fallback and permanent SEO anchor.
             */}
            <h1 className="mt-0 font-heading text-[2rem] font-extrabold uppercase leading-[0.9] tracking-tight text-white sm:mt-3 sm:text-[48px] lg:text-[64px] break-words">
              {archiveState.isComplete ? "2026 World Cup Archive" : t("hero_kickoff_heading")}
            </h1>
            {archiveState.isComplete && archiveState.finalResult && (
              <p className="mt-2 max-w-xl text-sm text-white/70 sm:text-base">
                <span className="font-bold text-white">{archiveState.champion}</span> won the Final{" "}
                {archiveState.finalResult.homeScore}–{archiveState.finalResult.awayScore} over {archiveState.runnerUp}.
                {archiveState.thirdPlace ? ` ${archiveState.thirdPlace} finished third.` : ""}
              </p>
            )}
          </div>

          <div className="order-3 lg:order-none min-w-0 mt-0 lg:mt-6">
            {/*
             * CLIENT ISLAND — returns null on the server (parts === null).
             * Renders the live "5 DAYS / HH MM SS" countdown post-hydration.
             * Visually extends the section; the static h1 above acts as a
             * no-JS fallback and permanent SEO anchor.
             *
             * The wrapper reserves the island's height so the post-hydration
             * content fills reserved space instead of pushing the host-nations
             * block down (eliminating this client island as a layout-shift source).
             */}
            <div className="min-h-[60px] sm:min-h-[200px]">
              <CountdownClient tournamentPhase={tournamentPhase} target={countdownTarget} isComplete={archiveState.isComplete} />
            </div>

            {/* Host nations */}
            <div className="mt-0 sm:mt-6 hidden sm:block">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                {[
                  { code: "us", name: "USA" },
                  { code: "ca", name: "Canada" },
                  { code: "mx", name: "Mexico" },
                ].map((h) => (
                  <div key={h.code} className="flex items-center gap-2">
                    <Flag
                      code={h.code}
                      alt=""
                      width={28}
                      height={20}
                      className="rounded-sm shadow-sm shrink-0"
                    />
                    <span className="text-sm font-medium text-white">{h.name}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 font-heading text-xs font-bold uppercase tracking-widest text-white/50">
                {t("hero_subline")}
              </p>
              <p className="mt-2 max-w-xl text-sm text-white/70 hidden sm:block">{t("home_intro")}</p>
            </div>
          </div>
        </div>

        {/* Right: dynamic today's / next matches (client component) */}
        <div className="order-2 lg:order-none min-w-0 w-full lg:flex-1 lg:w-auto">
          <MatchCenterContent liveSnapshot={toMatchCenterLiveSnapshot(snapshot, resolvedParticipants)} mode="homepage" tournamentPhase={tournamentPhase} />
        </div>
      </div>
    </section>
  );
}
