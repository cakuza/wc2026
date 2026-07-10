"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { countryName } from "@/lib/i18n";
import type { TeamStatLeaderboards } from "@/lib/tournamentStats";

interface Props {
  teamsList: { key: string; name: string }[];
  teamStatLeaderboards: TeamStatLeaderboards;
}

export function TeamCompareClient({ teamsList, teamStatLeaderboards }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [t1, setT1] = useState(searchParams?.get("team1") || "");
  const [t2, setT2] = useState(searchParams?.get("team2") || "");

  useEffect(() => {
    const p1 = searchParams?.get("team1") || "";
    const p2 = searchParams?.get("team2") || "";
    if (p1 !== t1) setT1(p1);
    if (p2 !== t2) setT2(p2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSelect = (which: 1 | 2, val: string) => {
    if (which === 1) setT1(val);
    else setT2(val);
    
    const url = new URL(window.location.href);
    if (which === 1 && val) url.searchParams.set("team1", val);
    else if (which === 1) url.searchParams.delete("team1");

    if (which === 2 && val) url.searchParams.set("team2", val);
    else if (which === 2) url.searchParams.delete("team2");

    router.replace(url.pathname + url.search);
  };

  const getStat = (list: any[], team: string) => {
    const row = list.find((r) => r.teamKey === team);
    return row ? row.value : "Unavailable";
  };

  const metrics = [
    { label: "Goals Conceded", list: teamStatLeaderboards.goalsConceded },
    { label: "Clean Sheets", list: teamStatLeaderboards.cleanSheets },
    { label: "Shots", list: teamStatLeaderboards.shots },
    { label: "Shots on Target", list: teamStatLeaderboards.shotsOnTarget },
    { label: "Possession (%)", list: teamStatLeaderboards.possession },
    { label: "Corners", list: teamStatLeaderboards.corners },
    { label: "Offsides", list: teamStatLeaderboards.offsides },
    { label: "Saves", list: teamStatLeaderboards.saves },
    { label: "Fouls", list: teamStatLeaderboards.fouls },
    { label: "Substitutions", list: teamStatLeaderboards.substitutions },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Team 1</label>
          <select
            className="w-full rounded-lg bg-navyCard border border-white/10 px-4 py-3 text-white focus:border-accent outline-none"
            value={t1}
            onChange={(e) => handleSelect(1, e.target.value)}
          >
            <option value="">Select Team...</option>
            {teamsList.map((t) => (
              <option key={t.key} value={t.key}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Team 2</label>
          <select
            className="w-full rounded-lg bg-navyCard border border-white/10 px-4 py-3 text-white focus:border-accent outline-none"
            value={t2}
            onChange={(e) => handleSelect(2, e.target.value)}
          >
            <option value="">Select Team...</option>
            {teamsList.map((t) => (
              <option key={t.key} value={t.key}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {t1 && t2 ? (
        <div className="rounded-xl border border-white/10 bg-navyCard overflow-hidden">
          <div className="grid grid-cols-3 border-b border-white/10 bg-navy/50 px-4 py-3 text-center items-center">
            <p className="font-heading text-sm font-bold text-white truncate px-2">{countryName(t1, "en") || t1}</p>
            <p className="font-heading text-[10px] font-extrabold uppercase tracking-widest text-white/30">VS</p>
            <p className="font-heading text-sm font-bold text-white truncate px-2">{countryName(t2, "en") || t2}</p>
          </div>
          <ul className="divide-y divide-white/5">
            {metrics.map((m) => {
              const val1 = getStat(m.list, t1);
              const val2 = getStat(m.list, t2);
              const isNum1 = typeof val1 === "number";
              const isNum2 = typeof val2 === "number";

              let color1 = "text-white";
              let color2 = "text-white";

              // Simple comparison coloring logic (higher is better, except for goals conceded/fouls)
              if (isNum1 && isNum2 && val1 !== val2) {
                const reverse = m.label === "Goals Conceded" || m.label === "Fouls";
                if (val1 > val2) {
                  color1 = reverse ? "text-red-400" : "text-accent";
                } else {
                  color2 = reverse ? "text-red-400" : "text-accent";
                }
              }

              return (
                <li key={m.label} className="grid grid-cols-3 px-4 py-4 text-center items-center hover:bg-white/5">
                  <span className={`font-heading text-base font-extrabold ${color1}`}>
                    {val1}
                  </span>
                  <span className="font-heading text-[10px] font-bold uppercase tracking-widest text-white/50">
                    {m.label}
                  </span>
                  <span className={`font-heading text-base font-extrabold ${color2}`}>
                    {val2}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/20 p-12 text-center text-white/30 text-sm">
          Select two teams to view head-to-head tournament statistics.
        </div>
      )}
    </div>
  );
}
