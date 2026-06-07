import type { Metadata } from "next";
import Link from "next/link";

const BASE_URL = "https://www.worldcupmatchday.com";

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

function Table({ caption, rows, head }: { caption: string; head: [string, string]; rows: { a: string; b: string }[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-navyCard">
      <div className="border-b border-white/10 bg-navy/50 px-4 py-3">
        <span className="font-heading text-sm font-extrabold uppercase tracking-wide text-white">{caption}</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left font-heading text-[11px] font-bold uppercase tracking-widest text-white/40">
            <th className="px-4 py-2">{head[0]}</th>
            <th className="px-4 py-2 text-right">{head[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.a} className="border-b border-white/5 last:border-0">
              <td className="px-4 py-2.5 text-white/75">{r.a}</td>
              <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-white">{r.b}</td>
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

      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="mb-2 font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">FIFA World Cup 2026</p>
        <h1 className="mb-2 font-heading text-4xl font-extrabold uppercase tracking-wide text-white">
          World Cup 2026 Prize Money
        </h1>
        <p className="mb-6 max-w-2xl text-sm text-white/55">
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

        <p className="mt-4 text-xs leading-relaxed text-white/45">
          Note: FIFA pays the participating member associations rather than players directly. Amounts are in US dollars
          as published by FIFA and are not adjusted for currency conversion.
        </p>

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          {[
            { href: "/teams", label: "Teams" },
            { href: "/bracket", label: "Bracket" },
            { href: "/groups", label: "Groups" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="rounded-lg border border-white/15 bg-navyCard px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-white/70 transition hover:border-white/30 hover:text-white">
              {l.label}
            </Link>
          ))}
        </div>

        <section className="mt-10">
          <h2 className="mb-3 font-heading text-2xl font-extrabold uppercase tracking-wide text-white">FAQ</h2>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <div key={f.q} className="rounded-xl border border-white/10 bg-navyCard p-4">
                <h3 className="font-heading text-sm font-extrabold uppercase tracking-wide text-white sm:text-base">{f.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
