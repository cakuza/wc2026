import type { Metadata } from "next";

const BASE_URL = "https://www.worldcupmatchday.com";

// Single source of truth — drives both the visible list and the FAQPage JSON-LD.
const FAQS: { q: string; a: string }[] = [
  {
    q: "When does the 2026 World Cup start?",
    a: "June 11, 2026, with the opening match Mexico vs South Africa at Estadio Azteca in Mexico City. The tournament runs to 19 July 2026, when the final takes place at New York New Jersey Stadium (MetLife Stadium) in East Rutherford, New Jersey.",
  },
  {
    q: "How many teams are in the 2026 World Cup?",
    a: "48 teams, expanded from the 32-team format used at every World Cup from 1998 to 2022. The expansion was approved by FIFA in 2017 and adds 16 additional nations, giving more confederations greater representation.",
  },
  {
    q: "Which countries host the 2026 World Cup?",
    a: "The United States, Canada, and Mexico — the first World Cup hosted by three nations. The US hosts the most matches with 11 of the 16 stadiums, including the final.",
  },
  {
    q: "Where is the 2026 World Cup final?",
    a: "New York New Jersey Stadium (MetLife Stadium) in East Rutherford, New Jersey, on 19 July 2026.",
  },
  {
    q: "How many matches are in the 2026 World Cup?",
    a: "104 matches total: 72 group-stage matches (12 groups × 6 matches each) and 32 knockout matches. This compares to 64 matches at the 2022 World Cup in Qatar.",
  },
  {
    q: "What are the 2026 World Cup groups?",
    a: "12 groups (A through L) of 4 teams each. The top 2 from each group advance automatically to the Round of 32 (24 teams). The 8 best third-placed teams across all groups also qualify, bringing the total to 32 knockout-stage participants.",
  },
  {
    q: "How does the 2026 World Cup format work?",
    a: "Group stage (48 teams, 12 groups) → Round of 32 (32 teams) → Round of 16 → Quarter-finals → Semi-finals → Final. The Round of 32 is new for 2026 — the first time this round has appeared at a World Cup. All knockout matches are single-leg; ties go to extra time and then penalties.",
  },
  {
    q: "How do the 8 best third-placed teams qualify?",
    a: "The 12 third-placed teams (one per group) are ranked by points, then goal difference, then goals scored across their three group matches. The 8 best-ranked of those 12 advance to the Round of 32. This means finishing 3rd in your group can still earn you a place in the knockout stage if your record is strong enough.",
  },
  {
    q: "What tiebreakers are used in the group stage?",
    a: "Teams level on points are separated in this order: (1) head-to-head points between the tied teams, (2) head-to-head goal difference, (3) head-to-head goals scored, (4) overall goal difference, (5) overall goals scored, (6) disciplinary record (team conduct score), (7) FIFA/Coca-Cola Men's World Ranking. Head-to-head results come before overall goal difference.",
  },
  {
    q: "Which stadiums host 2026 World Cup matches?",
    a: "16 stadiums across the US, Canada and Mexico. US venues: New York New Jersey Stadium (New York/New Jersey), AT&T Stadium (Dallas), Los Angeles Stadium (Los Angeles), San Francisco Bay Area Stadium (San Francisco Bay Area), Mercedes-Benz Stadium (Atlanta), Gillette Stadium (Boston), Arrowhead Stadium (Kansas City), Lincoln Financial Field (Philadelphia), Lumen Field (Seattle), Hard Rock Stadium (Miami), and NRG Stadium (Houston). Canada: BMO Field (Toronto) and BC Place (Vancouver). Mexico: Estadio Azteca (Mexico City), Estadio Akron (Guadalajara) and Estadio BBVA (Monterrey).",
  },
  {
    q: "When are knockout bracket fixtures confirmed?",
    a: "Bracket matchups are set by FIFA before the tournament (which group position faces which), but the specific teams are only known once the group stage ends on 27 June 2026. All 32 Round of 32 matchups are confirmed simultaneously on that date.",
  },
  {
    q: "What happens if a knockout match ends in a draw?",
    a: "Extra time is played — two additional 15-minute halves. If still level after 30 minutes of extra time, a penalty shootout decides the winner. There is no golden goal. This applies to all knockout rounds including the third-place match.",
  },
  {
    q: "Who are the favorites to win the 2026 World Cup?",
    a: "France, Brazil, England, Argentina, Germany and Spain are considered among the leading contenders. France won in 2018, Argentina in 2022. Brazil have won five times — more than any other nation — while England last won in 1966.",
  },
  {
    q: "When is the 2026 World Cup draw?",
    a: "The group draw has already taken place. All 48 teams and their groups are confirmed. See the groups page for full standings and the team pages for individual squad and fixture information.",
  },
  {
    q: "Is WorldCupMatchDay affiliated with FIFA?",
    a: "No. WorldCupMatchDay is an independent, fan-made resource and is not affiliated with FIFA, any national football federation, broadcaster or official sponsor. Content is for informational and entertainment purposes only.",
  },
  {
    q: "How accurate is the data on WorldCupMatchDay?",
    a: "Scores and standings come from a third-party data provider and update every 10–90 seconds depending on whether a match is live. We do not manually enter scores. Data may have a 30–90 second delay from real-time. Squad lists are static (sourced from officially announced squads at the start of the tournament) and do not update during the competition.",
  },
  {
    q: "How do I see the schedule in my local time?",
    a: "Use the Schedule page and select your timezone, or visit the Matchday Hub to browse schedules by region — including Turkey Time, UK Time, Eastern Time, India Time, Japan Time, Brazil Time and Australia Time.",
  },
  {
    q: "When does the 2026 World Cup knockout stage start?",
    a: "The Round of 32 begins on 28 June 2026, once the group stage concludes on 27 June. The final is on 19 July, making the tournament 39 days long in total.",
  },
  {
    q: "How many host nations have won the World Cup on home soil?",
    a: "Six: Uruguay (1930), Italy (1934), England (1966), West Germany (1974), Argentina (1978) and France (1998). No host nation has won the World Cup since 1998.",
  },
  {
    q: "How do I report a score or data error?",
    a: "Email worldcupmatchday@proton.me with the match name and the correct information. We review reports and aim to respond as promptly as we can. See the Data Sources page for full information on our data flow and correction process.",
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
