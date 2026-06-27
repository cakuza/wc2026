import type { Metadata } from "next";
import Link from "next/link";

const BASE_URL = "https://www.worldcupmatchday.com";

export const metadata: Metadata = {
  title: "WorldCupMatchDay — Data Sources, Methodology and Corrections",
  description:
    "How WorldCupMatchDay sources and displays World Cup 2026 data: where match results come from, how often scores update, how corrections are handled, and our editorial independence policy.",
  alternates: { canonical: `${BASE_URL}/world-cup-2026-data-sources` },
  openGraph: {
    title: "WorldCupMatchDay — Data Sources, Methodology and Corrections",
    description:
      "Where WorldCupMatchDay gets its data, how quickly scores update, and how to report a correction.",
    url: `${BASE_URL}/world-cup-2026-data-sources`,
    type: "website",
  },
};

const FAQS = [
  {
    q: "Where does WorldCupMatchDay get its match data?",
    a: "Match results, scores, and status are pulled from a third-party football data provider via an API. The data covers all 104 World Cup 2026 matches. We do not manually enter scores — data flows automatically once the provider syncs it after each match event.",
  },
  {
    q: "How quickly do scores update during a live match?",
    a: "During live matches, WorldCupMatchDay polls for updates every 12 seconds. However, our data depends on the upstream provider's update frequency. In practice, scores typically appear within 30–90 seconds of the actual match event, though delays can be longer under high load.",
  },
  {
    q: "How often do standings update?",
    a: "Group standings are calculated automatically from completed, synced match results. They update each time the live snapshot refreshes — approximately every 10 seconds during live matches and every 90 seconds at idle. A 'Standings last synced' timestamp is shown on each group page.",
  },
  {
    q: "Is WorldCupMatchDay affiliated with FIFA or any official body?",
    a: "No. WorldCupMatchDay is an entirely independent, fan-made website. We have no affiliation with FIFA, any national football federation, or any official tournament body. All content is for informational and entertainment purposes only.",
  },
  {
    q: "How do I report a data error?",
    a: "Email us at worldcupmatchday@proton.me. Please include the match name, the incorrect data you see, and the correct information with a source if possible. We review reports and aim to respond as promptly as we can during the tournament period (11 June – 19 July 2026).",
  },
  {
    q: "What happens if your data source is down?",
    a: "The site uses a cached snapshot of the last known good data. When the live feed is unavailable, a 'Live data unavailable' notice is shown. Scores displayed during an outage reflect the last successful sync, not necessarily the current match state.",
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
  name: "WorldCupMatchDay — Data Sources, Methodology and Corrections",
  description:
    "How WorldCupMatchDay sources, processes, and displays World Cup 2026 match data.",
  url: `${BASE_URL}/world-cup-2026-data-sources`,
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

export default function DataSourcesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }} />

      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="mb-2 font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">
          About WorldCupMatchDay
        </p>
        <h1 className="mb-3 font-heading text-4xl font-extrabold uppercase tracking-wide text-white">
          Data Sources &amp; Methodology
        </h1>
        <p className="mb-8 max-w-2xl text-sm text-white/55">
          WorldCupMatchDay is an independent fan site. This page explains where our World Cup 2026 data
          comes from, how we process and display it, and how to report corrections.
        </p>

        <Section title="Match Data and Scores">
          <p>
            Live scores, match status, and results are sourced from a third-party football data
            provider via a real-time API. This covers all 104 World Cup 2026 matches — 72 group-stage
            games and 32 knockout matches. We do not manually enter scores or results; data flows
            automatically once the provider syncs it after each match event.
          </p>
          <p>
            The data pipeline works as follows: the provider updates their system from stadium feeds,
            our server polls the provider API at intervals, the new data is stored in a shared cache,
            and pages display the most recent cached snapshot. Cached snapshots refresh every
            10 seconds during live matches and every 90 seconds when no matches are in progress.
          </p>
          <p>
            During live matches, a page will show scores within approximately 30–90 seconds of the
            actual match event, depending on the upstream provider&apos;s own update cycle and network
            conditions. We do not guarantee real-time accuracy to the second.
          </p>
        </Section>

        <Section title="Goal Scorers and Match Events">
          <p>
            Goal scorer and match event data (bookings, substitutions) come from an additional
            enrichment source that supplements our primary match data. Scorer data may lag scores by
            several minutes — it is common for a goal to appear before the scorer&apos;s name is
            attributed.
          </p>
          <p>
            We apply a reconciliation process to verify that the number of goal events recorded
            matches the final score. Where discrepancies exist, we prioritise score accuracy over
            scorer data. If a scorer is listed incorrectly, we apply known corrections from our
            verified corrections file and accept reports from users for further fixes.
          </p>
        </Section>

        <Section title="Group Standings">
          <p>
            Group standings are computed by our own code from completed, synced match results. We do
            not use a pre-computed standings feed from our provider — instead, we calculate points,
            goal difference, goals scored, and tiebreaker criteria from scratch using our result data.
            This means standings only update once match results are marked as complete by the provider.
          </p>
          <p>
            Each group page shows a &quot;Standings last synced&quot; timestamp to indicate the freshness
            of the data. Third-place ranking is computed by the same logic, across all 12 groups
            simultaneously.
          </p>
        </Section>

        <Section title="Static and Historical Data">
          <p>
            Fixture schedules (dates, kickoff times, venues, group assignments) are hardcoded into the
            site from official pre-tournament information published by FIFA. Kickoff times are stored
            in UTC and converted to local time zones on the client side. Squad lists are sourced from
            officially announced squads and are static — they do not update during the tournament.
          </p>
          <p>
            Prize money figures are sourced from FIFA&apos;s publicly published financial breakdown.
            All-time World Cup records shown in the Statistics section are sourced from publicly
            available historical records and are not live data.
          </p>
        </Section>

        <Section title="Fallback Behaviour">
          <p>
            If the live data feed is unavailable, the site falls back to the last successfully cached
            snapshot. In this state, a &quot;Live data unavailable&quot; banner appears on affected pages,
            and scores shown may not reflect current match state. We do not fabricate or estimate
            scores during outages — only confirmed synced data is displayed.
          </p>
        </Section>

        <Section title="Independence Disclosure">
          <p>
            WorldCupMatchDay is an independent fan project. We are not affiliated with FIFA, any
            national football federation, any stadium, broadcaster, or official sponsor. Our content
            is produced independently and is not influenced by any commercial or official relationship
            with tournament bodies.
          </p>
        </Section>

        <Section title="How to Report a Correction">
          <p>
            If you see a score, scorer name, venue, or any other piece of data that appears incorrect,
            please email us at{" "}
            <a
              href="mailto:worldcupmatchday@proton.me"
              className="font-semibold text-accent underline-offset-2 hover:underline"
            >
              worldcupmatchday@proton.me
            </a>
            . Include:
          </p>
          <ul className="ml-4 list-disc space-y-1 text-white/60">
            <li>The match name (e.g. &quot;France vs Senegal, Group I&quot;)</li>
            <li>What you see that appears incorrect</li>
            <li>The correct information, with a source reference if possible</li>
          </ul>
          <p>
            We review reports and aim to respond as promptly as we can during the tournament period (11 June – 19 July 2026).
            Confirmed corrections are applied to our verified corrections file and take effect on the
            next data sync.
          </p>
        </Section>

        {/* Internal links */}
        <div className="mt-8 flex flex-wrap gap-3">
          {[
            { href: "/contact", label: "Contact Us" },
            { href: "/about", label: "About" },
            { href: "/faq", label: "FAQ" },
            { href: "/privacy", label: "Privacy" },
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
      </div>
    </>
  );
}
