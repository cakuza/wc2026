import type { Metadata } from "next";
import Link from "next/link";

const BASE_URL = "https://www.worldcupmatchday.com";

export const metadata: Metadata = {
  title: "World Cup 2026 Format Explained — 48 Teams, Groups, Knockout Stage",
  description:
    "The complete guide to the 2026 FIFA World Cup format: 48 teams, 12 groups, how third-place qualification works, the knockout bracket, and how the expanded format differs from previous tournaments.",
  alternates: { canonical: `${BASE_URL}/world-cup-2026-format-explained` },
  openGraph: {
    title: "World Cup 2026 Format Explained — 48 Teams, Groups, Knockout Stage",
    description:
      "48 teams. 12 groups. 104 matches. Here is how the 2026 FIFA World Cup format works from group stage to final.",
    url: `${BASE_URL}/world-cup-2026-format-explained`,
    type: "website",
  },
};

const FAQS = [
  {
    q: "How many teams are in the 2026 World Cup?",
    a: "48 teams compete at the 2026 FIFA World Cup — up from 32 at every World Cup from 1998 to 2022. The expansion added 16 more nations and was approved by FIFA Congress in 2017.",
  },
  {
    q: "How do teams advance from the group stage?",
    a: "The top two teams from each of the 12 groups qualify automatically for the Round of 32. The eight best third-placed teams across all groups also advance, bringing the total to 32.",
  },
  {
    q: "What happens if teams are level on points in the group stage?",
    a: "Tied teams are first separated by head-to-head results between them, then by overall goal difference, then goals scored. If still tied, FIFA uses disciplinary records and, as a last resort, a drawing of lots. See our full tiebreaker guide for exact criteria.",
  },
  {
    q: "How many matches are in the 2026 World Cup?",
    a: "104 matches in total — 72 group-stage matches and 32 knockout matches. This is up from 64 matches at the 2022 World Cup.",
  },
  {
    q: "When does the 2026 World Cup start and end?",
    a: "The tournament runs from 11 June 2026 (opening match: Mexico vs South Africa at Estadio Azteca) to 19 July 2026 (final at MetLife Stadium, New Jersey).",
  },
  {
    q: "How many host nations does the 2026 World Cup have?",
    a: "Three — the United States, Canada, and Mexico. It is the first World Cup to be hosted by three nations. The US hosts 11 of the 16 stadiums.",
  },
  {
    q: "Do host nations qualify automatically?",
    a: "Yes. All three host nations — the United States, Canada, and Mexico — qualified automatically for the tournament as co-hosts.",
  },
  {
    q: "What is the Round of 32?",
    a: "The Round of 32 is the first knockout round, introduced for the first time at this tournament. 32 teams play 16 single-leg matches. Winners advance to the Round of 16.",
  },
];

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const webPageLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "World Cup 2026 Format Explained",
  description:
    "The complete guide to the 2026 FIFA World Cup format, covering the 48-team group stage, third-place qualification, and the knockout bracket.",
  url: `${BASE_URL}/world-cup-2026-format-explained`,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 font-heading text-xl font-extrabold uppercase tracking-wide text-white">
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-white/70">{children}</div>
    </section>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-navyCard px-4 py-3">
      <div className="font-heading text-lg font-extrabold text-white">{value}</div>
      <div className="font-heading text-[10px] font-bold uppercase tracking-widest text-white/40">{label}</div>
    </div>
  );
}

