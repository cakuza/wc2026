"use client";

import Link from "next/link";
import { Copy, ImageIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { DataStatusNotice } from "@/components/data-status-notice";
import type { PlayerWithStats, Standing, Team } from "@/lib/types";
import { GROUPS } from "@/lib/types";
import { sortPlayersByStat } from "@/lib/utils";

type StatKey = "goals" | "assists" | "yellowCards" | "redCards";

export function StatsHub({
  players,
  standings,
  teams
}: {
  players: PlayerWithStats[];
  standings: Standing[];
  teams: Team[];
}) {
  const [status, setStatus] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const teamMatch = teamFilter === "all" || player.teamId === teamFilter;
      const groupMatch = groupFilter === "all" || player.team.group === groupFilter;
      return teamMatch && groupMatch;
    });
  }, [groupFilter, players, teamFilter]);
  const filteredStandings = standings.filter((row) => {
    const teamMatch = teamFilter === "all" || row.teamId === teamFilter;
    const groupMatch = groupFilter === "all" || row.group === groupFilter;
    return teamMatch && groupMatch;
  });
  const teamGoals = filteredStandings
    .map((row) => ({ ...row, team: teams.find((team) => team.id === row.teamId) }))
    .filter((row) => row.team)
    .sort((a, b) => b.goalsFor - a.goalsFor)
    .slice(0, 5);
  const hasVerifiedPlayerRows = filteredPlayers.length > 0;

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setStatus(`${label} copied.`);
    } catch {
      setStatus("Copy failed in this browser. Select the text manually.");
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 md:grid-cols-3">
        <HubCta href="/cards?template=golden-boot" label="Create Golden Boot Debate card" />
        <HubCta href="/cards?template=player-watch&player=custom&name=Your%20Pick" label="Create Player Watch card" />
        <HubCta href="/cards?template=group-chaos" label="Build your Top 5 argument" />
      </div>
      <section className="overflow-hidden rounded-lg border border-gold/25 bg-[radial-gradient(circle_at_20%_12%,rgba(242,201,76,0.18),transparent_34%),linear-gradient(145deg,rgba(13,114,79,0.45),rgba(6,21,39,0.92))] p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">Pre-tournament debate mode</p>
        <h2 className="mt-2 text-3xl font-black leading-tight text-white">Turn unknowns into debates.</h2>
        <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-white/70">
          Pick a Golden Boot winner, build a Player Watch card, argue the group, or save a Top 5 template. Official leaderboards can be added only after verified stats are imported.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {["Golden Boot", "Players to Watch", "Team Goals", "Group Debate"].map((label) => (
            <Link key={label} href={label === "Golden Boot" ? "/cards?template=golden-boot" : label === "Group Debate" ? "/cards?template=group-chaos" : "/cards?template=player-watch"} className="rounded-md border border-white/10 bg-white/[0.08] p-3 text-sm font-black text-white hover:border-gold/50 hover:text-gold">
              {label}
            </Link>
          ))}
        </div>
      </section>
      <section className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4 md:grid-cols-2">
        <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-white/55">
          Filter by team
          <select value={teamFilter} onChange={(event) => setTeamFilter(event.target.value)} className="focus-ring rounded-md border border-white/10 bg-pitch px-3 py-3 text-sm normal-case tracking-normal text-white">
            <option value="all">All teams</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-white/55">
          Filter by group
          <select value={groupFilter} onChange={(event) => setGroupFilter(event.target.value)} className="focus-ring rounded-md border border-white/10 bg-pitch px-3 py-3 text-sm normal-case tracking-normal text-white">
            <option value="all">All groups</option>
            {GROUPS.map((group) => (
              <option key={group} value={group}>Group {group}</option>
            ))}
          </select>
        </label>
      </section>
      <details className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
        <summary className="cursor-pointer text-sm font-black text-white">When official stats arrive</summary>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <DataStatusNotice variant="preTournament" />
          <DataStatusNotice variant="squadPending" />
        </div>
      </details>
      <p className="text-sm font-bold text-gold">{status || "Pre-tournament stats mode. Built for debates, quick copying, and fan-card sharing, not fake stats."}</p>
      <div className="grid gap-5 lg:grid-cols-2">
        {hasVerifiedPlayerRows ? (
          <>
            <PlayerStatSection title="Top Scorers" players={sortPlayersByStat(filteredPlayers, "goals").slice(0, 5)} stat="goals" label="Goals" onCopy={copyText} />
            <PlayerStatSection title="Assists" players={sortPlayersByStat(filteredPlayers, "assists").slice(0, 5)} stat="assists" label="Assists" onCopy={copyText} />
            <PlayerStatSection title="Yellow Cards" players={sortPlayersByStat(filteredPlayers, "yellowCards").slice(0, 5)} stat="yellowCards" label="Yellow cards" onCopy={copyText} />
            <PlayerStatSection title="Red Cards" players={sortPlayersByStat(filteredPlayers, "redCards").slice(0, 5)} stat="redCards" label="Red cards" onCopy={copyText} />
          </>
        ) : (
          <>
            <DebateSection title="Golden Boot Debate" copy="Pick your No. 1, dark horse, penalty taker, and breakout scorer. No fake stats needed." href="/cards?template=golden-boot" />
            <DebateSection title="Players to Watch" copy="Create a name-first poster for any player or custom fan pick before squads are imported." href="/cards?template=player-watch&player=custom&name=Your%20Pick" />
            <DebateSection title="Shareable Top 5" copy="Build a group-chat ranking and keep the receipts before the tournament starts." href="/cards?template=golden-boot" />
            <DebateSection title="Group Debate Cards" copy="Argue the top two, the trap game, and the group nobody wants." href="/cards?template=group-chaos" />
          </>
        )}
        <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4 md:p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">Team stats</p>
              <h2 className="text-2xl font-black text-white">Team Goals</h2>
            </div>
            <Link href="/cards?template=team-schedule" className="text-sm font-bold text-gold">Create team card</Link>
          </div>
          <div className="grid gap-3">
            {teamGoals.map((row, index) => (
              <div key={row.teamId} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 rounded-md bg-pitch/70 p-3">
                <span className="grid h-10 w-10 place-items-center rounded-md bg-gold/12 text-sm font-black text-gold">{index + 1}</span>
                <div>
                  <p className="font-black text-white">{row.team?.flagEmoji} {row.team?.name}</p>
                  <p className="text-sm text-white/55">Group {row.group} / debate-ready team row</p>
                </div>
                <span className="font-black text-gold">{row.goalsFor}</span>
                <button onClick={() => copyText(`${row.team?.name}: ${row.goalsFor} goals`, "Team stat")} className="focus-ring grid h-9 w-9 place-items-center rounded-md border border-white/12 text-gold">
                  <Copy size={15} />
                </button>
              </div>
            ))}
          </div>
        </section>
        <PlaceholderSection title="Clean Sheets" copy="Clean-sheet leaders will activate when a verified stat feed is imported. For now, use debate cards instead of fake rankings." />
        <PlaceholderSection title="Minutes Played" copy="Minutes played can be added later from manual JSON or a cached sports API. It is intentionally not invented now." />
      </div>
    </div>
  );
}

