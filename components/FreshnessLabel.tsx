"use client";

import { useEffect, useState } from "react";
import { formatRelativeAge, getFreshnessState } from "@/lib/freshness";

/**
 * "Last synced 34 seconds ago" — ticks client-side so the age stays accurate
 * without a full page refresh. Renders the static relative age on the server
 * (no live ticking) to avoid hydration mismatches, then updates every few
 * seconds after mount.
 */
export function FreshnessLabel({ generatedAt, className }: { generatedAt: string; className?: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(interval);
  }, []);

  const effectiveNow = now ?? new Date(generatedAt).getTime();
  const state = getFreshnessState(generatedAt, effectiveNow);
  const age = formatRelativeAge(generatedAt, effectiveNow);

  const stateClass =
    state === "stale"
      ? "text-amber-400"
      : state === "updating"
        ? "text-white/60"
        : "text-white/40";

  const label =
    state === "stale"
      ? `Live data may be delayed — last synced ${age}`
      : state === "updating"
        ? "Updating live data…"
        : `Last synced ${age}`;

  return (
    <span className={className ?? `text-[11px] ${stateClass}`} suppressHydrationWarning>
      {label}
    </span>
  );
}
