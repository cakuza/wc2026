interface SourcesAndMethodologyProps {
  children: React.ReactNode;
}

export function SourcesAndMethodology({ children }: SourcesAndMethodologyProps) {
  return (
    <section className="mt-8 rounded-xl border border-white/10 bg-navyCard px-4 py-4">
      <h2 className="mb-2 font-heading text-xs font-extrabold uppercase tracking-[0.25em] text-white/40">
        Sources & Methodology
      </h2>
      <div className="space-y-1 text-xs leading-relaxed text-white/50">{children}</div>
    </section>
  );
}
