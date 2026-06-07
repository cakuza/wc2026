"use client";

import Link from "next/link";
import { Flag } from "@/components/Flag";
import { useLang } from "@/components/LanguageProvider";
import { slugFor, type Team } from "@/lib/teams";
import { firstMatchFor } from "@/lib/matches";

export function TeamCard({ team }: { team: Team }) {
  const { t, country, formatDate } = useLang();
  const firstMatch = firstMatchFor(team.key);

  return (
    <Link
      href={`/teams/${slugFor(team.key)}`}
      className="group flex flex-col rounded-xl border border-white/10 bg-navyCard p-4 transition hover:border-accent/60 hover:shadow-xl"
    >
      {/* Top row: large flag + group badge */}
      <div className="flex items-start justify-between">
        <Flag code={team.code} name={country(team.key)} width={56} height={40} className="shadow" />
        <span className="rounded bg-accent px-2 py-1 font-heading text-xs font-extrabold uppercase tracking-wide text-white">
          {t("lbl_group")} {team.group}
        </span>
      </div>

      {/* Country name */}
      <h3 className="mt-3 font-heading text-2xl font-extrabold uppercase leading-tight text-white">{country(team.key)}</h3>

      {/* First match */}
      <div className="mt-3 rounded-lg border border-white/5 bg-navy p-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">{t("lbl_firstMatch")}</p>
        <div className="mt-2 flex items-center gap-2">
          {firstMatch ? (
            <>
              <Flag code={firstMatch.opponentCode} name={country(firstMatch.opponentKey)} width={28} height={20} />
              <span className="truncate text-sm font-semibold text-white">{country(firstMatch.opponentKey)}</span>
            </>
          ) : (
            <span className="text-sm font-semibold text-white/50">{t("tbd")}</span>
          )}
        </div>
      </div>

      {/* Date + Match Center */}
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
        <span className="text-sm font-semibold text-white/70">{firstMatch ? formatDate(firstMatch.date) : ""}</span>
        <span className="font-heading text-sm font-bold uppercase tracking-wide text-accent transition group-hover:text-white">
          {t("btn_matchCenter")} →
        </span>
      </div>
    </Link>
  );
}
