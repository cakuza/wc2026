"use client";

import Link from "next/link";
import { Flag } from "@/components/Flag";
import { useLang } from "@/components/LanguageProvider";
import { slugFor, type Team } from "@/lib/teams";
import type { StandingRow } from "@/lib/groupStandings";

const COLS = ["P", "W", "D", "L", "GF", "GA", "GD"] as const;

type ColKey = (typeof COLS)[number];

function colValue(col: ColKey, row: StandingRow): number {
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

function zoneColor(rank: number): string {
  if (rank <= 2) return "#22c55e";
  if (rank === 3) return "#f59e0b";
  return "#ef4444";
}

interface StandingsTableProps {
  teams: Team[];
  /** Sorted standings rows with live data. When provided, display real stats and order. */
  rows?: StandingRow[];
  currentTeamKey?: string;
  showQualInfo?: boolean;
}

export function StandingsTable({
  teams,
  rows,
  currentTeamKey,
  showQualInfo = false,
}: StandingsTableProps) {
  const { t, country } = useLang();

  // Build display list: if rows provided, use their order; otherwise keep teams order.
  type Entry = { team: Team; row: StandingRow | null };
  const entries: Entry[] = rows
    ? rows
        .map((row) => ({ team: teams.find((t) => t.key === row.teamKey)!, row }))
        .filter((e) => e.team !== undefined)
    : teams.map((team) => ({ team, row: null }));

  return (
    <>
      {/* ── Qualification zone bar ───────────────────────────────────────── */}
      <div className="flex h-1" aria-hidden="true">
        <div className="flex-1" style={{ background: "#22c55e" }} />
        <div className="flex-1" style={{ background: "#22c55e" }} />
        <div className="flex-1" style={{ background: "#f59e0b" }} />
        <div className="flex-1" style={{ background: "#ef4444" }} />
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[460px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-white/40">
              <th className="px-3 py-3 text-start font-semibold">#</th>
              <th className="px-2 py-3 text-start font-semibold" />
              {COLS.map((c) => (
                <th key={c} className="px-2 py-3 text-center font-semibold">
                  {c}
                </th>
              ))}
              <th className="px-3 py-3 text-center font-semibold text-white/70">
                {t("lbl_pts")}
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map(({ team, row }, idx) => {
              const rank = row?.rank ?? idx + 1;
              const isCurrent = team.key === currentTeamKey;
              const zc = zoneColor(rank);
              return (
                <tr
                  key={team.key}
                  className="border-t border-white/5 transition hover:bg-white/5"
                  style={isCurrent ? { backgroundColor: `${team.primaryColor}22` } : undefined}
                >
                  {/* Rank */}
                  <td
                    className="px-3 py-3 font-heading font-bold text-white/50"
                    style={{ borderLeft: `3px solid ${zc}` }}
                  >
                    {row?.rankLabel ?? rank}
                  </td>

                  {/* Flag + name */}
                  <td className="px-2 py-3">
                    <Link
                      href={`/teams/${slugFor(team.key)}`}
                      prefetch={false}
                      className="group flex items-center gap-2"
                    >
                      <Flag code={team.code} alt="" width={24} height={18} />
                      <span
                        className={`font-semibold transition ${
                          isCurrent
                            ? "text-accent"
                            : "text-white group-hover:text-accent"
                        }`}
                      >
                        {country(team.key)}
                      </span>
                    </Link>
                  </td>

                  {/* Stat columns */}
                  {COLS.map((c) => {
                    const val = row ? colValue(c, row) : 0;
                    const display = c === "GD" ? fmtGD(val) : String(val);
                    const isHighlight = c === "GD" && row && val !== 0;
                    return (
                      <td
                        key={c}
                        className={`px-2 py-3 text-center tabular-nums ${
                          isHighlight
                            ? val > 0
                              ? "font-semibold text-green-400"
                              : "font-semibold text-red-400"
                            : "text-white/60"
                        }`}
                      >
                        {display}
                      </td>
                    );
                  })}

                  {/* Points */}
                  <td className="px-3 py-3 text-center font-heading font-bold tabular-nums text-white">
                    {row ? row.points : 0}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Qualification legend ─────────────────────────────────────────── */}
      {showQualInfo && (
        <div className="space-y-1.5 border-t border-white/5 bg-navy/60 px-4 py-3">
          <div className="flex items-start gap-2 text-xs text-white/55">
            <span
              className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
              style={{ background: "#22c55e" }}
              aria-hidden="true"
            />
            <span>{t("qual_info_top2")}</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-white/55">
            <span
              className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
              style={{ background: "#f59e0b" }}
              aria-hidden="true"
            />
            <span>{t("qual_info_3rd")}</span>
          </div>
        </div>
      )}
    </>
  );
}