function PlayerStatSection({
  title,
  players,
  stat,
  label,
  onCopy
}: {
  title: string;
  players: PlayerWithStats[];
  stat: StatKey;
  label: string;
  onCopy: (value: string, label: string) => void;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4 md:p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">Top 5</p>
          <h2 className="text-2xl font-black text-white">{title}</h2>
        </div>
        <Link href={stat === "goals" ? "/cards?template=golden-boot" : "/cards?template=player-watch"} className="text-sm font-bold text-gold">Share card</Link>
      </div>
      <div className="grid gap-3">
        {players.length ? players.map((player, index) => (
          <div key={player.id} className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-3 rounded-md bg-pitch/70 p-3">
            <span className={index === 0 ? "grid h-12 w-12 place-items-center rounded-md bg-gold text-lg font-black text-pitch" : "grid h-10 w-10 place-items-center rounded-md bg-gold/12 text-sm font-black text-gold"}>{index + 1}</span>
            <div>
              <p className="font-black text-white">{player.name}</p>
              <p className="text-sm text-white/55">{player.team.flagEmoji} {player.team.name} / {player.position} / #{player.shirtNumber}</p>
            </div>
            <span className="text-right text-xl font-black text-gold" aria-label={label}>{player[stat]}</span>
            <Link href={`/cards?template=player-watch&player=${player.id}`} className="focus-ring grid h-9 w-9 place-items-center rounded-md border border-white/12 text-gold" title="Create player card">
              <ImageIcon size={15} />
            </Link>
            <button onClick={() => onCopy(`${player.name} (${player.team.name}): ${player[stat]} ${label}`, "Stat")} className="focus-ring grid h-9 w-9 place-items-center rounded-md border border-white/12 text-gold" title="Copy stat">
              <Copy size={15} />
            </button>
          </div>
        )) : (
          <div className="rounded-lg border border-gold/20 bg-gold/8 p-4">
            <p className="font-black text-white">Stats activate after import</p>
            <p className="mt-2 text-sm leading-6 text-white/62">
              No verified squad stats have been imported yet. Use debate cards now; real player leaderboards will activate once data is available.
            </p>
            <Link href="/cards?template=fan-mode" className="mt-4 inline-flex rounded-md bg-gold px-3 py-2 text-sm font-black text-pitch">
              Create custom player card
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function DebateSection({ title, copy, href }: { title: string; copy: string; href: string }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4 md:p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">Debate card</p>
      <h2 className="mt-1 text-2xl font-black text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-white/62">{copy}</p>
      <Link href={href} className="mt-4 inline-flex rounded-md bg-gold px-3 py-2 text-sm font-black text-pitch">
        Create card
      </Link>
    </section>
  );
}

function PlaceholderSection({ title, copy }: { title: string; copy: string }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4 md:p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">Future stat</p>
      <h2 className="mt-1 text-2xl font-black text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-white/62">{copy}</p>
      <Link href="/cards?template=player-watch" className="mt-4 inline-flex rounded-md border border-white/12 px-3 py-2 text-sm font-bold text-white hover:text-gold">
        Create Player Watch card
      </Link>
    </section>
  );
}

function HubCta({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="focus-ring rounded-lg border border-gold/25 bg-gold/10 p-4 font-black text-white transition hover:bg-gold/15 hover:text-gold">
      {label}
    </Link>
  );
}
