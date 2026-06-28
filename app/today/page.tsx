import { getResolvedHomeTeam, getResolvedAwayTeam, getResolvedHomeCode, getResolvedAwayCode, getParticipantDisplayLabel, isKnockoutMatch } from "@/lib/participant-resolution";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { Flag } from "@/components/Flag";
import { MatchTime } from "@/components/MatchTime";
import { TimezonePicker } from "@/components/TimezoneLabel";
import { LiveDataAutoRefresh } from "@/components/LiveDataAutoRefresh";
import { LiveSnapshotDebug } from "@/components/LiveSnapshotDebug";
import { FreshnessLabel } from "@/components/FreshnessLabel";
import { MatchdayDateNav } from "@/components/MatchdayDateNav";
import { LiveDataUnavailableNotice } from "@/components/LiveDataUnavailableNotice";
import { matchSlug, matchUtcDate, type Match } from "@/lib/matches";
import { countryName } from "@/lib/i18n";
import type { LiveMatchData } from "@/lib/liveMatchData";
import type { GoalScorerEvent } from "@/lib/worldcup26Provider";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { getLiveRefreshPolicy } from "@/lib/liveRefreshPolicy";
import {
  getMatchesForDateInZone,
  localHourInTimeZone,
  nextUpcomingMatchesForTimeZone,
  previousMatchdayWithMatches,
  resolveSelectedMatchday,
  resolveSelectedTimeZone,
} from "@/lib/todaySelection";
import { TZ_COOKIE } from "@/lib/timezone";

const BASE_URL = "https://www.worldcupmatchday.com";

// Local-time window after midnight where users still think of the just-finished
// matchday as "tonight's games" — drives the previous-matchday continuity link.
const MIDNIGHT_CONTINUITY_END_HOUR = 3;

export const revalidate = 30;
export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = searchParams ? await searchParams : {};
  const hasDateParam = typeof params.date === "string" && params.date.length > 0;
  return {
    title: "World Cup Matches Today — Scores, Fixtures & Kickoff Times",
    description:
      "See today's World Cup matches with scores, kickoff times, venues, goal scorers and timezone support.",
    // A single canonical /today regardless of ?date=/?tz= avoids duplicate
    // indexable URLs; dated views are explicitly de-indexed.
    alternates: { canonical: `${BASE_URL}/today` },
    robots: hasDateParam ? { index: false, follow: true } : undefined,
    openGraph: {
      title: "World Cup Matches Today — Scores, Fixtures & Kickoff Times",
      description:
        "See today's World Cup matches with scores, kickoff times, venues, goal scorers and timezone support.",
      url: `${BASE_URL}/today`,
      type: "website",
    },
  };
}

const FAQS: { q: string; a: string }[] = [
  {
    q: "Who plays today in the World Cup?",
    a: "When games are scheduled, today's fixtures are listed above with their kickoff times, groups and venues. If there are no matches today, the next upcoming matchday is shown instead.",
  },
  {
    q: "What time are today's World Cup matches?",
    a: "Kickoff times are shown in your selected timezone (defaults to your device's timezone, with US Eastern as the fallback, and can be changed using the timezone selector). The tournament's opening match kicked off at 3:00 PM ET / 1:00 PM Mexico City time on 11 June 2026.",
  },
  {
    q: "Where can I see the full World Cup schedule?",
    a: "The complete fixture list is on the schedule page, and the 12 groups with standings are on the groups page.",
  },
  {
    q: "Is WorldCupMatchDay affiliated with FIFA?",
    a: "No. WorldCupMatchDay is an independent fan resource for following the 2026 World Cup and is not affiliated with FIFA.",
  },
];

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

function longDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${iso}T00:00:00`));
}

function scoreText(live: LiveMatchData) {
  if (live.homeScore === null || live.awayScore === null) return null;
  return `${live.homeScore}–${live.awayScore}`;
}

function scorerText(events: GoalScorerEvent[] | undefined) {
  if (!events || events.length === 0) return null;
  return events
    .map((e) => {
      const minute = e.minuteLabel ?? (e.minute != null ? `${e.minute}'` : "");
      const name = shortScorerName(e.playerName);
      return `${minute ? `${minute} ` : ""}${name}${e.isOwnGoal ? " (OG)" : e.isPenalty || e.type === "PENALTY_GOAL" ? " (P)" : ""}`;
    })
    .join(" · ");
}

