import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { Flag } from "@/components/Flag";
import { MatchTime } from "@/components/MatchTime";
import { TimezonePicker } from "@/components/TimezoneLabel";
import { LiveDataAutoRefresh } from "@/components/LiveDataAutoRefresh";
import { LiveSnapshotDebug } from "@/components/LiveSnapshotDebug";
import { FreshnessLabel } from "@/components/FreshnessLabel";
import { matchSlug, matchUtcDate, type Match } from "@/lib/matches";
import { countryName } from "@/lib/i18n";
import type { LiveMatchData } from "@/lib/liveMatchData";
import type { GoalScorerEvent } from "@/lib/worldcup26Provider";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { getLiveRefreshPolicy } from "@/lib/liveRefreshPolicy";
import { getTodayMatchesForTimeZone, nextUpcomingMatchesForTimeZone, resolveSelectedTimeZone } from "@/lib/todaySelection";
import { TZ_COOKIE } from "@/lib/timezone";

const BASE_URL = "https://www.worldcupmatchday.com";

export const revalidate = 30;
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "World Cup Matches Today — Scores, Fixtures & Kickoff Times",
  description:
    "See today's World Cup matches with scores, kickoff times, venues, goal scorers and timezone support.",
  alternates: { canonical: `${BASE_URL}/today` },
  openGraph: {
    title: "World Cup Matches Today — Scores, Fixtures & Kickoff Times",
    description:
      "See today's World Cup matches with scores, kickoff times, venues, goal scorers and timezone support.",
    url: `${BASE_URL}/today`,
    type: "website",
  },
};

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
                      {countryName(match.homeKey, "en")} {scoreText(live!)} {countryName(match.awayKey, "en")}
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
                    {countryName(match.homeKey, "en")} {scoreText(live!)} {countryName(match.awayKey, "en")} — LIVE
                  </Link>
                </p>
              ))}
              {syncing.map(({ match }) => (
                <p key={matchSlug(match)}>
                  <Link href={`/matches/${matchSlug(match)}`} className="font-semibold text-white hover:text-accent">
                    {countryName(match.homeKey, "en")} vs {countryName(match.awayKey, "en")} — score syncing
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
                {countryName(next.homeKey, "en")} vs {countryName(next.awayKey, "en")}
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
}: {
  m: Match;
  live: LiveMatchData | undefined;
  scorerEvents?: GoalScorerEvent[];
}) {
  const home = countryName(m.homeKey, "en");
  const away = countryName(m.awayKey, "en");
  const hasScore = live && live.homeScore !== null && live.awayScore !== null;
  const isLive = live?.status === "IN_PLAY" || live?.status === "PAUSED";
  const isFinished = live?.status === "FINISHED";
  const goals = scorerText(scorerEvents);

  return (
    <Link
      href={`/matches/${matchSlug(m)}`}
      className="flex flex-col gap-2 rounded-lg border border-white/10 bg-navyCard px-4 py-3 transition hover:border-white/20 hover:bg-white/5"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div data-today-score-cluster className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="flex flex-1 items-center justify-end gap-2 text-end">
              <span className="truncate font-semibold text-white">{home}</span>
              <Flag code={m.homeCode} alt="" width={30} height={22} />
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
            <div className="flex flex-1 items-center gap-2">
              <Flag code={m.awayCode} alt="" width={30} height={22} />
              <span className="truncate font-semibold text-white">{away}</span>
            </div>
          </div>
          {goals ? <p className="mt-1.5 truncate text-center text-[11px] text-white/40">Goals: {goals}</p> : null}
        </div>
        <div data-today-right-meta className="flex shrink-0 items-center justify-between gap-3 text-xs text-white/50 sm:w-36 sm:flex-col sm:items-end sm:text-end">
          <div className="flex items-center gap-2 sm:justify-end">
            {!hasScore && !isLive && !isFinished ? (
              <MatchTime match={m} withZone className="font-semibold text-white/80" />
            ) : null}
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
            {!hasScore && !isLive && !isFinished && (
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
  const today = getTodayMatchesForTimeZone({ timeZone: selectedTimeZone });
  const isToday = today.matches.length > 0;
  const fallbackDays = isToday ? [] : nextUpcomingMatchesForTimeZone({ timeZone: selectedTimeZone });
  const days = isToday ? [{ date: today.date, matches: today.matches }] : fallbackDays;
  const summaryMatches = isToday ? today.matches : (fallbackDays[0]?.matches ?? []);

  // One bulk fetch for all today's matches — no per-match API calls.
  const snapshot = await getTournamentLiveSnapshot();
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
          {isToday ? "World Cup Matches Today" : "No World Cup Matches Today"}
        </h1>
        <p className="mb-2 max-w-3xl text-sm text-white/50">
          Follow today&apos;s World Cup matches with scores, kickoff times in your selected timezone,
          venues and match status. Finished matches include final scores and goal scorers when available.
        </p>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <TimezonePicker className="flex flex-wrap items-center gap-2 text-[11px] text-white/55" />
          <FreshnessLabel generatedAt={snapshot.generatedAt} />
        </div>

        {isToday && <TodaySummary matches={summaryMatches} liveData={liveData} scorerLines={scorerLines} />}

        {!isToday && (
          <div className="mb-6 rounded-xl border border-white/10 bg-navyCard px-4 py-4 text-sm text-white/60">
            <p className="font-semibold text-white/80">No World Cup matches are scheduled today.</p>
            <p className="mt-1">Here are the next upcoming fixtures. See the full {" "}
              <Link href="/schedule" className="font-semibold text-accent underline underline-offset-2 hover:text-white">match schedule</Link>{" "}
              or the {" "}
              <Link href="/groups" className="font-semibold text-accent underline underline-offset-2 hover:text-white">group standings</Link>.
            </p>
          </div>
        )}

        <div className="space-y-8">
          {days.map(({ date, matches }) => (
            <section key={date}>
              <h2 className="mb-3 border-b-2 border-accent pb-2 font-heading text-xl font-extrabold uppercase tracking-wide text-white">
                {isToday ? "Today" : "Next"} · {longDate(date)}
              </h2>
              <div className="space-y-2">
                {matches.map((m, i) => (
                  <MatchRow
                    key={`${date}-${i}`}
                    m={m}
                    live={m.providerIds?.footballData ? liveData[String(m.providerIds.footballData)] : undefined}
                    scorerEvents={scorerLines[matchSlug(m)]}
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
