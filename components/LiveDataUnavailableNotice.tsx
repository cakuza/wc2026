// Honest cold-start notice. Rendered only when the tournament snapshot is the
// fallback (no validated live data yet): the canonical schedule is shown, but
// live results, standings and Top Scorers are NOT yet authoritative. It never
// implies a successful provider sync.

export function LiveDataUnavailableNotice({ show }: { show?: boolean }) {
  if (!show) return null;
  return (
    <div
      role="status"
      className="mb-6 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200"
    >
      <span className="font-semibold">Static archive mode: results are updated manually after verification.</span>
    </div>
  );
}
