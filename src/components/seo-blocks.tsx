import Link from "next/link";
import type { DataMeta } from "@/lib/types";

export type FaqItem = {
  question: string;
  answer: string;
};

export type InternalLinkItem = {
  href: string;
  label: string;
  description?: string;
};

export function SeoIntroBlock({
  kicker,
  title,
  paragraphs
}: {
  kicker: string;
  title: string;
  paragraphs: readonly string[];
}) {
  return (
    <section className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-5 md:p-6">
      <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">{kicker}</p>
      <h2 className="text-2xl font-black leading-tight text-[#0E0C0A] md:text-3xl">{title}</h2>
      <div className="mt-4 grid gap-3 text-sm leading-7 text-[#0E0C0A]/68 md:text-base">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}

export function FaqBlock({ items }: { items: FaqItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  return (
    <section className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-5 md:p-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h2 className="text-2xl font-black text-[#0E0C0A]">FAQ</h2>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <details key={item.question} className="rounded-md border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] p-4">
            <summary className="cursor-pointer font-bold text-[#0E0C0A]">{item.question}</summary>
            <p className="mt-3 text-sm leading-6 text-[#0E0C0A]/65">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function InternalLinksBlock({ links }: { links: InternalLinkItem[] }) {
  return (
    <section className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-5 md:p-6">
      <h2 className="text-xl font-black text-[#0E0C0A]">More World Cup tools</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-md border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] p-4 transition hover:border-[#E7C36B]/60 hover:bg-white"
          >
            <p className="font-black text-[#B48A00]">{link.label}</p>
            {link.description ? <p className="mt-2 text-sm leading-6 text-[#0E0C0A]/58">{link.description}</p> : null}
          </Link>
        ))}
      </div>
    </section>
  );
}

export function LastUpdatedBlock({ label = "Last updated", meta }: { label?: string; meta?: DataMeta }) {
  const date = meta?.lastUpdatedUtc ? new Date(meta.lastUpdatedUtc) : new Date();

  return (
    <div className="rounded-md border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] p-3 text-sm text-[#0E0C0A]/55">
      <p>
        {label}: {new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date)}
      </p>
      {meta ? (
        <p className="mt-1 text-[#0E0C0A]/45">
          {meta.dataSource} / {meta.updateMode}. {meta.note}
        </p>
      ) : null}
    </div>
  );
}
