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
        <div className="font-heading font-extrabold uppercase leading-[0.85] text-ink">
          <span className="block text-2xl tracking-wide text-ink sm:text-3xl">
            Tournament complete
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-sm">
          <Link
            href="/bracket"
            className="rounded-lg border border-line bg-surface px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-muted transition hover:border-lineStrong hover:text-ink"
          >
            Results &amp; Bracket
          </Link>
          <Link
            href="/groups"
            className="rounded-lg border border-line bg-surface px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-muted transition hover:border-lineStrong hover:text-ink"
          >
            Final Standings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-1" suppressHydrationWarning>
      <div className="font-heading font-extrabold uppercase leading-[0.85] text-ink">
        <span className="block text-xl tracking-wide text-ink">
          {tournamentPhase === "pre_tournament" ? t("hero_kickoffIn") : "Next match in"}
        </span>
        <span className="block text-2xl leading-none tracking-tight sm:text-7xl">
          {parts.days}{" "}
          <span className="text-accentText">{t("hero_days")}</span>
        </span>
      </div>
      {tournamentPhase !== "pre_tournament" && (
        <p className="mt-1 font-heading text-xs font-bold uppercase tracking-widest text-faint">
          Current phase · {getTournamentPhaseLabel(tournamentPhase)}
        </p>
      )}
      <div className="mt-0 sm:mt-6">
        <CountdownTimer target={target} />
      </div>
    </div>
  );
}
