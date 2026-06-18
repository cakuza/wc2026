"use client";

import { useEffect, useState } from "react";
import { getScoreFreshnessLabel } from "@/lib/freshness";

/**
 * "Last checked 34 seconds ago" — driven by the *primary* (score/status)
 * provider's last successful fetch, not the snapshot's generatedAt (which
 * advances even while serving last-known-good data during a primary
 * provider outage). Ticks client-side so the age stays accurate without a
 * full page refresh. Renders the static relative age on the server (no live
 * ticking) to avoid hydration mismatches, then updates every few seconds
 * after mount.
 */
export function FreshnessLabel({
  primaryProviderFetchedAt,
  primaryProviderOk,
  className,
}: {
  primaryProviderFetchedAt: string | null;
  primaryProviderOk: boolean;
  className?: string;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(interval);
  }, []);

  const effectiveNow = now ?? (primaryProviderFetchedAt ? new Date(primaryProviderFetchedAt).getTime() : Date.now());
  const { label, state } = getScoreFreshnessLabel({ primaryProviderFetchedAt, primaryProviderOk, now: effectiveNow });

  const stateClass =
    state === "stale"
      ? "text-amber-400"
      : state === "updating"
        ? "text-white/60"
        : "text-white/40";

  return (
    <span className={className ?? `text-[11px] ${stateClass}`} suppressHydrationWarning>
      {label}
    </span>
  );
}
