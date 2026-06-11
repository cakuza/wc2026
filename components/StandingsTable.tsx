"use client";

import Link from "next/link";
import { Flag } from "@/components/Flag";
import { useLang } from "@/components/LanguageProvider";
import { slugFor, type Team } from "@/lib/teams";

const COLS = ["P", "W", "D", "L", "GF", "GA", "GD"];

/** Left-border colour per rank position. */
function zoneColor(rank: number): string {
  if (rank <= 2) return "#22c55e"; // auto-qualify
  if (rank === 3) return "#f59e0b"; // potential 3rd
  return "#ef4444";                 // eliminated
}

interface StandingsTableProps {
  teams: Team[];
  /** When set, that team's row gets a primary-colour tint + accent name. */
  currentTeamKey?: string;
  /** Render the qualification legend below the table. */
  showQualInfo?: boolean;
}

/**
 * Premium standings table — shared between TeamDetail and GroupsPage.
 * Renders: zone bar · table · optional qualification info legend.
 * The caller is responsible for the outer rounded card container.
 */
export function StandingsTable({
  teams,
  currentTeamKey,
  showQualInfo = false,
}: StandingsTableProps) {
  const { t, country } = useLang();

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
            {teams.map((gt, idx) => {
              const rank = idx + 1;
              const isCurrent = gt.key === currentTeamKey;
              const zc = zoneColor(rank);
              return (
                <tr
                  key={gt.key}
                  className="border-t border-white/5 transition hover:bg-white/5"
                  style={
                    isCurrent
                      ? { backgroundColor: `${gt.primaryColor}22` }
                      : undefined
                  }
                >
                  {/* Rank — carries the coloured left border */}
                  <td
                    className="px-3 py-3 font-heading font-bold text-white/50"
                    style={{ borderLeft: `3px solid ${zc}` }}
                  >
                    {rank}
                  </td>

                  {/* Flag + name (always a link to team page) */}
                  <td className="px-2 py-3">
                    <Link
                      href={`/teams/${slugFor(gt.key)}`}
                      className="group flex items-center gap-2"
                    >
                      <Flag
                        code={gt.code}
                        alt=""
                        width={24}
                        height={18}
                      />
                      <span
                        className={`font-semibold transition ${
                          isCurrent
                            ? "text-accent"
                            : "text-white group-hover:text-accent"
                        }`}
                      >
                        {country(gt.key)}
                      </span>
                    </Link>
                  </td>

                  {/* Stat columns — all zeroed until live data arrives */}
                  {COLS.map((c) => (
                    <td
                      key={c}
                      className="px-2 py-3 text-center tabular-nums text-white/60"
                    >
                      0
                    </td>
                  ))}

                  {/* Points */}
                  <td className="px-3 py-3 text-center font-heading font-bold tabular-nums text-white">
                    0
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
