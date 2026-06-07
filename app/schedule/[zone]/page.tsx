import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TimezoneSchedule } from "@/components/TimezoneSchedule";
import { TIMEZONES, TIMEZONE_SLUGS, timezoneBySlug } from "@/lib/timezones";
import { MATCHES } from "@/lib/matches";

const BASE_URL = "https://www.worldcupmatchday.com";

export const dynamicParams = false;

export function generateStaticParams() {
  return TIMEZONE_SLUGS.map((zone) => ({ zone }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ zone: string }>;
}): Promise<Metadata> {
  const { zone } = await params;
  const z = timezoneBySlug(zone);
  if (!z) return {};
  return {
    title: z.title,
    description: z.description,
    alternates: { canonical: `${BASE_URL}/schedule/${z.slug}` },
    openGraph: {
      title: z.title,
      description: z.description,
      url: `${BASE_URL}/schedule/${z.slug}`,
      type: "website",
    },
  };
}

export default async function TimezoneSchedulePage({
  params,
}: {
  params: Promise<{ zone: string }>;
}) {
  const { zone } = await params;
  const z = timezoneBySlug(zone);
  if (!z) notFound();

  const fixtureCount = MATCHES.length;

  const faqs = [
    {
      q: "What time zone is this schedule shown in?",
      a: `Every kickoff on this page is shown in ${z.zoneNote}.`,
    },
    {
      q: "When does the 2026 World Cup start?",
      a: "The tournament begins on 11 June 2026 with Mexico vs South Africa at Estadio Azteca.",
    },
    {
      q: "Are knockout matches included?",
      a: "Not yet — this page lists the group-stage fixtures. Knockout matchups are confirmed once the group stage finishes and will be added then.",
    },
    {
      q: "Where can I see today's matches?",
      a: "The today page shows the current day's fixtures (or the next upcoming matchday) with kickoff times and venues.",
    },
    {
      q: "Is this an official FIFA site?",
      a: "No. WorldCupMatchDay is an independent, fan-made resource and is not affiliated with FIFA.",
    },
  ];

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="mb-2 font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">
          {z.zoneNote}
        </p>
        <h1 className="mb-2 font-heading text-4xl font-extrabold uppercase tracking-wide text-white">
          World Cup 2026 Schedule in {z.label}
        </h1>
        <p className="mb-1 max-w-3xl text-sm text-white/55">
          Here is the World Cup 2026 group-stage schedule in {z.label}, with teams, dates, kickoff
          times, groups and venues.
        </p>
        <p className="mb-6 max-w-3xl text-sm text-white/45">{z.context}</p>

        {/* Quick facts */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: "Teams", v: "48" },
            { k: "Groups", v: "12" },
            { k: "Group-stage fixtures", v: String(fixtureCount) },
            { k: "Knockout matches", v: "After group stage" },
          ].map((f) => (
            <div key={f.k} className="rounded-xl border border-white/10 bg-navyCard px-4 py-3">
              <div className="font-heading text-lg font-extrabold text-white">{f.v}</div>
              <div className="font-heading text-[10px] font-bold uppercase tracking-widest text-white/40">
                {f.k}
              </div>
            </div>
          ))}
        </div>

        <TimezoneSchedule iana={z.iana} />

        {/* Internal links */}
        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          {[
            { href: "/today", label: "Today" },
            { href: "/schedule", label: "Full Schedule" },
            { href: "/groups", label: "Groups" },
            { href: "/teams", label: "Teams" },
            { href: "/world-cup-schedule-local-time", label: "Other time zones" },
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

        {/* Other time zones */}
        <section className="mt-8">
          <p className="mb-2 font-heading text-[10px] font-extrabold uppercase tracking-[0.25em] text-white/30">
            Schedule in other time zones
          </p>
          <div className="flex flex-wrap gap-2">
            {TIMEZONES.filter((o) => o.slug !== z.slug).map((o) => (
              <Link
                key={o.slug}
                href={`/schedule/${o.slug}`}
                className="rounded-lg border border-white/10 bg-navyCard px-3 py-1.5 text-xs font-semibold text-white/60 transition hover:border-white/25 hover:text-white"
              >
                {o.label}
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-10">
          <h2 className="mb-3 font-heading text-2xl font-extrabold uppercase tracking-wide text-white">
            FAQ
          </h2>
          <div className="space-y-3">
            {faqs.map((f) => (
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
