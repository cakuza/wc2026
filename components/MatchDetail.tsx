"use client";

import Link from "next/link";
import { Flag } from "@/components/Flag";
import { KickoffDateTime } from "@/components/MatchTime";
import { useLang } from "@/components/LanguageProvider";
import { useTimezone } from "@/components/TimezoneProvider";
import { MATCHES, matchSlug, matchUtcDate, type Match } from "@/lib/matches";
import { formatKickoffTime } from "@/lib/timezone";
import type { MatchEvents } from "@/lib/matchEvents";
import type { LiveMatchData } from "@/lib/liveMatchData";
import type { StandingRow } from "@/lib/groupStandings";
import type { ThirdPlaceRow } from "@/lib/thirdPlaceRanking";
import { buildScorerSentence } from "@/lib/resultSummary";
import { missingScorerDetailText } from "@/lib/goalEventCompleteness";

interface Props {
  match: Match;
  events?: MatchEvents | null;
  live?: LiveMatchData | null;
  groupStandings?: StandingRow[];
  thirdPlaceRows?: ThirdPlaceRow[];
}

type DisplayStatus = "upcoming" | "live" | "halftime" | "finished" | "syncing";

function useMatchStatus(match: Match): DisplayStatus {
  const now = new Date();
  const matchStart = matchUtcDate(match); // absolute instant, correct for any viewer timezone
  const matchEnd = new Date(matchStart.getTime() + 110 * 60 * 1000); // ~110 min
  if (now < matchStart) return "upcoming";
  if (now >= matchStart && now <= matchEnd) return "live";
  return "finished";
}

/** Map a football-data.org status onto our display states. Returns null for
 *  statuses that should fall back to the time-based estimate (e.g. POSTPONED). */
function liveStatusToDisplay(status: LiveMatchData["status"]): DisplayStatus | null {
  switch (status) {
    case "SCHEDULED":
    case "TIMED":
      return "upcoming";
    case "IN_PLAY":
      return "live";
    case "PAUSED":
      return "halftime";
    case "FINISHED":
      return "finished";
    default:
      return null;
  }
}

function StatusBadge({ status, t }: { status: DisplayStatus; t: (k: string) => string }) {
  if (status === "live") {
    return (
      <span className="inline-flex animate-pulse items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 font-heading text-xs font-extrabold uppercase tracking-widest text-white">
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
        {t("match_live")}
      </span>
    );
  }
  if (status === "halftime") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600/70 px-3 py-1 font-heading text-xs font-extrabold uppercase tracking-widest text-white">
        {t("match_halftime")}
      </span>
    );
  }
  if (status === "finished") {
    return (
      <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 font-heading text-xs font-extrabold uppercase tracking-widest text-white/60">
        {t("match_final")}
      </span>
    );
  }
  if (status === "syncing") {
    return (
      <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 font-heading text-xs font-extrabold uppercase tracking-widest text-white/40">
        {t("match_syncing")}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-accent/20 px-3 py-1 font-heading text-xs font-extrabold uppercase tracking-widest text-accent">
      {t("match_upcoming")}
    </span>
  );
}

function EventSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-navyCard">
      <div className="flex items-center gap-2 border-b border-white/10 bg-navy/50 px-4 py-3">
        <span className="text-base leading-none">{icon}</span>
        <span className="font-heading text-sm font-extrabold uppercase tracking-wide text-white">
          {title}
        </span>
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}

function EmptyEvents({ note }: { note: string }) {
  return <p className="text-sm text-white/40">{note}</p>;
}

function pointText(points: number) {
  return `${points} ${points === 1 ? "point" : "points"}`;
}

function ordinal(n: number) {
  const suffix = n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th";
  return `${n}${suffix}`;
}

