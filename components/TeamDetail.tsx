"use client";

import Link from "next/link";
import { Flag } from "@/components/Flag";
import { MatchTime } from "@/components/MatchTime";
import { TimezoneLabel } from "@/components/TimezoneLabel";
import { useLang } from "@/components/LanguageProvider";
import { slugFor, withArticle, TEAMS, type Team } from "@/lib/teams";
import type { Match } from "@/lib/matches";
import { ARCHIVE_DEFAULT_DATE, matchSlug } from "@/lib/matches";
import { squadByPosition } from "@/lib/squads";
import { StandingsTable } from "@/components/StandingsTable";
import type { SerializableSnapshotMatch } from "@/lib/liveSnapshot";
import type { StandingRow } from "@/lib/groupStandings";
import { pathSlotsForGroup, slotLabel } from "@/lib/knockoutBracket2026";
import { firstMatchResultSentence, playedGroupSummary } from "@/lib/teamCopy";
import { formatCanonicalGoalEvents, getCanonicalArchiveEventsForMatch } from "@/lib/canonicalArchiveEvents";
import { getResolvedAwayTeam, getResolvedHomeTeam, knockoutSlotLabel, type ResolvedParticipantLookup } from "@/lib/participant-resolution";
import { getMatchPresentation, getMatchStatusLabel } from "@/lib/matchPresentation";
import { getTeamTournamentStatus } from "@/lib/teamTournamentStatus";

