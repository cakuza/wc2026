import type { Metadata } from "next";
import Link from "next/link";

const BASE_URL = "https://www.worldcupmatchday.com";

export const metadata: Metadata = {
  title: "World Cup 2026 Third-Place Qualification Explained",
  description:
    "How the best third-placed teams qualify at the 2026 World Cup: 12 groups, top two automatic, plus the 8 best third-placed teams reaching the 32-team Round of 32.",
  alternates: { canonical: `${BASE_URL}/world-cup-third-place-qualification` },
  openGraph: {
    title: "World Cup 2026 Third-Place Qualification Explained",
    description:
      "How the 8 best third-placed teams qualify for the 2026 World Cup Round of 32.",
    url: `${BASE_URL}/world-cup-third-place-qualification`,
    type: "website",
  },
};

const FAQS = [
  { q: "How many third-placed teams qualify?", a: "The 8 best third-placed teams across the 12 groups advance to the Round of 32." },
  { q: "How many teams reach the Round of 32?", a: "32 teams: the top two from each of the 12 groups (24 teams) plus the 8 best third-placed teams." },
  { q: "Do all third-placed teams qualify?", a: "No. There are 12 third-placed teams but only the 8 best-ranked of them qualify; the other 4 are eliminated." },
  { q: "When will the third-place ranking be known?", a: "Only after the group-stage matches are played. The ranking cannot be determined in advance, so no qualifiers are listed here yet." },
  { q: "Is this an official FIFA site?", a: "No. WorldCupMatchDay is an independent, fan-made resource and is not affiliated with FIFA." },
];

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-navyCard p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/20 font-heading text-sm font-extrabold text-accent">{n}</span>
        <h2 className="font-heading text-base font-extrabold uppercase tracking-wide text-white">{title}</h2>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-white/70">{children}</p>
    </div>
  );
}

export default function ThirdPlaceQualificationPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="mb-2 font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">FIFA World Cup 2026</p>
        <h1 className="mb-2 font-heading text-4xl font-extrabold uppercase tracking-wide text-white">
          How Third-Place Qualification Works
        </h1>
        <p className="mb-6 max-w-2xl text-sm text-white/55">
          The 2026 World Cup has 48 teams in 12 groups. The top two from each group qualify automatically, and the
          8 best third-placed teams join them — making up the 32 teams in the Round of 32.
        </p>

        <div className="space-y-3">
          <Step n="1" title="12 groups of four">
            The 48 teams are split into 12 groups (A–L) of four. Every team plays the other three in its group once.
          </Step>
          <Step n="2" title="Top two qualify automatically">
            The first- and second-placed team in each group advance directly — that is 24 teams.
          </Step>
          <Step n="3" title="8 best third-placed teams">
            Each group also has a third-placed team (12 in total). The 8 best-ranked third-placed teams also advance;
            the remaining 4 are eliminated.
          </Step>
          <Step n="4" title="32 teams reach the Round of 32">
            24 group winners and runners-up plus the 8 best third-placed teams make up the 32-team knockout bracket.
          </Step>
        </div>

        {/* Ranking criteria */}
        <section className="mt-6 rounded-xl border border-white/10 bg-navyCard p-4">
          <h2 className="mb-2 font-heading text-base font-extrabold uppercase tracking-wide text-white">
            How the third-placed teams are ranked
          </h2>
          <p className="text-sm leading-relaxed text-white/70">
            The 12 third-placed teams are compared against each other and the best 8 qualify. Typical ranking factors
            include points, goal difference, goals scored and fair play / official tiebreakers. The exact order can only
            be calculated once all group matches are complete.
          </p>
        </section>

        {/* Not-available notice */}
        <section className="mt-4 rounded-xl border border-accent/20 bg-accent/5 p-4">
          <p className="font-heading text-[11px] font-bold uppercase tracking-widest text-accent/70">Third-place ranking</p>
          <p className="mt-1 text-sm text-white/70">
            Not available until the group matches are played. No third-place qualifiers are shown here in advance.
          </p>
        </section>

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          {[
            { href: "/groups", label: "Groups" },
            { href: "/bracket", label: "Bracket" },
            { href: "/schedule", label: "Schedule" },
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
