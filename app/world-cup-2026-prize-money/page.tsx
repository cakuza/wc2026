import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbNav, breadcrumbLd } from "@/components/BreadcrumbNav";
import { articleSchema } from "@/lib/schema";

const BASE_URL = "https://www.worldcupmatchday.com";
const PAGE_URL = `${BASE_URL}/world-cup-2026-prize-money`;
// Dates from real git history (git log --follow -- app/world-cup-2026-prize-money/page.tsx), not invented.
const ARTICLE_DATE_PUBLISHED = "2026-06-07T23:22:30+03:00";
const ARTICLE_DATE_MODIFIED = "2026-06-09T21:33:02+03:00";

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "World Cup 2026", href: "/world-cup-2026" },
  { label: "Prize Money" },
];

export const metadata: Metadata = {
  title: "World Cup 2026 Prize Money Breakdown",
  description:
    "World Cup 2026 prize money: USD 655 million shared among 48 teams, USD 50 million for the champions, plus the payout by finishing position and guaranteed minimums.",
  alternates: { canonical: `${BASE_URL}/world-cup-2026-prize-money` },
  openGraph: {
    title: "World Cup 2026 Prize Money Breakdown",
    description:
      "How the 2026 World Cup prize money is shared: champions, runners-up and payouts by finishing position.",
    url: `${BASE_URL}/world-cup-2026-prize-money`,
    type: "website",
  },
};

// Figures as published by FIFA (USD).
const POSITION_PRIZES: { place: string; amount: string }[] = [
  { place: "Champions", amount: "$50 million" },
  { place: "Runners-up", amount: "$33 million" },
  { place: "Third place", amount: "$29 million" },
  { place: "Fourth place", amount: "$27 million" },
  { place: "5th–8th (quarter-finalists)", amount: "$19 million each" },
  { place: "9th–16th (Round of 16)", amount: "$15 million each" },
  { place: "17th–32nd (Round of 32)", amount: "$11 million each" },
  { place: "33rd–48th (group stage)", amount: "$9 million each" },
];

const OTHER_PAYMENTS: { item: string; amount: string }[] = [
  { item: "Total financial contribution", amount: "$727 million" },
  { item: "Prize money shared among 48 teams", amount: "$655 million" },
  { item: "Preparation costs (per qualified team)", amount: "$1.5 million" },
  { item: "Guaranteed minimum (per team)", amount: "$10.5 million" },
];

const FAQS = [
  { q: "How much does the 2026 World Cup winner get?", a: "The champions receive USD 50 million in prize money." },
  { q: "What is the total 2026 World Cup prize money?", a: "FIFA's total financial contribution is USD 727 million, of which USD 655 million is prize money shared among the 48 teams." },
  { q: "How much does each qualified team get?", a: "Every qualified team is guaranteed a minimum of about USD 10.5 million, with at least USD 9 million in prize money plus USD 1.5 million towards preparation costs." },
  { q: "Does the money go directly to players?", a: "Not necessarily. FIFA pays the participating member associations; how much reaches players depends on each association's own arrangements." },
  { q: "Is this an official FIFA site?", a: "No. WorldCupMatchDay is an independent, fan-made resource and is not affiliated with FIFA." },
];

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

const articleLd = articleSchema({
  headline: "World Cup 2026 Prize Money Breakdown",
  description:
    "World Cup 2026 prize money: USD 655 million shared among 48 teams, USD 50 million for the champions, plus the payout by finishing position and guaranteed minimums.",
  url: PAGE_URL,
  datePublished: ARTICLE_DATE_PUBLISHED,
  dateModified: ARTICLE_DATE_MODIFIED,
});

function Table({ caption, rows, head }: { caption: string; head: [string, string]; rows: { a: string; b: string }[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="border-b border-line bg-canvas/50 px-4 py-3">
        <span className="font-heading text-sm font-extrabold uppercase tracking-wide text-ink">{caption}</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left font-heading text-[11px] font-bold uppercase tracking-widest text-faint">
            <th className="px-4 py-2">{head[0]}</th>
            <th className="px-4 py-2 text-right">{head[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.a} className="border-b border-line last:border-0">
              <td className="px-4 py-2.5 text-muted">{r.a}</td>
              <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-ink">{r.b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PrizeMoneyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd(breadcrumbs, BASE_URL)) }} />

      <div className="mx-auto max-w-3xl px-4 py-8">
        <BreadcrumbNav items={breadcrumbs} />
        <p className="mb-2 font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">FIFA World Cup 2026</p>
        <h1 className="mb-2 font-heading text-4xl font-extrabold uppercase tracking-wide text-ink">
          World Cup 2026 Prize Money
        </h1>
        <p className="mb-6 max-w-2xl text-sm text-muted">
          The 2026 World Cup champions earn USD 50 million, with USD 655 million in prize money shared among the 48
          teams. Below is the payout by finishing position and the guaranteed minimums, using figures published by FIFA.
        </p>

        <div className="space-y-5">
          <Table
            caption="Prize money by finishing position"
            head={["Finishing position", "Prize money"]}
            rows={POSITION_PRIZES.map((p) => ({ a: p.place, b: p.amount }))}
          />
          <Table
            caption="Totals & guaranteed payments"
            head={["Item", "Amount (USD)"]}
            rows={OTHER_PAYMENTS.map((p) => ({ a: p.item, b: p.amount }))}
          />
        </div>

        <p className="mt-4 text-xs leading-relaxed text-faint">
          Note: FIFA pays the participating member associations rather than players directly. Amounts are in US dollars
          as published by FIFA and are not adjusted for currency conversion. Prize money figures may be updated as
          information becomes available — always verify amounts before citing them.
        </p>

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          {[
            { href: "/schedule", label: "Schedule" },
            { href: "/groups", label: "Groups" },
            { href: "/bracket", label: "Bracket" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="rounded-lg border border-line bg-surface px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-muted transition hover:border-lineStrong hover:text-ink">
              {l.label}
            </Link>
          ))}
        </div>

        <section className="mt-10">
          <h2 className="mb-3 font-heading text-2xl font-extrabold uppercase tracking-wide text-ink">FAQ</h2>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <div key={f.q} className="rounded-xl border border-line bg-surface p-4">
                <h3 className="font-heading text-sm font-extrabold uppercase tracking-wide text-ink sm:text-base">{f.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
