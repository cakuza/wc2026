"use client";

import { Flag } from "@/components/Flag";
import { useLang } from "@/components/LanguageProvider";
import { STRIP_GROUPS, teamsInGroup } from "@/lib/teams";

export function GroupStandingsStrip() {
  const { t, country } = useLang();

  return (
    <section className="border-y border-white/10 bg-navyCard">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="font-heading text-2xl font-extrabold uppercase tracking-wide text-white">{t("sec_groupStandings")}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STRIP_GROUPS.map((g) => (
            <div key={g} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-heading text-lg font-extrabold uppercase text-white">
                  {t("lbl_group")} {g}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-white/55">{t("lbl_pts")}</span>
              </div>
              <ul className="space-y-1">
                {teamsInGroup(g).map((team) => (
                  <li key={team.key} className="flex items-center gap-2 rounded px-1 py-1.5">
                    <Flag code={team.code} alt="" width={26} height={19} className="rounded-sm" />
                    <span className="flex-1 truncate text-sm font-semibold text-white">{country(team.key)}</span>
                    <span className="font-heading text-sm font-bold tabular-nums text-white/70">0</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
