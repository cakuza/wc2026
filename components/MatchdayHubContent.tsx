"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { TIMEZONES } from "@/lib/timezones";

type LinkItem = { href: string; label: string; note?: string; icon: string };

// Flag/marker per timezone landing page. Zone labels stay as their English
// proper-noun names (matching the SEO landing pages); the flag + localized
// section heading provide the context.
const TZ_FLAG: Record<string, string> = {
  "turkey-time": "🇹🇷",
  "uk-time": "🇬🇧",
  "eastern-time": "🇺🇸",
  "india-time": "🇮🇳",
  "japan-time": "🇯🇵",
  "brazil-time": "🇧🇷",
  "australia-time": "🇦🇺",
};

function CardGrid({ items }: { items: LinkItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-navyCard px-4 py-4 transition hover:border-white/25 hover:bg-white/5"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-lg"
          >
            {l.icon}
          </span>
          <div className="min-w-0">
            <div className="font-heading text-base font-extrabold uppercase tracking-wide text-white">
              {l.label}
            </div>
            {l.note ? <div className="mt-0.5 text-xs text-white/45">{l.note}</div> : null}
          </div>
        </Link>
      ))}
    </div>
  );
}

export function MatchdayHubContent() {
  const { t } = useLang();

  const scheduleLinks: LinkItem[] = [
    {
      href: "/world-cup-schedule-local-time",
      label: t("hub_localTimeSchedules"),
      note: t("hub_note_allZones"),
      icon: "🌐",
    },
    ...TIMEZONES.map((z) => ({
      href: `/schedule/${z.slug}`,
      label: z.label,
      note: z.zoneNote,
      icon: TZ_FLAG[z.slug] ?? "🕒",
    })),
  ];

  const guideLinks: LinkItem[] = [
    {
      href: "/world-cup-2026-teams-by-confederation",
      label: t("hub_teamsByConfederation"),
      note: t("hub_note_teamsByConf"),
      icon: "🌍",
    },
    {
      href: "/world-cup-third-place-qualification",
      label: t("hub_thirdPlace"),
      note: t("hub_note_thirdPlace"),
      icon: "🧮",
    },
    {
      href: "/world-cup-2026-prize-money",
      label: t("hub_prizeMoney"),
      note: t("hub_note_prizeMoney"),
      icon: "💰",
    },
  ];

  const coreLinks: LinkItem[] = [
    { href: "/today", label: t("sec_todayMatches"), icon: "⚽" },
    { href: "/schedule", label: t("hub_fullSchedule"), icon: "📅" },
    { href: "/groups", label: t("nav_groups"), icon: "🧩" },
    { href: "/teams", label: t("nav_teams"), icon: "👥" },
    { href: "/bracket", label: t("nav_bracket"), icon: "🏆" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <p className="mb-2 font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">
        FIFA World Cup 2026
      </p>
      <h1 className="mb-2 font-heading text-4xl font-extrabold uppercase tracking-wide text-white">
        {t("nav_matchdayHub")}
      </h1>
      <p className="mb-8 max-w-3xl text-sm text-white/55">{t("hub_intro")}</p>

      <section className="mb-8">
        <h2 className="mb-3 font-heading text-xl font-extrabold uppercase tracking-wide text-white">
          {t("hub_sec_schedules")}
        </h2>
        <CardGrid items={scheduleLinks} />
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-heading text-xl font-extrabold uppercase tracking-wide text-white">
          {t("hub_sec_guides")}
        </h2>
        <CardGrid items={guideLinks} />
      </section>

      <section>
        <h2 className="mb-3 font-heading text-xl font-extrabold uppercase tracking-wide text-white">
          {t("hub_sec_core")}
        </h2>
        <CardGrid items={coreLinks} />
      </section>
    </div>
  );
}