function shortScorerName(playerName: string) {
  if (playerName.includes(".")) return playerName;
  const parts = playerName.trim().split(/\s+/);
  return parts[parts.length - 1] ?? playerName;
}

function TodaySummary({
  matches,
  liveData,
  scorerLines,
}: {
  matches: Match[];
  liveData: Record<string, LiveMatchData>;
  scorerLines: Record<string, GoalScorerEvent[]>;
}) {
  const rows = matches
    .map((match) => {
      const live = match.providerIds?.footballData
        ? liveData[String(match.providerIds.footballData)]
        : undefined;
      return { match, live };
    })
    .filter(({ live }) => !!live);

  const finished = rows.filter(
    ({ live }) => live?.status === "FINISHED" && live.homeScore !== null && live.awayScore !== null,
  );
  const syncing = rows.filter(
    ({ live }) =>
      (live?.status === "IN_PLAY" || live?.status === "PAUSED") &&
      (live.homeScore === null || live.awayScore === null),
  );
  const inProgress = rows.filter(
    ({ live }) =>
      (live?.status === "IN_PLAY" || live?.status === "PAUSED") &&
      live.homeScore !== null &&
      live.awayScore !== null,
  );
  const upcoming = matches
    .filter((match) => {
      const live = match.providerIds?.footballData
        ? liveData[String(match.providerIds.footballData)]
        : undefined;
      return !live || live.status === "SCHEDULED" || live.status === "TIMED";
    })
    .sort((a, b) => matchUtcDate(a).getTime() - matchUtcDate(b).getTime());

  if (finished.length === 0 && syncing.length === 0 && inProgress.length === 0 && upcoming.length === 0) {
    return null;
  }

  const next = upcoming[0];

  return (
    <section className="mb-6 rounded-xl border border-white/10 bg-navyCard px-4 py-4">
      <h2 className="font-heading text-sm font-extrabold uppercase tracking-wide text-white">
        Today&apos;s matchday summary
      </h2>
      <div className="mt-3 space-y-3 text-sm text-white/70">
        {finished.length > 0 && (
          <div>
            <p className="font-heading text-[11px] font-bold uppercase tracking-widest text-white/35">
              Finished
            </p>
            <div className="mt-1 space-y-1">
              {finished.map(({ match, live }) => {
                const goals = scorerText(scorerLines[matchSlug(match)]);
                return (
                  <p key={matchSlug(match)}>
                    <Link href={`/matches/${matchSlug(match)}`} className="font-semibold text-white hover:text-accent">
                      {(getResolvedHomeTeam(match) ? countryName(getResolvedHomeTeam(match)!, "en") : (isKnockoutMatch(match) ? getParticipantDisplayLabel(match.homeSlot) : match.homeKey))} {scoreText(live!)} {(getResolvedAwayTeam(match) ? countryName(getResolvedAwayTeam(match)!, "en") : (isKnockoutMatch(match) ? getParticipantDisplayLabel(match.awaySlot) : match.awayKey))}
                    </Link>
                    {goals ? <span className="text-white/45"> — Goals: {goals}</span> : null}
                  </p>
                );
              })}
            </div>
          </div>
        )}

        {(inProgress.length > 0 || syncing.length > 0) && (
          <div>
            <p className="font-heading text-[11px] font-bold uppercase tracking-widest text-white/35">
              Score syncing
            </p>
            <div className="mt-1 space-y-1">
              {inProgress.map(({ match, live }) => (
                <p key={matchSlug(match)}>
                  <Link href={`/matches/${matchSlug(match)}`} className="font-semibold text-white hover:text-accent">
                    {(getResolvedHomeTeam(match) ? countryName(getResolvedHomeTeam(match)!, "en") : (isKnockoutMatch(match) ? getParticipantDisplayLabel(match.homeSlot) : match.homeKey))} {scoreText(live!)} {(getResolvedAwayTeam(match) ? countryName(getResolvedAwayTeam(match)!, "en") : (isKnockoutMatch(match) ? getParticipantDisplayLabel(match.awaySlot) : match.awayKey))} — LIVE
                  </Link>
                </p>
              ))}
              {syncing.map(({ match }) => (
                <p key={matchSlug(match)}>
                  <Link href={`/matches/${matchSlug(match)}`} className="font-semibold text-white hover:text-accent">
                    {(getResolvedHomeTeam(match) ? countryName(getResolvedHomeTeam(match)!, "en") : (isKnockoutMatch(match) ? getParticipantDisplayLabel(match.homeSlot) : match.homeKey))} vs {(getResolvedAwayTeam(match) ? countryName(getResolvedAwayTeam(match)!, "en") : (isKnockoutMatch(match) ? getParticipantDisplayLabel(match.awaySlot) : match.awayKey))} — score syncing
                  </Link>
                </p>
              ))}
            </div>
          </div>
        )}

        {next && (
          <div>
            <p className="font-heading text-[11px] font-bold uppercase tracking-widest text-white/35">
              Next kickoff
            </p>
            <p className="mt-1">
              <Link href={`/matches/${matchSlug(next)}`} className="font-semibold text-white hover:text-accent">
                {(getResolvedHomeTeam(next) ? countryName(getResolvedHomeTeam(next)!, "en") : (isKnockoutMatch(next) ? getParticipantDisplayLabel(next.homeSlot) : next.homeKey))} vs {(getResolvedAwayTeam(next) ? countryName(getResolvedAwayTeam(next)!, "en") : (isKnockoutMatch(next) ? getParticipantDisplayLabel(next.awaySlot) : next.awayKey))}
              </Link>{" "}
              — <MatchTime match={next} withZone className="font-semibold text-white/80" />
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

// Sync component — live data passed from page-level bulk fetch.
function MatchRow({
  m,
  live,
  scorerEvents,
  liveDataUnavailable,
}: {
  m: Match;
  live: LiveMatchData | undefined;
  scorerEvents?: GoalScorerEvent[];
  liveDataUnavailable?: boolean;
}) {
  const homeKey = getResolvedHomeTeam(m);
  const home = homeKey ? countryName(homeKey, "en") : (isKnockoutMatch(m) ? getParticipantDisplayLabel(m.homeSlot) : m.homeKey);
  const awayKey = getResolvedAwayTeam(m);
  const away = awayKey ? countryName(awayKey, "en") : (isKnockoutMatch(m) ? getParticipantDisplayLabel(m.awaySlot) : m.awayKey);
  // In the cold-start fallback a started match has an unknown result — never
  // show it as Scheduled or invent a score.
  const hasScore = !liveDataUnavailable && live && live.homeScore !== null && live.awayScore !== null;
  const isLive = !liveDataUnavailable && (live?.status === "IN_PLAY" || live?.status === "PAUSED");
  const isFinished = !liveDataUnavailable && live?.status === "FINISHED";
  const goals = liveDataUnavailable ? null : scorerText(scorerEvents);

  return (
    <Link
      href={`/matches/${matchSlug(m)}`}
      className="flex flex-col gap-2 rounded-lg border border-white/10 bg-navyCard px-4 py-3 transition hover:border-white/20 hover:bg-white/5"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div data-today-score-cluster className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-end">
              <span className="truncate font-semibold text-white">{home}</span>
              <Flag code={getResolvedHomeCode(m) ?? m.homeCode} alt="" width={30} height={22} />
            </div>
            {hasScore ? (
              <span className="shrink-0 font-heading text-sm font-extrabold tabular-nums text-white">
                {live!.homeScore}–{live!.awayScore}
              </span>
            ) : (
              <span className="shrink-0 rounded bg-navy px-2 py-1 font-heading text-xs font-bold uppercase text-white/50">
                vs
              </span>
            )}
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Flag code={getResolvedAwayCode(m) ?? m.awayCode} alt="" width={30} height={22} />
              <span className="truncate font-semibold text-white">{away}</span>
            </div>
          </div>
          {goals ? <p className="mt-1.5 truncate text-center text-[11px] text-white/40">Goals: {goals}</p> : null}
        </div>
        <div data-today-right-meta className="flex shrink-0 items-center justify-between gap-3 text-xs text-white/50 sm:w-36 sm:flex-col sm:items-end sm:text-end">
          <div className="flex items-center gap-2 sm:justify-end">
            {!hasScore && !isLive && !isFinished && !liveDataUnavailable ? (
              <MatchTime match={m} withZone className="font-semibold text-white/80" />
            ) : null}
            {liveDataUnavailable && (
              <span className="rounded bg-amber-400/15 px-1.5 py-0.5 font-heading text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
                Live data unavailable
              </span>
            )}
            {isLive && hasScore && (
              <span className="rounded bg-red-600 px-1.5 py-0.5 font-heading text-[10px] font-extrabold uppercase tracking-widest text-white">
                {live?.status === "PAUSED" ? "HT" : "Live"}
              </span>
            )}
            {isLive && !hasScore && (
              <span className="rounded bg-white/5 px-1.5 py-0.5 font-heading text-[10px] font-extrabold uppercase tracking-widest text-white/30">
                Syncing
              </span>
            )}
            {isFinished && (
              <span className="rounded bg-white/10 px-1.5 py-0.5 font-heading text-[10px] font-extrabold uppercase tracking-widest text-white/60">
                FT
              </span>
            )}
            {!hasScore && !isLive && !isFinished && !liveDataUnavailable && (
              <span className="rounded bg-white/5 px-1.5 py-0.5 font-heading text-[10px] font-extrabold uppercase tracking-widest text-white/30">
                Scheduled
              </span>
            )}
          </div>
          <div>
            {m.group ? `Group ${m.group}` : ""}
            {m.group && m.venue ? " · " : ""}
            {m.venue ?? ""}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function TodayPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const cookieTz = (await cookies()).get(TZ_COOKIE)?.value;
  const selectedTimeZone = resolveSelectedTimeZone(params.tz, cookieTz);

  // Resolve which local calendar date to show: a valid in-range ?date= wins,
  // otherwise the viewer's actual local today. "Today" never changes meaning.
  const resolved = resolveSelectedMatchday({ dateParam: params.date, timeZone: selectedTimeZone });
  const selectedMatches = getMatchesForDateInZone({ date: resolved.date, timeZone: selectedTimeZone });
  const hasSelectedMatches = selectedMatches.length > 0;

  // Only the default (no explicit date) today-view with nothing scheduled falls
  // back to "next upcoming"; an explicit empty date shows an empty state.
  const showUpcomingFallback = !resolved.isExplicitDate && !hasSelectedMatches;
  const fallbackDays = showUpcomingFallback
    ? nextUpcomingMatchesForTimeZone({ timeZone: selectedTimeZone })
    : [];

  const days = hasSelectedMatches ? [{ date: resolved.date, matches: selectedMatches }] : fallbackDays;
  const summaryMatches = hasSelectedMatches ? selectedMatches : (fallbackDays[0]?.matches ?? []);
  const isToday = resolved.isToday;

  // Post-midnight continuity: while it's still the early hours locally and
  // yesterday actually had matches, surface a one-tap link back to them.
  const localHour = localHourInTimeZone(new Date(), selectedTimeZone);
  const inMidnightWindow = localHour >= 0 && localHour < MIDNIGHT_CONTINUITY_END_HOUR;
  const previousMatchday =
    !resolved.isExplicitDate && inMidnightWindow
      ? previousMatchdayWithMatches({ fromDate: resolved.todayDate, timeZone: selectedTimeZone })
      : null;

  // One bulk fetch for all today's matches — no per-match API calls.
  const snapshot = await getTournamentLiveSnapshot();
  const isFallbackSnapshot = snapshot.isFallback === true;
  const liveData = snapshot.liveDataByProviderId;
  const scorerLines: Record<string, GoalScorerEvent[]> = {};
  for (const [id, entry] of Object.entries(snapshot.matches)) {
    if (entry.scorers.length > 0) scorerLines[id] = entry.scorers;
  }
  const refreshPolicy = getLiveRefreshPolicy(
    summaryMatches.map((match) => {
      const snap = snapshot.matches[matchSlug(match)];
      return {
        match,
        status: snap?.status ?? "SCHEDULED",
        providerUpdatedAt: snap?.providerUpdatedAt,
      };
    }),
  );

  return (
    <>
      <LiveDataAutoRefresh intervalMs={refreshPolicy.intervalMs} />
      <LiveSnapshotDebug snapshotId={snapshot.snapshotId} generatedAt={snapshot.generatedAt} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-2 font-heading text-4xl font-extrabold uppercase tracking-wide text-white">
          {hasSelectedMatches
            ? isToday
              ? "World Cup Matches Today"
              : "World Cup Matches"
            : isToday
              ? "No World Cup Matches Today"
              : "No World Cup Matches"}
        </h1>
        <p className="mb-2 max-w-3xl text-sm text-white/50">
          Follow World Cup matches with scores, kickoff times in your selected timezone,
          venues and match status. Finished matches include final scores and goal scorers when available.
        </p>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <TimezonePicker className="flex flex-wrap items-center gap-2 text-[11px] text-white/55" />
          <FreshnessLabel
            primaryProviderFetchedAt={snapshot.primaryProviderFetchedAt}
            primaryProviderOk={snapshot.primaryProviderOk}
          />
        </div>

        <MatchdayDateNav
          selectedDate={resolved.date}
          todayDate={resolved.todayDate}
          isToday={resolved.isToday}
          prevDate={resolved.prevDate}
          nextDate={resolved.nextDate}
        />

        <LiveDataUnavailableNotice show={isFallbackSnapshot} />

        {previousMatchday && (
          <Link
            href={`/today?date=${previousMatchday}&tz=${encodeURIComponent(selectedTimeZone)}`}
            className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm transition hover:border-accent/50 hover:bg-accent/15"
          >
            <span className="font-semibold text-white">
              Just after midnight — view the previous matchday&apos;s completed matches.
            </span>
            <span className="shrink-0 font-heading text-xs font-bold uppercase tracking-wide text-accent">
              {longDate(previousMatchday)} →
            </span>
          </Link>
        )}

        {isToday && hasSelectedMatches && (
          <TodaySummary matches={summaryMatches} liveData={liveData} scorerLines={scorerLines} />
        )}

        {showUpcomingFallback && (
          <div className="mb-6 rounded-xl border border-white/10 bg-navyCard px-4 py-4 text-sm text-white/60">
            <p className="font-semibold text-white/80">No World Cup matches are scheduled today.</p>
            <p className="mt-1">Here are the next upcoming fixtures. See the full {" "}
              <Link href="/schedule" className="font-semibold text-accent underline underline-offset-2 hover:text-white">match schedule</Link>{" "}
              or the {" "}
              <Link href="/groups" className="font-semibold text-accent underline underline-offset-2 hover:text-white">group standings</Link>.
            </p>
          </div>
        )}

        {resolved.isExplicitDate && !hasSelectedMatches && (
          <div className="mb-6 rounded-xl border border-white/10 bg-navyCard px-4 py-4 text-sm text-white/60">
            <p className="font-semibold text-white/80">No World Cup matches on this date.</p>
            <p className="mt-1">Use the date controls above to find another matchday, or see the full {" "}
              <Link href="/schedule" className="font-semibold text-accent underline underline-offset-2 hover:text-white">match schedule</Link>.
            </p>
          </div>
        )}

        <div className="space-y-8">
          {days.map(({ date, matches }) => (
            <section key={date}>
              <h2 className="mb-3 border-b-2 border-accent pb-2 font-heading text-xl font-extrabold uppercase tracking-wide text-white">
                {showUpcomingFallback ? "Next" : isToday ? "Today" : "Matches"} · {longDate(date)}
              </h2>
              <div className="space-y-2">
                {matches.map((m, i) => (
                  <MatchRow
                    key={`${date}-${i}`}
                    m={m}
                    live={m.providerIds?.footballData ? liveData[String(m.providerIds.footballData)] : undefined}
                    scorerEvents={scorerLines[matchSlug(m)]}
                    liveDataUnavailable={snapshot.matches[matchSlug(m)]?.liveDataUnavailable}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Quick links */}
        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <Link href="/schedule" className="rounded-lg border border-white/15 bg-navyCard px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-white/70 transition hover:border-white/30 hover:text-white">
            Full Schedule
          </Link>
          <Link href="/groups" className="rounded-lg border border-white/15 bg-navyCard px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-white/70 transition hover:border-white/30 hover:text-white">
            Groups
          </Link>
          <Link href="/stats" className="rounded-lg border border-white/15 bg-navyCard px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-white/70 transition hover:border-white/30 hover:text-white">
            Stats
          </Link>
          <Link href="/world-cup-third-place-qualification" className="rounded-lg border border-white/15 bg-navyCard px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-white/70 transition hover:border-white/30 hover:text-white">
            Third-Place Ranking
          </Link>
          <Link href="/world-cup-schedule-local-time" className="rounded-lg border border-white/15 bg-navyCard px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-white/70 transition hover:border-white/30 hover:text-white">
            Schedule by Time Zone
          </Link>
        </div>

        {/* FAQ */}
        <section className="mt-10">
          <h2 className="mb-3 font-heading text-2xl font-extrabold uppercase tracking-wide text-white">
            FAQ
          </h2>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <div key={f.q} className="rounded-xl border border-white/10 bg-navyCard p-4">
                <h3 className="font-heading text-sm font-extrabold uppercase tracking-wide text-white sm:text-base">
                  {f.q}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
