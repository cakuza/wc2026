import type { Metadata } from "next";
import Link from "next/link";
import { TIMEZONES } from "@/lib/timezones";

const BASE_URL = "https://www.worldcupmatchday.com";

export const metadata: Metadata = {
  title: "Matchday Hub — World Cup 2026 Tools & Schedules",
  description:
    "World Cup 2026 matchday tools: local-time schedules, teams by confederation, third-place qualification and prize money explainers.",
  alternates: { canonical: `${BASE_URL}/matchday-hub` },
  openGraph: {
    title: "Matchday Hub — World Cup 2026 Tools & Schedules",
    description:
      "Local-time schedules, team lists, qualification explainers and prize money for the 2026 World Cup.",
    url: `${BASE_URL}/matchday-hub`,
    type: "website",
  },
};

type LinkItem = { href: string; label: string; note?: string };

const SCHEDULE_LINKS: LinkItem[] = [
  { href: "/world-cup-schedule-local-time", label: "Local Time Schedules", note: "All time zones" },
  ...TIMEZONES.map((z) => ({
    href: `/schedule/${z.slug}`,
    label: `${z.label} Schedule`,
    note: z.zoneNote,
  })),
];

const GUIDE_LINKS: LinkItem[] = [
  { href: "/world-cup-2026-teams-by-confederation", label: "Teams by Confederation", note: "All 48 teams grouped" },
  { href: "/world-cup-third-place-qualification", label: "Third-Place Qualification", note: "How the best 3rd-placed teams qualify" },
  { href: "/world-cup-2026-prize-money", label: "Prize Money", note: "Payout by finishing position" },
];

const CORE_LINKS: LinkItem[] = [
  { href: "/today", label: "Today's Matches" },
  { href: "/schedule", label: "Full Schedule" },
  { href: "/groups", label: "Groups" },
  { href: "/teams", label: "Teams" },
  { href: "/bracket", label: "Bracket" },
];

function CardGrid({ items }: { items: LinkItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="rounded-xl border border-white/10 bg-navyCard px-4 py-4 transition hover:border-white/25 hover:bg-white/5"
        >
          <div className="font-heading text-base font-extrabold uppercase tracking-wide text-white">
            {l.label}
          </div>
          {l.note ? <div className="mt-1 text-xs text-white/45">{l.note}</div> : null}
        </Link>
      ))}
    </div>
  );
}

export default function MatchdayHubPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <p className="mb-2 font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">
        FIFA World Cup 2026
      </p>
      <h1 className="mb-2 font-heading text-4xl font-extrabold uppercase tracking-wide text-white">
        Matchday Hub
      </h1>
      <p className="mb-8 max-w-3xl text-sm text-white/55">
        Useful World Cup 2026 matchday tools, including local-time schedules, team lists,
        qualification explainers and prize money.
      </p>

      <section className="mb-8">
        <h2 className="mb-3 font-heading text-xl font-extrabold uppercase tracking-wide text-white">
          Local-time schedules
        </h2>
        <CardGrid items={SCHEDULE_LINKS} />
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-heading text-xl font-extrabold uppercase tracking-wide text-white">
          Guides & explainers
        </h2>
        <CardGrid items={GUIDE_LINKS} />
      </section>

      <section>
        <h2 className="mb-3 font-heading text-xl font-extrabold uppercase tracking-wide text-white">
          Core pages
        </h2>
        <CardGrid items={CORE_LINKS} />
      </section>
    </div>
  );
}
