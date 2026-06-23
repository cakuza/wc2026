interface DataAvailabilityNoticeProps {
  show: boolean;
  message?: string;
}

export function DataAvailabilityNotice({
  show,
  message = "Live data is temporarily unavailable. The last verified data is shown where available.",
}: DataAvailabilityNoticeProps) {
  if (!show) return null;
  return (
    <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
      <p className="font-heading text-[10px] font-extrabold uppercase tracking-[0.3em] text-amber-400/70">
        Data Availability
      </p>
      <p className="mt-1 text-xs text-white/60">{message}</p>
    </div>
  );
}
