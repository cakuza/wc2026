// Instant navigation feedback for /today and every /today?date=… change.
//
// Without this boundary the App Router blocks the URL commit on the full
// dynamic render of /today (which builds the live tournament snapshot), so a
// Previous/Next-day tap appeared dead for several seconds on mobile. With a
// loading boundary the router commits the URL immediately and shows this
// skeleton, and adjacent dates can be prefetched up to here — so the buttons
// give immediate visible feedback while the dated content streams in.

function MatchRowSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-white/10 bg-navyCard px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center justify-end gap-2">
          <div className="h-4 w-24 rounded bg-white/10" />
          <div className="h-[22px] w-[30px] rounded-sm bg-white/10" />
        </div>
        <div className="h-6 w-9 shrink-0 rounded bg-white/10" />
        <div className="flex flex-1 items-center gap-2">
          <div className="h-[22px] w-[30px] rounded-sm bg-white/10" />
          <div className="h-4 w-24 rounded bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export default function TodayLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading matchday…</span>

      <div className="animate-pulse">
        {/* Title */}
        <div className="mb-3 h-9 w-72 max-w-full rounded bg-white/10" />
        <div className="mb-2 h-3 w-full max-w-3xl rounded bg-white/5" />
        <div className="mb-6 h-3 w-2/3 max-w-2xl rounded bg-white/5" />

        {/* Timezone + freshness row */}
        <div className="mb-6 flex items-center justify-between gap-2">
          <div className="h-4 w-44 rounded bg-white/5" />
          <div className="h-3 w-28 rounded bg-white/5" />
        </div>

        {/* Date navigator — mirrors MatchdayDateNav layout so the swap is calm */}
        <section aria-label="Matchday date navigation" className="mb-6">
          <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-navyCard px-3 py-3">
            <div className="h-11 w-11 rounded-lg bg-white/10 sm:w-28" />
            <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <div className="h-5 w-40 max-w-full rounded bg-white/10" />
              <div className="h-3 w-12 rounded bg-white/5" />
            </div>
            <div className="h-11 w-11 rounded-lg bg-white/10 sm:w-28" />
          </div>
        </section>

        {/* Matchday heading + rows */}
        <div className="mb-3 h-6 w-56 max-w-full rounded bg-white/10" />
        <div className="space-y-2">
          <MatchRowSkeleton />
          <MatchRowSkeleton />
          <MatchRowSkeleton />
        </div>
      </div>
    </div>
  );
}
