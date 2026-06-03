import { cn } from "@/lib/utils";

type AffiliateBlockProps = {
  type: "vpn" | "streaming" | "merch";
  className?: string;
};

const copy = {
  vpn: {
    title: "VPN recommendation placeholder",
    body: "Future slot for legal, region-aware viewing privacy recommendations."
  },
  streaming: {
    title: "Streaming guide placeholder",
    body: "Future slot for licensed broadcaster and streaming availability guides."
  },
  merch: {
    title: "Football merchandise placeholder",
    body: "Future slot for shirts, scarves, and tournament gear offers."
  }
};

export function AffiliateBlock({ type, className }: AffiliateBlockProps) {
  if (process.env.NEXT_PUBLIC_SHOW_AFFILIATE_PLACEHOLDERS !== "true") {
    return null;
  }

  const item = copy[type];

  return (
    <aside className={cn("rounded-lg border border-dashed border-gold/35 bg-white/[0.035] p-4", className)}>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-gold">Affiliate placeholder</p>
      <h2 className="mt-2 text-lg font-black text-white">{item.title}</h2>
      <p className="mt-2 text-sm leading-6 text-white/60">{item.body}</p>
      {/* Add affiliate links here later with disclosure, compliance review, and nofollow/sponsored attributes. */}
    </aside>
  );
}
