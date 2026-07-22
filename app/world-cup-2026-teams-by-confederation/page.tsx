import type { Metadata } from "next";
import Link from "next/link";
import { TeamsByConfederation } from "@/components/TeamsByConfederation";
import { BreadcrumbNav, breadcrumbLd } from "@/components/BreadcrumbNav";
import { getTodayHref } from "@/lib/todaySelection";
import { DEFAULT_TIMEZONE } from "@/lib/timezone";

const BASE_URL = "https://www.worldcupmatchday.com";

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Teams", href: "/teams" },
  { label: "By Confederation" },
];

export const metadata: Metadata = {
  title: "World Cup 2026 Teams by Confederation — UEFA, AFC, CAF, CONMEBOL & More",
  description:
    "See all World Cup 2026 teams grouped by confederation, including UEFA, AFC, CAF, CONMEBOL, CONCACAF and OFC qualifiers.",
  alternates: { canonical: `${BASE_URL}/world-cup-2026-teams-by-confederation` },
  openGraph: {
    title: "World Cup 2026 Teams by Confederation — UEFA, AFC, CAF, CONMEBOL & More",
    description:
      "See all World Cup 2026 teams grouped by confederation, including UEFA, AFC, CAF, CONMEBOL, CONCACAF and OFC qualifiers.",
    url: `${BASE_URL}/world-cup-2026-teams-by-confederation`,
    type: "website",
  },
};

const FAQS = [
  { q: "How many teams are in the 2026 World Cup?", a: "48 teams, expanded from 32, drawn into 12 groups of four." },
  { q: "Which confederation has the most teams?", a: "UEFA (Europe) has the most teams at the 2026 World Cup with 16." },
  { q: "Are the host nations included?", a: "Yes. Hosts Canada, Mexico and the United States all qualified automatically and are listed under Concacaf." },
  { q: "Where can I see the group-stage fixtures?", a: "The full group-stage schedule is on the schedule page, and the 12 groups with standings are on the groups page." },
  { q: "Is WorldCupMatchDay affiliated with FIFA?", a: "No. WorldCupMatchDay is an independent, fan-made resource and is not affiliated with FIFA." },
];

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function TeamsByConfederationPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd(breadcrumbs, BASE_URL)) }} />

      <div className="mx-auto max-w-4xl px-4 py-8">
        <BreadcrumbNav items={breadcrumbs} />
        <p className="mb-2 font-heading text-sm font-bold uppercase tracking-[0.3em] text-accentText">World Cup 2026</p>
        <h1 className="mb-2 font-heading text-4xl font-extrabold uppercase tracking-wide text-ink">
          World Cup 2026 Teams by Confederation
        </h1>
        <p className="mb-6 max-w-3xl text-sm text-muted">
          Here are the 48 World Cup 2026 teams grouped by confederation, with links to each team&apos;s fixtures and group.
        </p>

        <TeamsByConfederation />

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
        {[
          { href: getTodayHref(DEFAULT_TIMEZONE), label: "Match Center" },
          { href: "/schedule", label: "Schedule" },
          { href: "/bracket", label: "Bracket" },
          { href: "/teams", label: "Teams" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="rounded-lg border border-line bg-surface px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-muted transition hover:border-lineStrong hover:text-ink">
              {l.label}
            </Link>
          ))}
        </div>

        <section className="mt-10">
          <h2 className="mb-3 font-heading text-2xl font-extrabold uppercase tracking-wide text-ink">FAQ</h2>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <div key={f.q} className="rounded-xl border border-line bg-surface p-4">
                <h3 className="font-heading text-sm font-extrabold uppercase tracking-wide text-ink sm:text-base">{f.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
