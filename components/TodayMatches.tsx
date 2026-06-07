"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flag } from "@/components/Flag";
import { MatchTime } from "@/components/MatchTime";
import { useLang } from "@/components/LanguageProvider";
import { getDisplayMatchday, type Match } from "@/lib/matches";

function MatchRow({ m }: { m: Match }) {
  const { t, country } = useLang();
  return (
    <div className="rounded-lg border border-white/10 bg-navy px-3 py-2.5">
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <span className="min-w-0 truncate text-sm font-bold text-white">{country(m.homeKey)}</span>
          <Flag code={m.homeCode} name={country(m.homeKey)} width={28} height={20} />
        </div>
        <span className="shrink-0 px-1 font-heading text-[11px] font-bold uppercase text-white/40">{t("vs")}</span>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Flag code={m.awayCode} name={country(m.awayKey)} width={28} height={20} />
          <span className="min-w-0 truncate text-sm font-bold text-white">{country(m.awayKey)}</span>
        </div>
      </div>
      <div className="mt-1.5 flex items-center justify-center gap-2 text-[11px] text-white/50">
        <MatchTime match={m} className="font-semibold text-white/75" />
        {m.time && m.venue ? <span className="opacity-50">·</span> : null}
        {m.venue ? <span className="truncate">{m.venue}</span> : null}
      </div>
    </div>
  );
}

export function TodayMatches() {
  const { t, formatDate } = useLang();
  // Computed in an effect so the chosen matchday always reflects the *client's* current date
  // (avoids any server/client date drift), while the initial value keeps SSR stable.
  const [md, setMd] = useState(() => getDisplayMatchday());
  useEffect(() => {
    setMd(getDisplayMatchday());
  }, []);

  const dateLabel = md.days
    ? `${formatDate(md.days[0].date)} – ${formatDate(md.days[md.days.length - 1].date)}`
    : formatDate(md.date);

  return (
    <div className="rounded-xl border border-white/10 bg-navyCard p-5 shadow-2xl sm:p-6">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-heading text-sm font-extrabold uppercase tracking-[0.2em] text-accent">{t(md.labelKey)}</p>
        <span className="font-heading text-xs font-bold uppercase tracking-wide text-white/50">{dateLabel}</span>
      </div>
      <p className="mb-4 text-[11px] leading-snug text-white/35">{t("today_intro")}</p>

      {/* Multi-day mode: group matches under date subheaders — fully expanded, no scroll */}
      {md.days ? (
        <div className="space-y-4">
          {md.days.map(({ date, matches }) => (
            <div key={date}>
              <p className="mb-2 font-heading text-[11px] font-bold uppercase tracking-widest text-white/40">
                {formatDate(date)}
              </p>
              <div className="space-y-2">
                {matches.map((m, i) => (
                  <MatchRow key={`${date}-${i}`} m={m} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Single-day mode */
        <div className="space-y-2">
          {md.matches.map((m, i) => (
            <MatchRow key={i} m={m} />
          ))}
        </div>
      )}

      <Link
        href="/today"
        className="mt-4 block text-center font-heading text-xs font-bold uppercase tracking-wide text-accent transition hover:text-white"
      >
        {t("nav_today")} →
      </Link>
    </div>
  );
}
