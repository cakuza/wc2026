"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { ScheduleContent } from "@/app/schedule/ScheduleContent";
import { TIMEZONES, type TimezoneConfig } from "@/lib/timezones";
import { getTodayHref } from "@/lib/todaySelection";
import type { ResolvedParticipantLookup } from "@/lib/participant-resolution";

// Client-rendered visible chrome for /schedule/[zone]. The server page keeps metadata, static
// params and the English FAQ JSON-LD (for SEO); this component localizes everything the user sees
// via useLang/t(). On the server it renders in the default language (English) so crawlers still get
// English copy; after hydration it switches to the selected UI language. The zone label, H1 and
// intro reuse the localized `tz_*` keys; per-zone context and FAQ have dedicated keys. Technical
// values (zoneNote like "EDT, UTC−4 · America/New_York") stay as-is.

import type { SerializableSnapshotMatch } from "@/lib/liveSnapshot";

export function TimezoneSchedulePageContent({
  zone: z,
  fixtureCount,
  matchesProjection,
  resolvedParticipants,
  isTournamentComplete,
}: {
  zone: TimezoneConfig;
  fixtureCount: number;
  matchesProjection: Record<string, SerializableSnapshotMatch>;
  isTournamentComplete: boolean;
  resolvedParticipants?: ResolvedParticipantLookup;
}) {
  const { t } = useLang();

  const zoneLabel = t(`tz_${z.slug}`);
  const h1 = t("tz_h1").replace("{zone}", zoneLabel);
  const intro = t("tz_intro").replace("{zone}", zoneLabel);
  const context = t(`tz_context_${z.slug}`);

  const facts = [
    { k: t("tz_fact_teams"), v: "48" },
    { k: t("tz_fact_groups"), v: "12" },
    { k: t("tz_fact_fixtures"), v: String(fixtureCount) },
    { k: t("tz_fact_knockout"), v: t("tz_fact_knockout_val") },
  ];

  const faqs = [
    { q: t("tz_faq_q1"), a: t("tz_faq_a1").replace("{zoneNote}", z.zoneNote) },
    { q: t("tz_faq_q2"), a: t("tz_faq_a2") },
    { q: t("tz_faq_q3"), a: t("tz_faq_a3") },
    { q: t("tz_faq_q4"), a: t("tz_faq_a4") },
    { q: t("tz_faq_q5"), a: t("tz_faq_a5") },
  ];

  const related = [
    { href: "/schedule", label: t("hub_fullSchedule") },
    { href: "/matches/match-104", label: "Final Report" },
    { href: "/world-cup-2026", label: "World Cup 2026 Vault" },
    { href: "/stats", label: "Final Statistics" },
    { href: getTodayHref(z.iana), label: t("nav_today") },
    { href: "/groups", label: t("nav_groups") },
    { href: "/teams", label: t("nav_teams") },
    { href: "/world-cup-schedule-local-time", label: t("tz_related_otherZones") },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <p className="mb-2 font-heading text-sm font-bold uppercase tracking-[0.3em] text-accentText">
        {z.zoneNote}
      </p>
      <h1 className="mb-2 font-heading text-4xl font-extrabold uppercase tracking-wide text-ink">
        {h1}
      </h1>
      <p className="mb-1 max-w-3xl text-sm text-muted">{intro}</p>
      <p className="mb-6 max-w-3xl text-sm text-faint">{context}</p>

      {/* Quick facts */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {facts.map((f) => (
          <div key={f.k} className="rounded-xl border border-line bg-surface px-4 py-3">
            <div className="font-heading text-lg font-extrabold text-ink">{f.v}</div>
            <div className="font-heading text-[10px] font-bold uppercase tracking-widest text-muted">
              {f.k}
            </div>
          </div>
        ))}
      </div>

      <ScheduleContent
        matchesProjection={matchesProjection}
        resolvedParticipants={resolvedParticipants}
        timeZone={z.iana}
        isTournamentComplete={isTournamentComplete}
      />

      {/* Internal links */}
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        {related.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-lg border border-line bg-surface px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-muted transition hover:border-lineStrong hover:text-ink"
          >
            {l.label}
          </Link>
        ))}
      </div>

      {/* Other time zones */}
      <section className="mt-8">
        <p className="mb-2 font-heading text-[10px] font-extrabold uppercase tracking-[0.25em] text-faint">
          {t("tz_otherZones")}
        </p>
        <div className="flex flex-wrap gap-2">
          {TIMEZONES.filter((o) => o.slug !== z.slug).map((o) => (
            <Link
              key={o.slug}
              href={`/schedule/${o.slug}`}
              prefetch={false}
              className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-lineStrong hover:text-ink"
            >
              {t(`tz_${o.slug}`)}
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-10">
        <h2 className="mb-3 font-heading text-2xl font-extrabold uppercase tracking-wide text-ink">
          {t("tz_faq_title")}
        </h2>
        <div className="space-y-3">
          {faqs.map((f) => (
            <div key={f.q} className="rounded-xl border border-line bg-surface p-4">
              <h3 className="font-heading text-sm font-extrabold uppercase tracking-wide text-ink sm:text-base">
                {f.q}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
