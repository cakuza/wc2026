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

/** Compact homepage preview that points visitors to the complete team directory. */
export function TeamsByConfederationPreview() {
  const { t } = useLang();
  const sections = useSections();
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-5 flex items-end justify-between gap-3">
        <h2 className="font-heading text-3xl font-extrabold uppercase tracking-wide text-ink">
          {t("sec_teamsByConfederation")}
        </h2>
        <Link
          href="/teams"
          className="shrink-0 font-heading text-xs font-bold uppercase tracking-wide text-accent transition hover:text-ink"
        >
          {t("nav_teams")} →
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map(({ conf, teams }) => (
          <div key={conf.code} className="rounded-xl border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-heading text-xs font-extrabold uppercase tracking-[0.16em] text-ink">
                  {conf.name}
                </p>
                <p className="mt-1 text-xs leading-snug text-faint">{t(`conf_full_${conf.code}`)}</p>
              </div>
              <span className="shrink-0 rounded bg-accent/15 px-2 py-1 font-heading text-xs font-extrabold text-accent">
                {teams.length}
              </span>
            </div>
          </div>
        ))}
      </div>
      <Link
        href="/teams"
        className="mt-5 inline-flex rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-accent transition hover:border-accent hover:text-ink"
      >
        {t("nav_teams")} →
      </Link>
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
              <span className="font-heading text-xl font-extrabold uppercase tracking-wide text-ink">
                {conf.name}
              </span>
              <span className="font-heading text-xs font-bold uppercase tracking-widest text-faint">
                · {teams.length}
              </span>
            </span>
            <span className="mt-0.5 block text-xs font-medium leading-snug text-muted">
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
                  prefetch={false}
                  className="flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-2.5 transition hover:border-lineStrong hover:bg-hover"
                >
                  <Flag code={tm.code} alt="" width={28} height={20} />
                  <span className="flex-1 truncate font-semibold text-ink">{name}</span>
                  <span className="font-heading text-[11px] font-bold uppercase tracking-widest text-muted">
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
