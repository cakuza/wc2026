"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/LanguageProvider";
import { KICKOFF_TARGET, TOURNAMENT_END_TARGET } from "@/lib/matches";

export type CountdownPhase = "before" | "during" | "after";
type Parts = { days: number; hours: number; minutes: number; seconds: number };
type CountdownState = { phase: CountdownPhase; parts: Parts };

function diff(target: number): Parts {
  const ms = Math.max(0, target - Date.now());
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms / 3600000) % 24),
    minutes: Math.floor((ms / 60000) % 60),
    seconds: Math.floor((ms / 1000) % 60)
  };
}

const KICKOFF = new Date(KICKOFF_TARGET).getTime();
const TOURNAMENT_END = new Date(TOURNAMENT_END_TARGET).getTime();

function computeState(): CountdownState {
  const now = Date.now();
  if (now < KICKOFF) return { phase: "before", parts: diff(KICKOFF) };
  if (now < TOURNAMENT_END) return { phase: "during", parts: diff(TOURNAMENT_END) };
  return { phase: "after", parts: diff(TOURNAMENT_END) };
}

/**
 * Phase-based countdown:
 *  - "before"  → counting down to the opening kickoff
 *  - "during"  → tournament is live, counting down to the final matchday
 *  - "after"   → tournament has concluded
 *
 * Computed from Date.now() on both server and client, so the initial render already
 * reflects the correct phase (no placeholder/zero state).
 */
export function useCountdown(): CountdownState {
  const [state, setState] = useState<CountdownState>(computeState);
  useEffect(() => {
    const id = setInterval(() => setState(computeState()), 1000);
    return () => clearInterval(id);
  }, []);
  return state;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function CountdownTimer() {
  const { t } = useLang();
  const { parts } = useCountdown();
  const cells: { value: string; label: string }[] = [
    { value: pad(parts.days), label: t("cd_days") },
    { value: pad(parts.hours), label: t("cd_hrs") },
    { value: pad(parts.minutes), label: t("cd_min") },
    { value: pad(parts.seconds), label: t("cd_sec") }
  ];

  return (
    /* suppressHydrationWarning: numbers tick immediately after hydration */
    <div className="flex gap-2 sm:gap-3" suppressHydrationWarning>
      {cells.map((c, i) => (
        <div key={i} className="min-w-[64px] rounded-lg border border-white/10 bg-navyCard px-3 py-2 text-center sm:min-w-[80px]">
          <div className="font-heading text-3xl font-extrabold tabular-nums text-white sm:text-4xl">{c.value}</div>
          <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/50 sm:text-xs">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
