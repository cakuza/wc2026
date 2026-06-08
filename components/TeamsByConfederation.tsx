"use client";

import Link from "next/link";
import { Flag } from "@/components/Flag";
import { useLang } from "@/components/LanguageProvider";
import { TEAMS, slugFor } from "@/lib/teams";
import { CONFEDERATIONS, CONFEDERATION_BY_TEAM } from "@/lib/confederations";

// Single shared grouping of the canonical 48 TEAMS by confederation. Used on /teams, the
// /world-cup-2026-teams-by-confederation explainer, and (compact) the homepage. Team names
// localize via useLang; links point at each team's existing page. No separate team list.

function useSections() {
  return CONFEDERATIONS.map((conf) => ({
    conf,
    teams: TEAMS.filter((tm) => CONFEDERATION_BY_TEAM[tm.key] === conf.code),
  })).filter((s) => s.teams.length > 0);
}

/** Compact homepage preview: localized heading, grouped chips, and a link to /teams. */
export function TeamsByConfederationPreview() {
  const { t, country } = useLang();
  const sections = useSections();
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-5 flex items-end justify-between gap-3">
        <h2 className="font-heading text-3xl font-extrabold uppercase tracking-wide text-white">
          {t("sec_teamsByConfederation")}
        </h2>
        <Link
          href="/teams"
          className="shrink-0 font-heading text-xs font-bold uppercase tracking-wide text-accent transition hover:text-white"
        >
          {t("nav_teams")} →
        </Link>
      </div>
      <div className="space-y-5">
        {sections.map(({ conf, teams }) => (
          <div key={conf.code}>
            <div className="mb-2">
              <p className="font-heading text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/50">
                {conf.name} · {teams.length}
              </p>
              <p className="text-[10px] leading-tight text-white/35">
                {t(`conf_full_${conf.code}`)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {teams.map((tm) => {
                const name = country(tm.key);
                return (
                  <Link
                    key={tm.key}
                    href={`/teams/${slugFor(tm.key)}`}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-navyCard px-3 py-1.5 text-sm transition hover:border-white/25 hover:bg-white/5"
                  >
                    <Flag code={tm.code} name={name} width={22} height={16} />
                    <span className="font-semibold text-white">{name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Full grouped list: one section per confederation, each team linking to its page. */
export function TeamsByConfederation() {
  const { t, country } = useLang();
  const sections = useSections();
  return (
    <div className="space-y-6">
      {sections.map(({ conf, teams }) => (
        <section key={conf.code}>
          <h2 className="mb-1 border-b-2 border-accent pb-2">
            <span className="flex items-baseline gap-2">
              <span className="font-heading text-xl font-extrabold uppercase tracking-wide text-white">
                {conf.name}
              </span>
              <span className="font-heading text-xs font-bold uppercase tracking-widest text-white/40">
                · {teams.length}
              </span>
            </span>
            <span className="mt-0.5 block text-xs font-medium leading-snug text-white/40">
              {t(`conf_full_${conf.code}`)}
            </span>
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {teams.map((tm) => {
              const name = country(tm.key);
              return (
                <Link
                  key={tm.key}
                  href={`/teams/${slugFor(tm.key)}`}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-navyCard px-4 py-2.5 transition hover:border-white/20 hover:bg-white/5"
                >
                  <Flag code={tm.code} name={name} width={28} height={20} />
                  <span className="flex-1 truncate font-semibold text-white">{name}</span>
                  <span className="font-heading text-[11px] font-bold uppercase tracking-widest text-white/40">
                    {t("lbl_group")} {tm.group}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
