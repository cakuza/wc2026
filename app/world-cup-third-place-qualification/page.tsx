import type { Metadata } from "next";
import Link from "next/link";
import { LiveSnapshotDebug } from "@/components/LiveSnapshotDebug";
import { ThirdPlaceTable } from "@/components/ThirdPlaceTable";
import { BreadcrumbNav, breadcrumbLd } from "@/components/BreadcrumbNav";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";

export const revalidate = 60;

const BASE_URL = "https://www.worldcupmatchday.com";

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Groups", href: "/groups" },
  { label: "Third-Place Qualification" },
];

export const metadata: Metadata = {
  title: "World Cup 2026 Final Third-Place Ranking & Qualification History",
  description:
    "The final World Cup 2026 third-place ranking, preserved as tournament history, and the teams that qualified for the Round of 32.",
  alternates: { canonical: `${BASE_URL}/world-cup-third-place-qualification` },
  openGraph: {
    title: "World Cup 2026 Final Third-Place Ranking & Qualification History",
    description:
      "The final World Cup 2026 third-place ranking, preserved as tournament history, and the teams that qualified for the Round of 32.",
    url: `${BASE_URL}/world-cup-third-place-qualification`,
    type: "website",
  },
};

const FAQS = [
  { q: "How many third-placed teams qualified?", a: "The 8 best third-placed teams across the 12 groups qualified for the Round of 32." },
  { q: "How many teams reached the Round of 32?", a: "32 teams: the top two from each of the 12 groups (24 teams) plus the 8 best third-placed teams." },
  { q: "Did all third-placed teams qualify?", a: "No. There were 12 third-placed teams but only the 8 best-ranked teams qualified. Exact internal order remains tied where the available published criteria do not separate teams." },
  { q: "When was the third-place ranking known?", a: "The group stage is complete. This final table is preserved as tournament history; teams tied on the available published criteria share a tied position when no further verified ordering is available." },
  { q: "Is WorldCupMatchDay affiliated with FIFA?", a: "No. WorldCupMatchDay is an independent, fan-made resource and is not affiliated with FIFA." },
];

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/20 font-heading text-sm font-extrabold text-accent">{n}</span>
        <h2 className="font-heading text-base font-extrabold uppercase tracking-wide text-white">{title}</h2>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">{children}</p>
    </div>
  );
}

export default async function ThirdPlaceQualificationPage() {
  const snapshot = await getTournamentLiveSnapshot();
  const thirdPlaceRanking = snapshot.thirdPlaceRanking;

  return (
    <>
      <LiveSnapshotDebug snapshotId={snapshot.snapshotId} generatedAt={snapshot.generatedAt} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd(breadcrumbs, BASE_URL)) }} />

      <div className="mx-auto max-w-3xl px-4 py-8">
        <BreadcrumbNav items={breadcrumbs} />
        <p className="mb-2 font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">World Cup 2026</p>
        <h1 className="mb-2 font-heading text-4xl font-extrabold uppercase tracking-wide text-white">
          Final third-place ranking
        </h1>
        <p className="mb-6 max-w-2xl text-sm text-muted">
          The group stage is complete. This final table is preserved as tournament history and records which
          third-placed teams qualified for the Round of 32.
        </p>

        <section className="mb-8">
          <h2 className="mb-1 font-heading text-2xl font-extrabold uppercase tracking-wide text-white">
            Final third-place ranking
          </h2>
          <p className="mb-3 max-w-2xl text-sm text-muted">
            The eight highest-ranked third-placed teams qualified for the Round of 32. Where the available
            published criteria cannot separate teams, the table preserves a tied final position.
          </p>
          <ThirdPlaceTable rows={thirdPlaceRanking} />
        </section>

        <div className="space-y-3">
          <Step n="1" title="12 groups of four">
            The 48 teams were split into 12 groups (A-L) of four. Every team played the other three in its group once.
          </Step>
          <Step n="2" title="Top two qualified automatically">
            The first- and second-placed team in each group qualified directly - 24 teams in total.
          </Step>
          <Step n="3" title="8 best third-placed teams">
            Each group also had a third-placed team (12 in total). The 8 best-ranked third-placed teams qualified;
            where available published criteria remain level, the final table records a tied position.
          </Step>
          <Step n="4" title="32 teams reached the Round of 32">
            24 group winners and runners-up plus the 8 best third-placed teams made up the 32-team knockout bracket.
          </Step>
        </div>

        <section className="mt-6">
          <h2 className="mb-2 font-heading text-xl font-extrabold uppercase tracking-wide text-white">
            How many third-place teams qualified?
          </h2>
          <p className="text-sm leading-relaxed text-muted">
            Eight of the twelve third-placed teams qualified for the knockout stage. The other four did not qualify.
            Where available published criteria are level, this historical table shows a tied position rather than an
            unsupported internal order.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="mb-2 font-heading text-xl font-extrabold uppercase tracking-wide text-white">
            Why third place mattered
          </h2>
          <p className="text-sm leading-relaxed text-muted">
            A team that finished third in its group could still reach the Round of 32 by ranking among the eight best
            third-placed teams across all 12 groups. Every point and goal from the completed group stage contributed to
            the historical ranking.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            The 8 qualifying third-placed teams entered the{" "}
            <Link href="/world-cup-2026-knockout-bracket-explained" className="text-accent underline-offset-2 hover:underline">
              knockout bracket
            </Link>{" "}
            for the Round of 32. Their bracket slot depended on which groups they came from, per the pre-set FIFA
            bracket structure.
          </p>
        </section>

        <section className="mt-6 rounded-xl border border-line bg-surface p-4">
          <h2 className="mb-2 font-heading text-base font-extrabold uppercase tracking-wide text-white">
            What decided the best third-placed teams?
          </h2>
          <p className="text-sm leading-relaxed text-muted">
            Best third-placed teams were ranked by: (1) points, (2) goal difference, and (3) goals scored - all from
            their three group matches. Further criteria include disciplinary record and FIFA/Coca-Cola Men&apos;s World
            Ranking. If available evidence does not resolve an internal tie, the ranking above preserves that tied final
            position rather than implying that a future match will decide it.
          </p>
        </section>

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          {[
            { href: "/groups", label: "Groups" },
            { href: "/bracket", label: "Bracket" },
            { href: "/stats", label: "Stats" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="rounded-lg border border-line bg-surface px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-muted transition hover:border-lineStrong hover:text-white">
              {l.label}
            </Link>
          ))}
        </div>

        <section className="mt-10">
          <h2 className="mb-3 font-heading text-2xl font-extrabold uppercase tracking-wide text-white">FAQ</h2>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <div key={f.q} className="rounded-xl border border-line bg-surface p-4">
                <h3 className="font-heading text-sm font-extrabold uppercase tracking-wide text-white sm:text-base">{f.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
