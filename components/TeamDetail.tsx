"use client";

import Link from "next/link";
import { Flag } from "@/components/Flag";
import { useLang } from "@/components/LanguageProvider";
import { slugFor, type Team } from "@/lib/teams";
import type { Match } from "@/lib/matches";
import { matchSlug } from "@/lib/matches";
import { squadByPosition } from "@/lib/squads";
import { StandingsTable } from "@/components/StandingsTable";

function formatSquadValue(millions: number): string {
  return millions >= 1000 ? `€${(millions / 1000).toFixed(2)}B` : `€${millions}M`;
}

/** R32 opponent group per group — from the official WC 2026 bracket. */
const R32_OPPONENT_GROUP: Record<string, string> = {
  A: "B", B: "A", C: "D", D: "C",
  E: "F", F: "E", G: "H", H: "G",
  I: "J", J: "I", K: "L", L: "K",
};

/** Template fill helper */
function fill(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replaceAll(`{${k}}`, v),
    template,
  );
}

export function TeamDetail({
  team,
  groupTeams,
  groupMatches,
}: {
  team: Team;
  groupTeams: Team[];
  groupMatches: Match[];
}) {
  const { t, country, formatDate } = useLang();
  const squad = squadByPosition(team.key);
  const opponentGroup = R32_OPPONENT_GROUP[team.group] ?? "";

  // This team's 3 matches, sorted by date (MD1 → MD2 → MD3).
  const teamMatches = groupMatches
    .filter((m) => m.homeKey === team.key || m.awayKey === team.key)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/teams"
        className="font-heading text-sm font-bold uppercase tracking-wide text-white/50 transition hover:text-accent"
      >
        ← {t("lbl_backTeams")}
      </Link>

      {/* ── COUNTRY ROAD HERO ───────────────────────────────────────────── */}
      <div className="relative mt-4 h-[380px] overflow-hidden rounded-2xl sm:h-[420px]">
        {/* Flag background — slightly zoomed so it fills edge-to-edge */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(https://flagcdn.com/w320/${team.code}.png)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: "scale(1.1)",
            transformOrigin: "center",
            opacity: 0.7,
          }}
          aria-hidden="true"
        />

        {/* Radial vignette — darkens edges */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 55% 35%, rgba(0,0,0,0) 25%, rgba(0,0,0,0.5) 100%)",
          }}
          aria-hidden="true"
        />

        {/* Linear fade — bottom 60% fades to near-navy */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,22,40,0.08) 0%, rgba(10,22,40,0.55) 40%, rgba(10,22,40,0.92) 68%, #0a1628 100%)",
          }}
          aria-hidden="true"
        />

        {/* Hero content — anchored bottom-left / bottom-right */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-6 pb-6 sm:px-8 sm:pb-7">
          <div>
            <p className="mb-1 font-heading text-[11px] font-extrabold uppercase tracking-[0.28em] text-accent">
              {t("team_road_to")}
            </p>
            <h1 className="font-heading text-[60px] font-black uppercase leading-none text-white sm:text-[80px]">
              {country(team.key)}
            </h1>
            <p className="mt-1.5 font-heading text-xs font-bold uppercase tracking-[0.18em] text-white/50">
              {t("lbl_group")} {team.group} · {t("team_matchdays")}
            </p>
          </div>

          {/* Squad value badge — bottom right */}
          {typeof team.squadValue === "number" && (
            <div className="mb-0.5 shrink-0 rounded-xl bg-black/45 px-3 py-2 text-right backdrop-blur-sm">
              <p className="font-heading text-[10px] font-extrabold uppercase tracking-wider text-white/50">
                Est. {t("lbl_squadValue")}
              </p>
              <p className="font-heading text-lg font-extrabold leading-tight text-white">
                {formatSquadValue(team.squadValue)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── 3 MATCHDAY CARDS ────────────────────────────────────────────── */}
      {teamMatches.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
          {teamMatches.map((m, idx) => {
            const isHome = m.homeKey === team.key;
            const opponentKey = isHome ? m.awayKey : m.homeKey;
            const opponentCode = isHome ? m.awayCode : m.homeCode;
            return (
              <Link
                key={idx}
                href={`/matches/${matchSlug(m)}`}
                className="group flex flex-col rounded-xl border border-white/10 bg-navyCard p-3 transition hover:border-white/20 hover:bg-white/5"
                style={{
                  borderLeftColor: team.accentColor,
                  borderLeftWidth: "3px",
                }}
              >
                {/* MD badge + H/A */}
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded bg-accent/20 px-1.5 py-0.5 font-heading text-[10px] font-extrabold uppercase tracking-wider text-accent">
                    MD{idx + 1}
                  </span>
                  <span className="font-heading text-[10px] font-bold uppercase tracking-wider text-white/35">
                    {isHome ? "H" : "A"}
                  </span>
                </div>

                {/* Opponent */}
                <div className="flex items-center gap-2">
                  <Flag
                    code={opponentCode}
                    name={country(opponentKey)}
                    width={26}
                    height={18}
                    className="shrink-0 rounded-sm"
                  />
                  <span className="truncate font-heading text-xs font-extrabold uppercase leading-tight tracking-wide text-white transition group-hover:text-accent">
                    {t("vs")} {country(opponentKey)}
                  </span>
                </div>

                {/* Date + time */}
                <div className="mt-2 text-[11px] leading-snug text-white/45">
                  {formatDate(m.date)}
                  {m.time ? (
                    <span className="ml-1 font-semibold text-white/60">{m.time}</span>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── QUICK ANSWERS (FAQ for Google AI Overview) ──────────────────── */}
      <section className="mt-4" aria-label="Quick answers">
        <p className="mb-2 font-heading text-[10px] font-extrabold uppercase tracking-[0.25em] text-white/30">
          {t("qa_section")}
        </p>
        <div className="space-y-1.5">
          {/* Q1: First match */}
          {teamMatches[0] && (() => {
            const m = teamMatches[0];
            const isHome = m.homeKey === team.key;
            const oppKey = isHome ? m.awayKey : m.homeKey;
            const teamName = country(team.key);
            const oppName  = country(oppKey);
            const dateStr  = formatDate(m.date);
            const timeStr  = m.time  ?? "";
            const venue    = m.venue ?? "";
            return (
              <div className="rounded-lg border border-white/8 bg-navyCard/60 px-4 py-3">
                <p className="font-heading text-[11px] font-extrabold uppercase tracking-wide text-white/40">
                  {fill(t("qa_first_match_q"), { team: teamName })}
                </p>
                <p className="mt-1 text-sm text-white/80">
                  {fill(t("qa_first_match_a"), {
                    team: teamName,
                    opponent: oppName,
                    date: dateStr,
                    time: timeStr,
                    venue,
                  })}
                </p>
              </div>
            );
          })()}

          {/* Q2: Group members */}
          {(() => {
            const teammates = groupTeams.filter((gt) => gt.key !== team.key);
            const teamName  = country(team.key);
            const teammatesStr = teammates
              .map((gt) => country(gt.key))
              .join(", ");
            return (
              <div className="rounded-lg border border-white/8 bg-navyCard/60 px-4 py-3">
                <p className="font-heading text-[11px] font-extrabold uppercase tracking-wide text-white/40">
                  {fill(t("qa_group_q"), { team: teamName })}
                </p>
                <p className="mt-1 text-sm text-white/80">
                  {fill(t("qa_group_a"), {
                    team: teamName,
                    group: team.group,
                    teammates: teammatesStr,
                  })}
                </p>
              </div>
            );
          })()}

          {/* Q3: Qualification */}
          {(() => {
            const teamName = country(team.key);
            return (
              <div className="rounded-lg border border-white/8 bg-navyCard/60 px-4 py-3">
                <p className="font-heading text-[11px] font-extrabold uppercase tracking-wide text-white/40">
                  {fill(t("qa_qualify_q"), { team: teamName })}
                </p>
                <p className="mt-1 text-sm text-white/80">
                  {fill(t("qa_qualify_a"), { team: teamName, group: team.group })}
                </p>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ── GROUP MATCHES (all 6, with clickable rows) ──────────────────── */}
      <section className="mt-8">
        <h2 className="mb-4 font-heading text-2xl font-extrabold uppercase tracking-wide text-white">
          {t("sec_allGroupMatches").replace("{group}", team.group)}
        </h2>
        <div className="space-y-2">
          {groupMatches.map((m, i) => {
            const isTeamMatch = m.homeKey === team.key || m.awayKey === team.key;
            return (
              <Link
                key={i}
                href={`/matches/${matchSlug(m)}`}
                className={`block rounded-lg border px-4 py-3 transition hover:border-white/20 hover:bg-white/5 ${
                  isTeamMatch
                    ? "border-accent/30 bg-accent/10"
                    : "border-white/10 bg-navyCard"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                    <span className="min-w-0 truncate font-semibold text-white">
                      {country(m.homeKey)}
                    </span>
                    <Flag
                      code={m.homeCode}
                      name={country(m.homeKey)}
                      width={30}
                      height={22}
                    />
                  </div>
                  <span className="shrink-0 rounded bg-navy px-2 py-1 font-heading text-xs font-bold uppercase text-white/50">
                    {t("vs")}
                  </span>
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Flag
                      code={m.awayCode}
                      name={country(m.awayKey)}
                      width={30}
                      height={22}
                    />
                    <span className="min-w-0 truncate font-semibold text-white">
                      {country(m.awayKey)}
                    </span>
                  </div>
                </div>
                <div className="mt-1.5 text-center text-xs text-white/50">
                  <span className="font-semibold text-white/75">
                    {formatDate(m.date)}
                    {m.time ? ` · ${m.time}` : ""}
                  </span>
                  {m.venue ? (
                    <span className="ml-2 truncate">{m.venue}</span>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── STANDINGS ───────────────────────────────────────────────────── */}
      <section className="mt-8">
        <h2 className="mb-4 font-heading text-2xl font-extrabold uppercase tracking-wide text-white">
          {t("sec_standings")} · {t("lbl_group")} {team.group}
        </h2>
        <div className="overflow-hidden rounded-xl border border-white/10 bg-navyCard">
          <StandingsTable teams={groupTeams} currentTeamKey={team.key} />
        </div>
      </section>

      {/* ── PATH TO KNOCKOUT ────────────────────────────────────────────── */}
      <section className="mt-8">
        <h2 className="mb-4 font-heading text-2xl font-extrabold uppercase tracking-wide text-white">
          {t("path_section")}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* 1st or 2nd */}
          <div
            className="rounded-xl border border-white/10 bg-navyCard p-4"
            style={{ borderLeftColor: "#22c55e", borderLeftWidth: "3px" }}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-base leading-none">✅</span>
              <span className="font-heading text-xs font-extrabold uppercase tracking-wide text-green-400">
                {t("path_finish_top2")}
              </span>
            </div>
            <p className="text-sm font-bold text-white">{t("path_finish_top2_desc")}</p>
            {opponentGroup && (
              <div className="mt-3 space-y-1 border-t border-white/10 pt-3">
                <p className="text-xs text-white/60">
                  {fill(t("path_1st_faces"), { opponent_group: opponentGroup })}
                </p>
                <p className="text-xs text-white/60">
                  {fill(t("path_2nd_faces"), { opponent_group: opponentGroup })}
                </p>
              </div>
            )}
          </div>

          {/* 3rd */}
          <div
            className="rounded-xl border border-white/10 bg-navyCard p-4"
            style={{ borderLeftColor: "#f59e0b", borderLeftWidth: "3px" }}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-base leading-none">🟡</span>
              <span className="font-heading text-xs font-extrabold uppercase tracking-wide text-amber-400">
                {t("path_finish_3rd")}
              </span>
            </div>
            <p className="text-sm font-bold text-white">{t("path_finish_3rd_desc")}</p>
            <div className="mt-3 border-t border-white/10 pt-3">
              <p className="text-xs text-white/60">{t("path_finish_3rd_note")}</p>
            </div>
          </div>

          {/* 4th */}
          <div
            className="rounded-xl border border-white/10 bg-navyCard p-4"
            style={{ borderLeftColor: "#ef4444", borderLeftWidth: "3px" }}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-base leading-none">❌</span>
              <span className="font-heading text-xs font-extrabold uppercase tracking-wide text-red-400">
                {t("path_finish_4th")}
              </span>
            </div>
            <p className="text-sm font-bold text-white">{t("path_finish_4th_desc")}</p>
            <div className="mt-3 border-t border-white/10 pt-3">
              <p className="text-xs text-white/60">{t("path_finish_4th_note")}</p>
            </div>
          </div>
        </div>

        {/* Opener note */}
        {teamMatches[0] && (
          <p className="mt-4 font-heading text-[11px] font-bold uppercase tracking-widest text-white/30">
            {fill(t("path_opener_note"), { team: country(team.key) })}
          </p>
        )}
      </section>

      {/* ── SQUAD ───────────────────────────────────────────────────────── */}
      {squad && (
        <section className="mt-8">
          <h2 className="mb-4 font-heading text-2xl font-extrabold uppercase tracking-wide text-white">
            {t("sec_squad")}
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            {squad.map((block) => (
              <div
                key={block.position}
                className="overflow-hidden rounded-xl border border-white/10 bg-navyCard"
              >
                <div className="border-b-2 border-accent bg-navy px-4 py-2.5">
                  <span className="font-heading text-sm font-extrabold uppercase tracking-wide text-white">
                    {t(`pos_${block.position}`)}
                  </span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wider text-white/40">
                      <th className="w-10 px-3 py-2 text-start font-semibold">
                        {t("col_no")}
                      </th>
                      <th className="px-2 py-2 text-start font-semibold">
                        {t("col_player")}
                      </th>
                      <th className="px-3 py-2 text-end font-semibold">
                        {t("col_position")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {block.players.map((p) => (
                      <tr key={p.name} className="border-t border-white/5">
                        <td className="px-3 py-2 font-heading font-bold tabular-nums text-white/40">
                          {p.number ?? "–"}
                        </td>
                        <td className="px-2 py-2 font-semibold text-white">{p.name}</td>
                        <td className="px-3 py-2 text-end text-xs text-white/55">
                          {p.detailedPosition || t(`pos_${p.position}`)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
