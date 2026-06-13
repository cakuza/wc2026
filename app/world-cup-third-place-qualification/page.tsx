import type { Metadata } from "next";
import Link from "next/link";
import { LiveDataAutoRefresh } from "@/components/LiveDataAutoRefresh";
import { LiveSnapshotDebug } from "@/components/LiveSnapshotDebug";
import { ThirdPlaceTable } from "@/components/ThirdPlaceTable";
import { getLiveRefreshPolicy } from "@/lib/liveRefreshPolicy";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";

export const revalidate = 30;
export const dynamic = "force-dynamic";

const BASE_URL = "https://www.worldcupmatchday.com";

export const metadata: Metadata = {
  title: "World Cup 2026 Third-Place Ranking Table & Qualification Explained",
  description:
    "Track the World Cup 2026 third-place ranking table and learn how the best third-placed teams qualify for the Round of 32.",
  alternates: { canonical: `${BASE_URL}/world-cup-third-place-qualification` },
  openGraph: {
    title: "World Cup 2026 Third-Place Ranking Table & Qualification Explained",
    description:
      "Track the World Cup 2026 third-place ranking table and learn how the best third-placed teams qualify for the Round of 32.",
    url: `${BASE_URL}/world-cup-third-place-qualification`,
    type: "website",
  },
};

const FAQS = [
  { q: "How many third-placed teams qualify?", a: "The 8 best third-placed teams across the 12 groups advance to the Round of 32." },
  { q: "How many teams reach the Round of 32?", a: "32 teams: the top two from each of the 12 groups (24 teams) plus the 8 best third-placed teams." },
  { q: "Do all third-placed teams qualify?", a: "No. There are 12 third-placed teams but only the 8 best-ranked of them qualify. Exact order can remain unresolved when teams are level on the available criteria." },
  { q: "When will the third-place ranking be known?", a: "The table on this page updates after completed group matches are synced, but it is only a current snapshot — the final ranking is only known once all group-stage matches are played." },
  { q: "Is WorldCupMatchDay affiliated with FIFA?", a: "No. WorldCupMatchDay is an independent, fan-made resource and is not affiliated with FIFA." },
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

export default async function ThirdPlaceQualificationPage() {
  const snapshot = await getTournamentLiveSnapshot();
  const standings = snapshot.standingsByGroup;
  const thirdPlaceRanking = snapshot.thirdPlaceRanking;
  const anyMatchesPlayed = Object.values(standings).some((rows) => rows.some((r) => r.played > 0));
  const refreshPolicy = getLiveRefreshPolicy(Object.values(snapshot.matches));

  return (
    <>
      <LiveDataAutoRefresh intervalMs={refreshPolicy.intervalMs} />
      <LiveSnapshotDebug snapshotId={snapshot.snapshotId} generatedAt={snapshot.generatedAt} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="mb-2 font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">World Cup 2026</p>
        <h1 className="mb-2 font-heading text-4xl font-extrabold uppercase tracking-wide text-white">
          World Cup 2026 Third-Place Ranking
        </h1>
        <p className="mb-6 max-w-2xl text-sm text-white/55">
          The eight best third-placed teams advance to the Round of 32. This ranking updates after completed
          group matches are synced.
        </p>

        {/* Live ranking of third-placed teams */}
        <section className="mb-8">
          <h2 className="mb-1 font-heading text-2xl font-extrabold uppercase tracking-wide text-white">
            Ranking of third-placed teams
          </h2>
          <p className="mb-3 max-w-2xl text-sm text-white/55">
            The eight best third-placed teams advance to the Round of 32. This table updates after completed
            group matches are synced.
          </p>
          {anyMatchesPlayed ? (
            <ThirdPlaceTable rows={thirdPlaceRanking} />
          ) : (
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
              <p className="font-heading text-[11px] font-bold uppercase tracking-widest text-accent/70">
                Third-place ranking
              </p>
              <p className="mt-1 text-sm text-white/70">
                Not available until group matches are played. This table will populate automatically as
                results are synced.
              </p>
            </div>
          )}
        </section>

        <div className="space-y-3">
          <Step n="1" title="12 groups of four">
            The 48 teams are split into 12 groups (A–L) of four. Every team plays the other three in its group once.
          </Step>
          <Step n="2" title="Top two qualify automatically">
            The first- and second-placed team in each group advance directly — that is 24 teams.
          </Step>
          <Step n="3" title="8 best third-placed teams">
            Each group also has a third-placed team (12 in total). The 8 best-ranked third-placed teams also advance;
            exact order can remain unresolved while teams are level on the available criteria.
          </Step>
          <Step n="4" title="32 teams reach the Round of 32">
            24 group winners and runners-up plus the 8 best third-placed teams make up the 32-team knockout bracket.
          </Step>
        </div>

        {/* H2: How many third-place teams qualify */}
        <section className="mt-6">
          <h2 className="mb-2 font-heading text-xl font-extrabold uppercase tracking-wide text-white">
            How many third-place teams qualify?
          </h2>
          <p className="text-sm leading-relaxed text-white/70">
            Eight of the twelve third-placed teams qualify for the knockout stage. The other four finish outside the qualifying places once the final group table is complete, but live ordering can remain unresolved when available criteria are level.
          </p>
        </section>

        {/* H2: Why third place matters */}
        <section className="mt-6">
          <h2 className="mb-2 font-heading text-xl font-extrabold uppercase tracking-wide text-white">
            Why third place matters
          </h2>
          <p className="text-sm leading-relaxed text-white/70">
            A team can finish 3rd in its group and still reach the Round of 32, but it must rank among the eight best
            third-placed teams across all 12 groups. That means every point and every goal in the group stage can matter,
            even in a match that doesn&apos;t decide first or second place.
          </p>
        </section>

        {/* H2: What decides the best third-placed teams */}
        <section className="mt-6 rounded-xl border border-white/10 bg-navyCard p-4">
          <h2 className="mb-2 font-heading text-base font-extrabold uppercase tracking-wide text-white">
            What decides the best third-placed teams?
          </h2>
          <p className="text-sm leading-relaxed text-white/70">
            Best third-placed teams are ranked here using points, goal difference and goals scored. Exact order can remain
            unresolved when teams are level on the available criteria because fair-play and full official tie-break inputs are
            not available in this table. The ranking above updates after completed matches are synced and is not final until all group-stage matches are complete.
          </p>
        </section>

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          {[
            { href: "/groups", label: "Groups" },
            { href: "/bracket", label: "Bracket" },
            { href: "/stats", label: "Stats" },
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
