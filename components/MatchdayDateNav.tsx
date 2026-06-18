"use client";

import Link from "next/link";
import { useTimezone } from "@/components/TimezoneProvider";
import { useLang } from "@/components/LanguageProvider";

/**
 * Matchday date navigator for /today.
 *
 * Renders a prominent selected-date heading plus Previous-day / Today /
 * Next-day controls. All targets carry the viewer's selected timezone so the
 * server resolves the same local date the client is showing, and produce
 * shareable, back/forward-compatible `?date=YYYY-MM-DD` URLs. Bounds outside
 * the tournament render as disabled (non-link) controls.
 */
export function MatchdayDateNav({
  selectedDate,
  isToday,
  prevDate,
  nextDate,
}: {
  selectedDate: string;
  todayDate: string;
  isToday: boolean;
  prevDate: string | null;
  nextDate: string | null;
}) {
  const { timeZone } = useTimezone();
  const { t } = useLang();

  // tz is carried explicitly so a shared/bookmarked dated URL renders for the
  // intended timezone even before the tz cookie exists.
  function hrefFor(date: string | null): string {
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    params.set("tz", timeZone);
    return `/today?${params.toString()}`;
  }

  const arrowClasses =
    "flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-lg px-3 font-heading text-xs font-bold uppercase tracking-wide transition";

  return (
    <section aria-label="Matchday date navigation" className="mb-6">
      <div className="rounded-xl border border-white/10 bg-navyCard px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          {prevDate ? (
            <Link href={hrefFor(prevDate)} aria-label={t("today_prevDay")} className={`${arrowClasses} border border-white/15 text-white/80 hover:border-white/30 hover:text-white`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span className="hidden sm:inline">{t("today_prevDay")}</span>
            </Link>
          ) : (
            <span aria-disabled="true" className={`${arrowClasses} cursor-not-allowed border border-white/5 text-white/20`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span className="hidden sm:inline">{t("today_prevDay")}</span>
            </span>
          )}

          <div className="min-w-0 flex-1 text-center">
            <p className="truncate font-heading text-sm font-extrabold uppercase tracking-wide text-white sm:text-base">
              {formatLongDate(selectedDate)}
            </p>
            {isToday ? (
              <span className="mt-0.5 inline-block rounded bg-accent/20 px-2 py-0.5 font-heading text-[10px] font-bold uppercase tracking-widest text-accent">
                {t("today_jumpToToday")}
              </span>
            ) : (
              <Link
                href={hrefFor(null)}
                className="mt-0.5 inline-block rounded bg-white/5 px-2 py-0.5 font-heading text-[10px] font-bold uppercase tracking-widest text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                {t("today_jumpToToday")}
              </Link>
            )}
          </div>

          {nextDate ? (
            <Link href={hrefFor(nextDate)} aria-label={t("today_nextDay")} className={`${arrowClasses} border border-white/15 text-white/80 hover:border-white/30 hover:text-white`}>
              <span className="hidden sm:inline">{t("today_nextDay")}</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          ) : (
            <span aria-disabled="true" className={`${arrowClasses} cursor-not-allowed border border-white/5 text-white/20`}>
              <span className="hidden sm:inline">{t("today_nextDay")}</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                <path d="m9 18 6-6-6-6" />
              </svg>
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

/** Deterministic UTC-anchored long date label (no runtime-timezone dependence). */
function formatLongDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
