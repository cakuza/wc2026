"use client";

import { Copy, Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import { QualificationScenario } from "@/components/qualification-scenario";
import { StandingsTable } from "@/components/standings-table";
import { TeamFlag } from "@/components/team-flag";
import { TriviaWidget } from "@/components/trivia-widget";
import { TimezoneSelect } from "@/components/timezone-select";
import { useTimezone } from "@/components/timezone-provider";
import type { MatchWithTeams, Standing, Team } from "@/lib/types";
import { formatKickoff } from "@/lib/timezones";
import { getPlayersToWatch, getSquadByPosition, positionCode } from "@/lib/squads";

const readableName = "break-normal [hyphens:none] [overflow-wrap:normal] [word-break:normal]";

export function TeamMatchCenter({
  team,
  fixtures,
  groupStandings,
  teams
}: {
  team: Team;
  fixtures: MatchWithTeams[];
  groupStandings: Standing[];
  teams: Team[];
}) {
  const { timeZone: timezone } = useTimezone();
  const [status, setStatus] = useState("");
  const sortedFixtures = useMemo(() => [...fixtures].sort((a, b) => Date.parse(a.date) - Date.parse(b.date)), [fixtures]);
  // First upcoming fixture for the hero "Next match" line; falls back to the opener so the
  // line is always populated pre-tournament when every fixture is still in the future.
  const nextMatch = useMemo(() => {
    const now = Date.now();
    return sortedFixtures.find((match) => Date.parse(match.date) >= now) || sortedFixtures[0] || null;
  }, [sortedFixtures]);
  const squadGroups = getSquadByPosition(team.id);
  const playersToWatch = getPlayersToWatch(team.id, team.featuredPlayer);
  // Before any match is played every row is 0-0-0, which reads as a broken demo. Treat an
  // all-zero group as pre-tournament and show a prompt instead of an empty table.
  const groupNotStarted =
    groupStandings.length === 0 ||
    groupStandings.every(
      (row) =>
        row.played === 0 &&
        row.won === 0 &&
        row.drawn === 0 &&
        row.lost === 0 &&
        row.goalsFor === 0 &&
        row.goalsAgainst === 0 &&
        row.points === 0
    );

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setStatus(`${label} copied.`);
    } catch {
      setStatus("Copy failed in this browser. Select the text manually.");
    }
  }

  async function sharePage() {
    const url = typeof window === "undefined" ? "" : window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${team.name} — World Cup 2026`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setStatus("Link copied.");
    } catch {
      // user dismissed the share sheet, or clipboard blocked — no-op
    }
  }

  // National-color hero: primaryColor drives the gradient (top = primary, bottom = a darker
  // shade of it), secondaryColor tints the team name and a faint diagonal-stripe texture.
  const primary = team.primaryColor || "#0E0C0A";
  const secondary = team.secondaryColor || "#ffffff";

  return (
    <div className="grid gap-6">
      <section
        className="relative -mx-4 overflow-hidden px-4 py-5 text-white shadow-[0_24px_70px_rgba(14,12,10,.18)] md:mx-0 md:rounded-[28px] md:px-6 md:py-6"
        style={{
          background: `linear-gradient(158deg, ${primary}, ${darkenHex(primary, 0.45)})`
        }}
      >
        {/* Diagonal stripe texture in the secondary color at ~10% — premium, not loud. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(135deg, ${hexWithAlpha(secondary, 0.1)} 0px, ${hexWithAlpha(secondary, 0.1)} 2px, transparent 2px, transparent 16px)`
          }}
        />
        <HeroFx />
        <div className="relative z-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/82">World Cup 2026 · Group {team.group}</p>
          <div className="mt-4 flex items-center gap-4">
            <TeamFlag team={team} width={104} className="drop-shadow-[0_12px_24px_rgba(0,0,0,.35)]" />
            <h1
              className={`${readableName} text-6xl font-black uppercase leading-[.82] tracking-normal [font-family:Impact,Arial_Black,sans-serif] md:text-8xl`}
              style={{ color: secondary }}
            >
              {team.name}
            </h1>
          </div>
          {nextMatch ? (
            <div className="mt-5">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/65">Next match</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-bold text-white/90">
                <span className="inline-flex items-center gap-2">
                  <TeamFlag team={opponentFor(nextMatch, team)} width={26} />
                  <span className="font-black">{opponentFor(nextMatch, team).name}</span>
                </span>
                <span className="text-white/40">·</span>
                <span>{heroMatchDate(nextMatch.kickoffUtc || nextMatch.date, timezone)}</span>
                {nextMatch.kickoffUtc ? (
                  <>
                    <span className="text-white/40">·</span>
                    <span>{heroMatchTime(nextMatch.kickoffUtc, timezone)} local</span>
                  </>
                ) : null}
                {nextMatch.venue ? (
                  <>
                    <span className="text-white/40">·</span>
                    <span className="text-white/75">{nextMatch.venue}</span>
                  </>
                ) : null}
              </div>
            </div>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {typeof team.squadValue === "number" ? (
              <p className="inline-flex items-center gap-2 rounded-md bg-white/12 px-3 py-1.5 text-sm font-black uppercase tracking-[0.12em] text-white/90">
                Squad value: {formatSquadValue(team.squadValue)}
              </p>
            ) : null}
            <button
              type="button"
              onClick={sharePage}
              className="focus-ring inline-flex items-center gap-2 rounded-md bg-white/15 px-3 py-1.5 text-sm font-black text-white transition hover:bg-white/25"
            >
              <Share2 size={15} />
              Share
            </button>
            {status ? <span className="text-xs font-bold text-white/80">{status}</span> : null}
          </div>
        </div>
      </section>

      <section>
        <div className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 md:p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-black text-[#0E0C0A]">{team.name} fixtures</h2>
            <label className="grid gap-1 text-xs font-black uppercase tracking-[0.14em] text-[#0E0C0A]/55">
              Timezone
              <TimezoneSelect variant="light" />
            </label>
          </div>
          <div className="grid gap-3">
            {sortedFixtures.slice(0, 3).map((match, index) => {
              const opponent = opponentFor(match, team);
              const kickoff = formatKickoff(match.kickoffUtc, timezone);
              return (
                <article key={match.id} className="rounded-lg border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#0E0C0A]/45">Matchday {index + 1} - Group {match.group}</p>
                  <div className="mt-3 flex min-w-0 items-center gap-3">
                    <TeamFlag team={team} width={48} />
                    <span className="text-2xl font-black uppercase text-[#0E0C0A]/45 [font-family:Impact,Arial_Black,sans-serif]">vs</span>
                    <TeamFlag team={opponent} width={48} />
                    <span className={`min-w-0 text-lg font-black text-[#0E0C0A] ${readableName}`}>{opponent.name}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2">
                      <span className={match.kickoffUtc ? "rounded-md bg-[#0E0C0A] px-3 py-2 text-sm font-black text-white" : "rounded-md border border-[#E7C36B]/35 bg-[#E7C36B]/10 px-3 py-2 text-sm font-black text-[#8A6400]"}>
                        {kickoff}
                      </span>
                      {match.kickoffUtc ? <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#0E0C0A]/45">Local time</span> : null}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => copyText(`${team.name} vs ${opponent.name}: ${kickoff}`, "Match time")} className="focus-ring inline-flex items-center gap-2 rounded-md border border-[rgba(14,12,10,.12)] px-3 py-2 text-xs font-black text-[#0E0C0A]">
                        <Copy size={14} />
                        Copy
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <TriviaWidget />

      <QualificationScenario team={team} />

      <section className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 md:p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">Group table</p>
        <h2 className="mt-1 text-2xl font-black text-[#0E0C0A]">Group {team.group}</h2>
        <div className="mt-4 overflow-x-auto">
          <StandingsTable rows={groupStandings} teams={teams} highlightTeamId={team.id} showFlags qualifyCount={2} />
        </div>
        {groupNotStarted ? (
          <p className="mt-2 text-xs text-[#0E0C0A]/50">
            Pre-tournament table — every team starts level. Standings update automatically once the group stage kicks off on June 11, 2026.
          </p>
        ) : null}
      </section>

      {playersToWatch.length ? (
        <section className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 md:p-5">
          <div className="mb-4">
            <h2 className="text-2xl font-black text-[#0E0C0A]">Players to watch</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {playersToWatch.map((player) => (
              <div
                key={player.name}
                className="flex flex-col items-center gap-2 rounded-lg border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] p-4 text-center"
              >
                <JerseyBadge color={team.primaryColor} number={player.number} />
                <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0E0C0A]/55">{positionCode(player)}</span>
                <span className={`text-base font-black uppercase leading-tight text-[#0E0C0A] ${readableName}`}>{lastName(player.name)}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {squadGroups.length ? (
        <section className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 md:p-5">
          <div className="mb-4 flex items-center gap-3">
            <TeamFlag team={team} width={36} />
            <div>
              <h2 className="text-2xl font-black text-[#0E0C0A]">{team.name} squad</h2>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {squadGroups.map((group) => (
              <div key={group.position}>
                <p className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#0E0C0A]/45">{group.label}</p>
                <ul className="grid gap-1.5">
                  {group.players.map((player) => (
                    <li key={player.name} className="flex items-center justify-between gap-3 rounded-md border border-[rgba(14,12,10,.08)] bg-[#F6F4F1] px-3 py-2">
                      <span className="min-w-0 truncate text-sm font-bold text-[#0E0C0A]">{player.name}</span>
                      <span className="shrink-0 rounded bg-[#0E0C0A]/[.06] px-1.5 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] text-[#0E0C0A]/45">
                        {positionCode(player)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function HeroFx() {
  return (
    <>
      <div className="pointer-events-none absolute -left-[12%] top-[-28%] h-[130%] w-[42%] rotate-[18deg] bg-white/24 blur-[18px]" />
      <div className="pointer-events-none absolute -right-[12%] top-[-28%] h-[130%] w-[42%] rotate-[-18deg] bg-white/18 blur-[18px]" />
      <div className="poster-grain pointer-events-none absolute inset-0 opacity-35 mix-blend-overlay" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(125%_95%_at_50%_42%,transparent_38%,rgba(8,6,4,.42)_100%)]" />
    </>
  );
}

// squadValue is stored in € millions. Show €X.XXB for billion-euro squads, €NNNM otherwise.
function formatSquadValue(millions: number): string {
  if (millions >= 1000) return `€${(millions / 1000).toFixed(2)}B`;
  return `€${millions}M`;
}

function opponentFor(match: MatchWithTeams, team: Team) {
  return match.homeTeamId === team.id ? match.awayTeam : match.homeTeam;
}

// Last token of a name for the football-manager-style label (e.g. "Baris Alper Yilmaz" -> "Yilmaz").
function lastName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] || name;
}

// Pick black or white text for legibility on a given background color.
function readableTextColor(hex?: string): string {
  if (!hex) return "#ffffff";
  const raw = hex.replace("#", "");
  const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
  if (full.length < 6) return "#ffffff";
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0E0C0A" : "#ffffff";
}

// Minimal football-shirt badge filled with the team color, showing the squad number or "?".
function JerseyBadge({ color, number }: { color?: string; number: number | null }) {
  const fill = color || "#0E0C0A";
  const textColor = readableTextColor(fill);
  return (
    <svg viewBox="0 0 48 48" width={56} height={56} aria-hidden="true" className="drop-shadow-[0_4px_10px_rgba(14,12,10,.18)]">
      <path
        d="M16 5 L8 11 L3 20 L10 25 L13 22 L13 43 L35 43 L35 22 L38 25 L45 20 L40 11 L32 5 C30 9.5 27 11 24 11 C21 11 18 9.5 16 5 Z"
        fill={fill}
        stroke="rgba(14,12,10,.18)"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <text x="24" y="33" textAnchor="middle" fontSize="15" fontWeight="900" fill={textColor} fontFamily="Impact, Arial Black, sans-serif">
        {number ?? "?"}
      </text>
    </svg>
  );
}

// "Sun Jun 14" in the user's timezone for the hero next-match line.
function heroMatchDate(date: string, timeZone: string) {
  return new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric", timeZone }).format(new Date(date));
}

// "07:00" in the user's timezone (24h, no offset label — UI says "local").
function heroMatchTime(date: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone }).format(new Date(date));
}

// Parse a #RGB or #RRGGBB hex into {r,g,b}; falls back to black on malformed input.
function hexToRgb(hex: string) {
  const raw = hex.replace("#", "");
  const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
  if (full.length < 6) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16)
  };
}

// Multiply each channel toward black to make the gradient's bottom stop (factor < 1).
function darkenHex(hex: string, factor: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.round(r * factor)}, ${Math.round(g * factor)}, ${Math.round(b * factor)})`;
}

// Same color at a given alpha, e.g. for the 10% diagonal-stripe overlay.
function hexWithAlpha(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
