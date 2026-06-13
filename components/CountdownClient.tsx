"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCountdown, CountdownTimer } from "@/components/Countdown";
import { useLang } from "@/components/LanguageProvider";
import { TOURNAMENT_FINAL_DATE } from "@/lib/matches";

/**
 * Client-only countdown island. Computed from Date.now() on both server and client (see
 * useCountdown), so the correct phase is shown immediately — no placeholder/zero state.
 *
 * Phases:
 *  - before kickoff: "Kickoff in / N DAYS"
 *  - tournament live: "World Cup ends in / N DAYS" + "Final matchday · 19 July 2026"
 *  - after the final: "Tournament complete" + links to results/standings
 */
export function CountdownClient() {
  const { t } = useLang();
  const [mounted, setMounted] = useState(false);
  const { phase, parts } = useCountdown();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (phase === "after") {
    return (
      <div className="mt-1">
        <h1 className="font-heading font-extrabold uppercase leading-[0.85] text-white">
          <span className="block text-2xl tracking-wide text-white/80 sm:text-3xl">
            Tournament complete
          </span>
        </h1>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
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
      <h1 className="font-heading font-extrabold uppercase leading-[0.85] text-white">
        <span className="block text-2xl tracking-wide text-white/80">
          {phase === "before" ? t("hero_kickoffIn") : "World Cup ends in"}
        </span>
        <span className="block text-[52px] leading-none tracking-tight sm:text-7xl">
          {parts.days}{" "}
          <span className="text-accent">{t("hero_days")}</span>
        </span>
      </h1>
      {phase === "during" && (
        <p className="mt-2 font-heading text-xs font-bold uppercase tracking-widest text-white/50">
          Final matchday · {TOURNAMENT_FINAL_DATE}
        </p>
      )}
      <div className="mt-6">
        <CountdownTimer />
      </div>
    </div>
  );
}