function formatSquadValue(millions: number): string {
  return millions >= 1000 ? `€${(millions / 1000).toFixed(2)}B` : `€${millions}M`;
}

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
  teamMatches,
  standingsRows,
  snapshotMatches = {},
  eventsArchive = {},
  resolvedParticipants,
  isTournamentComplete = false,
}: {
  team: Team;
  groupTeams: Team[];
  groupMatches: Match[];
  teamMatches: Match[];
  standingsRows?: StandingRow[];
  snapshotMatches?: Record<string, SerializableSnapshotMatch>;
  eventsArchive?: unknown;
  resolvedParticipants?: ResolvedParticipantLookup;
  isTournamentComplete?: boolean;
}) {
  const { t, country, formatDate } = useLang();
  const squad = squadByPosition(team.key);
  const pathSlots = pathSlotsForGroup(team.group);

  const tournamentStatus = getTeamTournamentStatus({
    teamKey: team.key,
    matches: teamMatches,
    snapshotMatches,
    resolvedParticipants,
  });
  const { listedMatches, hasKnockoutJourney, nextMatch: nextListedMatch } = tournamentStatus;
  const teamRow = standingsRows?.find((row) => row.teamKey === team.key);
  const hasPlayed = Boolean(teamRow && teamRow.played > 0);
  const allGroupMatchesFinished = groupMatches.length === 6 && groupMatches.every((m) => {
    const snap = snapshotMatches[matchSlug(m)];
    return snap && snap.status === "FINISHED";
  });
  const teamDisplayName = country(team.key);

  const getParticipantName = (m: Match, side: "home" | "away") => {
    const key = side === "home" ? getResolvedHomeTeam(m, resolvedParticipants) : getResolvedAwayTeam(m, resolvedParticipants);
    if (key) return country(key);
    if (!("matchNumber" in m)) return country(side === "home" ? m.homeKey : m.awayKey);
    return knockoutSlotLabel(side === "home" ? m.homeSlot : m.awaySlot, "en", resolvedParticipants);
  };

  const nextFixtureLabel = nextListedMatch
    ? `${getParticipantName(nextListedMatch, "home")} ${t("vs")} ${getParticipantName(nextListedMatch, "away")}`
    : null;
  const tpFinished = snapshotMatches?.["match-103"]?.status === "FINISHED";
  const isEnglandOrFrance = team.key === "england" || team.key === "france";
  const noNextMatchLabel = isTournamentComplete
    ? "None (campaign completed)"
    : (isEnglandOrFrance && tpFinished)
      ? "None (campaign completed)"
      : "Eliminated";
  const playedSummary = teamRow
    ? playedGroupSummary({
        teamName: teamDisplayName,
        group: team.group,
        played: teamRow.played,
        points: teamRow.points,
        goalDifference: teamRow.goalDifference,
      })
    : null;

  const scorerText = (m: Match) => {
    const archiveEvents = getCanonicalArchiveEventsForMatch(eventsArchive, matchSlug(m));
    if (archiveEvents.length > 0) return formatCanonicalGoalEvents(archiveEvents);
    const snap = snapshotMatches?.[matchSlug(m)];
    return snap?.scorers?.length
      ? snap.scorers
          .map((event) => `${event.minuteLabel ?? (event.minute != null ? `${event.minute}'` : "")} ${event.playerName}${event.isOwnGoal ? " (OG)" : event.isPenalty || event.type === "PENALTY_GOAL" ? " (P)" : ""}`.trim())
          .join(" · ")
      : null;
  };

  const statusText = (m: Match) => {
    const snap = snapshotMatches[matchSlug(m)];
    if (!snap) return null;
    return getMatchStatusLabel(getMatchPresentation({
      match: m,
      liveData: snap.live ?? undefined,
      timeZone: "UTC",
      now: new Date(ARCHIVE_DEFAULT_DATE),
    }));
  };

  const scoreOrVs = (m: Match) => {
    const snap = snapshotMatches[matchSlug(m)];
    if (snap && snap.homeScore !== null && snap.awayScore !== null) return `${snap.homeScore}–${snap.awayScore}`;
    return t("vs");
  };
  const fixtureStage = (m: Match) => {
    if (!("matchNumber" in m)) return `Group ${team.group}`;
    return ({ R32: "Round of 32", R16: "Round of 16", QF: "Quarter-final", SF: "Semi-final", "3P": "Third-place playoff", F: "Final" } as const)[m.stage];
  };
  const completedMatches = listedMatches.filter((match) => snapshotMatches[matchSlug(match)]?.status === "FINISHED");
  const latestCompletedMatch = completedMatches[completedMatches.length - 1] ?? null;
  const form = completedMatches.reduce((acc, match) => {
    const snap = snapshotMatches[matchSlug(match)];
    if (!snap || snap.homeScore === null || snap.awayScore === null) return acc;
    const isHome = (getResolvedHomeTeam(match, resolvedParticipants) ?? match.homeKey) === team.key;
    const ours = isHome ? snap.homeScore : snap.awayScore;
    const theirs = isHome ? snap.awayScore : snap.homeScore;
    if (ours > theirs) acc.wins++; else if (ours === theirs) acc.draws++; else acc.losses++;
    acc.goalsFor += ours;
    acc.goalsAgainst += theirs;
    if (theirs === 0) acc.cleanSheets++;
    return acc;
  }, { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, cleanSheets: 0 });
  const leadingScorers = Object.entries(completedMatches.flatMap((match) => getCanonicalArchiveEventsForMatch(eventsArchive, matchSlug(match)))
    .filter((event) => (event.eventType === "goal" || event.eventType === "penalty_goal") && event.teamKey?.toLowerCase() === teamDisplayName.toLowerCase())
    .reduce<Record<string, number>>((totals, event) => ({ ...totals, [event.playerName]: (totals[event.playerName] ?? 0) + 1 }), {}))
    .sort(([, left], [, right]) => right - left).slice(0, 3);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/teams"
        className="font-heading text-sm font-bold uppercase tracking-wide text-faint transition hover:text-accent"
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
              {hasKnockoutJourney
                ? `${teamDisplayName} · ${tournamentStatus.currentStageLabel ?? "Knockout stage"}`
                : t("team_road_to")}
            </p>
            <h1 className="font-heading text-[60px] font-black uppercase leading-none text-white sm:text-[80px]">
              {country(team.key)}
            </h1>
            <p className="mt-1.5 font-heading text-xs font-bold uppercase tracking-[0.18em] text-faint">
              {hasKnockoutJourney ? "2026 Tournament Run" : `${t("lbl_group")} ${team.group} · ${t("team_matchdays")}`}
            </p>
          </div>

          {/* Squad value badge — bottom right */}
          {typeof team.squadValue === "number" && (
            <div className="mb-0.5 shrink-0 rounded-xl bg-black/45 px-3 py-2 text-right backdrop-blur-sm">
              <p className="font-heading text-[10px] font-extrabold uppercase tracking-wider text-faint">
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
       {hasKnockoutJourney ? <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label={`${teamDisplayName} tournament summary`}>
         <div className="rounded-xl border border-accent/30 bg-accent/10 p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-faint">Current status</p><p className="mt-1 font-heading text-lg font-extrabold text-white">{tournamentStatus.currentStageLabel}</p></div>
         <div className="rounded-xl border border-line bg-surface p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-faint">Latest result</p>{latestCompletedMatch ? (() => {
           const m = latestCompletedMatch;
           const homeKey = getResolvedHomeTeam(m, resolvedParticipants) ?? m.homeKey;
           const awayKey = getResolvedAwayTeam(m, resolvedParticipants) ?? m.awayKey;
           const home = country(homeKey);
           const away = country(awayKey);
           const snap = snapshotMatches[matchSlug(m)];
           const statusLabel = snap ? getMatchStatusLabel(getMatchPresentation({ match: m, liveData: snap.live ?? undefined, timeZone: "UTC", now: new Date(ARCHIVE_DEFAULT_DATE) })) : "FT";
           return (
             <Link href={`/matches/${matchSlug(m)}`} className="mt-1 block transition-opacity hover:opacity-80">
               <span className="font-heading text-xs font-extrabold text-accent">{fixtureStage(m)}</span><br/>
               <span className="font-heading text-sm font-extrabold text-white">{home} {scoreOrVs(m)} {away}</span><br/>
               <span className="font-heading text-[10px] font-bold uppercase tracking-widest text-faint">{formatDate(m.date)} · {statusLabel}</span>
             </Link>
           );
         })() : <p className="mt-1 font-heading text-sm font-extrabold text-white">—</p>}</div>
         <div className="rounded-xl border border-line bg-surface p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-faint">Next match</p>{nextListedMatch ? <Link href={`/matches/${matchSlug(nextListedMatch)}`} className="mt-1 block font-heading text-sm font-extrabold text-accent hover:text-white">{fixtureStage(nextListedMatch)}: {nextFixtureLabel}</Link> : <p className="mt-1 font-heading text-sm font-extrabold text-white">{noNextMatchLabel}</p>}</div>
         <div className="rounded-xl border border-line bg-surface p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-faint">Tournament record</p><p className="mt-1 font-heading text-sm font-extrabold text-white">{form.wins}-{form.draws}-{form.losses} <span className="text-faint">GF {form.goalsFor} GA {form.goalsAgainst} CS {form.cleanSheets}</span></p></div>
       </section> : null}
       {hasKnockoutJourney && leadingScorers.length > 0 ? <section className="mt-3 rounded-xl border border-line bg-surface px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-widest text-faint">Leading scorers</p><p className="mt-1 text-sm text-white">{leadingScorers.map(([player, goals]) => `${player} (${goals})`).join(" · ")}</p></section> : null}

       <section className="mt-6" aria-labelledby="team-journey-heading">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="team-journey-heading" className="font-heading text-2xl font-extrabold uppercase tracking-wide text-white">{hasKnockoutJourney ? "2026 Tournament Run" : "Tournament journey"}</h2>
            <p className="mt-1 text-sm text-muted">{hasKnockoutJourney ? "Group stage and knockout fixtures" : "Group-stage fixtures and results"}</p>
          </div>
          {nextListedMatch && nextFixtureLabel ? <span className="rounded bg-accent/15 px-2 py-1 font-heading text-[10px] font-extrabold uppercase tracking-wider text-accent">Next: {nextFixtureLabel}</span> : null}
        </div>
      {listedMatches.length > 0 && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {listedMatches.map((m, idx) => {
            const resolvedHome = getResolvedHomeTeam(m, resolvedParticipants);
            const resolvedAway = getResolvedAwayTeam(m, resolvedParticipants);
            const isHome = (resolvedHome ?? m.homeKey) === team.key;
            let opponentKey = isHome ? resolvedAway : resolvedHome;
            let opponentName = opponentKey ? country(opponentKey) : undefined;
            if (!opponentName) {
              opponentName = "matchNumber" in m
                ? knockoutSlotLabel(isHome ? m.awaySlot : m.homeSlot, "en", resolvedParticipants)
                : country(isHome ? m.awayKey : m.homeKey);
            }
            const opponentCode = opponentKey ? (TEAMS.find((candidate) => candidate.key === opponentKey)?.code ?? (isHome ? m.awayCode : m.homeCode)) : "tbd";
            return (
              <Link
                key={idx}
                href={`/matches/${matchSlug(m)}`}
                className="group flex flex-col rounded-xl border border-line bg-surface p-3 transition hover:border-lineStrong hover:bg-white/5"
                style={{
                  borderLeftColor: team.accentColor,
                  borderLeftWidth: "3px",
                }}
              >
                {/* MD badge + H/A */}
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded bg-accent/20 px-1.5 py-0.5 font-heading text-[10px] font-extrabold uppercase tracking-wider text-accent">
                    {fixtureStage(m)}
                  </span>
                  <span className="font-heading text-[10px] font-bold uppercase tracking-wider text-faint">
                    {isHome ? "H" : "A"}
                  </span>
                </div>

                {/* Opponent */}
                <div className="flex items-center gap-2">
                  {opponentCode !== "tbd" && (
                    <Flag
                      code={opponentCode}
                      name={opponentName}
                      width={26}
                      height={18}
                      className="shrink-0 rounded-sm"
                    />
                  )}
                  <span className="truncate font-heading text-xs font-extrabold uppercase leading-tight tracking-wide text-white transition group-hover:text-accent">
                    {opponentName}
                  </span>
                </div>

                {/* Date + time */}
                <div className="mt-2 text-[11px] leading-snug text-faint">
                  <span className="font-heading font-extrabold text-muted">{scoreOrVs(m)}</span>
                  {statusText(m) ? (
                    <span className="ml-1 font-heading font-bold uppercase text-muted">{statusText(m)}</span>
                  ) : (
                    <MatchTime match={m} className="ml-1 font-semibold text-muted" />
                  )}
                </div>
                {scorerText(m) ? (
                  <div className="mt-1 truncate text-[10px] text-faint">
                    Goals: {scorerText(m)}
                  </div>
                ) : null}
              </Link>
            );
          })}
        </div>
      )}
      {listedMatches.length > 0 && <TimezoneLabel className="mt-2 text-[11px] text-faint" />}
      </section>

      {hasPlayed ? (
        <div className="mt-3 rounded-lg border border-line bg-surface/70 px-4 py-3 text-sm text-muted">
          <span className="font-semibold text-white">{teamDisplayName}</span>
          {" "}{playedSummary?.slice(teamDisplayName.length).trim()}
          {" "}{allGroupMatchesFinished
            ? "The group stage is complete. This table preserves the final standings."
            : "Group order is provisional when teams are level on available criteria."}
        </div>
      ) : nextListedMatch && (() => {
        const isHome = nextListedMatch.homeKey === team.key;
        const opponentName = getParticipantName(nextListedMatch, isHome ? "away" : "home");
        return (
          <div className="mt-3 rounded-lg border border-line bg-surface/70 px-4 py-3 text-sm text-muted">
            <span className="font-semibold text-white">{country(team.key)}</span>
            {" "}are in Group {team.group}. Next listed match:{" "}
            <Link href={`/matches/${matchSlug(nextListedMatch)}`} className="font-semibold text-accent underline underline-offset-2 hover:text-white">
              {country(team.key)} {t("vs")} {opponentName}
            </Link>
            {" "}at <MatchTime match={nextListedMatch} withZone className="font-semibold text-white" />.
            {" "}Top two teams in the group advance automatically; third place is ranked across all groups.
          </div>
        );
      })()}

      {/* ── QUICK ANSWERS (FAQ for Google AI Overview) ──────────────────── */}
      <section className="mt-4" aria-label="Quick answers">
        <p className="mb-2 font-heading text-[10px] font-extrabold uppercase tracking-[0.25em] text-faint">
          {t("qa_section")}
        </p>
        <div className="space-y-1.5">
          {/* Q1: First match */}
          {teamMatches[0] && (() => {
            const m = teamMatches[0];
            const isHome = (getResolvedHomeTeam(m, resolvedParticipants) ?? m.homeKey) === team.key;
            const oppName = getParticipantName(m, isHome ? "away" : "home");
            const teamName = country(team.key);
            const snap = snapshotMatches[matchSlug(m)];
            const dateStr  = formatDate(m.date);
            const timeStr  = m.time  ?? "";
            const venue    = m.venue ?? "";
            return (
              <div className="rounded-lg border border-line bg-surface/60 px-4 py-3">
                <p className="font-heading text-[11px] font-extrabold uppercase tracking-wide text-faint">
                  {fill(t("qa_first_match_q"), { team: withArticle(teamName) })}
                </p>
                <p className="mt-1 text-sm text-ink">
                  {snap?.status === "FINISHED"
                    ? firstMatchResultSentence({
                        teamName,
                        opponentName: oppName,
                        date: dateStr,
                        homeScore: snap.homeScore ?? 0,
                        awayScore: snap.awayScore ?? 0,
                      })
                    : fill(t("qa_first_match_a"), {
                        team: withArticle(teamName, true),
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
              <div className="rounded-lg border border-line bg-surface/60 px-4 py-3">
                <p className="font-heading text-[11px] font-extrabold uppercase tracking-wide text-faint">
                  {fill(t("qa_group_q"), { team: withArticle(teamName) })}
                </p>
                <p className="mt-1 text-sm text-ink">
                  {fill(t("qa_group_a"), {
                    team: withArticle(teamName, true),
                    group: team.group,
                    teammates: teammatesStr,
                  })}
                </p>
              </div>
            );
          })()}

          {/* Qualification remains relevant only before a team reaches the knockouts. */}
          {!hasKnockoutJourney && (() => {
            const teamName = country(team.key);
            return (
              <div className="rounded-lg border border-line bg-surface/60 px-4 py-3">
                <p className="font-heading text-[11px] font-extrabold uppercase tracking-wide text-faint">
                  {fill(t("qa_qualify_q"), { team: withArticle(teamName) })}
                </p>
                <p className="mt-1 text-sm text-ink">
                  {fill(t("qa_qualify_a"), { team: withArticle(teamName, true), group: team.group })}
                </p>
              </div>
            );
          })()}
        </div>
      </section>

      <div className="mt-5 flex flex-wrap gap-3 text-sm">
        {[
          { href: "/schedule", label: "Schedule" },
          { href: "/groups", label: "Groups" },
          { href: "/stats", label: "Stats" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-lg border border-line bg-surface px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-muted transition hover:border-lineStrong hover:text-white"
          >
            {l.label}
          </Link>
        ))}
      </div>

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
                className={`block rounded-lg border px-4 py-3 transition hover:border-lineStrong hover:bg-white/5 ${
                  isTeamMatch
                    ? "border-accent/30 bg-accent/10"
                    : "border-line bg-surface"
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
                  <span className="shrink-0 rounded bg-canvas px-2 py-1 font-heading text-xs font-bold uppercase text-faint">
                    {scoreOrVs(m)}
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
                <div className="mt-1.5 text-center text-xs text-faint">
                  <span className="font-semibold text-muted">
                    {formatDate(m.date)}
                    {m.time ? " · " : ""}
                    {statusText(m) ? statusText(m) : <MatchTime match={m} />}
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
          {hasKnockoutJourney ? "Group-stage history" : t("sec_standings")} · {t("lbl_group")} {team.group}
        </h2>
        <div className="overflow-hidden rounded-xl border border-line bg-surface">
          <StandingsTable teams={groupTeams} rows={standingsRows} currentTeamKey={team.key} />
        </div>
      </section>

      {/* ── PATH TO KNOCKOUT ────────────────────────────────────────────── */}
      {!hasKnockoutJourney && <section className="mt-8">
        <h2 className="mb-4 font-heading text-2xl font-extrabold uppercase tracking-wide text-white">
          {t("path_section")}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* 1st or 2nd */}
          <div
            className="rounded-xl border border-line bg-surface p-4"
            style={{ borderLeftColor: "#22c55e", borderLeftWidth: "3px" }}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-base leading-none">✅</span>
              <span className="font-heading text-xs font-extrabold uppercase tracking-wide text-green-400">
                {t("path_finish_top2")}
              </span>
            </div>
            <p className="text-sm font-bold text-white">{t("path_finish_top2_desc")}</p>
            <div className="mt-3 space-y-1 border-t border-line pt-3">
              <p className="text-xs text-muted">
                1st in Group {team.group}: M{pathSlots.winner?.matchNumber} vs{" "}
                {pathSlots.winner
                  ? slotLabel(pathSlots.winner.home.kind === "group" && pathSlots.winner.home.group === team.group ? pathSlots.winner.away : pathSlots.winner.home)
                  : "TBD"}.
              </p>
              <p className="text-xs text-muted">
                2nd in Group {team.group}: M{pathSlots.runnerUp?.matchNumber} vs{" "}
                {pathSlots.runnerUp
                  ? slotLabel(pathSlots.runnerUp.home.kind === "group" && pathSlots.runnerUp.home.group === team.group ? pathSlots.runnerUp.away : pathSlots.runnerUp.home)
                  : "TBD"}.
              </p>
            </div>
          </div>

          {/* 3rd */}
          <div
            className="rounded-xl border border-line bg-surface p-4"
            style={{ borderLeftColor: "#f59e0b", borderLeftWidth: "3px" }}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-base leading-none">🟡</span>
              <span className="font-heading text-xs font-extrabold uppercase tracking-wide text-amber-400">
                {t("path_finish_3rd")}
              </span>
            </div>
            <p className="text-sm font-bold text-white">{t("path_finish_3rd_desc")}</p>
            <div className="mt-3 border-t border-line pt-3">
              <p className="text-xs text-muted">{t("path_finish_3rd_note")}</p>
              <p className="mt-1 text-xs text-faint">
                Possible R32 slots: {pathSlots.third.map((slot) => `M${slot.matchNumber}`).join(", ") || "TBD"}.
              </p>
            </div>
          </div>

          {/* 4th */}
          <div
            className="rounded-xl border border-line bg-surface p-4"
            style={{ borderLeftColor: "#ef4444", borderLeftWidth: "3px" }}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-base leading-none">❌</span>
              <span className="font-heading text-xs font-extrabold uppercase tracking-wide text-red-400">
                {t("path_finish_4th")}
              </span>
            </div>
            <p className="text-sm font-bold text-white">{t("path_finish_4th_desc")}</p>
            <div className="mt-3 border-t border-line pt-3">
              <p className="text-xs text-muted">{t("path_finish_4th_note")}</p>
            </div>
          </div>
        </div>

        {/* Opener note */}
        {teamMatches[0] && (
          <p className="mt-4 font-heading text-[11px] font-bold uppercase tracking-widest text-faint">
            {fill(t("path_opener_note"), { team: withArticle(country(team.key)) })}
          </p>
        )}
      </section>}

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
                className="overflow-hidden rounded-xl border border-line bg-surface"
              >
                <div className="border-b-2 border-accent bg-canvas px-4 py-2.5">
                  <span className="font-heading text-sm font-extrabold uppercase tracking-wide text-white">
                    {t(`pos_${block.position}`)}
                  </span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wider text-faint">
                      <th className="w-10 px-3 py-2 text-start font-semibold">
                        #
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
                      <tr key={p.name} className="border-t border-line">
                        <td className="px-3 py-2 font-heading font-bold tabular-nums text-faint">
                          {p.number ?? "—"}
                        </td>
                        <td className="px-2 py-2 font-semibold text-white">{p.name}</td>
                        <td className="px-3 py-2 text-end text-xs text-muted">
                          {p.detailedPosition || t(`posOne_${p.position}`)}
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
