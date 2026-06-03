import Link from "next/link";
import type { InternalLinkItem } from "@/components/seo-blocks";

export function RelatedLinks({ title = "Related World Cup links", links }: { title?: string; links: InternalLinkItem[] }) {
  return (
    <section className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 md:p-5">
      <h2 className="text-lg font-black text-[#0E0C0A]">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-md border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] px-3 py-2 text-sm font-bold text-[#0E0C0A]/78 transition hover:border-[#E7C36B]/60 hover:text-[#B48A00]"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
