"use client";

import { useEffect, useState } from "react";

const ET_LABEL = "Eastern Time (ET)";

/** "America/New_York" -> "America/New York" */
function formatZone(tz: string): string {
  return tz.replace(/_/g, " ");
}

/**
 * "Times shown in <timezone>" label.
 *
 * SSR + first paint: "Eastern Time (ET)" — the default timezone match times are anchored
 * to, identical on server and client (no hydration mismatch).
 *
 * After hydration: replaced with the viewer's own detected timezone via
 * Intl.DateTimeFormat().resolvedOptions().timeZone, so the label always matches what
 * MatchTime actually displays for that viewer.
 */
export function TimezoneLabel({ className }: { className?: string }) {
  const [zone, setZone] = useState(ET_LABEL);

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) setZone(formatZone(tz));
    } catch {
      // keep ET fallback
    }
  }, []);

  return (
    <p className={className ?? "text-[11px] text-white/55"}>
      Times shown in {zone}
    </p>
  );
}
