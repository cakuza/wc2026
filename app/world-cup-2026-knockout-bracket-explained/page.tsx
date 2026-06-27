import type { Metadata } from "next";
import Link from "next/link";

const BASE_URL = "https://www.worldcupmatchday.com";

export const metadata: Metadata = {
  title: "World Cup 2026 Knockout Bracket Explained — Rounds, Dates, Format",
  description:
    "How the World Cup 2026 knockout bracket works: the Round of 32, Round of 16, quarter-finals, semi-finals and final. When fixtures are confirmed, extra time rules, and key dates.",
  alternates: { canonical: `${BASE_URL}/world-cup-2026-knockout-bracket-explained` },
  openGraph: {
    title: "World Cup 2026 Knockout Bracket Explained — Rounds, Dates, Format",
    description:
      "A full guide to the 2026 World Cup knockout stage: how the Round of 32 works, when fixtures are confirmed, extra time rules, and key dates to the final.",
    url: `${BASE_URL}/world-cup-2026-knockout-bracket-explained`,
    type: "website",
  },
};

const FAQS = [
  {
    q: "When does the 2026 World Cup knockout stage start?",
    a: "The Round of 32 begins on 28 June 2026, once the group stage concludes on 27 June 2026. The 16 Round of 32 matches are played across six days (28 June to 3 July 2026).",
  },
  {
    q: "How many rounds are in the 2026 World Cup knockout stage?",
    a: "Five rounds: Round of 32, Round of 16, Quarter-finals, Semi-finals, and the Final. There is also a Third-Place match between the two losing semi-finalists.",
  },
  {
    q: "What happens if a knockout match is tied after 90 minutes?",
    a: "The match goes to extra time — two 15-minute halves (30 minutes total). If still level after extra time, a penalty shootout decides the winner. In knockout matches at the World Cup, a draw is never the final result.",
  },
  {
    q: "When is the 2026 World Cup final?",
    a: "19 July 2026 at New York New Jersey Stadium (MetLife Stadium) in East Rutherford, New Jersey.",
  },
  {
    q: "When are knockout bracket fixtures confirmed?",
    a: "Knockout bracket matchups are confirmed once the group stage is complete on 27 June 2026. The bracket slots are based on group finishing positions, so all 32 slots become known simultaneously when the last group matches finish.",
  },
  {
    q: "Is there a third-place match at the 2026 World Cup?",
    a: "Yes. The two losing semi-finalists play a third-place match on 18 July 2026, one day before the final.",
  },
  {
    q: "How are bracket matchups determined?",
    a: "Bracket matchups are set by group finishing positions. For example, first place in Group A faces a specified team from another group. This structure is set by FIFA before the tournament starts, so once the group stage is complete, every bracket matchup is immediately known.",
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
  name: "World Cup 2026 Knockout Bracket Explained",
  description:
    "Guide to the 2026 World Cup knockout bracket: rounds, dates, extra time rules, and how matchups are determined.",
  url: `${BASE_URL}/world-cup-2026-knockout-bracket-explained`,
};

const ROUNDS = [
  {
    round: "Round of 32",
    matches: "16 matches",
    dates: "28 June – 3 July 2026",
    teams: "32 teams",
    body: "The first knockout round — new for 2026. All 24 group winners and runners-up plus the 8 best third-placed teams enter. The bracket pairings are determined by group finishing position and are set by FIFA before the tournament begins.",
  },
  {
    round: "Round of 16",
    matches: "8 matches",
    dates: "4–7 July 2026",
    teams: "16 teams",
    body: "Winners of the Round of 32 advance. Matches continue to follow the pre-set bracket, so the two halves of the bracket remain separate until the final.",
  },
  {
    round: "Quarter-finals",
    matches: "4 matches",
    dates: "9–11 July 2026",
    teams: "8 teams",
    body: "The last eight nations in the tournament. Each match produces one semi-finalist.",
  },
  {
    round: "Semi-finals",
    matches: "2 matches",
    dates: "14–15 July 2026",
    teams: "4 teams",
    body: "Winners go to the final. Losers play the third-place match on 18 July.",
  },
  {
    round: "Third-Place Match",
    matches: "1 match",
    dates: "18 July 2026",
    teams: "2 teams",
    body: "The two losing semi-finalists compete on 18 July 2026, one day before the final. The match carries significant national prestige and determines the tournament's bronze medal position.",
  },
  {
    round: "Final",
    matches: "1 match",
    dates: "19 July 2026",
    teams: "2 teams",
    body: "New York New Jersey Stadium (commercially known as MetLife Stadium), East Rutherford, New Jersey. The designated final venue hosts the deciding match of the biggest World Cup in history.",
  },
];

export default function KnockoutBracketExplainedPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }} />

      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="mb-2 font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">
          FIFA World Cup 2026
        </p>
        <h1 className="mb-3 font-heading text-4xl font-extrabold uppercase tracking-wide text-white">
          Knockout Bracket Explained
        </h1>
        <p className="mb-8 max-w-2xl text-sm text-white/55">
          Once the group stage ends on 27 June 2026, 32 teams enter the knockout stage. Every match from
          this point is win-or-go-home — no draws, no second chances. Here is how the bracket works,
          when fixtures are confirmed, and what dates lead to the final.
        </p>

        {/* Quick facts */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { k: "Knockout teams", v: "32" },
            { k: "Knockout matches", v: "32" },
            { k: "Rounds", v: "5 + 3rd place" },
            { k: "Start", v: "28 Jun 2026" },
            { k: "Final", v: "19 Jul 2026" },
            { k: "Final venue", v: "New York New Jersey Stadium" },
          ].map((f) => (
            <div key={f.k} className="rounded-xl border border-white/10 bg-navyCard px-4 py-3">
              <div className="font-heading text-base font-extrabold text-white">{f.v}</div>
              <div className="font-heading text-[10px] font-bold uppercase tracking-widest text-white/40">{f.k}</div>
            </div>
          ))}
        </div>

        {/* How 32 teams qualify */}
        <section className="mb-8">
          <h2 className="mb-3 font-heading text-xl font-extrabold uppercase tracking-wide text-white">
            How 32 Teams Qualify for the Knockout Stage
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-white/70">
            <p>
              The 32 knockout-stage participants come from the group stage in three categories: the
              24 automatic qualifiers (first and second place from each of the 12 groups) and the
              8 best third-placed teams ranked across all groups.
            </p>
            <p>
              Third-placed teams are ranked by points, then goal difference, then goals scored in their
              three group matches. The ranking is only finalised once the last group-stage matches
              finish on 27 June 2026 — which means the identity of all 32 bracket participants is
              confirmed simultaneously on that date.
            </p>
          </div>
        </section>

        {/* Rounds */}
        <h2 className="mb-4 font-heading text-xl font-extrabold uppercase tracking-wide text-white">
          Knockout Rounds
        </h2>
        <div className="space-y-3">
          {ROUNDS.map((r) => (
            <div key={r.round} className="rounded-xl border border-white/10 bg-navyCard p-4">
              <div className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="font-heading text-base font-extrabold uppercase tracking-wide text-white">
                  {r.round}
                </h3>
                <span className="font-heading text-xs font-bold text-accent">{r.matches}</span>
                <span className="font-heading text-xs font-bold text-white/40">{r.dates}</span>
              </div>
              <p className="text-sm leading-relaxed text-white/70">{r.body}</p>
            </div>
          ))}
        </div>

        {/* Extra time and penalties */}
        <section className="mt-8">
          <h2 className="mb-3 font-heading text-xl font-extrabold uppercase tracking-wide text-white">
            Extra Time and Penalty Shootouts
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-white/70">
            <p>
              All knockout matches at the 2026 World Cup use the same rules: if the score is level after
              90 minutes, the match goes to extra time — two additional 15-minute halves. If still tied
              after 30 minutes of extra time, the winner is decided by a penalty shootout.
            </p>
            <p>
              A penalty shootout is taken from the penalty spot (12 yards from goal). Each team takes
              five kicks alternately; if still level, it continues as sudden death with one kick per team.
              The team that scores more penalty kicks advances.
            </p>
            <p>
              There is no golden goal or silver goal rule — a team cannot win in extra time by scoring first.
              Both halves of extra time are played regardless of who scores.
            </p>
          </div>
        </section>

        {/* When bracket is confirmed */}
        <section className="mt-8 rounded-xl border border-white/10 bg-navyCard px-4 py-4">
          <h2 className="mb-2 font-heading text-base font-extrabold uppercase tracking-wide text-white">
            When Are Knockout Fixtures Confirmed?
          </h2>
          <p className="text-sm leading-relaxed text-white/60">
            The bracket structure — which group position faces which — is set by FIFA before the
            tournament. The specific teams filling each slot are only known once the group stage ends.
            On 27 June 2026, the last group matches finish, and at that point all 32 Round of 32 matchups
            are simultaneously confirmed. The{" "}
            <Link href="/bracket" className="text-accent hover:underline">
              bracket page
            </Link>{" "}
            updates automatically as group results are synced.
          </p>
        </section>

        {/* Internal links */}
        <div className="mt-8 flex flex-wrap gap-3">
          {[
            { href: "/bracket", label: "Live Bracket" },
            { href: "/world-cup-2026-format-explained", label: "Format Explained" },
            { href: "/world-cup-third-place-qualification", label: "Third-Place Table" },
            { href: "/groups", label: "Group Standings" },
            { href: "/world-cup-2026-prize-money", label: "Prize Money" },
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
              <a href="https://www.fifa.com/en/tournaments/mens/worldcup/canada-mexico-usa-2026/matches" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white/70 transition">
                FIFA 2026 Match Schedule
              </a>{" "}— official round-by-round dates
            </li>
            <li>
              <a href="https://www.fifa.com/en/tournaments/mens/worldcup/canada-mexico-usa-2026/host-cities" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white/70 transition">
                FIFA 2026 Host Cities &amp; Stadiums
              </a>{" "}— official 16-venue list
            </li>
          </ul>
        </section>
        <p className="mt-6 text-xs leading-relaxed text-white/40">
          WorldCupMatchDay is an independent, fan-made resource and is not affiliated with FIFA. Always verify
          specific match dates and venues with official FIFA sources.
        </p>
      </div>
    </>
  );
}
