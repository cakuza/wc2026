import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "@/components/page-shell";
import { RelatedLinks } from "@/components/related-links";
import { FaqBlock } from "@/components/seo-blocks";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "World Cup 2026 Format Explained: 48 Teams, 12 Groups, Round of 32",
  description:
    "How the 2026 World Cup works: 48 teams in 12 groups, the new Round of 32, the head-to-head tiebreaker rules (new for 2026), how the best 8 third-placed teams qualify, and the full knockout bracket.",
  alternates: { canonical: absoluteUrl("/world-cup-2026-format") },
  openGraph: {
    title: "World Cup 2026 Format Explained",
    description: "48 teams, 12 groups, Round of 32, tiebreakers and the knockout bracket — explained in plain English.",
    url: absoluteUrl("/world-cup-2026-format"),
    type: "article"
  }
};

const faqs = [
  {
    question: "How many teams are in the 2026 World Cup?",
    answer: "48 teams — up from 32. They are drawn into 12 groups of four (Groups A to L) across the United States, Canada and Mexico."
  },
  {
    question: "How do teams qualify from the group stage in 2026?",
    answer: "The top two teams in each group qualify automatically (24 teams), and the eight best third-placed teams from the 12 groups also advance — making 32 teams for the new Round of 32."
  },
  {
    question: "What is the first tiebreaker at the 2026 World Cup?",
    answer:
      "New for 2026, the first tiebreaker between teams level on points is head-to-head: points in the matches between the tied teams, then head-to-head goal difference, then head-to-head goals. Overall goal difference is only used after that."
  },
  {
    question: "How does the Round of 32 work?",
    answer: "The Round of 32 is a new knockout round. 32 teams play single-elimination ties through the Round of 16, quarter-finals, semi-finals, a third-place play-off and the final."
  },
  {
    question: "When and where is the 2026 World Cup?",
    answer: "The tournament runs from June 11 to July 19, 2026, hosted by the United States, Canada and Mexico, with 104 matches in total."
  }
];

export default function WorldCup2026FormatPage() {
  return (
    <PageShell>
      <PageIntro
        kicker="Tournament guide"
        title="World Cup 2026 format explained."
        copy="The first 48-team World Cup brings a brand-new structure: 12 groups, a Round of 32, and updated tiebreaker rules. Here is exactly how it works."
      />

      <article className="grid max-w-3xl gap-8 text-[#0E0C0A]">
        <section>
          <h2 className="text-2xl font-black">48 teams, 12 groups</h2>
          <div className="mt-3 grid gap-3 text-sm leading-7 text-[#0E0C0A]/75 md:text-base">
            <p>
              The 2026 World Cup is the first to feature <strong>48 teams</strong>, hosted across the United States, Canada and Mexico
              from June 11 to July 19, 2026. The 48 nations are split into <strong>12 groups of four</strong> — Groups A through L.
            </p>
            <p>
              Every team plays the other three sides in its group once, so each nation is guaranteed three group-stage matches. With 12
              groups and the knockout rounds, the tournament totals <strong>104 matches</strong> — far more than the 64 played in the
              old 32-team format.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black">From groups to the Round of 32</h2>
          <div className="mt-3 grid gap-3 text-sm leading-7 text-[#0E0C0A]/75 md:text-base">
            <p>
              <strong>32 teams</strong> reach the knockout stage. That is made up of the <strong>12 group winners</strong>, the{" "}
              <strong>12 runners-up</strong>, and the <strong>eight best third-placed teams</strong> across the 12 groups. The bottom
              team in each group is eliminated.
            </p>
            <p>
              This is the headline structural change for 2026: instead of going straight to a Round of 16, the expanded field creates a
              brand-new <strong>Round of 32</strong> as the first knockout round.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black">Tiebreaker rules (new for 2026)</h2>
          <div className="mt-3 grid gap-3 text-sm leading-7 text-[#0E0C0A]/75 md:text-base">
            <p>
              When two or more teams finish level on points, the 2026 rules apply <strong>head-to-head results first</strong> — a
              change from previous World Cups, which used overall goal difference as the first tiebreaker. The criteria are applied in
              this order:
            </p>
            <ol className="grid list-decimal gap-2 pl-6 font-medium text-[#0E0C0A]/80">
              <li>Points won in the matches between the tied teams (head-to-head)</li>
              <li>Goal difference in the matches between the tied teams</li>
              <li>Goals scored in the matches between the tied teams</li>
              <li>Overall goal difference in all group matches</li>
              <li>Goals scored in all group matches</li>
              <li>Team conduct (fair-play / disciplinary) score</li>
              <li>FIFA World Ranking — which replaces the old drawing of lots</li>
            </ol>
            <p>
              If a subset of teams is still level after the head-to-head steps, those head-to-head criteria are re-applied among the
              remaining tied teams before moving on.{" "}
              <Link href="/world-cup-2026-tiebreakers" className="font-bold text-[#B48A00] underline-offset-2 hover:underline">
                See worked tiebreaker examples →
              </Link>
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black">How the best third-placed teams qualify</h2>
          <div className="mt-3 grid gap-3 text-sm leading-7 text-[#0E0C0A]/75 md:text-base">
            <p>
              All 12 third-placed teams are ranked against each other, and the <strong>best eight advance</strong>. The four
              third-placed teams that miss out are eliminated. The ranking uses, in order: <strong>points</strong>, then{" "}
              <strong>goal difference</strong>, then <strong>goals scored</strong>, then <strong>team conduct score</strong>, and
              finally the <strong>FIFA World Ranking</strong>.
            </p>
            <p>
              Because qualifying as a third-placed team depends on comparing results across different groups, a strong third-place
              finish — and even goals scored in a dead-rubber group game — can be the difference between going home and reaching the
              knockouts.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black">Knockout stage: Round of 32 to the Final</h2>
          <div className="mt-3 grid gap-3 text-sm leading-7 text-[#0E0C0A]/75 md:text-base">
            <p>From the Round of 32 onward, every tie is single-elimination — win and advance, lose and go home. The rounds are:</p>
            <ul className="grid list-disc gap-2 pl-6 font-medium text-[#0E0C0A]/80">
              <li><strong>Round of 32</strong> — 32 teams, 16 ties</li>
              <li><strong>Round of 16</strong> — 16 teams, 8 ties</li>
              <li><strong>Quarter-finals</strong> — 8 teams, 4 ties</li>
              <li><strong>Semi-finals</strong> — 4 teams, 2 ties</li>
              <li><strong>Third-place play-off</strong> — the two losing semi-finalists</li>
              <li><strong>Final</strong> — the champions are crowned on July 19, 2026</li>
            </ul>
            <p>
              In the knockout rounds, a tie level after 90 minutes goes to extra time, and then a penalty shoot-out if still level.
            </p>
          </div>
        </section>

        <FaqBlock items={faqs} />
      </article>

      <div className="mt-8">
        <RelatedLinks
          links={[
            { href: "/world-cup-2026-tiebreakers", label: "Tiebreaker rules & examples" },
            { href: "/groups", label: "All 12 groups" },
            { href: "/matches", label: "Full schedule" },
            { href: "/standings", label: "Group standings" }
          ]}
        />
      </div>
    </PageShell>
  );
}
