"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/LanguageProvider";

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

function computeState(target: number | null): CountdownState {
  if (target === null || !Number.isFinite(target)) return { phase: "after", parts: diff(Date.now()) };
  return Date.now() < target ? { phase: "during", parts: diff(target) } : { phase: "after", parts: diff(target) };
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
export function useCountdown(targetIso: string | null): CountdownState {
  const target = targetIso ? Date.parse(targetIso) : null;
  const [state, setState] = useState<CountdownState>(() => computeState(target));
  useEffect(() => {
    setState(computeState(target));
    const id = setInterval(() => setState(computeState(target)), 1000);
    return () => clearInterval(id);
  }, [target]);
  return state;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function CountdownTimer({ target }: { target: string | null }) {
  const { t } = useLang();
  const { parts } = useCountdown(target);
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
