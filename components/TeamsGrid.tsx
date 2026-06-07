"use client";

import { useMemo, useState } from "react";
import { TeamCard } from "@/components/TeamCard";
import { useLang } from "@/components/LanguageProvider";
import { GROUP_LETTERS, TEAMS } from "@/lib/teams";

export function TeamsGrid({ showHeading = false }: { showHeading?: boolean }) {
  const { t, country } = useLang();
  const [group, setGroup] = useState<string>("all");
  const [query, setQuery] = useState("");

  // Only show group tabs that actually contain teams.
  const groupsWithTeams = GROUP_LETTERS.filter((g) => TEAMS.some((tm) => tm.group === g));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TEAMS.filter((tm) => {
      const inGroup = group === "all" || tm.group === group;
      const name = country(tm.key).toLowerCase();
      const matches = !q || name.includes(q) || tm.key.toLowerCase().includes(q);
      return inGroup && matches;
    });
  }, [group, query, country]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      {showHeading ? (
        <h2 className="mb-5 font-heading text-3xl font-extrabold uppercase tracking-wide text-white">{t("sec_allTeams")}</h2>
      ) : null}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setGroup("all")}
            className={`rounded px-3 py-1.5 font-heading text-sm font-bold uppercase tracking-wide transition ${
              group === "all" ? "bg-accent text-white" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            {t("flt_allGroups")}
          </button>
          {groupsWithTeams.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGroup(g)}
              className={`rounded px-3 py-1.5 font-heading text-sm font-bold uppercase tracking-wide transition ${
                group === g ? "bg-accent text-white" : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              {t("lbl_group")} {g}
            </button>
          ))}
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search_ph")}
          className="w-full rounded-lg border border-white/10 bg-navyCard px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-accent focus:outline-none lg:w-72"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((tm) => (
          <TeamCard key={tm.key} team={tm} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-white/50">—</p>
      ) : null}
    </section>
  );
}