export default function FormatExplainedPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }} />

      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="mb-2 font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">
          FIFA World Cup 2026
        </p>
        <h1 className="mb-3 font-heading text-4xl font-extrabold uppercase tracking-wide text-white">
          World Cup 2026 Format Explained
        </h1>
        <p className="mb-8 max-w-2xl text-sm text-white/55">
          The 2026 FIFA World Cup is the largest in history. 48 teams, 12 groups, 104 matches — and a
          brand-new Round of 32 that is making its World Cup debut. Here is exactly how it works.
        </p>

        {/* Quick facts */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <InfoCard label="Teams" value="48" />
          <InfoCard label="Groups" value="12" />
          <InfoCard label="Total matches" value="104" />
          <InfoCard label="Host nations" value="3" />
        </div>

        <Section title="The Group Stage">
          <p>
            The 48 qualified teams are divided into 12 groups of four teams each, labelled Group A
            through Group L. Every team plays the other three teams in its group once, giving each
            nation three group-stage matches.
          </p>
          <p>
            Points are awarded on the standard system: three points for a win, one point for a draw,
            zero points for a loss. Teams are ranked within their group by points, then by tiebreaker
            criteria if needed.
          </p>
          <p>
            72 matches make up the group stage — each of the 12 groups producing six matches between
            its four teams. Groups run from 11 June to 2 July 2026.
          </p>
        </Section>

        <Section title="How Teams Qualify from the Group Stage">
          <p>
            The top two teams from each of the 12 groups — a total of 24 teams — advance automatically
            to the Round of 32 based on their final group standings.
          </p>
          <p>
            Additionally, the eight best third-placed teams from across all 12 groups also advance. This
            means a team can finish third in its group and still reach the knockout stage if it ranks
            among the eight best third-placed nations overall. Third-place ranking uses the same criteria
            as group standings: points, then goal difference, then goals scored.
          </p>
          <p>
            The bottom four third-placed teams and all fourth-placed teams — 16 nations in total — are
            eliminated at the group stage. Every team is therefore guaranteed at least three matches.
          </p>
        </Section>

        <Section title="The Knockout Stage">
          <p>
            The knockout stage begins with the Round of 32: 32 teams in 16 single-leg matches. Losers
            go home; winners advance. Unlike the group stage, no draws are possible — extra time and
            penalty shootouts are used to decide ties.
          </p>
          <p>
            The bracket then follows a straight-elimination path: Round of 32 (16 matches) → Round of 16
            (8 matches) → Quarter-finals (4 matches) → Semi-finals (2 matches) → Final (1 match).
          </p>
          <p>
            There is also a Third-Place match between the two losing semi-finalists. The Final takes
            place on 19 July 2026 at MetLife Stadium in East Rutherford, New Jersey — the largest
            stadium in the US.
          </p>
          <p>
            The Round of 32 begins on 2 July 2026, the day after all group matches are complete.
            Bracket matchups are determined by group finishing positions and confirmed once the group
            stage ends.
          </p>
        </Section>

        <Section title="How the 2026 Format Differs from 2022">
          <p>
            The 2022 World Cup in Qatar had 32 teams in 8 groups of 4, producing 64 matches. The 2026
            expansion adds 16 more nations, 4 more groups, 40 more matches, and an entirely new
            knockout round (the Round of 32, which replaces the old Round of 16 as the first knockout
            stage).
          </p>
          <p>
            The group-stage structure is the same — four teams per group, top two advance — but the
            expanded third-place qualification rule (8 best of 12, rather than best 4 of 6 as in earlier
            24-team tournaments) is a meaningful difference. A third-place finish now carries real value,
            and a team&apos;s final group-stage match can affect not just whether they advance but how
            favourably they are seeded in the third-place bracket.
          </p>
        </Section>

        <Section title="Host Nations and Stadiums">
          <p>
            The United States, Canada, and Mexico jointly host the tournament — the first time three
            nations have shared a World Cup. The US hosts the most matches with 11 of the 16 stadiums,
            including the Final at MetLife Stadium. Canada hosts BMO Field in Toronto and BC Place in
            Vancouver. Mexico hosts Estadio Azteca (opening match), Estadio Akron and Estadio BBVA.
          </p>
          <p>
            All three host nations qualified automatically and are seeded into separate groups, ensuring
            they do not face each other before the knockout stage.
          </p>
        </Section>

        {/* Internal links */}
        <div className="mt-8 flex flex-wrap gap-3">
          {[
            { href: "/world-cup-2026-group-tiebreakers", label: "Group Tiebreakers" },
            { href: "/world-cup-2026-knockout-bracket-explained", label: "Knockout Bracket" },
            { href: "/world-cup-third-place-qualification", label: "Third-Place Table" },
            { href: "/groups", label: "Groups" },
            { href: "/bracket", label: "Bracket" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg border border-white/15 bg-navyCard px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-white/70 transition hover:border-white/30 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* FAQ */}
        <section className="mt-10">
          <h2 className="mb-3 font-heading text-2xl font-extrabold uppercase tracking-wide text-white">FAQ</h2>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <div key={f.q} className="rounded-xl border border-white/10 bg-navyCard p-4">
                <h3 className="font-heading text-sm font-extrabold uppercase tracking-wide text-white sm:text-base">
                  {f.q}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-6 text-xs leading-relaxed text-white/40">
          WorldCupMatchDay is an independent, fan-made resource and is not affiliated with FIFA. Format
          details are based on publicly available FIFA regulations. Always verify specific rules with
          official FIFA sources.
        </p>
      </div>
    </>
  );
}
