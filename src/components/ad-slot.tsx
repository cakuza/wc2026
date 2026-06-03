import { cn } from "@/lib/utils";

type AdSlotProps = {
  placement: "header" | "in-content" | "sidebar" | "mobile-sticky";
  className?: string;
};

export function AdSlot({ placement, className }: AdSlotProps) {
  if (process.env.NEXT_PUBLIC_SHOW_AD_PLACEHOLDERS !== "true") {
    return null;
  }

  const labels = {
    header: "Header ad placeholder",
    "in-content": "In-content ad placeholder",
    sidebar: "Sidebar ad placeholder",
    "mobile-sticky": "Mobile sticky ad placeholder"
  };

  return (
    <aside
      className={cn(
        "rounded-md border border-dashed border-gold/35 bg-gold/8 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.16em] text-gold",
        placement === "mobile-sticky" && "fixed bottom-3 left-3 right-3 z-50 md:hidden",
        className
      )}
      aria-label={labels[placement]}
    >
      {labels[placement]}
      {/* Add AdSense, Ezoic, or affiliate ad markup here after traffic and policy checks. */}
    </aside>
  );
}
