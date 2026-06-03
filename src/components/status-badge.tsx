import { cn } from "@/lib/utils";

const variants = {
  sample: "border-gold/35 bg-gold/10 text-gold",
  local: "border-ice-blue/35 bg-ice-blue/10 text-ice-blue",
  shareable: "border-grass/35 bg-grass/10 text-grass",
  prelaunch: "border-white/18 bg-white/[0.06] text-white/70"
};

export function StatusBadge({ label, variant = "prelaunch" }: { label: string; variant?: keyof typeof variants }) {
  return (
    <span className={cn("inline-flex w-max items-center rounded-md border px-2 py-1 text-[11px] font-black uppercase tracking-[0.14em]", variants[variant])}>
      {label}
    </span>
  );
}
