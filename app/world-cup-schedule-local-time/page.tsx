import type { Metadata } from "next";
import Link from "next/link";
import { TIMEZONES } from "@/lib/timezones";
import { MATCHES } from "@/lib/matches";

const BASE_URL = "https://www.worldcupmatchday.com";

export const metadata: Metadata = {
  title: "World Cup 2026 Schedule in Your Local Time | WorldCupMatchDay",
  description:
    "World Cup 2026 group-stage schedule converted to local time zones — Turkey, UK, US Eastern, India, Japan, Brazil and Australia — with kickoff times, teams, groups and venues.",
  alternates: { canonical: `${BASE_URL}/world-cup-schedule-local-time` },
  openGraph: {
    title: "World Cup 2026 Schedule in Your Local Time",
    description:
      "Pick your time zone to see every World Cup 2026 fixture with kickoff times, teams, groups and venues.",
    url: `${BASE_URL}/world-cup-schedule-local-time`,
    type: "website",
  },
};

export default function LocalTimeHubPage() {
  const fixtureCount = MATCHES.length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <p className="mb-2 font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">
        FIFA World Cup 2026
      </p>
      <h1 className="mb-2 font-heading text-4xl font-extrabold uppercase tracking-wide text-white">
        World Cup 2026 Schedule in Your Local Time
      </h1>
      <p className="mb-6 max-w-3xl text-sm text-white/55">
        See the full World Cup 2026 group-stage schedule converted to your time zone. Pick a region
        below for every listed fixture with kickoff times, teams, groups and venues. Knockout
        matchups are added once the group stage is complete.
      </p>

      {/* Quick facts */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { k: "Teams", v: "48" },
          { k: "Groups", v: "12" },
          { k: "Group-stage fixtures", v: String(fixtureCount) },
          { k: "Time zones", v: String(TIMEZONES.length) },
        ].map((f) => (
          <div key={f.k} className="rounded-xl border border-white/10 bg-navyCard px-4 py-3">
            <div className="font-heading text-lg font-extrabold text-white">{f.v}</div>
            <div className="font-heading text-[10px] font-bold uppercase tracking-widest text-white/40">
              {f.k}
            </div>
          </div>
        ))}
      </div>

      {/* Timezone pages */}
      <h2 className="mb-3 font-heading text-xl font-extrabold uppercase tracking-wide text-white">
        Choose your time zone
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {TIMEZONES.map((z) => (
          <Link
            key={z.slug}
            href={`/schedule/${z.slug}`}
            className="rounded-xl border border-white/10 bg-navyCard px-4 py-4 transition hover:border-white/25 hover:bg-white/5"
          >
            <div className="font-heading text-base font-extrabold uppercase tracking-wide text-white">
              {z.label}
            </div>
            <div className="mt-1 text-xs text-white/45">{z.zoneNote}</div>
          </Link>
        ))}
      </div>

      {/* Core links */}
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        {[
          { href: "/today", label: "Today" },
          { href: "/schedule", label: "Full Schedule" },
          { href: "/groups", label: "Groups" },
          { href: "/teams", label: "Teams" },
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
    </div>
  );
}
