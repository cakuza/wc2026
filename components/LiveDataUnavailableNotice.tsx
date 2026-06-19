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
      <span className="font-semibold">Live match data is temporarily unavailable.</span>{" "}
      <span className="text-amber-200/80">
        Fixtures and kickoff times are shown below; scores, standings and Top Scorers will appear
        once live data refreshes.
      </span>
    </div>
  );
}
