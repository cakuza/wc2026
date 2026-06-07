import type { Metadata } from "next";
import Link from "next/link";
import { Flag } from "@/components/Flag";
import { TEAMS, slugFor } from "@/lib/teams";
import { CONFEDERATIONS, CONFEDERATION_BY_TEAM } from "@/lib/confederations";
import { countryName } from "@/lib/i18n";

const BASE_URL = "https://www.worldcupmatchday.com";

export const metadata: Metadata = {
  title: "World Cup 2026 Teams by Confederation",
  description:
    "All 48 FIFA World Cup 2026 teams grouped by confederation — UEFA, CONMEBOL, Concacaf, AFC, CAF and OFC — with links to each team's fixtures and group.",
  alternates: { canonical: `${BASE_URL}/world-cup-2026-teams-by-confederation` },
  openGraph: {
    title: "World Cup 2026 Teams by Confederation",
    description:
      "All 48 World Cup 2026 teams grouped by confederation, with links to each team's fixtures and group.",
    url: `${BASE_URL}/world-cup-2026-teams-by-confederation`,
    type: "website",
  },
};

const FAQS = [
  { q: "How many teams are in the 2026 World Cup?", a: "48 teams, expanded from 32, drawn into 12 groups of four." },
  { q: "Which confederation has the most teams?", a: "UEFA (Europe) has the most teams at the 2026 World Cup with 16." },
  { q: "Are the host nations included?", a: "Yes. Hosts Canada, Mexico and the United States all qualified automatically and are listed under Concacaf." },
  { q: "Where can I see the group-stage fixtures?", a: "The full group-stage schedule is on the schedule page, and the 12 groups with standings are on the groups page." },
  { q: "Is this an official FIFA site?", a: "No. WorldCupMatchDay is an independent, fan-made resource and is not affiliated with FIFA." },
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

      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="mb-2 font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">FIFA World Cup 2026</p>
        <h1 className="mb-2 font-heading text-4xl font-extrabold uppercase tracking-wide text-white">
          World Cup 2026 Teams by Confederation
        </h1>
        <p className="mb-6 max-w-3xl text-sm text-white/55">
          Here are the 48 World Cup 2026 teams grouped by confederation, with links to each team&apos;s fixtures and group.
        </p>

        <div className="space-y-6">
          {CONFEDERATIONS.map((conf) => {
            const teams = TEAMS.filter((t) => CONFEDERATION_BY_TEAM[t.key] === conf.code);
            if (teams.length === 0) return null;
            return (
              <section key={conf.code}>
                <h2 className="mb-1 flex items-baseline gap-2 border-b-2 border-accent pb-2 font-heading text-xl font-extrabold uppercase tracking-wide text-white">
                  {conf.name}
                  <span className="font-heading text-xs font-bold uppercase tracking-widest text-white/40">
                    {conf.region} · {teams.length}
                  </span>
                </h2>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {teams.map((t) => {
                    const name = countryName(t.key, "en");
                    return (
                      <Link
                        key={t.key}
                        href={`/teams/${slugFor(t.key)}`}
                        className="flex items-center gap-3 rounded-lg border border-white/10 bg-navyCard px-4 py-2.5 transition hover:border-white/20 hover:bg-white/5"
                      >
                        <Flag code={t.code} name={name} width={28} height={20} />
                        <span className="flex-1 truncate font-semibold text-white">{name}</span>
                        <span className="font-heading text-[11px] font-bold uppercase tracking-widest text-white/40">
                          Group {t.group}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          {[
            { href: "/teams", label: "All Teams" },
            { href: "/groups", label: "Groups" },
            { href: "/schedule", label: "Schedule" },
            { href: "/today", label: "Today" },
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
