import Link from "next/link";

const placeholdersEnabled = process.env.NEXT_PUBLIC_SHOW_MONETIZATION_PLACEHOLDERS === "true";

export function MonetizationSlot({
  label = "Partner slot",
  copy = "Reserved for a sponsor or rights-safe style concept after traffic proves demand."
}: {
  label?: string;
  copy?: string;
}) {
  if (!placeholdersEnabled) return null;
  return (
    <aside className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B48A00]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[#0E0C0A]/55">{copy}</p>
      <p className="mt-3 text-[10px] font-black uppercase tracking-[0.12em] text-[#0E0C0A]/35">Post-launch placeholder / not active in MVP</p>
    </aside>
  );
}

export function PremiumTemplatesTeaser() {
  if (!placeholdersEnabled) return null;
  return (
    <aside className="rounded-lg border border-[#E7C36B]/30 bg-[#E7C36B]/10 p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B48A00]">Extra styles later</p>
      <h2 className="mt-1 text-xl font-black text-[#0E0C0A]">Additional poster packs are parked for post-launch.</h2>
      <p className="mt-2 text-sm leading-6 text-[#0E0C0A]/60">The MVP keeps the free card studio generous and focused on export/share behavior.</p>
      <Link href="/cards" className="mt-4 inline-flex rounded-md border border-[rgba(14,12,10,.12)] px-3 py-2 text-sm font-bold text-[#0E0C0A] hover:text-[#B48A00]">
        Open free studio
      </Link>
    </aside>
  );
}

export function AffiliateBlock() {
  if (!placeholdersEnabled) return null;
  return (
    <aside className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B48A00]">Affiliate block later</p>
      <h2 className="mt-1 text-xl font-black text-[#0E0C0A]">Tickets, travel, shirts, VPN, or streaming guides can sit here.</h2>
      <p className="mt-2 text-sm leading-6 text-[#0E0C0A]/55">Disabled until legal review, disclosure copy, and country-specific offers are ready.</p>
    </aside>
  );
}
