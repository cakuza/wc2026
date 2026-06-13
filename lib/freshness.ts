// Shared freshness thresholds for live-data presentation.
//
// - "normal": data is recent enough to present as current.
// - "updating": data is a little behind — show a soft "updating" indicator.
// - "stale": data is meaningfully behind during a live match — show a visible
//   degraded state rather than implying the score is current.

export type FreshnessState = "normal" | "updating" | "stale";

export const FRESHNESS_UPDATING_AFTER_MS = 90_000;
export const FRESHNESS_STALE_AFTER_MS = 180_000;

export function getFreshnessState(generatedAt: string, now: number = Date.now()): FreshnessState {
  const ageMs = now - new Date(generatedAt).getTime();
  if (ageMs >= FRESHNESS_STALE_AFTER_MS) return "stale";
  if (ageMs >= FRESHNESS_UPDATING_AFTER_MS) return "updating";
  return "normal";
}

/** "34 seconds ago" / "2 minutes ago" — for the "Last synced …" label. */
export function formatRelativeAge(generatedAt: string, now: number = Date.now()): string {
  const ageMs = Math.max(0, now - new Date(generatedAt).getTime());
  const seconds = Math.round(ageMs / 1000);
  if (seconds < 60) return `${seconds} second${seconds === 1 ? "" : "s"} ago`;
  const minutes = Math.round(seconds / 60);
  return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
}

/**
 * Score freshness is about the *primary* (score/status) provider, not the
 * overall snapshot's generatedAt — generatedAt advances even when the
 * primary provider is down and we're serving last-known-good data, which
 * would otherwise hide a real outage behind a healthy-looking "synced now".
 */
export function getScoreFreshnessLabel({
  primaryProviderFetchedAt,
  primaryProviderOk,
  now = Date.now(),
}: {
  primaryProviderFetchedAt: string | null;
  primaryProviderOk: boolean;
  now?: number;
}): { label: string; state: FreshnessState } {
  if (!primaryProviderFetchedAt) {
    return { label: "Scores syncing…", state: "updating" };
  }

  const age = formatRelativeAge(primaryProviderFetchedAt, now);

  if (!primaryProviderOk) {
    return { label: `Live scores may be delayed · Last successful sync ${age}`, state: "stale" };
  }

  return { label: `Scores synced ${age}`, state: getFreshnessState(primaryProviderFetchedAt, now) };
}
