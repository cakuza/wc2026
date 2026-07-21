import type { Metadata } from "next";
import Link from "next/link";

const BASE_URL = "https://www.worldcupmatchday.com";

export const metadata: Metadata = {
  title: "WorldCupMatchDay - Data Sources, Methodology and Corrections",
  description:
    "How WorldCupMatchDay sources and displays World Cup 2026 data: where match results come from, how refresh windows work, how corrections are handled, and our editorial independence policy.",
  alternates: { canonical: `${BASE_URL}/world-cup-2026-data-sources` },
  openGraph: {
    title: "WorldCupMatchDay - Data Sources, Methodology and Corrections",
    description: "Where WorldCupMatchDay gets its data, how match-window refreshes work, and how to report a correction.",
    url: `${BASE_URL}/world-cup-2026-data-sources`,
    type: "website",
  },
};

const FAQS = [

  {
    q: "Where does WorldCupMatchDay get its match data?",
    a: "WorldCupMatchDay primarily uses documented sports-data providers. When provider coverage is incomplete or contradictory, verified reconciliation and canonical corrections may be applied with recorded provenance. Squad lists are static (sourced from officially announced squads at the start of the tournament) and do not update during the competition.",
  },
  {
    q: "How quickly do scores update during a live match?",
    a: "For eligible live matches, WorldCupMatchDay refreshes for updates every 30 seconds during active match windows. Bounded verification checks may occur before kickoff or while final data is being reconciled.",
  },
  {
    q: "How often do standings update?",
    a: "Group standings are calculated from completed, synced match results.",
  },
  {
    q: "Is WorldCupMatchDay affiliated with FIFA or any official body?",
    a: "No. WorldCupMatchDay is an entirely independent, fan-made website. We have no affiliation with FIFA, any national football federation, or any official tournament body. All content is for informational and entertainment purposes only.",
  },
  {
    q: "How do I report a data error?",
    a: "Email us at worldcupmatchday@proton.me. Please include the match name, the incorrect data you see, and the correct information with a source if possible.",
  },
  {
    q: "What happens if your data source is down?",
    a: "The site uses a cached snapshot of the last known good data. When the live feed is unavailable, a Live data unavailable notice is shown. Scores displayed during an outage reflect the last successful sync, not necessarily the current match state.",
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
  name: "WorldCupMatchDay - Data Sources, Methodology and Corrections",
  description: "How WorldCupMatchDay sources, processes, and displays World Cup 2026 match data.",
  url: `${BASE_URL}/world-cup-2026-data-sources`,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 font-heading text-xl font-extrabold uppercase tracking-wide text-white">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-white/70">{children}</div>
    </section>
  );
}

export default function DataSourcesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }} />

      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="mb-2 font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">About WorldCupMatchDay</p>
        <h1 className="mb-3 font-heading text-4xl font-extrabold uppercase tracking-wide text-white">Data Sources &amp; Methodology</h1>
        <p className="mb-8 max-w-2xl text-sm text-white/55">
          WorldCupMatchDay is an independent fan site. This page explains where our World Cup 2026 data comes from,
          how we process and display it, and how to report corrections.
        </p>

        <Section title="Match Data and Scores">
          <p>
            Live scores, match status, and results normally flow from a primary third-party football data provider via an API.
            This covers all 104 World Cup 2026 matches. When provider coverage is incomplete or conflicts with verified evidence, we perform documented reconciliation against canonical tournament records and publish a provenance-backed correction.
          </p>
          <p>
            Refreshing begins 15 minutes before kickoff and stops 3 hours after kickoff. While a match is live,
            eligible pages refresh every 30 seconds. Bounded verification checks may occur in the same window before
            kickoff or while final data is being reconciled. There is no continuous provider polling outside match
            windows, and cached or verified data remains available there.
          </p>
          <p>
            Displayed scores can lag the event itself because the upstream provider controls its own update cycle and
            network conditions. We do not guarantee real-time accuracy to the second.
          </p>
        </Section>

        <Section title="Goal Scorers and Match Events">
          <p>
            Goal scorer and match event data come from an additional enrichment source that supplements primary match
            data. Scorer details can lag scores by several minutes.
          </p>
          <p>
            We reconcile recorded goal events against the final score. Where there is a discrepancy, score accuracy
            takes priority and verified corrections are applied when evidence supports them.
          </p>
        </Section>

        <Section title="Group Standings and Historical Data">
          <p>
            Group standings are computed by our own code from completed, synced match results. Fixture schedules,
            kickoff times, venues, and group assignments come from official pre-tournament information and are shown
            in the viewer&apos;s selected timezone.
          </p>
          <p>
            Historical results and tournament statistics remain available from cached and verified records without
            continuous provider polling.
          </p>
        </Section>

        <Section title="Fallback Behaviour">
          <p>
            If the live data feed is unavailable, the site falls back to the last successfully cached snapshot. A Live
            data unavailable notice appears on affected pages, and scores may not reflect the current match state. We
            do not fabricate or estimate scores during outages.
          </p>
        </Section>

        <Section title="Independence Disclosure">
          <p>
            WorldCupMatchDay is an independent fan project. We are not affiliated with FIFA, any national football
            federation, stadium, broadcaster, or official sponsor. For details on our publisher independence and factual verification, see our{" "}
            <Link href="/editorial-policy" className="text-accent underline font-semibold">
              Editorial Policy
            </Link>
            .
          </p>
        </Section>

        <Section title="How to Report a Correction">
          <p>
            If you see a score, scorer name, venue, or other data that appears incorrect, email us at{" "}
            <a href="mailto:worldcupmatchday@proton.me" className="font-semibold text-accent underline-offset-2 hover:underline">
              worldcupmatchday@proton.me
            </a>
            . Include the match name, the issue, and a source for the correction where possible. You can read more about how corrections are processed and applied in our{" "}
            <Link href="/corrections-policy" className="text-accent underline font-semibold">
              Corrections Policy
            </Link>
            .
          </p>
        </Section>

        <section className="mt-8 rounded-xl border border-white/10 bg-navyCard px-4 py-4">
          <h2 className="mb-2 font-heading text-xs font-bold uppercase tracking-widest text-white/40">Official Sources</h2>
          <ul className="space-y-1 text-xs leading-relaxed text-white/50">
            <li><a href="https://www.fifa.com/en/tournaments/mens/worldcup/canada-mexico-usa-2026/matches" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white/70 transition">FIFA 2026 Match Schedule</a> - official fixtures and results source</li>
            <li><a href="https://www.fifa.com/en/tournaments/mens/worldcup/canada-mexico-usa-2026/host-cities" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white/70 transition">FIFA 2026 Host Cities &amp; Stadiums</a> - official venue information</li>
            <li><a href="https://legal.fifa.com/en/official-documents" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white/70 transition">FIFA Official Documents</a> - official competition regulations and rules</li>
          </ul>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          {[
            { href: "/contact", label: "Contact Us" },
            { href: "/about", label: "About" },
            { href: "/editorial-policy", label: "Editorial Policy" },
            { href: "/corrections-policy", label: "Corrections Policy" },
            { href: "/faq", label: "FAQ" },
            { href: "/privacy", label: "Privacy" },
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
