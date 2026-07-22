interface SourcesAndMethodologyProps {
  children: React.ReactNode;
}

export function SourcesAndMethodology({ children }: SourcesAndMethodologyProps) {
  return (
    <section className="mt-8 rounded-xl border border-line bg-surface px-4 py-4">
      <h2 className="mb-2 font-heading text-xs font-extrabold uppercase tracking-[0.25em] text-faint">
        Sources & Methodology
      </h2>
      <div className="space-y-1 text-xs leading-relaxed text-faint">{children}</div>
    </section>
  );
}
