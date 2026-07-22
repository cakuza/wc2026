"use client";

import Link from "next/link";
import { Flag } from "@/components/Flag";
import { useLang } from "@/components/LanguageProvider";
import { slugFor, teamByKey } from "@/lib/teams";
import type { ThirdPlaceRow } from "@/lib/thirdPlaceRanking";
import { getThirdPlaceLegendCopy } from "@/lib/thirdPlaceCopy";

const COLS = ["P", "W", "D", "L", "GF", "GA", "GD"] as const;

type ColKey = (typeof COLS)[number];

function colValue(col: ColKey, row: ThirdPlaceRow): number {
  switch (col) {
    case "P": return row.played;
    case "W": return row.wins;
    case "D": return row.draws;
    case "L": return row.losses;
    case "GF": return row.goalsFor;
    case "GA": return row.goalsAgainst;
    case "GD": return row.goalDifference;
  }
}

function fmtGD(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}

interface ThirdPlaceTableProps {
  rows: ThirdPlaceRow[];
}

export function ThirdPlaceTable({ rows }: ThirdPlaceTableProps) {
  const { t, country } = useLang();
  const legend = getThirdPlaceLegendCopy(rows);
  const statusText = (status: ThirdPlaceRow["status"]) => {
    if (status === "not_started") return "Not started";
    if (status === "qualifying") return "Qualified for Round of 32";
    if (status === "outside") return "Did not qualify";
    if (status === "boundary") return "Tied final position";
    return "Tied final position";
  };
  const statusClass = (status: ThirdPlaceRow["status"]) => {
    if (status === "not_started") return "bg-surface-subtle text-faint";
    if (status === "qualifying") return "bg-green-500/15 text-green-400";
    if (status === "outside") return "bg-red-500/10 text-red-400/80";
    return "bg-amber-500/15 text-amber-300";
  };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wider text-faint">
              <th className="px-3 py-3 text-start font-semibold">#</th>
              <th className="px-2 py-3 text-start font-semibold" />
              <th className="px-2 py-3 text-center font-semibold">{t("lbl_group")}</th>
              {COLS.map((c) => (
                <th key={c} className="px-2 py-3 text-center font-semibold">
                  {c}
                </th>
              ))}
              <th className="px-3 py-3 text-center font-semibold text-muted">{t("lbl_pts")}</th>
              <th className="px-3 py-3 text-start font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const team = teamByKey(row.teamKey);
              const isQualifying = row.status === "qualifying";
              return (
                <tr
                  key={row.teamKey}
                  className={`border-t border-line transition hover:bg-hover ${
                    isQualifying ? "bg-green-500/5" : ""
                  } ${row.rank === 8 && row.status !== "not_started" ? "border-b-2 border-b-accent/40" : ""}`}
                >
                  {/* Rank */}
                  <td
                    className="px-3 py-3 font-heading font-bold text-faint"
                    style={{ borderLeft: `3px solid ${isQualifying ? "#22c55e" : "#ef4444"}` }}
                  >
                    {row.rankLabel ?? row.rank}
                  </td>

                  {/* Flag + name */}
                  <td className="px-2 py-3">
                    {team ? (
                      <Link href={`/teams/${slugFor(team.key)}`} prefetch={false} className="group flex items-center gap-2">
                        <Flag code={team.code} alt="" width={24} height={18} />
                        <span className="font-semibold text-ink transition group-hover:text-accent">
                          {country(row.teamKey)}
                        </span>
                      </Link>
                    ) : (
                      <span className="font-semibold text-ink">{country(row.teamKey)}</span>
                    )}
                  </td>

                  {/* Group */}
                  <td className="px-2 py-3 text-center font-heading font-bold text-muted">
                    {row.group}
                  </td>

                  {/* Stat columns */}
                  {COLS.map((c) => {
                    const val = colValue(c, row);
                    const display = c === "GD" ? fmtGD(val) : String(val);
                    const isHighlight = c === "GD" && val !== 0;
                    return (
                      <td
                        key={c}
                        className={`px-2 py-3 text-center tabular-nums ${
                          isHighlight
                            ? val > 0
                              ? "font-semibold text-green-400"
                              : "font-semibold text-red-400"
                            : "text-muted"
                        }`}
                      >
                        {display}
                      </td>
                    );
                  })}

                  {/* Points */}
                  <td className="px-3 py-3 text-center font-heading font-bold tabular-nums text-ink">
                    {row.points}
                  </td>

                  {/* Status */}
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 font-heading text-[10px] font-bold uppercase tracking-wider ${
                        statusClass(row.status)
                      }`}
                    >
                      {statusText(row.status)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="space-y-1.5 border-t border-line bg-canvas/60 px-4 py-3">
        <div className="flex items-start gap-2 text-xs text-muted">
          <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-green-500" aria-hidden="true" />
          <span>{legend.primary}</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-muted">
          <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500/70" aria-hidden="true" />
          <span>{legend.secondary}</span>
        </div>
      </div>
    </div>
  );
}
