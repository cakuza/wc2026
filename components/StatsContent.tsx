"use client";

import { useLang } from "@/components/LanguageProvider";

// ── 2026 live stat placeholders ──────────────────────────────────────────────

const LIVE_STATS = [
  { key: "stats_top_scorers",    icon: "⚽" },
  { key: "stats_most_assists",   icon: "🎯" },
  { key: "stats_yellow_cards",   icon: "🟨" },
  { key: "stats_clean_sheets",   icon: "🧤" },
  { key: "stats_goals_per_game", icon: "📈" },
];

export default function StatsContent() {
  const { t, country } = useLang();

  const ALL_TIME_RECORDS = [
    { key: "stats_most_titles",      value: "5",                                    detail: country("brazil"),             sub: "1958, 1962, 1970, 1994, 2002",  icon: "🏆" },
    { key: "stats_top_scorer",       value: `16 ${t("stats_unit_goals")}`,          detail: "Miroslav Klose",              sub: t("stats_detail_klose"),          icon: "⚽" },
    { key: "stats_fastest_goal",     value: `11 ${t("stats_unit_sec")}`,            detail: "Hakan Şükür",                 sub: t("stats_detail_sukur"),          icon: "⚡" },
    { key: "stats_most_appearances", value: `26 ${t("stats_unit_matches")}`,        detail: "Lionel Messi",                sub: t("stats_detail_messi"),          icon: "👤" },
    { key: "stats_biggest_win",      value: "10–1",                                 detail: t("stats_detail_biggest_win"), sub: t("stats_sub_biggest_win"),       icon: "📊" },
    { key: "stats_most_finals",      value: "8",                                    detail: t("stats_detail_most_finals"), sub: t("stats_sub_most_finals"),       icon: "🥈" },
    { key: "stats_youngest_scorer",  value: `17 ${t("stats_unit_years")}`,          detail: "Pelé",                        sub: t("stats_detail_pele"),           icon: "🌟" },
    { key: "stats_host_nations",     value: "6",                                    detail: t("stats_detail_hosts_1"),     sub: t("stats_sub_hosts"),             icon: "🏟️" },
    { key: "stats_format",           value: `48 ${t("stats_unit_teams")}`,          detail: t("stats_detail_format"),      sub: t("stats_sub_format"),            icon: "🆕" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* ── Page header ── */}
      <div className="mb-8">
        <p className="font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">
          FIFA World Cup 2026
        </p>
        <h1 className="mt-1 font-heading text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">
          {t("stats_page_title")}
        </h1>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION A — World Cup All-Time Records
      ══════════════════════════════════════════════════════════════════ */}
      <section className="mb-12">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-heading text-lg font-extrabold uppercase tracking-widest text-white">
            {t("stats_all_time_header")}
          </h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_TIME_RECORDS.map((rec) => (
            <div
              key={rec.key}
              className="flex gap-4 rounded-xl border border-white/10 bg-navyCard p-5"
            >
              {/* Icon */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-2xl">
                {rec.icon}
              </div>

              {/* Text */}
              <div className="min-w-0">
                <p className="font-heading text-xs font-bold uppercase tracking-widest text-white/50">
                  {t(rec.key)}
                </p>
                <p className="mt-0.5 font-heading text-2xl font-extrabold leading-none text-accent">
                  {rec.value}
                </p>
                <p className="mt-1 font-heading text-sm font-bold text-white">
                  {rec.detail}
                </p>
                <p className="mt-0.5 font-heading text-xs text-white/50">
                  {rec.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION B — 2026 Tournament Stats
      ══════════════════════════════════════════════════════════════════ */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-heading text-lg font-extrabold uppercase tracking-widest text-white">
            {t("stats_tournament_header")}
          </h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {LIVE_STATS.map((stat) => (
            <div
              key={stat.key}
              className="relative overflow-hidden rounded-xl border border-white/10 bg-navyCard p-5"
            >
              {/* "Available from" badge */}
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/8 px-2.5 py-1 font-heading text-[10px] font-extrabold uppercase tracking-widest text-white/40">
                <span className="text-[10px] leading-none">🗓</span>
                {t("stats_available_from")}
              </span>

              {/* Icon + label */}
              <div className="mt-2 flex items-center gap-3">
                <span className="text-2xl opacity-30">{stat.icon}</span>
                <p className="font-heading text-sm font-bold uppercase tracking-wide text-white/30">
                  {t(stat.key)}
                </p>
              </div>

              {/* Greyed-out placeholder rows */}
              <div className="mt-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded bg-white/5 px-3 py-2"
                  >
                    <div className="h-2.5 w-24 rounded bg-white/10" />
                    <div className="h-2.5 w-8 rounded bg-white/10" />
                  </div>
                ))}
              </div>

              {/* Subtle diagonal overlay to reinforce "coming soon" */}
              <div
                className="pointer-events-none absolute inset-0 rounded-xl"
                style={{
                  background:
                    "repeating-linear-gradient(135deg,transparent,transparent 8px,rgba(255,255,255,0.015) 8px,rgba(255,255,255,0.015) 9px)",
                }}
              />
            </div>
          ))}
        </div>

        <p className="mt-4 font-heading text-xs font-bold uppercase tracking-widest text-white/30">
          {t("stats_pending_note")}
        </p>
      </section>
    </div>
  );
}
