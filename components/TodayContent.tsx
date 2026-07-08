import Link from "next/link";
import { TimezonePicker } from "@/components/TimezoneLabel";
import { FreshnessLabel } from "@/components/FreshnessLabel";
import { MatchdayDateNav } from "@/components/MatchdayDateNav";
import { LiveDataUnavailableNotice } from "@/components/LiveDataUnavailableNotice";
import { TodayPageLiveSection } from "@/components/TodayPageLiveSection";
import {
  resolveSelectedMatchday,
  getMatchesForDateInZone,
  localHourInTimeZone,
  previousMatchdayWithMatches,
  nextUpcomingMatchesForTimeZone,
} from "@/lib/todaySelection";
import type { TodayLiveSnapshot } from "@/components/TodayMatches";

const MIDNIGHT_CONTINUITY_END_HOUR = 3;

function longDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${iso}T00:00:00`));
}

export function TodayContent({
  snapshot,
  isFallbackSnapshot,
  liveDataUnavailableByMatchId,
  dateParam,
  selectedTimeZone,
}: {
  snapshot: TodayLiveSnapshot;
  isFallbackSnapshot: boolean;
  liveDataUnavailableByMatchId: Record<string, boolean>;
  dateParam?: string;
  selectedTimeZone: string;
}) {
  const resolved = resolveSelectedMatchday({ dateParam, timeZone: selectedTimeZone });
  const selectedMatches = getMatchesForDateInZone({ date: resolved.date, timeZone: selectedTimeZone });
  const hasSelectedMatches = selectedMatches.length > 0;

  const showUpcomingFallback = !resolved.isExplicitDate && !hasSelectedMatches;
  const fallbackDays = showUpcomingFallback
    ? nextUpcomingMatchesForTimeZone({ timeZone: selectedTimeZone })
    : [];

  const days = hasSelectedMatches ? [{ date: resolved.date, matches: selectedMatches }] : fallbackDays;
  const summaryMatches = hasSelectedMatches ? selectedMatches : (fallbackDays[0]?.matches ?? []);
  const isToday = resolved.isToday;

  const localHour = localHourInTimeZone(new Date(), selectedTimeZone);
  const inMidnightWindow = localHour >= 0 && localHour < MIDNIGHT_CONTINUITY_END_HOUR;
  const previousMatchday =
    !resolved.isExplicitDate && inMidnightWindow
      ? previousMatchdayWithMatches({ fromDate: resolved.todayDate, timeZone: selectedTimeZone })
      : null;

  const longDateLabels = Object.fromEntries(days.map(({ date }) => [date, longDate(date)]));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 font-heading text-4xl font-extrabold uppercase tracking-wide text-white">
        {hasSelectedMatches
          ? isToday
            ? "World Cup Matches Today"
            : "World Cup Matches"
          : "Latest World Cup Results"}
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

      {showUpcomingFallback && (
        <div className="mb-6 rounded-xl border border-white/10 bg-navyCard px-4 py-4 text-sm text-white/60">
          <p className="font-semibold text-white/80">Latest Results</p>
          <p className="mt-1">The World Cup matches have concluded. See the full {" "}
            <Link href="/schedule" className="font-semibold text-accent underline underline-offset-2 hover:text-white">match schedule</Link>{" "}
            for complete results.
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

      <TodayPageLiveSection
        days={days}
        summaryMatches={summaryMatches}
        isToday={isToday}
        showUpcomingFallback={showUpcomingFallback}
        initialSnapshot={snapshot}
        initialLiveDataUnavailableByMatchId={liveDataUnavailableByMatchId}
        longDate={longDateLabels}
      />

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
    </div>
  );
}
