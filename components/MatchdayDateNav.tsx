"use client";

import Link, { useLinkStatus } from "next/link";
import { useEffect, useState } from "react";
import { useTimezone } from "@/components/TimezoneProvider";
import { useLang } from "@/components/LanguageProvider";

/**
 * Matchday date navigator for /today.
 *
 * Renders a prominent selected-date heading plus Previous-day / Today /
 * Next-day controls. All targets are real Next.js <Link>s carrying the viewer's
 * timezone, producing shareable, back/forward-compatible `?date=YYYY-MM-DD`
 * URLs, and they prefetch the adjacent dates.
 *
 * Critically, a `?date=` change is a *same-route* navigation, which the App
 * Router commits without showing `loading.tsx` — so on a slow dated render the
 * tap previously looked dead. This component therefore provides its own
 * immediate client feedback: the tapped control shows a spinner (via
 * useLinkStatus, which goes pending synchronously on tap) and the date heading
 * updates optimistically, so the button never appears unresponsive while the
 * server response is in flight.
 */

const arrowClasses =
  "flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-lg px-3 font-heading text-xs font-bold uppercase tracking-wide transition";

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden role="img">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Chevron({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
      <path d={direction === "prev" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  );
}

/** Icon that flips to a spinner while *its own* Link navigation is pending. */
function ArrowIcon({ direction }: { direction: "prev" | "next" }) {
  const { pending } = useLinkStatus();
  return pending ? <Spinner /> : <Chevron direction={direction} />;
}

function DateNavLink({
  href,
  label,
  direction,
  onActivate,
}: {
  href: string;
  label: string;
  direction: "prev" | "next";
  onActivate: () => void;
}) {
  const labelSpan = <span className="hidden sm:inline">{label}</span>;
  const icon = <ArrowIcon direction={direction} />;
  return (
    <Link
      href={href}
      aria-label={label}
      onClick={onActivate}
      className={`${arrowClasses} border border-white/15 text-white/80 hover:border-white/30 hover:text-white active:bg-white/10`}
    >
      {direction === "prev" ? <>{icon}{labelSpan}</> : <>{labelSpan}{icon}</>}
    </Link>
  );
}

function DisabledArrow({ label, direction }: { label: string; direction: "prev" | "next" }) {
  return (
    <span aria-disabled="true" className={`${arrowClasses} cursor-not-allowed border border-white/5 text-white/20`}>
      {direction === "prev" ? <><Chevron direction="prev" /><span className="hidden sm:inline">{label}</span></> : <><span className="hidden sm:inline">{label}</span><Chevron direction="next" /></>}
    </span>
  );
}

export function MatchdayDateNav({
  selectedDate,
  todayDate,
  prevDate,
  nextDate,
}: {
  selectedDate: string;
  todayDate: string;
  /** Accepted for API stability; the badge now derives from the displayed date. */
  isToday?: boolean;
  prevDate: string | null;
  nextDate: string | null;
}) {
  const { timeZone } = useTimezone();
  const { t } = useLang();

  // Optimistic date: set the instant a control is tapped so the heading reacts
  // immediately, then cleared once the server render of the new date arrives
  // (selectedDate prop changes).
  const [optimisticDate, setOptimisticDate] = useState<string | null>(null);
  useEffect(() => {
    setOptimisticDate(null);
  }, [selectedDate]);

  const displayDate = optimisticDate ?? selectedDate;
  const pending = optimisticDate !== null && optimisticDate !== selectedDate;

  // tz is carried explicitly so a shared/bookmarked dated URL renders for the
  // intended timezone even before the tz cookie exists.
  function hrefFor(date: string | null): string {
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    params.set("tz", timeZone);
    return `/today?${params.toString()}`;
  }

  return (
    <section aria-label="Matchday date navigation" data-pending={pending ? "true" : undefined} className="mb-6">
      <div className="rounded-xl border border-white/10 bg-navyCard px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          {prevDate ? (
            <DateNavLink href={hrefFor(prevDate)} label={t("today_prevDay")} direction="prev" onActivate={() => setOptimisticDate(prevDate)} />
          ) : (
            <DisabledArrow label={t("today_prevDay")} direction="prev" />
          )}

          <div className={`min-w-0 flex-1 text-center transition-opacity ${pending ? "opacity-60" : "opacity-100"}`} aria-busy={pending ? "true" : undefined}>
            <p className="truncate font-heading text-sm font-extrabold uppercase tracking-wide text-white sm:text-base">
              {formatLongDate(displayDate)}
            </p>
            {displayDate === todayDate ? (
              <span className="mt-0.5 inline-block rounded bg-accent/20 px-2 py-0.5 font-heading text-[10px] font-bold uppercase tracking-widest text-accent">
                {t("today_jumpToToday")}
              </span>
            ) : (
              <Link
                href={hrefFor(null)}
                onClick={() => setOptimisticDate(todayDate)}
                className="mt-0.5 inline-block rounded bg-white/5 px-2 py-0.5 font-heading text-[10px] font-bold uppercase tracking-widest text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                {t("today_jumpToToday")}
              </Link>
            )}
          </div>

          {nextDate ? (
            <DateNavLink href={hrefFor(nextDate)} label={t("today_nextDay")} direction="next" onActivate={() => setOptimisticDate(nextDate)} />
          ) : (
            <DisabledArrow label={t("today_nextDay")} direction="next" />
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
