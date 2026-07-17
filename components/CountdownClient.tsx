"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCountdown, CountdownTimer } from "@/components/Countdown";
import { useLang } from "@/components/LanguageProvider";
import { getTournamentPhaseLabel, type TournamentPhase } from "@/lib/matchCenterSelection";

/**
 * Client-only countdown island. Computed from Date.now() on both server and client (see
 * useCountdown), so the correct phase is shown immediately — no placeholder/zero state.
 */
export function CountdownClient({ tournamentPhase, target, isComplete }: { tournamentPhase: TournamentPhase; target: string | null; isComplete: boolean }) {
  const { t } = useLang();
  const [mounted, setMounted] = useState(false);
  const { parts } = useCountdown(target);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isComplete) {
    return (
      <div className="mt-1">
        <div className="font-heading font-extrabold uppercase leading-[0.85] text-white">
          <span className="block text-2xl tracking-wide text-white/80 sm:text-3xl">
            Tournament complete
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-sm">
          <Link
            href="/bracket"
            className="rounded-lg border border-white/15 bg-navyCard px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-white/70 transition hover:border-white/30 hover:text-white"
          >
            Results &amp; Bracket
          </Link>
          <Link
            href="/groups"
            className="rounded-lg border border-white/15 bg-navyCard px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-white/70 transition hover:border-white/30 hover:text-white"
          >
            Final Standings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-1" suppressHydrationWarning>
      <div className="font-heading font-extrabold uppercase leading-[0.85] text-white">
        <span className="block text-xl tracking-wide text-white/80">
          {tournamentPhase === "pre_tournament" ? t("hero_kickoffIn") : "Next match in"}
        </span>
        <span className="block text-2xl leading-none tracking-tight sm:text-7xl">
          {parts.days}{" "}
          <span className="text-accent">{t("hero_days")}</span>
        </span>
      </div>
      {tournamentPhase !== "pre_tournament" && (
        <p className="mt-1 font-heading text-xs font-bold uppercase tracking-widest text-white/50">
          Current phase · {getTournamentPhaseLabel(tournamentPhase)}
        </p>
      )}
      <div className="mt-0 sm:mt-6">
        <CountdownTimer target={target} />
      </div>
    </div>
  );
}
