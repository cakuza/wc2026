"use client";

import Link from "next/link";
import { Flag } from "@/components/Flag";
import { useLang } from "@/components/LanguageProvider";
import { MATCHES, matchSlug, matchUtcDate, type Match } from "@/lib/matches";

// Grouping/sorting is done from each match's absolute UTC instant in the target IANA timezone, so
// both the date bucket and the kickoff time reflect that zone (handling day rollovers, e.g. a late
// US night match falling on the next calendar day in Tokyo). Only the *display* of the date heading
// is localized to the active UI language — the date itself stays computed in the schedule's timezone.

// Stable, language-independent grouping key (always the target-zone calendar date).
function dateKey(d: Date, iana: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: iana,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

// Localized date heading in the target timezone, e.g. en-GB "Thursday 11 June",
// tr-TR "Perşembe 11 Haziran", ja-JP "6月11日木曜日".
function dateLabel(d: Date, iana: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: iana,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
}

// Kickoff time in the target timezone — numeric 24h with the zone abbreviation, language-neutral.
function timeLabel(d: Date, iana: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: iana,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).format(d);
}

type Row = { m: Match; num: number; time: string };
type DayGroup = { key: string; label: string; rows: Row[] };

export function TimezoneSchedule({ iana }: { iana: string }) {
  const { t, country, locale } = useLang();

  const sorted = [...MATCHES].sort(
    (a, b) => matchUtcDate(a).getTime() - matchUtcDate(b).getTime()
  );

  const groups: DayGroup[] = [];
  sorted.forEach((m, i) => {
    const d = matchUtcDate(m);
    const key = dateKey(d, iana);
    let g = groups.find((x) => x.key === key);
    if (!g) {
      g = { key, label: dateLabel(d, iana, locale), rows: [] };
      groups.push(g);
    }
    g.rows.push({ m, num: i + 1, time: timeLabel(d, iana) });
  });

  return (
    <div className="space-y-8">
      {groups.map((g) => (
        <section key={g.key}>
          <h2 className="mb-3 border-b-2 border-accent pb-2 font-heading text-xl font-extrabold uppercase tracking-wide text-white">
            {g.label}
          </h2>
          <div className="space-y-2">
            {g.rows.map(({ m, num, time }) => {
              const home = country(m.homeKey);
              const away = country(m.awayKey);
              return (
                <Link
                  key={`${g.key}-${num}`}
                  href={`/matches/${matchSlug(m)}`}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-navyCard px-3 py-3 transition hover:border-white/20 hover:bg-white/5 sm:px-4"
                >
                  <span className="w-6 shrink-0 text-center font-heading text-xs font-bold tabular-nums text-white/30">
                    {num}
                  </span>
                  <div className="flex flex-1 items-center justify-end gap-2 text-end">
                    <span className="truncate font-semibold text-white">{home}</span>
                    <Flag code={m.homeCode} name={home} width={28} height={20} />
                  </div>
                  <span className="shrink-0 rounded bg-navy px-2 py-1 font-heading text-[11px] font-bold uppercase text-white/50">
                    {t("vs")}
                  </span>
                  <div className="flex flex-1 items-center gap-2">
                    <Flag code={m.awayCode} name={away} width={28} height={20} />
                    <span className="truncate font-semibold text-white">{away}</span>
                  </div>
                  <div className="ms-2 hidden w-40 shrink-0 text-end text-xs text-white/55 sm:block">
                    <div className="font-semibold text-white/85">{time}</div>
                    <div className="text-white/45">
                      {m.group ? `${t("lbl_group")} ${m.group}` : ""}
                      {m.group && m.venue ? " · " : ""}
                      {m.venue ?? ""}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
