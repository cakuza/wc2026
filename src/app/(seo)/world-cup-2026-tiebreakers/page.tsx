import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "@/components/page-shell";
import { RelatedLinks } from "@/components/related-links";
import { FaqBlock } from "@/components/seo-blocks";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "World Cup 2026 Tiebreaker Rules Explained (with Examples)",
  description:
    "The 2026 World Cup tiebreaker rules in plain English. Head-to-head comes first (new for 2026), then overall goal difference, goals, fair play and the FIFA World Ranking — with worked two-team and three-team examples.",
  alternates: { canonical: absoluteUrl("/world-cup-2026-tiebreakers") },
  openGraph: {
    title: "World Cup 2026 Tiebreaker Rules Explained",
    description: "Head-to-head first, then goal difference, goals and FIFA ranking — with worked examples.",
    url: absoluteUrl("/world-cup-2026-tiebreakers"),
    type: "article"
  }
};

const faqs = [
  {
    question: "What is the first tiebreaker at the 2026 World Cup?",
    answer:
      "Head-to-head points. If teams are level on total points, the first thing checked is points won in the matches between only the tied teams. This is new for 2026 — previous tournaments used overall goal difference first."
  },
  {
    question: "Is head-to-head used before goal difference in 2026?",
    answer:
      "Yes. The order is head-to-head points, head-to-head goal difference, then head-to-head goals. Only if teams are still level does overall goal difference come into play."
  },
  {
    question: "What happens if teams are still tied after every criterion?",
    answer: "The final tiebreaker is the FIFA World Ranking, which replaces the drawing of lots used at previous World Cups."
  },
  {
    question: "How are the best third-placed teams separated?",
    answer:
      "The 12 third-placed teams are ranked by points, then overall goal difference, then goals scored, then team conduct score, then the FIFA World Ranking. The best eight advance."
  }
];

export default function WorldCup2026TiebreakersPage() {
  return (
    <PageShell>
      <PageIntro
        kicker="Rules guide"
        title="World Cup 2026 tiebreakers."
        copy="When teams finish level on points, who goes through? For 2026, head-to-head results come first. Here is the full order, what changed, and worked examples."
      />

      <article className="grid max-w-3xl gap-8 text-[#0E0C0A]">
        <section>
          <h2 className="text-2xl font-black">The tiebreaker order</h2>
          <p className="mt-3 text-sm leading-7 text-[#0E0C0A]/75 md:text-base">
            If two or more teams in a group finish on the same number of points, these criteria are applied in order until the tie is
            broken:
          </p>
          <ol className="mt-4 grid list-decimal gap-2 pl-6 font-medium text-[#0E0C0A]/80">
            <li>Points won in the matches between the tied teams (head-to-head)</li>
            <li>Goal difference in the matches between the tied teams</li>
            <li>Goals scored in the matches between the tied teams</li>
            <li>Overall goal difference in all group matches</li>
            <li>Goals scored in all group matches</li>
            <li>Team conduct (fair-play / disciplinary) score</li>
            <li>FIFA World Ranking</li>
          </ol>
          <p className="mt-3 text-sm leading-7 text-[#0E0C0A]/75 md:text-base">
            If three teams are level and the head-to-head steps separate one of them but leave the other two still tied, the
            head-to-head criteria are re-applied to just those two before moving down the list.
          </p>
        </section>

        <section className="rounded-[22px] border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] p-5 md:p-6">
          <h2 className="text-xl font-black">What changed for 2026</h2>
          <ul className="mt-3 grid gap-2 text-sm leading-7 text-[#0E0C0A]/80">
            <li>
              <strong>Head-to-head now comes first.</strong> At previous World Cups, overall goal difference was the first tiebreaker.
              In 2026, results between the tied teams are decisive before overall records are considered.
            </li>
            <li>
              <strong>The FIFA World Ranking is the final tiebreaker</strong>, replacing the old drawing of lots — so a coin-toss-style
              outcome is no longer possible.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-black">Example 1 — two teams level</h2>
          <div className="mt-3 grid gap-3 text-sm leading-7 text-[#0E0C0A]/75 md:text-base">
            <p>
              Suppose Mexico and South Korea both finish a group on 6 points. Under the 2026 rules you do <em>not</em> jump to overall
              goal difference. Instead you look at their head-to-head match:
            </p>
            <ul className="grid list-disc gap-2 pl-6 font-medium text-[#0E0C0A]/80">
              <li>If Mexico beat South Korea in the group, Mexico finish above them — full stop.</li>
              <li>If that match was a draw, you compare head-to-head goal difference and goals (identical in a single drawn game), then move to overall goal difference.</li>
            </ul>
            <p>So a team can have a worse overall goal difference and still finish higher, as long as it won the meeting between the two.</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black">Example 2 — three teams level</h2>
          <div className="mt-3 grid gap-3 text-sm leading-7 text-[#0E0C0A]/75 md:text-base">
            <p>
              Suppose three teams finish on 6 points. First, build a mini-table of <em>only</em> the matches between those three teams
              and rank them by points, then goal difference, then goals scored within that mini-table.
            </p>
            <ul className="grid list-disc gap-2 pl-6 font-medium text-[#0E0C0A]/80">
              <li>If the mini-table separates all three, that is the final order.</li>
              <li>If it separates one team (say, top) but the other two are still level, those two are compared again on their own head-to-head result, then on overall goal difference if needed.</li>
            </ul>
            <p>Only once head-to-head is exhausted do overall goal difference, overall goals, conduct score and the FIFA World Ranking decide it.</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black">Third-placed team tiebreakers</h2>
          <p className="mt-3 text-sm leading-7 text-[#0E0C0A]/75 md:text-base">
            Ranking the 12 third-placed teams is different: there is no head-to-head, because the teams are in different groups. The
            eight best are decided by points, then overall goal difference, then goals scored, then team conduct score, then the FIFA
            World Ranking.{" "}
            <Link href="/world-cup-2026-format" className="font-bold text-[#B48A00] underline-offset-2 hover:underline">
              See the full tournament format →
            </Link>
          </p>
        </section>

        <FaqBlock items={faqs} />
      </article>

      <div className="mt-8">
        <RelatedLinks
          links={[
            { href: "/world-cup-2026-format", label: "Tournament format" },
            { href: "/groups", label: "All 12 groups" },
            { href: "/standings", label: "Group standings" },
            { href: "/matches", label: "Full schedule" }
          ]}
        />
      </div>
    </PageShell>
  );
}
