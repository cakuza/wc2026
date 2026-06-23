interface LastUpdatedProps {
  isoTimestamp: string | null;
  label?: string;
}

export function LastUpdated({ isoTimestamp, label = "Last updated" }: LastUpdatedProps) {
  if (!isoTimestamp) return null;
  const d = new Date(isoTimestamp);
  const formatted = d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
  return (
    <p className="mt-1 font-heading text-[10px] font-bold uppercase tracking-widest text-white/30">
      {label}: {formatted}
    </p>
  );
}
