"use client";

import Link from "next/link";
import { ArrowUpRight, Copy, ImageIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { PosterPreviewCard } from "@/components/poster-engine";
import { QualificationScenario } from "@/components/qualification-scenario";
import { StandingsTable } from "@/components/standings-table";
import { TeamFlag } from "@/components/team-flag";
import { TimezoneSelect } from "@/components/timezone-select";
import { useTimezone } from "@/components/timezone-provider";
import type { MatchWithTeams, Standing, Team } from "@/lib/types";
import { formatKickoff } from "@/lib/timezones";
import { getPlayersToWatch, getSquadByPosition, getStarPlayer, playerSlug, positionCode } from "@/lib/squads";

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
  const nextMatch = sortedFixtures[0];
  const nextOpponent = nextMatch ? opponentFor(nextMatch, team) : undefined;
  const squadGroups = getSquadByPosition(team.id);
  const playersToWatch = getPlayersToWatch(team.id, team.featuredPlayer);
  const summary = useMemo(() => buildTeamSummary(team, sortedFixtures, teams), [team, sortedFixtures, teams]);
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

  const scheduleUrl = typeof window === "undefined" ? `/teams/${team.slug}-world-cup-schedule` : `${window.location.origin}/teams/${team.slug}-world-cup-schedule`;
  const whatsappText = `${team.name} World Cup road\n${sortedFixtures.map((match) => `${team.fifaCode} vs ${opponentFor(match, team).fifaCode} - ${formatKickoff(match.kickoffUtc, timezone)}`).join("\n")}\nLocal times shown in ${timezone}.`;
  const hue = teamHue(team);

  return (
    <div className="grid gap-6">
      <section
        className="relative -mx-4 overflow-hidden px-4 py-5 text-white shadow-[0_24px_70px_rgba(14,12,10,.18)] md:mx-0 md:rounded-[28px] md:px-6 md:py-6"
        style={{
          background: `linear-gradient(158deg, hsl(${hue},78%,42%), hsl(${hue},70%,24%))`
        }}
      >
        <HeroFx />
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/82">My World Cup hub - Group {team.group}</p>
            <div className="mt-4 flex items-center gap-4">
              <TeamFlag team={team} width={104} className="drop-shadow-[0_12px_24px_rgba(0,0,0,.35)]" />
              <h1 className={`${readableName} text-6xl font-black uppercase leading-[.82] tracking-normal [font-family:Impact,Arial_Black,sans-serif] md:text-8xl`}>
                {team.name}
              </h1>
            </div>
            {typeof team.squadValue === "number" ? (
              <p className="mt-4 inline-flex items-center gap-2 rounded-md bg-white/12 px-3 py-1.5 text-sm font-black uppercase tracking-[0.12em] text-white/90">
                Squad value: {formatSquadValue(team.squadValue)}
              </p>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={`/cards?template=team-schedule&team=${team.id}`} className="focus-ring inline-flex items-center gap-2 rounded-md bg-white px-4 py-3 font-black text-[#0E0C0A]">
                <ImageIcon size={17} />
                Create {team.name} poster
              </Link>
            </div>
          </div>
          <div className="mx-auto overflow-hidden rounded-[22px] lg:mx-0">
            <PosterPreviewCard variant="road" ratio="story" width={220} team={team} matches={sortedFixtures} headline={`${team.name} road starts here`} />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 md:p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">{team.name} at the 2026 World Cup</p>
        <div className="mt-3 grid gap-3 text-sm leading-7 text-[#0E0C0A]/70 md:text-base">
          {summary.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <div className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 md:p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">Group {team.group} - the path</p>
          <div className="mt-4 grid gap-3">
            {teams.filter((item) => item.group === team.group).map((item, index) => (
              <Link
                key={item.id}
                href={`/teams/${item.slug}-world-cup-schedule`}
                className={item.id === team.id ? "grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md bg-[#0E0C0A] p-3 text-white" : "grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md border border-[rgba(14,12,10,.10)] bg-white p-3 text-[#0E0C0A]"}
              >
                <TeamFlag team={item} width={42} />
                <span className={`min-w-0 font-black ${readableName}`}>{item.name}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.12em] opacity-60">{["Seed", "Pot 2", "Pot 3", "Pot 4"][index] || item.fifaCode}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 md:p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">Three matchups</p>
              <h2 className="text-2xl font-black text-[#0E0C0A]">{team.name} fixtures</h2>
            </div>
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

      <QualificationScenario team={team} />

      <section className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <div className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 md:p-5">
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
        </div>
        <ShareScheduleBox team={team} scheduleUrl={scheduleUrl} whatsappText={whatsappText} onCopy={copyText} status={status} />
      </section>

      {playersToWatch.length ? (
        <section className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 md:p-5">
          <div className="mb-4">
            <h2 className="text-2xl font-black text-[#0E0C0A]">Players to watch</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {playersToWatch.map((player) => (
              <Link
                key={player.name}
                href={`/cards?template=player-watch&team=${team.id}&player=${playerSlug(player.name)}`}
                className="focus-ring group relative flex flex-col items-center gap-2 rounded-lg border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] p-4 text-center transition hover:border-[#E7C36B]/60 hover:bg-white"
              >
                <ArrowUpRight size={15} className="absolute right-3 top-3 text-[#0E0C0A]/20 transition group-hover:text-[#B48A00]" />
                <JerseyBadge color={team.primaryColor} number={player.number} />
                <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0E0C0A]/55">{positionCode(player)}</span>
                <span className={`text-base font-black uppercase leading-tight text-[#0E0C0A] ${readableName}`}>{lastName(player.name)}</span>
              </Link>
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

      {nextOpponent ? <OpponentWatch opponent={nextOpponent} teams={teams} /> : null}
    </div>
  );
}

function ShareScheduleBox({
  team,
  scheduleUrl,
  whatsappText,
  onCopy,
  status
}: {
  team: Team;
  scheduleUrl: string;
  whatsappText: string;
  onCopy: (value: string, label: string) => void;
  status: string;
}) {
  return (
    <div className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">Share this schedule</p>
      <h2 className="mt-1 text-xl font-black text-[#0E0C0A]">{team.name} schedule link</h2>
      <p className="mt-2 text-sm leading-6 text-[#0E0C0A]/58">Copy the country road link or send a WhatsApp-ready matchup list.</p>
      <div className="mt-4 grid gap-2">
        <button onClick={() => onCopy(scheduleUrl, "Schedule link")} className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-[rgba(14,12,10,.12)] px-3 py-2 text-sm font-bold text-[#0E0C0A]">
          <Copy size={15} />
          Copy link
        </button>
        <button onClick={() => onCopy(whatsappText, "WhatsApp message")} className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-[rgba(14,12,10,.12)] px-3 py-2 text-sm font-bold text-[#0E0C0A]">
          <Copy size={15} />
          Copy WhatsApp message
        </button>
      </div>
      <p className="mt-3 text-sm text-[#0E0C0A]/50">{status || "Ready for fan groups."}</p>
    </div>
  );
}

function OpponentWatch({ opponent, teams }: { opponent: Team; teams: Team[] }) {
  const groupTeams = teams.filter((item) => item.group === opponent.group);
  const potIndex = groupTeams.findIndex((item) => item.id === opponent.id);
  const pot = ["Pot 1 (seed)", "Pot 2", "Pot 3", "Pot 4"][potIndex] || "Pot 4";
  const star = getStarPlayer(opponent.id);
  const facts: Array<{ label: string; value: string }> = [
    { label: "Group position", value: `Group ${opponent.group} - ${pot}` },
    { label: "Confederation", value: opponent.confederation },
    { label: "Player to watch", value: star ? `${star.name} (${star.position})` : opponent.name }
  ];
  return (
    <section className="relative overflow-hidden rounded-lg bg-[#0E0C0A] p-5 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_85%_12%,rgba(255,45,107,.30),transparent_70%)]" />
      <div className="relative">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#E7C36B]">Opponent watch - next up</p>
        <div className="mt-4 flex items-center gap-4">
          <TeamFlag team={opponent} width={72} />
          <h2 className={`${readableName} text-4xl font-black uppercase leading-[.9] [font-family:Impact,Arial_Black,sans-serif]`}>{opponent.name}</h2>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.label} className="rounded-md bg-white/8 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/48">{fact.label}</p>
              <p className="mt-1 text-sm font-bold leading-5 text-white/82">{fact.value}</p>
            </div>
          ))}
        </div>
        <Link href={`/teams/${opponent.slug}-world-cup-schedule`} className="focus-ring mt-5 inline-flex rounded-md bg-[#E7C36B] px-4 py-3 text-sm font-black text-[#0E0C0A]">
          View {opponent.name} hub →
        </Link>
      </div>
    </section>
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

// Original 2-3 sentence summary built from real fixture/group data so every one of the 48
// pages reads differently and avoids thin/placeholder content.
function buildTeamSummary(team: Team, fixtures: MatchWithTeams[], allTeams: Team[]): string[] {
  const opponents = [
    ...new Set(fixtures.filter((match) => match.stage === "group").map((match) => opponentFor(match, team).name))
  ];
  const groupSize = allTeams.filter((item) => item.group === team.group).length;
  const sentences: string[] = [];

  if (opponents.length) {
    sentences.push(
      `${team.name} compete in Group ${team.group} at the 2026 World Cup, where they face ${joinWithAnd(opponents)} in the group stage.`
    );
  } else {
    sentences.push(`${team.name} compete in Group ${team.group} at the 2026 World Cup, hosted across the United States, Canada and Mexico.`);
  }

  sentences.push(
    `Representing ${team.confederation} in the expanded 48-team field, they need a strong start from ${groupSize ? `a ${groupSize}-team group` : "their group"} to reach the knockout rounds.`
  );

  sentences.push(
    `Below you'll find ${team.name}'s group-stage kickoffs in your local time, players to watch, the Group ${team.group} table and the full reported squad.`
  );

  return sentences;
}

function joinWithAnd(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
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

function teamHue(team: Team) {
  return Math.abs(team.name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)) % 360;
}
