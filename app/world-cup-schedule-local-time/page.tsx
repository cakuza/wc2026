import type { Metadata } from "next";
import Link from "next/link";
import { TIMEZONES } from "@/lib/timezones";
import { MATCHES } from "@/lib/matches";
import { getTodayHref } from "@/lib/todaySelection";
import { DEFAULT_TIMEZONE } from "@/lib/timezone";
import { BreadcrumbNav, breadcrumbLd } from "@/components/BreadcrumbNav";

const BASE_URL = "https://www.worldcupmatchday.com";

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Schedule", href: "/schedule" },
  { label: "Local Time" },
];

export const metadata: Metadata = {
  title: "World Cup 2026 Schedule in Your Local Time",
  description:
    "World Cup 2026 full schedule in your local time zone — all 104 fixtures including group stage and knockout matches from the Round of 32 to the Final on 19 July.",
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd(breadcrumbs, BASE_URL)) }}
      />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <BreadcrumbNav items={breadcrumbs} />
        <p className="mb-2 font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">
          FIFA World Cup 2026
        </p>
      <h1 className="mb-2 font-heading text-4xl font-extrabold uppercase tracking-wide text-ink">
        World Cup 2026 Schedule in Your Local Time
      </h1>
      <p className="mb-6 max-w-3xl text-sm text-muted">
        See the complete World Cup 2026 schedule converted to your time zone — all 104 fixtures
        including group stage and knockout matches from the Round of 32 to the Final on 19 July.
        Pick a region below for kickoff times, teams and venues.
      </p>

      {/* Quick facts */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { k: "Teams", v: "48" },
          { k: "Groups", v: "12" },
          { k: "Total fixtures", v: String(fixtureCount) },
          { k: "Time zones", v: String(TIMEZONES.length) },
        ].map((f) => (
          <div key={f.k} className="rounded-xl border border-line bg-surface px-4 py-3">
            <div className="font-heading text-lg font-extrabold text-ink">{f.v}</div>
            <div className="font-heading text-[10px] font-bold uppercase tracking-widest text-faint">
              {f.k}
            </div>
          </div>
        ))}
      </div>

      {/* Timezone pages */}
      <h2 className="mb-3 font-heading text-xl font-extrabold uppercase tracking-wide text-ink">
        Choose your time zone
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {TIMEZONES.map((z) => (
          <Link
            key={z.slug}
            href={`/schedule/${z.slug}`}
            className="rounded-xl border border-line bg-surface px-4 py-4 transition hover:border-lineStrong hover:bg-hover"
          >
            <div className="font-heading text-base font-extrabold uppercase tracking-wide text-ink">
              {z.label}
            </div>
            <div className="mt-1 text-xs text-faint">{z.zoneNote}</div>
          </Link>
        ))}
      </div>

      {/* Core links */}
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        {[
          { href: getTodayHref(DEFAULT_TIMEZONE), label: "Match Center" },
          { href: "/schedule", label: "Schedule" },
          { href: "/bracket", label: "Bracket" },
          { href: "/teams", label: "Teams" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-lg border border-line bg-surface px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-muted transition hover:border-lineStrong hover:text-ink"
          >
            {l.label}
          </Link>
        ))}
      </div>
      </div>
    </>
  );
}
