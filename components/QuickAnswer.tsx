interface QuickAnswerProps {
  children: React.ReactNode;
  label?: string;
}

export function QuickAnswer({ children, label = "Quick Answer" }: QuickAnswerProps) {
  return (
    <div className="mb-6 rounded-xl border border-accent/30 bg-accent/5 px-5 py-4">
      <p className="mb-1 font-heading text-[10px] font-extrabold uppercase tracking-[0.3em] text-accent/70">
        {label}
      </p>
      <div className="text-sm leading-relaxed text-white/90">{children}</div>
    </div>
  );
}
