"use client";

import Link from "next/link";
import { Copy, ImageIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PosterPreviewCard } from "@/components/poster-engine";
import { StandingsTable } from "@/components/standings-table";
import { TeamFlag } from "@/components/team-flag";
import type { MatchWithTeams, Standing, Team } from "@/lib/types";
import { formatKickoff, getBrowserTimezone, QUICK_TIMEZONES } from "@/lib/timezones";
import { getSquadByPosition, getStarPlayer, playerSlug } from "@/lib/squads";

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
  const [timezone, setTimezone] = useState("Europe/Istanbul");
  const [status, setStatus] = useState("");
  const sortedFixtures = useMemo(() => [...fixtures].sort((a, b) => Date.parse(a.date) - Date.parse(b.date)), [fixtures]);
  const nextMatch = sortedFixtures[0];
  const nextOpponent = nextMatch ? opponentFor(nextMatch, team) : undefined;
  const squadGroups = getSquadByPosition(team.id);
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

  useEffect(() => {
    setTimezone(getBrowserTimezone());
  }, []);

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
            {team.fanHook ? (
              <p className="mt-3 text-lg font-black text-[#E7C36B] md:text-2xl">{team.fanHook}</p>
            ) : null}
            <p className="mt-4 max-w-2xl text-sm font-bold leading-6 text-white/72">
              {team.name}&apos;s group-stage road in your local time. Pick a match, drop a prediction, and share the poster.
            </p>
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
              <select value={timezone} onChange={(event) => setTimezone(event.target.value)} className="focus-ring rounded-md border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] px-3 py-2 text-sm normal-case tracking-normal text-[#0E0C0A]">
                {QUICK_TIMEZONES.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
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
                    <span className={match.kickoffUtc ? "rounded-md bg-[#0E0C0A] px-3 py-2 text-sm font-black text-white" : "rounded-md border border-[#E7C36B]/35 bg-[#E7C36B]/10 px-3 py-2 text-sm font-black text-[#8A6400]"}>
                      {kickoff}
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

      <section className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <div className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 md:p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">Group table</p>
          <h2 className="mt-1 text-2xl font-black text-[#0E0C0A]">Group {team.group}</h2>
          {groupNotStarted ? (
            <div className="mt-4 rounded-lg border border-dashed border-[rgba(14,12,10,.18)] bg-[#F6F4F1] p-5 text-center">
              <p className="text-sm font-bold leading-6 text-[#0E0C0A]/70">
                Group stage starts June 11 — check back for live standings or create a prediction card.
              </p>
              <Link
                href={`/cards?template=prediction&team=${team.id}`}
                className="focus-ring mt-4 inline-flex items-center gap-2 rounded-md bg-[#0E0C0A] px-4 py-2.5 text-sm font-black text-white"
              >
                Create a prediction card
              </Link>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <StandingsTable rows={groupStandings} teams={teams} highlightTeamId={team.id} />
            </div>
          )}
        </div>
        <ShareScheduleBox team={team} scheduleUrl={scheduleUrl} whatsappText={whatsappText} onCopy={copyText} status={status} />
      </section>

      {squadGroups.length ? (
        <section className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 md:p-5">
          <div className="mb-4 flex items-center gap-3">
            <TeamFlag team={team} width={36} />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">Squad</p>
              <h2 className="text-2xl font-black text-[#0E0C0A]">{team.name} squad</h2>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {squadGroups.map((group) => (
              <div key={group.position}>
                <p className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#0E0C0A]/45">{group.label}</p>
                <ul className="grid gap-1.5">
                  {group.players.map((player) => (
                    <li key={player.name} className="group flex items-center justify-between gap-3 rounded-md border border-[rgba(14,12,10,.08)] bg-[#F6F4F1] px-3 py-2">
                      <span className="min-w-0 truncate text-sm font-bold text-[#0E0C0A]">{player.name}</span>
                      <Link
                        href={`/cards?template=player-watch&team=${team.id}&player=${playerSlug(player.name)}`}
                        className="focus-ring shrink-0 text-xs font-black uppercase tracking-[0.06em] text-[#0E0C0A]/35 hover:text-[#B48A00]"
                      >
                        Create player card →
                      </Link>
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

function opponentFor(match: MatchWithTeams, team: Team) {
  return match.homeTeamId === team.id ? match.awayTeam : match.homeTeam;
}

function teamHue(team: Team) {
  return Math.abs(team.name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)) % 360;
}
