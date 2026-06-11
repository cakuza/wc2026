"use client";

import Link from "next/link";
import { Flag } from "@/components/Flag";
import { KickoffDateTime } from "@/components/MatchTime";
import { useLang } from "@/components/LanguageProvider";
import { useTimezone } from "@/components/TimezoneProvider";
import { matchUtcDate, type Match } from "@/lib/matches";
import { formatKickoffTime } from "@/lib/timezone";
import type { MatchEvents } from "@/lib/matchEvents";
import type { LiveMatchData } from "@/lib/liveMatchData";

interface Props {
  match: Match;
  events?: MatchEvents | null;
  live?: LiveMatchData | null;
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

export function MatchDetail({ match, events, live }: Props) {
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
                        {g.minute != null ? `${g.minute}'` : "—"}
                      </span>
                      <span className="font-semibold text-white">{g.playerName ?? "—"}</span>
                      {g.type === "OWN_GOAL" && (
                        <span className="text-xs text-red-400">(OG)</span>
                      )}
                      {g.type === "PENALTY_GOAL" && (
                        <span className="text-xs text-yellow-400">(P)</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : live?.eventDataAvailable ? (
                <EmptyEvents note="No goals recorded" />
              ) : hasScore ? (
                <EmptyEvents note="Goal scorer details are not available from the current data sync." />
              ) : (
                <EmptyEvents note={t("match_noEvents")} />
              )}
            </EventSection>

            {/* Cards */}
            <EventSection title={t("match_bookings")} icon="🟨">
              {live?.eventDataAvailable && live.bookings && live.bookings.length > 0 ? (
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
              ) : live?.eventDataAvailable ? (
                <EmptyEvents note="No bookings recorded" />
              ) : hasScore ? (
                <EmptyEvents note="Detailed event data is not available from the current data sync." />
              ) : (
                <EmptyEvents note={t("match_noEvents")} />
              )}
            </EventSection>

            {/* Substitutions */}
            <EventSection title={t("match_subs")} icon="🔄">
              {live?.eventDataAvailable && live.substitutions && live.substitutions.length > 0 ? (
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
              ) : live?.eventDataAvailable ? (
                <EmptyEvents note="No substitutions recorded" />
              ) : hasScore ? (
                <EmptyEvents note="Detailed event data is not available from the current data sync." />
              ) : (
                <EmptyEvents note={t("match_noEvents")} />
              )}
            </EventSection>
          </>
        )}
      </div>
    </div>
  );
}
