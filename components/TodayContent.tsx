import Link from "next/link";
import { TimezonePicker } from "@/components/TimezoneLabel";
import { FreshnessLabel } from "@/components/FreshnessLabel";
import { MatchdayDateNav } from "@/components/MatchdayDateNav";
import { LiveDataUnavailableNotice } from "@/components/LiveDataUnavailableNotice";
import { TodayPageLiveSection } from "@/components/TodayPageLiveSection";
import { MatchCenterContent } from "@/components/MatchCenterContent";
import {
  resolveSelectedMatchday,
  getMatchesForDateInZone,
  localHourInTimeZone,
  previousMatchdayWithMatches,
} from "@/lib/todaySelection";
import { ARCHIVE_DEFAULT_DATE } from "@/lib/matches";
import type { MatchCenterLiveSnapshot } from "@/components/MatchCenterContent";

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
  snapshot: MatchCenterLiveSnapshot;
  isFallbackSnapshot: boolean;
  liveDataUnavailableByMatchId: Record<string, boolean>;
  dateParam?: string;
  selectedTimeZone: string;
}) {
  const resolved = resolveSelectedMatchday({ dateParam, timeZone: selectedTimeZone });
  const selectedMatches = getMatchesForDateInZone({ date: resolved.date, timeZone: selectedTimeZone });
  const hasSelectedMatches = selectedMatches.length > 0;

  const isToday = resolved.isToday;

  const localHour = localHourInTimeZone(new Date(ARCHIVE_DEFAULT_DATE), selectedTimeZone);
  const inMidnightWindow = localHour >= 0 && localHour < MIDNIGHT_CONTINUITY_END_HOUR;
  const previousMatchday =
    !resolved.isExplicitDate && inMidnightWindow
      ? previousMatchdayWithMatches({ fromDate: resolved.todayDate, timeZone: selectedTimeZone })
      : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 font-heading text-4xl font-extrabold uppercase tracking-wide text-white">
        {resolved.isExplicitDate
          ? `World Cup Matches — ${longDate(resolved.date)}`
          : "World Cup Match Center"}
      </h1>
      <p className="mb-2 max-w-3xl text-sm text-white/50">
        Follow World Cup matches with scores, kickoff times in your selected timezone,
        venues and match status. Finished matches include final scores and goal scorers when available.
      </p>

      {!resolved.isExplicitDate && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          {/* MatchCenterContent has its own timezone and freshness label, but we can keep the picker here */}
          <TimezonePicker className="flex flex-wrap items-center gap-2 text-[11px] text-white/55" />
        </div>
      )}

      {resolved.isExplicitDate && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <TimezonePicker className="flex flex-wrap items-center gap-2 text-[11px] text-white/55" />
          <FreshnessLabel
            primaryProviderFetchedAt={snapshot.primaryProviderFetchedAt}
            primaryProviderOk={snapshot.primaryProviderOk}
          />
        </div>
      )}

      {resolved.isExplicitDate && (
        <MatchdayDateNav
          selectedDate={resolved.date}
          todayDate={resolved.todayDate}
          isToday={resolved.isToday}
          prevDate={resolved.prevDate}
          nextDate={resolved.nextDate}
        />
      )}

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
            {longDate(previousMatchday)} ?
          </span>
        </Link>
      )}

      {!resolved.isExplicitDate ? (
        <div className="mt-8">
          <MatchCenterContent liveSnapshot={snapshot} />
        </div>
      ) : (
        <>
          {hasSelectedMatches ? (
            <TodayPageLiveSection
              days={[{ date: resolved.date, matches: selectedMatches }]}
              summaryMatches={selectedMatches}
              isToday={isToday}
              showUpcomingFallback={false}
              initialSnapshot={snapshot}
              initialLiveDataUnavailableByMatchId={liveDataUnavailableByMatchId}
              longDate={{ [resolved.date]: longDate(resolved.date) }}
            />
          ) : (
            <div className="mb-6 rounded-xl border border-white/10 bg-navyCard px-4 py-4 text-sm text-white/60">
              <p className="font-semibold text-white/80">No World Cup matches on this date.</p>
              <p className="mt-1">Use the date controls above to find another matchday, or see the full {" "}
                <Link href="/schedule" className="font-semibold text-accent underline underline-offset-2 hover:text-white">match schedule</Link>.
              </p>
            </div>
          )}
        </>
      )}

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
