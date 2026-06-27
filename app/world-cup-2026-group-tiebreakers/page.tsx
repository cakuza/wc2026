import type { Metadata } from "next";
import Link from "next/link";

const BASE_URL = "https://www.worldcupmatchday.com";

export const metadata: Metadata = {
  title: "World Cup 2026 Group Stage Tiebreakers Explained",
  description:
    "How World Cup 2026 group stage tiebreakers work: the full FIFA criteria order for separating teams level on points, including head-to-head, goal difference, fair play record, and FIFA/Coca-Cola World Ranking.",
  alternates: { canonical: `${BASE_URL}/world-cup-2026-group-tiebreakers` },
  openGraph: {
    title: "World Cup 2026 Group Stage Tiebreakers Explained",
    description:
      "The full FIFA criteria used to separate teams tied on points at the 2026 World Cup group stage — from head-to-head results to FIFA/Coca-Cola World Ranking.",
    url: `${BASE_URL}/world-cup-2026-group-tiebreakers`,
    type: "website",
  },
};

const FAQS = [
  {
    q: "What happens if two teams are tied on points in a World Cup 2026 group?",
    a: "FIFA first looks at head-to-head results between the tied teams: points from the match(es) between them, then goal difference in those matches, then goals scored. If still level, overall goal difference and goals scored across all group matches are used. The disciplinary record (team conduct score) is then applied, and the FIFA/Coca-Cola Men's World Ranking as a final differentiator.",
  },
  {
    q: "Does goal difference or head-to-head come first in the 2026 World Cup?",
    a: "Head-to-head comes first. FIFA's 2026 regulations rank tied teams by their results against each other before looking at overall goal difference across all group matches. This means the direct match between two tied teams is the primary deciding factor.",
  },
  {
    q: "What are the full FIFA tiebreaker criteria for World Cup 2026?",
    a: "In order: (1) Points in head-to-head matches, (2) Goal difference in head-to-head matches, (3) Goals scored in head-to-head matches, (4) Goal difference in all group matches, (5) Goals scored in all group matches, (6) Disciplinary record (team conduct score), (7) FIFA/Coca-Cola Men's World Ranking.",
  },
  {
    q: "When do tiebreakers apply to three or more teams?",
    a: "When three or more teams are tied on points, the head-to-head record among only those tied teams is used first. If the tie is partially resolved (some teams separate), the criteria restart for the remaining tied teams. If still level across all criteria, FIFA applies the FIFA/Coca-Cola Men's World Ranking as a final differentiator.",
  },
  {
    q: "What is the fair play tiebreaker at the World Cup?",
    a: "If teams are still tied after points, goal difference, and goals scored in both head-to-head and overall matches, FIFA applies a disciplinary points system based on cards received across all group matches. The team with the better (less negative) disciplinary record advances. If still equal, the FIFA/Coca-Cola Men's World Ranking is used as a final differentiator.",
  },
  {
    q: "Can third-placed teams also be separated by tiebreakers?",
    a: "The ranking of third-placed teams does not use head-to-head (teams come from different groups). Instead it applies: (1) points, (2) goal difference, (3) goals scored — all from three group matches. If still level: (4) disciplinary record (team conduct score) and (5) FIFA/Coca-Cola Men's World Ranking. The eight best-ranked of the twelve third-placed teams advance.",
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
  name: "World Cup 2026 Group Stage Tiebreakers Explained",
  description:
    "Full guide to FIFA tiebreaker criteria for the 2026 World Cup group stage.",
  url: `${BASE_URL}/world-cup-2026-group-tiebreakers`,
};

const CRITERIA = [
  {
    step: "1",
    title: "Head-to-head points",
    body: "Points earned in the match(es) directly between the tied teams. A win gives 3 points; a draw gives 1 each; a loss gives 0. This is calculated only among the tied teams, not involving their results against others in the group.",
  },
  {
    step: "2",
    title: "Head-to-head goal difference",
    body: "The difference between goals scored and goals conceded in the head-to-head match(es). A team that won 3–0 in the direct encounter has a head-to-head goal difference of +3; their opponent has −3.",
  },
  {
    step: "3",
    title: "Head-to-head goals scored",
    body: "Total goals scored by each team in the head-to-head match(es). Only used if goal difference is still identical.",
  },
  {
    step: "4",
    title: "Overall goal difference",
    body: "Goal difference across all three group-stage matches. If a team won 4–0 and lost 1–2 and drew 1–1, their overall goal difference is +4 −2 +0 = +2.",
  },
  {
    step: "5",
    title: "Overall goals scored",
    body: "Total goals scored across all three group-stage matches. A team that scored in every game will have a higher total even if their goal difference is the same.",
  },
  {
    step: "6",
    title: "Disciplinary record (team conduct score)",
    body: "FIFA applies a disciplinary points system based on yellow and red cards received across all group matches. The team with the better (less negative) disciplinary record advances. This criterion rewards clean play throughout the group stage.",
  },
  {
    step: "7",
    title: "FIFA/Coca-Cola Men's World Ranking",
    body: "If all six criteria above are still identical, FIFA uses the latest FIFA/Coca-Cola Men's World Ranking to separate the teams. The higher-ranked team advances. This is an extremely rare scenario — the ranking almost always provides differentiation before this point.",
  },
];

export default function GroupTiebreakersPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }} />

      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="mb-2 font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">
          FIFA World Cup 2026
        </p>
        <h1 className="mb-3 font-heading text-4xl font-extrabold uppercase tracking-wide text-white">
          Group Stage Tiebreakers Explained
        </h1>
        <p className="mb-8 max-w-2xl text-sm text-white/55">
          When two or more teams finish level on points in their World Cup 2026 group, FIFA applies a
          structured set of tiebreaker criteria to determine their final ranking. Here is the exact order
          and what each criterion means.
        </p>

        {/* Key rule callout */}
        <div className="mb-8 rounded-xl border border-accent/30 bg-accent/5 px-5 py-4">
          <p className="font-heading text-xs font-bold uppercase tracking-widest text-accent">
            Key rule
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/80">
            Head-to-head results come before overall goal difference. If two teams are level on points,
            the direct match between them is the primary tiebreaker — not which team scored more goals
            across all three group matches.
          </p>
        </div>

        {/* Criteria list */}
        <h2 className="mb-4 font-heading text-xl font-extrabold uppercase tracking-wide text-white">
          Tiebreaker Criteria — In Order
        </h2>
        <div className="space-y-3">
          {CRITERIA.map((c) => (
            <div key={c.step} className="rounded-xl border border-white/10 bg-navyCard p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/20 font-heading text-sm font-extrabold text-accent">
                  {c.step}
                </span>
                <h3 className="font-heading text-base font-extrabold uppercase tracking-wide text-white">
                  {c.title}
                </h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{c.body}</p>
            </div>
          ))}
        </div>

        {/* Three-way ties */}
        <section className="mt-8">
          <h2 className="mb-3 font-heading text-xl font-extrabold uppercase tracking-wide text-white">
            Three-Way Ties
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-white/70">
            <p>
              When three teams finish level on points, the tiebreaker criteria are applied among all
              three simultaneously. FIFA only considers results from matches played between the tied
              teams — not against the fourth team in the group.
            </p>
            <p>
              If the three-way tie is partially resolved (for example, one team separates from the other
              two on head-to-head points), the remaining pair restart the criteria from the beginning
              as a two-way tie. This can mean a team&apos;s position in a three-way tie is determined
              by different criteria than their position in the full group table.
            </p>
          </div>
        </section>

        {/* Third-place ranking */}
        <section className="mt-8 rounded-xl border border-white/10 bg-navyCard px-4 py-4">
          <h2 className="mb-2 font-heading text-base font-extrabold uppercase tracking-wide text-white">
            Third-Place Ranking Uses Different Logic
          </h2>
          <p className="text-sm leading-relaxed text-white/60">
            When ranking the eight best third-placed teams to fill the remaining Round of 32 slots, FIFA
            does not use head-to-head (since these teams come from different groups and never played each
            other). Instead it uses: (1) points, (2) goal difference, (3) goals scored — all across the
            three group-stage matches only. If still level: (4) disciplinary record (team conduct score),
            and (5) FIFA/Coca-Cola Men&apos;s World Ranking.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/60">
            This means every goal in the group stage can matter for a third-placed team, since both goal
            difference and goals scored are pure aggregate figures across all three games.
          </p>
        </section>

        {/* Why it matters */}
        <section className="mt-8">
          <h2 className="mb-3 font-heading text-xl font-extrabold uppercase tracking-wide text-white">
            Why Tiebreakers Matter in 2026
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-white/70">
            <p>
              With 12 groups of four teams and only six matches per group, draws and level-points
              scenarios are statistically common. In the 2022 World Cup group stage, several groups
              required tiebreakers to determine final standings.
            </p>
            <p>
              The expanded 2026 format also makes the third-place ranking particularly competitive.
              Eight of twelve third-placed teams advance, which means a goal difference of +1 vs +2
              across three matches can be the difference between going home and advancing to the Round
              of 32.
            </p>
          </div>
        </section>

        {/* Internal links */}
        <div className="mt-8 flex flex-wrap gap-3">
          {[
            { href: "/world-cup-2026-format-explained", label: "Format Explained" },
            { href: "/world-cup-third-place-qualification", label: "Third-Place Table" },
            { href: "/groups", label: "Group Standings" },
            { href: "/qualified-eliminated-teams", label: "Qualified Teams" },
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

        <section className="mt-8 rounded-xl border border-white/10 bg-navyCard px-4 py-4">
          <h2 className="mb-2 font-heading text-xs font-bold uppercase tracking-widest text-white/40">
            Official Sources
          </h2>
          <ul className="space-y-1 text-xs leading-relaxed text-white/50">
            <li>
              <a href="https://www.fifa.com/en/articles/groups-how-teams-qualify-tie-breakers" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white/70 transition">
                FIFA: Groups — How Teams Qualify &amp; Tie-Breakers
              </a>{" "}— official group qualification and tiebreaker criteria
            </li>
            <li>
              <a href="https://www.fifa.com/en/tournaments/mens/worldcup/canada-mexico-usa-2026" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white/70 transition">
                FIFA 2026 World Cup — Official Tournament Page
              </a>{" "}— format and qualification rules
            </li>
          </ul>
        </section>
        <p className="mt-6 text-xs leading-relaxed text-white/40">
          WorldCupMatchDay is an independent, fan-made resource and is not affiliated with FIFA. Tiebreaker
          details are based on publicly available FIFA 2026 regulations. Always verify with official FIFA
          sources before citing specific rules.
        </p>
      </div>
    </>
  );
}
