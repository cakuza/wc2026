import type { Metadata } from "next";

const BASE_URL = "https://www.worldcupmatchday.com";

// Single source of truth — drives both the visible list and the FAQPage JSON-LD.
const FAQS: { q: string; a: string }[] = [
  {
    q: "When does the 2026 World Cup start?",
    a: "June 11, 2026, with the opening match Mexico vs South Africa at Estadio Azteca.",
  },
  {
    q: "How many teams are in the 2026 World Cup?",
    a: "48 teams across 12 groups, expanded from 32 teams.",
  },
  {
    q: "Which countries host the 2026 World Cup?",
    a: "United States, Canada, and Mexico — the first World Cup hosted by three nations.",
  },
  {
    q: "Where is the 2026 World Cup final?",
    a: "MetLife Stadium in East Rutherford, New Jersey, on July 19, 2026.",
  },
  {
    q: "How many matches are in the 2026 World Cup?",
    a: "104 matches total, up from 64 in previous tournaments.",
  },
  {
    q: "What are the 2026 World Cup groups?",
    a: "12 groups (A through L) of 4 teams each. The top 2 from each group plus 8 best third-place teams advance to the Round of 32.",
  },
  {
    q: "Which stadiums host 2026 World Cup matches?",
    a: "16 stadiums across the US, Canada and Mexico including MetLife Stadium, SoFi Stadium, AT&T Stadium, Estadio Azteca, BMO Field and more.",
  },
  {
    q: "How does the 2026 World Cup format work?",
    a: "Group stage (48 teams, 12 groups) → Round of 32 → Round of 16 → Quarter-finals → Semi-finals → Final.",
  },
  {
    q: "When is the 2026 World Cup draw?",
    a: "The group draw already took place. All 48 teams and their groups are confirmed.",
  },
  {
    q: "Who are the favorites to win the 2026 World Cup?",
    a: "France, Brazil, England, Argentina, and Germany are considered among the top contenders.",
  },
];

export const metadata: Metadata = {
  title: "FAQ — FIFA World Cup 2026",
  description:
    "Frequently asked questions about the FIFA World Cup 2026: start date, host nations, the 48-team format, groups, stadiums, the final, and the favorites.",
  alternates: { canonical: `${BASE_URL}/faq` },
  openGraph: {
    title: "FAQ — FIFA World Cup 2026",
    description:
      "Answers to common questions about the 2026 World Cup: dates, hosts, format, groups, stadiums and more.",
    url: `${BASE_URL}/faq`,
    type: "website",
  },
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.a,
    },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <div className="mx-auto max-w-2xl px-4 py-12">
        <p className="mb-2 font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">
          FIFA World Cup 2026
        </p>
        <h1 className="mb-8 font-heading text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">
          Frequently Asked Questions
        </h1>

        <div className="space-y-3">
          {FAQS.map((f) => (
            <div
              key={f.q}
              className="rounded-xl border border-white/10 bg-navyCard p-5 transition hover:border-white/20"
            >
              <h2 className="font-heading text-base font-extrabold uppercase tracking-wide text-white sm:text-lg">
                {f.q}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