export function MatchDetail({ match, events, live, groupStandings, thirdPlaceRows }: Props) {
  const { t, country, formatDate } = useLang();
  const { timeZone } = useTimezone();
  const timeBasedStatus = useMatchStatus(match);
  const liveStatus = live ? liveStatusToDisplay(live.status) : null;

  const homeScore = live?.homeScore ?? events?.score.home ?? null;
  const awayScore = live?.awayScore ?? events?.score.away ?? null;
  const hasScore = homeScore !== null && awayScore !== null;

  // "syncing": provider says SCHEDULED/TIMED but kickoff already passed (stale data),
  // OR provider says IN_PLAY but no score available yet — never show "vs + LIVE".
  const status: DisplayStatus =
    (liveStatus === "upcoming" && timeBasedStatus !== "upcoming") ||
    (liveStatus === "live" && !hasScore)
      ? "syncing"
      : liveStatus ?? timeBasedStatus;

  const lastSyncedTime = live ? formatKickoffTime(new Date(live.lastSyncedAt), timeZone) : null;
  const isConfirmedFinished = live?.status === "FINISHED" && hasScore;
  const homeName = country(match.homeKey);
  const awayName = country(match.awayKey);
  const homeStanding = groupStandings?.find((row) => row.teamKey === match.homeKey);
  const awayStanding = groupStandings?.find((row) => row.teamKey === match.awayKey);
  const homeRank = groupStandings?.findIndex((row) => row.teamKey === match.homeKey);
  const awayRank = groupStandings?.findIndex((row) => row.teamKey === match.awayKey);
  const matchTime = matchUtcDate(match).getTime();
  const nextMatches = [match.homeKey, match.awayKey]
    .map((teamKey) => {
      const next = MATCHES
        .filter((m) => (m.homeKey === teamKey || m.awayKey === teamKey) && matchUtcDate(m).getTime() > matchTime)
        .sort((a, b) => matchUtcDate(a).getTime() - matchUtcDate(b).getTime())[0];
      return next ? { teamKey, match: next } : null;
    })
    .filter(Boolean) as { teamKey: string; match: Match }[];
  const groupThirdPlace = thirdPlaceRows?.find((row) => row.group === match.group);
  const winnerText =
    hasScore && homeScore! > awayScore!
      ? `${homeName} beat ${awayName} ${homeScore}–${awayScore}`
      : hasScore && awayScore! > homeScore!
        ? `${awayName} beat ${homeName} ${awayScore}–${homeScore}`
        : hasScore
          ? `${homeName} and ${awayName} drew ${homeScore}–${awayScore}`
          : "";
  const goalCompleteness = live?.goalEventCompleteness;
  const missingGoalText = missingScorerDetailText(goalCompleteness?.missingGoalEventCount ?? 0);
  const scorers = buildScorerSentence(live?.goals, homeName, awayName, goalCompleteness);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Back link */}
      <Link
        href="/schedule"
        className="font-heading text-sm font-bold uppercase tracking-wide text-white/50 transition hover:text-accent"
      >
        ← {t("match_backSched")}
      </Link>

      {/* ── MATCH HERO ───────────────────────────────────────────────────── */}
      <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/10 bg-navyCard">
        {/* Background: team colors as a split gradient */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            background:
              "linear-gradient(to right, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)",
          }}
          aria-hidden="true"
        />

        <div className="relative px-6 py-8 sm:px-10">
          {/* Group + matchday badge */}
          <div className="mb-6 flex justify-center">
            <span className="rounded-full bg-accent/20 px-3 py-1 font-heading text-xs font-extrabold uppercase tracking-widest text-accent">
              {t("lbl_group")} {match.group}
            </span>
          </div>

          {/* Teams row */}
          <div className="flex items-center justify-between gap-4">
            {/* Home team */}
            <div className="flex flex-1 flex-col items-center gap-3 text-center">
              <Flag
                code={match.homeCode}
                name={country(match.homeKey)}
                width={80}
                height={56}
                className="rounded-lg shadow-2xl ring-1 ring-white/15"
              />
              <span className="font-heading text-lg font-extrabold uppercase leading-tight text-white sm:text-xl">
                {country(match.homeKey)}
              </span>
            </div>

            {/* Score / VS */}
            <div className="flex shrink-0 flex-col items-center gap-2">
              {hasScore ? (
                <div className="flex items-center gap-3">
                  <span className="font-heading text-5xl font-black tabular-nums text-white sm:text-6xl">
                    {homeScore}
                  </span>
                  <span className="font-heading text-2xl font-bold text-white/30">–</span>
                  <span className="font-heading text-5xl font-black tabular-nums text-white sm:text-6xl">
                    {awayScore}
                  </span>
                </div>
              ) : (
                <span className="font-heading text-base font-extrabold uppercase tracking-widest text-white/30">
                  {t("vs")}
                </span>
              )}
            </div>

            {/* Away team */}
            <div className="flex flex-1 flex-col items-center gap-3 text-center">
              <Flag
                code={match.awayCode}
                name={country(match.awayKey)}
                width={80}
                height={56}
                className="rounded-lg shadow-2xl ring-1 ring-white/15"
              />
              <span className="font-heading text-lg font-extrabold uppercase leading-tight text-white sm:text-xl">
                {country(match.awayKey)}
              </span>
            </div>
          </div>

          {/* Status badge */}
          <div className="mt-4 flex justify-center">
            <StatusBadge status={status} t={t} />
          </div>

          {/* Date / time / venue */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-white/50">
            {match.time ? (
              <KickoffDateTime match={match} className="font-semibold text-white/80" />
            ) : (
              <span className="font-semibold text-white/80">{formatDate(match.date)}</span>
            )}
            {match.venue && (
              <>
                <span>·</span>
                <span>{match.venue}</span>
              </>
            )}
          </div>

          {/* Sync note */}
          {live && (
            <p className="mt-2 text-center text-xs text-white/30">
              {t("match_scoreSyncNote")}
              {lastSyncedTime && ` ${t("match_lastSynced").replace("{time}", lastSyncedTime)}`}
            </p>
          )}
        </div>
      </div>

      {/* ── QUICK ANSWERS ────────────────────────────────────────────────── */}
      <section className="mt-4" aria-label="Quick answers about this match">
        <p className="mb-2 font-heading text-[10px] font-extrabold uppercase tracking-[0.25em] text-white/30">
          {t("match_quickAnswers")}
        </p>
        <div className="space-y-1.5">
          <div className="rounded-lg border border-white/8 bg-navyCard/60 px-4 py-3">
            <p className="font-heading text-[11px] font-extrabold uppercase tracking-wide text-white/40">
              {t("match_qa_when")}
            </p>
            <p className="mt-1 text-sm text-white/80">
              {match.time ? (
                <KickoffDateTime match={match} className="font-semibold text-white" />
              ) : (
                <span className="font-semibold text-white">{formatDate(match.date)}</span>
              )}
            </p>
          </div>
          {match.venue && (
            <div className="rounded-lg border border-white/8 bg-navyCard/60 px-4 py-3">
              <p className="font-heading text-[11px] font-extrabold uppercase tracking-wide text-white/40">
                {t("match_qa_where")}
              </p>
              <p className="mt-1 text-sm font-semibold text-white">{match.venue}</p>
            </div>
          )}
          <div className="rounded-lg border border-white/8 bg-navyCard/60 px-4 py-3">
            <p className="font-heading text-[11px] font-extrabold uppercase tracking-wide text-white/40">
              {t("match_qa_group")}
            </p>
            <p className="mt-1 text-sm text-white/80">
              <span className="font-semibold text-white">
                {t("lbl_group")} {match.group}
              </span>{" "}
              — {country(match.homeKey)} {t("vs")} {country(match.awayKey)}
            </p>
          </div>
        </div>
      </section>

      {/* ── EVENTS (live / finished) or PREVIEW (upcoming) ──────────────── */}
      <div className="mt-6 space-y-4">
        {status === "upcoming" ? (
          /* Pre-match preview */
          <EventSection title={t("match_preview")} icon="🔭">
            <p className="text-sm text-white/50">{t("match_previewNote")}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-navy/60 p-3 text-center">
                <Flag
                  code={match.homeCode}
                  name={country(match.homeKey)}
                  width={40}
                  height={28}
                  className="mx-auto rounded-sm"
                />
                <p className="mt-2 font-heading text-xs font-extrabold uppercase tracking-wide text-white">
                  {country(match.homeKey)}
                </p>
                <p className="mt-0.5 text-xs text-white/40">{t("lbl_group")} {match.group}</p>
              </div>
              <div className="rounded-lg bg-navy/60 p-3 text-center">
                <Flag
                  code={match.awayCode}
                  name={country(match.awayKey)}
                  width={40}
                  height={28}
                  className="mx-auto rounded-sm"
                />
                <p className="mt-2 font-heading text-xs font-extrabold uppercase tracking-wide text-white">
                  {country(match.awayKey)}
                </p>
                <p className="mt-0.5 text-xs text-white/40">{t("lbl_group")} {match.group}</p>
              </div>
            </div>
          </EventSection>
        ) : (
          <>
            {/* Goals */}
            <EventSection title={t("match_goals")} icon="⚽">
              {live?.eventDataAvailable && live.goals && live.goals.length > 0 ? (
                <ul className="space-y-2">
                  {live.goals.map((g, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <span className="w-8 shrink-0 text-right font-heading font-bold tabular-nums text-white/50">
                        {g.minuteLabel ?? (g.minute != null ? `${g.minute}'` : "—")}
                      </span>
                      <span className="font-semibold text-white">{g.playerName ?? "Scorer pending"}</span>
                      {(g.type === "OWN_GOAL" || g.isOwnGoal) && (
                        <span className="text-xs text-red-400">(OG)</span>
                      )}
                      {g.type === "PENALTY_GOAL" && (
                        <span className="text-xs text-yellow-400">(P)</span>
                      )}
                    </li>
                  ))}
                  {missingGoalText ? (
                    <li className="pt-1 text-sm text-white/45">{missingGoalText}</li>
                  ) : null}
                </ul>
              ) : live?.eventDataAvailable ? (
                <EmptyEvents note={missingGoalText ?? "No goals recorded"} />
              ) : hasScore ? (
                <EmptyEvents note={missingGoalText ?? "Goal scorer details are not available from the current data sync."} />
              ) : (
                <EmptyEvents note={t("match_noEvents")} />
              )}
            </EventSection>

            {/* Cards — only shown when the provider actually returned booking data */}
            {live?.eventDataAvailable && live.bookings && live.bookings.length > 0 && (
              <EventSection title={t("match_bookings")} icon="🟨">
                <ul className="space-y-2">
                  {live.bookings.map((b, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <span className="w-8 shrink-0 text-right font-heading font-bold tabular-nums text-white/50">
                        {b.minute != null ? `${b.minute}'` : "—"}
                      </span>
                      <span
                        className={`h-4 w-3 shrink-0 rounded-sm ${
                          b.type === "RED_CARD" ? "bg-red-500" : "bg-yellow-400"
                        }`}
                        aria-label={b.type}
                      />
                      <span className="font-semibold text-white">{b.playerName ?? "—"}</span>
                    </li>
                  ))}
                </ul>
              </EventSection>
            )}

            {/* Substitutions — only shown when the provider actually returned substitution data */}
            {live?.eventDataAvailable && live.substitutions && live.substitutions.length > 0 && (
              <EventSection title={t("match_subs")} icon="🔄">
                <ul className="space-y-2">
                  {live.substitutions.map((s, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <span className="w-8 shrink-0 text-right font-heading font-bold tabular-nums text-white/50">
                        {s.minute != null ? `${s.minute}'` : "—"}
                      </span>
                      <span className="text-green-400">↑</span>
                      <span className="font-semibold text-white">{s.playerName ?? "—"}</span>
                      <span className="text-white/30">/</span>
                      <span className="text-red-400">↓</span>
                      <span className="text-white/60">{s.detail ?? "—"}</span>
                    </li>
                  ))}
                </ul>
              </EventSection>
            )}
          </>
        )}
      </div>

      {isConfirmedFinished && (
        <section className="mt-6 space-y-4">
          <EventSection title="Result summary" icon="⚽">
            <p className="text-sm leading-relaxed text-white/70">
              {winnerText} in Group {match.group}.{scorers ? ` ${scorers}` : ""}
            </p>
          </EventSection>

          {(homeStanding || awayStanding) && (
            <EventSection title="What this result means" icon="📊">
              <div className="space-y-2 text-sm leading-relaxed text-white/70">
                {homeStanding && (
                  <p>
                    {homeName} are on {pointText(homeStanding.points)} in Group {match.group}
                    {typeof homeRank === "number" && homeRank >= 0 ? ` and currently ${ordinal(homeRank + 1)} in the group` : ""}.
                  </p>
                )}
                {awayStanding && (
                  <p>
                    {awayName} are on {pointText(awayStanding.points)} in Group {match.group}
                    {typeof awayRank === "number" && awayRank >= 0 ? ` and currently ${ordinal(awayRank + 1)} in the group` : ""}.
                  </p>
                )}
                {groupThirdPlace && (
                  <p>
                    Group {match.group}&apos;s third-place position is reflected in the third-place ranking table.
                  </p>
                )}
              </div>
            </EventSection>
          )}

          {nextMatches.length > 0 && (
            <EventSection title="Next matches" icon="🗓">
              <div className="space-y-2">
                {nextMatches.map(({ teamKey, match: next }) => (
                  <Link
                    key={`${teamKey}-${matchSlug(next)}`}
                    href={`/matches/${matchSlug(next)}`}
                    className="block rounded-lg border border-white/10 bg-navy/50 px-3 py-2 text-sm text-white/70 transition hover:border-white/20 hover:text-white"
                  >
                    <span className="font-semibold text-white">{country(teamKey)}</span>
                    {" — "}
                    {country(next.homeKey)} {t("vs")} {country(next.awayKey)}
                    {" · "}
                    <KickoffDateTime match={next} className="font-semibold text-white/80" />
                  </Link>
                ))}
              </div>
            </EventSection>
          )}

          <div className="flex flex-wrap gap-3 text-sm">
            {[
              { href: "/groups", label: `View Group ${match.group} standings` },
              { href: "/today", label: "See today's matches" },
              { href: "/stats", label: "See tournament stats" },
              { href: "/world-cup-third-place-qualification", label: "See third-place ranking" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg border border-white/15 bg-navyCard px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-white/70 transition hover:border-white/30 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

