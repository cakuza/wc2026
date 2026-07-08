// Honest cold-start notice. Rendered only when the tournament snapshot is the
// fallback (no validated live data yet): the canonical schedule is shown, but
// live results, standings and Top Scorers are NOT yet authoritative. It never
// implies a successful provider sync.

export function LiveDataUnavailableNotice({ show }: { show?: boolean }) {
  return null;
}
